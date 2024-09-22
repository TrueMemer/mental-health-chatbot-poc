import logger from '../logger';
import AIResponder from './ai-responder';
import FlowManager, { Flow } from './flow-manager';
import redis from './redis';
import prisma from '@/prisma';

export type ContextValue = string | number | boolean | null | undefined;

export interface ConversationContext {
    [key: string]: ContextValue;
}

export interface SetContext {
    [key: string]: ContextValue;
}

interface UserConversationState {
    flow: Flow;
    currentStepId: string;
    context: ConversationContext;
}

class ConversationManager {
    private flowManager: FlowManager;
    private aiResponder: AIResponder;

    constructor(flowManager: FlowManager) {
        this.flowManager = flowManager;
        this.aiResponder = new AIResponder();
    }

    public async getUserState(userId: string): Promise<UserConversationState | null> {
        const data = await redis.get(`userState:${userId}`);
        return data ? JSON.parse(data) : null;
    }

    private async setUserState(userId: string, state: UserConversationState): Promise<void> {
        await redis.set(`userState:${userId}`, JSON.stringify(state));
    }

    private async deleteUserState(userId: string): Promise<void> {
        await redis.del(`userState:${userId}`);
    }

    public async isUserInFlow(userId: string): Promise<boolean> {
        const state = await this.getUserState(userId);
        return !!state;
    }

    private async updateContext(userId: string, updates: ConversationContext): Promise<void> {
        const state = await this.getUserState(userId);
        if (state) {
            state.context = { ...state.context, ...updates };
            await this.setUserState(userId, state);
        }
    }

    public async handleMessage(userId: string, message: string): Promise<string | undefined> {
        logger.info(`User ${userId} sent message: "${message}"`);

        let userState = await this.getUserState(userId);

        if (!userState) {

            const flow = this.flowManager.detectFlow(message);
            if (flow) {
                userState = { flow, currentStepId: 'start', context: {} };
                await this.setUserState(userId, userState);
                logger.info(`User ${userId} started flow: ${flow.id} with initial context: ${JSON.stringify(userState.context)}`);
                const response = await this.getNextFlowMessage(userId, userState, message);
                logger.info(`Bot response to user ${userId}: "${response}"`);


                await prisma.interaction.create({
                    data: {
                        userId: parseInt(userId) ?? 0,
                        flowId: flow.id,
                        stepId: userState.currentStepId,
                        message,
                        response,
                        context: userState.context,
                    },
                });

                return response;
            } else {

                logger.info(`No flow triggered for user ${userId}. Delegating to AI.`);
                return '';
            }
        } else {

            const response = await this.continueFlow(userId, userState, message);
            logger.info(`Bot response to user ${userId}: "${response}"`);


            await prisma.interaction.create({
                data: {
                    userId: parseInt(userId),
                    flowId: userState.flow.id,
                    stepId: userState.currentStepId,
                    message,
                    response,
                    context: userState.context,
                },
            });

            return response;
        }
    }

    private async continueFlow(
        userId: string,
        userState: UserConversationState,
        message: string
    ): Promise<string | undefined> {
        return await this.processUserResponse(userId, userState, message);
    }

    private async getNextFlowMessage(
        userId: string,
        userState: UserConversationState,
        message: string
    ): Promise<string | undefined> {
        const { flow, currentStepId } = userState;
        const step = flow.steps.find((s) => s.id === currentStepId);

        if (!step) {

            await this.deleteUserState(userId);
            return undefined;
        }

        let botMessage: string | undefined;

        switch (step.engine) {
            case 'basic':
                botMessage = step.bot;
                break;
            case 'nlp':

                botMessage = step.bot;
                break;
            case 'ai':
                if (step.ai_prompt) {
                    botMessage = await this.aiResponder.generateResponseWithPrompt(step.ai_prompt, message);
                }
                break;
        }

        if (botMessage && botMessage.trim() !== '') {

            if (step.set_context) {
                logger.info(`Updated context for user ${userId}: ${JSON.stringify(userState.context)}`);
                await this.updateContext(userId, step.set_context);
            }

            if (!step.user_response_required && !step.branches) {
                await this.deleteUserState(userId);
            }

            return botMessage;
        } else if (step.user_response_required) {

            return undefined;
        } else {

            if (step.next_step_id) {
                userState.currentStepId = step.next_step_id;
                await this.setUserState(userId, userState);
                return await this.getNextFlowMessage(userId, userState, message);
            } else {

                await this.deleteUserState(userId);
                return undefined;
            }
        }

    }

    private async processUserResponse(
        userId: string,
        userState: UserConversationState,
        message: string
    ): Promise<string | undefined> {
        const { flow, currentStepId, context } = userState;
        const step = flow.steps.find((s) => s.id === currentStepId);

        if (!step) {
            logger.warn(`Step ${currentStepId} not found in flow ${flow.id}`);
            await this.deleteUserState(userId);
            return '';
        }


        if (step.set_context) {
            logger.info(`Updated context for user ${userId}: ${JSON.stringify(userState.context)}`);
            await this.updateContext(userId, step.set_context);
        }

        let aiClassificationResult: string | null = null;


        if (step.ai_classification) {
            const { ai_prompt } = step.ai_classification;
            aiClassificationResult = await this.aiResponder.classifyUserResponse(ai_prompt, message);
            aiClassificationResult = aiClassificationResult.toLowerCase().trim();


            await this.updateContext(userId, { classification: aiClassificationResult });
        }

        if (step.branches) {
            for (const branch of step.branches) {
                const condition = branch.condition;
                let match = false;

                switch (condition.engine) {
                    case 'basic':
                        if (condition.expected_user_keywords) {
                            match = condition.expected_user_keywords.some((keyword) =>
                                message.toLowerCase().includes(keyword.toLowerCase())
                            );
                        }
                        break;
                    case 'ai':
                        if (condition.expected_classifications && aiClassificationResult) {
                            match = condition.expected_classifications.includes(aiClassificationResult);
                        }
                        break;

                }

                if (match) {

                    if (branch.set_context) {
                        logger.info(`Updated context for user ${userId}: ${JSON.stringify(userState.context)}`);
                        await this.updateContext(userId, branch.set_context);
                    }

                    userState.currentStepId = branch.next_step_id;
                    await this.setUserState(userId, userState);

                    const response = await this.getNextFlowMessage(userId, userState, message);
                    return response;
                } else if (condition.default) {
                    userState.currentStepId = branch.next_step_id;
                    await this.setUserState(userId, userState);

                    const response = await this.getNextFlowMessage(userId, userState, message);
                    return response;
                }
            }


            return '';
        } else if (step.next_step_id) {
            userState.currentStepId = step.next_step_id;
            await this.setUserState(userId, userState);

            const response = await this.getNextFlowMessage(userId, userState, message);
            return response;
        } else {

            await this.deleteUserState(userId);
            return '';
        }
    }

}

export default ConversationManager;
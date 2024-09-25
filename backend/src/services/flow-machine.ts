import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { CacheAdapter } from "@/interfaces/cache-adapter";
import { InMemoryCache } from "./cache-adapters/in-memory";
import OpenAI from "openai";

export enum SendMessageEngines {
    TEXT = 'text',
    AI = 'ai'
}

export enum ClassifierEngines {
    BASIC = 'basic',
    AI = 'ai'
}

export interface FlowStepAction {
    name: string | 'send-message' | 'classify' | 'listen';
    params: any;
}

export interface FlowStepActionSendMessageParams {
    engine?: SendMessageEngines;
    content?: string;
    prompt?: string;
}

export interface FlowStepActionClassifyParams {
    engine: 'basic' | 'ai'
    prompt?: string
    branches: {
        name: string
        utterances?: string[]
        jump: {
            step_id?: string
            action_id?: string
        }
        default?: boolean
    }[]
}

export interface FlowStep {
    id: string;

    actions: FlowStepAction[];
    next_step: string;
    next_step_action_id?: string;
}

export interface Flow {
    name: string;
    slug: string;

    classifier: ClassifierEngines;
    utterances?: string[];
    prompt?: string;

    steps: FlowStep[];
}

export interface FlowAdapter {
    name: string

    sendMessage(chatId: string, message: string): any
}

export interface UserState {
    chatId: string;
    currentStepId: string;
    context: any;
    adapterName: string;
    currentStepActionIndex: number;
    flow: Flow;
    waitingForInput: boolean;
    executedSteps: FlowStep[];
    outputMessages: string[];
}

export type InputIdentifier = [string, string];

export interface HandleInputResponse {
    executedSteps: FlowStep[];
    outputMessages: string[];
    waitingForInput: boolean;
    flowEnded: boolean;
}

export class FlowMachine {
    public flows: Flow[] = []
    public adapters: Map<string, FlowAdapter> = new Map()
    public stateAdapter: CacheAdapter = new InMemoryCache()
    private openai: OpenAI
    private systemPrompt: string = ""

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }

    private getClassificationData() {
        return this.flows.map((flow) => ({
            slug: flow.slug,
            classifier: flow.classifier,
            utterances: flow.utterances,
            prompt: flow.prompt
        }))
    }

    public setSystemPrompt(prompt: string) {
        this.systemPrompt = prompt
    }

    public registerAdapter(adapter: FlowAdapter) {
        this.adapters.set(adapter.name, adapter)
    }

    private async getUserState(chatId: string): Promise<UserState | null> {
        const cacheKey = `user-state:${chatId}`
        return await this.stateAdapter.get(cacheKey)
    }

    private async deleteUserState(chatId: string): Promise<void> {
        const cacheKey = `user-state:${chatId}`
        await this.stateAdapter.delete(cacheKey)
    }

    private async setUserState(chatId: string, state: UserState): Promise<void> {
        const cacheKey = `user-state:${chatId}`
        await this.stateAdapter.set(cacheKey, state)
    }

    private async createState(adapterName: string, chatId: string, message: string) {
        let flow: Flow | undefined = undefined
        let state: UserState | null = null
        const classificationData = this.getClassificationData();
        let classifiedFlow: string | undefined = undefined
        for (const flow of classificationData) {
            if (flow.classifier === ClassifierEngines.BASIC && flow.utterances?.length) {
                const match = flow.utterances.some((keyword) =>
                    message.toLowerCase().includes(keyword.toLowerCase())
                );

                if (match) {
                    classifiedFlow = flow.slug;
                }

                break;
            }
        }

        flow = this.flows.find((flow) => flow.slug === classifiedFlow);
        if (!flow) {
            throw new Error(`Requested flow ${classifiedFlow} not found!`);
        }

        const firstFlowStep = flow.steps[0]

        if (!firstFlowStep) {
            throw new Error(`Flow ${flow.name} has no steps!`);
        }

        const firstFlowAction = firstFlowStep.actions[0]

        if (!firstFlowStep) {
            throw new Error(`Flow ${firstFlowStep} has no actions!`);
        }

        state = {
            chatId,
            flow,
            adapterName,
            context: {},
            currentStepActionIndex: 0,
            currentStepId: firstFlowStep.id,
            waitingForInput: false,
            outputMessages: [],
            executedSteps: []
        }

        this.setUserState(chatId, state)
        console.log(`FlowMachine: Flow ${flow.name} started for user ${chatId}`)
        return state
    }

    public loadFlows() {
        const flowsDir = path.join(process.cwd(), 'flows');
        const flowFiles = fs.readdirSync(flowsDir);

        flowFiles.forEach((file) => {
            if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                const filePath = path.join(flowsDir, file);
                const fileContents = fs.readFileSync(filePath, 'utf8');
                const flow = yaml.load(fileContents) as Flow;
                this.flows.push(flow);
            }
        });
    }

    public async handleInput(adapterName: string, chatId: string, message: string): Promise<HandleInputResponse> {
        let state = await this.getUserState(chatId)
        let flow: Flow | undefined = undefined
        if (!state) {
            state = await this.createState(adapterName, chatId, message)
        }
        flow = state.flow

        let nextStepIdOverride: string | null = null
        let nextActionIndexOverride: number | null = null

        const step = flow?.steps.find((step) => step.id === state.currentStepId)

        if (!step) {
            throw new Error('There is no next step')
        }

        const action = step?.actions[state.currentStepActionIndex]

        let waitForInput = false

        if (action) {
            const adapter = this.adapters.get(adapterName)
            if (!adapter) throw new Error('no adapter')
            switch (action.name) {
                case 'send-message':
                    {
                        const params = action.params as FlowStepActionSendMessageParams
                        if (params.engine === SendMessageEngines.TEXT) {
                            if (!params.content) break;
                            await adapter.sendMessage(chatId, params.content)
                            state.outputMessages.push(params.content);
                            this.setUserState(chatId, state)
                        } else if (params.engine === SendMessageEngines.AI) {
                            if (!params.prompt) {
                                params.prompt = ""
                            }
                            const completion = await this.openai.chat.completions.create({
                                model: 'gpt-3.5-turbo',
                                messages: [
                                  { role: 'system', content: this.systemPrompt },
                                  { role: 'system', content: params.prompt },
                                  { role: 'user', content: message },
                                ],
                              });

                            const response = completion.choices[0].message?.content || '';
                            await adapter.sendMessage(chatId, response)
                            state.outputMessages.push(response);
                            this.setUserState(chatId, state)
                        }
                    } break;
                case 'listen':
                    {
                        waitForInput = true
                        state.waitingForInput = true
                        this.setUserState(state.chatId, state)
                    } break;
                case 'classify':
                    {
                        const params = action.params as FlowStepActionClassifyParams
                        let match = false
                        let matchedBranchId: string | null = null
                        let defaultBranchId: string | null = null

                        for (const branch of params.branches) {
                            if (branch.default) {
                                defaultBranchId = branch.name
                                continue
                            }
                        }

                        if (params.engine === 'basic') {
                            for (const branch of params.branches) {
                                const { utterances } = branch
                                if (branch.default) {
                                    defaultBranchId = branch.name
                                    continue
                                }
                                if (!utterances?.length) continue
                                match = utterances.some((keyword) =>
                                    message.toLowerCase().includes(keyword.toLowerCase())
                                );

                                if (match) {
                                    matchedBranchId = branch.name
                                    break;
                                }
                            }
                        } else if (params.engine === 'ai') {
                            const prompt = `
You are an assistant designed to classify user messages into predefined intents.

### Intents and Utterances:
${params.branches
                                    .filter((branch) => !branch.default)
                                    .map(
                                        (branch, index) =>
                                            `${index + 1}. **${branch.name}**\n${branch.utterances!
                                                .map((u) => `   - ${u}`)
                                                .join("\n")}`
                                    )
                                    .join("\n\n")}

### User Message:
"${message}"

### Task:
Identify the most appropriate intent from the list above that matches the user message.

### Response Format:
{ "matchedBranch": "<intent name here>", "confidenceScore": <percentage without % signte> }

If you're unsure, set "matchedBranch" to null.
`;
                            const completion = await this.openai.completions.create({
                                model: 'gpt-3.5-turbo-instruct',
                                prompt: params.prompt ? params.prompt : prompt,
                                max_tokens: 20,
                                temperature: 0,
                            });

                            const result = JSON.parse(completion.choices[0].text?.trim() ?? null);
                            matchedBranchId = result.matchedBranch
                            if (matchedBranchId) {
                                match = true
                            }
                        }

                        if (match) {
                            const matchedBranch = params.branches.find((branch) => branch.name === matchedBranchId)!

                            const { jump } = matchedBranch
                            if (jump.action_id && jump.step_id) {
                                const overrideAction = step.actions.findIndex((action) => action.name === jump.action_id)
                                nextActionIndexOverride = overrideAction
                                nextStepIdOverride = jump.step_id
                            } else if (jump.action_id) {
                                const overrideAction = step.actions.findIndex((action) => action.name === jump.action_id)
                                nextActionIndexOverride = overrideAction
                                break;
                            } else if (jump.step_id) {
                                nextStepIdOverride = jump.step_id
                            }
                        } else if (defaultBranchId) {
                            const defaultBranch = params.branches.find((branch) => branch.name === defaultBranchId)!

                            const { jump } = defaultBranch
                            if (jump.action_id && jump.step_id) {
                                const overrideAction = step.actions.findIndex((action) => action.name === jump.action_id)
                                nextActionIndexOverride = overrideAction
                                nextStepIdOverride = jump.step_id
                            } else if (jump.action_id) {
                                const overrideAction = step.actions.findIndex((action) => action.name === jump.action_id)
                                nextActionIndexOverride = overrideAction
                                break;
                            } else if (jump.step_id) {
                                nextStepIdOverride = jump.step_id
                            }
                        } else {
                            throw new Error('Branch has no fallback to go to!')
                        }
                    } break;
            }
        }

        let nextAction: any = null

        if (nextStepIdOverride && nextActionIndexOverride) {
            nextAction = nextActionIndexOverride
        } else if (nextStepIdOverride && !nextActionIndexOverride) {
            nextAction = null
        } else if (nextActionIndexOverride && !nextStepIdOverride) {
            nextAction = nextActionIndexOverride
        } else if (state.currentStepActionIndex + 1 >= step?.actions.length) {
            nextAction = null
        } else if (step.next_step_action_id && step.next_step) {
            const nextStep = flow.steps.find((s) => s.id === step.next_step)!
            const overrideStepActionIndex = nextStep.actions.findIndex((action) => action.name === step.next_step_action_id)
            nextAction = overrideStepActionIndex
        } else {
            nextAction = step?.actions[state.currentStepActionIndex + 1]
        }

        const executedSteps = state.executedSteps
        const outputMessages = state.outputMessages

        if (!nextAction) {
            state.currentStepActionIndex = 0
            const nextStep = nextStepIdOverride ?? step.next_step ?? null

            if (!nextStep) {
                this.deleteUserState(state.chatId)
                console.log(`FlowMachine: Flow ${flow.name} ended for user ${chatId}`)
                return {
                    executedSteps,
                    outputMessages,
                    waitingForInput: false,
                    flowEnded: true
                }
            }

            state.currentStepId = nextStep
            this.setUserState(state.chatId, state)
            if (waitForInput) {
                state.outputMessages = []
                this.setUserState(state.chatId, state)
                return {
                    executedSteps,
                    outputMessages,
                    waitingForInput: waitForInput,
                    flowEnded: false
                }
            } else {
                return await this.handleInput(adapterName, chatId, message)
            }
        } else {
            state.currentStepActionIndex += 1
            if (nextStepIdOverride) {
                state.currentStepId = nextStepIdOverride
            }

            if (waitForInput) {
                state.outputMessages = []
                this.setUserState(state.chatId, state)
                return {
                    executedSteps,
                    outputMessages,
                    waitingForInput: waitForInput,
                    flowEnded: false
                }
            } else {
                return await this.handleInput(adapterName, chatId, message)
            }
        }
    }
}
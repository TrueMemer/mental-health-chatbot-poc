import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import { CacheAdapter } from "#/interfaces/cache-adapter";
import { InMemoryCache } from "./cache-adapters/in-memory";
import OpenAI from "openai";
import { ClassifierEngines } from "#/enums/classifier-engines";
import { Flow, FlowAdapter, UserState, HandleInputResponse, ClassificationData } from "#/interfaces/flow";
import sendMessageHandler from "./actions/send-message";
import listenHandler from "./actions/listen";
import classifyHandler from "./actions/classify";
import setContextHandler from "./actions/set-context";

export class FlowMachine {
    public flows: Flow[] = []
    public adapters: Map<string, FlowAdapter> = new Map()
    public stateAdapter: CacheAdapter = new InMemoryCache()
    protected openai: OpenAI
    protected systemPrompt: string = ""
    protected actionHandlers: Map<string, Function> = new Map()

    constructor() {
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        this.actionHandlers.set('send-message', sendMessageHandler.bind(this))
        this.actionHandlers.set('listen', listenHandler.bind(this))
        this.actionHandlers.set('classify', classifyHandler.bind(this))
        this.actionHandlers.set('set-context', setContextHandler.bind(this))
    }

    private getClassificationData(): ClassificationData[] {
        return this.flows.map((flow) => ({
            slug: flow.slug,
            classifier: flow.classifier,
            utterances: flow.utterances,
            prompt: flow.prompt
        } as ClassificationData))
    }

    public setSystemPrompt(prompt: string) {
        this.systemPrompt = prompt
    }

    public registerAdapter(adapter: FlowAdapter) {
        this.adapters.set(adapter.name, adapter)
    }

    protected async getUserState(chatId: string): Promise<UserState | null> {
        const cacheKey = `user-state:${chatId}`
        return await this.stateAdapter.get(cacheKey)
    }

    protected async deleteUserState(chatId: string): Promise<void> {
        const cacheKey = `user-state:${chatId}`
        await this.stateAdapter.delete(cacheKey)
    }

    protected async setUserState(chatId: string, state: UserState): Promise<void> {
        const cacheKey = `user-state:${chatId}`
        await this.stateAdapter.set(cacheKey, state)
    }

    protected async classifyFlow(classificationData: ClassificationData[], message: string) {
        let classifiedFlow: string | undefined = undefined
        for (const flow of classificationData) {
            if (flow.classifier === ClassifierEngines.BASIC && flow.utterances?.length) {
                const match = flow.utterances.some((keyword: string) =>
                    message.toLowerCase().includes(keyword.toLowerCase())
                );

                if (match) {
                    classifiedFlow = flow.slug;
                }

                break;
            }
        }

        const flow = this.flows.find((flow) => flow.slug === classifiedFlow);
        if (!flow) {
            throw new Error(`Requested flow ${classifiedFlow} not found!`);
        }

        return flow
    }

    public initiateFlow(adapterName: string, chatId: string, message: string, overrideFlow: string, startImmediately: string | boolean) {
        return this.createState(adapterName, chatId, message, overrideFlow, startImmediately)
    }

    private async createState(adapterName: string, chatId: string, message: string, overrideFlow?: string, startImmediately?: string | boolean) {
        let flow: Flow | undefined = undefined
        let state: UserState | null = null

        if (!overrideFlow) {
            const classificationData = this.getClassificationData();
            flow = await this.classifyFlow(classificationData, message);
        } else {
            flow = this.flows.find((flow) => flow.slug === overrideFlow);
            if (!flow) {
                throw new Error('Override Flow failed, flow doesn\'t exist')
            }
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

        if (startImmediately) {
            if (typeof startImmediately === 'string') {
                await this.handleInput(adapterName, chatId, startImmediately)
                return await this.getUserState(chatId)
            } else {
                await this.handleInput(adapterName, chatId, "")
                return await this.getUserState(chatId)
            }
        }

        return state
    }

    public loadFlows(flowsDir?: string) {
        const directory = flowsDir || path.join(process.cwd(), 'flows');
        const flowFiles = fs.readdirSync(directory);

        flowFiles.forEach((file) => {
            if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                const filePath = path.join(directory, file);
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

        if (!state) {
            throw new Error('Failed to create state')
        }
        flow = state.flow

        state.waitingForInput = false
        state.lastInput = message
        await this.setUserState(chatId, state)

        let nextStepIdOverride: string | null = null
        let nextActionIndexOverride: number | null = null

        const step = flow?.steps.find((step) => step.id === state!.currentStepId)

        if (!step) {
            throw new Error('There is no next step')
        }

        const action = step?.actions?.length ? step?.actions[state.currentStepActionIndex] : null

        if (action) {
            const adapter = this.adapters.get(adapterName)
            if (!adapter) throw new Error('no adapter')

            switch (action.name) {
                case 'no-op':
                    {
                    } break;
                case 'send-message':
                    {
                        const sendMessageHandler = this.actionHandlers.get('send-message')!
                        await sendMessageHandler(state, action.params, adapter, chatId, message)
                    } break;
                case 'listen':
                    {
                        const listenHandler = this.actionHandlers.get('listen')!
                        await listenHandler(state)
                    } break;
                case 'classify':
                    {
                        const classifyHandler = this.actionHandlers.get('classify')!
                        const overrides = await classifyHandler(action.params, step, message)
                        nextStepIdOverride = overrides.nextStepIdOverride
                        nextActionIndexOverride = overrides.nextActionIndexOverrides
                        console.log(overrides)
                    } break;
                case 'set-context':
                    {
                        const setContextHandler = this.actionHandlers.get('set-context')!
                        await setContextHandler(state, action.params, chatId)
                    } break;
            }
        }

        state = (await this.getUserState(chatId))!

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
            if (state.waitingForInput) {
                state.outputMessages = []
                this.setUserState(state.chatId, state)
                return {
                    executedSteps,
                    outputMessages,
                    waitingForInput: state.waitingForInput,
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

            if (state.waitingForInput) {
                state.outputMessages = []
                this.setUserState(state.chatId, state)
                return {
                    executedSteps,
                    outputMessages,
                    waitingForInput: state.waitingForInput,
                    flowEnded: false
                }
            } else {
                return await this.handleInput(adapterName, chatId, message)
            }
        }
    }
}
import { ClassifierEngines } from "#/enums/classifier-engines";
import { SendMessageEngines } from "#/enums/send-message-engines";

export interface FlowStepAction {
    name: string | 'send-message' | 'classify' | 'listen';
    params: any;
}

export interface FlowStepActionSendMessageParams {
    engine?: SendMessageEngines;
    content?: string;
    prompt?: string;
}

export interface FlowStepActionSetContextParams {
    key: string;
    value: string;
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
    context: Record<string, any>;
    adapterName: string;
    currentStepActionIndex: number;
    flow: Flow;
    waitingForInput: boolean;
    executedSteps: FlowStep[];
    outputMessages: string[];
    lastInput?: string;
}

export type InputIdentifier = [string, string];

export interface HandleInputResponse {
    executedSteps: FlowStep[];
    outputMessages: string[];
    waitingForInput: boolean;
    flowEnded: boolean;
}

export interface ClassificationData {
    slug: string
    classifier: ClassifierEngines,
    utterances: string[],
    prompt?: string
}
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import natural from 'natural';
import { SetContext } from './conversation-manager';

export enum EngineType {
    BASIC = 'basic',
    NLP = 'nlp',
    AI = 'ai',
}

export interface BranchCondition {
    engine: EngineType;
    expected_user_keywords?: string[];
    expected_classifications?: string[];
    default?: boolean;
}

export interface Branch {
    condition: BranchCondition;
    next_step_id: string;
    set_context?: SetContext;
}

export interface FlowStep {
    id: string;
    engine: EngineType;
    bot?: string;
    ai_prompt?: string;
    user_response_required?: boolean;
    ai_classification?: {
        engine: EngineType.AI;
        ai_prompt: string;
    };
    branches?: Branch[];
    next_step_id?: string;
    set_context?: SetContext;
}

export interface Flow {
    id: string;
    trigger_keywords: string[];
    steps: FlowStep[];
}

class FlowManager {
    private flows: Flow[] = [];

    constructor() {
        this.loadFlows();
    }

    public detectFlow(message: string): Flow | undefined {
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(message.toLowerCase());

        for (const flow of this.flows) {
            for (const keyword of flow.trigger_keywords) {
                if (tokens.includes(keyword.toLowerCase())) {
                    return flow;
                }
            }
        }

        return undefined;
    }

    private loadFlows() {
        const flowsDir = path.join(process.cwd(), 'flows');
        const flowFiles = fs.readdirSync(flowsDir);

        flowFiles.forEach((file) => {
            if (file.endsWith('.yaml') || file.endsWith('.yml')) {
                const filePath = path.join(flowsDir, file);
                const fileContents = fs.readFileSync(filePath, 'utf8');
                const flow = yaml.load(fileContents) as Flow;
                flow.steps.forEach((step) => {
                    if (!step.id) {
                        console.error(`Step missing 'id' in flow '${flow.id}':`, step);
                        throw new Error(`Step missing 'id' in flow '${flow.id}'`);
                    }
                })
                this.flows.push(flow);
            }
        });
    }

    public getFlows(): Flow[] {
        return this.flows;
    }

    public findFlowByKeyword(keyword: string): Flow | undefined {
        return this.flows.find((flow) =>
            flow.trigger_keywords.includes(keyword.toLowerCase())
        );
    }
}

export default FlowManager;

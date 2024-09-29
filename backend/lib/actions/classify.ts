import { FlowMachine } from "#/flow-machine";
import { FlowStep, FlowStepActionClassifyParams } from "#/interfaces/flow";

export default async function classifyHandler(this: FlowMachine,
    params: FlowStepActionClassifyParams,
    step: FlowStep,
    message: string) {
    let match = false
    let matchedBranchId: string | null = null
    let defaultBranchId: string | null = null

    let nextStepIdOverride: string | null = null
    let nextActionIndexOverride: number | null = null

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
        } else if (jump.step_id) {
            nextStepIdOverride = jump.step_id
        }
    } else {
        throw new Error('Branch has no fallback to go to!')
    }

    return { nextStepIdOverride, nextActionIndexOverride }
}
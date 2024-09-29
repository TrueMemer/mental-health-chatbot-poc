import { SendMessageEngines } from "#/enums/send-message-engines";
import { FlowMachine } from "#/flow-machine";
import { FlowAdapter, FlowStepActionSendMessageParams, UserState } from "#/interfaces/flow";
import Handlebars from 'handlebars'

export default async function sendMessageHandler(this: FlowMachine,
    state: UserState,
    params: FlowStepActionSendMessageParams,
    adapter: FlowAdapter,
    chatId: string,
    message: string) {
    if (params.engine === SendMessageEngines.TEXT) {
        if (!params.content) return;
        const templateContent = Handlebars.compile(params.content)
        const content = templateContent(state);
        await adapter.sendMessage(chatId, content)
        state.outputMessages.push(content);
        this.setUserState(chatId, state)
    } else if (params.engine === SendMessageEngines.AI) {
        if (!params.prompt) {
            params.prompt = ""
        }
        const templatePrompt = Handlebars.compile(params.prompt)
        const prompt = templatePrompt(state);
        const completion = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: this.systemPrompt },
              { role: 'system', content: prompt },
              { role: 'user', content: message },
            ],
          });

        const response = completion.choices[0].message?.content || '';
        await adapter.sendMessage(chatId, response)
        state.outputMessages.push(response);
        this.setUserState(chatId, state)
    }
}
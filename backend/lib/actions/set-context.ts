import { FlowMachine } from "#/flow-machine";
import { FlowStepActionSetContextParams, UserState } from "#/interfaces/flow";
import Handlebars from "handlebars";

export default async function setContextHandler(this: FlowMachine,
    state: UserState,
    params: FlowStepActionSetContextParams,
    chatId: string) {

    const valueTemplate = Handlebars.compile(params.value)
    const value = valueTemplate(state)

    state.context[params.key] = value
    await this.setUserState(chatId, state)
    console.log(await this.getUserState(chatId))
}
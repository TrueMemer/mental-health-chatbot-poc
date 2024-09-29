import { FlowMachine } from "#/flow-machine";
import { UserState } from "#/interfaces/flow";

export default async function listenHandler(this: FlowMachine, state: UserState) {
    state.waitingForInput = true
    this.setUserState(state.chatId, state)
}
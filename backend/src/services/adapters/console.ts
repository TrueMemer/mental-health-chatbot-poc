import { FlowAdapter } from "../flow-machine";

export class ConsoleAdapter implements FlowAdapter {
    name = "console";
    constructor() { }

    public async sendMessage(chatId: string, message: string) {
        console.log(`ConsoleAdapter [${chatId}]: ${message}`);
    }
}
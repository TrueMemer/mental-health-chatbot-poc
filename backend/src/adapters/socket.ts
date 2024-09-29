import { FlowAdapter } from "#/interfaces/flow";
import { Server } from "socket.io";
export class SocketAdapter implements FlowAdapter {
    name = "socket";
    constructor(private readonly io: Server) { }

    public async sendMessage(chatId: string, message: string) {
        console.log(`SocketAdapter: [${chatId}]: ${message}`);
    }
}
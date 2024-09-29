import { FlowAdapter } from "#/interfaces/flow";
import TelegramBot from "node-telegram-bot-api";
import { flowMachine } from "..";
export class TelegramAdapter implements FlowAdapter {
    public bot: TelegramBot
    name = "telegram";

    constructor(private readonly apiToken: string, private readonly webhookUrl: string) {
        this.bot = new TelegramBot(this.apiToken)
        this.bot.setWebHook(this.webhookUrl)

        this.bot.on('message', async (message) => {
            await flowMachine.handleInput("telegram", String(message.chat.id), message.text ?? "")
        })
    }

    public async sendMessage(chatId: string, message: string) {
        await this.bot.sendMessage(chatId, message)
    }
}

export const telegramAdapter = new TelegramAdapter(process.env.TELEGRAM_API_TOKEN!, process.env.TELEGRAM_WEBHOOK_URL!)
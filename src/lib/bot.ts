import TelegramBotApi from 'node-telegram-bot-api';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export class TelegramBot {
    public bot: TelegramBotApi;

    constructor() {
        if (!TELEGRAM_TOKEN) {
            console.error('Telegram bot token undefined');
            process.exit(1);
        }

        this.bot = new TelegramBotApi(TELEGRAM_TOKEN, {
            polling: true,
        });

        this.setRoutes();
    }

    setRoutes() {
        this.bot.on('message', (msg) => {
            const chatId = msg.chat.id;

            // send a message to the chat acknowledging receipt of their message
            this.bot.sendMessage(chatId, 'Received your message');
        });
    }
}

export default TelegramBot;

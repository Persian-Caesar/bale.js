import { BaleClient } from '../client/BaleClient';
import { Message } from '../structures/Message';
import { InlineKeyboardMarkup } from '../types/api';

export class MessageManager {
    constructor(private client: BaleClient) { }

    async send(
        chatId: number | string,
        text: string,
        options?: { reply_markup?: InlineKeyboardMarkup; reply_to_message_id?: number }
    ): Promise<Message> {
        const data = await this.client.rest.sendMessage({
            chat_id: chatId,
            text,
            ...options,
        });
        return new Message(this.client, data);
    }

    async edit(chatId: number, messageId: number, text: string) {
        const data = await this.client.rest.request('editMessageText', {
            chat_id: chatId,
            message_id: messageId,
            text,
        });
        return new Message(this.client, data);
    }

    async delete(chatId: number, messageId: number) {
        await this.client.rest.request('deleteMessage', {
            chat_id: chatId,
            message_id: messageId,
        });
    }
}
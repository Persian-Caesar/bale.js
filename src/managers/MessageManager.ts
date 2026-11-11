import type { InlineKeyboardMarkup } from '../types/keyboard';
import type { BaleClient } from '../client/BaleClient';
import { BaseManager } from './BaseManager';
import { APIMessage } from '../types';
import { Message } from '../structures/Message';

export interface SendMessageOptions {
    reply_markup?: InlineKeyboardMarkup;
    reply_to_message_id?: number;
}

/**
 * مدیر عملیات مربوط به پیام‌ها: ارسال، ویرایش، حذف.
 */
export class MessageManager extends BaseManager {
    constructor(client: BaleClient) {
        super(client);
    }

    /**
     * ارسال یک پیام متنی به یک چت مشخص.
     */
    async send(
        chatId: number | string,
        text: string,
        options?: SendMessageOptions,
    ): Promise<Message> {
        const data = await this.client.rest.sendMessage({
            chat_id: chatId,
            text,
            ...options,
        });
        return new Message(this.client, data);
    }

    /**
     * ویرایش متن یک پیام ارسالی.
     */
    async edit(chatId: number, messageId: number, text: string): Promise<Message> {
        const data = await this.client.rest.request<APIMessage>('editMessageText', {
            body: { chat_id: chatId, message_id: messageId, text },
        });
        return new Message(this.client, data);
    }

    /**
     * حذف یک پیام.
     */
    async delete(chatId: number, messageId: number): Promise<void> {
        await this.client.rest.request<boolean>('deleteMessage', {
            body: { chat_id: chatId, message_id: messageId },
        });
    }
}
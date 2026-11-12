// src/managers/ChatManager.ts
import { BaseManager } from './BaseManager.js';
import { Chat } from '../structures/Chat.js';
import type { BaleClient } from '../client/BaleClient.js';
import type { APIChat } from '../types/chat.js';

/**
 * مدیر عملیات مربوط به چت‌ها: دریافت اطلاعات چت.
 */
export class ChatManager extends BaseManager {
    constructor(client: BaleClient) {
        super(client);
    }

    /**
     * دریافت اطلاعات یک چت با شناسهٔ آن.
     */
    async fetch(chatId: number | string): Promise<Chat> {
        const data = await this.client.rest.request<APIChat>('getChat', {
            body: { chat_id: chatId },
        });
        return new Chat(this.client, data);
    }
}
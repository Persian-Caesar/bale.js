// src/structures/Chat.ts
import { Base } from './Base.js';
import type { BaleClient } from '../client/BaleClient.js';
import type { APIChat, ChatType } from '../types/chat.js';

/**
 * نمایش یک چت (خصوصی، گروه یا کانال) در بله.
 */
export class Chat extends Base {
    public readonly id: number;
    public readonly type: ChatType;
    public readonly title?: string;
    public readonly username?: string;
    public readonly firstName?: string;
    public readonly lastName?: string;

    constructor(client: BaleClient, data: APIChat) {
        super(client);
        this.id = data.id;
        this.type = data.type;
        this.title = data.title;
        this.username = data.username;
        this.firstName = data.first_name;
        this.lastName = data.last_name;
    }

    /** آیا این چت از نوع خصوصی است؟ */
    get isPrivate(): boolean {
        return this.type === 'private';
    }

    /** آیا این چت از نوع گروه است؟ */
    get isGroup(): boolean {
        return this.type === 'group';
    }

    /** آیا این چت از نوع کانال است؟ */
    get isChannel(): boolean {
        return this.type === 'channel';
    }

    /**
     * ارسال یک پیام متنی به این چت.
     */
    async send(text: string, options?: { reply_markup?: any; reply_to_message_id?: number }) {
        return this.client.messages.send(this.id, text, options);
    }
}
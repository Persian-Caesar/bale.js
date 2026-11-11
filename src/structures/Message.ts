import type { InlineKeyboardMarkup } from '../types/keyboard';
import type { BaleClient } from '../client/BaleClient';
import type { APIMessage } from '../types/message';
import { Base } from './Base';
import { Chat } from './Chat';
import { User } from './User';

/**
 * نمایش یک پیام در بله با متدهای کمکی برای پاسخ، ویرایش و حذف.
 */
export class Message extends Base {
    public readonly id: number;
    public readonly chat: Chat;
    public readonly from?: User;
    public readonly text?: string;
    public readonly caption?: string;
    public readonly date: Date;
    public readonly replyMarkup?: InlineKeyboardMarkup;
    public readonly replyToMessage?: Message;

    constructor(client: BaleClient, data: APIMessage) {
        super(client);
        this.id = data.message_id;
        this.chat = new Chat(client, data.chat);
        this.from = data.from ? new User(client, data.from) : undefined;
        this.text = data.text;
        this.caption = data.caption;
        this.date = new Date(data.date * 1000);
        this.replyMarkup = data.reply_markup;
        this.replyToMessage = data.reply_to_message
            ? new Message(client, data.reply_to_message)
            : undefined;
    }

    /**
     * پاسخ به این پیام (به صورت Reply).
     */
    async reply(
        text: string,
        options?: { reply_markup?: InlineKeyboardMarkup },
    ): Promise<Message> {
        const data = await this.client.messages.send(this.chat.id, text, {
            reply_to_message_id: this.id,
            reply_markup: options?.reply_markup,
        });
        
        return new Message(this.client, data);
    }

    /**
     * ویرایش متن این پیام (فقط پیام‌های ارسالی خود ربات).
     */
    async edit(text: string): Promise<Message> {
        const data = await this.client.messages.edit(this.chat.id, this.id, text);

        return new Message(this.client, data);
    }

    /**
     * حذف این پیام.
     */
    async delete(): Promise<void> {
        await this.client.messages.delete(this.chat.id, this.id);
    }

    /** آیا این پیام دارای متن است؟ */
    get hasText(): boolean {
        return typeof this.text === 'string' && this.text.length > 0;
    }

    /** آیا این پیام دارای کپشن (برای مدیا) است؟ */
    get hasCaption(): boolean {
        return typeof this.caption === 'string' && this.caption.length > 0;
    }
}
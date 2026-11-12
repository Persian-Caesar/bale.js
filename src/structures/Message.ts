import type { InlineKeyboardMarkup } from '../types/keyboard';
import type { BaleClient } from '../client/BaleClient';
import type { APIMessage } from '../types/message';
import { Base } from './Base';
import { Chat } from './Chat';
import { User } from './User';

/** ورودی سازندهٔ Message می‌تواند دادهٔ خام API یا نمونهٔ Message باشد */
export type MessageInput = APIMessage | Message;

/** Type guard برای تشخیص دادهٔ خام */
function isAPIMessage(data: MessageInput): data is APIMessage {
    return (data as APIMessage).message_id !== undefined;
}

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

    /** دادهٔ خام API برای استفاده‌های داخلی */
    private readonly _raw: APIMessage;

    constructor(client: BaleClient, data: MessageInput) {
        super(client);

        // اگر ورودی از قبل Message است، فیلدها را کپی کن
        if (data instanceof Message) {
            this._raw = data._raw;
            this.id = data.id;
            this.chat = data.chat;
            this.from = data.from;
            this.text = data.text;
            this.caption = data.caption;
            this.date = data.date;
            this.replyMarkup = data.replyMarkup;
            this.replyToMessage = data.replyToMessage;
            return;
        }

        // ورودی خام APIMessage
        this._raw = data;
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

    /** دسترسی به دادهٔ خام (در صورت نیاز) */
    get raw(): APIMessage {
        return this._raw;
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
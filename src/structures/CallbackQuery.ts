import type { APICallbackQuery } from '../types/update';
import type { BaleClient } from '../client/BaleClient';
import { Message } from './Message';
import { Base } from './Base';
import { User } from './User';

export class CallbackQuery extends Base {
    public readonly id: string;
    public readonly from: User;
    public readonly message?: Message;
    public readonly data?: string;
    public readonly inlineMessageId?: string;

    constructor(client: BaleClient, data: APICallbackQuery) {
        super(client);
        this.id = data.id;
        this.from = new User(client, data.from);
        this.message = data.message ? new Message(client, data.message) : undefined;
        this.data = data.data;
        this.inlineMessageId = data.inline_message_id;
    }

    /**
     * پاسخ به CallbackQuery (برای حذف حالت لودینگ دکمه).
     * @param text متن اعلان (اختیاری)
     * @param showAlert اگر true باشد، به‌صورت هشدار نمایش داده می‌شود
     */
    async answer(text?: string, showAlert = false): Promise<boolean> {
        return this.client.rest.request<boolean>('answerCallbackQuery', {
            body: {
                callback_query_id: this.id,
                text,
                show_alert: showAlert,
            },
        });
    }

    /**
     * ویرایش پیامِ متصل به این CallbackQuery.
     */
    async editMessage(text: string): Promise<Message> {
        if (!this.message) {
            throw new Error('این CallbackQuery پیام متصلی ندارد.');
        }
        return this.message.edit(text);
    }
}
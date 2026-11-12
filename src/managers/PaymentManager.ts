import type { InvoicePayload } from '../builders/InvoiceBuilder.js';
import type { BaleClient } from '../client/BaleClient.js';
import type { APIMessage } from '../types/message.js';
import { BaseManager } from './BaseManager.js';
import { Message } from '../structures/Message.js';

export class PaymentManager extends BaseManager {
    constructor(client: BaleClient) {
        super(client);
    }

    /** ارسال فاکتور به کاربر */
    async sendInvoice(
        chatId: number | string,
        invoice: InvoicePayload,
        options?: { reply_markup?: any; reply_to_message_id?: number },
    ): Promise<Message> {
        const data = await this.client.rest.request<APIMessage>('sendInvoice', {
            body: {
                chat_id: chatId,
                ...invoice,
                ...options,
            },
        });
        return new Message(this.client, data);
    }

    /** پاسخ به PreCheckoutQuery (تأیید یا رد پرداخت) */
    async answerPreCheckout(
        preCheckoutQueryId: string,
        ok: boolean,
        errorMessage?: string,
    ): Promise<boolean> {
        return this.client.rest.request<boolean>('answerPreCheckoutQuery', {
            body: {
                pre_checkout_query_id: preCheckoutQueryId,
                ok,
                error_message: errorMessage,
            },
        });
    }
}
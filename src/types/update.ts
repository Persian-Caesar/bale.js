// src/types/update.ts
import type { Message } from './message.js';
import type { User } from './user.js';

export interface Update {
    update_id: number;
    message?: Message;
    edited_message?: Message;
    callback_query?: CallbackQuery;
    pre_checkout_query?: PreCheckoutQuery;
}

export interface CallbackQuery {
    id: string;
    from: User;
    message?: Message;
    inline_message_id?: string;
    data?: string;
}

export interface PreCheckoutQuery {
    id: string;
    from: User;
    currency: string;
    total_amount: number;
    invoice_payload: string;
    shipping_option_id?: string;
    order_info?: OrderInfo;
}

export interface OrderInfo {
    name?: string;
    phone_number?: string;
    email?: string;
}
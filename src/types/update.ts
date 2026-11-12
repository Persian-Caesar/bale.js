import type { APIMessage } from './message.js';
import type { APIUser } from './user.js';

export interface Update {
    update_id: number;
    message?: APIMessage;
    edited_message?: APIMessage;
    callback_query?: APICallbackQuery;
    pre_checkout_query?: PreCheckoutQuery;
}

export interface APICallbackQuery {
    id: string;
    from: APIUser;
    message?: APIMessage;
    inline_message_id?: string;
    data?: string;
}

export interface PreCheckoutQuery {
    id: string;
    from: APIUser;
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
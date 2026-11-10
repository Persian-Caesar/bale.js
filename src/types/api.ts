// src/types/api.ts
export interface APIResponse<T> {
    ok: boolean;
    result?: T;
    description?: string;
    error_code?: number;
    parameters?: ResponseParameters;
}

export interface ResponseParameters {
    migrate_to_chat_id?: number;
    retry_after?: number;
}

export interface User {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
}

export interface Chat {
    id: number;
    type: 'private' | 'group' | 'channel';
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
}

export interface Message {
    message_id: number;
    from?: User;
    chat: Chat;
    date: number;
    text?: string;
    reply_markup?: InlineKeyboardMarkup;
    // ... سایر فیلدها بر اساس مستندات
}

export interface Update {
    update_id: number;
    message?: Message;
    edited_message?: Message;
    callback_query?: CallbackQuery;
}

export interface CallbackQuery {
    id: string;
    from: User;
    message?: Message;
    data?: string;
}

export interface InlineKeyboardButton {
    text: string;
    url?: string;
    callback_data?: string;
    color?: 'primary' | 'success' | 'danger';
}

export interface InlineKeyboardMarkup {
    inline_keyboard: InlineKeyboardButton[][];
}
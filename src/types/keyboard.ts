// src/types/keyboard.ts

export type ButtonColor = 'primary' | 'success' | 'danger';

export interface InlineKeyboardButton {
    text: string;
    url?: string;
    callback_data?: string;
    color?: ButtonColor;
}

export interface InlineKeyboardMarkup {
    inline_keyboard: InlineKeyboardButton[][];
}

/** کیبورد معمولی (Reply Keyboard) — در صورت نیاز در فازهای بعدی گسترش می‌یابد */
export interface ReplyKeyboardMarkup {
    keyboard: string[][];
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    selective?: boolean;
}
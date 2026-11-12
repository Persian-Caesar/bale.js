import { BaseBuilder } from './BaseBuilder';
import type { InlineKeyboardMarkup, ReplyKeyboardMarkup } from '../types/keyboard';

export interface BuiltMessage {
    text: string;
    reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup;
}

export class MessageBuilder extends BaseBuilder<BuiltMessage> {
    private text = '';
    private replyMarkup?: InlineKeyboardMarkup | ReplyKeyboardMarkup;

    /** تنظیم متن پیام */
    setText(text: string): this {
        this.text = text;
        return this;
    }

    /** پیوست کردن کیبورد (اینلاین یا ریپلای) به پیام */
    setKeyboard(markup: InlineKeyboardMarkup | ReplyKeyboardMarkup): this {
        this.replyMarkup = markup;
        return this;
    }

    build(): BuiltMessage {
        if (!this.text) {
            throw new Error('متن پیام نمی‌تواند خالی باشد.');
        }
        return {
            text: this.text,
            ...(this.replyMarkup ? { reply_markup: this.replyMarkup } : {}),
        };
    }
}
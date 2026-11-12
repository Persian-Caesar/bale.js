import { BaseBuilder } from './BaseBuilder';
import type { ReplyKeyboardMarkup, KeyboardButton } from '../types/keyboard';

export interface ReplyButtonOptions {
    request_contact?: boolean;
    request_location?: boolean;
}

export interface ReplyKeyboardOptions {
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
    selective?: boolean;
}

export class ReplyKeyboardBuilder extends BaseBuilder<ReplyKeyboardMarkup> {
    private buttons: KeyboardButton[] = [];
    private rows: KeyboardButton[][] = [];
    private options: ReplyKeyboardOptions = {};

    /**
     * افزودن یک دکمهٔ ریپلای.
     * @param text متن نمایشی دکمه
     * @param options گزینه‌های درخواست مخاطب یا موقعیت
     */
    addButton(text: string, options?: ReplyButtonOptions): this {
        this.buttons.push({ text, ...options });
        return this;
    }

    /** افزودن یک ردیف دستی از دکمه‌ها */
    addRow(...buttons: KeyboardButton[]): this {
        this.rows.push(buttons);
        return this;
    }

    /**
     * چیدمان خودکار دکمه‌های اضافه‌شده در ردیف‌هایی با اندازه‌های مشخص.
     */
    adjust(...sizes: number[]): this {
        let index = 0;
        for (const size of sizes) {
            const row = this.buttons.slice(index, index + size);
            if (row.length > 0) this.rows.push(row);
            index += size;
        }
        const remaining = this.buttons.slice(index);
        if (remaining.length > 0) this.rows.push(remaining);
        return this;
    }

    /**
     * تنظیم گزینه‌های کیبورد (اندازه، یک‌بارمصرف و…).
     */
    setOptions(options: ReplyKeyboardOptions): this {
        this.options = { ...this.options, ...options };
        return this;
    }

    build(): ReplyKeyboardMarkup {
        const keyboard = this.rows.length > 0 ? this.rows : [this.buttons];
        return {
            keyboard,
            ...this.options,
        };
    }
}
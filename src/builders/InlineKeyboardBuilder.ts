import { BaseBuilder } from './BaseBuilder';
import type {
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    ButtonColor,
} from '../types/keyboard';

export interface InlineButtonOptions {
    url?: string;
    callback_data?: string;
    web_app?: { url: string };
    color?: ButtonColor;
}

export class InlineKeyboardBuilder extends BaseBuilder<InlineKeyboardMarkup> {
    private buttons: InlineKeyboardButton[] = [];
    private rows: InlineKeyboardButton[][] = [];

    /**
     * افزودن یک دکمه به کیبورد.
     * @param text متن نمایشی دکمه
     * @param options تنظیمات دکمه (url، callback_data، web_app، color)
     */
    addButton(text: string, options?: InlineButtonOptions): this {
        const button: InlineKeyboardButton = { text, ...options };
        this.buttons.push(button);
        return this;
    }

    /**
     * افزودن یک ردیف کامل از دکمه‌ها به‌صورت دستی.
     * @param buttons دکمه‌های آماده برای قرار گرفتن در یک ردیف
     */
    addRow(...buttons: InlineKeyboardButton[]): this {
        this.rows.push(buttons);
        return this;
    }

    /**
     * چیدمان خودکار دکمه‌های اضافه‌شده با `addButton` در ردیف‌هایی با اندازه‌های مشخص.
     * مثال: `adjust(2, 1)` یعنی دو دکمه در ردیف اول و یک دکمه در ردیف دوم.
     */
    adjust(...sizes: number[]): this {
        let index = 0;
        for (const size of sizes) {
            const row = this.buttons.slice(index, index + size);
            if (row.length > 0) this.rows.push(row);
            index += size;
        }
        // اگر دکمه‌ای باقی ماند، در یک ردیف جداگانه قرار می‌گیرد
        const remaining = this.buttons.slice(index);
        if (remaining.length > 0) this.rows.push(remaining);
        return this;
    }

    build(): InlineKeyboardMarkup {
        // اگر کاربر از adjust استفاده نکرده باشد، همهٔ دکمه‌ها در یک ردیف قرار می‌گیرند
        const keyboard = this.rows.length > 0 ? this.rows : [this.buttons];
        return { inline_keyboard: keyboard };
    }
}
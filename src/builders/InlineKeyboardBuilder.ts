// src/builders/InlineKeyboardBuilder.ts
import { InlineKeyboardButton, InlineKeyboardMarkup } from '../types/api';

export class InlineKeyboardBuilder {
    private rows: InlineKeyboardButton[][] = [];
    private currentRow: InlineKeyboardButton[] = [];

    addButton(button: InlineKeyboardButton) {
        this.currentRow.push(button);
        return this;
    }

    addRow() {
        if (this.currentRow.length) {
            this.rows.push(this.currentRow);
            this.currentRow = [];
        }
        return this;
    }

    build(): InlineKeyboardMarkup {
        if (this.currentRow.length) this.addRow();
        return { inline_keyboard: this.rows };
    }
}
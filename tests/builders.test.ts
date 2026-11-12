import { describe, it, expect } from 'vitest';
import { InlineKeyboardBuilder } from '../src/builders/InlineKeyboardBuilder.js';
import { ReplyKeyboardBuilder } from '../src/builders/ReplyKeyboardBuilder.js';
import { MessageBuilder } from '../src/builders/MessageBuilder.js';

describe('InlineKeyboardBuilder', () => {
    it('builds a simple one-row keyboard', () => {
        const keyboard = new InlineKeyboardBuilder()
            .addButton('Yes', { callback_data: 'yes' })
            .addButton('No', { callback_data: 'no' })
            .build();

        expect(keyboard.inline_keyboard).toHaveLength(1);
        expect(keyboard.inline_keyboard[0]).toHaveLength(2);
    });

    it('adjusts buttons across multiple rows', () => {
        const keyboard = new InlineKeyboardBuilder()
            .addButton('A')
            .addButton('B')
            .addButton('C')
            .adjust(2, 1)
            .build();

        expect(keyboard.inline_keyboard).toHaveLength(2);
        expect(keyboard.inline_keyboard[0]).toHaveLength(2);
        expect(keyboard.inline_keyboard[1]).toHaveLength(1);
    });
});

describe('ReplyKeyboardBuilder', () => {
    it('builds a keyboard with options', () => {
        const keyboard = new ReplyKeyboardBuilder()
            .addButton('Share contact', { request_contact: true })
            .setOptions({ resize_keyboard: true })
            .build();

        expect(keyboard.keyboard).toHaveLength(1);
        expect(keyboard.resize_keyboard).toBe(true);
        expect(keyboard.keyboard[0]![0]!.request_contact).toBe(true);
    });
});

describe('MessageBuilder', () => {
    it('throws when text is empty', () => {
        expect(() => new MessageBuilder().build()).toThrow();
    });

    it('builds a message with keyboard', () => {
        const kb = new InlineKeyboardBuilder().addButton('OK').build();
        const msg = new MessageBuilder().setText('Hello').setKeyboard(kb).build();
        expect(msg.text).toBe('Hello');
        expect(msg.reply_markup).toEqual(kb);
    });
});
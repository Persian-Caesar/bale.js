// src/builders/MessageBuilder.ts
export class MessageBuilder {
    private text = '';
    private reply_markup?: any;

    setText(text: string) {
        this.text = text;
        return this;
    }

    setKeyboard(reply_markup: any) {
        this.reply_markup = reply_markup;
        return this;
    }

    build() {
        return { text: this.text, reply_markup: this.reply_markup };
    }
}
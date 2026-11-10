// src/structures/Message.ts
import { Base } from './Base';
import { Chat } from './Chat';
import { User } from './User';
import { Message as APIMessage } from '../types/api';

export class Message extends Base {
    public id: number;
    public chat: Chat;
    public from?: User;
    public text?: string;

    constructor(client: BaleClient, data: APIMessage) {
        super(client);
        this.id = data.message_id;
        this.chat = new Chat(client, data.chat);
        this.from = data.from ? new User(client, data.from) : undefined;
        this.text = data.text;
    }

    async reply(text: string, reply_markup?: InlineKeyboardMarkup) {
        return this.client.messages.send(this.chat.id, text, {
            reply_to_message_id: this.id,
            reply_markup,
        });
    }
}
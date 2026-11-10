// src/client/BaleClient.ts
import { EventEmitter } from 'events';
import { RESTManager } from '../rest/RESTManager';
import { MessageManager } from '../managers/MessageManager';
import { Update } from '../types/api';
import { Message } from '../structures/Message';

export interface BaleClientOptions {
    token: string;
    mode?: 'polling' | 'webhook';
}

export class BaleClient extends EventEmitter {
    public rest: RESTManager;
    public messages: MessageManager;
    private token: string;
    private mode: 'polling' | 'webhook';
    private offset = 0;
    private polling = false;

    constructor(options: BaleClientOptions) {
        super();
        this.token = options.token;
        this.mode = options.mode || 'polling';
        this.rest = new RESTManager(this.token);
        this.messages = new MessageManager(this);
    }

    async login() {
        const me = await this.rest.getMe();
        this.emit('ready', me);

        if (this.mode === 'polling') {
            this.startPolling();
        }
    }

    private async startPolling() {
        this.polling = true;
        while (this.polling) {
            try {
                const updates = await this.rest.getUpdates({
                    offset: this.offset,
                    timeout: 30,
                });

                for (const update of updates) {
                    this.offset = update.update_id + 1;
                    this.handleUpdate(update);
                }
            } catch (err) {
                this.emit('error', err);
                await new Promise((r) => setTimeout(r, 2000));
            }
        }
    }

    private handleUpdate(update: Update) {
        if (update.message) {
            const message = new Message(this, update.message);
            this.emit('messageCreate', message);
        }
        if (update.callback_query) {
            this.emit('callbackQuery', update.callback_query);
        }
        // سایر رویدادها ...
    }

    stopPolling() {
        this.polling = false;
    }
}
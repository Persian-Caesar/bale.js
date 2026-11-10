// src/rest/RESTManager.ts
import { request } from 'undici';
import { APIResponse } from '../types/api';

export class RESTManager {
    private baseUrl: string;

    constructor(private token: string) {
        this.baseUrl = `https://tapi.bale.ai/bot${token}`;
    }

    async request<T>(method: string, body?: Record<string, any>): Promise<T> {
        const url = `${this.baseUrl}/${method}`;
        const { statusCode, body: responseBody } = await request(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = (await responseBody.json()) as APIResponse<T>;

        if (!data.ok) {
            throw new BaleAPIError(
                data.error_code || statusCode,
                data.description || 'Unknown error'
            );
        }

        return data.result as T;
    }

    // متدهای میان‌بر برای متدهای رایج
    getMe() {
        return this.request<User>('getMe');
    }

    sendMessage(params: {
        chat_id: number | string;
        text: string;
        reply_markup?: InlineKeyboardMarkup;
        reply_to_message_id?: number;
    }) {
        return this.request<Message>('sendMessage', params);
    }

    getUpdates(params?: { offset?: number; limit?: number; timeout?: number }) {
        return this.request<Update[]>('getUpdates', params);
    }

    setWebhook(url: string) {
        return this.request<boolean>('setWebhook', { url });
    }

    deleteWebhook() {
        return this.request<boolean>('deleteWebhook');
    }
}

export class BaleAPIError extends Error {
    constructor(public code: number, message: string) {
        super(message);
        this.name = 'BaleAPIError';
    }
}
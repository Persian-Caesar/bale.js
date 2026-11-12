// src/rest/RESTManager.ts
import { request } from 'undici';
import type { APIResponse } from '../types/api';
import type { APIUser } from '../types/user';
import type { APIMessage } from '../types/message';
import type { Update } from '../types/update';
import type { InlineKeyboardMarkup, ReplyKeyboardMarkup } from '../types/keyboard';
import { BaleAPIError } from './errors';
import { BaleFile } from '../types/media';

export interface RequestOptions {
    /** پارامترهای JSON (برای درخواست‌های غیر فایل) */
    body?: Record<string, unknown>;
    /** فایل‌ها برای آپلود (multipart/form-data) */
    files?: Record<string, { data: Buffer | Uint8Array; filename: string; contentType?: string }>;
}

export class RESTManager {
    private readonly baseUrl: string;

    constructor(private readonly token: string) {
        this.baseUrl = `https://tapi.bale.ai/bot${token}`;
    }

    /**
     * درخواست پایه به API بله.
     * اگر files داده شود، از multipart/form-data استفاده می‌کند.
     */
    async request<T>(method: string, options: RequestOptions = {}): Promise<T> {
        const url = `${this.baseUrl}/${method}`;

        let body: any;
        let headers: Record<string, string> = {};

        if (options.files && Object.keys(options.files).length > 0) {
            const form = new FormData();

            // پارامترهای متنی
            if (options.body) {
                for (const [key, value] of Object.entries(options.body)) {
                    if (value !== undefined && value !== null) {
                        form.append(key, String(value));
                    }
                }
            }

            // فایل‌ها
            for (const [key, file] of Object.entries(options.files)) {
                const view =
                    file.data.buffer instanceof ArrayBuffer
                        ? new Uint8Array(file.data.buffer, file.data.byteOffset, file.data.byteLength)
                        : Uint8Array.from(file.data); // SharedArrayBuffer fallback — copy

                const blob = new Blob([view], { type: file.contentType ?? 'application/octet-stream' });
                form.append(key, blob, file.filename);
            }

            body = form;
            // undici خودش هدر Content-Type را برای FormData تنظیم می‌کند
        } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(options.body ?? {});
        }

        const { statusCode, body: responseBody } = await request(url, {
            method: 'POST',
            headers,
            body,
        });

        const data = (await responseBody.json()) as APIResponse<T>;

        if (!data.ok) {
            throw new BaleAPIError(
                data.error_code ?? statusCode,
                data.description ?? 'خطای ناشناخته در API بله',
                data.parameters,
            );
        }

        return data.result as T;
    }

    // ─── میان‌برهای رایج ───────────────────────────────────────────

    getMe(): Promise<APIUser> {
        return this.request<APIUser>('getMe');
    }

    sendMessage(params: {
        chat_id: number | string;
        text: string;
        reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup;
        reply_to_message_id?: number;
    }): Promise<APIMessage> {
        return this.request<APIMessage>('sendMessage', { body: params });
    }

    getUpdates(params?: { offset?: number; limit?: number; timeout?: number }): Promise<Update[]> {
        return this.request<Update[]>('getUpdates', { body: params ?? {} });
    }

    setWebhook(url: string): Promise<boolean> {
        return this.request<boolean>('setWebhook', { body: { url } });
    }

    deleteWebhook(): Promise<boolean> {
        return this.request<boolean>('deleteWebhook');
    }

    /**
 * دریافت اطلاعات فایل (شامل file_path برای دانلود).
 */
    getFile(fileId: string): Promise<BaleFile> {
        return this.request<BaleFile>('getFile', {
            body: { file_id: fileId },
        });
    }

    /**
     * دانلود فایل از سرور بله و بازگشت به صورت Buffer.
     */
    async downloadFile(filePath: string): Promise<Buffer> {
        const url = `https://tapi.bale.ai/file/bot${this['token']}/${filePath}`;
        const response = await request(url);
        const arrayBuffer = await response.body.arrayBuffer();

        return Buffer.from(arrayBuffer);
    }
}
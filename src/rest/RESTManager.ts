import { request } from 'undici';
import type { APIResponse } from '../types/api';
import type { APIUser } from '../types/user';
import type { APIMessage } from '../types/message';
import type { Update } from '../types/update';
import type { InlineKeyboardMarkup, ReplyKeyboardMarkup } from '../types/keyboard';
import {
    BaleAPIError,
    BaleHTTPError,
    BaleInvalidResponseError,
    BaleNetworkError,
    BaleTimeoutError,
} from './errors';
import type { BaleFile } from '../types/media';
import { createRequestId, Logger, LoggerOptions } from '../util/Logger';

export interface RequestOptions {
    /** JSON parameters (ignored for multipart fields that are null/undefined). */
    body?: Record<string, unknown>;
    /** Files to upload using multipart/form-data. */
    files?: Record<string, { data: Buffer | Uint8Array; filename: string; contentType?: string }>;
    /** Override the manager's request timeout. */
    timeoutMs?: number;
    /** Abort this request from the caller. */
    signal?: AbortSignal;
    /** Number of retries for HTTP 429 responses. Defaults to the manager setting. */
    retries?: number;
}

export interface RESTManagerOptions {
    /** Request timeout in milliseconds. Defaults to 15 seconds. */
    timeoutMs?: number;
    /** Maximum number of retries for HTTP 429 responses. Defaults to 2. */
    retries?: number;
    /** Upper bound for a server-provided retry_after delay. Defaults to 60 seconds. */
    maxRetryAfterMs?: number;
    /** Maximum accepted download size. Defaults to 50 MiB. */
    maxDownloadBytes?: number;
    /** Structured logger configuration for REST diagnostics. */
    logger?: LoggerOptions;
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_RETRIES = 2;
const DEFAULT_MAX_RETRY_AFTER_MS = 60_000;
const DEFAULT_MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024;

export class RESTManager {
    private readonly baseUrl: string;
    private readonly fileBaseUrl: string;
    private readonly timeoutMs: number;
    private readonly retries: number;
    private readonly maxRetryAfterMs: number;
    private readonly maxDownloadBytes: number;
    private readonly logger: Logger;

    constructor(
        private readonly token: string,
        options: RESTManagerOptions = {},
    ) {
        if (!token.trim()) throw new TypeError('Bale bot token must not be empty.');
        this.baseUrl = `https://tapi.bale.ai/bot${token}`;
        this.fileBaseUrl = `https://tapi.bale.ai/file/bot${token}`;
        this.timeoutMs = positiveInteger(options.timeoutMs, DEFAULT_TIMEOUT_MS, 'timeoutMs');
        this.retries = nonNegativeInteger(options.retries, DEFAULT_RETRIES, 'retries');
        this.maxRetryAfterMs = positiveInteger(
            options.maxRetryAfterMs,
            DEFAULT_MAX_RETRY_AFTER_MS,
            'maxRetryAfterMs',
        );
        this.maxDownloadBytes = positiveInteger(
            options.maxDownloadBytes,
            DEFAULT_MAX_DOWNLOAD_BYTES,
            'maxDownloadBytes',
        );
        this.logger = new Logger({ ...options.logger, context: options.logger?.context ?? 'REST' });
        this.logger.addSecret(token);
    }

    /** Send a request to the Bale Bot API. Only HTTP 429 responses are retried automatically. */
    async request<T>(method: string, options: RequestOptions = {}): Promise<T> {
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(method)) {
            throw new TypeError(`Invalid Bale API method name: ${method}`);
        }

        const url = `${this.baseUrl}/${method}`;
        const timeoutMs = positiveInteger(options.timeoutMs, this.timeoutMs, 'timeoutMs');
        const retries = nonNegativeInteger(options.retries, this.retries, 'retries');
        const payload = this.createPayload(options);

        const requestId = createRequestId();
        for (let attempt = 0; ; attempt += 1) {
            const startedAt = Date.now();
            this.logger.debug('Bale API request started.', { requestId, method, attempt: attempt + 1 });
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(new BaleTimeoutError(timeoutMs)), timeoutMs);
            const onAbort = (): void => controller.abort(options.signal?.reason);
            options.signal?.addEventListener('abort', onAbort, { once: true });

            try {
                if (options.signal?.aborted) throw options.signal.reason ?? new Error('Request aborted');

                const response = await request(url, {
                    method: 'POST',
                    headers: payload.headers,
                    body: payload.body as string,
                    signal: controller.signal,
                    headersTimeout: timeoutMs,
                    bodyTimeout: timeoutMs,
                });

                const responseText = await response.body.text();
                this.logger.debug('Bale API response received.', {
                    requestId, method, statusCode: response.statusCode, durationMs: Date.now() - startedAt,
                });
                let data: APIResponse<T>;
                try {
                    data = JSON.parse(responseText) as APIResponse<T>;
                } catch (error) {
                    if (response.statusCode < 200 || response.statusCode >= 300) {
                        throw new BaleHTTPError(response.statusCode, responseText);
                    }
                    throw new BaleInvalidResponseError(
                        response.statusCode,
                        'Bale API returned invalid JSON.',
                        { cause: error },
                    );
                }

                if (!data || typeof data !== 'object' || typeof data.ok !== 'boolean') {
                    throw new BaleInvalidResponseError(
                        response.statusCode,
                        'Bale API response does not match the expected response schema.',
                    );
                }

                if (!data.ok) {
                    const error = new BaleAPIError(
                        data.error_code ?? response.statusCode,
                        data.description ?? 'Unknown Bale API error.',
                        data.parameters,
                    );
                    if (error.code === 429 && attempt < retries) {
                        const retryAfter = Math.max(1, data.parameters?.retry_after ?? 1) * 1000;
                        this.logger.warn('Bale API rate limit reached; retrying.', { requestId, method, attempt: attempt + 1, retryAfterMs: Math.min(retryAfter, this.maxRetryAfterMs) });
                        await abortableDelay(Math.min(retryAfter, this.maxRetryAfterMs), options.signal);
                        continue;
                    }
                    throw error;
                }

                if (response.statusCode < 200 || response.statusCode >= 300) {
                    throw new BaleHTTPError(response.statusCode, responseText);
                }

                this.logger.debug('Bale API request completed.', { requestId, method, durationMs: Date.now() - startedAt });
                return data.result as T;
            } catch (error) {
                const failureData = { requestId, method, attempt: attempt + 1, durationMs: Date.now() - startedAt, error: error instanceof Error ? { name: error.name, message: error.message } : String(error) };
                if (error instanceof BaleAPIError && error.code === 429) this.logger.warn('Bale API request was rate limited.', failureData);
                else this.logger.error('Bale API request failed.', failureData);
                if (error instanceof BaleAPIError || error instanceof BaleHTTPError ||
                    error instanceof BaleInvalidResponseError) {
                    throw error;
                }
                if (options.signal?.aborted) {
                    throw options.signal.reason ?? error;
                }
                if (controller.signal.aborted) {
                    const reason = controller.signal.reason;
                    if (reason instanceof BaleTimeoutError) throw reason;
                    throw new BaleTimeoutError(timeoutMs, { cause: error });
                }
                throw new BaleNetworkError('Failed to communicate with the Bale API.', { cause: error });
            } finally {
                clearTimeout(timeout);
                options.signal?.removeEventListener('abort', onAbort);
            }
        }
    }

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

    getUpdates(
        params?: { offset?: number; limit?: number; timeout?: number },
        options: Pick<RequestOptions, 'signal' | 'timeoutMs' | 'retries'> = {},
    ): Promise<Update[]> {
        return this.request<Update[]>('getUpdates', { body: params ?? {}, ...options });
    }

    setWebhook(url: string): Promise<boolean> {
        return this.request<boolean>('setWebhook', { body: { url } });
    }

    deleteWebhook(): Promise<boolean> {
        return this.request<boolean>('deleteWebhook');
    }

    getFile(fileId: string): Promise<BaleFile> {
        if (!fileId.trim()) throw new TypeError('fileId must not be empty.');
        return this.request<BaleFile>('getFile', { body: { file_id: fileId } });
    }

    /** Download a file with timeout, HTTP-status and size checks. */
    async downloadFile(filePath: string, options: Pick<RequestOptions, 'timeoutMs' | 'signal'> = {}): Promise<Buffer> {
        if (!filePath.trim() || filePath.startsWith('/') || filePath.split('/').some((part) => part === '..')) {
            throw new TypeError('Invalid Bale file path.');
        }

        const timeoutMs = positiveInteger(options.timeoutMs, this.timeoutMs, 'timeoutMs');
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(new BaleTimeoutError(timeoutMs)), timeoutMs);
        const onAbort = (): void => controller.abort(options.signal?.reason);
        options.signal?.addEventListener('abort', onAbort, { once: true });

        try {
            if (options.signal?.aborted) throw options.signal.reason ?? new Error('Download aborted');
            const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
            const response = await request(`${this.fileBaseUrl}/${encodedPath}`, {
                method: 'GET',
                signal: controller.signal,
                headersTimeout: timeoutMs,
                bodyTimeout: timeoutMs,
            });

            const contentLength = Number(response.headers['content-length'] ?? 0);
            if (contentLength > this.maxDownloadBytes) {
                response.body.destroy();
                throw new RangeError(`File exceeds the ${this.maxDownloadBytes}-byte download limit.`);
            }
            if (response.statusCode < 200 || response.statusCode >= 300) {
                const text = await response.body.text();
                throw new BaleHTTPError(response.statusCode, text);
            }

            const chunks: Buffer[] = [];
            let totalBytes = 0;
            for await (const chunk of response.body) {
                const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                totalBytes += buffer.length;
                if (totalBytes > this.maxDownloadBytes) {
                    response.body.destroy();
                    throw new RangeError(`File exceeds the ${this.maxDownloadBytes}-byte download limit.`);
                }
                chunks.push(buffer);
            }
            return Buffer.concat(chunks, totalBytes);
        } catch (error) {
            if (error instanceof BaleHTTPError || error instanceof RangeError) throw error;
            if (options.signal?.aborted) throw options.signal.reason ?? error;
            if (controller.signal.aborted) {
                const reason = controller.signal.reason;
                if (reason instanceof BaleTimeoutError) throw reason;
                throw new BaleTimeoutError(timeoutMs, { cause: error });
            }
            throw new BaleNetworkError('Failed to download a file from the Bale API.', { cause: error });
        } finally {
            clearTimeout(timeout);
            options.signal?.removeEventListener('abort', onAbort);
        }
    }

    private createPayload(options: RequestOptions): { headers: Record<string, string>; body: string | FormData } {
        if (options.files && Object.keys(options.files).length > 0) {
            const form = new FormData();
            for (const [key, value] of Object.entries(options.body ?? {})) {
                if (value !== undefined && value !== null) {
                    form.append(key, typeof value === 'string' ? value : JSON.stringify(value));
                }
            }
            for (const [key, file] of Object.entries(options.files)) {
                const blob = new Blob([Uint8Array.from(file.data)], {
                    type: file.contentType ?? 'application/octet-stream',
                });
                form.append(key, blob, file.filename);
            }
            return { headers: {}, body: form };
        }
        return {
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(options.body ?? {}),
        };
    }
}

function positiveInteger(value: number | undefined, fallback: number, name: string): number {
    if (value === undefined) return fallback;
    if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError(`${name} must be a positive integer.`);
    return value;
}

function nonNegativeInteger(value: number | undefined, fallback: number, name: string): number {
    if (value === undefined) return fallback;
    if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(`${name} must be a non-negative integer.`);
    return value;
}

function abortableDelay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) return reject(signal.reason ?? new Error('Request aborted'));
        const timer = setTimeout(done, ms);
        function done(): void {
            signal?.removeEventListener('abort', abort);
            resolve();
        }
        function abort(): void {
            clearTimeout(timer);
            reject(signal?.reason ?? new Error('Request aborted'));
        }
        signal?.addEventListener('abort', abort, { once: true });
    });
}

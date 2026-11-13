import { createServer, type Server, type IncomingMessage, type ServerResponse } from 'node:http';
import { timingSafeEqual } from 'node:crypto';
import type { BaleClient } from '../client/BaleClient';
import type { Update } from '../types/update';

export interface WebhookOptions {
    /** Public HTTPS URL configured at Bale. */
    url: string;
    /** Local HTTP listening port. Defaults to 3000. */
    port?: number;
    /** Local request path. Defaults to /bale/webhook. */
    path?: string;
    /** Optional shared secret expected in x-bale-secret-token. */
    secretToken?: string;
    /** Maximum accepted request body in bytes. Defaults to 1 MiB. */
    maxBodyBytes?: number;
}

const DEFAULT_MAX_BODY_BYTES = 1024 * 1024;

export class WebhookManager {
    private readonly client: BaleClient;
    private readonly url: string;
    private readonly port: number;
    private readonly path: string;
    private readonly secretToken?: string;
    private readonly maxBodyBytes: number;
    private server?: Server;
    private started = false;

    constructor(client: BaleClient, options: WebhookOptions) {
        this.client = client;
        this.url = validateWebhookUrl(options.url);
        this.port = options.port ?? 3000;
        const publicPath = new URL(this.url).pathname || '/bale/webhook';
        this.path = normalizePath(options.path ?? publicPath);
        this.secretToken = options.secretToken;
        this.maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
        if (!Number.isInteger(this.port) || this.port < 0 || this.port > 65535) {
            throw new RangeError('Webhook port must be an integer between 0 and 65535.');
        }
        if (!Number.isSafeInteger(this.maxBodyBytes) || this.maxBodyBytes <= 0) {
            throw new RangeError('maxBodyBytes must be a positive safe integer.');
        }
        if (this.secretToken !== undefined && this.secretToken.length < 16) {
            throw new RangeError('Webhook secretToken must contain at least 16 characters.');
        }
    }

    /** Start the local HTTP listener first, then register the public webhook URL. */
    async start(): Promise<void> {
        if (this.started) return;
        this.client.logger.info('Starting webhook listener.', { path: this.path, port: this.port });
        if (!this.secretToken) {
            process.emitWarning(
                'Webhook requests are unauthenticated. Configure webhook.secretToken and inject x-bale-secret-token at your proxy.',
                { type: 'BaleWebhookSecurityWarning' },
            );
        }
        const server = createServer((req, res) => {
            void this.handleRequest(req, res);
        });
        this.server = server;
        server.on('error', (error) => this.reportError(error));

        try {
            await new Promise<void>((resolve, reject) => {
                const onError = (error: Error): void => reject(error);
                server.once('error', onError);
                server.listen(this.port, () => {
                    server.off('error', onError);
                    resolve();
                });
            });
            const registered = await this.client.rest.setWebhook(this.url);
            if (!registered) throw new Error('Bale API did not confirm webhook registration.');
            this.started = true;
            this.client.logger.info('Webhook started and registered.', { path: this.path, port: this.port });
        } catch (error) {
            await this.closeServer().catch((closeError: unknown) => this.reportError(closeError));
            throw error;
        }
    }

    /** Stop accepting requests, then unregister the remote webhook. */
    async stop(): Promise<void> {
        this.client.logger.info('Stopping webhook.');
        let closeError: unknown;
        try {
            await this.closeServer();
        } catch (error) {
            closeError = error;
        }
        this.started = false;
        try {
            await this.client.rest.deleteWebhook();
        } catch (error) {
            if (closeError) throw new AggregateError([closeError, error], 'Failed to stop webhook cleanly.');
            throw error;
        }
        if (closeError) throw closeError;
        this.client.logger.info('Webhook stopped.');
    }

    private async closeServer(): Promise<void> {
        const server = this.server;
        if (!server) return;
        this.server = undefined;
        if (!server.listening) return;
        await new Promise<void>((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
        });
    }

    private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        if (req.method !== 'POST' || requestPath(req.url) !== this.path) {
            this.client.logger.warn('Rejected webhook request with invalid method or path.', { method: req.method, path: requestPath(req.url) });
            respond(res, 404, 'Not Found');
            return;
        }
        if (this.secretToken && !safeTokenEqual(req.headers['x-bale-secret-token'], this.secretToken)) {
            this.client.logger.warn('Rejected webhook request: invalid secret token.', { path: this.path });
            respond(res, 401, 'Unauthorized');
            return;
        }
        const contentType = req.headers['content-type']?.split(';', 1)[0]?.trim().toLowerCase();
        if (contentType !== 'application/json') {
            this.client.logger.warn('Rejected webhook request: unsupported content type.', { contentType });
            respond(res, 415, 'Unsupported Media Type');
            return;
        }
        const contentLength = Number(req.headers['content-length'] ?? 0);
        if (Number.isFinite(contentLength) && contentLength > this.maxBodyBytes) {
            respond(res, 413, 'Payload Too Large');
            req.destroy();
            return;
        }

        try {
            const chunks: Buffer[] = [];
            let totalBytes = 0;
            for await (const chunk of req) {
                const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                totalBytes += buffer.length;
                if (totalBytes > this.maxBodyBytes) {
                    respond(res, 413, 'Payload Too Large');
                    req.destroy();
                    return;
                }
                chunks.push(buffer);
            }

            const parsed: unknown = JSON.parse(Buffer.concat(chunks, totalBytes).toString('utf8'));
            if (!isUpdate(parsed)) {
                respond(res, 400, 'Invalid Update');
                return;
            }
            this.client.dispatchUpdate(parsed);
            this.client.logger.debug('Webhook update dispatched.', { updateId: parsed.update_id });
            respond(res, 200, 'OK');
        } catch (error) {
            this.reportError(error);
            if (!res.headersSent) respond(res, 400, 'Bad Request');
        }
    }

    private reportError(error: unknown): void {
        this.client.logger.error('Webhook handler failed.', { error: error instanceof Error ? { name: error.name, message: error.message } : String(error) });
        try {
            this.client.emit('error', error);
        } catch (listenerError) {
            process.emitWarning(listenerError instanceof Error ? listenerError : String(listenerError), {
                type: 'BaleWebhookListenerWarning',
            });
        }
    }
}

function validateWebhookUrl(value: string): string {
    let url: URL;
    try {
        url = new URL(value);
    } catch {
        throw new TypeError('webhook.url must be a valid absolute URL.');
    }
    if (url.protocol !== 'https:') throw new TypeError('webhook.url must use HTTPS.');
    if (url.username || url.password || url.search || url.hash) {
        throw new TypeError('webhook.url must not contain credentials, query parameters, or a hash.');
    }
    return url.toString();
}

function normalizePath(value: string): string {
    if (!value.startsWith('/') || value.includes('?') || value.includes('#')) {
        throw new TypeError('webhook.path must be an absolute URL path without query or hash.');
    }
    return value;
}

function requestPath(value: string | undefined): string | undefined {
    if (!value) return undefined;
    try {
        return new URL(value, 'http://localhost').pathname;
    } catch {
        return undefined;
    }
}

function safeTokenEqual(header: string | string[] | undefined, expected: string): boolean {
    if (typeof header !== 'string') return false;
    const actualBuffer = Buffer.from(header);
    const expectedBuffer = Buffer.from(expected);
    return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function isUpdate(value: unknown): value is Update {
    if (!value || typeof value !== 'object') return false;
    const update = value as Record<string, unknown>;
    return Number.isSafeInteger(update.update_id) && (typeof update.update_id === 'number') &&
        ['message', 'edited_message', 'callback_query', 'pre_checkout_query'].some((key) => key in update);
}

function respond(res: ServerResponse, status: number, message: string): void {
    if (res.headersSent || res.destroyed) return;
    res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8', 'content-length': Buffer.byteLength(message) });
    res.end(message);
}

import {
    createServer,
    type Server,
    type IncomingMessage,
    type ServerResponse
} from 'http';
import type { BaleClient } from '../client/BaleClient';
import type { Update } from '../types/update';

export interface WebhookOptions {
    url: string;
    port?: number;
    path?: string;
}

export class WebhookManager {
    private readonly client: BaleClient;
    private readonly url: string;
    private readonly port: number;
    private readonly path: string;

    private server?: Server;

    constructor(client: BaleClient, options: WebhookOptions) {
        this.client = client;
        this.url = options.url;
        this.port = options.port ?? 3000;
        this.path = options.path ?? '/bale/webhook';
    }

    /** ثبت وبهوک در بله و راه‌اندازی سرور محلی */
    async start(): Promise<void> {
        // ۱. ثبت آدرس وبهوک در بله
        await this.client.rest.setWebhook(this.url);

        // ۲. راه‌اندازی سرور HTTP محلی
        this.server = createServer((req, res) => this.handleRequest(req, res));
        await new Promise<void>((resolve, reject) => {
            this.server!.listen(this.port, () => resolve());
            this.server!.on('error', reject);
        });
    }

    /** توقف سرور و حذف وبهوک از سمت بله */
    async stop(): Promise<void> {
        if (this.server) {
            await new Promise<void>((resolve, reject) => {
                this.server!.close((err) => (err ? reject(err) : resolve()));
            });
            this.server = undefined;
        }
        // حذف وبهوک تا امکان استفاده از polling دوباره فراهم شود
        await this.client.rest.deleteWebhook();
    }

    private handleRequest(req: IncomingMessage, res: ServerResponse): void {
        // فقط مسیر مشخص‌شده و متد POST را می‌پذیریم
        if (req.method !== 'POST' || req.url !== this.path) {
            res.writeHead(404).end();
            return;
        }

        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
            try {
                const update = JSON.parse(body) as Update;
                this.client.dispatchUpdate(update);
                res.writeHead(200).end('OK');
            } catch (error) {
                this.client.emit('error', error);
                res.writeHead(400).end('Bad Request');
            }
        });
    }
}
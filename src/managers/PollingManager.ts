import type { BaleClient } from '../client/BaleClient';
import { BaleAPIError } from '../rest/errors';

export interface PollingOptions {
    timeout?: number;
    limit?: number;
}

export class PollingManager {
    private readonly client: BaleClient;
    private readonly timeout: number;
    private readonly limit: number;

    private running = false;
    private offset = 0;

    constructor(client: BaleClient, options: PollingOptions = {}) {
        this.client = client;
        this.timeout = options.timeout ?? 30;
        this.limit = options.limit ?? 100;
    }

    /** شروع حلقهٔ دریافت آپدیت */
    start(): void {
        if (this.running) return;
        this.running = true;
        void this.loop();
    }

    /** توقف حلقه */
    stop(): void {
        this.running = false;
    }

    private async loop(): Promise<void> {
        while (this.running) {
            try {
                const updates = await this.client.rest.getUpdates({
                    offset: this.offset,
                    limit: this.limit,
                    timeout: this.timeout,
                });

                for (const update of updates) {
                    this.offset = update.update_id + 1;
                    this.client.dispatchUpdate(update);
                }
            } catch (error) {
                // خطا را منتشر می‌کنیم تا کاربر بتواند لاگ کند
                this.client.emit('error', error);

                // اگر خطای ۴۲۹ (Too Many Requests) بود، به retry_after احترام بگذاریم
                if (error instanceof BaleAPIError && error.code === 429) {
                    const retryAfter = error.parameters?.retry_after ?? 1;
                    await delay(retryAfter * 1000);
                } else {
                    // تأخیر کوتاه برای جلوگیری از حلقهٔ خطای سریع
                    await delay(2000);
                }
            }
        }
    }
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
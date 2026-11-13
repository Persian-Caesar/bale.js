import type { BaleClient } from '../client/BaleClient';
import { BaleAPIError } from '../rest/errors';

export interface PollingOptions {
    /** Long-poll timeout in seconds (Bale API range should be validated against current API docs). */
    timeout?: number;
    /** Maximum number of updates per request. */
    limit?: number;
    /** Delay after an unexpected error. Defaults to 2 seconds. */
    errorRetryDelayMs?: number;
}

export class PollingManager {
    private readonly client: BaleClient;
    private readonly timeout: number;
    private readonly limit: number;
    private readonly errorRetryDelayMs: number;
    private running = false;
    private offset = 0;
    private controller?: AbortController;
    private loopPromise?: Promise<void>;

    constructor(client: BaleClient, options: PollingOptions = {}) {
        this.client = client;
        this.timeout = positiveInteger(options.timeout, 30, 'timeout');
        this.limit = positiveInteger(options.limit, 100, 'limit');
        this.errorRetryDelayMs = positiveInteger(options.errorRetryDelayMs, 2000, 'errorRetryDelayMs');
        if (this.limit > 100) throw new RangeError('Polling limit must not exceed 100.');
    }

    /** Start the long-polling loop. Repeated calls are safe. */
    start(): void {
        if (this.running) return;
        this.client.logger.info('Polling started.', { timeout: this.timeout, limit: this.limit });
        this.running = true;
        this.loopPromise = this.loop();
    }

    /** Abort the in-flight getUpdates request and wait until the loop exits. */
    async stop(): Promise<void> {
        this.running = false;
        this.client.logger.info('Polling stopping.');
        this.controller?.abort(new Error('Polling stopped by client.'));
        await this.loopPromise;
        this.loopPromise = undefined;
        this.controller = undefined;
        this.client.logger.info('Polling stopped.', { offset: this.offset });
    }

    private async loop(): Promise<void> {
        while (this.running) {
            const controller = new AbortController();
            this.controller = controller;
            try {
                const updates = await this.client.rest.getUpdates(
                    { offset: this.offset, limit: this.limit, timeout: this.timeout },
                    { signal: controller.signal, timeoutMs: (this.timeout + 5) * 1000, retries: 0 },
                );

                this.client.logger.debug('Polling received updates.', { count: updates.length, offset: this.offset });
                for (const update of updates) {
                    if (!this.running) break;
                    // Advance the offset only after dispatch succeeds, so a synchronous
                    // handler failure does not silently acknowledge the update.
                    this.client.dispatchUpdate(update);
                    this.offset = Math.max(this.offset, update.update_id + 1);
                }
            } catch (error) {
                if (!this.running && controller.signal.aborted) break;
                this.reportError(error);
                const delayMs = error instanceof BaleAPIError && error.code === 429
                    ? Math.min(60_000, Math.max(1000, (error.parameters?.retry_after ?? 1) * 1000))
                    : this.errorRetryDelayMs;
                await delay(delayMs, () => !this.running);
            } finally {
                if (this.controller === controller) this.controller = undefined;
            }
        }
    }

    private reportError(error: unknown): void {
        this.client.logger.error('Polling loop failed.', { error: error instanceof Error ? { name: error.name, message: error.message } : String(error) });
        try {
            this.client.emit('error', error);
        } catch (listenerError) {
            process.emitWarning(listenerError instanceof Error ? listenerError : String(listenerError), {
                type: 'BalePollingListenerWarning',
            });
        }
    }
}

function positiveInteger(value: number | undefined, fallback: number, name: string): number {
    if (value === undefined) return fallback;
    if (!Number.isSafeInteger(value) || value <= 0) throw new RangeError(`${name} must be a positive integer.`);
    return value;
}

function delay(ms: number, shouldStop: () => boolean): Promise<void> {
    return new Promise((resolve) => {
        if (shouldStop()) return resolve();
        let interval: NodeJS.Timeout | undefined;
        const finish = (): void => {
            clearTimeout(timer);
            if (interval) clearInterval(interval);
            resolve();
        };
        const timer = setTimeout(finish, ms);
        interval = setInterval(() => {
            if (shouldStop()) finish();
        }, Math.min(ms, 100));
    });
}

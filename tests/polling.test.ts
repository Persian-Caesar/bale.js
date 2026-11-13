import { describe, expect, it, vi } from 'vitest';
import { PollingManager } from '../src/managers/PollingManager';
import type { BaleClient } from '../src/client/BaleClient';

describe('PollingManager', () => {
    it('aborts an in-flight getUpdates request and waits for shutdown', async () => {
        let receivedSignal: AbortSignal | undefined;
        const getUpdates = vi.fn((_params: unknown, options?: { signal?: AbortSignal }) => {
            const signal = options?.signal;
            receivedSignal = signal;
            return new Promise<never>((_resolve, reject) => {
                signal?.addEventListener('abort', () => reject(signal.reason), { once: true });
            });
        });
        const client = {
            rest: { getUpdates },
            dispatchUpdate: vi.fn(),
            emit: vi.fn(),
        } as unknown as BaleClient;
        const manager = new PollingManager(client, { timeout: 1 });

        manager.start();
        await vi.waitFor(() => expect(getUpdates).toHaveBeenCalledOnce());
        await manager.stop();

        expect(receivedSignal?.aborted).toBe(true);
    });

    it('rejects invalid polling limits before starting', () => {
        const client = { rest: { getUpdates: vi.fn() } } as unknown as BaleClient;
        expect(() => new PollingManager(client, { limit: 101 })).toThrow(RangeError);
        expect(() => new PollingManager(client, { timeout: 0 })).toThrow(RangeError);
    });
});

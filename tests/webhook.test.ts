import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebhookManager } from '../src/managers/WebhookManager';
import type { BaleClient } from '../src/client/BaleClient';
import type { Server } from 'node:http';

describe('WebhookManager', () => {
    let manager: WebhookManager | undefined;

    afterEach(async () => {
        if (manager) await manager.stop();
        manager = undefined;
    });

    it('requires an HTTPS public URL', () => {
        const client = { rest: {} } as unknown as BaleClient;
        expect(() => new WebhookManager(client, { url: 'http://example.com/hook' })).toThrow(TypeError);
    });

    it('checks the shared secret and dispatches valid updates', async () => {
        const setWebhook = vi.fn().mockResolvedValue(true);
        const deleteWebhook = vi.fn().mockResolvedValue(true);
        const dispatchUpdate = vi.fn();
        const client = {
            rest: { setWebhook, deleteWebhook },
            dispatchUpdate,
            emit: vi.fn(),
        } as unknown as BaleClient;

        manager = new WebhookManager(client, {
            url: 'https://example.com/hook',
            port: 0,
            path: '/hook',
            secretToken: 'a-secure-secret-token-123',
        });
        await manager.start();

        const server = (manager as unknown as { server: Server }).server;
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected TCP server address.');
        const endpoint = `http://127.0.0.1:${address.port}/hook`;

        const unauthorized = await fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ update_id: 1, message: {} }),
        });
        expect(unauthorized.status).toBe(401);

        const accepted = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'x-bale-secret-token': 'a-secure-secret-token-123',
            },
            body: JSON.stringify({ update_id: 2, message: {} }),
        });
        expect(accepted.status).toBe(200);
        expect(dispatchUpdate).toHaveBeenCalledWith({ update_id: 2, message: {} });
        expect(setWebhook).toHaveBeenCalledWith('https://example.com/hook');
    });
});

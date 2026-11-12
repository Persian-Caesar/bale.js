import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RESTManager } from '../src/rest/RESTManager.js';
import { BaleAPIError } from '../src/rest/errors.js';

// Mock undici's request
vi.mock('undici', () => ({
    request: vi.fn(),
}));

import { request } from 'undici';

describe('RESTManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('throws BaleAPIError when ok is false', async () => {
        vi.mocked(request).mockResolvedValue({
            statusCode: 200,
            body: {
                json: async () => ({
                    ok: false,
                    error_code: 400,
                    description: 'Bad Request',
                }),
            },
        } as any);

        const rest = new RESTManager('test-token');
        await expect(rest.getMe()).rejects.toThrow(BaleAPIError);
    });

    it('returns result when ok is true', async () => {
        const fakeUser = { id: 1, is_bot: true, first_name: 'TestBot' };
        vi.mocked(request).mockResolvedValue({
            statusCode: 200,
            body: {
                json: async () => ({ ok: true, result: fakeUser }),
            },
        } as any);

        const rest = new RESTManager('test-token');
        const user = await rest.getMe();
        expect(user).toEqual(fakeUser);
    });
});
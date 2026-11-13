import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESTManager } from '../src/rest/RESTManager';
import {
    BaleAPIError,
    BaleHTTPError,
    BaleInvalidResponseError,
    BaleNetworkError,
} from '../src/rest/errors';

vi.mock('undici', () => ({ request: vi.fn() }));
import { request } from 'undici';

function response(statusCode: number, value: unknown) {
    return {
        statusCode,
        body: { text: async () => typeof value === 'string' ? value : JSON.stringify(value) },
    };
}

describe('RESTManager', () => {
    beforeEach(() => vi.resetAllMocks());
    afterEach(() => vi.useRealTimers());

    it('returns result when the API response is successful', async () => {
        const fakeUser = { id: 1, is_bot: true, first_name: 'TestBot' };
        vi.mocked(request).mockResolvedValue(response(200, { ok: true, result: fakeUser }) as never);
        await expect(new RESTManager('test-token').getMe()).resolves.toEqual(fakeUser);
    });

    it('throws BaleAPIError when the API returns ok=false', async () => {
        vi.mocked(request).mockResolvedValue(response(200, {
            ok: false, error_code: 400, description: 'Bad Request',
        }) as never);
        await expect(new RESTManager('test-token').getMe()).rejects.toBeInstanceOf(BaleAPIError);
    });

    it('retries a 429 response using retry_after and then succeeds', async () => {
        vi.useFakeTimers();
        vi.mocked(request)
            .mockResolvedValueOnce(response(200, {
                ok: false, error_code: 429, description: 'Too Many Requests',
                parameters: { retry_after: 1 },
            }) as never)
            .mockResolvedValueOnce(response(200, { ok: true, result: 'ok' }) as never);

        const pending = new RESTManager('test-token', { retries: 1 }).request<string>('getMe');
        await vi.waitFor(() => expect(vi.getTimerCount()).toBe(1));
        await vi.advanceTimersByTimeAsync(1000);
        await expect(pending).resolves.toBe('ok');
        expect(request).toHaveBeenCalledTimes(2);
        vi.useRealTimers();
    });

    it('does not retry API errors other than rate limits', async () => {
        vi.mocked(request).mockResolvedValue(response(200, {
            ok: false, error_code: 400, description: 'Bad Request',
        }) as never);
        await expect(new RESTManager('test-token').getMe()).rejects.toBeInstanceOf(BaleAPIError);
        expect(request).toHaveBeenCalledTimes(1);
    });

    it('throws a typed error for malformed JSON', async () => {
        vi.mocked(request).mockResolvedValue(response(200, '{invalid-json') as never);
        await expect(new RESTManager('test-token').getMe()).rejects.toBeInstanceOf(BaleInvalidResponseError);
    });

    it('throws HTTP error for non-2xx non-JSON responses', async () => {
        vi.mocked(request).mockResolvedValue(response(502, 'Bad Gateway') as never);
        await expect(new RESTManager('test-token').getMe()).rejects.toBeInstanceOf(BaleHTTPError);
    });

    it('wraps network failures in BaleNetworkError', async () => {
        vi.mocked(request).mockRejectedValue(new Error('socket closed'));
        await expect(new RESTManager('test-token').getMe()).rejects.toBeInstanceOf(BaleNetworkError);
    });

    it('rejects empty tokens and invalid request method names', async () => {
        expect(() => new RESTManager(' ')).toThrow(TypeError);
        await expect(new RESTManager('token').request('getMe/../../other')).rejects.toThrow(TypeError);
    });

    it('rejects unsafe file paths before making a request', async () => {
        await expect(new RESTManager('token').downloadFile('../secret')).rejects.toThrow(TypeError);
        expect(request).not.toHaveBeenCalled();
    });
});

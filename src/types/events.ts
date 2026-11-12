import { CallbackQuery } from '../structures/CallbackQuery';
import type { APIUser } from './user';
import type { Message } from '../structures/Message';

/**
 * نقشهٔ رویدادهای کلاینت.
 * کلید: نام رویداد، مقدار: آرگومان‌های listener به‌صورت tuple.
 */
export type ClientEvents = {
    ready: [user: APIUser];
    messageCreate: [message: Message];
    messageEdit: [message: Message];
    callbackQuery: [query: CallbackQuery];
    webAppData: [data: {
        from: APIUser | undefined,
        data: string,
        buttonText: string,
        message: Message
    }];
    error: [error: unknown];
}
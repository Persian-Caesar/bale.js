import type { CallbackQuery } from './update';
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
    error: [error: unknown];
}
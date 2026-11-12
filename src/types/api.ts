// src/types/api.ts

/** پاسخ استاندارد API بله */
export interface APIResponse<T> {
    ok: boolean;
    result?: T;
    description?: string;
    error_code?: number;
    parameters?: ResponseParameters;
}

/** پارامترهای کمکی برای مدیریت خودکار خطا */
export interface ResponseParameters {
    migrate_to_chat_id?: number;
    retry_after?: number;
}
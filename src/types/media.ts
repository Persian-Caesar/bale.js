// types/media.ts
import type { InlineKeyboardMarkup } from './keyboard';
import type { MessageEntity } from './message';

// ─── ورودی فایل ──────────────────────────────────────────────

/** ورودی فایل: Buffer (آپلود)، شناسهٔ فایل، یا URL */
export type FileInput = Buffer | string | URL;

/** ورودی فایل پس از تبدیل به شکل قابل‌استفاده در body */
export type ResolvedFileInput =
    | { type: 'string'; value: string }
    | { type: 'buffer'; value: Buffer };

/**
 * ورودی فایل را به شکل قابل‌استفاده تبدیل می‌کند.
 * - Buffer → multipart
 * - URL یا رشتهٔ http(s) → به‌عنوان URL
 * - سایر رشته‌ها → به‌عنوان file_id
 */
export function resolveFileInput(input: FileInput): ResolvedFileInput {
    if (Buffer.isBuffer(input)) {
        return { type: 'buffer', value: input };
    }
    if (input instanceof URL) {
        return { type: 'string', value: input.toString() };
    }
    return { type: 'string', value: input };
}

// ─── فایل سرور ──────────────────────────────────────────────

export interface BaleFile {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    /** مسیر فایل روی سرور (برای download) */
    file_path?: string;
}

// ─── گزینه‌های مشترک ارسال مدیا ─────────────────────────────

export type ParseMode = 'Markdown' | 'MarkdownV2' | 'HTML';

export interface SendMediaBaseOptions {
    /** کپشن (برای عکس، ویدیو، سند، صدا) */
    caption?: string;
    /** حالت پارس کپشن */
    parse_mode?: ParseMode;
    /** موجودیت‌های کپشن (جایگزین parse_mode) */
    caption_entities?: MessageEntity[];
    /** ارسال بدون صدا */
    disable_notification?: boolean;
    /** محافظت از محتوا */
    protect_content?: boolean;
    /** پاسخ به پیام مشخص */
    reply_to_message_id?: number;
    /** اگر پیام مرجع حذف شد، باز هم ارسال شود */
    allow_sending_without_reply?: boolean;
    /** کیبورد شیشه‌ای */
    reply_markup?: InlineKeyboardMarkup;
}

// ─── گزینه‌های اختصاصی هر نوع ────────────────────────────────

export interface SendPhotoOptions extends SendMediaBaseOptions {
    /** عکس به‌صورت اسپویلر */
    has_spoiler?: boolean;
}

export interface SendDocumentOptions extends SendMediaBaseOptions {
    /** غیرفعال کردن تشخیص خودکار نوع محتوا */
    disable_content_type_detection?: boolean;
}

export interface SendVideoOptions extends SendMediaBaseOptions {
    /** مدت زمان (ثانیه) */
    duration?: number;
    width?: number;
    height?: number;
    /** پشتیبانی از استریم */
    supports_streaming?: boolean;
    has_spoiler?: boolean;
}

export interface SendAudioOptions extends SendMediaBaseOptions {
    duration?: number;
    performer?: string;
    title?: string;
}

export interface SendVoiceOptions extends SendMediaBaseOptions {
    duration?: number;
}
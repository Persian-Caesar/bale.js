// src/types/message.ts
import type { User } from './user';
import type { Chat } from './chat';
import type { InlineKeyboardMarkup } from './keyboard';

export interface Message {
    message_id: number;
    from?: User;
    chat: Chat;
    date: number;
    text?: string;
    caption?: string;
    reply_markup?: InlineKeyboardMarkup;
    reply_to_message?: Message;
    /** فایل‌های ضمیمه بر اساس مستندات بله */
    photo?: PhotoSize[];
    document?: Document;
    audio?: Audio;
    video?: Video;
    voice?: Voice;
    sticker?: Sticker;
    contact?: Contact;
    location?: Location;
    /** پرداخت */
    successful_payment?: SuccessfulPayment;
    /** دادهٔ مینی‌اپ */
    web_app_data?: WebAppData;
}

export interface PhotoSize {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
}

export interface Document {
    file_id: string;
    file_unique_id: string;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
}

export interface Audio {
    file_id: string;
    file_unique_id: string;
    duration: number;
    performer?: string;
    title?: string;
    mime_type?: string;
    file_size?: number;
}

export interface Video {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    duration: number;
    mime_type?: string;
    file_size?: number;
}

export interface Voice {
    file_id: string;
    file_unique_id: string;
    duration: number;
    mime_type?: string;
    file_size?: number;
}

export interface Sticker {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    is_animated: boolean;
    emoji?: string;
    file_size?: number;
}

export interface Contact {
    phone_number: string;
    first_name: string;
    last_name?: string;
    user_id?: number;
}

export interface Location {
    longitude: number;
    latitude: number;
}

export interface SuccessfulPayment {
    invoice_payload: string;
    total_amount: number;
    currency: string;
    telegram_payment_charge_id?: string;
    provider_payment_charge_id?: string;
}

export interface WebAppData {
    data: string;
    button_text: string;
}
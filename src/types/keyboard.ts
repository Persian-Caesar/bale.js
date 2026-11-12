export type ButtonColor = 'primary' | 'success' | 'danger';

/** اطلاعات مینی‌اپ (Web App) */
export interface WebAppInfo {
  url: string;
}

/** دکمهٔ کیبورد اینلاین (شیشه‌ای) */
export interface InlineKeyboardButton {
  text: string;
  url?: string;
  callback_data?: string;
  web_app?: WebAppInfo;
  color?: ButtonColor;
}

/** مارک‌آپ کیبورد اینلاین */
export interface InlineKeyboardMarkup {
  inline_keyboard: InlineKeyboardButton[][];
}

/** دکمهٔ کیبورد ریپلای (سفارشی) */
export interface KeyboardButton {
  text: string;
  request_contact?: boolean;
  request_location?: boolean;
}

/** مارک‌آپ کیبورد ریپلای */
export interface ReplyKeyboardMarkup {
  keyboard: KeyboardButton[][];
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  selective?: boolean;
}

/** حذف کیبورد ریپلای */
export interface ReplyKeyboardRemove {
  remove_keyboard: true;
}
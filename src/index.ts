import { version } from '../package.json';

export * from './types/index';
export * from './rest/RESTManager';
export * from './rest/errors';

export * from './structures/Base';
export * from './structures/User';
export * from './structures/Chat';
export * from './structures/Message';

export * from './managers/BaseManager';
export * from './managers/MessageManager';
export * from './managers/ChatManager';
export * from './managers/PollingManager';
export * from './managers/WebhookManager';

export * from './builders/BaseBuilder';
export * from './builders/InlineKeyboardBuilder';
export * from './builders/ReplyKeyboardBuilder';
export * from './builders/MessageBuilder';

export * from './types/media';
export * from './managers/MediaManager';

export * from './structures/CallbackQuery';
export * from './managers/GroupManager';
export * from './managers/PaymentManager';
export * from './builders/InvoiceBuilder';

export * from './client/BaleClient';

export * from './util/Collection';

export const VERSION = version;
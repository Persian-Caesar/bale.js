import type { ClientEvents } from '../types/events';
import { MessageManager } from '../managers/MessageManager';
import { PollingManager } from '../managers/PollingManager';
import { WebhookManager } from '../managers/WebhookManager';
import { CallbackQuery } from '../structures/CallbackQuery';
import { TypedEmitter } from '../structures/TypedEmitter';
import { MediaManager } from '../managers/MediaManager';
import type { APIUser } from '../types/user';
import type { PreCheckoutQuery, Update } from '../types/update';
import { ChatManager } from '../managers/ChatManager';
import { RESTManager } from '../rest/RESTManager';
import { Message } from '../structures/Message';
import { PaymentManager } from '../managers/PaymentManager';
import { GroupManager } from '../managers/GroupManager';
import type { RESTManagerOptions } from '../rest/RESTManager';

export type ClientMode = 'polling' | 'webhook';

export interface BaleClientOptions {
    token: string;
    mode?: ClientMode;
    /** گزینه‌های مخصوص Polling */
    polling?: {
        /** حداکثر زمان انتظار برای هر درخواست getUpdates (ثانیه). پیش‌فرض ۳۰ */
        timeout?: number;
        /** حداکثر تعداد آپدیت در هر درخواست. پیش‌فرض ۱۰۰ */
        limit?: number;
        errorRetryDelayMs?: number;
    };
    /** گزینه‌های مخصوص Webhook */
    webhook?: {
        /** آدرس عمومی سرور (مثلاً https://example.com/bale/webhook) */
        url: string;
        /** پورت سرور HTTP محلی */
        port?: number;
        /** مسیر دریافت آپدیت‌ها */
        path?: string;
        /** Secret expected in the x-bale-secret-token request header (usually set by a reverse proxy). */
        secretToken?: string;
        maxBodyBytes?: number;
    };
    /** تنظیمات ارتباط HTTP با API بله */
    rest?: RESTManagerOptions;
}

/**
 * رویدادهای قابل گوش‌دادن:
 * - ready (user: APIUser)
 * - messageCreate (message: Message)
 * - messageEdit (message: Message)
 * - callbackQuery (query: CallbackQuery)
 * - preCheckoutQuery (query: PreCheckoutQuery)
 * - error (error: unknown)
 */
export class BaleClient extends TypedEmitter<ClientEvents> {
    public readonly rest: RESTManager;
    public readonly messages: MessageManager;
    public readonly chats: ChatManager;

    private readonly token: string;
    private readonly mode: ClientMode;
    private readonly options: BaleClientOptions;
    private pollingManager?: PollingManager;
    private webhookManager?: WebhookManager;
    private readyUser?: APIUser;
    private started = false;

    public readonly media: MediaManager;

    public readonly groups: GroupManager;
    public readonly payments: PaymentManager;

    constructor(options: BaleClientOptions) {
        super();
        if (!options.token?.trim()) throw new TypeError('BaleClient requires a non-empty bot token.');
        this.token = options.token;
        this.mode = options.mode ?? 'polling';
        this.options = options;

        this.rest = new RESTManager(this.token, options.rest);
        this.messages = new MessageManager(this);
        this.chats = new ChatManager(this);

        this.media = new MediaManager(this);

        this.groups = new GroupManager(this);
        this.payments = new PaymentManager(this);
    }

    /** اطلاعات ربات پس از آماده‌شدن (یا undefined اگر هنوز login نشده باشد) */
    get user(): APIUser | undefined {
        return this.readyUser;
    }

    /**
     * راه‌اندازی کلاینت.
     * - در حالت polling: شروع حلقهٔ دریافت آپدیت.
     * - در حالت webhook: ثبت وبهوک و راه‌اندازی سرور محلی.
     */
    async login(): Promise<void> {
        if (this.started) return;
        this.started = true;
        try {
            this.readyUser = await this.rest.getMe();
            this.emit('ready', this.readyUser);

            if (this.mode === 'polling') await this.startPolling();
            else await this.startWebhook();
        } catch (error) {
            this.started = false;
            this.readyUser = undefined;
            throw error;
        }
    }

    /** توقف دریافت آپدیت‌ها (چه polling و چه webhook) */
    async destroy(): Promise<void> {
        if (this.pollingManager) {
            await this.pollingManager.stop();
            this.pollingManager = undefined;
        }
        if (this.webhookManager) {
            await this.webhookManager.stop();
            this.webhookManager = undefined;
        }
        this.started = false;
        this.readyUser = undefined;
    }

    // ─── مدیریت Polling ───────────────────────────────────────────

    private async startPolling(): Promise<void> {
        this.pollingManager = new PollingManager(this, {
            timeout: this.options.polling?.timeout,
            limit: this.options.polling?.limit,
            errorRetryDelayMs: this.options.polling?.errorRetryDelayMs,
        });
        this.pollingManager.start();
    }

    // ─── مدیریت Webhook ───────────────────────────────────────────

    private async startWebhook(): Promise<void> {
        const webhookOptions = this.options.webhook;
        if (!webhookOptions?.url) {
            throw new Error('در حالت webhook، گزینهٔ webhook.url الزامی است.');
        }

        this.webhookManager = new WebhookManager(this, {
            url: webhookOptions.url,
            port: webhookOptions.port,
            path: webhookOptions.path,
            secretToken: webhookOptions.secretToken,
            maxBodyBytes: webhookOptions.maxBodyBytes,
        });
        try {
            await this.webhookManager.start();
        } catch (error) {
            this.webhookManager = undefined;
            throw error;
        }
    }

    // ─── توزیع آپدیت‌ها بین رویدادها ─────────────────────────────

    /**
     * این متد توسط PollingManager و WebhookManager فراخوانی می‌شود.
     * آپدیت خام را به ساختار مناسب تبدیل کرده و رویداد مربوطه را منتشر می‌کند.
     */
    public dispatchUpdate(update: Update): void {
        if (update.message) {
            const message = new Message(this, update.message);
            this.emit('messageCreate', message);
        }

        if (update.edited_message) {
            const message = new Message(this, update.edited_message);
            this.emit('messageEdit', message);
        }


        if (update.callback_query) {
            const callback = new CallbackQuery(this, update.callback_query);
            this.emit('callbackQuery', callback);
        }

        if (update.pre_checkout_query) {
            this.emit('preCheckoutQuery', update.pre_checkout_query);
        }

        if (update.message?.web_app_data) {
            this.emit('webAppData', {
                from: update.message.from,
                data: update.message.web_app_data.data,
                buttonText: update.message.web_app_data.button_text,
                message: new Message(this, update.message)
            });
        }

    }
}

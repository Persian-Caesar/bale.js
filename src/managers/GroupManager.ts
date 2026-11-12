import type { BaleClient } from '../client/BaleClient';
import { BaseManager } from './BaseManager';

export interface PromoteOptions {
    can_change_info?: boolean;
    can_delete_messages?: boolean;
    can_invite_users?: boolean;
    can_restrict_members?: boolean;
    can_pin_messages?: boolean;
    can_promote_members?: boolean;
}

export interface InviteLinkOptions {
    expire_date?: number;
    member_limit?: number;
}

export class GroupManager extends BaseManager {
    constructor(client: BaleClient) {
        super(client);
    }

    /** ارتقای کاربر به ادمین با دسترسی‌های مشخص */
    async promote(chatId: number | string, userId: number, options: PromoteOptions): Promise<boolean> {
        return this.client.rest.request<boolean>('promoteChatMember', {
            body: {
                chat_id: chatId,
                user_id: userId,
                ...options,
            },
        });
    }

    /** مسدود کردن کاربر در گروه */
    async ban(chatId: number | string, userId: number): Promise<boolean> {
        return this.client.rest.request<boolean>('banChatMember', {
            body: { chat_id: chatId, user_id: userId },
        });
    }

    /** رفع مسدودی کاربر */
    async unban(chatId: number | string, userId: number): Promise<boolean> {
        return this.client.rest.request<boolean>('unbanChatMember', {
            body: { chat_id: chatId, user_id: userId },
        });
    }

    /** سنجاق کردن یک پیام در گروه */
    async pinMessage(
        chatId: number | string,
        messageId: number,
        disableNotification = false,
    ): Promise<boolean> {
        return this.client.rest.request<boolean>('pinChatMessage', {
            body: {
                chat_id: chatId,
                message_id: messageId,
                disable_notification: disableNotification,
            },
        });
    }

    /** حذف سنجاق یک پیام */
    async unpinMessage(chatId: number | string, messageId: number): Promise<boolean> {
        return this.client.rest.request<boolean>('unpinChatMessage', {
            body: { chat_id: chatId, message_id: messageId },
        });
    }

    /** حذف سنجاق همهٔ پیام‌ها */
    async unpinAllMessages(chatId: number | string): Promise<boolean> {
        return this.client.rest.request<boolean>('unpinAllChatMessages', {
            body: { chat_id: chatId },
        });
    }

    /** ساخت لینک دعوت با محدودیت زمانی و تعداد اعضا */
    async createInviteLink(
        chatId: number | string,
        options?: InviteLinkOptions,
    ): Promise<{ invite_link: string }> {
        return this.client.rest.request<{ invite_link: string }>('createChatInviteLink', {
            body: {
                chat_id: chatId,
                ...options,
            },
        });
    }

    /** دریافت تعداد اعضای گروه */
    async getMemberCount(chatId: number | string): Promise<number> {
        return this.client.rest.request<number>('getChatMembersCount', {
            body: { chat_id: chatId },
        });
    }
}
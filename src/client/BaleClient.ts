// src/client/BaleClient.ts (موقت — در فاز ۳ کامل می‌شود)
import { ChatManager } from '../managers/ChatManager';
import { MessageManager } from '../managers/MessageManager';
import type { RESTManager } from '../rest/RESTManager';

export interface BaleClient {
    readonly rest: RESTManager;
    readonly messages: MessageManager;
    readonly chats: ChatManager;
}
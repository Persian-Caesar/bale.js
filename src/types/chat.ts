// src/types/chat.ts

export type ChatType = 'private' | 'group' | 'channel';

export interface Chat {
    id: number;
    type: ChatType;
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
}
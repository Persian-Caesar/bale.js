import type {
    FileInput,
    SendPhotoOptions,
    SendDocumentOptions,
    SendVideoOptions,
    SendAudioOptions,
    SendVoiceOptions,
    BaleFile,
    SendMediaBaseOptions,
} from '../types/media';
import type { BaleClient } from '../client/BaleClient';
import type { APIMessage } from '../types/message';
import { BaseManager } from './BaseManager';
import { Message } from '../structures/Message';

export class MediaManager extends BaseManager {
    constructor(client: BaleClient) {
        super(client);
    }

    sendPhoto(chatId: number | string, photo: FileInput, options?: SendPhotoOptions): Promise<Message> {
        return this.sendMedia('sendPhoto', 'photo', chatId, photo, options);
    }

    sendDocument(chatId: number | string, document: FileInput, options?: SendDocumentOptions): Promise<Message> {
        return this.sendMedia('sendDocument', 'document', chatId, document, options);
    }

    sendVideo(chatId: number | string, video: FileInput, options?: SendVideoOptions): Promise<Message> {
        return this.sendMedia('sendVideo', 'video', chatId, video, options);
    }

    sendAudio(chatId: number | string, audio: FileInput, options?: SendAudioOptions): Promise<Message> {
        return this.sendMedia('sendAudio', 'audio', chatId, audio, options);
    }

    sendVoice(chatId: number | string, voice: FileInput, options?: SendVoiceOptions): Promise<Message> {
        return this.sendMedia('sendVoice', 'voice', chatId, voice, options);
    }

    async downloadFile(fileId: string): Promise<Buffer> {
        const file = await this.client.rest.getFile(fileId);
        if (!file.file_path) {
            throw new Error('مسیر فایل (file_path) در پاسخ getFile وجود ندارد.');
        }
        return this.client.rest.downloadFile(file.file_path);
    }

    async getFileInfo(fileId: string): Promise<BaleFile> {
        return this.client.rest.getFile(fileId);
    }

    // ─── متد داخلی ────────────────────────────────────────────

    private async sendMedia(
        method: string,
        field: string,
        chatId: number | string,
        input: FileInput,
        options?: SendMediaBaseOptions,
    ): Promise<Message> {
        const cleanOptions = this.cleanOptions(options);

        // شاخهٔ Buffer — TS اینجا input را به Buffer narrow می‌کند
        if (Buffer.isBuffer(input)) {
            const data = await this.client.rest.request<APIMessage>(method, {
                body: {
                    chat_id: chatId,
                    ...cleanOptions,
                },
                files: {
                    [field]: {
                        data: input,               // ← Buffer ✅
                        filename: this.guessFilename(field),
                    },
                },
            });
            return new Message(this.client, data);
        }

        // شاخهٔ رشته/URL — TS اینجا input را به string | URL narrow می‌کند
        const value = input instanceof URL ? input.toString() : input;
        const data = await this.client.rest.request<APIMessage>(method, {
            body: {
                chat_id: chatId,
                [field]: value,                   // ← string ✅
                ...cleanOptions,
            },
        });
        return new Message(this.client, data);
    }

    private cleanOptions(options?: SendMediaBaseOptions): Record<string, unknown> {
        if (!options) return {};
        const cleaned: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(options)) {
            if (value !== undefined) cleaned[key] = value;
        }
        return cleaned;
    }

    private guessFilename(field: string): string {
        const map: Record<string, string> = {
            photo: 'photo.jpg',
            document: 'document',
            video: 'video.mp4',
            audio: 'audio.mp3',
            voice: 'voice.ogg',
        };
        return map[field] ?? 'file';
    }
}
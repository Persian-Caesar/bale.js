import { BaseBuilder } from './BaseBuilder';

export interface InvoicePayload {
    title: string;
    description: string;
    payload: string;
    provider_token: string;
    currency: string;
    prices: { label: string; amount: number }[];
    photo_url?: string;
    need_name?: boolean;
    need_phone_number?: boolean;
    need_email?: boolean;
    is_flexible?: boolean;
}

export class InvoiceBuilder extends BaseBuilder<InvoicePayload> {
    private payload: Partial<InvoicePayload> = {};

    setTitle(title: string): this {
        this.payload.title = title;
        return this;
    }

    setDescription(description: string): this {
        this.payload.description = description;
        return this;
    }

    setPayload(payload: string): this {
        this.payload.payload = payload;
        return this;
    }

    setProviderToken(token: string): this {
        this.payload.provider_token = token;
        return this;
    }

    setCurrency(currency: string): this {
        this.payload.currency = currency;
        return this;
    }

    addPrice(label: string, amount: number): this {
        if (!this.payload.prices) this.payload.prices = [];
        this.payload.prices.push({ label, amount });
        return this;
    }

    setPhotoUrl(url: string): this {
        this.payload.photo_url = url;
        return this;
    }

    requireName(): this {
        this.payload.need_name = true;
        return this;
    }

    requirePhone(): this {
        this.payload.need_phone_number = true;
        return this;
    }

    requireEmail(): this {
        this.payload.need_email = true;
        return this;
    }

    build(): InvoicePayload {
        if (!this.payload.title || !this.payload.description || !this.payload.payload) {
            throw new Error('عنوان، توضیحات و payload الزامی هستند.');
        }
        if (!this.payload.prices || this.payload.prices.length === 0) {
            throw new Error('حداقل یک آیتم قیمت لازم است.');
        }
        return this.payload as InvoicePayload;
    }
}
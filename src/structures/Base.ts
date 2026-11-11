// src/structures/Base.ts
import type { BaleClient } from '../client/BaleClient.js';

/**
 * کلاس پایه برای همهٔ ساختارهای bale.js.
 * هر ساختار ارجاعی به کلاینت اصلی دارد تا به REST و مدیران دسترسی داشته باشد.
 */
export abstract class Base {
    public readonly client: BaleClient;

    constructor(client: BaleClient) {
        this.client = client;
    }
}
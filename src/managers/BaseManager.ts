// src/managers/BaseManager.ts
import type { BaleClient } from '../client/BaleClient.js';

/**
 * کلاس پایه برای همهٔ مدیران.
 * هر مدیر به کلاینت اصلی دسترسی دارد تا از REST استفاده کند.
 */
export abstract class BaseManager {
    public readonly client: BaleClient;

    constructor(client: BaleClient) {
        this.client = client;
    }
}
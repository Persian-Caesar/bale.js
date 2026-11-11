// src/structures/User.ts
import { Base } from './Base.js';
import type { BaleClient } from '../client/BaleClient.js';
import type { APIUser } from '../types/user.js';

/**
 * نمایش یک کاربر (یا ربات) در بله.
 */
export class User extends Base {
    public readonly id: number;
    public readonly isBot: boolean;
    public readonly firstName: string;
    public readonly lastName?: string;
    public readonly username?: string;
    public readonly languageCode?: string;

    constructor(client: BaleClient, data: APIUser) {
        super(client);
        this.id = data.id;
        this.isBot = data.is_bot;
        this.firstName = data.first_name;
        this.lastName = data.last_name;
        this.username = data.username;
        this.languageCode = data.language_code;
    }

    /** نام کامل کاربر (نام + نام خانوادگی) */
    get fullName(): string {
        return this.lastName ? `${this.firstName} ${this.lastName}` : this.firstName;
    }

    /** منشن کاربر به صورت رشتهٔ متنی */
    toString(): string {
        return this.username ? `@${this.username}` : this.fullName;
    }
}
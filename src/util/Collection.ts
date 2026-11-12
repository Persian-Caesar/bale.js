// src/util/Collection.ts
/**
 * یک Map توسعه‌یافته با متدهای کمکی، مشابه Collection در discord.js.
 */
export class Collection<K, V> extends Map<K, V> {
    /**
     * آرایه‌ای از مقادیر موجود در Collection.
     */
    toArray(): V[] {
        return [...this.values()];
    }

    /**
     * آرایه‌ای از کلیدهای موجود در Collection.
     */
    toKeyArray(): K[] {
        return [...this.keys()];
    }

    /**
     * اولین مقدار موجود (یا undefined).
     */
    first(): V | undefined {
        return this.values().next().value;
    }

    /**
     * آخرین مقدار موجود (یا undefined).
     */
    last(): V | undefined {
        const values = this.toArray();
        return values[values.length - 1];
    }

    /**
     * فیلتر کردن Collection و بازگشت یک Collection جدید.
     */
    filter(fn: (value: V, key: K) => boolean): Collection<K, V> {
        const result = new Collection<K, V>();
        for (const [key, value] of this) {
            if (fn(value, key)) result.set(key, value);
        }
        return result;
    }

    /**
     * نگاشت مقادیر به آرایه‌ای از نتایج.
     */
    map<T>(fn: (value: V, key: K) => T): T[] {
        const result: T[] = [];
        for (const [key, value] of this) {
            result.push(fn(value, key));
        }
        return result;
    }
}
import { describe, it, expect } from 'vitest';
import { Collection } from '../src/util/Collection.js';

describe('Collection', () => {
    it('stores and retrieves values', () => {
        const col = new Collection<string, number>();
        col.set('a', 1);
        col.set('b', 2);
        expect(col.get('a')).toBe(1);
        expect(col.size).toBe(2);
    });

    it('returns first and last values', () => {
        const col = new Collection<string, number>([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ]);
        expect(col.first()).toBe(1);
        expect(col.last()).toBe(3);
    });

    it('filters values', () => {
        const col = new Collection<string, number>([
            ['a', 1],
            ['b', 2],
            ['c', 3],
        ]);
        const filtered = col.filter((v) => v > 1);
        expect(filtered.toArray()).toEqual([2, 3]);
    });
});
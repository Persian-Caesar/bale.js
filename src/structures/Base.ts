// src/structures/Base.ts
import { BaleClient } from '../client/BaleClient';

export abstract class Base {
    constructor(public client: BaleClient) { }
}
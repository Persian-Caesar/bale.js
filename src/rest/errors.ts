// src/rest/errors.ts
import type { ResponseParameters } from '../types/api.js';

export class BaleAPIError extends Error {
    public readonly code: number;
    public readonly parameters?: ResponseParameters;

    constructor(code: number, message: string, parameters?: ResponseParameters) {
        super(message);
        this.name = 'BaleAPIError';
        this.code = code;
        this.parameters = parameters;
    }
}
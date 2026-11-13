import type { ResponseParameters } from '../types/api';

/** Base class for errors raised while communicating with Bale. */
export class BaleAPIError extends Error {
    public readonly code: number;
    public readonly parameters?: ResponseParameters;

    constructor(code: number, message: string, parameters?: ResponseParameters, options?: ErrorOptions) {
        super(message, options);
        this.name = 'BaleAPIError';
        this.code = code;
        this.parameters = parameters;
    }
}

/** The HTTP server returned a non-success status with no usable Bale API error. */
export class BaleHTTPError extends Error {
    public readonly statusCode: number;
    public readonly responseBody: string;

    constructor(statusCode: number, responseBody: string) {
        super(`Bale API returned HTTP ${statusCode}${responseBody ? `: ${responseBody.slice(0, 300)}` : ''}`);
        this.name = 'BaleHTTPError';
        this.statusCode = statusCode;
        this.responseBody = responseBody;
    }
}

/** The response body was not a valid Bale API JSON response. */
export class BaleInvalidResponseError extends Error {
    public readonly statusCode: number;

    constructor(statusCode: number, message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'BaleInvalidResponseError';
        this.statusCode = statusCode;
    }
}

/** A request exceeded the configured timeout. */
export class BaleTimeoutError extends Error {
    public readonly timeoutMs: number;

    constructor(timeoutMs: number, options?: ErrorOptions) {
        super(`Bale API request timed out after ${timeoutMs}ms`, options);
        this.name = 'BaleTimeoutError';
        this.timeoutMs = timeoutMs;
    }
}

/** A network-level failure occurred before a valid API response was received. */
export class BaleNetworkError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'BaleNetworkError';
    }
}

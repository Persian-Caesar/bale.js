import { appendFile, mkdir, rename, rm, stat } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogData = Record<string, unknown>;

export interface LogRecord {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: string;
    data?: LogData;
}

export interface LogTransport {
    log(record: Readonly<LogRecord>): void | Promise<void>;
}

export interface LoggerOptions {
    /** Minimum level emitted. Defaults to `info`. */
    level?: LogLevel;
    /** Custom output transports. Defaults to the built-in console transport. */
    transports?: LogTransport[];
    /** Context attached to every record. */
    context?: string;
    /** Additional property names to redact. */
    redactKeys?: string[];
    /** Disable built-in secret and credential redaction only for controlled tests. */
    redact?: boolean;
}

const LEVELS: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const SECRET_KEY = /(token|authorization|cookie|password|secret|api[_-]?key)/i;
const DEFAULT_REDACTED_KEYS = ['token', 'authorization', 'cookie', 'password', 'secret', 'api_key', 'apikey'];
const REDACTED = '[REDACTED]';

/** A small structured logger with pluggable transports and credential redaction. */
export class Logger {
    private readonly minimumLevel: LogLevel;
    private readonly transports: LogTransport[];
    private readonly context?: string;
    private readonly redactKeys: Set<string>;
    private readonly shouldRedact: boolean;
    private readonly secrets = new Set<string>();

    constructor(options: LoggerOptions = {}) {
        this.minimumLevel = options.level ?? 'info';
        if (!(this.minimumLevel in LEVELS)) throw new TypeError(`Invalid log level: ${this.minimumLevel}`);
        this.transports = options.transports?.length ? [...options.transports] : [new ConsoleTransport()];
        this.context = options.context;
        this.redactKeys = new Set([...DEFAULT_REDACTED_KEYS, ...(options.redactKeys ?? [])].map((key) => key.toLowerCase()));
        this.shouldRedact = options.redact !== false;
    }

    debug(message: string, data?: LogData): void { this.write('debug', message, data); }
    info(message: string, data?: LogData): void { this.write('info', message, data); }
    warn(message: string, data?: LogData): void { this.write('warn', message, data); }
    error(message: string, data?: LogData): void { this.write('error', message, data); }

    /** Registers a literal secret so it is masked even if it appears inside an error message. */
    addSecret(secret: string): void {
        if (secret) this.secrets.add(secret);
    }

    /** Creates a child logger that inherits transports and redaction settings. */
    child(context: string): Logger {
        const child = new Logger({
            level: this.minimumLevel,
            transports: this.transports,
            context: this.context ? `${this.context}:${context}` : context,
            redactKeys: [...this.redactKeys],
            redact: this.shouldRedact,
        });
        for (const secret of this.secrets) child.addSecret(secret);
        return child;
    }

    private write(level: LogLevel, message: string, data?: LogData): void {
        if (LEVELS[level] < LEVELS[this.minimumLevel]) return;
        const safeData = data && this.shouldRedact ? redactValue(data, this.redactKeys, this.secrets) as LogData : data;
        const record: LogRecord = {
            timestamp: new Date().toISOString(),
            level,
            message: redactText(message, this.secrets, this.shouldRedact),
            ...(this.context ? { context: this.context } : {}),
            ...(safeData ? { data: safeData } : {}),
        };
        for (const transport of this.transports) {
            try {
                const result = transport.log(record);
                if (result && typeof (result as Promise<void>).catch === 'function') {
                    void (result as Promise<void>).catch((error: unknown) => {
                        process.emitWarning(`Logger transport failed: ${errorMessage(error)}`, { type: 'BaleLoggerWarning' });
                    });
                }
            } catch (error) {
                process.emitWarning(`Logger transport failed: ${errorMessage(error)}`, { type: 'BaleLoggerWarning' });
            }
        }
    }
}

/** Writes one-line JSON records to the appropriate process console stream. */
export class ConsoleTransport implements LogTransport {
    log(record: Readonly<LogRecord>): void {
        const line = JSON.stringify(record);
        if (record.level === 'error') console.error(line);
        else if (record.level === 'warn') console.warn(line);
        else if (record.level === 'debug') console.debug(line);
        else console.info(line);
    }
}

/** Appends JSONL records to disk and keeps one rotated `.1` backup when the size limit is reached. */
export class FileTransport implements LogTransport {
    private queue: Promise<void> = Promise.resolve();
    private readonly maxBytes: number;

    constructor(private readonly filePath: string, options: { maxBytes?: number } = {}) {
        if (!filePath.trim()) throw new TypeError('Log file path must not be empty.');
        this.maxBytes = options.maxBytes ?? 10 * 1024 * 1024;
        if (!Number.isSafeInteger(this.maxBytes) || this.maxBytes <= 0) {
            throw new RangeError('File log maxBytes must be a positive safe integer.');
        }
    }

    log(record: Readonly<LogRecord>): Promise<void> {
        const line = `${JSON.stringify(record)}\n`;
        this.queue = this.queue.catch(() => undefined).then(async () => {
            await mkdir(dirname(this.filePath), { recursive: true });
            let currentSize = 0;
            try {
                currentSize = (await stat(this.filePath)).size;
            } catch (error) {
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
            }
            if (currentSize > 0 && currentSize + Buffer.byteLength(line) > this.maxBytes) {
                try {
                    await rm(`${this.filePath}.1`, { force: true });
                    await rename(this.filePath, `${this.filePath}.1`);
                } catch (error) {
                    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
                }
            }
            await appendFile(this.filePath, line, 'utf8');
        });
        return this.queue;
    }

    /** Waits for all queued writes to finish. */
    async flush(): Promise<void> {
        await this.queue;
    }
}

/** Generates an opaque correlation ID suitable for associating related log records. */
export function createRequestId(): string {
    return randomUUID();
}


function redactText(value: string, secrets: Set<string>, enabled: boolean): string {
    if (!enabled) return value;
    let safe = value;
    for (const secret of secrets) safe = safe.split(secret).join(REDACTED);
    return safe;
}

function redactValue(value: unknown, keys: Set<string>, secrets: Set<string>, depth = 0): unknown {
    if (depth > 8 || value === null || value === undefined) return value;
    if (Array.isArray(value)) return value.map((item) => redactValue(item, keys, secrets, depth + 1));
    if (typeof value === 'string') {
        let safe = value;
        for (const secret of secrets) safe = safe.split(secret).join(REDACTED);
        return safe;
    }
    if (typeof value !== 'object') return value;
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        const normalized = key.toLowerCase();
        result[key] = keys.has(normalized) || SECRET_KEY.test(key)
            ? REDACTED
            : redactValue(item, keys, secrets, depth + 1);
    }
    return result;
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}

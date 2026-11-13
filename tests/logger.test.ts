import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { FileTransport, Logger, type LogRecord, type LogTransport } from '../src/util/Logger';

class MemoryTransport implements LogTransport {
    records: LogRecord[] = [];
    log(record: Readonly<LogRecord>): void { this.records.push(record as LogRecord); }
}

describe('Logger', () => {
    it('writes structured records to a custom transport', () => {
        const transport = new MemoryTransport();
        const logger = new Logger({ level: 'debug', transports: [transport], context: 'test' });
        logger.info('hello', { attempt: 2 });
        expect(transport.records).toHaveLength(1);
        expect(transport.records[0]).toMatchObject({ level: 'info', message: 'hello', context: 'test', data: { attempt: 2 } });
        expect(Number.isNaN(Date.parse(transport.records[0].timestamp))).toBe(false);
    });

    it('redacts sensitive keys recursively', () => {
        const transport = new MemoryTransport();
        const logger = new Logger({ transports: [transport] });
        logger.addSecret('BOT_SECRET');
        logger.info('credentials BOT_SECRET', { token: 'abc', nested: { authorization: 'Bearer x BOT_SECRET', safe: 'visible' } });
        expect(transport.records[0].message).toBe('credentials [REDACTED]');
        expect(transport.records[0].data).toEqual({ token: '[REDACTED]', nested: { authorization: '[REDACTED]', safe: 'visible' } });
    });

    it('filters records below configured level', () => {
        const transport = new MemoryTransport();
        const logger = new Logger({ level: 'warn', transports: [transport] });
        logger.debug('debug');
        logger.info('info');
        logger.warn('warn');
        expect(transport.records.map((record) => record.level)).toEqual(['warn']);
    });

    it('supports child contexts', () => {
        const transport = new MemoryTransport();
        new Logger({ transports: [transport], context: 'app' }).child('polling').debug('tick');
        expect(transport.records[0].context).toBe('app:polling');
    });

    it('writes JSONL records through FileTransport', async () => {
        const directory = await mkdtemp(join(tmpdir(), 'bale-logger-'));
        const filePath = join(directory, 'logs', 'app.jsonl');
        try {
            const transport = new FileTransport(filePath);
            await transport.log({ timestamp: '2026-01-01T00:00:00.000Z', level: 'info', message: 'saved' });
            await transport.flush();
            const content = await readFile(filePath, 'utf8');
            expect(JSON.parse(content)).toMatchObject({ level: 'info', message: 'saved' });
        } finally {
            await rm(directory, { recursive: true, force: true });
        }
    });

    it('does not throw when a transport throws', () => {
        const warning = vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
        const logger = new Logger({ transports: [{ log: () => { throw new Error('disk unavailable'); } }] });
        expect(() => logger.error('test')).not.toThrow();
        expect(warning).toHaveBeenCalled();
        warning.mockRestore();
    });
});

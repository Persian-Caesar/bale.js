import { EventEmitter } from 'events';

/**
 * EventEmitter تایپ‌دار.
 * مثال: class Client extends TypedEmitter<ClientEvents> { ... }
 */
export class TypedEmitter<Events extends Record<string, any[]>> extends EventEmitter {
    constructor() {
        super({ captureRejections: true });
        // Avoid Node's fatal unhandled-'error' behavior when consumers have not
        // registered an error listener yet. A user listener suppresses this warning.
        super.on('error', (error: unknown) => {
            if (this.listenerCount('error') === 1) {
                process.emitWarning(error instanceof Error ? error : String(error), { type: 'BaleClientWarning' });
            }
        });
    }
    public on<K extends keyof Events & string>(
        event: K,
        listener: (...args: Events[K]) => void,
    ): this {
        return super.on(event, listener);
    }

    public once<K extends keyof Events & string>(
        event: K,
        listener: (...args: Events[K]) => void,
    ): this {
        return super.once(event, listener);
    }

    public off<K extends keyof Events & string>(
        event: K,
        listener: (...args: Events[K]) => void,
    ): this {
        return super.off(event, listener);
    }

    public emit<K extends keyof Events & string>(
        event: K,
        ...args: Events[K]
    ): boolean {
        return super.emit(event, ...args);
    }

    public removeAllListeners<K extends keyof Events & string>(event?: K): this {
        return super.removeAllListeners(event);
    }
}

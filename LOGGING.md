# Logging & Debugging (Phase 2)

`bale.js` now exposes a structured logger through `client.logger` and exports `Logger`, `ConsoleTransport`, and `FileTransport`.

## Quick start

```ts
import { BaleClient, FileTransport } from '@persian-caesar/bale.js';

const file = new FileTransport('./logs/bale.jsonl', { maxBytes: 5 * 1024 * 1024 });
const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [file], // ConsoleTransport is the default when transports is omitted.
  },
});

client.on('error', (error) => {
  client.logger.error('Application received an error event.', {
    error: error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : String(error),
  });
});

await client.login();
```

## Levels

| Level | Intended use |
|---|---|
| `debug` | Update dispatch, request completion, detailed diagnostics |
| `info` | Login, ready, polling/webhook lifecycle |
| `warn` | Rate limits, rejected webhook requests, recoverable conditions |
| `error` | REST failures, polling failures, webhook handler failures |

The default level is `info`. Set `level: 'debug'` to see successful REST request details.

## Transports

- `ConsoleTransport`: one JSON record per line, routed to the matching console method.
- `FileTransport`: JSON Lines file output; creates parent directories and rotates the current file to `<path>.1` when the configured size would be exceeded. Call `await file.flush()` during graceful shutdown if you need to wait for pending writes.
- Custom transports: implement `LogTransport.log(record)`. It may be synchronous or return a Promise. Transport failures are surfaced as Node process warnings and do not crash the bot.

Example custom transport:

```ts
import type { LogTransport, LogRecord } from '@persian-caesar/bale.js';

const transport: LogTransport = {
  log(record: Readonly<LogRecord>) {
    // Send the record to your monitoring service.
  },
};
```

## Redaction and privacy

Sensitive object keys such as `token`, `authorization`, `cookie`, `password`, `secret`, and `api_key` are masked recursively. The bot token is also registered as a literal secret, so it is masked if it appears inside a logged string. Add application-specific names with `redactKeys`:

```ts
logger: {
  redactKeys: ['email', 'phone', 'private_key'],
}
```

Avoid logging complete message bodies, user content, payment payloads, or personally identifiable data. The library deliberately does not log request bodies or webhook payloads.

## Correlation

REST calls include a generated `requestId` in their log records. It can be used to associate a request's start, response, retry, and failure records. `createRequestId()` is exported for application-level correlation IDs.

## Current scope and limitations

- Built-in file transport retains one rotated backup (`.1`), not an unlimited archive or compression policy.
- No external monitoring/Sentry integration is bundled; connect one through a custom transport.
- There is no automatic redaction of arbitrary secrets embedded in a stack trace unless the exact bot token or a sensitive-key property is present. Keep application logs privacy-conscious.
- Successful REST diagnostics are `debug` level to avoid noisy production logs.

# Core Stability — Phase 1

This patch hardens the HTTP transport, long polling, webhook receiver, and client lifecycle.

## Changes

### REST layer

- Added configurable request timeout (`rest.timeoutMs`, default 15 seconds).
- Added typed transport errors: `BaleHTTPError`, `BaleInvalidResponseError`, `BaleNetworkError`, and `BaleTimeoutError`.
- Validates API method names and the shape of successful API responses.
- Reads response bodies once as text, then parses JSON with a typed failure path.
- Retries HTTP/API 429 responses only, respecting `parameters.retry_after` and a bounded delay. Other POST requests are deliberately not retried automatically because retrying a mutation after an ambiguous network failure can duplicate its side effect.
- Supports caller `AbortSignal` and per-request timeout overrides.
- Adds download timeout, HTTP status validation, path validation, and a configurable 50 MiB default download cap.
- Adds `rest.retries`, `rest.maxRetryAfterMs`, and `rest.maxDownloadBytes`.

### Polling

- Validates polling timeout/limit values.
- Aborts the in-flight `getUpdates` request on stop and waits for the loop to finish.
- Disables nested REST retries so the polling loop owns retry timing.
- Advances the offset only after synchronous dispatch succeeds.
- Uses bounded error backoff and reports failures through the client's `error` event (or Node warning fallback).

### Webhook

- Starts the local listener before registering the remote webhook; closes the listener if registration fails.
- Requires HTTPS for the public webhook URL.
- Validates method, path, JSON content type, update shape, and request body size (1 MiB default).
- Supports optional `secretToken` validation using a timing-safe comparison of `x-bale-secret-token`.
- Closes the local server before unregistering the webhook.

**Important:** Bale's `setWebhook` method in this snapshot accepts only the URL. The optional `secretToken` is therefore a local shared-secret check; a reverse proxy or gateway must inject the `x-bale-secret-token` header. It is not claimed to be a native Bale webhook feature.

### Client and events

- Rejects an empty bot token.
- Makes `login()` idempotent while the client is running and resets state on startup failure.
- `destroy()` now waits for polling shutdown and resets client readiness.
- Dispatches `pre_checkout_query` as `preCheckoutQuery`.
- Enables EventEmitter rejection capture and prevents an unhandled `error` event from crashing a process before the application registers its own listener.

## Configuration example

```ts
const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  mode: 'polling',
  rest: {
    timeoutMs: 15_000,
    retries: 2,
    maxRetryAfterMs: 60_000,
    maxDownloadBytes: 50 * 1024 * 1024,
  },
  polling: {
    timeout: 30,
    limit: 100,
    errorRetryDelayMs: 2_000,
  },
});

client.on('error', (error) => {
  console.error('[bale.js]', error);
});

await client.login();
```

For webhook mode, configure `webhook.url` as a public HTTPS URL and, if the deployment has a reverse proxy capable of adding a private header, configure `webhook.secretToken` and make that proxy set `x-bale-secret-token` on forwarded requests.

## Validation status

The source snapshot did not include an installed `node_modules` directory. `tsc --noEmit` was attempted, but validation stopped before compiling project files because `@types/node` is not installed in the snapshot environment. Vitest has therefore not been executed here. Run the commands below in the actual repository after installing dependencies:

```bash
npm ci
npm run lint
npm run build
npm test
```

The test suite in `tests/rest.test.ts` was expanded to cover successful responses, API errors, 429 retry, malformed JSON, HTTP failures, network failures, invalid method names, and unsafe download paths.

## Known follow-up items (not silently claimed as solved)

- Validate Bale-specific webhook secret/header support against the official API before advertising native secret-token support.
- Confirm the exact Bale API limits for `getUpdates.timeout` and `limit` against current official documentation.
- Add end-to-end tests against a local HTTP mock server for webhook request lifecycle and real multipart uploads.
- Add a persistent logger/diagnostic interface in Phase 2; this phase uses typed errors and Node warnings, not a full logging subsystem.
- Review update acknowledgement semantics with Bale's actual long-polling behavior. This patch avoids advancing offset before dispatch, but delivery guarantees depend on server-side API semantics.

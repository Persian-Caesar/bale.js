# bale.js Documentation

> A powerful, discord.js-like library for building Bale messenger bots with TypeScript.

**Version:** 0.1.0 · **Node.js:** ≥ 18 · **License:** MIT

This document is the complete reference for `bale.js`. It covers installation, client setup, every manager and builder, media handling, group administration, payments, web apps, error handling, and deployment.

---

## Table of Contents

- [bale.js Documentation](#balejs-documentation)
  - [Table of Contents](#table-of-contents)
  - [1. Installation](#1-installation)
  - [2. Quick Start](#2-quick-start)
  - [3. Client Configuration](#3-client-configuration)
    - [Polling Mode](#polling-mode)
    - [Webhook Mode](#webhook-mode)
  - [4. Events](#4-events)
  - [5. Structures](#5-structures)
    - [User](#user)
    - [Chat](#chat)
    - [Message](#message)
    - [CallbackQuery](#callbackquery)
  - [6. Managers](#6-managers)
    - [MessageManager](#messagemanager)
    - [ChatManager](#chatmanager)
    - [MediaManager](#mediamanager)
    - [GroupManager](#groupmanager)
    - [PaymentManager](#paymentmanager)
  - [7. Builders](#7-builders)
    - [InlineKeyboardBuilder](#inlinekeyboardbuilder)
    - [ReplyKeyboardBuilder](#replykeyboardbuilder)
    - [MessageBuilder](#messagebuilder)
    - [InvoiceBuilder](#invoicebuilder)
  - [8. Media \& File Handling](#8-media--file-handling)
  - [9. Group Administration](#9-group-administration)
  - [10. Payments \& Invoices](#10-payments--invoices)
  - [11. Web Apps (Mini Apps)](#11-web-apps-mini-apps)
  - [12. Error Handling](#12-error-handling)
  - [13. TypeScript Types](#13-typescript-types)
  - [14. Utility: Collection](#14-utility-collection)
  - [15. Deployment \& GitHub Pages](#15-deployment--github-pages)
  - [16. FAQ](#16-faq)
  - [License](#license)

---

## 1. Installation

```bash
npm install bale.js
```

**Requirements:**
- Node.js **18** or later (Node 20 LTS recommended)
- npm **9** or later

The library is written in TypeScript and ships with full type definitions (`dist/index.d.ts`). It works in both CommonJS and ESM projects.

---

## 2. Quick Start

```typescript
import { BaleClient, InlineKeyboardBuilder } from '@persian-caesar/bale.js';

const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  mode: 'polling',
});

client.on('ready', (me) => {
  console.log(`Logged in as @${me.username}`);
});

client.on('messageCreate', async (message) => {
  if (message.text === '/start') {
    const keyboard = new InlineKeyboardBuilder()
      .addButton('Click me', { callback_data: 'clicked', color: 'primary' })
      .build();

    await message.reply('Welcome to bale.js!', { reply_markup: keyboard });
  }
});

client.on('callbackQuery', async (query) => {
  await query.answer('Button clicked!', true);
});

client.login();
```

---

## 3. Client Configuration

The `BaleClient` constructor accepts a single options object:

```typescript
interface BaleClientOptions {
  token: string;
  mode?: 'polling' | 'webhook';
  polling?: { timeout?: number; limit?: number };
  webhook?: { url: string; port?: number; path?: string };
}
```

### Polling Mode

Long polling is the simplest way to get started. The client continuously calls `getUpdates` and dispatches events.

```typescript
const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  mode: 'polling',
  polling: {
    timeout: 30, // seconds
    limit: 100,  // max updates per request
  },
});
```

**Important:** Bale only retains the last **2,000 updates for 24 hours**. If your bot is offline longer than that, messages are lost. Polling and webhooks are mutually exclusive — if a webhook is set, `getUpdates` returns nothing.

### Webhook Mode

Webhook mode registers a public URL with Bale and starts a local HTTP server to receive updates.

```typescript
const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  mode: 'webhook',
  webhook: {
    url: 'https://yourdomain.com/bale/webhook',
    port: 3000,
    path: '/bale/webhook',
  },
});
```

**Note on ports:** Bale accepts webhooks only on a limited set of ports. If your server sits behind a reverse proxy (Nginx, Caddy), run the local HTTP server on any port and expose it publicly on an allowed port (e.g., 443).

To stop the client and remove the webhook:

```typescript
await client.destroy();
```

---

## 4. Events

`BaleClient` extends `EventEmitter`. Listen to events with `client.on(event, handler)`.

| Event           | Payload                               | Description                                 |
| :-------------- | :------------------------------------ | :------------------------------------------ |
| `ready`         | `APIUser`                             | Bot information after `login()` succeeds    |
| `messageCreate` | `Message`                             | A new message was received                  |
| `messageEdit`   | `Message`                             | A message was edited                        |
| `callbackQuery` | `CallbackQuery`                       | An inline button was clicked                |
| `webAppData`    | `{ from, data, buttonText, message }` | Data returned from a mini app               |
| `error`         | `unknown`                             | Any unhandled error (API, network, parsing) |

**Example:**

```typescript
client.on('error', (err) => {
  console.error('[bale.js]', err);
});
```

---

## 5. Structures

Structures are read-only wrappers around raw API data. They expose convenience getters and methods that delegate to managers.

### User

```typescript
class User {
  readonly id: number;
  readonly isBot: boolean;
  readonly firstName: string;
  readonly lastName?: string;
  readonly username?: string;
  readonly languageCode?: string;

  get fullName(): string;
  toString(): string; // @username or full name
}
```

### Chat

```typescript
class Chat {
  readonly id: number;
  readonly type: 'private' | 'group' | 'channel';
  readonly title?: string;
  readonly username?: string;

  get isPrivate(): boolean;
  get isGroup(): boolean;
  get isChannel(): boolean;

  send(text: string, options?): Promise<Message>;
}
```

### Message

```typescript
class Message {
  readonly id: number;
  readonly chat: Chat;
  readonly from?: User;
  readonly text?: string;
  readonly caption?: string;
  readonly date: Date;
  readonly replyMarkup?: InlineKeyboardMarkup;
  readonly replyToMessage?: Message;

  reply(text: string, options?): Promise<Message>;
  edit(text: string): Promise<Message>;
  delete(): Promise<void>;

  get hasText(): boolean;
  get hasCaption(): boolean;
}
```

### CallbackQuery

```typescript
class CallbackQuery {
  readonly id: string;
  readonly from: User;
  readonly message?: Message;
  readonly data?: string;

  answer(text?: string, showAlert?: boolean): Promise<boolean>;
  editMessage(text: string): Promise<Message>;
}
```

---

## 6. Managers

Managers are available as properties on `BaleClient`.

### MessageManager

Accessed via `client.messages`.

| Method                            | Description                                                                               |
| :-------------------------------- | :---------------------------------------------------------------------------------------- |
| `send(chatId, content, options?)` | Send a text message. `content` can be a string or a `BuiltMessage` from `MessageBuilder`. |
| `edit(chatId, messageId, text)`   | Edit a sent message.                                                                      |
| `delete(chatId, messageId)`       | Delete a message.                                                                         |

```typescript
await client.messages.send(chatId, 'Hello!', {
  reply_markup: keyboard,
  reply_to_message_id: someMessageId,
});
```

### ChatManager

Accessed via `client.chats`.

| Method          | Description             |
| :-------------- | :---------------------- |
| `fetch(chatId)` | Fetch chat information. |

```typescript
const chat = await client.chats.fetch(chatId);
console.log(chat.title);
```

### MediaManager

Accessed via `client.media`.

| Method                                  | Description                                   |
| :-------------------------------------- | :-------------------------------------------- |
| `sendPhoto(chatId, input, options?)`    | Send a photo.                                 |
| `sendDocument(chatId, input, options?)` | Send a document.                              |
| `sendVideo(chatId, input, options?)`    | Send a video.                                 |
| `sendAudio(chatId, input, options?)`    | Send an audio file.                           |
| `sendVoice(chatId, input, options?)`    | Send a voice message.                         |
| `downloadFile(fileId)`                  | Download a file as `Buffer`.                  |
| `getFileInfo(fileId)`                   | Get file metadata (`file_path`, `file_size`). |

`input` can be a `file_id` string, an HTTP URL, or a `Buffer`/`Uint8Array`. See [Media & File Handling](#8-media--file-handling).

### GroupManager

Accessed via `client.groups`.

| Method                                                | Description               |
| :---------------------------------------------------- | :------------------------ |
| `promote(chatId, userId, options)`                    | Promote a user to admin.  |
| `ban(chatId, userId)`                                 | Ban a user.               |
| `unban(chatId, userId)`                               | Unban a user.             |
| `pinMessage(chatId, messageId, disableNotification?)` | Pin a message.            |
| `unpinMessage(chatId, messageId)`                     | Unpin a specific message. |
| `unpinAllMessages(chatId)`                            | Unpin all messages.       |
| `createInviteLink(chatId, options?)`                  | Create an invite link.    |
| `getMemberCount(chatId)`                              | Get member count.         |

### PaymentManager

Accessed via `client.payments`.

| Method                                                     | Description                             |
| :--------------------------------------------------------- | :-------------------------------------- |
| `sendInvoice(chatId, invoice, options?)`                   | Send an invoice.                        |
| `answerPreCheckout(preCheckoutQueryId, ok, errorMessage?)` | Approve or reject a pre-checkout query. |

---

## 7. Builders

Builders provide a fluent API for constructing complex payloads.

### InlineKeyboardBuilder

```typescript
const keyboard = new InlineKeyboardBuilder()
  .addButton('Products', { callback_data: 'products' })
  .addButton('Cart', { callback_data: 'cart' })
  .addButton('Visit site', { url: 'https://example.com', color: 'primary' })
  .adjust(2, 1) // 2 buttons in row 1, 1 button in row 2
  .build();
```

`addButton` accepts `url`, `callback_data`, `web_app`, and `color` (`'primary' | 'success' | 'danger'`).

### ReplyKeyboardBuilder

```typescript
const menu = new ReplyKeyboardBuilder()
  .addButton('Share contact', { request_contact: true })
  .addButton('Terms')
  .addButton('Help')
  .adjust(1, 2)
  .setOptions({ resize_keyboard: true, one_time_keyboard: true })
  .build();
```

### MessageBuilder

```typescript
const message = new MessageBuilder()
  .setText('Are you sure?')
  .setKeyboard(inlineKeyboard)
  .build();

await client.messages.send(chatId, message);
```

### InvoiceBuilder

```typescript
const invoice = new InvoiceBuilder()
  .setTitle('Premium subscription')
  .setDescription('One month of premium access')
  .setPayload('sub_1month')
  .setProviderToken('YOUR_PROVIDER_TOKEN')
  .setCurrency('IRR')
  .addPrice('Monthly plan', 50000)
  .requireName()
  .build();
```

---

## 8. Media & File Handling

`MediaManager` automatically detects the input type:

| Input                   | Detection | Transport             |
| :---------------------- | :-------- | :-------------------- |
| `"AgACAgIAAxkBAAI..."`  | `file_id` | JSON                  |
| `"https://..."`         | URL       | JSON                  |
| `Buffer` / `Uint8Array` | Buffer    | `multipart/form-data` |

**Sending a document from disk:**

```typescript
import { readFile } from 'node:fs/promises';

const buffer = await readFile('./report.pdf');
await client.media.sendDocument(chatId, buffer, {
  caption: 'Annual report',
});
```

**Downloading a received file:**

```typescript
client.on('messageCreate', async (message) => {
  if (message.document) {
    const buffer = await client.media.downloadFile(message.document.file_id);
    await writeFile('./downloads/file.pdf', buffer);
  }
});
```

---

## 9. Group Administration

```typescript
// Promote a user
await client.groups.promote(chatId, userId, {
  can_delete_messages: true,
  can_invite_users: true,
  can_pin_messages: true,
});

// Ban and unban
await client.groups.ban(chatId, userId);
await client.groups.unban(chatId, userId);

// Invite link with limits
const { invite_link } = await client.groups.createInviteLink(chatId, {
  member_limit: 50,
  expire_date: Math.floor(Date.now() / 1000) + 86400,
});
```

---

## 10. Payments & Invoices

**Sending an invoice:**

```typescript
const invoice = new InvoiceBuilder()
  .setTitle('Premium')
  .setDescription('One-month subscription')
  .setPayload('premium_1m')
  .setProviderToken(process.env.PROVIDER_TOKEN!)
  .setCurrency('IRR')
  .addPrice('Subscription', 100000)
  .requireEmail()
  .build();

await client.payments.sendInvoice(chatId, invoice);
```

**Handling pre-checkout queries:**

```typescript
client.on('preCheckoutQuery', async (query) => {
  // Validate the order, then approve
  await client.payments.answerPreCheckout(query.id, true);
});
```

> **Note:** The `preCheckoutQuery` event is available on `BaleClient` (the `Update` type includes `pre_checkout_query`).

---

## 11. Web Apps (Mini Apps)

Add a mini-app button to an inline keyboard:

```typescript
const keyboard = new InlineKeyboardBuilder()
  .addButton('Open shop', { web_app: { url: 'https://shop.example.com' } })
  .build();
```

When the user finishes interacting with the mini app, Bale sends a message with `web_app_data`. Listen for it:

```typescript
client.on('webAppData', (payload) => {
  console.log('Data from mini app:', payload.data);
  console.log('Button text:', payload.buttonText);
});
```

---

## 12. Error Handling

All API errors are thrown as `BaleAPIError`:

```typescript
import { BaleAPIError } from '@persian-caesar/bale.js';

try {
  await client.messages.send(chatId, 'Hello');
} catch (err) {
  if (err instanceof BaleAPIError) {
    console.error('API error:', err.code, err.message);
    if (err.code === 429) {
      const retryAfter = err.parameters?.retry_after ?? 1;
      // retry after `retryAfter` seconds
    }
  } else {
    // network or parsing error
  }
}
```

The `PollingManager` automatically handles `429 Too Many Requests` by respecting `retry_after`.

---

## 13. TypeScript Types

All API types are exported from the package root:

```typescript
import type {
  User,
  Chat,
  Message,
  Update,
  CallbackQuery,
  InlineKeyboardMarkup,
  InlineKeyboardButton,
  ReplyKeyboardMarkup,
  InvoicePayload,
  BaleFile,
} from '@persian-caesar/bale.js';
```

The project uses `strict` mode, `noUncheckedIndexedAccess`, and `noImplicitOverride`. If you extend the library, follow the same settings.

---

## 14. Utility: Collection

A lightweight `Map` subclass inspired by discord.js:

```typescript
import { Collection } from '@persian-caesar/bale.js';

const cache = new Collection<number, string>();
cache.set(1, 'Hello');
cache.first(); // 'Hello'
cache.filter((v) => v.startsWith('H')); // Collection
```

---

## 15. Deployment & GitHub Pages

This documentation is published via **GitHub Pages** at:

**https://Persian-Caesar.github.io/bale.js**

To update it:

1. Edit `docs/README.md` (this file) in the repository.
2. Commit and push to the `main` branch.
3. In **Settings → Pages**, ensure the source is set to **Deploy from a branch** → `main` → `/docs`.
4. GitHub will rebuild the site automatically.

For a richer experience, you can serve the `docs/` folder with **Docsify** or **Nextra** (both work with plain Markdown). The full API reference generated by **TypeDoc** lives in `docs/api/` after running `npm run docs` — you can publish it alongside this guide.

---

## 16. FAQ

**Q: Does `bale.js` work with both polling and webhooks?**  
Yes. Set `mode: 'polling'` or `mode: 'webhook'` in the client options. They are mutually exclusive on Bale's side — if a webhook is registered, `getUpdates` will not return data.

**Q: Can I use `bale.js` with JavaScript (not TypeScript)?**  
Yes. The package ships compiled JavaScript and type definitions. You get full IntelliSense in editors that support JSDoc and `.d.ts` files.

**Q: How do I get a bot token?**  
Create a bot via [Bale's BotFather](https://ble.ir/botfather) and copy the token it gives you.

**Q: What happens if my bot goes offline for more than 24 hours?**  
Bale deletes updates older than 24 hours, so messages sent while the bot was offline are lost. Use webhooks with a reliable server if uptime is critical.

**Q: Is the API base URL configurable?**  
The base URL is fixed to `https://tapi.bale.ai/bot<token>/METHOD_NAME`, as specified by Bale's official API docs.

**Q: Where can I report bugs or request features?**  
Open an issue on the [GitHub repository](https://github.com/Persian-Caesar/bale.js) and follow the guidelines in `CONTRIBUTING.md`.

---

## License

MIT © 2025 bale.js contributors. See [LICENSE](../LICENSE) for details.
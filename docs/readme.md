# 📚 مستندات کامل و جامع bale.js

> کتابخانه‌ای قدرتمند، تایپ‌شده و ماژولار برای ساخت ربات‌های پیام‌رسان بله (Bale) با TypeScript

**نسخه:** 0.1.0 · **Node.js:** ≥ 18 · **لایسنس:** MIT

---

## فهرست مطالب

1. [معرفی bale.js](#۱-معرفی-balejs)
2. [نصب و پیش‌نیازها](#۲-نصب-و-پیشنیازها)
3. [شروع سریع در ۵ دقیقه](#۳-شروع-سریع-در-۵-دقیقه)
4. [کلاینت (BaleClient)](#۴-کلاینت-baleclient)
5. [رویدادها (Events)](#۵-رویدادها-events)
6. [ساختارها (Structures)](#۶-ساختارها-structures)
7. [مدیریت پیام‌ها](#۷-مدیریت-پیامها)
8. [مدیریت رسانه](#۸-مدیریت-رسانه)
9. [مدیریت گروه](#۹-مدیریت-گروه)
10. [پرداخت و فاکتور](#۱۰-پرداخت-و-فاکتور)
11. [بیلدرها (Builders)](#۱۱-بیلدرها-builders)
12. [مدیریت خطا](#۱۲-مدیریت-خطا)
13. [ابزارهای کمکی (Collection)](#۱۳-ابزارهای-کمکی-collection)
14. [الگوهای طراحی و بهترین شیوه‌ها](#۱۴-الگوهای-طراحی-و-بهترین-شیوهها)
15. [عیب‌یابی](#۱۵-عیبیابی)
16. [سوالات متداول](#۱۶-سوالات-متداول)
17. [سهم در توسعه](#۱۷-سهم-در-توسعه)

---

## ۱. معرفی bale.js

**bale.js** کتابخانه‌ای برای ساخت ربات‌های پیام‌رسان بله است که با الهام از `discord.js` و `grammY` طراحی شده. ویژگی‌های اصلی:

| ویژگی                        | توضیح                                               |
| :--------------------------- | :-------------------------------------------------- |
| 🧩 **معماری ماژولار**         | Client، REST، Structures، Managers، Builders        |
| 🔄 **دو حالت دریافت آپدیت**   | Long Polling و Webhook — بدون تغییر کد قابل تعویض   |
| ⌨️ **بیلدرهای روان (Fluent)** | ساخت کیبورد و پیام به صورت زنجیره‌ای                 |
| 📎 **پشتیبانی کامل رسانه**    | عکس، سند، ویدیو، صدا، ویس — با `file_id`/URL/Buffer |
| 👥 **مدیریت گروه**            | Ban، Promote، Pin، InviteLink و…                    |
| 💳 **پرداخت و مینی‌اپ**        | فاکتور، PreCheckout، WebAppData                     |
| 🛡️ **TypeScript سختگیرانه**   | تعریف کامل انواع با `strict` mode                   |
| 🚀 **سبک و سریع**             | تنها وابستگی: `undici`                              |

### فلسفه طراحی

کتابخانه از پنج لایه تشکیل شده که هر کدام مسئولیت مشخصی دارند:

```
┌─────────────────────────────────────────┐
│           BaleClient (همه‌چیز)          │  ← نقطه ورود
├─────────────────────────────────────────┤
│  Managers (تماس با API)                 │  ← messages, media, groups, ...
├─────────────────────────────────────────┤
│  Structures (پوشش داده)                 │  ← User, Chat, Message
├─────────────────────────────────────────┤
│  Builders (ساخت Payload)                │  ← کیبورد، فاکتور، ...
├─────────────────────────────────────────┤
│  RESTManager (تنها لایه شبکه)            │  ← undici
└─────────────────────────────────────────┘
```

**قانون طلایی:** فقط `RESTManager` با `tapi.bale.ai` حرف می‌زند. هیچ‌جای دیگری نباید درخواست HTTP بزند.

---

## ۲. نصب و پیش‌نیازها

### پیش‌نیازها

- **Node.js** ≥ 18 (توصیه: Node 20 LTS)
- **npm** ≥ 9 (یا `pnpm`/`yarn`)
- یک **توکن ربات** از [BotFather بله](https://ble.ir/botfather)

### نصب

```bash
npm install @persian-caesar/bale.js
```

یا با pnpm:

```bash
pnpm add @persian-caesar/bale.js
```

### ساخت ربات

1. به [@botfather](https://ble.ir/botfather) در بله پیام دهید.
2. دستور `/newbot` را بزنید و نام و username ربات را انتخاب کنید.
3. توکنی شبیه `123456:ABC-DEF...` دریافت می‌کنید. آن را در متغیر محیطی ذخیره کنید:

```bash
# .env
BALE_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
```

> ⚠️ **هرگز توکن را در Git commit نکنید.** فایل `.env` باید در `.gitignore` باشد.

---

## ۳. شروع سریع در ۵ دقیقه

### ربات Echo ساده

```ts
import { BaleClient } from '@persian-caesar/bale.js';

const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  mode: 'polling',
});

client.on('ready', (me) => {
  console.log(`✅ ربات @${me.username} آماده است`);
});

client.on('messageCreate', async (message) => {
  if (!message.hasText) return;
  await message.reply(`شما گفتید: ${message.text}`);
});

client.on('error', (err) => {
  console.error('❌ خطا:', err);
});

client.login();
```

### ربات با کیبورد شیشه‌ای

```ts
import { BaleClient, InlineKeyboardBuilder } from '@persian-caesar/bale.js';

const client = new BaleClient({ token: process.env.BALE_TOKEN! });

client.on('messageCreate', async (message) => {
  if (message.text !== '/start') return;

  const keyboard = new InlineKeyboardBuilder()
    .addButton('🛍 محصولات', { callback_data: 'products' })
    .addButton('🛒 سبد خرید', { callback_data: 'cart' })
    .addButton('🌐 سایت', { url: 'https://example.com', color: 'primary' })
    .adjust(2, 1)
    .build();

  await message.reply('یکی از گزینه‌ها را انتخاب کنید:', {
    reply_markup: keyboard,
  });
});

client.on('callbackQuery', async (query) => {
  await query.answer(`شما ${query.data} را انتخاب کردید`);
});

client.login();
```

---

## ۴. کلاینت (BaleClient)

`BaleClient` قلب کتابخانه است. تمام مدیران از طریق این کلاینت قابل دسترسی هستند.

### گزینه‌های سازنده

```ts
interface BaleClientOptions {
  /** توکن ربات (الزامی) */
  token: string;

  /** حالت دریافت آپدیت. پیش‌فرض: 'polling' */
  mode?: 'polling' | 'webhook';

  /** تنظیمات Polling */
  polling?: {
    timeout?: number;  // پیش‌فرض ۳۰ ثانیه
    limit?: number;    // پیش‌فرض ۱۰۰
  };

  /** تنظیمات Webhook */
  webhook?: {
    url: string;       // الزامی
    port?: number;     // پیش‌فرض 3000
    path?: string;     // پیش‌فرض '/bale/webhook'
  };
}
```

### دسترسی‌ها

```ts
client.rest;      // RESTManager — دسترسی خام به API
client.messages;  // MessageManager — ارسال/ویرایش/حذف پیام
client.chats;     // ChatManager — دریافت اطلاعات چت
client.media;     // MediaManager — عکس، سند، ویدیو...
client.groups;    // GroupManager — مدیریت اعضا
client.payments;  // PaymentManager — پرداخت
client.user;      // اطلاعات ربات (پس از login)
```

### متد `login()`

کلاینت را راه‌اندازی می‌کند:

1. با `getMe` اطلاعات ربات را دریافت می‌کند.
2. رویداد `ready` را منتشر می‌کند.
3. بسته به `mode`:
   - **polling**: حلقه دریافت آپدیت را شروع می‌کند.
   - **webhook**: وبهوک را ثبت و سرور HTTP را راه‌اندازی می‌کند.

```ts
await client.login();
```

### متد `destroy()`

کلاینت را متوقف می‌کند:

- در حالت polling: حلقه را متوقف می‌کند.
- در حالت webhook: سرور را می‌بندد و وبهوک را از Bale حذف می‌کند.

```ts
await client.destroy();
```

> 💡 **نکته:** اگر در حالت webhook هستید و می‌خواهید موقتاً به polling سوییچ کنید، **اول باید `deleteWebhook` را صدا بزنید** (که `destroy()` خودش این کار را می‌کند). Bale اجازه نمی‌دهد هم‌زمان webhook و polling فعال باشند.

### حالت Polling — کی و چطور؟

**مناسب برای:** توسعه، ربات‌های کوچک، سرورهای بدون IP عمومی.

```ts
const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  mode: 'polling',
  polling: {
    timeout: 30,  // Long-polling: هر درخواست تا ۳۰ ثانیه باز می‌ماند
    limit: 100,   // حداکثر ۱۰۰ آپدیت در هر درخواست
  },
});
```

**مکانیزم داخلی:**

```
┌─────────────────────────────┐
│ offset = 0                  │
└──────────────┬──────────────┘
               ▼
     ┌──────────────────┐
     │ getUpdates(...)  │  ← بلاک تا دریافت آپدیت یا timeout
     └────────┬─────────┘
              ▼
   ┌──────────────────────┐
   │ for each update:     │
   │   offset = id + 1    │
   │   dispatchUpdate()   │
   └──────────┬───────────┘
              ▼
        (تکرار تا stop)
```

**اگر خطا رخ دهد:**

| خطا                      | رفتار                             |
| :----------------------- | :-------------------------------- |
| `BaleAPIError` با کد 429 | به اندازه `retry_after` صبر می‌کند |
| سایر خطاها               | ۲ ثانیه صبر می‌کند                 |

**محدودیت مهم بله:** Bale تنها **۲۰۰۰ آپدیت آخر** را **برای ۲۴ ساعت** نگه می‌دارد. اگر ربات بیش از ۲۴ ساعت خاموش باشد، پیام‌ها از دست می‌روند.

### حالت Webhook — کی و چطور؟

**مناسب برای:** production، ربات‌های پرترافیک، سرورهای با IP عمومی.

```ts
const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  mode: 'webhook',
  webhook: {
    url: 'https://yourdomain.com/bale/webhook', // آدرس عمومی
    port: 3000,                                 // پورت محلی سرور
    path: '/bale/webhook',                      // مسیر
  },
});
```

**نحوه کار:**

1. کتابخانه به Bale می‌گوید «هر آپدیت را به `https://yourdomain.com/bale/webhook` بفرست».
2. یک سرور HTTP محلی روی `port` و `path` بالا می‌آورد.
3. هر درخواست POST را به `dispatchUpdate` می‌فرستد.

**نکته پورت:** Bale فقط روی **پورت‌های محدود** (معمولاً 443، 80، 88، 8443) وبهوک می‌پذیرد. اگر پشت reverse proxy هستید (Nginx، Caddy)، سرور محلی را روی هر پورتی اجرا کنید و از بیرون روی 443 منتشر کنید.

**مثال با Nginx:**

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    location /bale/webhook {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }
}
```

### متد `dispatchUpdate()` (پیشرفته)

اگر خودتان یک لایه HTTP دارید (مثلاً Express)، می‌توانید از `BaleClient` بدون حالت webhook استفاده کنید:

```ts
import express from 'express';
import { BaleClient } from '@persian-caesar/bale.js';

const client = new BaleClient({ token: process.env.BALE_TOKEN! });
const app = express();
app.use(express.json());

app.post('/bale/webhook', (req, res) => {
  client.dispatchUpdate(req.body);
  res.send('OK');
});

app.listen(8080);
```

---

## ۵. رویدادها (Events)

`BaleClient` از `TypedEmitter` ارث‌بری می‌کند — همان `EventEmitter` نود اما **تایپ‌شده**.

### جدول رویدادها

| رویداد          | Payload                               | توضیح                          |
| :-------------- | :------------------------------------ | :----------------------------- |
| `ready`         | `APIUser`                             | پس از `login()` موفق           |
| `messageCreate` | `Message`                             | پیام جدید دریافت شد            |
| `messageEdit`   | `Message`                             | یک پیام ویرایش شد              |
| `callbackQuery` | `CallbackQuery`                       | کاربر روی دکمه شیشه‌ای کلیک کرد |
| `webAppData`    | `{ from, data, buttonText, message }` | داده از مینی‌اپ                 |
| `error`         | `unknown`                             | هر خطای مدیریت‌نشده             |

### الگوی توصیه‌شده برای گوش دادن

```ts
client.on('ready', (me) => {
  console.log(`ربات @${me.username} با ID ${me.id} آماده شد`);
});

client.on('messageCreate', async (message) => {
  try {
    // همیشه از try/catch استفاده کنید
    await handleMessage(message);
  } catch (err) {
    console.error('خطا در پردازش پیام:', err);
  }
});

client.on('error', (err) => {
  console.error('[bale.js]', err);
});
```

> ⚠️ **همیشه به `error` گوش دهید.** اگر خطایی رخ دهد و listener نداشته باشید، نود آن را روی `stderr` چاپ می‌کند و در بعضی موارد کل پروسه را می‌بندد.

### الگوی Router دستی

```ts
client.on('messageCreate', async (message) => {
  const text = message.text;
  if (!text) return;

  if (text === '/start')      return handleStart(message);
  if (text === '/help')       return handleHelp(message);
  if (text.startsWith('/echo ')) return handleEcho(message, text.slice(6));
  // ...
});
```

### گوش دادن یک‌باره

```ts
client.once('ready', (me) => {
  console.log(`ربات @${me.username} بالاخره آماده شد!`);
});
```

---

## ۶. ساختارها (Structures)

ساختارها **پوشش‌های فقط‌خواندنی** روی داده خام API هستند. آن‌ها getter و متدهای کمکی دارند که به مدیران مربوطه واگذار می‌کنند.

### ۶.۱. `User` — کاربر یا ربات

```ts
class User {
  readonly id: number;
  readonly isBot: boolean;
  readonly firstName: string;
  readonly lastName?: string;
  readonly username?: string;
  readonly languageCode?: string;

  /** نام کامل — "نام نام‌خانوادگی" */
  get fullName(): string;

  /** @username یا نام کامل */
  toString(): string;
}
```

**مثال:**

```ts
client.on('messageCreate', (message) => {
  if (!message.from) return;
  console.log(`${message.from.fullName} (${message.from.id}) پیام داد`);
  // اگر username داشته باشد: @alice
  console.log(`منشن: ${message.from}`);
});
```

### ۶.۲. `Chat` — چت (خصوصی، گروه، کانال)

```ts
type ChatType = 'private' | 'group' | 'channel';

class Chat {
  readonly id: number;
  readonly type: ChatType;
  readonly title?: string;
  readonly username?: string;
  readonly firstName?: string;
  readonly lastName?: string;

  get isPrivate(): boolean;
  get isGroup(): boolean;
  get isChannel(): boolean;

  /** ارسال پیام به این چت */
  send(text: string, options?): Promise<Message>;
}
```

**مثال:**

```ts
client.on('messageCreate', async (message) => {
  if (message.chat.isGroup) {
    console.log(`پیام از گروه: ${message.chat.title}`);
  }

  if (message.chat.isPrivate) {
    await message.chat.send('سلام در چت خصوصی!');
  }
});
```

### ۶.۳. `Message` — پیام

```ts
class Message {
  readonly id: number;
  readonly chat: Chat;
  readonly from?: User;
  readonly text?: string;
  readonly caption?: string;
  readonly date: Date;
  readonly replyMarkup?: InlineKeyboardMarkup;
  readonly replyToMessage?: Message;

  /** داده خام API — برای استفاده‌های پیشرفته */
  get raw(): APIMessage;

  /** پاسخ به این پیام (به‌صورت Reply) */
  reply(text: string, options?): Promise<Message>;

  /** ویرایش این پیام (فقط پیام‌های ارسالی ربات) */
  edit(text: string): Promise<Message>;

  /** حذف این پیام */
  delete(): Promise<void>;

  /** آیا متن دارد؟ */
  get hasText(): boolean;

  /** آیا کپشن دارد؟ */
  get hasCaption(): boolean;
}
```

**مثال کامل:**

```ts
client.on('messageCreate', async (message) => {
  // نوع پیام را تشخیص بده
  if (message.hasText) {
    await message.reply(`متن: ${message.text}`);
  }

  // reply_to_message را دنبال کن
  if (message.replyToMessage) {
    console.log(`در پاسخ به: ${message.replyToMessage.text}`);
  }

  // ویرایش پیام
  if (message.text === '/edit-me') {
    await message.edit('ویرایش شد!');
  }

  // دسترسی به فایل ضمیمه
  if (message.raw.document) {
    console.log(`سند: ${message.raw.document.file_name}`);
  }
});
```

### ۶.۴. `CallbackQuery` — کلیک روی دکمه شیشه‌ای

```ts
class CallbackQuery {
  readonly id: string;
  readonly from: User;
  readonly message?: Message;
  readonly data?: string;
  readonly inlineMessageId?: string;

  /** پاسخ به query (برای حذف حالت لودینگ) */
  answer(text?: string, showAlert?: boolean): Promise<boolean>;

  /** ویرایش پیام متصل */
  editMessage(text: string): Promise<Message>;
}
```

**مثال:**

```ts
client.on('callbackQuery', async (query) => {
  // ⚠️ همیشه answer را صدا بزنید!
  await query.answer('در حال پردازش...', false);

  switch (query.data) {
    case 'products':
      await query.editMessage('🛍 لیست محصولات...');
      break;

    case 'cart':
      await query.editMessage('🛒 سبد خرید شما خالی است');
      break;

    case 'delete':
      // فقط برای ادمین
      if (query.from.id === ADMIN_ID) {
        await query.message?.delete();
      }
      break;
  }
});
```

> ⚠️ **مهم:** اگر `answer()` را صدا نزنید، دکمه در کلاینت کاربر **در حالت لودینگ می‌ماند** و کاربر تجربه بدی خواهد داشت.

---

## ۷. مدیریت پیام‌ها

### `MessageManager` — دسترسی: `client.messages`

```ts
interface SendMessageOptions {
  reply_markup?: InlineKeyboardMarkup | ReplyKeyboardMarkup;
  reply_to_message_id?: number;
}
```

| متد                               | توضیح                                                          |
| :-------------------------------- | :------------------------------------------------------------- |
| `send(chatId, content, options?)` | ارسال پیام — `content` می‌تواند `string` یا `BuiltMessage` باشد |
| `edit(chatId, messageId, text)`   | ویرایش متن پیام                                                |
| `delete(chatId, messageId)`       | حذف پیام                                                       |

**مثال‌ها:**

```ts
// ارسال ساده
await client.messages.send(chatId, 'سلام!');

// ارسال با کیبورد شیشه‌ای
const kb = new InlineKeyboardBuilder()
  .addButton('بله', { callback_data: 'yes' })
  .addButton('خیر', { callback_data: 'no' })
  .build();

await client.messages.send(chatId, 'ادامه می‌دهید؟', {
  reply_markup: kb,
});

// ارسال به‌صورت Reply
await client.messages.send(chatId, 'در پاسخ به پیام شما', {
  reply_to_message_id: message.id,
});

// ویرایش
await client.messages.edit(chatId, messageId, 'متن جدید');

// حذف
await client.messages.delete(chatId, messageId);
```

### ارسال با `MessageBuilder`

```ts
import { MessageBuilder } from '@persian-caesar/bale.js';

const kb = new InlineKeyboardBuilder()
  .addButton('تأیید', { callback_data: 'confirm', color: 'success' })
  .addButton('لغو', { callback_data: 'cancel', color: 'danger' })
  .build();

const built = new MessageBuilder()
  .setText('آیا مطمئن هستید؟')
  .setKeyboard(kb)
  .build();

await client.messages.send(chatId, built);
```

---

## ۸. مدیریت رسانه

### `MediaManager` — دسترسی: `client.media`

| متد                                     | توضیح                       |
| :-------------------------------------- | :-------------------------- |
| `sendPhoto(chatId, input, options?)`    | ارسال عکس                   |
| `sendDocument(chatId, input, options?)` | ارسال سند                   |
| `sendVideo(chatId, input, options?)`    | ارسال ویدیو                 |
| `sendAudio(chatId, input, options?)`    | ارسال فایل صوتی             |
| `sendVoice(chatId, input, options?)`    | ارسال ویس                   |
| `downloadFile(fileId)`                  | دانلود فایل به‌صورت `Buffer` |
| `getFileInfo(fileId)`                   | دریافت اطلاعات فایل         |

### ورودی‌های فایل (`FileInput`)

| نوع ورودی               | تشخیص     | روش انتقال            |
| :---------------------- | :-------- | :-------------------- |
| `"AgACAgIA..."`         | `file_id` | JSON                  |
| `"https://..."`         | URL       | JSON                  |
| `Buffer` / `Uint8Array` | Buffer    | `multipart/form-data` |

### گزینه‌های مشترک ارسال مدیا

```ts
interface SendMediaBaseOptions {
  caption?: string;
  parse_mode?: 'Markdown' | 'MarkdownV2' | 'HTML';
  caption_entities?: MessageEntity[];
  disable_notification?: boolean;
  protect_content?: boolean;
  reply_to_message_id?: number;
  allow_sending_without_reply?: boolean;
  reply_markup?: InlineKeyboardMarkup;
}
```

### مثال‌ها

**ارسال عکس از URL:**

```ts
await client.media.sendPhoto(chatId, 'https://example.com/cat.jpg', {
  caption: 'یک گربه بامزه 😺',
});
```

**ارسال سند از دیسک:**

```ts
import { readFile } from 'node:fs/promises';

const buffer = await readFile('./report.pdf');
await client.media.sendDocument(chatId, buffer, {
  caption: 'گزارش سالانه',
});
```

**ارسال ویدیو با `file_id` (سریع‌ترین روش):**

```ts
// بار اول آپلود کنید و file_id را ذخیره کنید
await client.media.sendVideo(chatId, 'AgACAgIAAxkBAAI...', {
  caption: 'ویدیوی آموزشی',
  duration: 120,
  supports_streaming: true,
});
```

**دانلود فایل دریافتی:**

```ts
client.on('messageCreate', async (message) => {
  const doc = message.raw.document;
  if (!doc) return;

  const buffer = await client.media.downloadFile(doc.file_id);

  const fileName = `downloads/${Date.now()}_${doc.file_name ?? 'file'}`;
  await writeFile(fileName, buffer);
  await message.reply(`✅ ذخیره شد: ${fileName}`);
});
```

**مقایسه `file_id` با Buffer:**

| روش       | سرعت        | اندازه درخواست   | توصیه                            |
| :-------- | :---------- | :--------------- | :------------------------------- |
| `file_id` | ⚡ خیلی سریع | کوچک (~100 بایت) | **توصیه‌شده** برای فایل‌های تکراری |
| URL       | 🚀 سریع      | کوچک             | وقتی فایل روی CDN است            |
| Buffer    | 🐢 کند       | بزرگ (کل فایل)   | فقط بار اول                      |

---

## ۹. مدیریت گروه

### `GroupManager` — دسترسی: `client.groups`

```ts
interface PromoteOptions {
  can_change_info?: boolean;
  can_delete_messages?: boolean;
  can_invite_users?: boolean;
  can_restrict_members?: boolean;
  can_pin_messages?: boolean;
  can_promote_members?: boolean;
}

interface InviteLinkOptions {
  expire_date?: number;   // unix timestamp
  member_limit?: number;  // حداکثر تعداد اعضا
}
```

| متد                                                   | توضیح           |
| :---------------------------------------------------- | :-------------- |
| `promote(chatId, userId, options)`                    | ارتقا به ادمین  |
| `ban(chatId, userId)`                                 | مسدود کردن      |
| `unban(chatId, userId)`                               | رفع مسدودی      |
| `pinMessage(chatId, messageId, disableNotification?)` | سنجاق پیام      |
| `unpinMessage(chatId, messageId)`                     | حذف سنجاق       |
| `unpinAllMessages(chatId)`                            | حذف همه سنجاق‌ها |
| `createInviteLink(chatId, options?)`                  | ساخت لینک دعوت  |
| `getMemberCount(chatId)`                              | تعداد اعضا      |

### مثال‌ها

**ارتقا به ادمین با دسترسی محدود:**

```ts
await client.groups.promote(chatId, userId, {
  can_delete_messages: true,
  can_invite_users: true,
  can_pin_messages: false,  // نمی‌تواند سنجاق کند
});
```

**لیست سیاه (Blacklist):**

```ts
client.on('messageCreate', async (message) => {
  if (!message.chat.isGroup) return;

  const BANNED = [12345, 67890];
  if (message.from && BANNED.includes(message.from.id)) {
    await client.groups.ban(message.chat.id, message.from.id);
    await message.delete();
    await message.chat.send(`⛔ ${message.from.fullName} مسدود شد`);
  }
});
```

**ساخت لینک دعوت یک‌بارمصرف (۲۴ ساعته، ۵۰ نفر):**

```ts
const { invite_link } = await client.groups.createInviteLink(chatId, {
  member_limit: 50,
  expire_date: Math.floor(Date.now() / 1000) + 86400,
});

await client.messages.send(chatId, `لینک دعوت: ${invite_link}`);
```

---

## ۱۰. پرداخت و فاکتور

### `PaymentManager` — دسترسی: `client.payments`

### `InvoiceBuilder` — ساخت فاکتور

```ts
const invoice = new InvoiceBuilder()
  .setTitle('اشتراک ویژه')
  .setDescription('دسترسی یک‌ماهه به امکانات ویژه')
  .setPayload('sub_1month')                  // شناسه داخلی سفارش
  .setProviderToken(process.env.PROVIDER_TOKEN!)
  .setCurrency('IRR')
  .addPrice('اشتراک یک‌ماهه', 50000)
  .addPrice('مالیات', 4500)
  .requireName()                             // نام کاربر را بگیر
  .requireEmail()                            // ایمیل کاربر را بگیر
  .build();

await client.payments.sendInvoice(chatId, invoice);
```

### پاسخ به `PreCheckoutQuery`

Bale قبل از کسر وجه، یک `pre_checkout_query` می‌فرستد. باید تأیید یا رد کنید:

```ts
client.on('preCheckoutQuery', async (query) => {
  // اعتبارسنجی سفارش
  const payload = query.invoice_payload;
  const amount = query.total_amount;

  if (payload === 'sub_1month' && amount === 50000) {
    await client.payments.answerPreCheckout(query.id, true);
  } else {
    await client.payments.answerPreCheckout(
      query.id,
      false,
      'مبلغ با انتظار مطابقت ندارد',
    );
  }
});
```

> ⚠️ **مهم:** اگر `answerPreCheckout` را صدا نزنید، پرداخت در حالت معلق می‌ماند و کاربر تجربه بدی خواهد داشت.

### پرداخت موفق

```ts
client.on('messageCreate', async (message) => {
  const payment = message.raw.successful_payment;
  if (!payment) return;

  await message.reply(`✅ پرداخت ${payment.total_amount} ${payment.currency} موفق بود!`);
  // دسترسی را فعال کن...
});
```

---

## ۱۱. بیلدرها (Builders)

بیلدرها **توابع خالص** برای ساخت payload هستند. شبکه را لمس نمی‌کنند و همیشه یک شیء ساده برمی‌گردانند.

### `InlineKeyboardBuilder` — کیبورد شیشه‌ای

```ts
interface InlineButtonOptions {
  url?: string;
  callback_data?: string;
  web_app?: { url: string };
  color?: 'primary' | 'success' | 'danger';
}

class InlineKeyboardBuilder {
  addButton(text: string, options?: InlineButtonOptions): this;
  addRow(...buttons: InlineKeyboardButton[]): this;
  adjust(...sizes: number[]): this;
  build(): InlineKeyboardMarkup;
}
```

**مثال‌ها:**

```ts
// ساده
const kb = new InlineKeyboardBuilder()
  .addButton('بله', { callback_data: 'yes' })
  .addButton('خیر', { callback_data: 'no' })
  .build();
// نتیجه: یک ردیف با دو دکمه

// چیدمان چندردیفی
const kb = new InlineKeyboardBuilder()
  .addButton('A')
  .addButton('B')
  .addButton('C')
  .adjust(2, 1)
  .build();
// نتیجه: [A, B] / [C]

// ردیف دستی
const kb = new InlineKeyboardBuilder()
  .addRow({ text: 'ردیف ۱', callback_data: 'r1' }, { text: 'ردیف ۱', url: 'https://...' })
  .addRow({ text: 'ردیف ۲', callback_data: 'r2' })
  .build();
```

**⚠️ نکته مهم:** یک دکمه **نمی‌تواند هم‌زمان `url` و `callback_data` داشته باشد**. Bale خطا می‌دهد.

### `ReplyKeyboardBuilder` — کیبورد سفارشی

```ts
interface ReplyButtonOptions {
  request_contact?: boolean;
  request_location?: boolean;
}

interface ReplyKeyboardOptions {
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
  selective?: boolean;
}

class ReplyKeyboardBuilder {
  addButton(text: string, options?: ReplyButtonOptions): this;
  addRow(...buttons: KeyboardButton[]): this;
  adjust(...sizes: number[]): this;
  setOptions(options: ReplyKeyboardOptions): this;
  build(): ReplyKeyboardMarkup;
}
```

**مثال:**

```ts
const menu = new ReplyKeyboardBuilder()
  .addButton('📱 ارسال شماره', { request_contact: true })
  .addButton('📍 ارسال موقعیت', { request_location: true })
  .addButton('📄 شرایط و قوانین')
  .addButton('❓ راهنما')
  .adjust(1, 1, 2)
  .setOptions({
    resize_keyboard: true,       // اندازه کوچک‌تر
    one_time_keyboard: true,     // بعد از یک بار، مخفی شود
  })
  .build();

await client.messages.send(chatId, 'انتخاب کنید:', {
  reply_markup: menu,
});
```

### `MessageBuilder`

```ts
const built = new MessageBuilder()
  .setText('سلام!')
  .setKeyboard(kb)
  .build();
// نتیجه: { text: 'سلام!', reply_markup: kb }

await client.messages.send(chatId, built);
```

**محدودیت:** اگر `text` خالی باشد، `build()` خطا می‌دهد.

### `InvoiceBuilder` — جدول کامل

| متد                |    الزامی؟    | توضیح        |
| :----------------- | :-----------: | :----------- |
| `setTitle`         |       ✅       | عنوان        |
| `setDescription`   |       ✅       | توضیحات      |
| `setPayload`       |       ✅       | شناسه داخلی  |
| `setProviderToken` |       ✅       | توکن درگاه   |
| `setCurrency`      |       ✅       | ارز (IRR)    |
| `addPrice`         | ✅ (حداقل یکی) | آیتم قیمت    |
| `setPhotoUrl`      |       ❌       | عکس محصول    |
| `requireName`      |       ❌       | نام خریدار   |
| `requirePhone`     |       ❌       | تلفن خریدار  |
| `requireEmail`     |       ❌       | ایمیل خریدار |

`build()` اگر فیلدهای الزامی خالی باشند، خطا می‌دهد.

### `web_app` — دکمه مینی‌اپ

```ts
const kb = new InlineKeyboardBuilder()
  .addButton('🛍 باز کردن فروشگاه', {
    web_app: { url: 'https://shop.example.com' },
  })
  .build();
```

وقتی کاربر دکمه را می‌زند، مینی‌اپ باز می‌شود. داده‌ای که مینی‌اپ برمی‌گرداند، در رویداد `webAppData` دریافت می‌شود:

```ts
client.on('webAppData', (payload) => {
  console.log('داده:', payload.data);
  console.log('متن دکمه:', payload.buttonText);
  console.log('کاربر:', payload.message.from?.fullName);
});
```

> 💡 **نکته:** دکمه‌های `web_app` فقط در **چت خصوصی** با ربات کار می‌کنند (محدودیت Bale).

---

## ۱۲. مدیریت خطا

همه خطاهای API به‌صورت `BaleAPIError` پرتاب می‌شوند:

```ts
import { BaleAPIError } from '@persian-caesar/bale.js';

try {
  await client.messages.send(chatId, 'سلام');
} catch (err) {
  if (err instanceof BaleAPIError) {
    console.error(`خطای API [${err.code}]: ${err.message}`);

    if (err.code === 429) {
      const retryAfter = err.parameters?.retry_after ?? 1;
      await delay(retryAfter * 1000);
      // دوباره تلاش کن...
    }

    if (err.code === 403) {
      // ربات از چت مسدود شده
    }
  } else {
    // خطای شبکه، پارس JSON، ...
    console.error('خطای غیرمنتظره:', err);
  }
}
```

### جدول کدهای رایج Bale

| کد   | معنا          | راه‌حل                           |
| :--- | :------------ | :------------------------------ |
| 400  | درخواست بد    | پارامترها را بررسی کن           |
| 401  | توکن نامعتبر  | توکن را چک کن                   |
| 403  | دسترسی ندارید | ربات ادمین نیست یا مسدود شده    |
| 404  | پیدا نشد      | `chat_id`/`message_id` را چک کن |
| 429  | زیاد از حد    | `retry_after` را رعایت کن       |

### الگوی Retry (تلاش مجدد)

```ts
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err instanceof BaleAPIError && err.code === 429) {
        const wait = (err.parameters?.retry_after ?? 1) * 1000;
        await delay(wait);
        continue;
      }
      if (i === maxAttempts - 1) throw err;
      await delay(1000 * 2 ** i); // exponential backoff
    }
  }
  throw new Error('unreachable');
}

// استفاده
await withRetry(() => client.messages.send(chatId, 'سلام'));
```

### `Collection` برای مدیریت کش

```ts
import { Collection } from '@persian-caesar/bale.js';

const userCache = new Collection<number, User>();

client.on('messageCreate', (message) => {
  if (!message.from) return;
  if (!userCache.has(message.from.id)) {
    userCache.set(message.from.id, message.from);
    console.log(`کاربر جدید! مجموع: ${userCache.size}`);
  }
});
```

---

## ۱۳. ابزارهای کمکی (Collection)

`Collection` یک `Map` توسعه‌یافته است، مشابه `discord.js`:

```ts
import { Collection } from '@persian-caesar/bale.js';

const col = new Collection<string, number>([
  ['a', 1],
  ['b', 2],
  ['c', 3],
]);

col.first();       // 1
col.last();        // 3
col.toArray();     // [1, 2, 3]
col.toKeyArray();  // ['a', 'b', 'c']
col.filter((v) => v > 1);  // Collection { b: 2, c: 3 }
col.map((v) => v * 2);     // [2, 4, 6]
```

### موارد استفاده

```ts
// کش کاربران
const users = new Collection<number, User>();

// کش مکالمات
interface ConversationState {
  step: 'name' | 'email' | 'done';
  data: { name?: string; email?: string };
}
const conversations = new Collection<number, ConversationState>();

client.on('messageCreate', async (message) => {
  if (!message.from || !message.text) return;
  const userId = message.from.id;

  if (message.text === '/start') {
    conversations.set(userId, { step: 'name', data: {} });
    await message.reply('اسمت چیه؟');
    return;
  }

  const conv = conversations.get(userId);
  if (!conv) return;

  switch (conv.step) {
    case 'name':
      conv.data.name = message.text;
      conv.step = 'email';
      await message.reply('ایمیلت چیه؟');
      break;

    case 'email':
      conv.data.email = message.text;
      conv.step = 'done';
      await message.reply(`ممنون ${conv.data.name}!`);
      conversations.delete(userId);
      break;
  }
});
```

---

## ۱۴. الگوهای طراحی و بهترین شیوه‌ها

### ۱۴.۱. سازماندهی کد — الگوی Router

پروژه را به فایل‌های کوچک تقسیم کنید:

```
src/
├── index.ts
├── client.ts
├── handlers/
│   ├── start.ts
│   ├── echo.ts
│   └── admin.ts
└── utils/
    └── logger.ts
```

```ts
// handlers/start.ts
import type { Message } from '@persian-caesar/bale.js';
import { InlineKeyboardBuilder } from '@persian-caesar/bale.js';

export async function handleStart(message: Message) {
  const kb = new InlineKeyboardBuilder()
    .addButton('🛍 محصولات', { callback_data: 'products' })
    .build();

  await message.reply('به ربات خوش آمدید! 👋', { reply_markup: kb });
}
```

```ts
// client.ts
import { handleStart } from './handlers/start.js';
import { handleEcho } from './handlers/echo.js';

client.on('messageCreate', async (message) => {
  switch (message.text) {
    case '/start': return handleStart(message);
    case '/echo':  return handleEcho(message);
    // ...
  }
});
```

### ۱۴.۲. حالت‌های مکالمه (Conversation State)

```ts
type Step = 'idle' | 'awaiting_name' | 'awaiting_phone';
const states = new Collection<number, Step>();

client.on('messageCreate', async (message) => {
  const state = states.get(message.from!.id) ?? 'idle';

  if (state === 'awaiting_name') {
    await message.reply(`سلام ${message.text}!`);
    states.set(message.from!.id, 'awaiting_phone');
    return;
  }

  if (state === 'awaiting_phone') {
    // ...
  }
});
```

### ۱۴.۳. لاگ و دیباگ

```ts
const DEBUG = process.env.DEBUG === 'true';

function log(...args: unknown[]) {
  if (DEBUG) console.log('[debug]', ...args);
}

client.on('messageCreate', (message) => {
  log('پیام جدید:', message.id, message.text);
});
```

### ۱۴.۴. جداسازی توکن و تنظیمات

```ts
// config.ts
export const config = {
  token: process.env.BALE_TOKEN!,
  adminId: Number(process.env.ADMIN_ID),
  mode: (process.env.MODE ?? 'polling') as 'polling' | 'webhook',
};

if (!config.token) {
  throw new Error('BALE_TOKEN تنظیم نشده!');
}
```

### ۱۴.۵. دسته‌بندی خطاها

```ts
function isUserError(err: unknown): boolean {
  return err instanceof BaleAPIError && [400, 403, 404].includes(err.code);
}

client.on('messageCreate', async (message) => {
  try {
    await handleMessage(message);
  } catch (err) {
    if (isUserError(err)) {
      await message.reply('متأسفانه درخواست شما نامعتبر بود.').catch(() => {});
    } else {
      console.error('خطای جدی:', err);
    }
  }
});
```

### ۱۴.۶. الگوی Graceful Shutdown

```ts
process.on('SIGTERM', async () => {
  console.log('در حال خاموشی...');
  await client.destroy();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await client.destroy();
  process.exit(0);
});
```

### ۱۴.۷. حفظ حالت بین ریستارت‌ها

اگر ربات ریستارت شود، `offset` polling و states از بین می‌روند. از یک ذخیره‌گاه استفاده کنید:

```ts
// با فایل
const STATE_FILE = './state.json';
const state = JSON.parse(await readFile(STATE_FILE, 'utf-8').catch(() => '{}'));

setInterval(async () => {
  await writeFile(STATE_FILE, JSON.stringify({
    offset: (client as any).pollingManager?.offset,
    conversations: Object.fromEntries(conversations),
  }));
}, 30_000);
```

---

## ۱۵. عیب‌یابی

### ❌ "Webhook is already set"

**علت:** قبلاً یک webhook ثبت شده و polling را قطع کرده.

**راه‌حل:**

```ts
await client.rest.deleteWebhook();
```

### ❌ "Forbidden: bot was blocked by the user"

**علت:** کاربر ربات را بلاک کرده.

**راه‌حل:** کاربر را از لیست فعال حذف کنید.

```ts
client.on('messageCreate', async (message) => {
  try {
    await message.reply('...');
  } catch (err) {
    if (err instanceof BaleAPIError && err.code === 403) {
      // این کاربر ربات را بلاک کرده — از لیست حذف کن
      activeUsers.delete(message.from!.id);
    }
  }
});
```

### ❌ دکمه‌ها در حالت لودینگ گیر کرده‌اند

**علت:** `query.answer()` را صدا نزده‌اید.

**راه‌حل:**

```ts
client.on('callbackQuery', async (query) => {
  try {
    // منطق شما
  } finally {
    await query.answer().catch(() => {}); // همیشه answer
  }
});
```

### ❌ "message is too long"

**علت:** متن پیام از ۴۰۹۶ کاراکتر بیشتر است.

**راه‌حل:** متن را تقسیم کنید:

```ts
async function sendLong(chatId: number, text: string) {
  const CHUNK = 4000;
  for (let i = 0; i < text.length; i += CHUNK) {
    await client.messages.send(chatId, text.slice(i, i + CHUNK));
  }
}
```

### ❌ پاسخ‌ها در گروه تکرار می‌شوند

**علت:** ربات به پیام خودش پاسخ می‌دهد.

**راه‌حل:** بررسی کنید `from.isBot === false`:

```ts
client.on('messageCreate', (message) => {
  if (message.from?.isBot) return;
  // ...
});
```

### ❌ "offset is not incremented"

**علت:** در حالت polling، اگر offset را درست ذخیره نکنید، آپدیت‌ها دوباره دریافت می‌شوند.

**راه‌حل:** `PollingManager` خودش این کار را می‌کند. اگر خودتان `getUpdates` صدا می‌زنید:

```ts
const updates = await client.rest.getUpdates({ offset });
for (const u of updates) {
  offset = u.update_id + 1;
  client.dispatchUpdate(u);
}
```

---

## ۱۶. سوالات متداول

**Q: آیا bale.js هم در JavaScript کار می‌کند؟**

بله. پکیج شامل JavaScript کامپایل‌شده + تعریف‌های TypeScript است. در JS از IntelliSense کامل بهره‌مند می‌شوید.

**Q: تفاوت polling و webhook چیست؟**

- **Polling:** ربات خودش مدام از Bale می‌پرسد «آپدیت جدید داری؟» — ساده‌تر، برای توسعه.
- **Webhook:** Bale به سرور شما POST می‌زند — سریع‌تر و کم‌مصرف‌تر، برای production.

**Q: آیا می‌توانم هم‌زمان polling و webhook داشته باشم؟**

**نه.** در سمت Bale متقابلاً انحصاری هستند. اگر webhook ثبت باشد، `getUpdates` چیزی برنمی‌گرداند.

**Q: چطور به فایل‌های دریافتی دسترسی داشته باشم؟**

از `message.raw` (داده خام API) استفاده کنید:

```ts
const doc = message.raw.document;
const photo = message.raw.photo;  // آرایه‌ای از سایزها
const voice = message.raw.voice;
```

**Q: آیا می‌توانم از Express به‌جای حالت webhook استفاده کنم؟**

بله، `dispatchUpdate` را در route خود صدا بزنید:

```ts
app.post('/bale', (req, res) => {
  client.dispatchUpdate(req.body);
  res.sendStatus(200);
});
```

**Q: بهترین روش برای ذخیره توکن چیست؟**

متغیر محیطی (`.env`) + هرگز در Git commit نکنید. برای production از secret manager (AWS Secrets، Vault و…) استفاده کنید.

**Q: آیا از ESM پشتیبانی می‌شود؟**

کتابخانه با `module: commonjs` ساخته شده. برای import در پروژه ESM از `require` یا `createRequire` استفاده کنید. آینده‌ای نزدیک احتمالاً ESM بومی هم اضافه می‌شود.

**Q: چطور پیام طولانی بفرستم؟**

باید دستی تقسیم کنید (حداکثر ۴۰۹۶ کاراکتر). به [بخش عیب‌یابی](#-message-is-too-long) مراجعه کنید.

**Q: rate limit چقدر است؟**

Bale محدودیت رسمی اعلام نکرده، اما در عمل مشابه Telegram است (۳۰ پیام/ثانیه به کاربران مختلف، ۱ پیام/ثانیه به یک چت). `PollingManager` کدهای 429 را خودکار مدیریت می‌کند، اما برای ارسال‌های خودتان با `withRetry` مدیریت کنید.

**Q: چطور ربات را در سرور deploy کنم؟**

بخش [الگوی Graceful Shutdown](#۱۴۶-الگوی-graceful-shutdown) و [حالت Webhook](#حالت-webhook--کی-و-چطور) را ببینید. برای Docker:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
CMD ["node", "dist/index.js"]
```

---

## ۱۷. سهم در توسعه

ما از هر نوع مشارکت استقبال می‌کنیم — گزارش باگ، درخواست ویژگی، بهبود مستندات، یا کد.

### راهنمای سریع

1. **ریپازیتوری را fork و clone کنید:**
   ```bash
   git clone https://github.com/<your-username>/bale.js.git
   cd bale.js
   git remote add upstream https://github.com/Persian-Caesar/bale.js.git
   ```

2. **وابستگی‌ها را نصب کنید:**
   ```bash
   npm ci
   ```

3. **قبل از هر PR، اعتبارسنجی کامل:**
   ```bash
   npm run lint && npm run build && npm run test:coverage
   ```

4. **از Conventional Commits استفاده کنید:**
   ```
   feat(builders): add InvoiceBuilder with fluent API
   fix(rest): handle multipart upload with zero-length buffers
   docs: document MediaManager.downloadFile
   ```

### اسکریپت‌های موجود

| دستور                   | توضیح                         |
| :---------------------- | :---------------------------- |
| `npm run build`         | کامپایل TypeScript به `dist/` |
| `npm run dev`           | حالت watch                    |
| `npm run lint`          | ESLint                        |
| `npm run format`        | Prettier روی `src/`           |
| `npm test`              | اجرای تست‌ها                   |
| `npm run test:coverage` | تست + گزارش پوشش              |
| `npm run docs`          | تولید TypeDoc                 |

### اصول معماری (رعایت کنید)

1. **Structures** فقط‌خواندنی — منطق پیچیده در Managers.
2. **Managers** تنها جای تماس با API — هیچ `client.rest.request()` خارج از Manager نباشد.
3. **Builders** خالص — شبکه را لمس نکنند.
4. **BaleClient** فقط هماهنگ‌کننده — منطق کسب‌وکار در آن نباشد.
5. **RESTManager** تنها لایه شبکه.

### Code Style

- TypeScript `strict` — بدون استثنا
- `import type` برای type-only imports
- `.js` extension در importها (سازگاری با NodeNext)
- JSDoc برای همه APIهای عمومی
- Prettier: 2 spaces، single quotes، semicolons، 100 char

جزئیات کامل در [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## 📎 پیوست: خلاصه API

### کلاس‌ها

| کلاس                    | محل           | توضیح                |
| :---------------------- | :------------ | :------------------- |
| `BaleClient`            | `client/`     | نقطه ورود            |
| `RESTManager`           | `rest/`       | لایه شبکه            |
| `BaleAPIError`          | `rest/`       | خطای API             |
| `User`                  | `structures/` | کاربر                |
| `Chat`                  | `structures/` | چت                   |
| `Message`               | `structures/` | پیام                 |
| `CallbackQuery`         | `structures/` | کلیک دکمه            |
| `TypedEmitter`          | `structures/` | EventEmitter تایپ‌شده |
| `MessageManager`        | `managers/`   | پیام‌ها               |
| `ChatManager`           | `managers/`   | چت‌ها                 |
| `MediaManager`          | `managers/`   | رسانه                |
| `GroupManager`          | `managers/`   | گروه                 |
| `PaymentManager`        | `managers/`   | پرداخت               |
| `PollingManager`        | `managers/`   | polling              |
| `WebhookManager`        | `managers/`   | webhook              |
| `InlineKeyboardBuilder` | `builders/`   | کیبورد شیشه‌ای        |
| `ReplyKeyboardBuilder`  | `builders/`   | کیبورد سفارشی        |
| `MessageBuilder`        | `builders/`   | پیام                 |
| `InvoiceBuilder`        | `builders/`   | فاکتور               |
| `Collection`            | `util/`       | Map توسعه‌یافته       |

### نمونه کامل پروژه

```ts
// index.ts
import 'dotenv/config';
import {
  BaleClient,
  InlineKeyboardBuilder,
  Collection,
  BaleAPIError,
} from '@persian-caesar/bale.js';

const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  mode: 'polling',
  polling: { timeout: 30, limit: 100 },
});

const conversations = new Collection<number, { step: string }>();

client.on('ready', (me) => {
  console.log(`✅ @${me.username} آماده است`);
});

client.on('messageCreate', async (message) => {
  if (message.from?.isBot) return;

  try {
    if (message.text === '/start') {
      const kb = new InlineKeyboardBuilder()
        .addButton('📝 ثبت‌نام', { callback_data: 'signup' })
        .addButton('❓ راهنما', { callback_data: 'help' })
        .build();

      await message.reply('خوش آمدید!', { reply_markup: kb });
      return;
    }

    if (message.hasText) {
      await message.reply(`دریافت شد: ${message.text}`);
    }
  } catch (err) {
    if (err instanceof BaleAPIError) {
      console.error(`[${err.code}] ${err.message}`);
    } else {
      console.error(err);
    }
  }
});

client.on('callbackQuery', async (query) => {
  try {
    if (query.data === 'signup') {
      await query.editMessage('لطفاً نام خود را وارد کنید:');
      conversations.set(query.from.id, { step: 'name' });
    } else if (query.data === 'help') {
      await query.editMessage('برای کمک با پشتیبانی تماس بگیرید.');
    }
  } finally {
    await query.answer().catch(() => {});
  }
});

client.on('error', (err) => {
  console.error('[bale.js]', err);
});

process.on('SIGINT', async () => {
  await client.destroy();
  process.exit(0);
});

client.login();
```

---

**MIT License** © 2026 Sobhan Rasoulzadeh Asl — ساخته‌شده با ❤️ برای جامعه فارسی‌زبان

> اگر این مستندات کمک کرد، به پروژه ⭐ دهید. مشارکت شما ارزشمند است!
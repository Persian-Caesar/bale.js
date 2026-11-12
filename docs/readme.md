# مستندات فارسی bale.js

> راهنمای استفاده از کتابخانهٔ `@persian-caesar/bale.js` برای ساخت ربات‌های پیام‌رسان بله با Node.js و TypeScript

**نسخهٔ سورس بررسی‌شده:** `0.1.0`  
**حداقل نسخهٔ Node.js:** `18.0.0`  
**مجوز:** MIT  
**مخزن:** [Persian-Caesar/bale.js](https://github.com/Persian-Caesar/bale.js)  
**پشتیبانی و گزارش مشکل:** [GitHub Issues](https://github.com/Persian-Caesar/bale.js/issues)

---

## فهرست مطالب

1. [معرفی](#1-معرفی)
2. [قابلیت‌ها](#2-قابلیت‌ها)
3. [پیش‌نیازها و نصب](#3-پیشنیازها-و-نصب)
4. [ساخت ربات و دریافت توکن](#4-ساخت-ربات-و-دریافت-توکن)
5. [اولین ربات](#5-اولین-ربات)
6. [معماری کتابخانه](#6-معماری-کتابخانه)
7. [BaleClient و تنظیمات](#7-baleclient-و-تنظیمات)
8. [رویدادها (Events)](#8-رویدادها-events)
9. [ساختارهای داده (Structures)](#9-ساختارهای-داده-structures)
10. [مدیرها (Managers)](#10-مدیرها-managers)
11. [کار با پیام‌ها](#11-کار-با-پیامها)
12. [کیبوردها و دکمه‌ها](#12-کیبوردها-و-دکمهها)
13. [ارسال و دریافت فایل و رسانه](#13-ارسال-و-دریافت-فایل-و-رسانه)
14. [مدیریت گروه](#14-مدیریت-گروه)
15. [پرداخت و فاکتور](#15-پرداخت-و-فاکتور)
16. [مینی‌اپ‌ها (Web Apps)](#16-مینی‌اپها-web-apps)
17. [RESTManager و خطاها](#17-restmanager-و-خطاها)
18. [TypeScript و انواع داده](#18-typescript-و-انواع-داده)
19. [Collection](#19-collection)
20. [راه‌اندازی در محیط عملیاتی](#20-راهاندازی-در-محیط-عملیاتی)
21. [عیب‌یابی و پرسش‌های متداول](#21-عیبیابی-و-پرسشهای-متداول)
22. [مشارکت در توسعه](#22-مشارکت-در-توسعه)
23. [محدودیت‌ها و نکات قابل توجه در نسخهٔ فعلی](#23-محدودیتها-و-نکات-قابل-توجه-در-نسخه-فعلی)
24. [مجوز](#24-مجوز)

---

## 1. معرفی

`bale.js` یک کتابخانهٔ TypeScript/JavaScript برای ساخت ربات در پیام‌رسان بله است. طراحی آن از نظر تجربهٔ توسعه‌دهنده از کتابخانه‌هایی مانند `discord.js` الهام گرفته است: به‌جای فراخوانی مستقیم API در تمام بخش‌های برنامه، با یک Client، چند Manager، ساختارهای شیءگرا و Builderها کار می‌کنید.

هدف اصلی کتابخانه این است که جزئیات ارتباط HTTP و تبدیل داده‌های خام API را تا حد امکان از منطق ربات جدا کند.

### نمونهٔ کوتاه

```ts
import { BaleClient } from '@persian-caesar/bale.js';

const client = new BaleClient({
  token: process.env.BALE_TOKEN!,
  mode: 'polling',
});

client.on('messageCreate', async (message) => {
  if (message.text === '/start') {
    await message.reply('سلام! به ربات خوش آمدید.');
  }
});

client.login();
```

## 2. قابلیت‌ها

قابلیت‌هایی که در سورس نسخهٔ بررسی‌شده پیاده‌سازی شده‌اند:

- معماری ماژولار شامل Client، REST، Structure، Manager و Builder
- دریافت آپدیت با Long Polling یا Webhook
- رویدادهای پیام جدید، ویرایش پیام، کلیک دکمه و دادهٔ Web App
- ارسال، ویرایش و حذف پیام متنی
- ساخت Inline Keyboard و Reply Keyboard
- ارسال عکس، سند، ویدیو، صوت و پیام صوتی
- دریافت اطلاعات فایل و دانلود آن
- دریافت اطلاعات چت
- عملیات مدیریتی گروه مانند مسدودسازی، ارتقای دسترسی، سنجاق پیام و ساخت لینک دعوت
- ارسال فاکتور و پاسخ به Pre-checkout
- ساختارهای تایپ‌شده برای بخش مهمی از داده‌های API
- کلاس `Collection` مبتنی بر `Map`

> نکته: وجود یک Type در تعریف‌ها لزوماً به معنی پشتیبانی کامل از تمام رویدادها یا متدهای API نیست. برای مثال، نوع `pre_checkout_query` در Update تعریف شده، اما در نسخهٔ فعلی Client رویدادی برای انتشار آن پیاده‌سازی نشده است. جزئیات در بخش محدودیت‌ها آمده است.

## 3. پیش‌نیازها و نصب

### پیش‌نیازها

- Node.js نسخهٔ 18 یا بالاتر
- npm نسخهٔ 9 یا بالاتر
- توکن معتبر ربات بله

### نصب پکیج

نام پکیج در `package.json` این پروژه به‌صورت scoped ثبت شده است؛ بنابراین دستور نصب مطابق نام واقعی پکیج:

```bash
npm install @persian-caesar/bale.js
```

در برخی نمونه‌های قدیمی README عبارت `npm install bale.js` دیده می‌شود؛ اما برای نسخه‌ای که سورس آن بررسی شده، نام ثبت‌شده در `package.json` برابر `@persian-caesar/bale.js` است.

### نصب در پروژهٔ TypeScript

```bash
npm install @persian-caesar/bale.js
npm install --save-dev typescript @types/node
```

نمونهٔ حداقلی `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### استفاده در JavaScript

پکیج خروجی JavaScript و فایل‌های تعریف نوع را منتشر می‌کند؛ بنابراین می‌توانید از آن در JavaScript نیز استفاده کنید:

```js
const { BaleClient } = require('@persian-caesar/bale.js');

const client = new BaleClient({
  token: process.env.BALE_TOKEN,
  mode: 'polling',
});
```

## 4. ساخت ربات و دریافت توکن

برای ساخت ربات، از [BotFather بله](https://ble.ir/botfather) استفاده کنید و توکن صادرشده را دریافت کنید.

توکن را داخل کد، مخزن Git یا فایل عمومی قرار ندهید. متغیر محیطی روش مناسب‌تری است.

در ریشهٔ پروژه فایل `.env` بسازید:

```env
BALE_TOKEN=توکن_واقعی_ربات
```

برای بارگذاری `.env` می‌توانید از پکیج `dotenv` استفاده کنید:

```bash
npm install dotenv
```

در ابتدای فایل اصلی:

```ts
import 'dotenv/config';
import { BaleClient } from '@persian-caesar/bale.js';

const token = process.env.BALE_TOKEN;

if (!token) {
  throw new Error('متغیر BALE_TOKEN تنظیم نشده است.');
}

const client = new BaleClient({ token });
```

فایل `.env` در `.gitignore` پروژه قرار دارد؛ با این حال پیش از انتشار، وضعیت Git را بررسی کنید تا توکن به اشتباه commit نشده باشد.

## 5. اولین ربات

فایل `src/index.ts`:

```ts
import 'dotenv/config';
import { BaleClient, InlineKeyboardBuilder } from '@persian-caesar/bale.js';

const token = process.env.BALE_TOKEN;
if (!token) throw new Error('BALE_TOKEN is missing');

const client = new BaleClient({
  token,
  mode: 'polling',
  polling: {
    timeout: 30,
    limit: 100,
  },
});

client.on('ready', (me) => {
  console.log(`ربات @${me.username ?? me.first_name} آماده است.`);
});

client.on('messageCreate', async (message) => {
  try {
    if (message.text === '/start') {
      const keyboard = new InlineKeyboardBuilder()
        .addButton('راهنما', { callback_data: 'help', color: 'primary' })
        .addButton('وب‌سایت', { url: 'https://example.com' })
        .build();

      await message.reply('سلام! یکی از گزینه‌ها را انتخاب کنید.', {
        reply_markup: keyboard,
      });
    }
  } catch (error) {
    console.error('خطا در پردازش پیام:', error);
  }
});

client.on('callbackQuery', async (query) => {
  try {
    await query.answer('درخواست دریافت شد.');
    if (query.data === 'help' && query.message) {
      await query.editMessage('برای استفاده از ربات، دستور /start را ارسال کنید.');
    }
  } catch (error) {
    console.error('خطا در پردازش دکمه:', error);
  }
});

client.on('error', (error) => {
  console.error('[bale.js]', error);
});

void client.login().catch(console.error);
```

**نکته:** متد `login()` یک Promise برمی‌گرداند. بهتر است خطاهای زمان راه‌اندازی آن را با `catch` مدیریت کنید.

## 6. معماری کتابخانه

ساختار اصلی سورس:

```text
src/
├── client/
│   └── BaleClient.ts
├── rest/
│   ├── RESTManager.ts
│   └── errors.ts
├── types/
│   ├── api.ts
│   ├── chat.ts
│   ├── events.ts
│   ├── keyboard.ts
│   ├── media.ts
│   ├── message.ts
│   ├── update.ts
│   └── user.ts
├── structures/
│   ├── Base.ts
│   ├── User.ts
│   ├── Chat.ts
│   ├── Message.ts
│   ├── CallbackQuery.ts
│   └── TypedEmitter.ts
├── managers/
│   ├── BaseManager.ts
│   ├── MessageManager.ts
│   ├── ChatManager.ts
│   ├── MediaManager.ts
│   ├── GroupManager.ts
│   ├── PaymentManager.ts
│   ├── PollingManager.ts
│   └── WebhookManager.ts
├── builders/
│   ├── BaseBuilder.ts
│   ├── InlineKeyboardBuilder.ts
│   ├── ReplyKeyboardBuilder.ts
│   ├── MessageBuilder.ts
│   └── InvoiceBuilder.ts
├── util/
│   └── Collection.ts
└── index.ts
```

### مسئولیت هر لایه

| بخش           | مسئولیت                                                   |
| ------------- | --------------------------------------------------------- |
| `BaleClient`  | نقطهٔ ورود، راه‌اندازی، نگهداری Managerها و انتشار رویدادها |
| `RESTManager` | ارسال درخواست HTTP به API بله و تبدیل پاسخ/خطا            |
| `Managers`    | اجرای عملیات حوزه‌ای مانند پیام، رسانه و گروه              |
| `Structures`  | نمایش شیءگرای داده‌های دریافتی                             |
| `Builders`    | ساخت payloadهای آماده بدون ارتباط شبکه                    |
| `Types`       | تعریف ساختار داده‌ها و قراردادهای TypeScript               |
| `Collection`  | ابزار کمکی مبتنی بر Map                                   |

قاعدهٔ معماری پروژه این است که ارتباط مستقیم با API در `RESTManager` متمرکز باشد و Managerها عملیات را از طریق آن انجام دهند. Builderها نباید درخواست شبکه ارسال کنند.

## 7. BaleClient و تنظیمات

`BaleClient` کلاس اصلی کتابخانه است و از EventEmitter تایپ‌دار استفاده می‌کند.

### سازنده

```ts
new BaleClient(options: BaleClientOptions)
```

ساختار تنظیمات:

```ts
interface BaleClientOptions {
  token: string;
  mode?: 'polling' | 'webhook';
  polling?: {
    timeout?: number;
    limit?: number;
  };
  webhook?: {
    url: string;
    port?: number;
    path?: string;
  };
}
```

| گزینه             | نوع                      |                 پیش‌فرض | توضیح                                 |
| ----------------- | ------------------------ | ---------------------: | ------------------------------------- |
| `token`           | `string`                 |                 الزامی | توکن ربات                             |
| `mode`            | `'polling' \| 'webhook'` |              `polling` | روش دریافت آپدیت                      |
| `polling.timeout` | `number`                 |                   `30` | زمان انتظار `getUpdates` بر حسب ثانیه |
| `polling.limit`   | `number`                 |                  `100` | حداکثر تعداد آپدیت در هر درخواست      |
| `webhook.url`     | `string`                 | در حالت webhook الزامی | آدرس عمومی ثبت‌شده در بله              |
| `webhook.port`    | `number`                 |                 `3000` | پورت سرور HTTP محلی                   |
| `webhook.path`    | `string`                 |        `/bale/webhook` | مسیر دریافت درخواست POST              |

### ویژگی‌های Client

```ts
client.rest       // RESTManager
client.messages   // MessageManager
client.chats      // ChatManager
client.media      // MediaManager
client.groups     // GroupManager
client.payments   // PaymentManager
client.user       // APIUser | undefined
```

`client.user` پس از دریافت موفق اطلاعات ربات در `login()` مقدار می‌گیرد؛ پیش از آن `undefined` است.

### متد login

```ts
await client.login();
```

مراحل اجرا:

1. با `getMe` اطلاعات ربات دریافت می‌شود.
2. رویداد `ready` منتشر می‌شود.
3. بر اساس `mode`، مدیر Polling یا Webhook راه‌اندازی می‌شود.

### متد destroy

```ts
await client.destroy();
```

دریافت آپدیت را متوقف می‌کند. در حالت Polling حلقه متوقف می‌شود و در حالت Webhook سرور محلی بسته شده و وبهوک از سمت بله حذف می‌شود.

## 8. رویدادها (Events)

برای گوش‌دادن به رویدادها از `on` یا `once` استفاده کنید:

```ts
client.on('messageCreate', (message) => {
  console.log(message.text);
});

client.once('ready', (user) => {
  console.log(user);
});
```

### فهرست رویدادهای تایپ‌شده

| رویداد          | آرگومان         | زمان انتشار                                |
| --------------- | --------------- | ------------------------------------------ |
| `ready`         | `APIUser`       | پس از دریافت موفق اطلاعات ربات             |
| `messageCreate` | `Message`       | هنگام دریافت `update.message`              |
| `messageEdit`   | `Message`       | هنگام دریافت `update.edited_message`       |
| `callbackQuery` | `CallbackQuery` | هنگام دریافت `update.callback_query`       |
| `webAppData`    | شیء دادهٔ مینی‌اپ | اگر پیام دریافتی دارای `web_app_data` باشد |
| `error`         | `unknown`       | هنگام انتشار خطا توسط اجزای کتابخانه       |

### نمونهٔ مدیریت پیام

```ts
client.on('messageCreate', async (message) => {
  if (!message.hasText) return;

  if (message.text === '/ping') {
    await message.reply('Pong!');
  }
});
```

### نمونهٔ مدیریت ویرایش پیام

```ts
client.on('messageEdit', (message) => {
  console.log('پیام ویرایش شد:', message.id, message.text);
});
```

### نمونهٔ Callback Query

```ts
client.on('callbackQuery', async (query) => {
  console.log('شناسه:', query.id);
  console.log('داده:', query.data);

  await query.answer('کلیک شما ثبت شد.');
});
```

### ساختار رویداد webAppData

```ts
client.on('webAppData', (payload) => {
  console.log(payload.from);
  console.log(payload.data);
  console.log(payload.buttonText);
  console.log(payload.message);
});
```

### مدیریت خطا

```ts
client.on('error', (error) => {
  console.error(error);
});
```

رویداد `error` در این کتابخانه برای گزارش خطاهای Polling و Webhook استفاده می‌شود. بهتر است همیشه listener آن را ثبت کنید.

## 9. ساختارهای داده (Structures)

Structureها پوشش‌های شیءگرای داده‌های API هستند. بسیاری از ویژگی‌های آن‌ها فقط‌خواندنی‌اند و عملیات را به Managerها واگذار می‌کنند.

### 9.1 User

```ts
class User {
  readonly id: number;
  readonly isBot: boolean;
  readonly firstName: string;
  readonly lastName?: string;
  readonly username?: string;
  readonly languageCode?: string;

  get fullName(): string;
  toString(): string;
}
```

| ویژگی          | توضیح                                                              |
| -------------- | ------------------------------------------------------------------ |
| `id`           | شناسهٔ کاربر                                                        |
| `isBot`        | آیا حساب ربات است؟                                                 |
| `firstName`    | نام                                                                |
| `lastName`     | نام خانوادگی، در صورت وجود                                         |
| `username`     | نام کاربری، در صورت وجود                                           |
| `languageCode` | کد زبان، در صورت وجود                                              |
| `fullName`     | ترکیب نام و نام خانوادگی                                           |
| `toString()`   | در صورت وجود username مقدار `@username` و در غیر این صورت نام کامل |

نمونه:

```ts
client.on('messageCreate', (message) => {
  if (message.from) {
    console.log(message.from.id);
    console.log(message.from.fullName);
    console.log(message.from.toString());
  }
});
```

### 9.2 Chat

```ts
class Chat {
  readonly id: number;
  readonly type: 'private' | 'group' | 'channel';
  readonly title?: string;
  readonly username?: string;
  readonly firstName?: string;
  readonly lastName?: string;

  get isPrivate(): boolean;
  get isGroup(): boolean;
  get isChannel(): boolean;

  send(text: string, options?): Promise<Message>;
}
```

ویژگی‌های `isPrivate`، `isGroup` و `isChannel` نوع چت را بررسی می‌کنند.

```ts
if (message.chat.isGroup) {
  console.log('این پیام از گروه آمده است.');
}

await message.chat.send('پیام جدید برای همین چت');
```

### 9.3 Message

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

  readonly raw: APIMessage;

  reply(text: string, options?): Promise<Message>;
  edit(text: string): Promise<Message>;
  delete(): Promise<void>;

  get hasText(): boolean;
  get hasCaption(): boolean;
}
```

| ویژگی            | توضیح                                   |
| ---------------- | --------------------------------------- |
| `id`             | شناسهٔ پیام (`message_id` در API)        |
| `chat`           | چت مربوط به پیام                        |
| `from`           | فرستنده، در صورت وجود                   |
| `text`           | متن پیام                                |
| `caption`        | کپشن رسانه                              |
| `date`           | تاریخ تبدیل‌شده به شیء JavaScript `Date` |
| `replyMarkup`    | کیبورد Inline پیام                      |
| `replyToMessage` | پیام مرجع، در صورت وجود                 |
| `raw`            | دادهٔ خام `APIMessage`                   |
| `hasText`        | وجود متن غیرخالی                        |
| `hasCaption`     | وجود کپشن غیرخالی                       |

**پاسخ به پیام:**

```ts
await message.reply('این یک پاسخ به پیام شماست.');
```

**ویرایش پیام:**

```ts
await message.edit('متن ویرایش‌شده');
```

ویرایش در مستندات پیاده‌سازی برای پیام‌های ارسالی خود ربات در نظر گرفته شده است و API ممکن است برای پیام‌های دیگر خطا برگرداند.

**حذف پیام:**

```ts
await message.delete();
```

**دسترسی به دادهٔ خام:**

```ts
console.log(message.raw);
```

تاریخ `Message.date` از timestamp ثانیه‌ای API به میلی‌ثانیه تبدیل می‌شود.

### 9.4 CallbackQuery

```ts
class CallbackQuery {
  readonly id: string;
  readonly from: User;
  readonly message?: Message;
  readonly data?: string;
  readonly inlineMessageId?: string;

  answer(text?: string, showAlert?: boolean): Promise<boolean>;
  editMessage(text: string): Promise<Message>;
}
```

| ویژگی             | توضیح                           |
| ----------------- | ------------------------------- |
| `id`              | شناسهٔ Callback Query            |
| `from`            | کاربری که دکمه را فشرده است     |
| `message`         | پیام متصل به دکمه، در صورت وجود |
| `data`            | مقدار `callback_data`           |
| `inlineMessageId` | شناسهٔ پیام Inline، در صورت وجود |

`answer()` برای پاسخ‌دادن به Callback و پایان‌دادن به وضعیت انتظار دکمه استفاده می‌شود:

```ts
await query.answer('انجام شد');
await query.answer('نیاز به تأیید دارد', true);
```

پارامتر دوم در صورت `true` بودن، پاسخ را به شکل هشدار نمایش می‌دهد.

`editMessage()` پیام متصل را ویرایش می‌کند. اگر Callback پیام متصل نداشته باشد، Promise با خطا رد می‌شود:

```ts
if (query.message) {
  await query.editMessage('محتوای تازه');
}
```

## 10. مدیرها (Managers)

Managerها از طریق Client در دسترس‌اند. هر Manager عملیات یک حوزه را انجام می‌دهد.

### 10.1 MessageManager

دسترسی:

```ts
client.messages
```

متدها:

| متد      | امضا                              | خروجی              |
| -------- | --------------------------------- | ------------------ |
| `send`   | `send(chatId, content, options?)` | `Promise<Message>` |
| `edit`   | `edit(chatId, messageId, text)`   | `Promise<Message>` |
| `delete` | `delete(chatId, messageId)`       | `Promise<void>`    |

ارسال پیام:

```ts
await client.messages.send(123456789, 'سلام');
```

ارسال با گزینه‌ها:

```ts
await client.messages.send(chatId, 'سلام', {
  reply_to_message_id: messageId,
  reply_markup: keyboard,
});
```

پارامتر `content` می‌تواند رشته یا خروجی `MessageBuilder` باشد:

```ts
const content = new MessageBuilder()
  .setText('به پنل خوش آمدید')
  .setKeyboard(keyboard)
  .build();

await client.messages.send(chatId, content);
```

**توجه به نوع گزینه‌ها:** در پیاده‌سازی فعلی `SendMessageOptions.reply_markup` از نوع `InlineKeyboardMarkup` تعریف شده است؛ برای ارسال Reply Keyboard از این مسیر، ممکن است به اصلاح نوع در سورس نیاز باشد، هرچند `MessageBuilder` هر دو نوع مارک‌آپ را می‌پذیرد.

### 10.2 ChatManager

دسترسی:

```ts
client.chats
```

متد `fetch` اطلاعات چت را از API دریافت کرده و یک `Chat` برمی‌گرداند:

```ts
const chat = await client.chats.fetch(chatId);

console.log(chat.id);
console.log(chat.type);
console.log(chat.title);
```

امضا:

```ts
fetch(chatId: number | string): Promise<Chat>
```

### 10.3 MediaManager

دسترسی:

```ts
client.media
```

متدهای ارسال:

```ts
client.media.sendPhoto(chatId, photo, options?)
client.media.sendDocument(chatId, document, options?)
client.media.sendVideo(chatId, video, options?)
client.media.sendAudio(chatId, audio, options?)
client.media.sendVoice(chatId, voice, options?)
```

تمام متدهای ارسال، در صورت موفقیت `Promise<Message>` برمی‌گردانند.

متدهای فایل:

```ts
client.media.getFileInfo(fileId) // Promise<BaleFile>
client.media.downloadFile(fileId) // Promise<Buffer>
```

جزئیات در بخش رسانه آمده است.

### 10.4 GroupManager

دسترسی:

```ts
client.groups
```

متدهای مدیریتی:

| متد                                                   | توضیح                         | خروجی                              |
| ----------------------------------------------------- | ----------------------------- | ---------------------------------- |
| `promote(chatId, userId, options)`                    | ارتقای کاربر و تنظیم دسترسی‌ها | `Promise<boolean>`                 |
| `ban(chatId, userId)`                                 | مسدودکردن عضو                 | `Promise<boolean>`                 |
| `unban(chatId, userId)`                               | رفع مسدودی عضو                | `Promise<boolean>`                 |
| `pinMessage(chatId, messageId, disableNotification?)` | سنجاق پیام                    | `Promise<boolean>`                 |
| `unpinMessage(chatId, messageId)`                     | برداشتن سنجاق پیام مشخص       | `Promise<boolean>`                 |
| `unpinAllMessages(chatId)`                            | برداشتن سنجاق همهٔ پیام‌ها      | `Promise<boolean>`                 |
| `createInviteLink(chatId, options?)`                  | ساخت لینک دعوت                | `Promise<{ invite_link: string }>` |
| `getMemberCount(chatId)`                              | دریافت تعداد اعضا             | `Promise<number>`                  |

### 10.5 PaymentManager

دسترسی:

```ts
client.payments
```

متدها:

```ts
client.payments.sendInvoice(chatId, invoice, options?)
client.payments.answerPreCheckout(preCheckoutQueryId, ok, errorMessage?)
```

`sendInvoice` یک `Message` و `answerPreCheckout` یک مقدار boolean برمی‌گرداند.

## 11. کار با پیام‌ها

### ارسال متن

```ts
await client.messages.send(chatId, 'سلام بله!');
```

### ارسال پاسخ به پیام مشخص

```ts
await client.messages.send(chatId, 'پاسخ شما', {
  reply_to_message_id: originalMessageId,
});
```

### ویرایش پیام

```ts
const updated = await client.messages.edit(chatId, messageId, 'متن جدید');
```

### حذف پیام

```ts
await client.messages.delete(chatId, messageId);
```

### استفاده از Chat و Message

اگر یک پیام دریافت کرده‌اید، معمولاً نیازی به واردکردن دوبارهٔ شناسهٔ چت نیست:

```ts
await message.chat.send('پیام در همین چت');
await message.reply('پاسخ به همین پیام');
```

### بررسی محتوای پیام

```ts
client.on('messageCreate', async (message) => {
  if (message.hasText) {
    console.log('متن:', message.text);
  }

  if (message.hasCaption) {
    console.log('کپشن:', message.caption);
  }

  if (message.document) {
    console.log('شناسه فایل:', message.document.file_id);
  }
});
```

## 12. کیبوردها و دکمه‌ها

کتابخانه دو Builder برای کیبورد دارد:

- `InlineKeyboardBuilder`: دکمه‌هایی که زیر پیام نمایش داده می‌شوند.
- `ReplyKeyboardBuilder`: کیبورد سفارشی که جایگزین صفحه‌کلید ورودی می‌شود.

### 12.1 InlineKeyboardBuilder

ایمپورت:

```ts
import { InlineKeyboardBuilder } from '@persian-caesar/bale.js';
```

افزودن دکمه:

```ts
const keyboard = new InlineKeyboardBuilder()
  .addButton('نمایش محصولات', { callback_data: 'products' })
  .addButton('سبد خرید', { callback_data: 'cart' })
  .addButton('وب‌سایت', { url: 'https://example.com' })
  .build();
```

گزینه‌های دکمه در پیاده‌سازی:

| گزینه           | نوع                                  | کاربرد                 |
| --------------- | ------------------------------------ | ---------------------- |
| `url`           | `string`                             | بازکردن نشانی اینترنتی |
| `callback_data` | `string`                             | ارسال داده هنگام کلیک  |
| `web_app`       | `{ url: string }`                    | بازکردن Web App        |
| `color`         | `'primary' \| 'success' \| 'danger'` | رنگ دکمه               |

رنگ، در صورت پشتیبانی سمت بله، یکی از مقادیر تعریف‌شده خواهد بود.

#### تنظیم تعداد دکمه در هر ردیف با adjust

```ts
const keyboard = new InlineKeyboardBuilder()
  .addButton('یک')
  .addButton('دو')
  .addButton('سه')
  .addButton('چهار')
  .adjust(2, 1)
  .build();
```

چیدمان حاصل:
- ردیف اول: دو دکمه
- ردیف دوم: یک دکمه
- ردیف سوم: دکمهٔ باقی‌مانده

اگر `adjust()` فراخوانی نشود، دکمه‌هایی که با `addButton()` اضافه شده‌اند در یک ردیف قرار می‌گیرند.

#### افزودن ردیف دستی

```ts
const keyboard = new InlineKeyboardBuilder()
  .addRow(
    { text: 'تأیید', callback_data: 'confirm' },
    { text: 'لغو', callback_data: 'cancel' },
  )
  .build();
```

#### ارسال کیبورد

```ts
await message.reply('یک گزینه را انتخاب کنید:', {
  reply_markup: keyboard,
});
```

#### پردازش callback_data

```ts
client.on('callbackQuery', async (query) => {
  switch (query.data) {
    case 'products':
      await query.answer('در حال نمایش محصولات');
      if (query.message) await query.editMessage('فهرست محصولات');
      break;

    case 'cart':
      await query.answer('سبد خرید شما');
      break;
  }
});
```

### 12.2 ReplyKeyboardBuilder

نمونه:

```ts
import { ReplyKeyboardBuilder } from '@persian-caesar/bale.js';

const keyboard = new ReplyKeyboardBuilder()
  .addButton('ارسال مخاطب', { request_contact: true })
  .addButton('ارسال موقعیت', { request_location: true })
  .addButton('راهنما')
  .adjust(2, 1)
  .setOptions({
    resize_keyboard: true,
    one_time_keyboard: true,
    selective: false,
  })
  .build();
```

گزینه‌های هر دکمه:

- `request_contact`: درخواست ارسال مخاطب
- `request_location`: درخواست ارسال موقعیت

گزینه‌های خود کیبورد:

| گزینه               | نوع       | کاربرد                          |
| ------------------- | --------- | ------------------------------- |
| `resize_keyboard`   | `boolean` | درخواست تغییر اندازهٔ کیبورد     |
| `one_time_keyboard` | `boolean` | درخواست مخفی‌شدن پس از انتخاب    |
| `selective`         | `boolean` | نمایش انتخابی برای کاربران مشخص |

ارسال:

```ts
await client.messages.send(chatId, 'از دکمه‌ها استفاده کنید:', {
  reply_markup: keyboard,
} as any);
```

> در نسخهٔ فعلی، نوع `SendMessageOptions.reply_markup` فقط Inline Keyboard را مشخص کرده است. استفاده از Reply Keyboard در این مسیر از نظر TypeScript به اصلاح تعریف نوع یا تبدیل نوع نیاز دارد. این محدودیت در بخش پایانی توضیح داده شده است.

### 12.3 MessageBuilder

برای ساخت یک پیام متنی همراه کیبورد:

```ts
import { MessageBuilder, InlineKeyboardBuilder } from '@persian-caesar/bale.js';

const keyboard = new InlineKeyboardBuilder()
  .addButton('ادامه', { callback_data: 'continue' })
  .build();

const payload = new MessageBuilder()
  .setText('آیا مایل به ادامه هستید؟')
  .setKeyboard(keyboard)
  .build();

await client.messages.send(chatId, payload);
```

متدها:

| متد                   | توضیح                          |
| --------------------- | ------------------------------ |
| `setText(text)`       | تنظیم متن                      |
| `setKeyboard(markup)` | تنظیم Inline یا Reply Keyboard |
| `build()`             | تولید شیء `BuiltMessage`       |

اگر متن خالی باشد، `build()` خطا پرتاب می‌کند.

## 13. ارسال و دریافت فایل و رسانه

### انواع ورودی فایل

نوع `FileInput` در سورس:

```ts
type FileInput = Buffer | string | URL;
```

سه شکل ورودی قابل استفاده است:

1. `Buffer` برای آپلود فایل از حافظه
2. رشته برای `file_id` یا URL
3. شیء `URL` برای نشانی اینترنتی

در پیاده‌سازی `MediaManager`:
- `Buffer` به شکل `multipart/form-data` ارسال می‌شود.
- رشته و `URL` به‌عنوان مقدار فیلد رسانه در بدنهٔ درخواست قرار می‌گیرند.

### 13.1 ارسال عکس

```ts
await client.media.sendPhoto(chatId, 'https://example.com/photo.jpg', {
  caption: 'تصویر نمونه',
});
```

آپلود از دیسک:

```ts
import { readFile } from 'node:fs/promises';

const photo = await readFile('./assets/photo.jpg');

await client.media.sendPhoto(chatId, photo, {
  caption: 'تصویر بارگذاری‌شده',
});
```

### 13.2 ارسال سند

```ts
const document = await readFile('./files/report.pdf');

await client.media.sendDocument(chatId, document, {
  caption: 'گزارش',
});
```

### 13.3 ارسال ویدیو

```ts
const video = await readFile('./media/video.mp4');

await client.media.sendVideo(chatId, video, {
  caption: 'ویدیوی نمونه',
  duration: 30,
  width: 1280,
  height: 720,
  supports_streaming: true,
});
```

### 13.4 ارسال صوت

```ts
await client.media.sendAudio(chatId, await readFile('./media/song.mp3'), {
  caption: 'فایل صوتی',
  title: 'عنوان',
  performer: 'هنرمند',
  duration: 120,
});
```

### 13.5 ارسال Voice

```ts
await client.media.sendVoice(chatId, await readFile('./media/voice.ogg'), {
  duration: 8,
});
```

### 13.6 گزینه‌های مشترک رسانه

`SendMediaBaseOptions` شامل موارد زیر است:

| گزینه                         | نوع                                    | توضیح                                 |
| ----------------------------- | -------------------------------------- | ------------------------------------- |
| `caption`                     | `string`                               | کپشن رسانه                            |
| `parse_mode`                  | `'Markdown' \| 'MarkdownV2' \| 'HTML'` | حالت تفسیر کپشن                       |
| `caption_entities`            | `MessageEntity[]`                      | موجودیت‌های قالب‌بندی کپشن              |
| `disable_notification`        | `boolean`                              | ارسال بدون اعلان                      |
| `protect_content`             | `boolean`                              | محافظت از محتوا                       |
| `reply_to_message_id`         | `number`                               | پاسخ به پیام مشخص                     |
| `allow_sending_without_reply` | `boolean`                              | اجازهٔ ارسال حتی در صورت حذف پیام مرجع |
| `reply_markup`                | `InlineKeyboardMarkup`                 | کیبورد Inline                         |

گزینه‌های اختصاصی:

- عکس: `has_spoiler`
- سند: `disable_content_type_detection`
- ویدیو: `duration`، `width`، `height`، `supports_streaming`، `has_spoiler`
- صوت: `duration`، `performer`، `title`
- Voice: `duration`

### 13.7 دریافت اطلاعات فایل

```ts
const info = await client.media.getFileInfo(fileId);

console.log(info.file_id);
console.log(info.file_unique_id);
console.log(info.file_size);
console.log(info.file_path);
```

نوع `BaleFile`:

```ts
interface BaleFile {
  file_id: string;
  file_unique_id: string;
  file_size?: number;
  file_path?: string;
}
```

### 13.8 دانلود فایل

```ts
const buffer = await client.media.downloadFile(fileId);
```

ذخیره روی دیسک:

```ts
import { writeFile } from 'node:fs/promises';

const buffer = await client.media.downloadFile(fileId);
await writeFile('./downloads/file.bin', buffer);
```

اگر پاسخ `getFile` فاقد `file_path` باشد، متد `downloadFile` خطا می‌دهد.

### 13.9 دریافت فایل از پیام

```ts
import { writeFile } from 'node:fs/promises';

client.on('messageCreate', async (message) => {
  if (message.document) {
    const fileId = message.document.file_id;
    const buffer = await client.media.downloadFile(fileId);

    await writeFile('./downloads/document.bin', buffer);
    await message.reply('فایل دریافت شد.');
  }
});
```

ساختارهای دادهٔ رسانه در `APIMessage` شامل `photo`، `document`، `audio`، `video`، `voice` و `sticker` هستند.

## 14. مدیریت گروه

تمام عملیات این بخش از `client.groups` قابل دسترسی‌اند. انجام موفق عملیات به دسترسی‌های ربات در گروه و محدودیت‌های سمت بله وابسته است.

### 14.1 ارتقای کاربر به مدیر

```ts
await client.groups.promote(chatId, userId, {
  can_change_info: true,
  can_delete_messages: true,
  can_invite_users: true,
  can_restrict_members: true,
  can_pin_messages: true,
  can_promote_members: false,
});
```

نوع گزینه‌ها:

```ts
interface PromoteOptions {
  can_change_info?: boolean;
  can_delete_messages?: boolean;
  can_invite_users?: boolean;
  can_restrict_members?: boolean;
  can_pin_messages?: boolean;
  can_promote_members?: boolean;
}
```

### 14.2 مسدودکردن کاربر

```ts
const success = await client.groups.ban(chatId, userId);
```

### 14.3 رفع مسدودی

```ts
const success = await client.groups.unban(chatId, userId);
```

### 14.4 سنجاق‌کردن پیام

```ts
await client.groups.pinMessage(chatId, messageId);
```

برای غیرفعال‌کردن اعلان سنجاق:

```ts
await client.groups.pinMessage(chatId, messageId, true);
```

### 14.5 برداشتن سنجاق

```ts
await client.groups.unpinMessage(chatId, messageId);
```

برداشتن سنجاق همهٔ پیام‌ها:

```ts
await client.groups.unpinAllMessages(chatId);
```

### 14.6 ساخت لینک دعوت

```ts
const result = await client.groups.createInviteLink(chatId, {
  member_limit: 50,
  expire_date: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
});

console.log(result.invite_link);
```

`expire_date` در نمونه به‌صورت timestamp ثانیه‌ای محاسبه شده است.

نوع گزینه‌ها:

```ts
interface InviteLinkOptions {
  expire_date?: number;
  member_limit?: number;
}
```

### 14.7 دریافت تعداد اعضا

```ts
const count = await client.groups.getMemberCount(chatId);
console.log('تعداد اعضا:', count);
```

## 15. پرداخت و فاکتور

کتابخانه `InvoiceBuilder` برای ساخت payload فاکتور و `PaymentManager` برای ارسال فاکتور و پاسخ به Pre-checkout دارد.

### 15.1 ساخت فاکتور

```ts
import { InvoiceBuilder } from '@persian-caesar/bale.js';

const invoice = new InvoiceBuilder()
  .setTitle('اشتراک ویژه')
  .setDescription('اشتراک یک‌ماهه')
  .setPayload('premium_monthly_001')
  .setProviderToken(process.env.PROVIDER_TOKEN!)
  .setCurrency('IRR')
  .addPrice('اشتراک یک‌ماهه', 50000)
  .requireName()
  .requirePhone()
  .requireEmail()
  .build();
```

### متدهای InvoiceBuilder

| متد                           | کاربرد                           |
| ----------------------------- | -------------------------------- |
| `setTitle(title)`             | عنوان فاکتور                     |
| `setDescription(description)` | توضیحات                          |
| `setPayload(payload)`         | شناسهٔ داخلی سفارش                |
| `setProviderToken(token)`     | توکن ارائه‌دهندهٔ پرداخت           |
| `setCurrency(currency)`       | واحد پول                         |
| `addPrice(label, amount)`     | افزودن ردیف قیمت                 |
| `setPhotoUrl(url)`            | تصویر فاکتور                     |
| `requireName()`               | درخواست نام                      |
| `requirePhone()`              | درخواست شماره تلفن               |
| `requireEmail()`              | درخواست ایمیل                    |
| `build()`                     | اعتبارسنجی حداقلی و ساخت payload |

`build()` در این نسخه بررسی می‌کند که عنوان، توضیحات، payload و دست‌کم یک ردیف قیمت وجود داشته باشند. این متد وجود `provider_token` و `currency` را در سطح کد اعتبارسنجی نمی‌کند؛ با این حال برای ارسال واقعی باید مقادیر معتبر فراهم کنید.

### 15.2 ارسال فاکتور

```ts
const sentInvoice = await client.payments.sendInvoice(chatId, invoice);
```

### 15.3 پاسخ به Pre-checkout

```ts
await client.payments.answerPreCheckout(queryId, true);
```

برای رد:

```ts
await client.payments.answerPreCheckout(
  queryId,
  false,
  'اطلاعات سفارش معتبر نیست.',
);
```

**محدودیت مهم نسخهٔ فعلی:** نوع `PreCheckoutQuery` در `types/update.ts` تعریف شده و `answerPreCheckout()` نیز وجود دارد؛ اما `BaleClient.dispatchUpdate()` آن را به رویداد منتشر نمی‌کند و `ClientEvents` نیز رویداد `preCheckoutQuery` ندارد. بنابراین نمونهٔ listener زیر با پیاده‌سازی فعلی قابل اتکا نیست، مگر اینکه این قابلیت در سورس تکمیل شود:

```ts
// این نمونه نیازمند پیاده‌سازی انتشار preCheckoutQuery در کتابخانه است.
client.on('preCheckoutQuery', async (query) => {
  await client.payments.answerPreCheckout(query.id, true);
});
```

برای فعال‌سازی کامل، باید در `dispatchUpdate`، `update.pre_checkout_query` بررسی و رویداد متناظر تعریف و منتشر شود.

## 16. مینی‌اپ‌ها (Web Apps)

برای بازکردن مینی‌اپ از دکمهٔ Inline با ویژگی `web_app` استفاده کنید:

```ts
import { InlineKeyboardBuilder } from '@persian-caesar/bale.js';

const keyboard = new InlineKeyboardBuilder()
  .addButton('باز کردن فروشگاه', {
    web_app: {
      url: 'https://shop.example.com',
    },
  })
  .build();

await message.reply('برای ورود به فروشگاه کلیک کنید:', {
  reply_markup: keyboard,
});
```

هنگامی که دادهٔ Web App در پیام ورودی وجود داشته باشد، Client رویداد `webAppData` را منتشر می‌کند:

```ts
client.on('webAppData', (payload) => {
  console.log('فرستنده:', payload.from);
  console.log('داده:', payload.data);
  console.log('متن دکمه:', payload.buttonText);
  console.log('پیام:', payload.message);
});
```

ساختار payload:

```ts
{
  from: APIUser | undefined;
  data: string;
  buttonText: string;
  message: Message;
}
```

دادهٔ دریافتی از سمت کاربر را ورودی قابل اعتماد فرض نکنید؛ در سمت سرور اعتبارسنجی کنید.

## 17. RESTManager و خطاها

### 17.1 RESTManager

`RESTManager` لایهٔ ارتباط HTTP با API بله است. در Client از طریق `client.rest` قابل دسترسی است.

آدرس پایه در پیاده‌سازی:

```text
https://tapi.bale.ai/bot<TOKEN>
```

هر متد API با درخواست POST فراخوانی می‌شود.

### متد عمومی request

```ts
request<T>(method: string, options?: RequestOptions): Promise<T>
```

نوع گزینه‌ها:

```ts
interface RequestOptions {
  body?: Record<string, unknown>;
  files?: Record<
    string,
    {
      data: Buffer | Uint8Array;
      filename: string;
      contentType?: string;
    }
  >;
}
```

- اگر `files` وجود داشته باشد، بدنه از نوع `FormData` ساخته می‌شود.
- در غیر این صورت بدنه به JSON تبدیل می‌شود.
- در صورت `ok: false` در پاسخ API، خطای `BaleAPIError` پرتاب می‌شود.
- در صورت موفقیت، مقدار `result` بازگردانده می‌شود.

### میان‌برهای RESTManager

| متد                      | کاربرد                   |
| ------------------------ | ------------------------ |
| `getMe()`                | دریافت اطلاعات ربات      |
| `sendMessage(params)`    | ارسال پیام               |
| `getUpdates(params?)`    | دریافت آپدیت‌ها           |
| `setWebhook(url)`        | ثبت وبهوک                |
| `deleteWebhook()`        | حذف وبهوک                |
| `getFile(fileId)`        | دریافت اطلاعات فایل      |
| `downloadFile(filePath)` | دانلود فایل با مسیر فایل |

نمونهٔ استفادهٔ مستقیم:

```ts
const me = await client.rest.getMe();
console.log(me.username);
```

در برنامه‌های معمول بهتر است از متدهای سطح بالاتر مانند `client.messages.send()` یا `client.media.sendPhoto()` استفاده کنید تا تبدیل Structureها و قراردادهای کتابخانه حفظ شود.

### 17.2 BaleAPIError

کلاس خطای API:

```ts
class BaleAPIError extends Error {
  readonly code: number;
  readonly parameters?: ResponseParameters;
}
```

پارامترهای تکمیلی:

```ts
interface ResponseParameters {
  migrate_to_chat_id?: number;
  retry_after?: number;
}
```

مدیریت خطا:

```ts
import { BaleAPIError } from '@persian-caesar/bale.js';

try {
  await client.messages.send(chatId, 'سلام');
} catch (error) {
  if (error instanceof BaleAPIError) {
    console.error('کد خطا:', error.code);
    console.error('پیام:', error.message);
    console.error('پارامترها:', error.parameters);
  } else {
    console.error('خطای غیر API:', error);
  }
}
```

### مدیریت محدودیت نرخ درخواست (429)

`PollingManager` در صورت دریافت `BaleAPIError` با کد `429`، مقدار `retry_after` را می‌خواند و به همان تعداد ثانیه صبر می‌کند. اگر این مقدار در پاسخ نباشد، یک ثانیه تأخیر می‌دهد.

برای سایر خطاهای Polling، دو ثانیه تأخیر اعمال می‌شود و رویداد `error` منتشر خواهد شد.

## 18. TypeScript و انواع داده

انواع عمومی از مسیر اصلی پکیج export شده‌اند. نمونه:

```ts
import type {
  APIResponse,
  APIUser,
  APIChat,
  APIMessage,
  Update,
  APICallbackQuery,
  PreCheckoutQuery,
  InlineKeyboardMarkup,
  InlineKeyboardButton,
  ReplyKeyboardMarkup,
  KeyboardButton,
  MessageEntity,
} from '@persian-caesar/bale.js';
```

### خانوادهٔ Typeها

| فایل          | انواع مهم                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `api.ts`      | `APIResponse`، `ResponseParameters`                                                                                                                    |
| `user.ts`     | `APIUser`                                                                                                                                              |
| `chat.ts`     | `APIChat`، `ChatType`                                                                                                                                  |
| `message.ts`  | `APIMessage`، `PhotoSize`، `Document`، `Audio`، `Video`، `Voice`، `Sticker`، `Contact`، `Location`، `SuccessfulPayment`، `WebAppData`، `MessageEntity` |
| `update.ts`   | `Update`، `APICallbackQuery`، `PreCheckoutQuery`، `OrderInfo`                                                                                          |
| `keyboard.ts` | `ButtonColor`، `InlineKeyboardButton`، `InlineKeyboardMarkup`، `KeyboardButton`، `ReplyKeyboardMarkup`، `ReplyKeyboardRemove`                          |
| `media.ts`    | `FileInput`، `ResolvedFileInput`، `BaleFile`، گزینه‌های ارسال رسانه                                                                                     |

### APIUser در برابر User

این دو را با هم اشتباه نگیرید:

- `APIUser` شکل خام دادهٔ دریافتی از API است و نام فیلدها را به شکل snake_case نگه می‌دارد.
- `User` یک Structure است که ویژگی‌های camelCase مانند `firstName` و `isBot` دارد.

برای نمونه، رویداد `ready` در تعریف فعلی `APIUser` برمی‌گرداند، اما `message.from` از نوع Structure یعنی `User` است.

### APIMessage

`APIMessage` دادهٔ خام پیام را نمایش می‌دهد و شامل شناسه، چت، تاریخ، متن، کپشن، فرستنده، پیام مرجع و فیلدهای رسانه‌ای است.

### Update

```ts
interface Update {
  update_id: number;
  message?: APIMessage;
  edited_message?: APIMessage;
  callback_query?: APICallbackQuery;
  pre_checkout_query?: PreCheckoutQuery;
}
```

وجود فیلد در این Interface به‌تنهایی تضمین نمی‌کند که Client برای آن رویداد منتشر می‌کند.

## 19. Collection

`Collection<K, V>` یک کلاس توسعه‌یافته از `Map<K, V>` است.

```ts
import { Collection } from '@persian-caesar/bale.js';

const users = new Collection<number, string>();

users.set(1, 'Ali');
users.set(2, 'Sara');

console.log(users.first());
console.log(users.last());
```

### متدها

| متد            | خروجی              | توضیح                    |
| -------------- | ------------------ | ------------------------ |
| `toArray()`    | `V[]`              | تبدیل مقادیر به آرایه    |
| `toKeyArray()` | `K[]`              | تبدیل کلیدها به آرایه    |
| `first()`      | `V \| undefined`   | اولین مقدار              |
| `last()`       | `V \| undefined`   | آخرین مقدار              |
| `filter(fn)`   | `Collection<K, V>` | ساخت Collection فیلترشده |
| `map(fn)`      | `T[]`              | نگاشت مقادیر به آرایه    |

مثال فیلتر:

```ts
const scores = new Collection<string, number>([
  ['ali', 18],
  ['sara', 9],
  ['reza', 15],
]);

const passed = scores.filter((score) => score >= 10);

console.log(passed.toArray()); // [18, 15]
```

مثال map:

```ts
const names = users.map((value, key) => `${key}: ${value}`);
```

تمام متدهای استاندارد `Map` نیز در دسترس‌اند؛ از جمله `get`، `set`، `has`، `delete`، `clear`، `keys`، `values` و `entries`.

## 20. راه‌اندازی در محیط عملیاتی

### 20.1 انتخاب Polling یا Webhook

#### Polling

در Polling، کتابخانه به‌صورت پیوسته `getUpdates` را فراخوانی می‌کند.

```ts
const client = new BaleClient({
  token,
  mode: 'polling',
  polling: {
    timeout: 30,
    limit: 100,
  },
});
```

مزایا:
- برای شروع ساده است.
- به endpoint ورودی عمومی برای دریافت آپدیت نیاز ندارد.
- برای توسعهٔ محلی مناسب است.

ملاحظات:
- پردازش آپدیت‌ها وابسته به روشن‌بودن فرایند ربات است.
- مقدار `offset` در حافظهٔ PollingManager نگهداری می‌شود؛ در صورت راه‌اندازی مجدد فرایند، مقدار آن از صفر آغاز خواهد شد.
- اطلاعات نگهداری آپدیت‌ها و محدودیت‌های سمت بله را در طراحی سیستم در نظر بگیرید.

#### Webhook

در Webhook، بله به آدرس عمومی شما درخواست POST می‌فرستد و `WebhookManager` یک HTTP server محلی ایجاد می‌کند.

```ts
const client = new BaleClient({
  token,
  mode: 'webhook',
  webhook: {
    url: 'https://example.com/bale/webhook',
    port: 3000,
    path: '/bale/webhook',
  },
});

await client.login();
```

نکات:
- `url` آدرس عمومی ثبت‌شده در بله است.
- `port` پورتی است که سرور محلی Node روی آن گوش می‌دهد.
- `path` مسیر محلی دریافت درخواست است.
- سرور فقط درخواست POST روی مسیر تنظیم‌شده را می‌پذیرد.
- درخواست‌های نامعتبر از نظر مسیر یا متد، پاسخ 404 می‌گیرند.
- اگر JSON قابل parse نباشد، رویداد `error` منتشر و پاسخ 400 ارسال می‌شود.

اگر از Reverse Proxy مانند Nginx یا Caddy استفاده می‌کنید، باید مسیر عمومی را به پورت محلی برنامه هدایت کنید و الزامات پورت مورد قبول بله را رعایت کنید.

### 20.2 توقف صحیح

```ts
await client.destroy();
```

این متد را هنگام خاموش‌کردن برنامه فراخوانی کنید. در برنامه‌های Node می‌توانید سیگنال‌های سیستم‌عامل را مدیریت کنید:

```ts
const shutdown = async () => {
  await client.destroy();
  process.exit(0);
};

process.once('SIGINT', () => void shutdown());
process.once('SIGTERM', () => void shutdown());
```

### 20.3 اجرای build

اسکریپت‌های تعریف‌شده در `package.json`:

| دستور                   | کاربرد                           |
| ----------------------- | -------------------------------- |
| `npm run build`         | کامپایل TypeScript به `dist/`    |
| `npm run dev`           | کامپایل در حالت watch            |
| `npm run lint`          | اجرای ESLint                     |
| `npm run format`        | اجرای Prettier روی `src/**/*.ts` |
| `npm test`              | اجرای تست‌ها                      |
| `npm run test:watch`    | اجرای تست‌ها در حالت watch        |
| `npm run test:coverage` | اجرای تست همراه گزارش پوشش       |
| `npm run docs`          | تولید مستندات TypeDoc            |

پیشنهاد برای بررسی پیش از انتشار:

```bash
npm run lint
npm run build
npm run test:coverage
```

### 20.4 تست

پروژه از Vitest استفاده می‌کند. فایل‌های تست با پسوند `.test.ts` در پوشهٔ `tests/` قرار می‌گیرند.

برای تست درخواست‌های HTTP، درخواست‌های `undici.request` را mock کنید تا تست به سرویس واقعی وابسته نباشد.

## 21. عیب‌یابی و پرسش‌های متداول

### ربات بعد از login پیام دریافت نمی‌کند

موارد زیر را بررسی کنید:

1. توکن معتبر باشد.
2. مقدار `mode` درست تنظیم شده باشد.
3. در حالت Webhook، آدرس عمومی و مسیر ورودی صحیح باشند.
4. اگر قبلاً Webhook فعال کرده‌اید، با Polling تداخل نداشته باشد.
5. listener رویداد `error` را ثبت کرده باشید.

### خطای 429 دریافت می‌کنم

این خطا به محدودیت نرخ درخواست مربوط است. PollingManager برای خطای 429 از `retry_after` استفاده می‌کند. برای درخواست‌های دستی نیز بهتر است محدودیت نرخ API را رعایت کنید.

### چرا message.text مقدار ندارد؟

همهٔ پیام‌ها متنی نیستند. ممکن است پیام شامل عکس، سند، ویدیو، صوت، موقعیت یا مخاطب باشد. پیش از استفاده از متن، `message.hasText` را بررسی کنید و فیلد رسانه‌ای مناسب را بخوانید.

### چطور فایل دریافتی را دانلود کنم؟

شناسهٔ فایل را از فیلد رسانه‌ای پیام بردارید و به `client.media.downloadFile(fileId)` بدهید.

### آیا می‌توانم از JavaScript استفاده کنم؟

بله. خروجی JavaScript و Type Declarationها در پکیج وجود دارد. برای بهره‌مندی از تکمیل خودکار و بررسی نوع، TypeScript یا ادیتوری با پشتیبانی از تعریف نوع توصیه می‌شود.

### آیا Polling و Webhook هم‌زمان قابل استفاده‌اند؟

در طراحی Client، این دو حالت به‌صورت انتخابی هستند. در سمت API بله نیز ثبت Webhook با دریافت آپدیت از طریق `getUpdates` سازگار نیست. در هر زمان یکی از روش‌ها را انتخاب کنید.

### آیا رویداد preCheckoutQuery وجود دارد؟

در تعریف `Update` نوع `PreCheckoutQuery` موجود است و متد پاسخ‌دهی پرداخت نیز پیاده‌سازی شده؛ اما انتشار رویداد در Client فعلی وجود ندارد. برای جزئیات به بخش [پرداخت](#15-پرداخت-و-فاکتور) و [محدودیت‌ها](#23-محدودیتها-و-نکات-قابل-توجه-در-نسخه-فعلی) مراجعه کنید.

## 22. مشارکت در توسعه

مشارکت در پروژه از طریق گزارش باگ، پیشنهاد قابلیت، بهبود مستندات و Pull Request امکان‌پذیر است.

### آماده‌سازی محیط توسعه

```bash
git clone https://github.com/Persian-Caesar/bale.js.git
cd bale.js
npm install
npm run build
```

### استانداردهای کدنویسی

- از TypeScript strict استفاده کنید.
- از `any` تا حد امکان دوری کنید.
- برای importهای صرفاً نوعی از `import type` استفاده کنید.
- ویژگی‌های عمومی Structureها را تا جای ممکن `readonly` تعریف کنید.
- برای API عمومی JSDoc بنویسید.
- تست مرتبط با تغییر را اضافه کنید.
- تغییرات معماری را با الگوی موجود هماهنگ کنید.

### قالب پیام Commit

پروژه از Conventional Commits پیروی می‌کند:

```text
<type>(<scope>): <subject>
```

نمونه‌ها:

```text
feat(builders): add invoice builder option
fix(rest): handle file upload response
docs(managers): document media methods
test(collection): cover last method
```

انواع رایج:
- `feat`: قابلیت جدید
- `fix`: رفع باگ
- `docs`: مستندات
- `refactor`: بازآرایی
- `test`: تست
- `perf`: بهبود کارایی
- `build`: تغییرات ساخت و وابستگی
- `ci`: تنظیمات CI
- `chore`: کارهای نگهداری

### Pull Request

پیش از ارسال PR:

```bash
npm run lint
npm run build
npm run test:coverage
```

اگر API عمومی تغییر کرده است، مستندات و JSDoc را هم به‌روز کنید.

## 23. محدودیت‌ها و نکات قابل توجه در نسخهٔ فعلی

این بخش عمداً بر اساس بررسی سورس همین نسخه نوشته شده است تا مثال‌های مستندات چیزی فراتر از پیاده‌سازی واقعی وعده ندهند.

1. **رویداد Pre-checkout کامل نشده است.** نوع `PreCheckoutQuery` و متد `answerPreCheckout` وجود دارند، اما `dispatchUpdate` آن را منتشر نمی‌کند و `ClientEvents` نیز این رویداد را تعریف نکرده است.
2. **رویداد `ready` دادهٔ خام API می‌دهد.** نوع آن `APIUser` است، نه Structure `User`.
3. **نوع reply_markup در MessageManager محدود است.** `SendMessageOptions` فقط `InlineKeyboardMarkup` را تعریف کرده، در حالی که `MessageBuilder` هر دو نوع Inline و Reply Keyboard را می‌پذیرد.
4. **ویرایش پیام در Structure محدود به متن است.** `Message.edit(text)` فقط متن را می‌گیرد و گزینه‌های ویرایش یا تغییر کیبورد ارائه نمی‌کند.
5. **توزیع Updateها محدود است.** `dispatchUpdate` در نسخهٔ فعلی پیام جدید، پیام ویرایش‌شده، Callback Query و دادهٔ Web App را پردازش می‌کند؛ سایر انواع Update تعریف‌شده یا احتمالی به رویداد تبدیل نمی‌شوند.
6. **Polling offset پایدار نیست.** مقدار offset در حافظه نگهداری می‌شود و با شروع مجدد فرایند از مقدار اولیه آغاز خواهد شد.
7. **Webhook احراز هویت اختصاصی در Handler نشان نمی‌دهد.** Handler مسیر و متد را بررسی می‌کند و JSON را parse می‌کند؛ برای استقرار عمومی، لایهٔ محافظتی مناسب و کنترل منشأ درخواست را در زیرساخت خود در نظر بگیرید.
8. **اعتبارسنجی Builder فاکتور حداقلی است.** وجود عنوان، توضیحات، payload و حداقل یک قیمت بررسی می‌شود؛ اعتبار Provider Token و Currency باید جداگانه تضمین شود.
9. **مدیریت خطای REST به پاسخ API وابسته است.** `BaleAPIError` برای پاسخ ناموفق API ساخته می‌شود؛ خطاهای شبکه یا JSON parsing ممکن است از نوع خطای عمومی باشند.
10. **برخی نمونه‌های README با نام پکیج ناسازگارند.** نام واقعی در `package.json` برابر `@persian-caesar/bale.js` است؛ در کدهای این راهنما از همین نام استفاده شده است.
11. **تعریف‌های TypeScript لزوماً پوشش کامل API بله نیستند.** برای قابلیت‌های خارج از کلاس‌ها و متدهای مستندشده، باید سورس و مستندات رسمی API بله بررسی شوند.

### پیشنهادهای توسعه برای نسخه‌های بعدی

این موارد پیشنهاد هستند و به معنی وجود قابلیت در نسخهٔ فعلی نیستند:

- اضافه‌کردن رویداد `preCheckoutQuery` و پردازش Updateهای پرداخت
- تکمیل پوشش رویدادها و انواع Updateهای API
- گسترش گزینه‌های ارسال و ویرایش پیام
- یکسان‌سازی Typeهای Inline و Reply Keyboard در متدهای ارسال
- افزودن تست یکپارچه برای Polling، Webhook، REST و Media
- افزودن مکانیزم پایدارسازی offset در Polling
- افزودن کنترل امنیتی Webhook و محدودیت اندازهٔ بدنه
- افزودن نمونه‌های اجرایی مستقل برای هر Manager

## 24. مجوز

این پروژه تحت مجوز MIT منتشر شده است. متن کامل مجوز در فایل `LICENSE` مخزن قرار دارد.

---

## پیوندهای مفید

- [مخزن GitHub](https://github.com/Persian-Caesar/bale.js)
- [گزارش باگ و درخواست قابلیت](https://github.com/Persian-Caesar/bale.js/issues)
- [صفحهٔ پکیج npm](https://www.npmjs.com/package/@persian-caesar/bale.js)
- [BotFather بله](https://ble.ir/botfather)

**پایان مستندات bale.js — نسخهٔ 0.1.0**

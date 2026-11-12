# bale.js

[![CI](https://github.com/Persian-Caesar/bale.js/actions/workflows/ci.yml/badge.svg)](https://github.com/Persian-Caesar/bale.js/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/%40persian-caesar%2Fbale.js.svg)](https://www.npmjs.com/package/@persian-caesar/bale.js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Coverage](https://img.shields.io/codecov/c/github/Persian-Caesar/bale.js)](https://codecov.io/gh/Persian-Caesar/bale.js)

A powerful, discord.js-like library for building Bale messenger bots with TypeScript.

## Features

- 🧩 **Modular architecture** — Client, REST, Structures, Managers, Builders
- 🔄 **Dual update modes** — Long Polling and Webhook, switchable without code changes
- ⌨️ **Fluent builders** — `InlineKeyboardBuilder`, `ReplyKeyboardBuilder`, `MessageBuilder`
- 📎 **Media support** — Photos, documents, videos, audio, voice, with `file_id` / URL / Buffer
- 👥 **Group management** — Ban, promote, pin, invite links
- 💳 **Payments & Web Apps** — Invoices, pre-checkout queries, mini-app data
- 🛡️ **Strictly typed** — Full TypeScript definitions with `strict` mode

## Prerequisites

- Node.js >= 18
- npm >= 9

## Installation

```bash
npm install bale.js
```

## Quick Start

```typescript
import { BaleClient, InlineKeyboardBuilder } from 'bale.js';

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

    await message.reply('Welcome!', { reply_markup: keyboard });
  }
});

client.on('callbackQuery', async (query) => {
  await query.answer('Button clicked!');
});

client.login();
```

## Documentation

Full API reference is available at [https://Persian-Caesar.github.io/bale.js](https://Persian-Caesar.github.io/bale.js).

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
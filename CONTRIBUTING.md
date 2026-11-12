# Contributing to bale.js

First off, thank you for considering contributing to **bale.js**! 🎉

We welcome contributions of all kinds — bug reports, feature requests, documentation improvements, and code. This document outlines the process to help your contribution get merged smoothly.

> 📝 **Note:** We accept contributions and discussions in both **English** and **Persian (فارسی)**. Feel free to open issues or PRs in either language.

---

## 📑 Table of Contents

- [Contributing to bale.js](#contributing-to-balejs)
  - [📑 Table of Contents](#-table-of-contents)
  - [🤝 Code of Conduct](#-code-of-conduct)
  - [💡 How Can I Contribute?](#-how-can-i-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Features](#suggesting-features)
    - [Improving Documentation](#improving-documentation)
    - [Submitting Code](#submitting-code)
  - [🛠 Development Setup](#-development-setup)
    - [Prerequisites](#prerequisites)
    - [Setup Steps](#setup-steps)
    - [Available Scripts](#available-scripts)
    - [Testing Against a Real Bot](#testing-against-a-real-bot)
  - [🗂 Project Structure](#-project-structure)
  - [🎨 Coding Standards](#-coding-standards)
    - [TypeScript](#typescript)
    - [Naming Conventions](#naming-conventions)
    - [Formatting](#formatting)
    - [Comments \& JSDoc](#comments--jsdoc)
  - [📝 Commit Message Convention](#-commit-message-convention)
    - [Format](#format)
    - [Types](#types)
    - [Scopes](#scopes)
    - [Examples](#examples)
  - [🧪 Testing](#-testing)
    - [Writing a New Test](#writing-a-new-test)
  - [🔀 Pull Request Process](#-pull-request-process)
    - [Before You Open a PR](#before-you-open-a-pr)
    - [Opening the PR](#opening-the-pr)
    - [Review Process](#review-process)
    - [What Maintainers Look For](#what-maintainers-look-for)
  - [🚢 Release Process](#-release-process)
  - [💬 Community \& Support](#-community--support)
  - [🙏 Thank You](#-thank-you)
  - [Expected behavior](#expected-behavior)
  - [Environment](#environment)
  - [Additional context](#additional-context)
    - [۴. `.github/PULL_REQUEST_TEMPLATE.md`](#۴-githubpull_request_templatemd)
  - [What does this PR do?](#what-does-this-pr-do)
  - [Related issues](#related-issues)
  - [Type of change](#type-of-change)
  - [Checklist](#checklist)

---

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). In short:

- **Be respectful** — Disagreements are fine; personal attacks are not.
- **Be constructive** — Critique ideas, not people.
- **Be patient** — Maintainers are volunteers.

Violations can be reported to the maintainers at `conduct@bale.js.example`. All reports will be reviewed confidentially.

---

## 💡 How Can I Contribute?

### Reporting Bugs

Before opening an issue, please:

1. **Search existing issues** to avoid duplicates.
2. **Check the documentation** — your problem might be a usage issue, not a bug.
3. **Reproduce the bug** with the latest version of `bale.js`.

When you open a bug report, use the [Bug Report template](.github/ISSUE_TEMPLATE/bug_report.md) and include:

- `bale.js` version (`npm ls bale.js`)
- Node.js version (`node --version`)
- Operating system
- **Minimal reproducible example** (a few lines of code that trigger the bug)
- Expected behavior vs. actual behavior
- Any relevant error messages or stack traces

> ⚠️ **Security issues:** Do **not** open a public issue for security vulnerabilities. Instead, email `security@bale.js.example` privately.

### Suggesting Features

Feature requests are welcome! Please open an issue using the [Feature Request template](.github/ISSUE_TEMPLATE/feature_request.md) and describe:

- **The problem** you're trying to solve (not just the solution)
- **Your proposed solution** and any alternatives you considered
- **How it fits** with `bale.js`'s philosophy (discord.js-like ergonomics, TypeScript-first, modular)

Before writing code for a large feature, please open an issue first to discuss the design. This saves you from investing effort in something that might not align with the project's direction.

### Improving Documentation

Documentation lives in two places:

- **Inline JSDoc comments** in `src/**/*.ts` — these power the TypeDoc output.
- **`README.md`** and files in `/docs` — the user-facing guides.

If you find a typo, unclear explanation, or missing example, a PR is very welcome. Even small fixes are appreciated!

### Submitting Code

See [Pull Request Process](#-pull-request-process) below. In general:

- **Small fixes** (typos, one-line bugs): open a PR directly.
- **Larger changes** (new managers, API changes): open an issue first, get approval, then PR.

---

## 🛠 Development Setup

### Prerequisites

- **Node.js** >= 18 (we recommend Node 20 LTS)
- **npm** >= 9 (or `pnpm`/`yarn` — but please don't mix lockfiles)
- **Git**

### Setup Steps

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/bale.js.git
cd bale.js

# 2. Add the upstream remote
git remote add upstream https://github.com/<org>/bale.js.git

# 3. Install dependencies (use `npm ci` for reproducible installs)
npm ci

# 4. Verify the project builds
npm run build
```

### Available Scripts

| Command                 | Description                    |
| :---------------------- | :----------------------------- |
| `npm run build`         | Compile TypeScript to `dist/`  |
| `npm run dev`           | Compile in watch mode          |
| `npm run lint`          | Run ESLint                     |
| `npm run format`        | Run Prettier on `src/`         |
| `npm test`              | Run the test suite once        |
| `npm run test:watch`    | Run tests in watch mode        |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run docs`          | Generate TypeDoc documentation |

### Testing Against a Real Bot

To test integration features (polling, webhook, sending messages), you'll need a real bot token from [Bale's BotFather](https://ble.ir/botfather).

**Never commit your token!** Use a `.env` file (already gitignored) or set it in your shell:

```bash
export BALE_TOKEN="your-test-token-here"
```

If you need a test chat ID, send a message to your bot and log `message.chat.id`.

---

## 🗂 Project Structure

```
bale.js/
├── src/
│   ├── client/           # BaleClient (EventEmitter entry point)
│   ├── rest/             # RESTManager + error classes
│   ├── types/            # API type definitions (mirror Bale's API)
│   ├── structures/       # User, Chat, Message, CallbackQuery, ...
│   ├── managers/         # MessageManager, MediaManager, GroupManager, ...
│   ├── builders/         # Fluent builders (Message, Keyboard, Invoice)
│   └── util/             # Collection, misc helpers
├── tests/                # Vitest test files (*.test.ts)
├── docs/                 # Generated TypeDoc output (not committed)
├── .github/workflows/    # CI/CD
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── typedoc.json
```

**Key architectural principles:**

1. **Structures** are thin, read-only wrappers around API data. They expose computed getters and convenience methods that delegate to Managers.
2. **Managers** own all API calls. They return Structures, never raw API data.
3. **Builders** are pure functions — they don't touch the network and always return plain objects.
4. **`BaleClient`** wires everything together and emits events.
5. **`RESTManager`** is the *only* place that talks to `tapi.bale.ai`.

When adding a new feature, follow this layering. If you find yourself calling `client.rest.request(...)` outside a Manager, step back and reconsider.

---

## 🎨 Coding Standards

### TypeScript

- **Strict mode is non-negotiable.** `tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, and `noImplicitOverride`. Don't disable them locally.
- **Avoid `any`.** Use `unknown` and narrow it. If you truly need `any`, add an ESLint disable comment with a justification.
- **Use `import type`** for type-only imports (`@typescript-eslint/consistent-type-imports` is enabled).
- **Prefer `readonly`** on public properties of Structures.
- **Use `.js` extensions** in imports (required by `NodeNext` module resolution):

  ```typescript
  import { RESTManager } from './rest/RESTManager.js'; // ✅
  import { RESTManager } from './rest/RESTManager';   // ❌
  ```

### Naming Conventions

| Kind                | Convention                                                | Example                       |
| :------------------ | :-------------------------------------------------------- | :---------------------------- |
| Classes             | `PascalCase`                                              | `MessageManager`              |
| Interfaces / Types  | `PascalCase`                                              | `SendMessageOptions`          |
| Functions / Methods | `camelCase`                                               | `sendPhoto`                   |
| Variables / Params  | `camelCase`                                               | `chatId`                      |
| Constants           | `UPPER_SNAKE_CASE`                                        | `DEFAULT_TIMEOUT`             |
| Files               | `PascalCase.ts` for classes, `camelCase.ts` for utilities | `RESTManager.ts`, `errors.ts` |

API field names from Bale (e.g., `chat_id`, `reply_markup`) are kept as-is in types to preserve fidelity, but our own properties use `camelCase`.

### Formatting

Prettier runs automatically on `npm run format`. Key settings:

- Semicolons: yes
- Single quotes: yes
- Trailing commas: all
- Line width: 100
- Indent: 2 spaces

### Comments & JSDoc

- **Public APIs must have JSDoc.** These become TypeDoc pages.
- Use `@param`, `@returns`, `@throws`, `@example` where relevant.
- Inline comments (`//`) should explain *why*, not *what*.
- Write comments in English (for international contributors) or Persian (for team clarity) — but be consistent within a file.

Example:

```typescript
/**
 * Sends a photo to the specified chat.
 *
 * @param chatId - Target chat ID or username.
 * @param photo - A `file_id`, HTTP URL, or a Buffer containing the image.
 * @param options - Optional caption, keyboard, and reply settings.
 * @returns The sent `Message` object.
 * @throws {BaleAPIError} If the API rejects the request.
 *
 * @example
 * ```ts
 * await client.media.sendPhoto(chatId, buffer, { caption: 'Hi!' });
 * ```
 */
async sendPhoto(chatId: number | string, photo: FileInput, options?: SendPhotoOptions): Promise<Message> {
  // ...
}
```

---

## 📝 Commit Message Convention

We follow **[Conventional Commits](https://www.conventionalcommits.org/)**. This enables automatic changelog generation and semantic versioning.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type       | When to use                                             |
| :--------- | :------------------------------------------------------ |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, missing semicolons (no logic change)        |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf`     | Performance improvement                                 |
| `test`     | Adding or fixing tests                                  |
| `build`    | Changes to build system or dependencies                 |
| `ci`       | CI configuration changes                                |
| `chore`    | Other changes (e.g., `.gitignore`)                      |

### Scopes

Common scopes: `client`, `rest`, `types`, `structures`, `managers`, `builders`, `util`, `media`, `group`, `payment`, `docs`, `deps`.

### Examples

```
feat(builders): add InvoiceBuilder with fluent API
fix(rest): handle multipart upload with zero-length buffers
docs(managers): document MediaManager.downloadFile
refactor(structures): make Message fields readonly
test(builders): cover adjust() with empty sizes array
chore(deps): bump undici to 6.20.0
```

Breaking changes must be marked with `!` after the type/scope and explained in the footer:

```
feat(rest)!: rename RESTManager.request to RESTManager.call

BREAKING CHANGE: `request` is renamed to `call` to avoid confusion
with undici's `request`. Update all internal call sites.
```

---

## 🧪 Testing

- **Every PR with code changes must include tests.** PRs without tests may be requested to add them before merge.
- **Run the full suite locally** before opening a PR: `npm run test:coverage`.
- **Coverage thresholds** are enforced in `vitest.config.ts` (70% lines/functions, 60% branches). Don't lower them.
- **Use mocks for external calls.** All tests that hit `tapi.bale.ai` must mock `undici.request`. See `tests/rest.test.ts` for a template.
- **Test file naming:** `*.test.ts` inside `tests/`.
- **Descriptive test names:** use `it('throws BaleAPIError when ok is false')`, not `it('test 1')`.

### Writing a New Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { InlineKeyboardBuilder } from '../src/builders/InlineKeyboardBuilder.js';

describe('InlineKeyboardBuilder', () => {
  it('throws when adjust is called with negative sizes', () => {
    // ...
  });
});
```

---

## 🔀 Pull Request Process

### Before You Open a PR

1. **Rebase on the latest `main`:**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```
2. **Run the full validation locally:**
   ```bash
   npm run lint && npm run build && npm run test:coverage
   ```
3. **Update documentation** if your change affects the public API (`README.md` and JSDoc).

### Opening the PR

- Use a **clear title** following the commit convention: `feat(managers): add MediaManager.sendAnimation`.
- **Fill out the PR template** — it asks for context, changes, and testing.
- **Link related issues** with `Closes #123` or `Fixes #456` in the description.
- **Keep PRs focused.** One logical change per PR. If you find yourself fixing unrelated issues, split into separate PRs.
- **Screenshots or terminal output** are helpful for UI/behavior changes.

### Review Process

- A maintainer will review your PR, usually within **3–5 business days**.
- Address review comments by pushing new commits — **do not force-push** unless the maintainer asks (it makes re-review harder).
- Once approved, a maintainer will squash-merge your PR into `main`.

### What Maintainers Look For

- ✅ Aligns with the architecture (no API calls outside Managers, etc.)
- ✅ TypeScript strict mode satisfied
- ✅ Tests included and passing
- ✅ JSDoc for public APIs
- ✅ Conventional commit message
- ✅ No new dependencies without discussion

---

## 🚢 Release Process

> **Maintainers only.** This section documents the process for transparency.

1. Ensure `main` is green (all CI checks passing).
2. Determine the next version following [SemVer](https://semver.org/):
   - `patch` — bug fixes only
   - `minor` — new features, backwards-compatible
   - `major` — breaking changes
3. Bump the version and tag:
   ```bash
   npm version <patch|minor|major>
   git push --follow-tags
   ```
4. GitHub Actions automatically publishes to npm on tag push (see `.github/workflows/ci.yml`).
5. Create a GitHub Release with auto-generated changelog from Conventional Commits.

---

## 💬 Community & Support

- **GitHub Issues:** for bugs and feature requests.
- **GitHub Discussions:** for questions, ideas, and showing off what you built.
- **Security:** email `security@bale.js.example` (private).

When asking for help, please include:

1. What you're trying to do
2. What you've tried
3. The actual vs. expected result
4. Your Node version and `bale.js` version

---

## 🙏 Thank You

Every contribution — whether it's a typo fix, a well-argued feature proposal, or a fully-tested PR — makes `bale.js` better. Thank you for being part of the community! ❤️

---

*This document is adapted from the [Contributor Covenant](https://www.contributor-covenant.org/) and follows conventions from popular TypeScript projects like [discord.js](https://github.com/discordjs/discord.js) and [grammY](https://github.com/grammyjs/grammY).*
```

---

## 📌 نکات تکمیلی برای فایل CONTRIBUTING

در کنار این فایل، توصیه می‌شود موارد زیر را هم اضافه کنید تا ساختار مشارکت کامل شود:

### ۱. `CODE_OF_CONDUCT.md`

نسخهٔ استاندارد [Contributor Covenant v2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/) را کپی کنید. این سند مرجع `conduct@bale.js.example` است که در `CONTRIBUTING.md` به آن اشاره شده.

### ۲. `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Report a bug in bale.js
title: '[Bug]: '
labels: ['bug', 'needs-triage']
---

## Describe the bug
A clear description of what's wrong.

## To Reproduce
Minimal code snippet:
```ts
// your code here
```

## Expected behavior

## Environment
- bale.js version:
- Node.js version:
- OS:

## Additional context
```

### ۳. `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest an idea for bale.js
title: '[Feature]: '
labels: ['enhancement']
---

## Problem
What problem are you trying to solve?

## Proposed solution
How would you like bale.js to handle it?

## Alternatives considered

## Additional context
```

### ۴. `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## What does this PR do?
Brief description.

## Related issues
Closes #

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] I've run `npm run lint && npm run build && npm run test:coverage`
- [ ] I've added tests for my changes
- [ ] I've updated JSDoc for public APIs
- [ ] My commits follow Conventional Commits
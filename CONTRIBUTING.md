# Contributing to moneroo-tools

Thank you for your interest in contributing! This guide covers everything you need to get started.

## Table of contents

- [Project structure](#project-structure)
- [Development setup](#development-setup)
- [Making changes](#making-changes)
- [Commit conventions](#commit-conventions)
- [Opening a pull request](#opening-a-pull-request)
- [Release process](#release-process)
- [Code style](#code-style)

---

## Project structure

```
moneroo-tools/
├── packages/
│   ├── sdk/          # npm: moneroo — TypeScript SDK
│   │   └── src/
│   │       ├── client.ts          # Moneroo class — HTTP client
│   │       ├── errors.ts          # Error classes
│   │       ├── resources/         # payments.ts, payouts.ts, webhooks.ts
│   │       ├── types/             # TypeScript interfaces
│   │       └── utils/             # webhooks.ts (HMAC verification)
│   └── mcp/          # npm: moneroo-mcp — MCP Server
│       └── src/
│           ├── server.ts          # McpServer + tool definitions
│           ├── bin.ts             # CLI entry point
│           └── index.ts           # Public exports
├── docs/             # Moneroo API reference (source of truth)
├── .changeset/       # Pending changelogs (managed by changesets)
└── .github/
    └── workflows/
        └── release.yml  # Automated npm publish on main
```

---

## Development setup

**Prerequisites:** Node.js 18+, pnpm 9+

```bash
# Fork and clone
git clone https://github.com/aboudou-cto-bloko/moneroo-tools.git
cd moneroo-tools

# Install dependencies
pnpm install

# Build all packages
pnpm build
```

**Verify everything works:**

```bash
# Type-check
pnpm build

# Lint
pnpm lint

# Format
pnpm format
```

---

## Making changes

### SDK changes (`packages/sdk`)

1. Read the relevant doc in `docs/` before implementing — the docs are the source of truth for API behavior.
2. Add or update types in `src/types/`.
3. Implement in `src/resources/` or `src/utils/`.
4. Export from `src/index.ts`.
5. Rebuild: `pnpm --filter moneroo build`.

### MCP Server changes (`packages/mcp`)

1. Add or modify tools in `src/server.ts`.
2. Keep tool descriptions clear — they are shown directly to the AI model.
3. Always handle errors with `try/catch` and return `{ isError: true }` — never let a tool throw and crash the server.
4. Rebuild: `pnpm --filter moneroo-mcp build`.

---

## Commit conventions

We use [Conventional Commits](https://www.conventionalcommits.org):

```
<type>: <short description>

[optional body]
```

| Type | When to use |
|---|---|
| `feat` | New feature or tool |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Code change without feature/fix |
| `chore` | Tooling, deps, build |

Examples:
```
feat: add list_payouts MCP tool
fix: handle 503 response in _request
docs: add webhook verification example to SDK README
chore: upgrade @modelcontextprotocol/sdk to 1.30.0
```

---

## Opening a pull request

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```

2. **Add a changeset** describing your change:
   ```bash
   pnpm changeset
   # Select the affected packages
   # Choose patch / minor / major
   # Write a one-line summary
   ```
   This creates a file in `.changeset/` — commit it with your changes.

3. **Push and open a PR** against `main`:
   ```bash
   git push origin feat/your-feature
   ```

4. The PR title should follow the same conventional commit format.

**What makes a good PR:**
- Focused — one concern per PR
- Includes a changeset (unless it's a docs-only or chore change)
- Builds cleanly: `pnpm build` passes
- No new `any` types without justification

---

## Release process

Releases are fully automated via GitHub Actions:

1. PRs merge into `main` → Actions opens a "Release PR" that bumps versions and updates `CHANGELOG.md`
2. Merging the Release PR → Actions publishes to npm automatically

**For maintainers doing a manual release:**

```bash
pnpm build
pnpm changeset publish
git push origin main --tags
```

---

## Code style

- **TypeScript strict** — `"strict": true` is enforced, no `any` without a comment explaining why
- **ESM-first** — all source is ESM; CJS is compiled output only
- **No external HTTP libs** — SDK uses native `fetch` (Node 18+)
- **No external crypto libs** — webhook verification uses native `node:crypto`
- **Formatting** — Prettier with `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`

Run `pnpm format` before committing to auto-fix style issues.

---

## Questions?

Open an issue on [GitHub](https://github.com/aboudou-cto-bloko/moneroo-tools/issues) or reach out directly.

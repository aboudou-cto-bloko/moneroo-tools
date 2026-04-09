# moneroo-tools

Monorepo containing the TypeScript SDK and MCP Server for the [Moneroo](https://moneroo.io) payment API.

By [Aboudou Zinsou](https://github.com/aboudouzinsou).

## Packages

| Package | npm | Description |
|---|---|---|
| [`moneroo`](./packages/sdk) | [![npm](https://img.shields.io/npm/v/moneroo)](https://www.npmjs.com/package/moneroo) | TypeScript SDK for the Moneroo API |
| [`moneroo-mcp`](./packages/mcp) | [![npm](https://img.shields.io/npm/v/moneroo-mcp)](https://www.npmjs.com/package/moneroo-mcp) | MCP Server — gives AI assistants access to Moneroo |

## Development

```bash
# Install
pnpm install

# Build all packages
pnpm build

# Lint
pnpm lint

# Format
pnpm format
```

## Releasing

This project uses [Changesets](https://github.com/changesets/changesets).

```bash
# 1. Add a changeset describing your change
pnpm changeset

# 2. Bump versions and update changelogs
pnpm version

# 3. Publish to npm (requires NPM_TOKEN)
pnpm release
```

Releases are automated via GitHub Actions on push to `main`.
You need one secret in your GitHub repo settings:
- `NPM_TOKEN` — create at [npmjs.com](https://www.npmjs.com) → Access Tokens → Automation token

## License

MIT

# moneroo-tools

Monorepo containing the official TypeScript SDK and MCP Server for the [Moneroo](https://moneroo.io) payment API.

By [Aboudou Zinsou](https://github.com/aboudou-cto-bloko) · [MIT License](./LICENSE)

## Packages

| Package | Version | Description |
|---|---|---|
| [`moneroo`](./packages/sdk) | [![npm](https://img.shields.io/npm/v/moneroo)](https://www.npmjs.com/package/moneroo) | TypeScript SDK for the Moneroo API |
| [`moneroo-mcp`](./packages/mcp) | [![npm](https://img.shields.io/npm/v/moneroo-mcp)](https://www.npmjs.com/package/moneroo-mcp) | MCP Server — gives AI assistants access to Moneroo |

## What is Moneroo?

[Moneroo](https://moneroo.io) is a payment infrastructure for Africa, supporting 60+ mobile money and card payment methods across 30+ countries (MTN MoMo, Orange Money, Wave, Airtel, M-Pesa, and more).

## What is in this repo?

### `moneroo` — TypeScript SDK

Full-featured SDK to integrate Moneroo into any Node.js backend:

- Initialize payments and get checkout URLs
- Collect payouts to mobile money accounts
- Verify webhook signatures (HMAC-SHA256)
- Typed error classes per HTTP status

```bash
npm install moneroo
```

→ [SDK documentation](./packages/sdk/README.md)

### `moneroo-mcp` — MCP Server

A [Model Context Protocol](https://modelcontextprotocol.io) server that lets AI assistants (Claude, Cursor, etc.) interact with Moneroo directly:

- `list_payments` — browse recent transactions
- `get_payment` — fetch transaction details
- `create_payment_link` — generate a checkout URL
- `get_payout` — fetch payout details

```bash
npx moneroo-mcp
```

→ [MCP Server documentation](./packages/mcp/README.md)

---

## Development

**Prerequisites:** Node.js 18+, pnpm 9+

```bash
git clone https://github.com/aboudou-cto-bloko/moneroo-tools.git
cd moneroo-tools

pnpm install     # install all dependencies
pnpm build       # build all packages
pnpm lint        # lint all packages
pnpm format      # format all source files
```

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a PR.

## Releasing

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and [GitHub Actions](./.github/workflows/release.yml) for automated npm publishing.

```bash
pnpm changeset   # describe your change and affected packages
git commit && git push origin main
# → CI opens a "Release PR" → merge it → packages publish automatically
```

## License

[MIT](./LICENSE) — Aboudou Zinsou ([@aboudou-cto-bloko](https://github.com/aboudou-cto-bloko))

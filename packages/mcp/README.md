# moneroo-mcp

[![npm version](https://img.shields.io/npm/v/moneroo-mcp)](https://www.npmjs.com/package/moneroo-mcp)
[![npm downloads](https://img.shields.io/npm/dm/moneroo-mcp)](https://www.npmjs.com/package/moneroo-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/aboudou-cto-bloko/moneroo-tools/blob/main/LICENSE)

MCP Server for the [Moneroo](https://moneroo.io) payment API.
Gives AI assistants (Claude, Cursor, Windsurf, etc.) the ability to manage payments and payouts through natural language.

Built by [Aboudou Zinsou](https://github.com/aboudou-cto-bloko) · [GitHub](https://github.com/aboudou-cto-bloko/moneroo-tools)

---

## Table of contents

- [Requirements](#requirements)
- [Setup with Claude Desktop](#setup-with-claude-desktop)
- [Setup with Cursor](#setup-with-cursor)
- [Setup with other MCP clients](#setup-with-other-mcp-clients)
- [Available tools](#available-tools)
- [Example prompts](#example-prompts)
- [Security](#security)
- [Sandbox & testing](#sandbox--testing)

---

## Requirements

- **Node.js 18+**
- A Moneroo account → [app.moneroo.io](https://app.moneroo.io) → Developers → API Keys → copy your **Secret Key**

---

## Setup with Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS  
or `%APPDATA%\Claude\claude_desktop_config.json` on Windows:

```json
{
  "mcpServers": {
    "moneroo": {
      "command": "npx",
      "args": ["-y", "moneroo-mcp"],
      "env": {
        "MONEROO_SECRET_KEY": "sk_your_secret_key_here"
      }
    }
  }
}
```

Restart Claude Desktop. You should see the Moneroo tools in the tools panel.

---

## Setup with Cursor

Add to `.cursor/mcp.json` in your project (project-level) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "moneroo": {
      "command": "npx",
      "args": ["-y", "moneroo-mcp"],
      "env": {
        "MONEROO_SECRET_KEY": "sk_your_secret_key_here"
      }
    }
  }
}
```

---

## Setup with other MCP clients

The server communicates over **stdio** — the standard MCP transport. Any MCP-compatible client can use it.

```bash
MONEROO_SECRET_KEY=sk_... npx moneroo-mcp
```

Or install globally and run directly:

```bash
npm install -g moneroo-mcp
MONEROO_SECRET_KEY=sk_... moneroo-mcp
```

---

## Available tools

### `list_payments`

Browse recent payment transactions with optional filters.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | number | No | Number of results to return (1–100) |
| `status` | string | No | `initiated` \| `pending` \| `success` \| `failed` \| `cancelled` |
| `from_date` | string | No | Start of date range (ISO 8601, e.g. `2024-01-01`) |
| `to_date` | string | No | End of date range (ISO 8601, e.g. `2024-12-31`) |

---

### `get_payment`

Retrieve the full details of a payment transaction by its ID.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `payment_id` | string | Yes | The transaction ID (from `data.id` or a webhook) |

Returns: status, amount, currency, customer info, payment method, gateway details.

---

### `create_payment_link`

Initialize a payment and get a checkout URL to share with a customer.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `amount` | number | Yes | Amount (integer) |
| `currency` | string | Yes | ISO 4217 currency code (e.g. `XOF`, `USD`, `KES`) |
| `description` | string | Yes | What this payment is for |
| `return_url` | string | Yes | Where to redirect the customer after payment |
| `customer_email` | string | Yes | Customer's email address |
| `customer_first_name` | string | No | Customer's first name |
| `customer_last_name` | string | No | Customer's last name |
| `methods` | string[] | No | Restrict to specific payment method shortcodes |

Returns: `id` and `checkout_url`.

---

### `get_payout`

Retrieve the full details of a payout transaction by its ID.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `payout_id` | string | Yes | The payout transaction ID |

Returns: status, amount, currency, customer info, disbursement details (`disburse.method`, `disburse.gateway`).

---

## Example prompts

Once connected, you can use natural language:

> "Show me all failed payments from last week"

> "What's the status of payment k4su1ii7abdz?"

> "Create a payment link for 10,000 XOF for jean@example.com, description 'Invoice #42', return URL https://myapp.com/merci"

> "Check if payout go86j8csuq51 went through"

> "List the last 5 successful payments"

---

## Security

- **Never commit your secret key.** Use environment variables or a secrets manager.
- The server runs locally on your machine — your API key is never sent anywhere other than `api.moneroo.io`.
- Use **sandbox keys** for development and testing, switch to live keys only in production.
- The MCP server only reads and creates — it does not modify or delete existing transactions.

---

## Sandbox & testing

Get sandbox keys from [app.moneroo.io](https://app.moneroo.io) → Developers → API Keys → Sandbox.

Test phone numbers (Moneroo Test Gateway):

| Phone | Scenario |
|---|---|
| `(414) 951-8161` | Successful transaction |
| `(414) 951-8162` | Pending transaction |
| `(414) 951-8163` | Failed transaction |

Sandbox data is automatically deleted after 90 days.

---

## Contributing

See [CONTRIBUTING.md](https://github.com/aboudou-cto-bloko/moneroo-tools/blob/main/CONTRIBUTING.md).

## License

[MIT](https://github.com/aboudou-cto-bloko/moneroo-tools/blob/main/LICENSE) — [Aboudou Zinsou](https://github.com/aboudou-cto-bloko)

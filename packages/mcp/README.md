# moneroo-mcp

MCP Server for the [Moneroo](https://moneroo.io) payment API.
Gives AI assistants (Claude, Cursor, etc.) the ability to create payments, list transactions, and manage payouts.

Built by [Aboudou Zinsou](https://github.com/aboudouzinsou).

## Requirements

- Node.js 18+
- A Moneroo account and secret key → [app.moneroo.io](https://app.moneroo.io) → Developers → API Keys

## Usage with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

## Usage with Cursor

Add to `.cursor/mcp.json` in your project or `~/.cursor/mcp.json` globally:

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

## Usage with other MCP clients

```bash
MONEROO_SECRET_KEY=sk_... npx moneroo-mcp
```

The server communicates over **stdio** (standard MCP transport).

---

## Available tools

### `list_payments`

List recent payment transactions.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `limit` | number | No | Number of results (1–100) |
| `status` | string | No | `initiated` \| `pending` \| `success` \| `failed` \| `cancelled` |
| `from_date` | string | No | Start date (ISO 8601) |
| `to_date` | string | No | End date (ISO 8601) |

**Example prompt:** _"Show me the last 10 successful payments"_

---

### `get_payment`

Retrieve the full details of a payment transaction.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `payment_id` | string | Yes | Transaction ID |

**Example prompt:** _"What is the status of payment abc123?"_

---

### `create_payment_link`

Initialize a payment and get a checkout URL.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `amount` | number | Yes | Amount (integer) |
| `currency` | string | Yes | ISO 4217 code (e.g. `XOF`, `USD`) |
| `description` | string | Yes | Payment description |
| `return_url` | string | Yes | Redirect URL after payment |
| `customer_email` | string | Yes | Customer email |
| `customer_first_name` | string | No | Customer first name |
| `customer_last_name` | string | No | Customer last name |
| `methods` | string[] | No | Restrict to payment method shortcodes |

**Example prompt:** _"Create a payment link for 5000 XOF for john@example.com, order #42"_

---

### `get_payout`

Retrieve the full details of a payout transaction.

| Parameter | Type | Required | Description |
|---|---|---|---|
| `payout_id` | string | Yes | Payout transaction ID |

**Example prompt:** _"Check the status of payout xyz789"_

---

## Sandbox testing

Use sandbox keys from your [Moneroo dashboard](https://app.moneroo.io). Sandbox data is deleted after 90 days.

---

## License

MIT — [Aboudou Zinsou](https://github.com/aboudouzinsou)

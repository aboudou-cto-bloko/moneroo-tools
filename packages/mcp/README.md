# moneroo-mcp

[![npm version](https://img.shields.io/npm/v/moneroo-mcp)](https://www.npmjs.com/package/moneroo-mcp)
[![npm downloads](https://img.shields.io/npm/dm/moneroo-mcp)](https://www.npmjs.com/package/moneroo-mcp)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/aboudou-cto-bloko/moneroo-tools/blob/main/LICENSE)

MCP Server for the [Moneroo](https://moneroo.io) payment API.  
Gives AI assistants (Claude, Cursor, Windsurf, etc.) the ability to manage payments, analyze revenue, and generate reports — through natural language.

**28 tools · 3 resources** · Built by [Aboudou Zinsou](https://github.com/aboudou-cto-bloko)

---

## Table of contents

- [Requirements](#requirements)
- [Setup](#setup)
  - [Claude Desktop](#claude-desktop)
  - [Cursor / Windsurf / other clients](#cursor--windsurf--other-clients)
- [Tools](#tools)
  - [Payments (4)](#payments)
  - [Payouts (4)](#payouts)
  - [Analytics (6)](#analytics)
  - [Insights (5)](#insights)
  - [Automations (5)](#automations)
  - [Exports & Reports (4)](#exports--reports)
- [Resources (3)](#resources)
- [Example prompts](#example-prompts)
- [Security](#security)
- [Sandbox & testing](#sandbox--testing)

---

## Requirements

- **Node.js 18+**
- A Moneroo account → [app.moneroo.io](https://app.moneroo.io) → Developers → API Keys → copy your **Secret Key**

---

## Setup

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)  
or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

Restart Claude Desktop. You'll see the Moneroo tools in the tools panel.

### Cursor / Windsurf / other clients

Add to `.cursor/mcp.json` or `~/.cursor/mcp.json`:

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

The server communicates over **stdio** — any MCP-compatible client works:

```bash
MONEROO_SECRET_KEY=sk_... npx moneroo-mcp
```

---

## Tools

### Payments

| Tool | Description |
|---|---|
| `list_payments` | List recent payments with filters (status, date range, pagination) |
| `get_payment` | Get full details of a payment by ID |
| `verify_payment` | Verify final status before fulfilling an order — more authoritative than `get_payment` |
| `create_payment_link` | Initialize a payment and get a `checkout_url` to redirect the customer to |

**`create_payment_link` parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `amount` | number | Yes | Amount as integer (e.g. `5000` for 5000 XOF) |
| `currency` | string | Yes | ISO 4217 code (e.g. `XOF`, `USD`, `KES`, `GHS`) |
| `description` | string | Yes | Shown to the customer |
| `return_url` | string | Yes | Redirect after payment |
| `customer_email` | string | Yes | Customer's email |
| `customer_first_name` | string | No | Customer's first name |
| `customer_last_name` | string | No | Customer's last name |
| `methods` | string[] | No | Restrict to specific method shortcodes (e.g. `["mtn_bj", "wave_sn"]`) |
| `metadata` | object | No | Custom key-value data attached to the transaction |

---

### Payouts

| Tool | Description |
|---|---|
| `list_payouts` | List recent payouts with filters |
| `get_payout` | Get full details of a payout by ID |
| `verify_payout` | Verify final status — returns `success_at`, `failed_at` |
| `create_payout` | Send money to a recipient via mobile money |

**`create_payout` parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `amount` | number | Yes | Amount as integer |
| `currency` | string | Yes | ISO 4217 code |
| `description` | string | Yes | Reason for payout |
| `method` | string | Yes | Payout method shortcode (e.g. `mtn_bj`, `wave_sn`, `orange_ci`) |
| `customer_email` | string | Yes | Recipient's email |
| `customer_first_name` | string | Yes | Recipient's first name |
| `customer_last_name` | string | Yes | Recipient's last name |
| `recipient_msisdn` | string | No* | Recipient phone in international format — required for most methods |
| `recipient_account_number` | string | No* | Account number — required for `moneroo_payout_demo` |

---

### Analytics

All analytics tools fetch raw data from the Moneroo API and compute aggregations locally. They work on up to ~500 transactions per period (5 pages × 100 items).

| Tool | Description |
|---|---|
| `get_revenue_report` | Revenue by status + daily breakdown for a date range |
| `get_payment_methods_breakdown` | Volume and revenue share per method (MTN, Wave, Orange…) |
| `get_failure_analysis` | Top failure reasons with counts and sample transaction IDs |
| `get_conversion_rate` | Full funnel from `initiated` → `pending` → `success` with percentages |
| `compare_periods` | Side-by-side comparison of two date ranges — revenue, volume, avg ticket, conversion Δ |
| `get_peak_hours` | Hourly and weekday breakdown of successful payments |

All analytics tools accept `from_date` and `to_date` (ISO 8601). Both default to the last 30 days.

---

### Insights

| Tool | Description |
|---|---|
| `analyze_trends` | Weekly revenue trend with week-over-week change and moving average |
| `predict_revenue` | End-of-month projection based on current daily pace vs. last month |
| `detect_anomalies` | Flag amount outliers (configurable σ threshold), volume spikes, duplicate amounts |
| `suggest_optimizations` | Structured KPIs (conversion, failures, method share) for Claude to interpret |
| `churn_risk` | Customers active in the last N days who have gone silent |

---

### Automations

| Tool | Description |
|---|---|
| `create_recurring_payment` | Creates the first payment immediately + returns a ready-to-copy cron command |
| `schedule_payout` | Executes a payout now (if today) or saves a config + returns an `at` command for future execution |
| `create_payment_reminder` | Generates a payment link + a formatted reminder message (email, WhatsApp, or SMS) |
| `setup_webhook_alert` | Saves a passive alert rule to `~/.moneroo-mcp/alerts.json` (checked on subsequent calls) |
| `list_webhook_alerts` | Lists all saved alert rules |

> **Note on automations:** The Moneroo API does not natively support scheduling or recurring payments. `create_recurring_payment` and `schedule_payout` work by creating the first transaction immediately and returning OS-level cron/`at` commands that the user adds to their server. The MCP cannot register crons autonomously.

---

### Exports & Reports

All files are saved to `~/.moneroo-mcp/exports/`.

| Tool | Description |
|---|---|
| `export_transactions` | Export payments and/or payouts to **CSV** or **Excel (.xlsx)** |
| `generate_invoice` | Generate a professional **HTML invoice** for a payment (printable to PDF from any browser) |
| `generate_report_pdf` | Generate a monthly **HTML activity report** with charts, method breakdown, and failure analysis |
| `export_for_accounting` | Export successful transactions in accounting format: **generic CSV**, **Sage-compatible**, or **FEC** (format obligatoire France) |

**`export_transactions` parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `from_date` | string | 30 days ago | Start date (ISO 8601) |
| `to_date` | string | today | End date (ISO 8601) |
| `format` | `csv` \| `xlsx` | `csv` | Output format |
| `include` | `payments` \| `payouts` \| `both` | `payments` | What to include |
| `status` | `all` \| `success` \| `failed` \| ... | `all` | Filter by status |

**`generate_invoice` parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `payment_id` | string | Yes | Payment to invoice |
| `invoice_number` | string | No | Custom invoice number (auto-generated if omitted) |
| `seller_name` | string | No | Your business name |
| `seller_address` | string | No | Your business address |
| `seller_email` | string | No | Your business email |
| `notes` | string | No | Additional notes at the bottom |

**`export_for_accounting` formats:**

| Format | Description |
|---|---|
| `generic` | Standard CSV with debit/credit accounts, compatible with most software |
| `sage` | Same structure, column naming compatible with Sage 50/100 |
| `fec` | FEC (Fichier des Écritures Comptables) — format légal obligatoire en France |

---

## Resources

MCP resources are readable via `moneroo://` URIs. They return deep links to the Moneroo dashboard and documentation.

| URI | Description |
|---|---|
| `moneroo://dashboard` | Link to your Moneroo dashboard (`app.moneroo.io/apps/`) |
| `moneroo://transaction/{id}` | Deep link to a specific transaction (e.g. `moneroo://transaction/k4su1ii7abdz`) |
| `moneroo://docs` | Moneroo API documentation with section links |

---

## Example prompts

### Payments
```
Show me all failed payments from last week
What's the status of payment k4su1ii7abdz?
Create a payment link for 10,000 XOF for jean@example.com, description "Invoice #42", return URL https://myapp.com/merci
Verify that payment k4su1ii7abdz was actually paid before I ship the order
```

### Analytics
```
Revenue report for Q1 2026
How is my conversion rate this month vs last month?
Which payment method brings the most revenue?
When do my customers pay the most during the day?
Compare January vs February
```

### Insights
```
What are the trends in my sales over the last 4 weeks?
Estimate my revenue for the end of this month
Are there any suspicious transactions in March?
How can I improve my success rate?
Which customers haven't paid in 30 days?
```

### Exports
```
Export all March transactions to Excel
Generate an invoice for payment k4su1ii7abdz — my company is "Bloko SAS", bloko@example.com
Generate the monthly report for February 2026
Export March transactions for my accountant (FEC format)
```

### Automations
```
Create a recurring payment of 10,000 XOF per month for client@example.com
Schedule a payout of 50,000 XOF to +22951345020 on Friday
Send a payment reminder to client@example.com for invoice #99 — format it for WhatsApp
Alert me when a payment exceeds 500,000 XOF
```

---

## Security

- **Never commit your secret key.** Use environment variables or a secrets manager.
- The server runs locally on your machine — your API key is never sent anywhere other than `api.moneroo.io`.
- Use **sandbox keys** for development, switch to live keys only in production.
- The MCP server reads, creates, and verifies transactions. It does not modify or delete existing records.
- Export files and alert configs are stored in `~/.moneroo-mcp/` on your local machine only.

---

## Sandbox & testing

Get sandbox keys from [app.moneroo.io](https://app.moneroo.io) → Developers → API Keys → Sandbox.

Test phone numbers (Moneroo Test Gateway):

| Phone | Scenario |
|---|---|
| `(414) 951-8161` | Successful transaction |
| `(414) 951-8162` | Pending transaction |
| `(414) 951-8163` | Failed transaction |

Use `moneroo_payout_demo` as the method shortcode for sandbox payouts (requires `recipient_account_number`).

Sandbox data is automatically deleted after 90 days.

---

## Contributing

See [CONTRIBUTING.md](https://github.com/aboudou-cto-bloko/moneroo-tools/blob/main/CONTRIBUTING.md).

## License

[MIT](https://github.com/aboudou-cto-bloko/moneroo-tools/blob/main/LICENSE) — [Aboudou Zinsou](https://github.com/aboudou-cto-bloko)

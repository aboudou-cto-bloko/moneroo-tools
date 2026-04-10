# CLI — Getting started

The `moneroo` CLI lets you manage payments and payouts directly from the terminal without writing any code.

## Installation

```bash
npm install -g moneroo-mcp
# or
npx moneroo-mcp
```

## Authentication

The CLI reads your secret key from the `MONEROO_SECRET_KEY` environment variable.

```bash
export MONEROO_SECRET_KEY=your_secret_key
```

{% hint style="danger" %}
Never commit your secret key to git or pass it as a CLI argument. Always use environment variables.
{% endhint %}

You can also set it in a `.env` file and load it with a tool like `dotenv-cli`:

```bash
dotenv -e .env -- moneroo payments get pay_xxxx
```

## Usage

```
moneroo <command> <subcommand> [options]
```

### Commands

| Command | Description |
|---|---|
| `moneroo payments get <id>` | Get payment details |
| `moneroo payments verify <id>` | Verify payment status |
| `moneroo payments create` | Create a payment link |
| `moneroo payouts get <id>` | Get payout details |
| `moneroo payouts verify <id>` | Verify payout status |
| `moneroo payouts create` | Create and send a payout |

### Global options

| Flag | Description |
|---|---|
| `--json` | Output result as JSON (available on all commands) |
| `--version` | Print CLI version |
| `--help` | Show help for any command |

## Environments

Use your **sandbox** secret key for testing and your **live** secret key for production. The CLI automatically targets the correct environment based on the key prefix.

```bash
# Sandbox
export MONEROO_SECRET_KEY=test_...

# Live
export MONEROO_SECRET_KEY=live_...
```

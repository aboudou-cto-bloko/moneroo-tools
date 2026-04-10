# CLI — Payouts

## Get a payout

Retrieve the full details of a payout by its ID.

```bash
moneroo payouts get <id>
moneroo payouts get <id> --json
```

**Example:**

```bash
moneroo payouts get pay_out_xxxx
```

---

## Verify a payout

Authoritative status check. Always verify before crediting value in your system.

```bash
moneroo payouts verify <id>
moneroo payouts verify <id> --json
```

**Example:**

```bash
moneroo payouts verify pay_out_xxxx --json
```

---

## Create a payout

Send money to a recipient via mobile money or another supported payout method.

```bash
moneroo payouts create \
  --amount <n> \
  --currency <code> \
  --description <text> \
  --method <code> \
  --email <email> \
  --first-name <name> \
  --last-name <name> \
  (--phone <number> | --account <number>) \
  [--json]
```

### Options

| Flag | Required | Description |
|---|---|---|
| `--amount` | Yes | Amount in smallest currency unit |
| `--currency` | Yes | ISO 4217 currency code (e.g. `XOF`) |
| `--description` | Yes | Reason for the payout |
| `--method` | Yes | Payout method shortcode (e.g. `mtn_bj`, `wave_sn`) |
| `--email` | Yes | Recipient email |
| `--first-name` | Yes | Recipient first name |
| `--last-name` | Yes | Recipient last name |
| `--phone` | Conditional | Recipient phone in international format — required for most mobile money methods |
| `--account` | Conditional | Account number — required for `moneroo_payout_demo` test method |
| `--json` | No | Output result as JSON |

{% hint style="info" %}
Either `--phone` or `--account` must be provided depending on the payout method. See [Available methods](../Payouts/Available-method.md) for per-method required fields.
{% endhint %}

**Example (mobile money):**

```bash
moneroo payouts create \
  --amount 10000 \
  --currency XOF \
  --description "Salary payment" \
  --method mtn_bj \
  --email recipient@example.com \
  --first-name Jean \
  --last-name Dupont \
  --phone 22951345020 \
  --json
```

**Example (sandbox):**

```bash
moneroo payouts create \
  --amount 1000 \
  --currency USD \
  --description "Test payout" \
  --method moneroo_payout_demo \
  --email test@example.com \
  --first-name Test \
  --last-name User \
  --account 1234567890 \
  --json
```

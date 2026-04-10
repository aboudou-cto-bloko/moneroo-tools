# CLI — Payments

## Get a payment

Retrieve the full details of a payment by its ID.

```bash
moneroo payments get <id>
moneroo payments get <id> --json
```

**Example:**

```bash
moneroo payments get pay_k4su1ii7abdz
```

---

## Verify a payment

Authoritative status check. Always use this before fulfilling an order — never rely on a webhook alone.

```bash
moneroo payments verify <id>
moneroo payments verify <id> --json
```

**Example:**

```bash
moneroo payments verify pay_k4su1ii7abdz --json
```

{% hint style="info" %}
`verify` calls `GET /v1/payments/{id}/verify` which performs a real-time check with the payment gateway, unlike `get` which returns the cached transaction record.
{% endhint %}

---

## Create a payment link

Initialize a payment and get a checkout URL to share with your customer.

```bash
moneroo payments create \
  --amount <n> \
  --currency <code> \
  --description <text> \
  --return-url <url> \
  --email <email> \
  [--first-name <name>] \
  [--last-name <name>] \
  [--methods <codes...>] \
  [--json]
```

### Options

| Flag | Required | Description |
|---|---|---|
| `--amount` | Yes | Amount in smallest currency unit (e.g. `5000` for 5000 XOF) |
| `--currency` | Yes | ISO 4217 currency code (e.g. `XOF`, `USD`, `KES`) |
| `--description` | Yes | Description shown to the customer |
| `--return-url` | Yes | URL to redirect the customer after payment |
| `--email` | Yes | Customer email |
| `--first-name` | No | Customer first name |
| `--last-name` | No | Customer last name |
| `--methods` | No | Restrict to specific payment method codes (space-separated) |
| `--json` | No | Output result as JSON |

**Example:**

```bash
moneroo payments create \
  --amount 5000 \
  --currency XOF \
  --description "Order #123" \
  --return-url https://example.com/thanks \
  --email customer@example.com \
  --first-name Jean \
  --last-name Dupont \
  --methods mtn_bj wave_sn \
  --json
```

**Output:**

```json
{
  "id": "pay_k4su1ii7abdz",
  "checkout_url": "https://pay.moneroo.io/pay_k4su1ii7abdz"
}
```

Redirect your customer to `checkout_url` to complete the payment.

# moneroo

[![npm version](https://img.shields.io/npm/v/moneroo)](https://www.npmjs.com/package/moneroo)
[![npm downloads](https://img.shields.io/npm/dm/moneroo)](https://www.npmjs.com/package/moneroo)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/aboudou-cto-bloko/moneroo-tools/blob/main/LICENSE)

Official TypeScript SDK for the [Moneroo](https://moneroo.io) payment API.
Supports payments, payouts, and webhook verification. Works with Node.js 18+ out of the box — no external HTTP or crypto dependencies.

Built by [Aboudou Zinsou](https://github.com/aboudou-cto-bloko) · [GitHub](https://github.com/aboudou-cto-bloko/moneroo-tools)

---

## Table of contents

- [Installation](#installation)
- [Quick start](#quick-start)
- [Payments](#payments)
- [Payouts](#payouts)
- [Webhooks](#webhooks)
- [Error handling](#error-handling)
- [Payment statuses](#payment-statuses)
- [Payout methods](#payout-methods)
- [Sandbox & testing](#sandbox--testing)
- [TypeScript](#typescript)

---

## Installation

```bash
npm install moneroo
# or
pnpm add moneroo
# or
yarn add moneroo
```

**Requirements:** Node.js 18+ (uses native `fetch` and `node:crypto`)

---

## Quick start

```typescript
import { Moneroo } from 'moneroo';

const moneroo = new Moneroo({
  secretKey: process.env.MONEROO_SECRET_KEY!,
  webhookSecret: process.env.MONEROO_WEBHOOK_SECRET, // optional — needed for webhook verification
});
```

> Never expose your `secretKey` in client-side code. Always use it server-side via environment variables.

---

## Payments

Payments follow a redirect flow: your server initializes a transaction, Moneroo returns a checkout URL, and you redirect your customer there.

### Initialize a payment

```typescript
const { data } = await moneroo.payments.initialize({
  amount: 5000,          // integer, smallest currency unit (e.g. 5000 XOF = 5000 CFA)
  currency: 'XOF',
  description: 'Order #123',
  return_url: 'https://yourapp.com/payments/callback',
  customer: {
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone: '+22951345020',  // optional
  },
  // optional: restrict to specific payment methods
  methods: ['mtn_bj', 'wave_sn', 'orange_ci'],
  // optional: pass through your own data (string values only)
  metadata: {
    order_id: '123',
    customer_id: '456',
  },
});

// Redirect your customer to the checkout page
redirect(data.checkout_url);
console.log(data.id); // save this to retrieve the transaction later
```

### Retrieve a payment

```typescript
const { data: payment } = await moneroo.payments.retrieve('PAYMENT_ID');

console.log(payment.id);
console.log(payment.status);          // 'initiated' | 'pending' | 'success' | 'failed' | 'cancelled'
console.log(payment.amount);
console.log(payment.currency.code);   // 'XOF'
console.log(payment.customer?.email);
```

### Verify a payment

Always verify before crediting your customer. Check status, amount, and currency.

```typescript
const { data: payment } = await moneroo.payments.verify('PAYMENT_ID');

if (
  payment.status === 'success' &&
  payment.amount >= expectedAmount &&
  payment.currency.code === expectedCurrency
) {
  // Safe to fulfill the order
}
```

---

## Payouts

Payouts let you send money directly to a customer's mobile money account.

### Initialize a payout

Each payout method has a required `recipient` field. Most methods use `msisdn` (phone number in international format). See [Available payout methods](#payout-methods).

```typescript
const { data } = await moneroo.payouts.initialize({
  amount: 1000,
  currency: 'XOF',
  description: 'Order #123 refund',
  method: 'mtn_bj',                    // payout method shortcode
  customer: {
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
  },
  recipient: {
    msisdn: '22951345020',             // MTN MoMo Benin account number
  },
  metadata: { order_id: '123' },
});

console.log(data.id); // track the payout with this ID
```

### Retrieve / Verify a payout

```typescript
const { data: payout } = await moneroo.payouts.retrieve('PAYOUT_ID');
// or — preferred before crediting your system
const { data: payout } = await moneroo.payouts.verify('PAYOUT_ID');

console.log(payout.status);      // 'initiated' | 'pending' | 'success' | 'failed'
console.log(payout.failed_at);   // null or ISO timestamp
console.log(payout.success_at);  // null or ISO timestamp
```

---

## Webhooks

Moneroo sends `POST` requests to your webhook URL after every transaction status change. The request includes an `X-Moneroo-Signature` header you must verify.

**Important:** pass the **raw body string** (before `JSON.parse`) to the verification methods.

```typescript
import { Moneroo } from 'moneroo';

const moneroo = new Moneroo({
  secretKey: process.env.MONEROO_SECRET_KEY!,
  webhookSecret: process.env.MONEROO_WEBHOOK_SECRET!,
});

// Express example — use express.raw() to get the raw body
app.post('/webhooks/moneroo', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-moneroo-signature'] as string;

  let event;
  try {
    event = moneroo.webhooks.constructEvent(req.body.toString(), signature);
  } catch {
    return res.sendStatus(403); // invalid signature
  }

  switch (event.event) {
    case 'payment.success':
      console.log('Payment succeeded:', event.data.id);
      // always re-verify via API before fulfilling
      break;
    case 'payment.failed':
      console.log('Payment failed:', event.data.id);
      break;
    case 'payout.success':
      console.log('Payout sent:', event.data.id);
      break;
    case 'payout.failed':
      console.log('Payout failed:', event.data.id);
      break;
  }

  res.sendStatus(200); // acknowledge within 3 seconds
});
```

### Verify only (without parsing)

```typescript
const isValid = moneroo.webhooks.verify(rawBody, signature);
```

### Standalone helpers (without a client instance)

```typescript
import { verifySignature, constructWebhookEvent } from 'moneroo';

const valid = verifySignature(rawBody, signature, process.env.MONEROO_WEBHOOK_SECRET!);
const event = constructWebhookEvent(rawBody, signature, process.env.MONEROO_WEBHOOK_SECRET!);
```

### Webhook events

| Event | Trigger |
|---|---|
| `payment.initiated` | Customer starts a payment |
| `payment.success` | Payment completed successfully |
| `payment.failed` | Payment failed |
| `payment.cancelled` | Payment cancelled |
| `payout.initiated` | Payout queued |
| `payout.success` | Payout delivered |
| `payout.failed` | Payout failed |

---

## Error handling

All API errors throw a specific subclass of `MonerooError`. Catch them individually or as a group.

```typescript
import {
  AuthenticationError,
  MonerooError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from 'moneroo';

try {
  const { data } = await moneroo.payments.retrieve('bad_id');
} catch (error) {
  if (error instanceof NotFoundError) {
    // 404 — transaction does not exist
    console.log('Not found');
  } else if (error instanceof ValidationError) {
    // 400 / 422 — bad parameters
    console.log('Validation errors:', error.errors);
  } else if (error instanceof AuthenticationError) {
    // 401 / 403 — invalid or missing API key
    console.log('Check your secret key');
  } else if (error instanceof RateLimitError) {
    // 429 — exceeded 120 req/min
    console.log(`Rate limited, retry in ${error.retryAfterMs}ms`);
    await new Promise((r) => setTimeout(r, error.retryAfterMs));
  } else if (error instanceof ServerError) {
    // 500 / 503 — Moneroo server error, safe to retry
    console.log(`Server error ${error.status}`);
  } else if (error instanceof MonerooError) {
    // catch-all for any other API error
    console.log(`API error ${error.status}: ${error.message}`);
  }
}
```

### Error classes

| Class | HTTP | Cause |
|---|---|---|
| `AuthenticationError` | 401, 403 | Invalid or missing API key, insufficient permissions |
| `ValidationError` | 400, 422 | Missing or invalid parameters |
| `NotFoundError` | 404 | Resource does not exist |
| `RateLimitError` | 429 | Over 120 requests/minute — `retryAfterMs = 60000` |
| `ServerError` | 500, 503 | Moneroo server error, safe to retry |
| `MonerooError` | any | Base class — all errors above extend this |

All error instances expose:
- `error.status` — HTTP status code
- `error.message` — human-readable message from the API
- `error.errors` — array of `ApiErrorDetail` objects or `null`

---

## Payment statuses

| Status | Type | Description |
|---|---|---|
| `initiated` | Transitional | Awaiting customer action on checkout page |
| `pending` | Transitional | Customer started paying, not completed yet |
| `success` | **Final** | Payment completed successfully |
| `failed` | **Final** | Payment failed |
| `cancelled` | **Final** | Payment cancelled (payments only) |

Always re-verify a transaction via `payments.verify()` before fulfilling orders. Do not rely solely on webhooks.

---

## Payout methods

Most methods require a `recipient.msisdn` field (phone number in international format, e.g. `22951345020`).  
The test method `moneroo_payout_demo` requires `recipient.account_number`.

Popular methods:

| Code | Method | Currency | Countries |
|---|---|---|---|
| `mtn_bj` | MTN MoMo Benin | XOF | BJ |
| `mtn_ci` | MTN MoMo Côte d'Ivoire | XOF | CI |
| `wave_sn` | Wave Senegal | XOF | SN |
| `wave_ci` | Wave Côte d'Ivoire | XOF | CI |
| `orange_sn` | Orange Money Senegal | XOF | SN |
| `orange_ci` | Orange Money CI | XOF | CI |
| `mpesa_ke` | M-Pesa Kenya | KES | KE |
| `mtn_gh` | MTN MoMo Ghana | GHS | GH |

Full list available at [docs.moneroo.io/payouts/available-methods](https://docs.moneroo.io/payouts/available-methods) or via `GET /utils/payout/methods`.

---

## Sandbox & testing

Use **sandbox API keys** from your [Moneroo dashboard](https://app.moneroo.io) → Developers → API Keys.

Test phone numbers for the default **Moneroo Test Gateway**:

| Phone | Scenario |
|---|---|
| `(414) 951-8161` | Successful transaction |
| `(414) 951-8162` | Pending transaction |
| `(414) 951-8163` | Failed transaction |

Sandbox data is automatically deleted after 90 days.

---

## TypeScript

All types are exported from the main entry point:

```typescript
import type {
  // Client
  MonerooClientOptions,

  // Payments
  PaymentInitializeParams,
  PaymentInitializeData,
  PaymentResponse,
  PaymentStatus,
  CustomerInput,
  Customer,

  // Payouts
  PayoutInitializeParams,
  PayoutInitializeData,
  PayoutResponse,
  PayoutStatus,
  PayoutRecipient,

  // Webhooks
  WebhookEvent,
  WebhookEventType,
  WebhookPaymentData,
  WebhookPayoutData,

  // Common
  ApiResponse,
  ApiErrorDetail,
} from 'moneroo';
```

---

## Contributing

See [CONTRIBUTING.md](https://github.com/aboudou-cto-bloko/moneroo-tools/blob/main/CONTRIBUTING.md).

## License

[MIT](https://github.com/aboudou-cto-bloko/moneroo-tools/blob/main/LICENSE) — [Aboudou Zinsou](https://github.com/aboudou-cto-bloko)

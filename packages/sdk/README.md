# moneroo

Official TypeScript SDK for the [Moneroo](https://moneroo.io) payment API.

Built by [Aboudou Zinsou](https://github.com/aboudouzinsou).

## Installation

```bash
npm install moneroo
# or
pnpm add moneroo
```

## Requirements

Node.js 18+ (uses native `fetch` and `crypto`).

## Quick start

```typescript
import { Moneroo } from 'moneroo';

const moneroo = new Moneroo({
  secretKey: process.env.MONEROO_SECRET_KEY!,
  webhookSecret: process.env.MONEROO_WEBHOOK_SECRET, // optional
});
```

---

## Payments

### Initialize a payment

```typescript
const { data } = await moneroo.payments.initialize({
  amount: 5000,
  currency: 'XOF',
  description: 'Commande #123',
  return_url: 'https://yourapp.com/payments/callback',
  customer: {
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
  },
  // optional: restrict to specific methods
  methods: ['mtn_bj', 'wave_sn'],
  // optional: key/value metadata (string values only)
  metadata: { order_id: '123' },
});

// Redirect your customer
console.log(data.checkout_url);
```

### Retrieve a payment

```typescript
const { data: payment } = await moneroo.payments.retrieve('PAYMENT_ID');

console.log(payment.status);   // 'initiated' | 'pending' | 'success' | 'failed' | 'cancelled'
console.log(payment.amount);
console.log(payment.customer?.email);
```

### Verify a payment (before crediting your customer)

```typescript
const { data: payment } = await moneroo.payments.verify('PAYMENT_ID');

if (payment.status === 'success') {
  // Safe to credit the customer
}
```

---

## Payouts

### Initialize a payout

```typescript
const { data } = await moneroo.payouts.initialize({
  amount: 1000,
  currency: 'XOF',
  description: 'Remboursement commande #123',
  method: 'mtn_bj',
  customer: {
    email: 'john@example.com',
    first_name: 'John',
    last_name: 'Doe',
  },
  recipient: { msisdn: '22951345020' }, // method-specific field
  metadata: { order_id: '123' },
});

console.log(data.id); // use this ID to track the payout
```

### Retrieve / Verify a payout

```typescript
const { data: payout } = await moneroo.payouts.retrieve('PAYOUT_ID');
// or
const { data: payout } = await moneroo.payouts.verify('PAYOUT_ID');

console.log(payout.status); // 'initiated' | 'pending' | 'success' | 'failed'
```

---

## Webhooks

```typescript
import { Moneroo } from 'moneroo';

const moneroo = new Moneroo({
  secretKey: process.env.MONEROO_SECRET_KEY!,
  webhookSecret: process.env.MONEROO_WEBHOOK_SECRET!,
});

// In your POST /webhooks endpoint — pass the raw body string, not parsed JSON
app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-moneroo-signature'] as string;

  const event = moneroo.webhooks.constructEvent(req.body.toString(), signature);
  // throws if signature is invalid

  switch (event.event) {
    case 'payment.success':
      console.log('Payment succeeded:', event.data.id);
      break;
    case 'payout.failed':
      console.log('Payout failed:', event.data.id);
      break;
  }

  res.sendStatus(200);
});
```

### Standalone helpers

```typescript
import { verifySignature, constructWebhookEvent } from 'moneroo';

const valid = verifySignature(rawBody, signature, secret);
const event = constructWebhookEvent(rawBody, signature, secret);
```

---

## Error handling

```typescript
import {
  AuthenticationError,
  MonerooError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from 'moneroo';

try {
  await moneroo.payments.retrieve('bad_id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Transaction not found');
  } else if (error instanceof RateLimitError) {
    console.log(`Rate limited — retry in ${error.retryAfterMs}ms`);
  } else if (error instanceof ValidationError) {
    console.log('Bad params:', error.errors);
  } else if (error instanceof AuthenticationError) {
    console.log('Check your secret key');
  } else if (error instanceof MonerooError) {
    console.log(`API error ${error.status}: ${error.message}`);
  }
}
```

| Class | HTTP status | Cause |
|---|---|---|
| `AuthenticationError` | 401, 403 | Invalid or missing API key |
| `ValidationError` | 400, 422 | Missing/invalid parameters |
| `NotFoundError` | 404 | Resource does not exist |
| `RateLimitError` | 429 | > 120 requests/min — wait 60s |
| `ServerError` | 500, 503 | Moneroo server error |
| `MonerooError` | any | Base class for all above |

---

## Payment statuses

| Status | Type | Description |
|---|---|---|
| `initiated` | Transitional | Awaiting customer action |
| `pending` | Transitional | Processing in progress |
| `success` | **Final** | Completed successfully |
| `failed` | **Final** | Transaction failed |
| `cancelled` | **Final** | Cancelled (payments only) |

---

## Sandbox / Testing

Use sandbox API keys from your [Moneroo dashboard](https://app.moneroo.io) → Developers.

Test phone numbers (Moneroo Test Gateway):

| Phone | Result |
|---|---|
| `(414) 951-8161` | Success |
| `(414) 951-8162` | Pending |
| `(414) 951-8163` | Failed |

---

## License

MIT — [Aboudou Zinsou](https://github.com/aboudouzinsou)

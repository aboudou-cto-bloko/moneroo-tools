import type { PaymentStatus } from './payment.js';
import type { PayoutStatus } from './payout.js';

// ---------------------------------------------------------------------------
// Event names
// ---------------------------------------------------------------------------

export type PaymentEventType =
  | 'payment.initiated'
  | 'payment.success'
  | 'payment.failed'
  | 'payment.cancelled';

export type PayoutEventType = 'payout.initiated' | 'payout.success' | 'payout.failed';

export type WebhookEventType = PaymentEventType | PayoutEventType;

// ---------------------------------------------------------------------------
// Webhook data shapes
// The webhook only delivers a subset of the full transaction object.
// Always re-query the API to get the complete, authoritative state.
// ---------------------------------------------------------------------------

export interface WebhookCustomer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
}

export interface WebhookPaymentData {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  description?: string;
  customer?: WebhookCustomer;
  [key: string]: unknown;
}

export interface WebhookPayoutData {
  id: string;
  status: PayoutStatus;
  amount: number;
  currency: string;
  description?: string;
  customer?: WebhookCustomer;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Discriminated union — use event field to narrow the data type
// ---------------------------------------------------------------------------

export type WebhookEvent =
  | { event: 'payment.initiated'; data: WebhookPaymentData }
  | { event: 'payment.success'; data: WebhookPaymentData }
  | { event: 'payment.failed'; data: WebhookPaymentData }
  | { event: 'payment.cancelled'; data: WebhookPaymentData }
  | { event: 'payout.initiated'; data: WebhookPayoutData }
  | { event: 'payout.success'; data: WebhookPayoutData }
  | { event: 'payout.failed'; data: WebhookPayoutData };

// ---------------------------------------------------------------------------
// Generic envelope (for unknown / future events)
// ---------------------------------------------------------------------------

export interface WebhookPayload<T = unknown> {
  event: WebhookEventType;
  data: T;
}

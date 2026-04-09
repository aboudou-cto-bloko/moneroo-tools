import type { Customer, PaymentApp, PaymentCurrency } from './payment.js';

/** Transitional: initiated, pending — Final: failed, success */
export enum PayoutStatus {
  Initiated = 'initiated',
  Pending = 'pending',
  Failed = 'failed',
  Success = 'success',
}

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface PayoutCustomerInput {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  /** ISO 3166-1 alpha-2 country code */
  country?: string;
  zip?: string;
}

/**
 * Method-specific recipient fields.
 * Most methods require `msisdn` (phone number in international format).
 * The test method (`moneroo_payout_demo`) requires `account_number`.
 */
export type PayoutRecipient = { msisdn: string } | { account_number: string } | Record<string, string | number>;

export interface PayoutInitializeParams {
  amount: number;
  /** ISO 4217 currency code */
  currency: string;
  description: string;
  /** Payout method shortcode (e.g. "mtn_bj", "wave_sn") */
  method: string;
  customer: PayoutCustomerInput;
  /** Method-specific recipient fields (e.g. { msisdn: "22951345020" }) */
  recipient: PayoutRecipient;
  /** Key-value pairs. Only string values are allowed. */
  metadata?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/** Response data from POST /payouts/initialize */
export interface PayoutInitializeData {
  id: string;
}

export interface PayoutMethod {
  id: string;
  name: string;
  short_code: string;
  icon_url: string;
}

export interface PayoutGateway {
  id: string;
  account_name: string;
  name: string;
  short_code: string;
  icon_url: string;
  transaction_id: string | null;
  transaction_status: string | null;
  transaction_failure_message: string | null;
}

export interface PayoutDisburse {
  id: string;
  identifier: string;
  failure_message: string | null;
  failure_error_code: string | null;
  failure_error_type: string | null;
  method: PayoutMethod;
  gateway: PayoutGateway;
}

export interface PayoutResponse {
  id: string;
  status: PayoutStatus;
  is_processed?: boolean;
  amount: number;
  amount_formatted: string;
  currency: PaymentCurrency;
  description: string;
  environment: 'sandbox' | 'production';
  metadata?: Record<string, unknown> | unknown[];
  app?: PaymentApp;
  customer?: Customer;
  disburse?: PayoutDisburse;
  payout_phone_number?: string | null;
  failed_at: string | null;
  pending_at: string | null;
  success_at: string | null;
}

// Re-export shared types used by consumers of this module
export type { Customer, PaymentApp, PaymentCurrency };

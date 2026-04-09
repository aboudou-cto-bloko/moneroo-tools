/** Transitional: initiated, pending — Final: cancelled, failed, success */
export enum PaymentStatus {
  Initiated = 'initiated',
  Pending = 'pending',
  Cancelled = 'cancelled',
  Failed = 'failed',
  Success = 'success',
}

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface CustomerInput {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
}

export interface RestrictedPhone {
  number: string;
  country_code: string;
}

export interface PaymentInitializeParams {
  amount: number;
  currency: string;
  description: string;
  return_url: string;
  customer: CustomerInput;
  /** Key-value pairs. Only string values are allowed. */
  metadata?: Record<string, string>;
  /** Shortcodes of the payment methods to allow. Defaults to all available. */
  methods?: string[];
  /** Restrict payment to a specific country. Mutually exclusive with restricted_phone. */
  restrict_country_code?: string;
  /** Restrict payment to a specific phone number. Mutually exclusive with restrict_country_code. */
  restricted_phone?: RestrictedPhone;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

/** Response data from POST /payments/initialize */
export interface PaymentInitializeData {
  id: string;
  checkout_url: string;
}

export interface PaymentCurrency {
  name: string;
  name_plural: string;
  code: string;
  symbol: string;
  symbol_native: string;
  symbol_first: boolean;
  decimals: number;
  decimal_digits: number;
  decimal_mark: string;
  thousands_separator: string;
  subunit: string;
  subunit_to_unit: number;
  rounding: number;
  icon_url: string;
}

export interface PaymentMethod {
  id?: string;
  name: string;
  /** Used in retrieve response */
  code?: string;
  /** Used in capture.method */
  short_code?: string;
  icon_url: string;
  environment?: string;
}

export interface PaymentGateway {
  id?: string;
  name: string;
  account_name?: string;
  /** Used in retrieve response */
  code?: string;
  /** Used in capture.gateway */
  short_code?: string;
  icon_url: string;
  environment?: string;
  transaction_id?: string | null;
  transaction_status?: string | null;
  transaction_failure_message?: string | null;
}

export interface PaymentApp {
  id: string;
  name: string;
  website_url?: string;
  icon_url: string;
  is_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country_code: string | null;
  country: string | null;
  zip_code: string | null;
  profile_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentCaptureMetadata {
  network_transaction_id: string | null;
  amount_debited: number | null;
  commission: number | null;
  fees: number | null;
  selected_payment_method: string | null;
  [key: string]: unknown;
}

export interface PaymentCapture {
  identifier: string;
  rate: number | null;
  rate_formatted: string | null;
  correction_rate: number | null;
  phone_number: string | null;
  failure_message: string | null;
  failure_error_code: string | null;
  failure_error_type: string | null;
  metadata: PaymentCaptureMetadata;
  amount: number;
  amount_formatted: string;
  currency: PaymentCurrency;
  method: PaymentMethod;
  gateway: PaymentGateway;
  context: Record<string, unknown>;
}

export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  is_processed: boolean;
  processed_at: string | null;
  amount: number;
  amount_formatted: string;
  currency: PaymentCurrency;
  description: string;
  return_url: string;
  environment: 'sandbox' | 'production';
  initiated_at: string;
  checkout_url?: string;
  payment_phone_number?: string | null;
  metadata?: Record<string, unknown>;
  app?: PaymentApp;
  customer?: Customer;
  method?: PaymentMethod;
  gateway?: PaymentGateway;
  capture?: PaymentCapture;
  context?: Record<string, unknown>;
  created_at?: string;
}

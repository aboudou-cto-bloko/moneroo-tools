export interface ApiErrorDetail {
  type?: string;
  message: string;
  hint?: string;
  field?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  message: string;
  data: T;
  errors: ApiErrorDetail[] | null;
}

export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  from: number | null;
  to: number | null;
}

export interface PaginatedResponse<T = unknown> {
  message: string;
  data: T[];
  errors: ApiErrorDetail[] | null;
  meta: PaginationMeta;
}

export interface MonerooClientOptions {
  secretKey: string;
  baseUrl?: string;
  /** Webhook signing secret from the Moneroo dashboard (required to use moneroo.webhooks) */
  webhookSecret?: string;
}

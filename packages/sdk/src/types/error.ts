import type { ApiErrorDetail } from './common.js';

export interface ErrorResponse {
  message: string;
  data: Record<string, never> | null;
  errors: ApiErrorDetail[] | null;
}

/**
 * HTTP status codes returned by the Moneroo API.
 * 2xx: success
 * 4xx: client error (bad data, auth, not found, rate limit)
 * 5xx: server error
 */
export type MonerooHttpStatus = 200 | 201 | 202 | 400 | 401 | 403 | 404 | 422 | 429 | 500 | 503;

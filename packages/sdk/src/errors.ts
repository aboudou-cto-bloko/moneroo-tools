import type { ApiErrorDetail } from './types/common.js';

export class MonerooError extends Error {
  readonly status: number;
  readonly errors: ApiErrorDetail[] | null;

  constructor(message: string, status: number, errors: ApiErrorDetail[] | null = null) {
    super(message);
    this.name = 'MonerooError';
    this.status = status;
    this.errors = errors;
    // Restore prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** 401 - Missing or invalid API key / 403 - Insufficient access rights */
export class AuthenticationError extends MonerooError {
  constructor(message: string, status: 401 | 403, errors: ApiErrorDetail[] | null = null) {
    super(message, status, errors);
    this.name = 'AuthenticationError';
  }
}

/** 400 - Malformed request or missing parameters / 422 - Parameters invalid for the request */
export class ValidationError extends MonerooError {
  constructor(message: string, status: 400 | 422, errors: ApiErrorDetail[] | null = null) {
    super(message, status, errors);
    this.name = 'ValidationError';
  }
}

/** 404 - Resource does not exist */
export class NotFoundError extends MonerooError {
  constructor(message: string, errors: ApiErrorDetail[] | null = null) {
    super(message, 404, errors);
    this.name = 'NotFoundError';
  }
}

/**
 * 429 - Rate limit exceeded (120 req/min).
 * Wait 60 seconds before retrying.
 */
export class RateLimitError extends MonerooError {
  /** Recommended wait time in milliseconds before retrying */
  readonly retryAfterMs: number = 60_000;

  constructor(message: string, errors: ApiErrorDetail[] | null = null) {
    super(message, 429, errors);
    this.name = 'RateLimitError';
  }
}

/** 500 / 503 - Server-side error */
export class ServerError extends MonerooError {
  constructor(message: string, status: 500 | 503, errors: ApiErrorDetail[] | null = null) {
    super(message, status, errors);
    this.name = 'ServerError';
  }
}

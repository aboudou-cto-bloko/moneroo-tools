import {
  AuthenticationError,
  MonerooError,
  NotFoundError,
  RateLimitError,
  ServerError,
  ValidationError,
} from './errors.js';
import { PaymentsResource } from './resources/payments.js';
import { PayoutsResource } from './resources/payouts.js';
import { WebhooksResource } from './resources/webhooks.js';
import type { ApiResponse, MonerooClientOptions } from './types/common.js';
import type { ErrorResponse } from './types/error.js';

const DEFAULT_BASE_URL = 'https://api.moneroo.io/v1';

export class Moneroo {
  private readonly secretKey: string;
  private readonly baseUrl: string;

  readonly payments: PaymentsResource;
  readonly payouts: PayoutsResource;
  readonly webhooks: WebhooksResource;

  constructor(options: MonerooClientOptions) {
    if (!options.secretKey) {
      throw new Error('secretKey is required');
    }
    this.secretKey = options.secretKey;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');

    this.payments = new PaymentsResource(this);
    this.payouts = new PayoutsResource(this);
    this.webhooks = new WebhooksResource(options.webhookSecret);
  }

  private async _request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}/${path.replace(/^\//, '')}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.secretKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let payload: ApiResponse<T> | ErrorResponse;
    try {
      payload = (await response.json()) as ApiResponse<T> | ErrorResponse;
    } catch {
      throw new MonerooError(
        `Failed to parse response (HTTP ${response.status})`,
        response.status,
      );
    }

    if (response.ok) {
      return payload as ApiResponse<T>;
    }

    const { message, errors } = payload as ErrorResponse;

    switch (response.status) {
      case 401:
        throw new AuthenticationError(message, 401, errors);
      case 403:
        throw new AuthenticationError(message, 403, errors);
      case 404:
        throw new NotFoundError(message, errors);
      case 400:
        throw new ValidationError(message, 400, errors);
      case 422:
        throw new ValidationError(message, 422, errors);
      case 429:
        throw new RateLimitError(message, errors);
      case 500:
        throw new ServerError(message, 500, errors);
      case 503:
        throw new ServerError(message, 503, errors);
      default:
        throw new MonerooError(message, response.status, errors);
    }
  }

  /** @internal Exposed for resource classes to call */
  _get<T>(path: string): Promise<ApiResponse<T>> {
    return this._request<T>('GET', path);
  }

  _post<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this._request<T>('POST', path, body);
  }

  _put<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this._request<T>('PUT', path, body);
  }

  _patch<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
    return this._request<T>('PATCH', path, body);
  }

  _delete<T>(path: string): Promise<ApiResponse<T>> {
    return this._request<T>('DELETE', path);
  }
}

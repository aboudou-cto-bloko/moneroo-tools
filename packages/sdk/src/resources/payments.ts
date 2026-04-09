import type { Moneroo } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  PaymentInitializeData,
  PaymentInitializeParams,
  PaymentResponse,
} from '../types/payment.js';

export class PaymentsResource {
  constructor(private readonly client: Moneroo) {}

  /**
   * Initialize a payment and get a checkout URL.
   * POST /v1/payments/initialize
   */
  initialize(params: PaymentInitializeParams): Promise<ApiResponse<PaymentInitializeData>> {
    return this.client._post<PaymentInitializeData>('payments/initialize', params);
  }

  /**
   * Retrieve the full details of a payment transaction.
   * GET /v1/payments/{id}
   */
  retrieve(id: string): Promise<ApiResponse<PaymentResponse>> {
    return this.client._get<PaymentResponse>(`payments/${id}`);
  }

  /**
   * Verify a payment transaction.
   * Use this to confirm the status before crediting/debiting your customer.
   * GET /v1/payments/{id}/verify
   */
  verify(id: string): Promise<ApiResponse<PaymentResponse>> {
    return this.client._get<PaymentResponse>(`payments/${id}/verify`);
  }
}

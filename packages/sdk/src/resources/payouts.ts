import type { Moneroo } from '../client.js';
import type { ApiResponse } from '../types/common.js';
import type {
  PayoutInitializeData,
  PayoutInitializeParams,
  PayoutResponse,
} from '../types/payout.js';

export class PayoutsResource {
  constructor(private readonly client: Moneroo) {}

  /**
   * Initialize a payout to a customer.
   * POST /v1/payouts/initialize
   */
  initialize(params: PayoutInitializeParams): Promise<ApiResponse<PayoutInitializeData>> {
    return this.client._post<PayoutInitializeData>('payouts/initialize', params);
  }

  /**
   * Retrieve the full details of a payout transaction.
   * GET /v1/payouts/{id}
   */
  retrieve(id: string): Promise<ApiResponse<PayoutResponse>> {
    return this.client._get<PayoutResponse>(`payouts/${id}`);
  }

  /**
   * Verify a payout transaction.
   * Use this to confirm the status before crediting your customer.
   * GET /v1/payouts/{id}/verify
   */
  verify(id: string): Promise<ApiResponse<PayoutResponse>> {
    return this.client._get<PayoutResponse>(`payouts/${id}/verify`);
  }
}

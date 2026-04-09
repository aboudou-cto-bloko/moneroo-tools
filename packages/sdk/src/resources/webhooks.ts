import type { WebhookEvent } from '../types/webhook.js';
import { constructEvent, verifySignature } from '../utils/webhooks.js';

export class WebhooksResource {
  private readonly secret: string | undefined;

  constructor(secret: string | undefined) {
    this.secret = secret;
  }

  private requireSecret(): string {
    if (!this.secret) {
      throw new Error(
        'webhookSecret is not configured. Pass it in the Moneroo constructor options: new Moneroo({ secretKey, webhookSecret })',
      );
    }
    return this.secret;
  }

  /**
   * Verify that a webhook payload was signed by Moneroo.
   *
   * @param payload   Raw request body string (before JSON parsing)
   * @param signature Value of the `X-Moneroo-Signature` header
   */
  verify(payload: string, signature: string): boolean {
    return verifySignature(payload, signature, this.requireSecret());
  }

  /**
   * Verify the signature and return a typed WebhookEvent.
   * Throws if the signature is invalid.
   *
   * @param payload   Raw request body string (before JSON parsing)
   * @param signature Value of the `X-Moneroo-Signature` header
   *
   * @example
   * const event = moneroo.webhooks.constructEvent(rawBody, req.headers['x-moneroo-signature']);
   * if (event.event === 'payment.success') {
   *   const { id } = event.data; // data is typed as WebhookPaymentData
   * }
   */
  constructEvent(payload: string, signature: string): WebhookEvent {
    return constructEvent(payload, signature, this.requireSecret());
  }
}

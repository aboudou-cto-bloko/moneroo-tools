import { createHmac, timingSafeEqual } from 'node:crypto';
import type { WebhookEvent } from '../types/webhook.js';

/**
 * Compute the expected HMAC-SHA256 signature for a raw webhook payload.
 * The payload must be the raw request body string (before JSON parsing).
 */
function computeSignature(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verify that a webhook payload was signed by Moneroo.
 *
 * @param payload   Raw request body string (value of req.body before JSON.parse,
 *                  or req.rawBody / Buffer.toString())
 * @param signature Value of the `X-Moneroo-Signature` request header
 * @param secret    Webhook signing secret from the Moneroo dashboard
 * @returns         true if the signature is valid
 */
export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const computed = computeSignature(payload, secret);

  // Lengths must match before timingSafeEqual to avoid exceptions
  if (computed.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(computed, 'utf8'), Buffer.from(signature, 'utf8'));
}

/**
 * Verify the signature and parse the payload into a typed WebhookEvent.
 * Throws if the signature is invalid.
 *
 * @param payload   Raw request body string
 * @param signature Value of the `X-Moneroo-Signature` request header
 * @param secret    Webhook signing secret from the Moneroo dashboard
 */
export function constructEvent(payload: string, signature: string, secret: string): WebhookEvent {
  if (!verifySignature(payload, signature, secret)) {
    throw new Error(
      'Invalid webhook signature. Ensure you are passing the raw request body string and the correct signing secret.',
    );
  }

  return JSON.parse(payload) as WebhookEvent;
}

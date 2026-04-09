import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  AuthenticationError,
  Moneroo,
  MonerooError,
  NotFoundError,
  RateLimitError,
  ValidationError,
} from 'moneroo';
import { z } from 'zod';
import { registerAnalyticsTools } from './tools/analytics.js';
import { registerInsightsTools } from './tools/insights.js';
import { registerAutomationTools } from './tools/automations.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatError(error: unknown): string {
  if (error instanceof ValidationError) {
    const details = error.errors?.map((e) => e.message).join(', ');
    return `Validation error (${error.status}): ${error.message}${details ? ` — ${details}` : ''}`;
  }
  if (error instanceof AuthenticationError) {
    return `Authentication error (${error.status}): ${error.message}`;
  }
  if (error instanceof NotFoundError) {
    return `Not found: ${error.message}`;
  }
  if (error instanceof RateLimitError) {
    return `Rate limit exceeded. Wait 60 seconds before retrying.`;
  }
  if (error instanceof MonerooError) {
    return `Moneroo error (${error.status}): ${error.message}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

function toText(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

function toError(error: unknown) {
  return { content: [{ type: 'text' as const, text: formatError(error) }], isError: true as const };
}

function buildQueryString(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) qs.set(key, String(value));
  }
  return qs.toString();
}

// ---------------------------------------------------------------------------
// Server factory
// ---------------------------------------------------------------------------

export function createServer(secretKey: string): McpServer {
  const moneroo = new Moneroo({ secretKey });

  const server = new McpServer(
    { name: 'moneroo', version: '1.0.0' },
    {
      instructions:
        'This MCP server provides tools to interact with the Moneroo payment API. ' +
        'Built by Aboudou Zinsou (github.com/aboudou-cto-bloko). ' +
        'Use it to create payments, list transactions, manage payouts, and verify statuses. ' +
        'Always use verify_payment or verify_payout before crediting a customer — never rely on status from list or webhooks alone.',
    },
  );

  // -------------------------------------------------------------------------
  // PAYMENTS
  // -------------------------------------------------------------------------

  server.registerTool(
    'list_payments',
    {
      title: 'List payments',
      description:
        'List recent payment transactions with optional filters. ' +
        'Returns a paginated list of payments sorted by most recent first.',
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Number of results to return (1–100, default 15)'),
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe('Page number for pagination (default 1)'),
        status: z
          .enum(['initiated', 'pending', 'cancelled', 'failed', 'success'])
          .optional()
          .describe('Filter by payment status'),
        from_date: z
          .string()
          .optional()
          .describe('Start date filter — ISO 8601 date (e.g. 2024-01-01)'),
        to_date: z
          .string()
          .optional()
          .describe('End date filter — ISO 8601 date (e.g. 2024-12-31)'),
      },
    },
    async ({ limit, page, status, from_date, to_date }) => {
      try {
        const qs = buildQueryString({ limit, page, status, from_date, to_date });
        const path = qs ? `payments?${qs}` : 'payments';
        const response = await moneroo._get<unknown>(path);
        return toText(JSON.stringify(response.data, null, 2));
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------

  server.registerTool(
    'get_payment',
    {
      title: 'Get payment',
      description:
        'Retrieve the full details of a payment transaction by its ID. ' +
        'Returns status, amount, currency, customer info, payment method, and gateway details.',
      inputSchema: {
        payment_id: z.string().describe('The unique ID of the payment transaction (e.g. k4su1ii7abdz)'),
      },
    },
    async ({ payment_id }) => {
      try {
        const response = await moneroo.payments.retrieve(payment_id);
        return toText(JSON.stringify(response.data, null, 2));
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------

  server.registerTool(
    'verify_payment',
    {
      title: 'Verify payment',
      description:
        'Verify the final status of a payment transaction. ' +
        'Use this before fulfilling an order — check that status is "success", amount matches, and currency matches. ' +
        'More authoritative than get_payment for confirming a completed transaction.',
      inputSchema: {
        payment_id: z.string().describe('The unique ID of the payment transaction to verify'),
      },
    },
    async ({ payment_id }) => {
      try {
        const response = await moneroo.payments.verify(payment_id);
        const { id, status, amount, currency, description, customer, is_processed } = response.data;
        return toText(
          JSON.stringify(
            {
              id,
              status,
              amount,
              currency: typeof currency === 'object' ? currency.code : currency,
              description,
              customer_email: customer?.email ?? null,
              is_processed,
              _raw: response.data,
            },
            null,
            2,
          ),
        );
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------

  server.registerTool(
    'create_payment_link',
    {
      title: 'Create payment link',
      description:
        'Initialize a payment and get a checkout URL to redirect the customer to. ' +
        'Returns a payment ID and a checkout_url. ' +
        'The customer must be redirected to checkout_url to complete payment.',
      inputSchema: {
        amount: z
          .number()
          .int()
          .positive()
          .describe('Payment amount as a positive integer (e.g. 5000 for 5000 XOF)'),
        currency: z
          .string()
          .length(3)
          .describe('ISO 4217 currency code (e.g. XOF, USD, EUR, KES, GHS)'),
        description: z
          .string()
          .min(1)
          .describe('Human-readable description shown to the customer (e.g. "Order #123")'),
        return_url: z
          .string()
          .url()
          .describe('URL to redirect the customer to after payment completes or fails'),
        customer_email: z.string().email().describe("Customer's email address"),
        customer_first_name: z
          .string()
          .optional()
          .describe("Customer's first name"),
        customer_last_name: z
          .string()
          .optional()
          .describe("Customer's last name"),
        methods: z
          .array(z.string())
          .optional()
          .describe(
            'Restrict to specific payment method shortcodes (e.g. ["mtn_bj", "wave_sn"]). ' +
            'Omit to allow all available methods.',
          ),
        metadata: z
          .record(z.string(), z.string())
          .optional()
          .describe('Custom key-value data attached to the transaction (string values only)'),

      },
    },
    async ({
      amount,
      currency,
      description,
      return_url,
      customer_email,
      customer_first_name = '',
      customer_last_name = '',
      methods,
      metadata,
    }) => {
      try {
        const response = await moneroo.payments.initialize({
          amount,
          currency,
          description,
          return_url,
          customer: {
            email: customer_email,
            first_name: customer_first_name,
            last_name: customer_last_name,
          },
          ...(methods?.length ? { methods } : {}),
          ...(metadata ? { metadata } : {}),
        });

        const { id, checkout_url } = response.data;
        return toText(JSON.stringify({ id, checkout_url, message: response.message }, null, 2));
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------
  // PAYOUTS
  // -------------------------------------------------------------------------

  server.registerTool(
    'list_payouts',
    {
      title: 'List payouts',
      description:
        'List recent payout transactions with optional filters. ' +
        'Returns a paginated list of payouts sorted by most recent first.',
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Number of results to return (1–100, default 15)'),
        page: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe('Page number for pagination (default 1)'),
        status: z
          .enum(['initiated', 'pending', 'failed', 'success'])
          .optional()
          .describe('Filter by payout status'),
        from_date: z
          .string()
          .optional()
          .describe('Start date filter — ISO 8601 date (e.g. 2024-01-01)'),
        to_date: z
          .string()
          .optional()
          .describe('End date filter — ISO 8601 date (e.g. 2024-12-31)'),
      },
    },
    async ({ limit, page, status, from_date, to_date }) => {
      try {
        const qs = buildQueryString({ limit, page, status, from_date, to_date });
        const path = qs ? `payouts?${qs}` : 'payouts';
        const response = await moneroo._get<unknown>(path);
        return toText(JSON.stringify(response.data, null, 2));
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------

  server.registerTool(
    'get_payout',
    {
      title: 'Get payout',
      description:
        'Retrieve the full details of a payout transaction by its ID. ' +
        'Returns status, amount, currency, customer info, and disbursement details.',
      inputSchema: {
        payout_id: z.string().describe('The unique ID of the payout transaction'),
      },
    },
    async ({ payout_id }) => {
      try {
        const response = await moneroo.payouts.retrieve(payout_id);
        return toText(JSON.stringify(response.data, null, 2));
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------

  server.registerTool(
    'verify_payout',
    {
      title: 'Verify payout',
      description:
        'Verify the final status of a payout transaction. ' +
        'Use this before crediting value in your system — check that status is "success" and amount matches. ' +
        'More authoritative than get_payout for confirming a completed disbursement.',
      inputSchema: {
        payout_id: z.string().describe('The unique ID of the payout transaction to verify'),
      },
    },
    async ({ payout_id }) => {
      try {
        const response = await moneroo.payouts.verify(payout_id);
        const { id, status, amount, currency, description, customer, success_at, failed_at } =
          response.data;
        return toText(
          JSON.stringify(
            {
              id,
              status,
              amount,
              currency: typeof currency === 'object' ? currency.code : currency,
              description,
              customer_email: customer?.email ?? null,
              success_at,
              failed_at,
              _raw: response.data,
            },
            null,
            2,
          ),
        );
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------

  server.registerTool(
    'create_payout',
    {
      title: 'Create payout',
      description:
        'Send money to a customer via mobile money or other supported payout method. ' +
        'Use for refunds, salary payments, or any outbound transfer. ' +
        'Most methods require a recipient phone number (msisdn) in international format.',
      inputSchema: {
        amount: z
          .number()
          .int()
          .positive()
          .describe('Payout amount as a positive integer (e.g. 1000 for 1000 XOF)'),
        currency: z
          .string()
          .length(3)
          .describe('ISO 4217 currency code (e.g. XOF, USD, KES)'),
        description: z
          .string()
          .min(1)
          .describe('Reason for the payout (e.g. "Refund for order #123")'),
        method: z
          .string()
          .describe(
            'Payout method shortcode (e.g. "mtn_bj", "wave_sn", "orange_ci"). ' +
            'Use "moneroo_payout_demo" in sandbox.',
          ),
        customer_email: z.string().email().describe("Recipient's email address"),
        customer_first_name: z.string().describe("Recipient's first name"),
        customer_last_name: z.string().describe("Recipient's last name"),
        recipient_msisdn: z
          .string()
          .optional()
          .describe(
            'Recipient phone number in international format (e.g. "22951345020"). ' +
            'Required for most mobile money methods.',
          ),
        recipient_account_number: z
          .string()
          .optional()
          .describe('Account number — required for moneroo_payout_demo test method.'),
        metadata: z
          .record(z.string(), z.string())
          .optional()
          .describe('Custom key-value data attached to the payout (string values only)'),
      },
    },
    async ({
      amount,
      currency,
      description,
      method,
      customer_email,
      customer_first_name,
      customer_last_name,
      recipient_msisdn,
      recipient_account_number,
      metadata,
    }) => {
      try {
        // Build recipient from whichever field was provided
        const recipient: Record<string, string> = {};
        if (recipient_msisdn) recipient['msisdn'] = recipient_msisdn;
        else if (recipient_account_number) recipient['account_number'] = recipient_account_number;

        if (Object.keys(recipient).length === 0) {
          return toError(
            new Error(
              'recipient_msisdn is required for most payout methods. ' +
              'Provide recipient_account_number for moneroo_payout_demo.',
            ),
          );
        }

        const response = await moneroo.payouts.initialize({
          amount,
          currency,
          description,
          method,
          customer: {
            email: customer_email,
            first_name: customer_first_name,
            last_name: customer_last_name,
          },
          recipient,
          ...(metadata ? { metadata } : {}),
        });

        return toText(
          JSON.stringify({ id: response.data.id, message: response.message }, null, 2),
        );
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------
  // Phase V2: Analytics, Insights, Automations
  // -------------------------------------------------------------------------
  registerAnalyticsTools(server, moneroo);
  registerInsightsTools(server, moneroo);
  registerAutomationTools(server, moneroo);

  return server;
}

// ---------------------------------------------------------------------------
// Start function (called from bin.ts)
// ---------------------------------------------------------------------------

export async function startServer(secretKey: string): Promise<void> {
  const server = createServer(secretKey);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

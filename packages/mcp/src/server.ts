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

// ---------------------------------------------------------------------------
// Server factory
// ---------------------------------------------------------------------------

export function createServer(secretKey: string): McpServer {
  const moneroo = new Moneroo({ secretKey });

  const server = new McpServer(
    {
      name: 'moneroo',
      version: '0.1.0',
    },
    {
      instructions:
        'This MCP server provides tools to interact with the Moneroo payment API. ' +
        'It was built by Aboudou Zinsou (github.com/aboudouzinsou). ' +
        'Use it to initialize payments, retrieve transaction details, list payments, and manage payouts. ' +
        'Always verify a transaction status with get_payment or get_payout before crediting a customer.',
    },
  );

  // -------------------------------------------------------------------------
  // Tool: list_payments
  // -------------------------------------------------------------------------

  server.registerTool(
    'list_payments',
    {
      description:
        'List recent payment transactions. Returns a paginated list you can filter by status or date range.',
      inputSchema: {
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Number of results to return (1–100, default 15)'),
        status: z
          .enum(['initiated', 'pending', 'cancelled', 'failed', 'success'])
          .optional()
          .describe('Filter by payment status'),
        from_date: z.string().optional().describe('Start date filter (ISO 8601, e.g. 2024-01-01)'),
        to_date: z.string().optional().describe('End date filter (ISO 8601, e.g. 2024-12-31)'),
      },
    },
    async ({ limit, status, from_date, to_date }) => {
      try {
        const params = new URLSearchParams();
        if (limit !== undefined) params.set('limit', String(limit));
        if (status) params.set('status', status);
        if (from_date) params.set('from_date', from_date);
        if (to_date) params.set('to_date', to_date);

        const qs = params.toString();
        const path = qs ? `payments?${qs}` : 'payments';
        const response = await moneroo._get<unknown>(path);

        return toText(JSON.stringify(response.data, null, 2));
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------
  // Tool: get_payment
  // -------------------------------------------------------------------------

  server.registerTool(
    'get_payment',
    {
      description:
        'Retrieve the full details of a payment transaction by its ID. ' +
        'Returns status, amount, currency, customer info, and payment method.',
      inputSchema: {
        payment_id: z.string().describe('The unique ID of the payment transaction'),
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
  // Tool: create_payment_link
  // -------------------------------------------------------------------------

  server.registerTool(
    'create_payment_link',
    {
      description:
        'Initialize a payment and get a checkout URL to redirect the customer to. ' +
        'Returns a payment ID and a checkout_url.',
      inputSchema: {
        amount: z.number().int().positive().describe('Payment amount (integer, in the smallest currency unit)'),
        currency: z.string().length(3).describe('ISO 4217 currency code (e.g. XOF, USD, EUR)'),
        description: z.string().min(1).describe('Human-readable description of the payment'),
        return_url: z
          .string()
          .url()
          .describe('URL to redirect the customer to after payment (success or failure)'),
        customer_email: z.string().email().describe("Customer's email address"),
        customer_first_name: z
          .string()
          .optional()
          .describe("Customer's first name (required by the API, defaults to empty string)"),
        customer_last_name: z
          .string()
          .optional()
          .describe("Customer's last name (required by the API, defaults to empty string)"),
        methods: z
          .array(z.string())
          .optional()
          .describe('Restrict to specific payment method shortcodes (e.g. ["mtn_bj", "wave_sn"])'),
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
        });

        const { id, checkout_url } = response.data;
        return toText(
          JSON.stringify({ id, checkout_url, message: response.message }, null, 2),
        );
      } catch (error) {
        return toError(error);
      }
    },
  );

  // -------------------------------------------------------------------------
  // Tool: get_payout
  // -------------------------------------------------------------------------

  server.registerTool(
    'get_payout',
    {
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

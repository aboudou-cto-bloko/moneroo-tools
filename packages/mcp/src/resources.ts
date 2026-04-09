import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';

const DASHBOARD_BASE = 'https://app.moneroo.io/apps';
const DOCS_BASE = 'https://docs.moneroo.io';

export function registerResources(server: McpServer): void {
  // -------------------------------------------------------------------------
  // moneroo://dashboard — link to the Moneroo dashboard
  // -------------------------------------------------------------------------
  server.resource(
    'dashboard',
    'moneroo://dashboard',
    {
      title: 'Moneroo Dashboard',
      description: 'Direct link to the Moneroo application dashboard',
      mimeType: 'text/plain',
    },
    async () => ({
      contents: [
        {
          uri: 'moneroo://dashboard',
          mimeType: 'text/plain',
          text: `Moneroo Dashboard\n\nURL: ${DASHBOARD_BASE}/\n\nOpen this link in your browser to access your Moneroo dashboard.`,
        },
      ],
    }),
  );

  // -------------------------------------------------------------------------
  // moneroo://transaction/{id} — link to a specific transaction
  // -------------------------------------------------------------------------
  server.resource(
    'transaction',
    new ResourceTemplate('moneroo://transaction/{id}', { list: undefined }),
    {
      title: 'Moneroo Transaction',
      description: 'Direct link to a specific payment or payout transaction in the Moneroo dashboard',
      mimeType: 'text/plain',
    },
    async (uri, { id }) => {
      const transactionId = Array.isArray(id) ? id[0] : id;
      const url = `${DASHBOARD_BASE}/transactions/${transactionId}`;
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/plain',
            text: `Transaction: ${transactionId}\n\nURL: ${url}\n\nOpen this link in your browser to view the transaction details in your Moneroo dashboard.`,
          },
        ],
      };
    },
  );

  // -------------------------------------------------------------------------
  // moneroo://docs — Moneroo documentation
  // -------------------------------------------------------------------------
  server.resource(
    'docs',
    'moneroo://docs',
    {
      title: 'Moneroo Documentation',
      description: 'Moneroo API documentation and integration guides',
      mimeType: 'text/plain',
    },
    async () => ({
      contents: [
        {
          uri: 'moneroo://docs',
          mimeType: 'text/plain',
          text: `Moneroo Documentation\n\nMain docs: ${DOCS_BASE}/\n\nKey sections:\n- Payments API: ${DOCS_BASE}/payments/standard-integration\n- Payouts API: ${DOCS_BASE}/payouts/standard-integration\n- Webhooks: ${DOCS_BASE}/webhooks\n- SDK (Node.js): ${DOCS_BASE}/sdk/nodejs\n- Payment methods: ${DOCS_BASE}/payment-methods`,
        },
      ],
    }),
  );
}

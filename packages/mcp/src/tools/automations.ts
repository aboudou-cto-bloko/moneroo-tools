import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Moneroo } from 'moneroo';
import { z } from 'zod';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

function toText(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

function toError(error: unknown) {
  const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
  return { content: [{ type: 'text' as const, text: msg }], isError: true as const };
}

const CONFIG_DIR = join(homedir(), '.moneroo-mcp');
const RECURRING_FILE = join(CONFIG_DIR, 'recurring.json');
const ALERTS_FILE = join(CONFIG_DIR, 'alerts.json');

function ensureConfigDir() {
  const { mkdirSync } = require('node:fs');
  mkdirSync(CONFIG_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, data: unknown) {
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ---------------------------------------------------------------------------

export function registerAutomationTools(server: McpServer, moneroo: Moneroo): void {
  // -------------------------------------------------------------------------
  // create_recurring_payment
  // -------------------------------------------------------------------------
  server.registerTool(
    'create_recurring_payment',
    {
      title: 'Create recurring payment',
      description:
        'Create the first payment in a recurring series and generate a cron configuration. ' +
        'The first payment link is created immediately. ' +
        'Returns a ready-to-copy cron command that recreates the payment on schedule. ' +
        'Note: The cron must be added to the server by the user — this tool cannot register it automatically.',
      inputSchema: {
        amount: z.number().int().positive().describe('Amount per occurrence (e.g. 10000)'),
        currency: z.string().length(3).describe('ISO 4217 currency code (e.g. XOF)'),
        description: z.string().describe('Payment description (e.g. "Abonnement mensuel")'),
        return_url: z.string().url().describe('Redirect URL after payment'),
        customer_email: z.string().email().describe('Customer email'),
        customer_first_name: z.string().optional().describe('Customer first name'),
        customer_last_name: z.string().optional().describe('Customer last name'),
        interval: z
          .enum(['daily', 'weekly', 'monthly'])
          .describe('Recurrence interval'),
        methods: z.array(z.string()).optional().describe('Allowed payment methods'),
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
      interval,
      methods,
    }) => {
      try {
        // Create the first payment immediately
        const response = await moneroo.payments.initialize({
          amount,
          currency,
          description,
          return_url,
          customer: { email: customer_email, first_name: customer_first_name, last_name: customer_last_name },
          ...(methods?.length ? { methods } : {}),
        });

        const { id, checkout_url } = response.data;

        // Save recurring config
        ensureConfigDir();
        const recurring = readJson<Array<Record<string, unknown>>>(RECURRING_FILE, []);
        const config = {
          id: `rec_${Date.now()}`,
          amount,
          currency,
          description,
          return_url,
          customer_email,
          customer_first_name,
          customer_last_name,
          interval,
          methods: methods ?? [],
          created_at: new Date().toISOString(),
          first_payment_id: id,
        };
        recurring.push(config);
        writeJson(RECURRING_FILE, recurring);

        // Build cron expression
        const cronExpr =
          interval === 'daily'
            ? '0 9 * * *'
            : interval === 'weekly'
              ? '0 9 * * 1'
              : '0 9 1 * *';

        const cronCmd = `npx moneroo-mcp recurring:run ${config.id}`;

        return toText(
          JSON.stringify(
            {
              first_payment: { id, checkout_url },
              recurring_config: { id: config.id, interval, stored_at: RECURRING_FILE },
              cron: {
                expression: cronExpr,
                command: cronCmd,
                setup_instruction: `Add this to your crontab (crontab -e):\n${cronExpr} ${cronCmd}`,
                note: 'The cron re-creates the payment link on schedule. The customer receives a new checkout_url each time.',
              },
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
  // schedule_payout
  // -------------------------------------------------------------------------
  server.registerTool(
    'schedule_payout',
    {
      title: 'Schedule payout',
      description:
        'Schedule a payout for a future date. ' +
        'If the scheduled date is today or in the past, the payout is executed immediately. ' +
        'If it is in the future, the config is saved locally and a ready-to-copy `at` command is returned. ' +
        'The user must run the `at` command once on their server to schedule execution.',
      inputSchema: {
        amount: z.number().int().positive().describe('Payout amount'),
        currency: z.string().length(3).describe('ISO 4217 currency code (e.g. XOF)'),
        description: z.string().describe('Reason for the payout'),
        method: z.string().describe('Payout method shortcode (e.g. mtn_bj, wave_sn)'),
        customer_email: z.string().email().describe('Recipient email'),
        customer_first_name: z.string().describe('Recipient first name'),
        customer_last_name: z.string().describe('Recipient last name'),
        recipient_msisdn: z.string().optional().describe('Recipient phone in international format'),
        scheduled_date: z
          .string()
          .describe('ISO 8601 date when the payout should execute (e.g. 2026-04-11)'),
        scheduled_time: z
          .string()
          .optional()
          .describe('Time in HH:MM 24h format (e.g. 18:00). Defaults to 09:00.'),
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
      scheduled_date,
      scheduled_time = '09:00',
    }) => {
      try {
        const todayStr = new Date().toISOString().slice(0, 10);
        const isToday = scheduled_date <= todayStr;

        if (isToday) {
          // Execute immediately
          if (!recipient_msisdn) {
            return toError(new Error('recipient_msisdn is required for payout execution.'));
          }
          const response = await moneroo.payouts.initialize({
            amount,
            currency,
            description,
            method,
            customer: { email: customer_email, first_name: customer_first_name, last_name: customer_last_name },
            recipient: { msisdn: recipient_msisdn },
          });
          return toText(
            JSON.stringify(
              {
                status: 'executed',
                payout: { id: response.data.id, message: response.message },
              },
              null,
              2,
            ),
          );
        }

        // Save config for future
        ensureConfigDir();
        const config = {
          id: `sched_${Date.now()}`,
          amount,
          currency,
          description,
          method,
          customer_email,
          customer_first_name,
          customer_last_name,
          recipient_msisdn,
          scheduled_date,
          scheduled_time,
          created_at: new Date().toISOString(),
        };

        const stored = readJson<Array<Record<string, unknown>>>(join(CONFIG_DIR, 'scheduled_payouts.json'), []);
        stored.push(config);
        writeJson(join(CONFIG_DIR, 'scheduled_payouts.json'), stored);

        // `at` command (Linux/Mac)
        const atCmd = `echo "npx moneroo-mcp payout:run ${config.id}" | at ${scheduled_time} ${scheduled_date}`;

        return toText(
          JSON.stringify(
            {
              status: 'scheduled',
              scheduled_for: `${scheduled_date} ${scheduled_time}`,
              config_id: config.id,
              config_file: join(CONFIG_DIR, 'scheduled_payouts.json'),
              execution: {
                at_command: atCmd,
                setup_instruction: `Run this once on your server to schedule:\n${atCmd}`,
                note: 'Requires the `at` daemon to be running on your server.',
              },
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
  // create_payment_reminder
  // -------------------------------------------------------------------------
  server.registerTool(
    'create_payment_reminder',
    {
      title: 'Create payment reminder',
      description:
        'Generate a payment link and a pre-written reminder message (email, WhatsApp, or SMS). ' +
        'Creates the payment via the Moneroo API and returns the checkout URL + a formatted message ready to send.',
      inputSchema: {
        amount: z.number().int().positive().describe('Amount to request'),
        currency: z.string().length(3).describe('ISO 4217 currency code (e.g. XOF)'),
        description: z.string().describe('What the payment is for'),
        return_url: z.string().url().describe('Redirect URL after payment'),
        customer_email: z.string().email().describe('Customer email'),
        customer_first_name: z.string().optional().describe('Customer first name'),
        customer_last_name: z.string().optional().describe('Customer last name'),
        channel: z
          .enum(['email', 'whatsapp', 'sms'])
          .optional()
          .describe('Message channel to format for (default: email)'),
        sender_name: z
          .string()
          .optional()
          .describe('Your name or company name to include in the message'),
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
      channel = 'email',
      sender_name = 'Notre équipe',
    }) => {
      try {
        const response = await moneroo.payments.initialize({
          amount,
          currency,
          description,
          return_url,
          customer: { email: customer_email, first_name: customer_first_name, last_name: customer_last_name },
        });

        const { id, checkout_url } = response.data;
        const customerName = [customer_first_name, customer_last_name].filter(Boolean).join(' ') || 'client';
        const amountFormatted = `${amount.toLocaleString('fr-FR')} ${currency}`;

        const messages: Record<string, string> = {
          email: `Objet : Rappel de paiement — ${description}\n\nBonjour ${customerName},\n\nNous vous rappelons qu'un paiement de ${amountFormatted} est en attente pour : ${description}.\n\nCliquez sur le lien ci-dessous pour régler votre paiement :\n${checkout_url}\n\nCe lien est sécurisé. Si vous avez des questions, n'hésitez pas à nous contacter.\n\nCordialement,\n${sender_name}`,
          whatsapp: `Bonjour ${customerName} 👋\n\nUn rappel pour votre paiement de *${amountFormatted}*\nMobif : _${description}_\n\n💳 Payez ici : ${checkout_url}\n\n_${sender_name}_`,
          sms: `Rappel: Paiement ${amountFormatted} en attente (${description}). Payez ici: ${checkout_url} - ${sender_name}`,
        };

        return toText(
          JSON.stringify(
            {
              payment: { id, checkout_url },
              reminder: {
                channel,
                to: customer_email,
                message: messages[channel],
              },
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
  // setup_webhook_alert
  // -------------------------------------------------------------------------
  server.registerTool(
    'setup_webhook_alert',
    {
      title: 'Setup webhook alert rule',
      description:
        'Save an alert rule locally. When list_payments or get_payment is called, ' +
        'matching transactions will be flagged. ' +
        'Rules are stored in ~/.moneroo-mcp/alerts.json. ' +
        'Use list_webhook_alerts to see active rules.',
      inputSchema: {
        name: z.string().describe('Descriptive name for this alert rule (e.g. "Large payments")'),
        condition: z
          .enum(['amount_gt', 'amount_lt', 'status_is', 'method_is'])
          .describe('Alert condition type'),
        value: z
          .union([z.string(), z.number()])
          .describe(
            'Condition value: a number for amount conditions (e.g. 100000), ' +
            'a status string for status_is (e.g. "failed"), ' +
            'a method shortcode for method_is (e.g. "mtn_bj")',
          ),
        notify_message: z
          .string()
          .optional()
          .describe('Custom message to show when alert triggers (optional)'),
      },
    },
    async ({ name, condition, value, notify_message }) => {
      try {
        ensureConfigDir();
        const alerts = readJson<Array<Record<string, unknown>>>(ALERTS_FILE, []);
        const rule = {
          id: `alert_${Date.now()}`,
          name,
          condition,
          value,
          notify_message: notify_message ?? `Alert: ${name}`,
          created_at: new Date().toISOString(),
          active: true,
        };
        alerts.push(rule);
        writeJson(ALERTS_FILE, alerts);

        const conditionDesc: Record<string, string> = {
          amount_gt: `amount > ${value}`,
          amount_lt: `amount < ${value}`,
          status_is: `status = ${value}`,
          method_is: `method = ${value}`,
        };

        return toText(
          JSON.stringify(
            {
              alert: rule,
              condition_description: conditionDesc[condition],
              storage: ALERTS_FILE,
              note: 'Alert rules are checked passively when you call list_payments or get_payment. Matching transactions will be flagged in the response.',
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
  // list_webhook_alerts
  // -------------------------------------------------------------------------
  server.registerTool(
    'list_webhook_alerts',
    {
      title: 'List webhook alert rules',
      description: 'List all saved alert rules from ~/.moneroo-mcp/alerts.json.',
      inputSchema: {},
    },
    async () => {
      try {
        const alerts = readJson<Array<Record<string, unknown>>>(ALERTS_FILE, []);
        return toText(
          JSON.stringify(
            {
              total: alerts.length,
              alerts,
              storage: ALERTS_FILE,
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
}

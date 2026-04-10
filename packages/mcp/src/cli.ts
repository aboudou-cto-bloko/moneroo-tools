#!/usr/bin/env node

import { Command } from 'commander';
import { Moneroo } from 'moneroo';

const secretKey = process.env.MONEROO_SECRET_KEY;

if (!secretKey) {
  console.error(
    'Error: MONEROO_SECRET_KEY environment variable is required.\n' +
      'Get your secret key from https://app.moneroo.io/ → Developers → API Keys',
  );
  process.exit(1);
}

const moneroo = new Moneroo({ secretKey });
const program = new Command();

program
  .name('moneroo')
  .description('Moneroo CLI - Manage payments and payouts from the command line')
  .version('1.0.0');

function output(data: unknown, json: boolean = false) {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
}

// ---------------------------------------------------------------------------
// PAYMENTS
// ---------------------------------------------------------------------------

const payments = program.command('payments').description('Manage payments');

payments
  .command('get <id>')
  .description('Get payment details')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    try {
      const response = await moneroo.payments.retrieve(id);
      output(response.data, options.json);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

payments
  .command('verify <id>')
  .description('Verify payment status (authoritative)')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    try {
      const response = await moneroo.payments.verify(id);
      output(response.data, options.json);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

payments
  .command('create')
  .description('Create a payment link')
  .requiredOption('--amount <n>', 'Amount (in smallest currency unit)', parseInt)
  .requiredOption('--currency <code>', 'Currency code (e.g. XOF, USD)')
  .requiredOption('--description <text>', 'Payment description')
  .requiredOption('--return-url <url>', 'Return URL after payment')
  .requiredOption('--email <email>', 'Customer email')
  .option('--first-name <name>', 'Customer first name')
  .option('--last-name <name>', 'Customer last name')
  .option('--methods <codes...>', 'Payment methods (e.g. mtn_bj wave_sn)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      const response = await moneroo.payments.initialize({
        amount: options.amount,
        currency: options.currency,
        description: options.description,
        return_url: options.returnUrl,
        customer: {
          email: options.email,
          first_name: options.firstName || '',
          last_name: options.lastName || '',
        },
        ...(options.methods?.length ? { methods: options.methods } : {}),
      });
      output({ id: response.data.id, checkout_url: response.data.checkout_url }, options.json);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ---------------------------------------------------------------------------
// PAYOUTS
// ---------------------------------------------------------------------------

const payouts = program.command('payouts').description('Manage payouts');

payouts
  .command('get <id>')
  .description('Get payout details')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    try {
      const response = await moneroo.payouts.retrieve(id);
      output(response.data, options.json);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

payouts
  .command('verify <id>')
  .description('Verify payout status (authoritative)')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    try {
      const response = await moneroo.payouts.verify(id);
      output(response.data, options.json);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

payouts
  .command('create')
  .description('Create a payout')
  .requiredOption('--amount <n>', 'Amount (in smallest currency unit)', parseInt)
  .requiredOption('--currency <code>', 'Currency code (e.g. XOF)')
  .requiredOption('--description <text>', 'Payout description')
  .requiredOption('--method <code>', 'Payout method (e.g. mtn_bj, wave_sn, moneroo_payout_demo)')
  .requiredOption('--email <email>', 'Recipient email')
  .requiredOption('--first-name <name>', 'Recipient first name')
  .requiredOption('--last-name <name>', 'Recipient last name')
  .option('--phone <number>', 'Recipient phone (international format)')
  .option('--account <number>', 'Account number (for moneroo_payout_demo)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    try {
      if (!options.phone && !options.account) {
        console.error('Error: --phone or --account is required');
        process.exit(1);
      }

      const recipient: Record<string, string> = {};
      if (options.phone) recipient.msisdn = options.phone;
      else if (options.account) recipient.account_number = options.account;

      const response = await moneroo.payouts.initialize({
        amount: options.amount,
        currency: options.currency,
        description: options.description,
        method: options.method,
        customer: {
          email: options.email,
          first_name: options.firstName,
          last_name: options.lastName,
        },
        recipient,
      });
      output({ id: response.data.id, message: response.message }, options.json);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// ---------------------------------------------------------------------------
// RUN
// ---------------------------------------------------------------------------

program.parse();

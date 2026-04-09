import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Moneroo } from 'moneroo';
import { z } from 'zod';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import * as XLSX from 'xlsx';
import { fetchAll } from '../helpers/fetch-all.js';
import { daysAgo, today } from '../helpers/dates.js';

function toText(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

function toError(error: unknown) {
  const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
  return { content: [{ type: 'text' as const, text: msg }], isError: true as const };
}

const EXPORT_DIR = join(homedir(), '.moneroo-mcp', 'exports');

function ensureExportDir() {
  mkdirSync(EXPORT_DIR, { recursive: true });
}

type Payment = {
  id: string;
  status: string;
  amount: number;
  amount_formatted?: string;
  currency: { code: string; symbol?: string } | string;
  description: string;
  initiated_at: string;
  processed_at?: string | null;
  environment?: string;
  customer?: {
    email?: string;
    first_name?: string;
    last_name?: string;
    phone?: string | null;
    country?: string | null;
  };
  capture?: {
    method?: { short_code?: string; name?: string };
    gateway?: { name?: string; transaction_id?: string | null };
    failure_message?: string | null;
    metadata?: { commission?: number | null; fees?: number | null };
  };
  metadata?: Record<string, unknown>;
};

type Payout = {
  id: string;
  status: string;
  amount: number;
  amount_formatted?: string;
  currency: { code: string } | string;
  description: string;
  success_at?: string | null;
  failed_at?: string | null;
  pending_at?: string | null;
  customer?: { email?: string; first_name?: string; last_name?: string };
  disburse?: { method?: { short_code?: string; name?: string } };
};

function currencyCode(p: Payment | Payout): string {
  return typeof p.currency === 'object' ? p.currency.code : p.currency;
}

async function fetchPaymentsInRange(moneroo: Moneroo, from_date: string, to_date: string): Promise<Payment[]> {
  return fetchAll<Payment>(
    async (page, limit) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit), from_date, to_date });
      return moneroo._get<Payment[]>(`payments?${qs.toString()}`).then((r: { data: Payment[] }) => ({ data: r.data }));
    },
    { maxPages: 10 },
  );
}

async function fetchPayoutsInRange(moneroo: Moneroo, from_date: string, to_date: string): Promise<Payout[]> {
  return fetchAll<Payout>(
    async (page, limit) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit), from_date, to_date });
      return moneroo._get<Payout[]>(`payouts?${qs.toString()}`).then((r: { data: Payout[] }) => ({ data: r.data }));
    },
    { maxPages: 10 },
  );
}

// ---------------------------------------------------------------------------

export function registerExportTools(server: McpServer, moneroo: Moneroo): void {
  // -------------------------------------------------------------------------
  // export_transactions
  // -------------------------------------------------------------------------
  server.registerTool(
    'export_transactions',
    {
      title: 'Export transactions',
      description:
        'Export payment and/or payout transactions to a CSV or Excel (.xlsx) file. ' +
        'The file is saved to ~/.moneroo-mcp/exports/ and the path is returned.',
      inputSchema: {
        from_date: z.string().optional().describe('Start date — ISO 8601. Defaults to 30 days ago.'),
        to_date: z.string().optional().describe('End date — ISO 8601. Defaults to today.'),
        format: z
          .enum(['csv', 'xlsx'])
          .optional()
          .describe('Export format: csv (default) or xlsx'),
        include: z
          .enum(['payments', 'payouts', 'both'])
          .optional()
          .describe('What to export: payments (default), payouts, or both'),
        status: z
          .enum(['all', 'success', 'failed', 'pending', 'cancelled'])
          .optional()
          .describe('Filter by status (default: all)'),
      },
    },
    async ({ from_date, to_date, format = 'csv', include = 'payments', status = 'all' }) => {
      try {
        const from = from_date ?? daysAgo(30);
        const to = to_date ?? today();
        ensureExportDir();

        const rows: Record<string, string | number>[] = [];

        if (include === 'payments' || include === 'both') {
          const payments = await fetchPaymentsInRange(moneroo, from, to);
          for (const p of payments) {
            if (status !== 'all' && p.status !== status) continue;
            rows.push({
              type: 'payment',
              id: p.id,
              date: p.initiated_at,
              status: p.status,
              amount: p.amount,
              currency: currencyCode(p),
              description: p.description,
              customer_email: p.customer?.email ?? '',
              customer_name: [p.customer?.first_name, p.customer?.last_name].filter(Boolean).join(' '),
              method: p.capture?.method?.short_code ?? p.capture?.method?.name ?? '',
              gateway: p.capture?.gateway?.name ?? '',
              gateway_tx_id: p.capture?.gateway?.transaction_id ?? '',
              commission: p.capture?.metadata?.commission ?? '',
              fees: p.capture?.metadata?.fees ?? '',
              failure_reason: p.capture?.failure_message ?? '',
            });
          }
        }

        if (include === 'payouts' || include === 'both') {
          const payouts = await fetchPayoutsInRange(moneroo, from, to);
          for (const p of payouts) {
            if (status !== 'all' && p.status !== status) continue;
            rows.push({
              type: 'payout',
              id: p.id,
              date: p.success_at ?? p.pending_at ?? p.failed_at ?? '',
              status: p.status,
              amount: p.amount,
              currency: currencyCode(p),
              description: p.description,
              customer_email: p.customer?.email ?? '',
              customer_name: [p.customer?.first_name, p.customer?.last_name].filter(Boolean).join(' '),
              method: p.disburse?.method?.short_code ?? p.disburse?.method?.name ?? '',
              gateway: '',
              gateway_tx_id: '',
              commission: '',
              fees: '',
              failure_reason: '',
            });
          }
        }

        const timestamp = new Date().toISOString().slice(0, 10);
        const filename = `transactions_${from}_${to}.${format}`;
        const filepath = join(EXPORT_DIR, filename);

        if (format === 'csv') {
          const headers = Object.keys(rows[0] ?? {});
          const csv = [
            headers.join(','),
            ...rows.map((r) =>
              headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','),
            ),
          ].join('\n');
          writeFileSync(filepath, csv, 'utf8');
        } else {
          const ws = XLSX.utils.json_to_sheet(rows);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
          XLSX.writeFile(wb, filepath);
        }

        return toText(
          JSON.stringify(
            {
              status: 'exported',
              file: filepath,
              rows: rows.length,
              period: { from, to },
              format,
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
  // generate_invoice
  // -------------------------------------------------------------------------
  server.registerTool(
    'generate_invoice',
    {
      title: 'Generate invoice',
      description:
        'Generate a professional HTML invoice for a payment. ' +
        'Fetches payment details from the API and produces a printable invoice saved to ~/.moneroo-mcp/exports/. ' +
        'The HTML file can be opened in a browser and printed to PDF.',
      inputSchema: {
        payment_id: z.string().describe('Payment ID (e.g. k4su1ii7abdz)'),
        invoice_number: z.string().optional().describe('Custom invoice number (auto-generated if omitted)'),
        seller_name: z.string().optional().describe('Your business name shown on the invoice'),
        seller_address: z.string().optional().describe('Your business address'),
        seller_email: z.string().optional().describe('Your business email'),
        notes: z.string().optional().describe('Additional notes at the bottom of the invoice'),
      },
    },
    async ({ payment_id, invoice_number, seller_name, seller_address, seller_email, notes }) => {
      try {
        const response = await moneroo.payments.retrieve(payment_id);
        const p = response.data as Payment;

        if (p.status !== 'success') {
          return toText(
            JSON.stringify(
              {
                warning: `Payment status is "${p.status}", not "success". Generating invoice anyway.`,
              },
              null,
              2,
            ),
          );
        }

        ensureExportDir();

        const invNumber = invoice_number ?? `INV-${payment_id.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
        const date = new Date(p.initiated_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
        const currency = currencyCode(p);
        const customerName = [p.customer?.first_name, p.customer?.last_name].filter(Boolean).join(' ') || p.customer?.email || 'Client';

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Facture ${invNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; background: #fff; }
  .page { max-width: 800px; margin: 40px auto; padding: 48px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; border-bottom: 2px solid #6c63ff; padding-bottom: 24px; }
  .brand { font-size: 28px; font-weight: 800; color: #6c63ff; letter-spacing: -0.5px; }
  .brand span { color: #1a1a2e; }
  .invoice-meta { text-align: right; }
  .invoice-meta h2 { font-size: 20px; font-weight: 700; color: #6c63ff; text-transform: uppercase; letter-spacing: 1px; }
  .invoice-meta p { color: #666; font-size: 13px; margin-top: 4px; }
  .parties { display: flex; gap: 48px; margin-bottom: 40px; }
  .party { flex: 1; }
  .party-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: 600; margin-bottom: 8px; }
  .party h3 { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
  .party p { font-size: 13px; color: #555; line-height: 1.6; }
  .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; background: #d4edda; color: #155724; margin-top: 8px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
  thead th { background: #f8f7ff; padding: 12px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: 600; }
  thead th:last-child { text-align: right; }
  tbody td { padding: 16px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
  tbody td:last-child { text-align: right; font-weight: 600; }
  .totals { display: flex; justify-content: flex-end; }
  .totals-box { width: 280px; }
  .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #555; border-bottom: 1px solid #f0f0f0; }
  .total-final { display: flex; justify-content: space-between; padding: 12px 0; font-size: 18px; font-weight: 800; color: #1a1a2e; }
  .payment-info { margin-top: 40px; padding: 20px; background: #f8f7ff; border-radius: 8px; border-left: 4px solid #6c63ff; }
  .payment-info h4 { font-size: 13px; font-weight: 700; color: #6c63ff; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
  .payment-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .pi-item { font-size: 13px; color: #555; }
  .pi-item strong { color: #1a1a2e; display: block; font-size: 12px; color: #999; font-weight: 500; margin-bottom: 2px; }
  .notes { margin-top: 24px; font-size: 13px; color: #666; line-height: 1.6; padding: 16px; border: 1px solid #e0e0e0; border-radius: 6px; }
  .footer { margin-top: 48px; text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #f0f0f0; padding-top: 16px; }
  @media print { body { print-color-adjust: exact; } .page { margin: 0; padding: 32px; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div class="brand">${seller_name ? seller_name.replace(/</g, '&lt;') : 'Mon<span>entreprise</span>'}</div>
      ${seller_address ? `<p style="font-size:13px;color:#666;margin-top:6px;">${seller_address.replace(/</g, '&lt;')}</p>` : ''}
      ${seller_email ? `<p style="font-size:13px;color:#666;">${seller_email.replace(/</g, '&lt;')}</p>` : ''}
    </div>
    <div class="invoice-meta">
      <h2>Facture</h2>
      <p><strong>${invNumber}</strong></p>
      <p>Date : ${date}</p>
    </div>
  </div>

  <div class="parties">
    <div class="party">
      <div class="party-label">Facturé par</div>
      <h3>${seller_name?.replace(/</g, '&lt;') ?? 'Votre entreprise'}</h3>
      ${seller_email ? `<p>${seller_email.replace(/</g, '&lt;')}</p>` : ''}
      ${seller_address ? `<p>${seller_address.replace(/</g, '&lt;')}</p>` : ''}
    </div>
    <div class="party">
      <div class="party-label">Facturé à</div>
      <h3>${customerName.replace(/</g, '&lt;')}</h3>
      <p>${p.customer?.email?.replace(/</g, '&lt;') ?? ''}</p>
      ${p.customer?.country ? `<p>${p.customer.country}</p>` : ''}
      <span class="status-badge">Payé</span>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantité</th>
        <th>Montant</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${p.description.replace(/</g, '&lt;')}</td>
        <td>1</td>
        <td>${p.amount.toLocaleString('fr-FR')} ${currency}</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-box">
      <div class="total-final">
        <span>Total</span>
        <span>${p.amount.toLocaleString('fr-FR')} ${currency}</span>
      </div>
    </div>
  </div>

  <div class="payment-info">
    <h4>Informations de paiement</h4>
    <div class="payment-info-grid">
      <div class="pi-item"><strong>Référence transaction</strong>${p.id}</div>
      <div class="pi-item"><strong>Méthode</strong>${p.capture?.method?.name ?? p.capture?.method?.short_code ?? 'N/A'}</div>
      <div class="pi-item"><strong>Statut</strong>Payé ✓</div>
      <div class="pi-item"><strong>Date</strong>${date}</div>
      ${p.capture?.gateway?.transaction_id ? `<div class="pi-item"><strong>ID Gateway</strong>${p.capture.gateway.transaction_id}</div>` : ''}
    </div>
  </div>

  ${notes ? `<div class="notes"><strong>Notes :</strong> ${notes.replace(/</g, '&lt;')}</div>` : ''}

  <div class="footer">
    Document généré via Moneroo · ${new Date().toLocaleDateString('fr-FR')}
  </div>
</div>
</body>
</html>`;

        const filename = `invoice_${invNumber}_${payment_id}.html`;
        const filepath = join(EXPORT_DIR, filename);
        writeFileSync(filepath, html, 'utf8');

        return toText(
          JSON.stringify(
            {
              invoice_number: invNumber,
              payment_id,
              customer: customerName,
              amount: `${p.amount.toLocaleString('fr-FR')} ${currency}`,
              file: filepath,
              open_hint: `Open in browser and print to PDF: file://${filepath}`,
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
  // generate_report_pdf
  // -------------------------------------------------------------------------
  server.registerTool(
    'generate_report_pdf',
    {
      title: 'Generate monthly report (HTML/PDF)',
      description:
        'Generate a comprehensive monthly activity report as an HTML file (printable to PDF). ' +
        'Includes revenue summary, payment breakdown by method, failure analysis, and daily chart data. ' +
        'Saved to ~/.moneroo-mcp/exports/.',
      inputSchema: {
        year: z.number().int().optional().describe('Year (e.g. 2026). Defaults to current year.'),
        month: z.number().int().min(1).max(12).optional().describe('Month 1–12. Defaults to last month.'),
        company_name: z.string().optional().describe('Your company name to show in the report header'),
      },
    },
    async ({ year, month, company_name }) => {
      try {
        const now = new Date();
        const targetYear = year ?? (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
        const targetMonth = month ?? (now.getMonth() === 0 ? 12 : now.getMonth());

        const from = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(targetYear, targetMonth, 0).getDate();
        const to = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${lastDay}`;

        const monthName = new Date(targetYear, targetMonth - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

        const [payments, payouts] = await Promise.all([
          fetchPaymentsInRange(moneroo, from, to),
          fetchPayoutsInRange(moneroo, from, to),
        ]);

        // Compute metrics
        const success = payments.filter((p) => p.status === 'success');
        const failed = payments.filter((p) => p.status === 'failed');
        const revenue = success.reduce((s, p) => s + p.amount, 0);
        const convRate = payments.length > 0 ? (success.length / payments.length * 100).toFixed(1) : '0';
        const avgTicket = success.length > 0 ? Math.round(revenue / success.length) : 0;
        const currency = success[0] ? currencyCode(success[0]) : 'XOF';

        // Daily revenue for chart
        const dailyRevenue: Record<string, number> = {};
        for (const p of success) {
          const day = p.initiated_at.slice(0, 10);
          dailyRevenue[day] = (dailyRevenue[day] ?? 0) + p.amount;
        }

        // Method breakdown
        const byMethod: Record<string, { name: string; count: number; total: number }> = {};
        for (const p of success) {
          const code = p.capture?.method?.short_code ?? 'other';
          const name = p.capture?.method?.name ?? code;
          if (!byMethod[code]) byMethod[code] = { name, count: 0, total: 0 };
          byMethod[code].count++;
          byMethod[code].total += p.amount;
        }
        const methodRows = Object.entries(byMethod)
          .sort(([, a], [, b]) => b.total - a.total)
          .map(([, v]) => `<tr><td>${v.name}</td><td>${v.count}</td><td>${v.total.toLocaleString('fr-FR')} ${currency}</td><td>${revenue > 0 ? (v.total / revenue * 100).toFixed(1) : 0}%</td></tr>`)
          .join('');

        // Top failures
        const failReasons: Record<string, number> = {};
        for (const p of failed) failReasons[p.capture?.failure_message ?? 'Inconnu'] = (failReasons[p.capture?.failure_message ?? 'Inconnu'] ?? 0) + 1;
        const failRows = Object.entries(failReasons)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([r, c]) => `<tr><td>${r.replace(/</g, '&lt;')}</td><td>${c}</td><td>${payments.length > 0 ? (c / payments.length * 100).toFixed(1) : 0}%</td></tr>`)
          .join('');

        // Payouts summary
        const payoutSuccess = payouts.filter((p) => p.status === 'success');
        const payoutTotal = payoutSuccess.reduce((s, p) => s + p.amount, 0);

        // Daily chart data as sparkline bars
        const days = Array.from({ length: lastDay }, (_, i) => {
          const d = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`;
          return dailyRevenue[d] ?? 0;
        });
        const maxDay = Math.max(...days, 1);
        const bars = days.map((v, i) => {
          const h = Math.max(2, Math.round((v / maxDay) * 80));
          return `<div title="Jour ${i + 1}: ${v.toLocaleString('fr-FR')} ${currency}" style="display:inline-block;width:${Math.floor(560 / lastDay) - 2}px;height:${h}px;background:#6c63ff;border-radius:2px 2px 0 0;vertical-align:bottom;margin:0 1px;opacity:${v > 0 ? 0.85 : 0.15}"></div>`;
        }).join('');

        ensureExportDir();

        const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Rapport ${monthName}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Helvetica Neue',Arial,sans-serif; color:#1a1a2e; background:#f8f7ff; }
  .page { max-width:860px; margin:32px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.08); }
  .header { background:linear-gradient(135deg,#6c63ff,#5a52d5); color:#fff; padding:40px 48px; }
  .header h1 { font-size:28px; font-weight:800; }
  .header p { opacity:0.8; margin-top:6px; font-size:14px; }
  .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:0; border-bottom:1px solid #f0f0f0; }
  .kpi { padding:28px 24px; border-right:1px solid #f0f0f0; }
  .kpi:last-child { border-right:none; }
  .kpi-label { font-size:11px; text-transform:uppercase; letter-spacing:1px; color:#999; font-weight:600; margin-bottom:8px; }
  .kpi-value { font-size:26px; font-weight:800; color:#1a1a2e; }
  .kpi-sub { font-size:12px; color:#aaa; margin-top:4px; }
  .section { padding:32px 48px; border-bottom:1px solid #f0f0f0; }
  .section h2 { font-size:16px; font-weight:700; color:#1a1a2e; margin-bottom:20px; display:flex; align-items:center; gap:8px; }
  .chart { height:96px; display:flex; align-items:flex-end; gap:0; padding:8px 0; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { text-align:left; padding:10px 12px; background:#f8f7ff; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; color:#888; font-weight:600; }
  td { padding:12px; border-bottom:1px solid #f8f7ff; }
  tr:last-child td { border-bottom:none; }
  .badge { display:inline-block; padding:3px 10px; border-radius:12px; font-size:11px; font-weight:600; }
  .badge-green { background:#d4edda; color:#155724; }
  .badge-red { background:#f8d7da; color:#721c24; }
  .footer { padding:24px 48px; text-align:center; font-size:12px; color:#aaa; }
  @media print { body{background:#fff;} .page{box-shadow:none;border-radius:0;margin:0;} }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>${company_name?.replace(/</g, '&lt;') ?? 'Rapport mensuel'}</h1>
    <p>${monthName.charAt(0).toUpperCase() + monthName.slice(1)} · Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>

  <div class="kpis">
    <div class="kpi">
      <div class="kpi-label">Revenus</div>
      <div class="kpi-value">${revenue.toLocaleString('fr-FR')}</div>
      <div class="kpi-sub">${currency}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Transactions</div>
      <div class="kpi-value">${payments.length}</div>
      <div class="kpi-sub">${success.length} réussies</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Conversion</div>
      <div class="kpi-value">${convRate}%</div>
      <div class="kpi-sub">${failed.length} échouées</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Panier moyen</div>
      <div class="kpi-value">${avgTicket.toLocaleString('fr-FR')}</div>
      <div class="kpi-sub">${currency}</div>
    </div>
  </div>

  <div class="section">
    <h2>📈 Revenus journaliers</h2>
    <div class="chart">${bars}</div>
  </div>

  ${methodRows ? `<div class="section">
    <h2>💳 Répartition par méthode de paiement</h2>
    <table>
      <thead><tr><th>Méthode</th><th>Transactions</th><th>Volume</th><th>Part</th></tr></thead>
      <tbody>${methodRows}</tbody>
    </table>
  </div>` : ''}

  ${failRows ? `<div class="section">
    <h2>⚠️ Principales raisons d'échec</h2>
    <table>
      <thead><tr><th>Raison</th><th>Occurrences</th><th>% du total</th></tr></thead>
      <tbody>${failRows}</tbody>
    </table>
  </div>` : ''}

  <div class="section">
    <h2>🏦 Payouts</h2>
    <table>
      <thead><tr><th>Métrique</th><th>Valeur</th></tr></thead>
      <tbody>
        <tr><td>Total payouts</td><td>${payouts.length}</td></tr>
        <tr><td>Payouts réussis</td><td>${payoutSuccess.length}</td></tr>
        <tr><td>Montant total décaissé</td><td>${payoutTotal.toLocaleString('fr-FR')} ${currency}</td></tr>
      </tbody>
    </table>
  </div>

  <div class="footer">Rapport généré via Moneroo MCP · moneroo.io</div>
</div>
</body>
</html>`;

        const filename = `report_${targetYear}_${String(targetMonth).padStart(2, '0')}.html`;
        const filepath = join(EXPORT_DIR, filename);
        writeFileSync(filepath, html, 'utf8');

        return toText(
          JSON.stringify(
            {
              period: { year: targetYear, month: targetMonth, label: monthName },
              summary: { revenue, currency, transactions: payments.length, conversion_pct: convRate, avg_ticket: avgTicket },
              file: filepath,
              open_hint: `Open in browser and print to PDF: file://${filepath}`,
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
  // export_for_accounting
  // -------------------------------------------------------------------------
  server.registerTool(
    'export_for_accounting',
    {
      title: 'Export for accounting',
      description:
        'Export successful transactions in a standardized accounting format. ' +
        'Generates a CSV with debit/credit columns, account codes, and journal entries ' +
        'compatible with most accounting software (Sage, QuickBooks, Wave, etc.).',
      inputSchema: {
        from_date: z.string().optional().describe('Start date — ISO 8601. Defaults to 30 days ago.'),
        to_date: z.string().optional().describe('End date — ISO 8601. Defaults to today.'),
        format: z
          .enum(['generic', 'sage', 'fec'])
          .optional()
          .describe(
            'Accounting format: generic (default), sage (Sage 50/100 compatible), fec (FEC — format obligatoire France)',
          ),
        include_payouts: z
          .boolean()
          .optional()
          .describe('Include payout disbursements as expenses (default: true)'),
        revenue_account: z
          .string()
          .optional()
          .describe('Revenue GL account code (default: 706000)'),
        cash_account: z
          .string()
          .optional()
          .describe('Cash/bank GL account code (default: 512000)'),
      },
    },
    async ({
      from_date,
      to_date,
      format = 'generic',
      include_payouts = true,
      revenue_account = '706000',
      cash_account = '512000',
    }) => {
      try {
        const from = from_date ?? daysAgo(30);
        const to = to_date ?? today();
        ensureExportDir();

        const [payments, payouts] = await Promise.all([
          fetchPaymentsInRange(moneroo, from, to),
          include_payouts ? fetchPayoutsInRange(moneroo, from, to) : Promise.resolve([]),
        ]);

        const successPayments = payments.filter((p) => p.status === 'success');
        const successPayouts = payouts.filter((p) => p.status === 'success');

        type JournalRow = Record<string, string | number>;
        const rows: JournalRow[] = [];

        if (format === 'fec') {
          // French FEC format
          const headers = ['JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate', 'CompteNum', 'CompteLib', 'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit', 'EcritureLet', 'DateLet', 'ValidDate', 'Montantdevise', 'Idevise'];
          let ecritureNum = 1;

          for (const p of successPayments) {
            const date = p.initiated_at.slice(0, 10).replace(/-/g, '');
            const amount = (p.amount / 100).toFixed(2); // assuming minor units, adjust if needed
            // Debit line (cash)
            rows.push({ JournalCode: 'VT', JournalLib: 'Ventes', EcritureNum: String(ecritureNum).padStart(6, '0'), EcritureDate: date, CompteNum: cash_account, CompteLib: 'Caisse Moneroo', PieceRef: p.id, PieceDate: date, EcritureLib: p.description.slice(0, 50), Debit: amount, Credit: '0.00', EcritureLet: '', DateLet: '', ValidDate: date, Montantdevise: amount, Idevise: currencyCode(p) });
            // Credit line (revenue)
            rows.push({ JournalCode: 'VT', JournalLib: 'Ventes', EcritureNum: String(ecritureNum).padStart(6, '0'), EcritureDate: date, CompteNum: revenue_account, CompteLib: 'Produits Moneroo', PieceRef: p.id, PieceDate: date, EcritureLib: p.description.slice(0, 50), Debit: '0.00', Credit: amount, EcritureLet: '', DateLet: '', ValidDate: date, Montantdevise: amount, Idevise: currencyCode(p) });
            ecritureNum++;
          }

          const csv = [
            headers.join('|'),
            ...rows.map((r) => headers.map((h) => String(r[h] ?? '')).join('|')),
          ].join('\n');

          const filename = `fec_${from}_${to}.csv`;
          const filepath = join(EXPORT_DIR, filename);
          writeFileSync(filepath, csv, 'utf8');

          return toText(JSON.stringify({ format: 'FEC', file: filepath, entries: rows.length, period: { from, to } }, null, 2));
        }

        // Generic / Sage format
        const genericHeaders = [
          'date', 'reference', 'description', 'customer_email', 'customer_name',
          'debit_account', 'credit_account', 'amount', 'currency',
          'method', 'transaction_type', 'status',
        ];

        for (const p of successPayments) {
          rows.push({
            date: p.initiated_at.slice(0, 10),
            reference: p.id,
            description: p.description,
            customer_email: p.customer?.email ?? '',
            customer_name: [p.customer?.first_name, p.customer?.last_name].filter(Boolean).join(' '),
            debit_account: cash_account,
            credit_account: revenue_account,
            amount: p.amount,
            currency: currencyCode(p),
            method: p.capture?.method?.short_code ?? '',
            transaction_type: 'payment',
            status: p.status,
          });
        }

        for (const p of successPayouts) {
          rows.push({
            date: (p.success_at ?? p.pending_at ?? '').slice(0, 10),
            reference: p.id,
            description: p.description,
            customer_email: p.customer?.email ?? '',
            customer_name: [p.customer?.first_name, p.customer?.last_name].filter(Boolean).join(' '),
            debit_account: '640000', // expense
            credit_account: cash_account,
            amount: p.amount,
            currency: currencyCode(p),
            method: p.disburse?.method?.short_code ?? '',
            transaction_type: 'payout',
            status: p.status,
          });
        }

        const csv = [
          genericHeaders.join(','),
          ...rows.map((r) =>
            genericHeaders.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(','),
          ),
        ].join('\n');

        const filename = `accounting_${format}_${from}_${to}.csv`;
        const filepath = join(EXPORT_DIR, filename);
        writeFileSync(filepath, csv, 'utf8');

        const totalRevenue = successPayments.reduce((s, p) => s + p.amount, 0);
        const totalPaid = successPayouts.reduce((s, p) => s + p.amount, 0);
        const currency = successPayments[0] ? currencyCode(successPayments[0]) : 'XOF';

        return toText(
          JSON.stringify(
            {
              format,
              file: filepath,
              period: { from, to },
              summary: {
                payments: successPayments.length,
                payouts: successPayouts.length,
                total_revenue: `${totalRevenue.toLocaleString('fr-FR')} ${currency}`,
                total_disbursed: `${totalPaid.toLocaleString('fr-FR')} ${currency}`,
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
}

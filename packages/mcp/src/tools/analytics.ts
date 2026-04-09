import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Moneroo } from 'moneroo';
import { z } from 'zod';
import { fetchAll } from '../helpers/fetch-all.js';
import { daysAgo, today, getHour, getWeekday, toDateStr } from '../helpers/dates.js';

function toText(text: string) {
  return { content: [{ type: 'text' as const, text }] };
}

function toError(error: unknown) {
  const msg = error instanceof Error ? error.message : 'An unexpected error occurred';
  return { content: [{ type: 'text' as const, text: msg }], isError: true as const };
}

type Payment = {
  id: string;
  status: string;
  amount: number;
  currency: { code: string } | string;
  initiated_at: string;
  capture?: {
    method?: { short_code?: string; name?: string };
    failure_message?: string | null;
    failure_error_type?: string | null;
  };
  customer?: { email?: string };
};

function currencyCode(p: Payment): string {
  return typeof p.currency === 'object' ? p.currency.code : p.currency;
}

async function fetchPaymentsInRange(
  moneroo: Moneroo,
  from_date: string,
  to_date: string,
): Promise<Payment[]> {
  return fetchAll<Payment>(
    async (page, limit) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit), from_date, to_date });
      return moneroo._get<Payment[]>(`payments?${qs.toString()}`).then((r: { data: Payment[] }) => ({ data: r.data }));
    },
    { maxPages: 5 },
  );
}

// ---------------------------------------------------------------------------

export function registerAnalyticsTools(server: McpServer, moneroo: Moneroo): void {
  // -------------------------------------------------------------------------
  // get_revenue_report
  // -------------------------------------------------------------------------
  server.registerTool(
    'get_revenue_report',
    {
      title: 'Revenue report',
      description:
        'Compute a revenue summary for a date range. ' +
        'Returns total amounts by status (success, failed, pending, cancelled), ' +
        'daily breakdown, and currency. ' +
        'Uses data from GET /v1/payments (up to ~500 most recent transactions in the period).',
      inputSchema: {
        from_date: z
          .string()
          .optional()
          .describe('Start date — ISO 8601 (e.g. 2026-01-01). Defaults to 30 days ago.'),
        to_date: z
          .string()
          .optional()
          .describe('End date — ISO 8601 (e.g. 2026-03-31). Defaults to today.'),
      },
    },
    async ({ from_date, to_date }) => {
      try {
        const from = from_date ?? daysAgo(30);
        const to = to_date ?? today();
        const payments = await fetchPaymentsInRange(moneroo, from, to);

        const byStatus: Record<string, { count: number; total: number }> = {};
        const byDay: Record<string, number> = {};

        for (const p of payments) {
          if (!byStatus[p.status]) byStatus[p.status] = { count: 0, total: 0 };
          byStatus[p.status].count++;
          if (p.status === 'success') byStatus[p.status].total += p.amount;

          const day = toDateStr(p.initiated_at);
          if (p.status === 'success') byDay[day] = (byDay[day] ?? 0) + p.amount;
        }

        const currency = payments.find((p) => p.status === 'success')
          ? currencyCode(payments.find((p) => p.status === 'success')!)
          : 'XOF';

        const successTotal = byStatus['success']?.total ?? 0;
        const successCount = byStatus['success']?.count ?? 0;

        return toText(
          JSON.stringify(
            {
              period: { from, to },
              currency,
              total_revenue: successTotal,
              successful_payments: successCount,
              average_ticket: successCount > 0 ? Math.round(successTotal / successCount) : 0,
              by_status: byStatus,
              daily_revenue: Object.entries(byDay)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, amount]) => ({ date, amount })),
              total_transactions: payments.length,
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
  // get_payment_methods_breakdown
  // -------------------------------------------------------------------------
  server.registerTool(
    'get_payment_methods_breakdown',
    {
      title: 'Payment methods breakdown',
      description:
        'Show the distribution of successful payments by payment method (MTN, Wave, Orange, etc.). ' +
        'Returns volume and revenue per method, sorted by revenue descending.',
      inputSchema: {
        from_date: z
          .string()
          .optional()
          .describe('Start date — ISO 8601. Defaults to 30 days ago.'),
        to_date: z.string().optional().describe('End date — ISO 8601. Defaults to today.'),
      },
    },
    async ({ from_date, to_date }) => {
      try {
        const from = from_date ?? daysAgo(30);
        const to = to_date ?? today();
        const payments = await fetchPaymentsInRange(moneroo, from, to);

        const successful = payments.filter((p) => p.status === 'success');
        const byMethod: Record<string, { count: number; total: number; name: string }> = {};

        for (const p of successful) {
          const code = p.capture?.method?.short_code ?? p.capture?.method?.name ?? 'unknown';
          const name = p.capture?.method?.name ?? code;
          if (!byMethod[code]) byMethod[code] = { count: 0, total: 0, name };
          byMethod[code].count++;
          byMethod[code].total += p.amount;
        }

        const total = successful.reduce((s, p) => s + p.amount, 0);
        const currency = successful[0] ? currencyCode(successful[0]) : 'XOF';

        const breakdown = Object.entries(byMethod)
          .map(([code, v]) => ({
            method_code: code,
            method_name: v.name,
            count: v.count,
            total: v.total,
            share_pct: total > 0 ? Math.round((v.total / total) * 1000) / 10 : 0,
          }))
          .sort((a, b) => b.total - a.total);

        return toText(
          JSON.stringify(
            {
              period: { from, to },
              currency,
              total_revenue: total,
              total_successful: successful.length,
              breakdown,
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
  // get_failure_analysis
  // -------------------------------------------------------------------------
  server.registerTool(
    'get_failure_analysis',
    {
      title: 'Failure analysis',
      description:
        'Analyze failed payments to identify the most common failure reasons. ' +
        'Groups by error type and message, returns counts and representative IDs.',
      inputSchema: {
        from_date: z
          .string()
          .optional()
          .describe('Start date — ISO 8601. Defaults to 30 days ago.'),
        to_date: z.string().optional().describe('End date — ISO 8601. Defaults to today.'),
      },
    },
    async ({ from_date, to_date }) => {
      try {
        const from = from_date ?? daysAgo(30);
        const to = to_date ?? today();

        const failed = await fetchAll<Payment>(
          async (page, limit) => {
            const qs = new URLSearchParams({
              page: String(page),
              limit: String(limit),
              from_date: from,
              to_date: to,
              status: 'failed',
            });
            return moneroo._get<Payment[]>(`payments?${qs.toString()}`).then((r: { data: Payment[] }) => ({ data: r.data }));
          },
          { maxPages: 5 },
        );

        const byReason: Record<string, { count: number; sample_ids: string[]; error_type: string | null }> = {};

        for (const p of failed) {
          const reason = p.capture?.failure_message ?? 'Unknown error';
          const etype = p.capture?.failure_error_type ?? null;
          if (!byReason[reason]) byReason[reason] = { count: 0, sample_ids: [], error_type: etype };
          byReason[reason].count++;
          if (byReason[reason].sample_ids.length < 3) byReason[reason].sample_ids.push(p.id);
        }

        const reasons = Object.entries(byReason)
          .map(([message, v]) => ({ message, ...v }))
          .sort((a, b) => b.count - a.count);

        const failureRate =
          failed.length > 0
            ? await fetchPaymentsInRange(moneroo, from, to).then((all) =>
                all.length > 0 ? Math.round((failed.length / all.length) * 1000) / 10 : 0,
              )
            : 0;

        return toText(
          JSON.stringify(
            {
              period: { from, to },
              total_failed: failed.length,
              failure_rate_pct: failureRate,
              top_failure_reasons: reasons.slice(0, 10),
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
  // get_conversion_rate
  // -------------------------------------------------------------------------
  server.registerTool(
    'get_conversion_rate',
    {
      title: 'Conversion rate',
      description:
        'Calculate the payment conversion rate for a period: ' +
        'percentage of initiated payments that reached "success" status. ' +
        'Also shows drop-off at each stage (initiated → pending → success).',
      inputSchema: {
        from_date: z
          .string()
          .optional()
          .describe('Start date — ISO 8601. Defaults to 30 days ago.'),
        to_date: z.string().optional().describe('End date — ISO 8601. Defaults to today.'),
      },
    },
    async ({ from_date, to_date }) => {
      try {
        const from = from_date ?? daysAgo(30);
        const to = to_date ?? today();
        const payments = await fetchPaymentsInRange(moneroo, from, to);

        const counts: Record<string, number> = {
          initiated: 0,
          pending: 0,
          cancelled: 0,
          failed: 0,
          success: 0,
        };
        for (const p of payments) counts[p.status] = (counts[p.status] ?? 0) + 1;

        const total = payments.length;
        const pct = (n: number) => (total > 0 ? Math.round((n / total) * 1000) / 10 : 0);

        return toText(
          JSON.stringify(
            {
              period: { from, to },
              total_payments: total,
              conversion_rate_pct: pct(counts.success),
              funnel: {
                initiated: { count: counts.initiated, pct: pct(counts.initiated) },
                pending: { count: counts.pending, pct: pct(counts.pending) },
                success: { count: counts.success, pct: pct(counts.success) },
                failed: { count: counts.failed, pct: pct(counts.failed) },
                cancelled: { count: counts.cancelled, pct: pct(counts.cancelled) },
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
  // compare_periods
  // -------------------------------------------------------------------------
  server.registerTool(
    'compare_periods',
    {
      title: 'Compare two periods',
      description:
        'Compare revenue, volume, and conversion rate between two date ranges. ' +
        'Returns absolute and percentage change for each metric.',
      inputSchema: {
        period_a_from: z.string().describe('Period A start date — ISO 8601 (e.g. 2026-01-01)'),
        period_a_to: z.string().describe('Period A end date — ISO 8601 (e.g. 2026-01-31)'),
        period_b_from: z.string().describe('Period B start date — ISO 8601 (e.g. 2026-02-01)'),
        period_b_to: z.string().describe('Period B end date — ISO 8601 (e.g. 2026-02-28)'),
      },
    },
    async ({ period_a_from, period_a_to, period_b_from, period_b_to }) => {
      try {
        const [paymentsA, paymentsB] = await Promise.all([
          fetchPaymentsInRange(moneroo, period_a_from, period_a_to),
          fetchPaymentsInRange(moneroo, period_b_from, period_b_to),
        ]);

        function summarize(payments: Payment[]) {
          const total = payments.length;
          const success = payments.filter((p) => p.status === 'success');
          const revenue = success.reduce((s, p) => s + p.amount, 0);
          const avg = success.length > 0 ? Math.round(revenue / success.length) : 0;
          const conversion = total > 0 ? Math.round((success.length / total) * 1000) / 10 : 0;
          return { total_payments: total, successful: success.length, revenue, avg_ticket: avg, conversion_pct: conversion };
        }

        const a = summarize(paymentsA);
        const b = summarize(paymentsB);

        function delta(va: number, vb: number) {
          const abs = vb - va;
          const pct = va > 0 ? Math.round((abs / va) * 1000) / 10 : null;
          return { period_a: va, period_b: vb, change: abs, change_pct: pct };
        }

        const currency = [...paymentsA, ...paymentsB].find((p) => p.status === 'success');

        return toText(
          JSON.stringify(
            {
              period_a: { from: period_a_from, to: period_a_to },
              period_b: { from: period_b_from, to: period_b_to },
              currency: currency ? currencyCode(currency) : 'XOF',
              comparison: {
                revenue: delta(a.revenue, b.revenue),
                total_payments: delta(a.total_payments, b.total_payments),
                successful_payments: delta(a.successful, b.successful),
                avg_ticket: delta(a.avg_ticket, b.avg_ticket),
                conversion_pct: delta(a.conversion_pct, b.conversion_pct),
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
  // get_peak_hours
  // -------------------------------------------------------------------------
  server.registerTool(
    'get_peak_hours',
    {
      title: 'Peak hours',
      description:
        'Identify when customers pay the most — breakdown by hour of day and day of week. ' +
        'Useful for scheduling campaigns, support staffing, or payout windows.',
      inputSchema: {
        from_date: z
          .string()
          .optional()
          .describe('Start date — ISO 8601. Defaults to 30 days ago.'),
        to_date: z.string().optional().describe('End date — ISO 8601. Defaults to today.'),
      },
    },
    async ({ from_date, to_date }) => {
      try {
        const from = from_date ?? daysAgo(30);
        const to = to_date ?? today();
        const payments = await fetchPaymentsInRange(moneroo, from, to);

        const successful = payments.filter((p) => p.status === 'success');

        const byHour: Record<number, { count: number; total: number }> = {};
        const byWeekday: Record<string, { count: number; total: number }> = {};

        for (const p of successful) {
          const h = getHour(p.initiated_at);
          const wd = getWeekday(p.initiated_at);

          if (!byHour[h]) byHour[h] = { count: 0, total: 0 };
          byHour[h].count++;
          byHour[h].total += p.amount;

          if (!byWeekday[wd]) byWeekday[wd] = { count: 0, total: 0 };
          byWeekday[wd].count++;
          byWeekday[wd].total += p.amount;
        }

        const hourly = Array.from({ length: 24 }, (_, h) => ({
          hour: h,
          label: `${String(h).padStart(2, '0')}:00`,
          count: byHour[h]?.count ?? 0,
          total: byHour[h]?.total ?? 0,
        }));

        const peakHour = hourly.reduce((best, h) => (h.count > best.count ? h : best), hourly[0]);

        const weekdays = Object.entries(byWeekday)
          .map(([day, v]) => ({ day, ...v }))
          .sort((a, b) => b.count - a.count);

        return toText(
          JSON.stringify(
            {
              period: { from, to },
              peak_hour: peakHour.label,
              peak_weekday: weekdays[0]?.day ?? 'N/A',
              hourly_breakdown: hourly,
              weekday_breakdown: weekdays,
              total_successful: successful.length,
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

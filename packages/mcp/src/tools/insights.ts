import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Moneroo } from 'moneroo';
import { z } from 'zod';
import { fetchAll } from '../helpers/fetch-all.js';
import { daysAgo, today, toDateStr } from '../helpers/dates.js';

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
  };
  customer?: { email?: string | null };
  metadata?: Record<string, unknown>;
};

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

function groupByDay(payments: Payment[], statusFilter?: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const p of payments) {
    if (statusFilter && p.status !== statusFilter) continue;
    const day = toDateStr(p.initiated_at);
    result[day] = (result[day] ?? 0) + (statusFilter === 'success' ? p.amount : 1);
  }
  return result;
}

// ---------------------------------------------------------------------------

export function registerInsightsTools(server: McpServer, moneroo: Moneroo): void {
  // -------------------------------------------------------------------------
  // analyze_trends
  // -------------------------------------------------------------------------
  server.registerTool(
    'analyze_trends',
    {
      title: 'Analyze trends',
      description:
        'Analyze revenue and volume trends over the last N weeks. ' +
        'Returns weekly revenue, week-over-week change, moving average, and a trend direction. ' +
        'Claude should interpret these numbers and provide actionable insights.',
      inputSchema: {
        weeks: z
          .number()
          .int()
          .min(2)
          .max(12)
          .optional()
          .describe('Number of weeks to analyze (2–12). Defaults to 4.'),
      },
    },
    async ({ weeks = 4 }) => {
      try {
        const from = daysAgo(weeks * 7);
        const to = today();
        const payments = await fetchPaymentsInRange(moneroo, from, to);

        // Build weekly buckets
        const weekBuckets: Array<{ week: string; revenue: number; count: number; conversion: number }> = [];
        for (let w = 0; w < weeks; w++) {
          const start = daysAgo((weeks - w) * 7);
          const end = daysAgo((weeks - w - 1) * 7);
          const bucket = payments.filter((p) => {
            const d = toDateStr(p.initiated_at);
            return d >= start && d < end;
          });
          const success = bucket.filter((p) => p.status === 'success');
          weekBuckets.push({
            week: `${start} → ${end}`,
            revenue: success.reduce((s, p) => s + p.amount, 0),
            count: bucket.length,
            conversion: bucket.length > 0 ? Math.round((success.length / bucket.length) * 1000) / 10 : 0,
          });
        }

        const revenues = weekBuckets.map((w) => w.revenue);
        const avgRevenue = revenues.reduce((s, v) => s + v, 0) / revenues.length;
        const lastWeek = revenues[revenues.length - 1];
        const prevWeek = revenues[revenues.length - 2];
        const trend = lastWeek > prevWeek ? 'up' : lastWeek < prevWeek ? 'down' : 'flat';
        const wow_change_pct = prevWeek > 0 ? Math.round(((lastWeek - prevWeek) / prevWeek) * 1000) / 10 : null;

        return toText(
          JSON.stringify(
            {
              period: { from, to, weeks },
              trend_direction: trend,
              wow_change_pct,
              weekly_avg_revenue: Math.round(avgRevenue),
              weekly_data: weekBuckets,
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
  // predict_revenue
  // -------------------------------------------------------------------------
  server.registerTool(
    'predict_revenue',
    {
      title: 'Predict revenue',
      description:
        'Estimate end-of-month revenue based on the current pace. ' +
        'Uses daily average from days elapsed this month to project the full month. ' +
        'Also returns last month for comparison.',
      inputSchema: {},
    },
    async () => {
      try {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysRemaining = daysInMonth - dayOfMonth;

        // Current month
        const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const todayStr = today();

        // Last month
        const lastMonthDate = new Date(year, month, 0);
        const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}-01`;
        const lastMonthEnd = lastMonthDate.toISOString().slice(0, 10);

        const [currentPayments, lastMonthPayments] = await Promise.all([
          fetchPaymentsInRange(moneroo, monthStart, todayStr),
          fetchPaymentsInRange(moneroo, lastMonthStart, lastMonthEnd),
        ]);

        const currentRevenue = currentPayments
          .filter((p) => p.status === 'success')
          .reduce((s, p) => s + p.amount, 0);

        const lastMonthRevenue = lastMonthPayments
          .filter((p) => p.status === 'success')
          .reduce((s, p) => s + p.amount, 0);

        const dailyAvg = dayOfMonth > 0 ? currentRevenue / dayOfMonth : 0;
        const projection = Math.round(currentRevenue + dailyAvg * daysRemaining);
        const vsLastMonth =
          lastMonthRevenue > 0
            ? Math.round(((projection - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
            : null;

        const currency = [...currentPayments, ...lastMonthPayments].find((p) => p.status === 'success');

        return toText(
          JSON.stringify(
            {
              current_month: {
                start: monthStart,
                day_of_month: dayOfMonth,
                days_remaining: daysRemaining,
                revenue_so_far: currentRevenue,
                daily_avg: Math.round(dailyAvg),
              },
              projection: {
                estimated_end_of_month: projection,
                vs_last_month_pct: vsLastMonth,
              },
              last_month: {
                period: `${lastMonthStart} → ${lastMonthEnd}`,
                revenue: lastMonthRevenue,
              },
              currency: currency ? (typeof currency.currency === 'object' ? currency.currency.code : currency.currency) : 'XOF',
              note: 'Linear projection based on daily average. Actual results may vary.',
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
  // detect_anomalies
  // -------------------------------------------------------------------------
  server.registerTool(
    'detect_anomalies',
    {
      title: 'Detect anomalies',
      description:
        'Detect unusual transactions: amounts far above average (potential large orders or fraud), ' +
        'sudden spikes or drops in daily volume, and duplicate amounts from the same customer. ' +
        'Returns flagged transactions with reasons.',
      inputSchema: {
        from_date: z
          .string()
          .optional()
          .describe('Start date — ISO 8601. Defaults to 30 days ago.'),
        to_date: z.string().optional().describe('End date — ISO 8601. Defaults to today.'),
        std_deviations: z
          .number()
          .optional()
          .describe(
            'Flag amounts this many standard deviations above mean (default 2.5). Lower = more sensitive.',
          ),
      },
    },
    async ({ from_date, to_date, std_deviations = 2.5 }) => {
      try {
        const from = from_date ?? daysAgo(30);
        const to = to_date ?? today();
        const payments = await fetchPaymentsInRange(moneroo, from, to);

        const successful = payments.filter((p) => p.status === 'success');

        if (successful.length < 5) {
          return toText(
            JSON.stringify({ message: 'Not enough data for anomaly detection (need at least 5 successful payments).', period: { from, to } }, null, 2),
          );
        }

        // Amount outliers
        const amounts = successful.map((p) => p.amount);
        const mean = amounts.reduce((s, v) => s + v, 0) / amounts.length;
        const variance = amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / amounts.length;
        const stdDev = Math.sqrt(variance);
        const threshold = mean + std_deviations * stdDev;

        const outliers = successful
          .filter((p) => p.amount > threshold)
          .map((p) => ({
            id: p.id,
            amount: p.amount,
            customer_email: p.customer?.email ?? null,
            date: p.initiated_at,
            reason: `Amount ${p.amount} is ${((p.amount - mean) / stdDev).toFixed(1)} std deviations above mean (${Math.round(mean)})`,
          }));

        // Daily volume spikes (>3x daily average)
        const dailyVol = groupByDay(successful, 'success');
        const dailyCounts: Record<string, number> = {};
        for (const p of successful) {
          const d = toDateStr(p.initiated_at);
          dailyCounts[d] = (dailyCounts[d] ?? 0) + 1;
        }
        const dailyAvg = Object.values(dailyCounts).reduce((s, v) => s + v, 0) / Object.keys(dailyCounts).length;
        const spikedays = Object.entries(dailyCounts)
          .filter(([, c]) => c > dailyAvg * 3)
          .map(([date, count]) => ({ date, count, avg: Math.round(dailyAvg), reason: `${count} payments vs avg ${Math.round(dailyAvg)}` }));

        // Duplicate amounts from same customer
        const emailAmounts: Record<string, number[]> = {};
        for (const p of successful) {
          const email = p.customer?.email ?? 'unknown';
          if (!emailAmounts[email]) emailAmounts[email] = [];
          emailAmounts[email].push(p.amount);
        }
        const duplicates = Object.entries(emailAmounts)
          .filter(([email, amounts]) => email !== 'unknown' && amounts.length > 2 && new Set(amounts).size === 1)
          .map(([email, amounts]) => ({ email, count: amounts.length, amount: amounts[0], reason: 'Same amount repeated' }));

        return toText(
          JSON.stringify(
            {
              period: { from, to },
              stats: { mean: Math.round(mean), std_dev: Math.round(stdDev), threshold: Math.round(threshold) },
              amount_outliers: outliers,
              volume_spikes: spikedays,
              suspicious_duplicates: duplicates,
              total_flagged: outliers.length + spikedays.length + duplicates.length,
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
  // suggest_optimizations
  // -------------------------------------------------------------------------
  server.registerTool(
    'suggest_optimizations',
    {
      title: 'Suggest optimizations',
      description:
        'Analyze payment data and return structured metrics that Claude can use to generate recommendations. ' +
        'Covers conversion rate, failure patterns, top methods, peak hours, and average ticket. ' +
        'Claude should interpret these metrics and suggest concrete improvements.',
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

        const total = payments.length;
        const success = payments.filter((p) => p.status === 'success');
        const failed = payments.filter((p) => p.status === 'failed');
        const cancelled = payments.filter((p) => p.status === 'cancelled');

        const conversionRate = total > 0 ? Math.round((success.length / total) * 1000) / 10 : 0;
        const revenue = success.reduce((s, p) => s + p.amount, 0);
        const avgTicket = success.length > 0 ? Math.round(revenue / success.length) : 0;

        // Top methods
        const methodCount: Record<string, number> = {};
        for (const p of success) {
          const m = p.capture?.method?.short_code ?? 'unknown';
          methodCount[m] = (methodCount[m] ?? 0) + 1;
        }
        const topMethods = Object.entries(methodCount)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([code, count]) => ({ code, count, share_pct: Math.round((count / success.length) * 1000) / 10 }));

        // Top failure reasons
        const failReasons: Record<string, number> = {};
        for (const p of failed) {
          const r = p.capture?.failure_message ?? 'Unknown';
          failReasons[r] = (failReasons[r] ?? 0) + 1;
        }
        const topFailures = Object.entries(failReasons)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([reason, count]) => ({ reason, count, share_pct: Math.round((count / failed.length) * 1000) / 10 }));

        return toText(
          JSON.stringify(
            {
              period: { from, to },
              kpis: {
                conversion_rate_pct: conversionRate,
                total_payments: total,
                successful: success.length,
                failed: failed.length,
                cancelled: cancelled.length,
                avg_ticket: avgTicket,
                total_revenue: revenue,
              },
              top_payment_methods: topMethods,
              top_failure_reasons: topFailures,
              cancellation_rate_pct: total > 0 ? Math.round((cancelled.length / total) * 1000) / 10 : 0,
              instructions:
                'Use these metrics to identify specific areas for improvement: ' +
                'low conversion → checkout UX or method availability; ' +
                'high failures → specific error messages to investigate; ' +
                'high cancellations → pricing or friction in flow; ' +
                'single dominant method → add alternatives for resilience.',
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
  // churn_risk
  // -------------------------------------------------------------------------
  server.registerTool(
    'churn_risk',
    {
      title: 'Churn risk',
      description:
        'Identify customers who have gone quiet — previously active but with no recent payment. ' +
        'Returns a list of at-risk customers sorted by time since last payment.',
      inputSchema: {
        active_window_days: z
          .number()
          .int()
          .optional()
          .describe(
            'Days to look back for "active" history (default 90). Customers active in this window are considered.',
          ),
        silent_days: z
          .number()
          .int()
          .optional()
          .describe(
            'If a customer has no payment in this many days, they are flagged (default 30).',
          ),
      },
    },
    async ({ active_window_days = 90, silent_days = 30 }) => {
      try {
        const windowFrom = daysAgo(active_window_days);
        const silentFrom = daysAgo(silent_days);
        const to = today();

        const payments = await fetchPaymentsInRange(moneroo, windowFrom, to);
        const successful = payments.filter((p) => p.status === 'success');

        // Build last payment date per customer
        const customerLastPayment: Record<string, { last_payment: string; total_payments: number; total_revenue: number }> = {};

        for (const p of successful) {
          const email = p.customer?.email ?? null;
          if (!email) continue;
          if (!customerLastPayment[email]) {
            customerLastPayment[email] = { last_payment: p.initiated_at, total_payments: 0, total_revenue: 0 };
          }
          if (p.initiated_at > customerLastPayment[email].last_payment) {
            customerLastPayment[email].last_payment = p.initiated_at;
          }
          customerLastPayment[email].total_payments++;
          customerLastPayment[email].total_revenue += p.amount;
        }

        // Flag customers whose last payment is before silentFrom
        const atRisk = Object.entries(customerLastPayment)
          .filter(([, v]) => toDateStr(v.last_payment) < silentFrom)
          .map(([email, v]) => {
            const daysSilent = Math.floor(
              (new Date().getTime() - new Date(v.last_payment).getTime()) / (1000 * 60 * 60 * 24),
            );
            return { email, days_silent: daysSilent, ...v };
          })
          .sort((a, b) => b.days_silent - a.days_silent);

        return toText(
          JSON.stringify(
            {
              parameters: { active_window_days, silent_days },
              total_active_customers: Object.keys(customerLastPayment).length,
              at_risk_customers: atRisk.length,
              at_risk_list: atRisk.slice(0, 50),
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

/**
 * Date utility helpers for analytics computations.
 */

export function toDate(dateStr: string): Date {
  return new Date(dateStr);
}

/** Returns ISO date string (YYYY-MM-DD) for N days ago from today */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Returns ISO date string for today */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns ISO date string for first day of current month */
export function startOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

/** Returns ISO date string for last day of current month */
export function endOfMonth(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return last.toISOString().slice(0, 10);
}

/** Get YYYY-MM-DD from any date string */
export function toDateStr(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10);
}

/** Get hour (0-23) from any date string */
export function getHour(dateStr: string): number {
  return new Date(dateStr).getHours();
}

/** Get weekday name from date string */
export function getWeekday(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
}

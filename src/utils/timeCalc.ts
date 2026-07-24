import type { WorkEntry } from '../types';

const PAUSE_THRESHOLD_MINUTES = 360; // 6h
const PAUSE_MINUTES = 30;

export function calcEffectiveMinutes(clockedMinutes: number): number {
  if (clockedMinutes >= PAUSE_THRESHOLD_MINUTES) {
    return clockedMinutes - PAUSE_MINUTES;
  }
  return clockedMinutes;
}

export function minutesToDisplay(minutes: number): string {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const sign = minutes < 0 ? '-' : '';
  return `${sign}${h}:${String(m).padStart(2, '0')}`;
}

export function minutesToHoursDecimal(minutes: number): number {
  return Math.round((minutes / 60) * 100) / 100;
}

/** Returns elapsed minutes between a clock_in timestamp and now (or clock_out). */
export function elapsedMinutes(clockIn: string, clockOut?: string | null): number {
  const start = new Date(clockIn).getTime();
  const end = clockOut ? new Date(clockOut).getTime() : Date.now();
  return Math.floor((end - start) / 60000);
}

/** Returns the ISO week number (Mon-Sun) for a given date string. */
export function getISOWeekKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay(); // Sun=7
  const thursday = new Date(d);
  thursday.setDate(d.getDate() - dayOfWeek + 4);
  const yearStart = new Date(thursday.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((thursday.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${thursday.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/** Returns the ISO week key for "today". */
export function currentWeekKey(): string {
  return getISOWeekKey(new Date().toISOString().slice(0, 10));
}

/**
 * Calculates balance across all completed (past) weeks that have at least one entry.
 * Current week is excluded from balance and shown separately.
 */
export function calcBalance(entries: WorkEntry[]): {
  balanceMinutes: number;
  thisWeekMinutes: number;
  weeksWithEntries: number;
  totalEffectiveMinutes: number;
} {
  const thisWeek = currentWeekKey();
  const weekMap: Record<string, number> = {};

  for (const e of entries) {
    if (!e.clock_out) continue;
    const wk = getISOWeekKey(e.date);
    weekMap[wk] = (weekMap[wk] ?? 0) + (e.effective_minutes ?? 0);
  }

  const TARGET_PER_WEEK = 720; // 12h in minutes
  let balanceMinutes = 0;
  let weeksWithEntries = 0;

  for (const [wk, mins] of Object.entries(weekMap)) {
    if (wk === thisWeek) continue;
    weeksWithEntries++;
    balanceMinutes += mins - TARGET_PER_WEEK;
  }

  const thisWeekMinutes = weekMap[thisWeek] ?? 0;
  const totalEffectiveMinutes = Object.values(weekMap).reduce((a, b) => a + b, 0);

  return { balanceMinutes, thisWeekMinutes, weeksWithEntries, totalEffectiveMinutes };
}

export function formatTime(isoStr: string): string {
  return new Date(isoStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

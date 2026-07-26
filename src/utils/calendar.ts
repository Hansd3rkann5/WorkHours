export const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

export const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

export const DOW_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getDaysInMonth(year: number, month: number): { d: Date; s: string }[] {
  const result: { d: Date; s: string }[] = [];
  const cur = new Date(year, month, 1);
  while (cur.getMonth() === month) {
    result.push({ d: new Date(cur), s: localDateStr(cur) });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

export function leadingBlanks(year: number, month: number): number {
  const dow = new Date(year, month, 1).getDay(); // 0=Sun
  return (dow + 6) % 7; // Mon=0 … Sun=6
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export function fmtMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${h} h`;
}

export interface DayStyle {
  bg: string;
  text: string;
  ring: string;
}

/** Shared colour logic for a calendar day cell, used by both the year and month views. */
export function getDayStyle(opts: {
  isWork: boolean;
  isHoliday: boolean;
  isWeekend: boolean;
  isToday: boolean;
}): DayStyle {
  const { isWork, isHoliday, isWeekend, isToday } = opts;
  let bg = '';
  let text = '';
  let ring = '';

  if (isWork && isHoliday) {
    bg = 'bg-white';
    text = 'text-black font-semibold';
    ring = 'ring-1 ring-[#fbbf24] ring-offset-1 ring-offset-[#18181b]';
  } else if (isWork) {
    bg = 'bg-white';
    text = 'text-black font-semibold';
  } else if (isHoliday) {
    bg = 'bg-[#78350f]/40';
    text = 'text-[#fbbf24]';
  } else if (isWeekend) {
    bg = 'bg-[#3f3f46]/40';
    text = 'text-[#71717a]';
  } else {
    text = 'text-[#52525b]';
  }

  if (isToday && !isWork) {
    text = 'text-white';
    ring = 'ring-1 ring-white';
  }

  return { bg, text, ring };
}

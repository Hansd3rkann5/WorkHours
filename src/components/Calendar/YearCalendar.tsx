import { useState, useMemo, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { WorkEntry } from '../../types';
import { getHolidayMap } from '../../utils/holidays';

const MONTH_NAMES = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
];

const DAY_NAMES = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];

function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): { d: Date; s: string }[] {
  const result = [];
  const cur = new Date(year, month, 1);
  while (cur.getMonth() === month) {
    result.push({ d: new Date(cur), s: localDateStr(cur) });
    cur.setDate(cur.getDate() + 1);
  }
  return result;
}

function leadingBlanks(year: number, month: number): number {
  const dow = new Date(year, month, 1).getDay(); // 0=Sun
  return (dow + 6) % 7; // Mon=0 … Sun=6
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

function fmtMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}:${String(m).padStart(2, '0')} h` : `${h} h`;
}

interface TooltipData {
  entry: WorkEntry | null;
  holiday: string | null;
  date: Date;
  x: number;
  y: number;
}

interface YearCalendarProps {
  entries: WorkEntry[];
}

export function YearCalendar({ entries }: YearCalendarProps) {
  const [year, setYear] = useState(new Date().getFullYear());
  const today = localDateStr(new Date());
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const workDays = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) {
      if (e.clock_out !== null) s.add(e.date);
    }
    return s;
  }, [entries]);

  const entryMap = useMemo(() => {
    const m = new Map<string, WorkEntry>();
    for (const e of entries) m.set(e.date, e);
    return m;
  }, [entries]);

  const activeDate = useMemo(
    () => entries.find((e) => e.clock_out === null)?.date,
    [entries]
  );

  const holidayMap = useMemo(() => getHolidayMap([year]), [year]);

  const handleDayEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, dateStr: string, date: Date) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const rect = e.currentTarget.getBoundingClientRect();
      timerRef.current = setTimeout(() => {
        setTooltip({
          entry: entryMap.get(dateStr) ?? null,
          holiday: holidayMap.get(dateStr) ?? null,
          date,
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }, 1000);
    },
    [entryMap, holidayMap]
  );

  const handleDayLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTooltip(null);
  }, []);

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-4 sm:p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setYear((y) => y - 1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-white">{year}</span>
        <button
          onClick={() => setYear((y) => y + 1)}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
        <LegendDot bg="bg-white" label="Anwesenheit" />
        <LegendDot bg="bg-[#fbbf24]" label="Feiertag" />
        <LegendDot bg="bg-[#3f3f46]" label="Wochenende" />
      </div>

      {/* 12 months */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }, (_, m) => (
          <MonthGrid
            key={m}
            year={year}
            month={m}
            workDays={workDays}
            activeDate={activeDate}
            holidayMap={holidayMap}
            today={today}
            onDayEnter={handleDayEnter}
            onDayLeave={handleDayLeave}
          />
        ))}
      </div>

      {tooltip && <DayTooltip data={tooltip} />}
    </div>
  );
}

function LegendDot({ bg, label }: { bg: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-2 w-2 rounded-full ${bg}`} />
      <span className="text-[11px] text-[#71717a]">{label}</span>
    </div>
  );
}

interface MonthGridProps {
  year: number;
  month: number;
  workDays: Set<string>;
  activeDate?: string;
  holidayMap: Map<string, string>;
  today: string;
  onDayEnter: (e: React.MouseEvent<HTMLDivElement>, dateStr: string, date: Date) => void;
  onDayLeave: () => void;
}

const DOW_LABELS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

function MonthGrid({ year, month, workDays, activeDate, holidayMap, today, onDayEnter, onDayLeave }: MonthGridProps) {
  const days = getDaysInMonth(year, month);
  const blanks = leadingBlanks(year, month);

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#71717a]">
        {MONTH_NAMES[month]}
      </p>
      {/* DOW headers */}
      <div className="grid grid-cols-7">
        {DOW_LABELS.map((l) => (
          <div key={l} className="flex items-center justify-center py-0.5">
            <span className="text-[8px] text-[#3f3f46]">{l}</span>
          </div>
        ))}
      </div>
      {/* Day cells */}
      <div className="grid grid-cols-7">
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`bl${i}`} className="aspect-square" />
        ))}
        {days.map(({ d, s }) => {
          const dow = d.getDay(); // 0=Sun
          const isWeekend = dow === 0 || dow === 6;
          const isHoliday = holidayMap.has(s);
          const isWork = workDays.has(s) || activeDate === s;
          const isToday = s === today;

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
            text = 'text-[#3f3f46]';
          } else {
            text = 'text-[#52525b]';
          }

          if (isToday && !isWork) {
            ring = 'ring-1 ring-white';
          }

          return (
            <div
              key={s}
              className="aspect-square flex items-center justify-center"
              onMouseEnter={(e) => onDayEnter(e, s, d)}
              onMouseLeave={onDayLeave}
            >
              <div className={`flex h-[17px] w-[17px] items-center justify-center rounded-full ${bg} ${ring}`}>
                <span className={`text-[9px] leading-none ${text}`}>
                  {d.getDate()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayTooltip({ data }: { data: TooltipData }) {
  const { entry, holiday, date, x, y } = data;
  const dateLabel = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dayName = DAY_NAMES[date.getDay()];

  return (
    <div
      className="pointer-events-none fixed z-50 min-w-45 rounded-xl border border-border-hover bg-bg-primary p-3 shadow-2xl"
      style={{ top: y - 10, left: x, transform: 'translate(-50%, -100%)' }}
    >
      <p className="mb-2 text-xs font-semibold text-white">
        {dayName}, {dateLabel}
      </p>

      {holiday && (
        <p className="mb-1.5 text-[11px] text-amber">{holiday}</p>
      )}

      {entry ? (
        entry.clock_out ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-6 text-[11px]">
              <span className="text-[#71717a]">Ein</span>
              <span className="text-white">{fmtTime(entry.clock_in)}</span>
            </div>
            <div className="flex items-center justify-between gap-6 text-[11px]">
              <span className="text-[#71717a]">Aus</span>
              <span className="text-white">{fmtTime(entry.clock_out)}</span>
            </div>
            {entry.effective_minutes !== null && (
              <div className="flex items-center justify-between gap-6 border-t border-[#27272a] pt-1.5 text-[11px]">
                <span className="text-[#71717a]">Effektiv</span>
                <span className="font-semibold text-white">{fmtMinutes(entry.effective_minutes)}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-[#22c55e]">Aktiv seit {fmtTime(entry.clock_in)}</p>
        )
      ) : (
        <p className="text-[11px] text-text-muted">Kein Eintrag</p>
      )}
    </div>
  );
}

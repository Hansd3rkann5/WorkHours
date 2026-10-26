import { useState, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useWorkEntriesContext } from '../../hooks/WorkEntriesContext';
import { visibleNotes } from '../../utils/timeCalc';
import type { WorkEntry } from '../../types';
import { getHolidayMap } from '../../utils/holidays';
import {
  MONTH_NAMES,
  DAY_NAMES,
  DOW_LABELS,
  localDateStr,
  getDaysInMonth,
  leadingBlanks,
  fmtTime,
  fmtMinutes,
  getDayStyle,
} from '../../utils/calendar';

interface MonthCalendarProps {
  entries: WorkEntry[];
}

/**
 * Touch-friendly single-month calendar for the mobile view.
 * Tapping a day reveals its details inline (hover tooltips don't work on touch).
 */
export function MonthCalendar({ entries }: MonthCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  // Remember the last opened day so its details stay rendered while the panel collapses.
  const lastSelected = useRef<string | null>(null);
  if (selected) lastSelected.current = selected;
  const today = localDateStr(now);

  const workDays = useMemo(() => {
    const s = new Set<string>();
    for (const e of entries) if (e.clock_out !== null) s.add(e.date);
    return s;
  }, [entries]);

  const entryMap = useMemo(() => {
    const m = new Map<string, WorkEntry>();
    for (const e of entries) m.set(e.date, e);
    return m;
  }, [entries]);

  const activeDate = useMemo(() => entries.find((e) => e.clock_out === null)?.date, [entries]);
  const holidayMap = useMemo(() => getHolidayMap([year]), [year]);

  const days = getDaysInMonth(year, month);
  const blanks = leadingBlanks(year, month);

  const goPrev = () => {
    setSelected(null);
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    setSelected(null);
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const detailDay = selected ?? lastSelected.current;

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-4">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={goPrev}
          aria-label="Vorheriger Monat"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white active:scale-95"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-white">
          {MONTH_NAMES[month]} {year}
        </span>
        <button
          onClick={goNext}
          aria-label="Nächster Monat"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white active:scale-95"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5">
        <LegendDot bg="bg-white" label="Anwesenheit" />
        <LegendDot bg="bg-[#fbbf24]" label="Feiertag" />
        <LegendDot bg="bg-[#3f3f46]" label="Wochenende" />
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1">
        {DOW_LABELS.map((l) => (
          <div key={l} className="flex items-center justify-center py-1">
            <span className="text-[11px] font-medium text-[#52525b]">{l}</span>
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div key={`${year}-${month}`} className="animate-month grid grid-cols-7 gap-1">
        {Array.from({ length: blanks }, (_, i) => (
          <div key={`bl${i}`} className="aspect-square" />
        ))}
        {days.map(({ d, s }) => {
          const dow = d.getDay(); // 0=Sun
          const isWeekend = dow === 0 || dow === 6;
          const isHoliday = holidayMap.has(s);
          const isWork = workDays.has(s) || activeDate === s;
          const isToday = s === today;
          const isSelected = s === selected;
          const { bg, text, ring } = getDayStyle({ isWork, isHoliday, isWeekend, isToday });

          return (
            <button
              key={s}
              onClick={() => setSelected((cur) => (cur === s ? null : s))}
              className="flex aspect-square items-center justify-center"
            >
              {/* Inner square is inset so the selection ring never overlaps neighbouring days. */}
              <span
                className={`flex aspect-square w-4/5 items-center justify-center rounded-lg transition-all duration-200 ease-in-out ${bg} ${
                  isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-[#18181b]' : ring
                }`}
              >
                <span className={`text-sm ${text}`}>{d.getDate()}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected-day detail — animated expand/collapse */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          selected ? 'mt-4 grid-rows-[1fr] opacity-100' : 'mt-0 grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          {detailDay && (
            <DayDetail
              key={detailDay}
              dateStr={detailDay}
              entry={entryMap.get(detailDay) ?? null}
              holiday={holidayMap.get(detailDay) ?? null}
              canAdd={detailDay <= today}
            />
          )}
        </div>
      </div>
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

export function DayDetail({
  dateStr,
  entry,
  holiday,
  canAdd,
}: {
  dateStr: string;
  entry: WorkEntry | null;
  holiday: string | null;
  canAdd: boolean;
}) {
  const date = new Date(dateStr + 'T00:00:00');
  const dateLabel = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const dayName = DAY_NAMES[date.getDay()];

  return (
    <div className="animate-day-detail rounded-xl border border-[#27272a] bg-[#09090b] p-4 text-left">
      <p className="mb-2 text-xs font-semibold text-white">
        {dayName}, {dateLabel}
      </p>

      {holiday && <p className="mb-2 text-[11px] text-[#fbbf24]">{holiday}</p>}

      {entry ? (
        entry.clock_out ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#71717a]">Ein</span>
              <span className="text-white">{fmtTime(entry.clock_in)}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#71717a]">Aus</span>
              <span className="text-white">{fmtTime(entry.clock_out)}</span>
            </div>
            {entry.effective_minutes !== null && (
              <div className="flex items-center justify-between border-t border-[#27272a] pt-1.5 text-[11px]">
                <span className="text-[#71717a]">Effektiv</span>
                <span className="font-semibold text-white">{fmtMinutes(entry.effective_minutes)}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-[#22c55e]">Aktiv seit {fmtTime(entry.clock_in)}</p>
        )
      ) : (
        <>
          <p className="text-[11px] text-[#52525b]">Kein Eintrag</p>
          {canAdd && <ManualEntryForm dateStr={dateStr} />}
        </>
      )}

      {visibleNotes(entry) && (
        <p className="mt-2.5 border-t border-[#27272a] pt-2.5 text-[11px] leading-relaxed whitespace-pre-wrap text-[#a1a1aa]">
          {visibleNotes(entry)}
        </p>
      )}
    </div>
  );
}

function ManualEntryForm({ dateStr }: { dateStr: string }) {
  const { addManualEntry } = useWorkEntriesContext();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState('09:00');
  const [to, setTo] = useState('13:00');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    // Build local timestamps and send them as UTC ISO strings.
    const clockIn = new Date(`${dateStr}T${from}:00`);
    const clockOut = new Date(`${dateStr}T${to}:00`);
    if (!from || !to || clockOut <= clockIn) {
      setError('Ende muss nach dem Beginn liegen');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await addManualEntry({
        date: dateStr,
        clock_in: clockIn.toISOString(),
        clock_out: clockOut.toISOString(),
        notes: notes.trim() || null,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Speichern');
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#3f3f46] px-3 py-1.5 text-[11px] font-medium text-[#d4d4d8] transition-colors hover:bg-[#27272a]"
      >
        <Plus size={12} />
        Stunden hinzufügen
      </button>
    );
  }

  const inputCls =
    'rounded-lg border border-[#3f3f46] bg-[#27272a] px-2 py-1 text-sm text-white focus:border-white focus:outline-none';

  return (
    <div className="mt-3 space-y-2.5 border-t border-[#27272a] pt-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-1.5 text-[11px] text-[#71717a]">
          Ein
          <input type="time" value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} />
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-[#71717a]">
          Aus
          <input type="time" value={to} onChange={(e) => setTo(e.target.value)} className={inputCls} />
        </label>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notiz (optional)"
        rows={2}
        className={`${inputCls} w-full resize-none text-[11px]`}
      />
      {error && <p className="text-[11px] text-[#f87171]">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={busy}
          className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-[11px] font-semibold text-black disabled:opacity-50"
        >
          Speichern
        </button>
        <button
          onClick={() => setOpen(false)}
          disabled={busy}
          className="cursor-pointer rounded-lg px-3 py-1.5 text-[11px] text-[#a1a1aa] hover:bg-[#27272a]"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { CalendarX } from 'lucide-react';
import { useWorkEntriesContext } from '../../hooks/WorkEntriesContext';
import { WorkDayCard } from './WorkDayCard';
import { ExportMenu } from './ExportMenu';
import { getHolidayMap } from '../../utils/holidays';
import { getISOWeekKey, minutesToDisplay } from '../../utils/timeCalc';
import type { WorkEntry } from '../../types';

function groupByMonth(entries: WorkEntry[]): Record<string, WorkEntry[]> {
  const groups: Record<string, WorkEntry[]> = {};
  for (const e of entries) {
    const key = e.date.slice(0, 7);
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

/** Groups already date-sorted entries into contiguous day buckets (earliest clock_in first within a day). */
function groupByDay(entries: WorkEntry[]): { date: string; items: WorkEntry[] }[] {
  const groups: { date: string; items: WorkEntry[] }[] = [];
  for (const e of entries) {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.items.push(e);
    else groups.push({ date: e.date, items: [e] });
  }
  for (const g of groups) g.items.sort((a, b) => a.clock_in.localeCompare(b.clock_in));
  return groups;
}

function weekSums(entries: WorkEntry[]): Record<string, number> {
  const sums: Record<string, number> = {};
  for (const e of entries) {
    if (!e.effective_minutes) continue;
    const wk = getISOWeekKey(e.date);
    sums[wk] = (sums[wk] ?? 0) + e.effective_minutes;
  }
  return sums;
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** Colour for a weekly total: ≤6h red, 6–12h amber, ≥12h green. */
function weekTotalColor(min: number): string {
  if (min <= 360) return 'text-[#f87171]';
  if (min < 720) return 'text-[#fbbf24]';
  return 'text-[#4ade80]';
}

export function HistoryList() {
  const { entries, deleteEntry, updateEntry } = useWorkEntriesContext();

  const years = useMemo(() => {
    const ys = new Set<number>();
    for (const e of entries) ys.add(Number(e.date.slice(0, 4)));
    ys.add(new Date().getFullYear());
    return [...ys];
  }, [entries]);

  const holidayMap = useMemo(() => getHolidayMap(years), [years]);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.date.localeCompare(a.date)),
    [entries]
  );

  const byMonth = useMemo(() => groupByMonth(sorted), [sorted]);
  const sums = useMemo(() => weekSums(entries), [entries]);
  const monthKeys = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex flex-col">
      {/* List header */}
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs text-[#a1a1aa]">
          {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}
        </p>
        <ExportMenu entries={entries} />
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <CalendarX size={40} className="text-[#27272a]" />
          <p className="text-sm text-[#52525b]">Noch keine Einträge</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 px-4 pb-8">
          {monthKeys.map((monthKey) => {
            const monthEntries = byMonth[monthKey];
            return (
              <section key={monthKey}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#52525b]">
                  {monthLabel(monthKey)}
                </h2>
                <div className="flex flex-col gap-3">
                  {groupByDay(monthEntries).map(({ date, items }, dayIdx, dayArr) => {
                    const wk = getISOWeekKey(date);
                    const weekTotal = sums[wk] ?? 0;
                    const isFirstOfWeek =
                      dayArr.findIndex((g) => getISOWeekKey(g.date) === wk) === dayIdx;

                    return (
                      <div key={date}>
                        {isFirstOfWeek && (
                          <div className="mb-2 mt-1 flex items-center justify-between">
                            <span className="text-xs text-[#3f3f46]">
                              KW {wk.split('-W')[1]}
                            </span>
                            <span className={`text-xs font-medium ${weekTotalColor(weekTotal)}`}>
                              {minutesToDisplay(weekTotal)} / 12:00
                            </span>
                          </div>
                        )}
                        <p className="mb-1 text-xs text-[#52525b]">{dayLabel(date)}</p>
                        <div className="flex flex-col gap-2">
                          {items.map((entry) => (
                            <WorkDayCard
                              key={entry.id}
                              entry={entry}
                              holidayName={holidayMap.get(date)}
                              onDelete={deleteEntry}
                              onUpdate={updateEntry}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

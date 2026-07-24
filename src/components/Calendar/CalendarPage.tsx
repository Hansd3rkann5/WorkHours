import { useMemo } from 'react';
import { Loader2, WifiOff, CalendarX } from 'lucide-react';
import { useWorkEntriesContext as useWorkEntries } from '../../hooks/WorkEntriesContext';
import { WorkDayCard } from './WorkDayCard';
import { ExportMenu } from './ExportMenu';
import { YearCalendar } from './YearCalendar';
import { getHolidayMap } from '../../utils/holidays';
import { getISOWeekKey, minutesToDisplay } from '../../utils/timeCalc';
import type { WorkEntry } from '../../types';

function groupByMonth(entries: WorkEntry[]): Record<string, WorkEntry[]> {
  const groups: Record<string, WorkEntry[]> = {};
  for (const e of entries) {
    const key = e.date.slice(0, 7); // YYYY-MM
    if (!groups[key]) groups[key] = [];
    groups[key].push(e);
  }
  return groups;
}

function weekSumForEntries(entries: WorkEntry[]): Record<string, number> {
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

export function CalendarPage() {
  const { entries, loading, error, deleteEntry, updateEntry } = useWorkEntries();

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
  const weekSums = useMemo(() => weekSumForEntries(entries), [entries]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#52525b]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <WifiOff size={32} className="text-[#52525b]" />
        <p className="text-sm text-[#a1a1aa]">{error}</p>
      </div>
    );
  }

  const monthKeys = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-0 pb-8">
      {/* Sticky header with export */}
      <div className="sticky top-[57px] z-10 border-b border-[#27272a] bg-[#09090b]/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#a1a1aa]">
            {entries.length} {entries.length === 1 ? 'Eintrag' : 'Einträge'}
          </p>
          <ExportMenu entries={entries} />
        </div>
      </div>

      <div className="flex flex-col gap-6 px-4 pt-6">
        {/* Year calendar */}
        <YearCalendar entries={entries} />

        {/* Entry list or empty state */}
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <CalendarX size={40} className="text-[#27272a]" />
            <p className="text-sm text-[#52525b]">Noch keine Einträge</p>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#52525b]">Verlauf</p>
            {monthKeys.map((monthKey) => {
          const monthEntries = byMonth[monthKey];
          return (
            <section key={monthKey}>
              {/* Month header */}
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#52525b]">
                {monthLabel(monthKey)}
              </h2>

              <div className="flex flex-col gap-2">
                {monthEntries.map((entry) => {
                  const wk = getISOWeekKey(entry.date);
                  const weekTotal = weekSums[wk] ?? 0;
                  const isFirstOfWeek = monthEntries.findIndex(
                    (e) => getISOWeekKey(e.date) === wk
                  ) === monthEntries.indexOf(entry);

                  return (
                    <div key={entry.id}>
                      {/* Week separator */}
                      {isFirstOfWeek && (
                        <div className="mb-2 mt-1 flex items-center justify-between">
                          <span className="text-xs text-[#3f3f46]">
                            KW {wk.split('-W')[1]}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              weekTotal >= 720
                                ? 'text-[#4ade80]'
                                : 'text-[#a1a1aa]'
                            }`}
                          >
                            {minutesToDisplay(weekTotal)} / 12:00
                          </span>
                        </div>
                      )}

                      {/* Day label */}
                      <p className="mb-1 text-xs text-[#52525b]">{dayLabel(entry.date)}</p>

                      <WorkDayCard
                        entry={entry}
                        holidayName={holidayMap.get(entry.date)}
                        onDelete={deleteEntry}
                        onUpdate={updateEntry}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
          </>
        )}
      </div>
    </main>
  );
}

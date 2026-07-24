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
                <div className="flex flex-col gap-2">
                  {monthEntries.map((entry) => {
                    const wk = getISOWeekKey(entry.date);
                    const weekTotal = sums[wk] ?? 0;
                    const isFirstOfWeek =
                      monthEntries.findIndex((e) => getISOWeekKey(e.date) === wk) ===
                      monthEntries.indexOf(entry);

                    return (
                      <div key={entry.id}>
                        {isFirstOfWeek && (
                          <div className="mb-2 mt-1 flex items-center justify-between">
                            <span className="text-xs text-[#3f3f46]">
                              KW {wk.split('-W')[1]}
                            </span>
                            <span
                              className={`text-xs font-medium ${
                                weekTotal >= 720 ? 'text-[#4ade80]' : 'text-[#a1a1aa]'
                              }`}
                            >
                              {minutesToDisplay(weekTotal)} / 12:00
                            </span>
                          </div>
                        )}
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
        </div>
      )}
    </div>
  );
}

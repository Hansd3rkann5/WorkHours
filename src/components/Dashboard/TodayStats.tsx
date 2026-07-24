import { Clock, Calendar } from 'lucide-react';
import type { WorkEntry } from '../../types';
import { formatTime, minutesToDisplay } from '../../utils/timeCalc';

interface TodayStatsProps {
  todayEntry: WorkEntry | null;
  activeEntry: WorkEntry | null;
}

export function TodayStats({ todayEntry, activeEntry }: TodayStatsProps) {
  const entry = todayEntry ?? activeEntry;
  if (!entry) return null;

  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
      <div className="mb-3 flex items-center gap-2 text-[#a1a1aa]">
        <Calendar size={14} />
        <span className="text-xs uppercase tracking-widest">Heute · {dateStr}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-[#a1a1aa]" />
          <div>
            <p className="text-xs text-[#52525b]">Eingestempelt</p>
            <p className="text-sm font-medium text-[#f4f4f5]">{formatTime(entry.clock_in)}</p>
          </div>
        </div>
        {entry.clock_out ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-[#52525b]">Ausgestempelt</p>
              <p className="text-sm font-medium text-[#f4f4f5]">{formatTime(entry.clock_out)}</p>
            </div>
            <div className="h-8 w-px bg-[#27272a]" />
            <div className="text-right">
              <p className="text-xs text-[#52525b]">Effektiv</p>
              <p className="text-sm font-medium text-white">
                {minutesToDisplay(entry.effective_minutes ?? 0)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#4ade80]" />
            <span className="text-sm text-[#4ade80]">Läuft</span>
          </div>
        )}
      </div>
    </div>
  );
}

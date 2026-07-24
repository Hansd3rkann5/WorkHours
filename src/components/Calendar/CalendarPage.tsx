import { Loader2, WifiOff } from 'lucide-react';
import { useWorkEntriesContext } from '../../hooks/WorkEntriesContext';
import { YearCalendar } from './YearCalendar';
import { HistoryList } from './HistoryList';

export function CalendarPage() {
  const { entries, loading, error } = useWorkEntriesContext();

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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-6 pb-8">
      <YearCalendar entries={entries} />
      <HistoryList />
    </main>
  );
}

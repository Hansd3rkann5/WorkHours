import { ClockButton } from './ClockButton';
import { TodayStats } from './TodayStats';
import { BalanceCards } from './BalanceCards';
import { useWorkEntriesContext as useWorkEntries } from '../../hooks/WorkEntriesContext';
import { Loader2, WifiOff } from 'lucide-react';

export function Dashboard() {
  const {
    loading,
    error,
    todayEntry,
    activeEntry,
    clockIn,
    clockOut,
    balance,
  } = useWorkEntries();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#52525b]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <WifiOff size={32} className="text-[#52525b]" />
        <p className="text-sm text-[#a1a1aa]">API nicht erreichbar</p>
        <p className="text-xs text-[#52525b]">{error}</p>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <ClockButton
        activeEntry={activeEntry}
        onClockIn={clockIn}
        onClockOut={clockOut}
      />
      <TodayStats todayEntry={todayEntry} activeEntry={activeEntry} />
      <BalanceCards
        balanceMinutes={balance.balanceMinutes}
        thisWeekMinutes={balance.thisWeekMinutes}
        thisWeekTarget={720}
      />
    </main>
  );
}

import { ClockButton } from './ClockButton';
import { TodayStats } from './TodayStats';
import { BalanceCards } from './BalanceCards';
import { useWorkEntriesContext } from '../../hooks/WorkEntriesContext';
import { Loader2, WifiOff } from 'lucide-react';

export function DashboardContent() {
  const { loading, error, todayEntry, activeEntry, clockIn, clockOut, updateEntry, balance } =
    useWorkEntriesContext();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Loader2 size={28} className="animate-spin text-[#52525b]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
        <WifiOff size={32} className="text-[#52525b]" />
        <p className="text-sm text-[#a1a1aa]">API nicht erreichbar</p>
        <p className="text-xs text-[#52525b]">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <ClockButton
        activeEntry={activeEntry}
        onClockIn={clockIn}
        onClockOut={clockOut}
        onSaveNotes={(id, notes) => updateEntry(id, { notes })}
      />
      <TodayStats todayEntry={todayEntry} activeEntry={activeEntry} />
      <BalanceCards
        balanceMinutes={balance.balanceMinutes}
        thisWeekMinutes={balance.thisWeekMinutes}
        thisWeekTarget={720}
      />
    </div>
  );
}

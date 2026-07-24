import { TrendingUp, TrendingDown, Target, BarChart2 } from 'lucide-react';
import { minutesToDisplay } from '../../utils/timeCalc';

interface BalanceCardsProps {
  balanceMinutes: number;
  thisWeekMinutes: number;
  thisWeekTarget: number;
}

export function BalanceCards({ balanceMinutes, thisWeekMinutes, thisWeekTarget }: BalanceCardsProps) {
  const weekProgress = Math.min(thisWeekMinutes / thisWeekTarget, 1);
  const weekRemaining = Math.max(thisWeekTarget - thisWeekMinutes, 0);
  const isPositive = balanceMinutes >= 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* This week */}
      <div className="col-span-2 rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[#a1a1aa]" />
            <span className="text-xs uppercase tracking-widest text-[#a1a1aa]">Diese Woche</span>
          </div>
          <span className="text-xs text-[#52525b]">Ziel: 12:00 h</span>
        </div>
        {/* Progress bar */}
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-[#27272a]">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: `${weekProgress * 100}%` }}
          />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-light tabular-nums text-white">
              {minutesToDisplay(thisWeekMinutes)}
            </p>
            <p className="text-xs text-[#52525b]">geleistete Stunden</p>
          </div>
          {weekRemaining > 0 ? (
            <div className="text-right">
              <p className="text-base font-light tabular-nums text-[#a1a1aa]">
                -{minutesToDisplay(weekRemaining)}
              </p>
              <p className="text-xs text-[#52525b]">noch offen</p>
            </div>
          ) : (
            <div className="text-right">
              <p className="text-sm font-medium text-[#4ade80]">Ziel erreicht</p>
            </div>
          )}
        </div>
      </div>

      {/* Balance */}
      <div className="col-span-2 rounded-2xl border border-[#27272a] bg-[#18181b] p-5">
        <div className="mb-3 flex items-center gap-2">
          <BarChart2 size={16} className="text-[#a1a1aa]" />
          <span className="text-xs uppercase tracking-widest text-[#a1a1aa]">Gesamtsaldo</span>
        </div>
        <div className="flex items-center gap-3">
          {isPositive ? (
            <TrendingUp size={20} className="text-[#4ade80]" />
          ) : (
            <TrendingDown size={20} className="text-[#f87171]" />
          )}
          <p
            className={`text-3xl font-light tabular-nums tracking-tight ${
              isPositive ? 'text-[#4ade80]' : 'text-[#f87171]'
            }`}
          >
            {isPositive ? '+' : ''}
            {minutesToDisplay(balanceMinutes)}
          </p>
        </div>
        <p className="mt-1 text-xs text-[#52525b]">
          Überstunden aller abgeschlossenen Wochen
        </p>
      </div>
    </div>
  );
}

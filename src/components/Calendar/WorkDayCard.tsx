import { useState } from 'react';
import { Clock, Trash2, Edit2, Check, X } from 'lucide-react';
import type { WorkEntry } from '../../types';
import { formatTime, minutesToDisplay } from '../../utils/timeCalc';

interface WorkDayCardProps {
  entry: WorkEntry;
  holidayName?: string;
  onDelete: (id: number) => Promise<unknown>;
  onUpdate: (id: number, data: { clock_in?: string; clock_out?: string }) => Promise<unknown>;
}

export function WorkDayCard({ entry, holidayName, onDelete, onUpdate }: WorkDayCardProps) {
  const [editing, setEditing] = useState(false);
  const [clockInVal, setClockInVal] = useState(formatTime(entry.clock_in));
  const [clockOutVal, setClockOutVal] = useState(entry.clock_out ? formatTime(entry.clock_out) : '');
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    setBusy(true);
    try {
      const base = entry.date;
      const toISO = (timeStr: string) => `${base}T${timeStr}:00`;
      const data: { clock_in?: string; clock_out?: string } = {};
      if (clockInVal) data.clock_in = toISO(clockInVal);
      if (clockOutVal) data.clock_out = toISO(clockOutVal);
      await onUpdate(entry.id, data);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Eintrag löschen?')) return;
    setBusy(true);
    try {
      await onDelete(entry.id);
    } finally {
      setBusy(false);
    }
  };

  const isOpen = entry.clock_out === null;

  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        holidayName
          ? 'border-[#78350f] bg-[#78350f]/10'
          : 'border-[#27272a] bg-[#18181b]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-1 items-center gap-3">
          <div
            className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
              isOpen ? 'bg-[#166534]/30' : 'bg-[#27272a]'
            }`}
          >
            <Clock size={16} className={isOpen ? 'text-[#4ade80]' : 'text-[#a1a1aa]'} />
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#52525b]">Ein</span>
                  <input
                    type="time"
                    value={clockInVal}
                    onChange={(e) => setClockInVal(e.target.value)}
                    className="rounded-lg border border-[#3f3f46] bg-[#27272a] px-2 py-1 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#52525b]">Aus</span>
                  <input
                    type="time"
                    value={clockOutVal}
                    onChange={(e) => setClockOutVal(e.target.value)}
                    className="rounded-lg border border-[#3f3f46] bg-[#27272a] px-2 py-1 text-sm text-white focus:border-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="text-sm text-[#f4f4f5]">
                  {formatTime(entry.clock_in)}
                  {entry.clock_out ? ` – ${formatTime(entry.clock_out)}` : ''}
                </span>
                {entry.effective_minutes !== null && (
                  <span className="text-sm font-medium text-white">
                    {minutesToDisplay(entry.effective_minutes)}
                  </span>
                )}
                {isOpen && (
                  <span className="flex items-center gap-1 text-xs text-[#4ade80]">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ade80]" />
                    Läuft
                  </span>
                )}
              </div>
            )}
            {holidayName && (
              <p className="mt-0.5 text-xs text-[#fbbf24]">{holidayName}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                disabled={busy}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#4ade80] hover:bg-[#166534]/20"
              >
                <Check size={15} />
              </button>
              <button
                onClick={() => setEditing(false)}
                disabled={busy}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#a1a1aa] hover:bg-[#27272a]"
              >
                <X size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#52525b] transition-colors hover:bg-[#27272a] hover:text-[#a1a1aa]"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={handleDelete}
                disabled={busy}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[#52525b] transition-colors hover:bg-[#7f1d1d]/20 hover:text-[#f87171]"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

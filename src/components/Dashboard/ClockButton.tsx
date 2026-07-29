import { useState, useEffect } from 'react';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import type { WorkEntry } from '../../types';
import { elapsedMinutes, minutesToDisplay, calcEffectiveMinutes } from '../../utils/timeCalc';
import { NotesDialog } from './NotesDialog';

interface ClockButtonProps {
  activeEntry: WorkEntry | null;
  onClockIn: () => Promise<unknown>;
  onClockOut: (id: number) => Promise<WorkEntry>;
  onSaveNotes: (id: number, notes: string) => Promise<unknown>;
}

export function ClockButton({ activeEntry, onClockIn, onClockOut, onSaveNotes }: ClockButtonProps) {
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [noteEntry, setNoteEntry] = useState<WorkEntry | null>(null);

  useEffect(() => {
    if (!activeEntry) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(elapsedMinutes(activeEntry.clock_in));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [activeEntry]);

  const handle = async () => {
    setBusy(true);
    try {
      if (activeEntry) {
        const updated = await onClockOut(activeEntry.id);
        setNoteEntry(updated);
      } else {
        await onClockIn();
      }
    } finally {
      setBusy(false);
    }
  };

  const effective = calcEffectiveMinutes(elapsed);
  const isWorking = !!activeEntry;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Live timer */}
      <div className="text-center">
        <div
          className={`text-5xl font-light tabular-nums tracking-tight transition-colors ${
            isWorking ? 'text-white' : 'text-[#3f3f46]'
          }`}
        >
          {minutesToDisplay(isWorking ? effective : 0)}
        </div>
        {/* {isWorking && elapsed >= 360 && (
          <p className="mt-1 text-xs text-[#a1a1aa]">inkl. 30 min Pause abgezogen</p>
        )}
        {!isWorking && (
          <p className="mt-1 text-sm text-[#52525b]">Heute noch nicht eingestempelt</p>
        )} */}
      </div>

      {/* Clock button */}
      <button
        onClick={handle}
        disabled={busy}
        aria-label={isWorking ? 'Ausstempeln' : 'Einstempeln'}
        className={`
          relative flex h-28 w-28 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-200
          active:scale-95 disabled:opacity-50
          ${
            isWorking
              ? 'border-[#f87171] bg-[#7f1d1d]/20 text-[#f87171] hover:bg-[#7f1d1d]/30'
              : 'border-white bg-white/5 text-white hover:bg-white/10'
          }
        `}
      >
        {busy ? (
          <Loader2 size={32} className="animate-spin" />
        ) : isWorking ? (
          <LogOut size={32} />
        ) : (
          <LogIn size={32} />
        )}
      </button>

      <p className="text-sm font-medium text-[#a1a1aa]">
        {isWorking ? 'Tippen zum Ausstempeln' : 'Tippen zum Einstempeln'}
      </p>

      {noteEntry && (
        <NotesDialog
          dateLabel={new Date(noteEntry.date + 'T00:00:00').toLocaleDateString('de-DE', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
          initialNotes={noteEntry.notes ?? ''}
          onSave={async (notes) => {
            await onSaveNotes(noteEntry.id, notes);
          }}
          onClose={() => setNoteEntry(null)}
        />
      )}
    </div>
  );
}

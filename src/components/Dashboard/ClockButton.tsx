import { useState, useEffect } from 'react';
import { LogIn, LogOut, Loader2, Pause, Play } from 'lucide-react';
import type { WorkEntry } from '../../types';
import { elapsedMinutes, minutesToDisplay } from '../../utils/timeCalc';
import { NotesDialog } from './NotesDialog';

interface ClockButtonProps {
  activeEntry: WorkEntry | null;
  onClockIn: () => Promise<unknown>;
  onClockOut: (id: number) => Promise<WorkEntry>;
  onPause: (id: number) => Promise<unknown>;
  onResume: (id: number) => Promise<unknown>;
  onSaveNotes: (id: number, notes: string) => Promise<unknown>;
}

/** Minutes actually worked so far, excluding completed and any ongoing pause. */
function workedMinutes(entry: WorkEntry): number {
  const paused = entry.paused_minutes ?? 0;
  const ongoing = entry.pause_started_at ? elapsedMinutes(entry.pause_started_at) : 0;
  return Math.max(0, elapsedMinutes(entry.clock_in) - paused - ongoing);
}

export function ClockButton({
  activeEntry,
  onClockIn,
  onClockOut,
  onPause,
  onResume,
  onSaveNotes,
}: ClockButtonProps) {
  const [busy, setBusy] = useState(false);
  const [pauseBusy, setPauseBusy] = useState(false);
  const [worked, setWorked] = useState(0);
  const [noteEntry, setNoteEntry] = useState<WorkEntry | null>(null);

  const isWorking = !!activeEntry;
  const isPaused = !!activeEntry?.pause_started_at;

  useEffect(() => {
    if (!activeEntry) {
      setWorked(0);
      return;
    }
    const tick = () => setWorked(workedMinutes(activeEntry));
    tick();
    const id = setInterval(tick, 10000);
    return () => clearInterval(id);
  }, [activeEntry]);

  const handleMain = async () => {
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

  const handlePause = async () => {
    if (!activeEntry) return;
    setPauseBusy(true);
    try {
      if (isPaused) await onResume(activeEntry.id);
      else await onPause(activeEntry.id);
    } finally {
      setPauseBusy(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Live timer */}
      <div className="text-center">
        <div
          className={`text-5xl font-light tabular-nums tracking-tight transition-colors duration-300 ${
            isPaused ? 'text-[#fbbf24]' : isWorking ? 'text-white' : 'text-[#3f3f46]'
          }`}
        >
          {minutesToDisplay(isWorking ? worked : 0)}
        </div>
        {isPaused && <p className="mt-1 text-xs font-medium text-[#fbbf24]">Pausiert</p>}
      </div>

      {/* Clock button splits into clock-out + pause when working */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleMain}
          disabled={busy}
          aria-label={isWorking ? 'Ausstempeln' : 'Einstempeln'}
          className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out active:scale-95 disabled:opacity-50 ${
            isWorking
              ? 'h-20 w-20 border-[#f87171] bg-[#7f1d1d]/20 text-[#f87171] hover:bg-[#7f1d1d]/30'
              : 'h-28 w-28 border-white bg-white/5 text-white hover:bg-white/10'
          }`}
        >
          {busy ? (
            <Loader2 size={30} className="animate-spin" />
          ) : isWorking ? (
            <LogOut size={28} />
          ) : (
            <LogIn size={32} />
          )}
        </button>

        <button
          onClick={handlePause}
          disabled={pauseBusy || busy}
          aria-label={isPaused ? 'Fortsetzen' : 'Pausieren'}
          className={`relative flex items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-300 ease-in-out active:scale-95 disabled:opacity-50 ${
            isWorking
              ? 'ml-4 h-20 w-20 opacity-100'
              : 'ml-0 h-0 w-0 border-0 opacity-0'
          } ${
            isPaused
              ? 'border-[#4ade80] bg-[#166534]/20 text-[#4ade80] hover:bg-[#166534]/30'
              : 'border-[#fbbf24] bg-[#78350f]/20 text-[#fbbf24] hover:bg-[#78350f]/30'
          }`}
        >
          {pauseBusy ? (
            <Loader2 size={26} className="animate-spin" />
          ) : isPaused ? (
            <Play size={26} />
          ) : (
            <Pause size={26} />
          )}
        </button>
      </div>

      <p className="text-sm font-medium text-[#a1a1aa]">
        {!isWorking
          ? 'Tippen zum Einstempeln'
          : isPaused
            ? 'Pausiert — tippen zum Fortsetzen'
            : 'Läuft — pausieren oder ausstempeln'}
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

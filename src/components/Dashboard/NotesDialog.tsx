import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface NotesDialogProps {
  dateLabel: string;
  initialNotes: string;
  onSave: (notes: string) => Promise<void>;
  onClose: () => void;
}

/**
 * Small modal shown after clocking out so the day can be described.
 * Animates in on mount and back out before unmounting.
 */
export function NotesDialog({ dateLabel, initialNotes, onSave, onClose }: NotesDialogProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setShow(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const close = () => {
    setShow(false);
    setTimeout(onClose, 200);
  };

  const handleSave = async () => {
    setBusy(true);
    try {
      await onSave(notes.trim());
      close();
    } catch {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ease-in-out ${
          show ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-md rounded-t-2xl border border-[#27272a] bg-[#18181b] p-5 shadow-2xl transition-all duration-200 ease-in-out sm:rounded-2xl ${
          show ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">Notiz zum Arbeitstag</h2>
            <p className="mt-0.5 text-xs text-[#52525b]">{dateLabel}</p>
          </div>
          <button
            onClick={close}
            aria-label="Schließen"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#52525b] transition-colors hover:bg-[#27272a] hover:text-[#a1a1aa]"
          >
            <X size={16} />
          </button>
        </div>

        <textarea
          autoFocus
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Was hast du heute gemacht?"
          rows={4}
          className="w-full resize-none rounded-xl border border-[#27272a] bg-[#09090b] p-3 text-sm text-white placeholder:text-[#52525b] focus:border-[#3f3f46] focus:outline-none"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={close}
            disabled={busy}
            className="rounded-xl px-4 py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:bg-[#27272a] hover:text-white disabled:opacity-50"
          >
            Überspringen
          </button>
          <button
            onClick={handleSave}
            disabled={busy}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition-transform active:scale-95 disabled:opacity-50"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
}

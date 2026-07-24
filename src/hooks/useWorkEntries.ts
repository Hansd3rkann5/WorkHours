import { useState, useEffect, useCallback } from 'react';
import type { WorkEntry } from '../types';
import { api } from '../api/client';
import { calcBalance, todayStr } from '../utils/timeCalc';

export function useWorkEntries() {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getEntries();
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const today = todayStr();
  const todayEntry = entries.find((e) => e.date === today) ?? null;
  const activeEntry = entries.find((e) => e.clock_out === null) ?? null;

  const clockIn = async () => {
    const entry = await api.clockIn();
    setEntries((prev) => [entry, ...prev]);
    return entry;
  };

  const clockOut = async (id: number) => {
    const updated = await api.clockOut(id);
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  };

  const deleteEntry = async (id: number) => {
    await api.deleteEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = async (id: number, data: { clock_in?: string; clock_out?: string }) => {
    const updated = await api.updateEntry(id, data);
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  };

  const balance = calcBalance(entries);

  return {
    entries,
    loading,
    error,
    reload: load,
    todayEntry,
    activeEntry,
    clockIn,
    clockOut,
    deleteEntry,
    updateEntry,
    balance,
  };
}

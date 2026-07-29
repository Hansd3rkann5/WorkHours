import type { WorkEntry } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  // 204 No Content (e.g. DELETE) has no body — don't try to parse JSON.
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  getEntries: (): Promise<WorkEntry[]> => request('/api/entries'),

  getSettings: (): Promise<{ balance_offset_minutes: number }> =>
    request('/api/settings'),

  clockIn: (): Promise<WorkEntry> =>
    request('/api/entries', {
      method: 'POST',
      body: JSON.stringify({ clock_in: new Date().toISOString() }),
    }),

  clockOut: (id: number): Promise<WorkEntry> =>
    request(`/api/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ clock_out: new Date().toISOString() }),
    }),

  pauseEntry: (id: number): Promise<WorkEntry> =>
    request(`/api/entries/${id}/pause`, { method: 'POST' }),

  resumeEntry: (id: number): Promise<WorkEntry> =>
    request(`/api/entries/${id}/resume`, { method: 'POST' }),

  deleteEntry: (id: number): Promise<void> =>
    request(`/api/entries/${id}`, { method: 'DELETE' }),

  updateEntry: (
    id: number,
    data: { clock_in?: string; clock_out?: string; notes?: string | null }
  ): Promise<WorkEntry> =>
    request(`/api/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

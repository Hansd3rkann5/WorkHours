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
  return res.json() as Promise<T>;
}

export const api = {
  getEntries: (): Promise<WorkEntry[]> => request('/api/entries'),

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

  deleteEntry: (id: number): Promise<void> =>
    request(`/api/entries/${id}`, { method: 'DELETE' }),

  updateEntry: (
    id: number,
    data: { clock_in?: string; clock_out?: string }
  ): Promise<WorkEntry> =>
    request(`/api/entries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

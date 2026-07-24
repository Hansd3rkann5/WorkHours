export interface WorkEntry {
  id: number;
  date: string;        // YYYY-MM-DD
  clock_in: string;    // ISO 8601
  clock_out: string | null;
  clocked_minutes: number | null;
  effective_minutes: number | null;
  created_at: string;
}

export interface BalanceInfo {
  total_effective_minutes: number;
  weeks_with_entries: number;
  balance_minutes: number;
  this_week_minutes: number;
  this_week_target: number;
}

export interface Holiday {
  date: string;  // YYYY-MM-DD
  name: string;
}

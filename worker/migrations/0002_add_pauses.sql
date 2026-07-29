-- Manual pauses: accumulated paused minutes and the timestamp of an ongoing pause.
ALTER TABLE work_entries ADD COLUMN paused_minutes INTEGER DEFAULT 0;
ALTER TABLE work_entries ADD COLUMN pause_started_at TEXT;

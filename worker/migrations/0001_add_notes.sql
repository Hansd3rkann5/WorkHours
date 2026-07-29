-- Adds a free-text notes column so a work day can describe what was done.
ALTER TABLE work_entries ADD COLUMN notes TEXT;

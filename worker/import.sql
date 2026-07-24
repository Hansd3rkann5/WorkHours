-- Clear any test data
DELETE FROM work_entries;

-- Create settings table if not exists
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Balance offset: compensates for KW21–26 where Excel had SOLL=0 (no 12h target).
-- Without offset the app would deduct 12h/week for those weeks → wrong balance.
-- Offset = 3630 min (60.5h) brings Gesamtsaldo to +9:30h (matches Excel logic).
INSERT OR REPLACE INTO settings (key, value) VALUES ('balance_offset_minutes', '3630');

-- Import work entries (times stored in UTC = CEST - 2h)
-- KW21 – Mittwoch 20.05.2026: 13:30–17:30 CEST → 11:30–15:30 UTC (240 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-05-20', '2026-05-20T11:30:00.000Z', '2026-05-20T15:30:00.000Z', 240, 240);

-- KW22 – Freitag 29.05.2026: 10:15–15:15 CEST → 08:15–13:15 UTC (300 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-05-29', '2026-05-29T08:15:00.000Z', '2026-05-29T13:15:00.000Z', 300, 300);

-- KW23 – Donnerstag 04.06.2026: 12:30–18:00 CEST → 10:30–16:00 UTC (330 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-06-04', '2026-06-04T10:30:00.000Z', '2026-06-04T16:00:00.000Z', 330, 330);

-- KW24 – Mittwoch 10.06.2026: 14:00–16:00 CEST → 12:00–14:00 UTC (120 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-06-10', '2026-06-10T12:00:00.000Z', '2026-06-10T14:00:00.000Z', 120, 120);

-- KW24 – Freitag 12.06.2026: 08:00–14:30 CEST → 06:00–12:30 UTC (390 min → 360 min after >6h pause)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-06-12', '2026-06-12T06:00:00.000Z', '2026-06-12T12:30:00.000Z', 390, 360);

-- KW25 – Freitag 19.06.2026: 10:00–12:00 CEST → 08:00–10:00 UTC (120 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-06-19', '2026-06-19T08:00:00.000Z', '2026-06-19T10:00:00.000Z', 120, 120);

-- KW26 – Mittwoch 24.06.2026: 09:30–15:00 CEST → 07:30–13:00 UTC (330 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-06-24', '2026-06-24T07:30:00.000Z', '2026-06-24T13:00:00.000Z', 330, 330);

-- KW28 – Montag 06.07.2026: 09:00–15:00 CEST → 07:00–13:00 UTC (360 min, NOT >360 → no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-07-06', '2026-07-06T07:00:00.000Z', '2026-07-06T13:00:00.000Z', 360, 360);

-- KW28 – Mittwoch 08.07.2026: 09:00–12:00 CEST → 07:00–10:00 UTC (180 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-07-08', '2026-07-08T07:00:00.000Z', '2026-07-08T10:00:00.000Z', 180, 180);

-- KW29 – Montag 13.07.2026: 15:00–18:00 CEST → 13:00–16:00 UTC (180 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-07-13', '2026-07-13T13:00:00.000Z', '2026-07-13T16:00:00.000Z', 180, 180);

-- KW29 – Mittwoch 15.07.2026: 12:00–15:00 CEST → 10:00–13:00 UTC (180 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-07-15', '2026-07-15T10:00:00.000Z', '2026-07-15T13:00:00.000Z', 180, 180);

-- KW30 – Mittwoch 22.07.2026: 08:30–14:30 CEST → 06:30–12:30 UTC (360 min, NOT >360 → no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-07-22', '2026-07-22T06:30:00.000Z', '2026-07-22T12:30:00.000Z', 360, 360);

-- KW30 – Freitag 24.07.2026 (heute): 09:00–13:00 CEST → 07:00–11:00 UTC (240 min, no deduction)
INSERT INTO work_entries (date, clock_in, clock_out, clocked_minutes, effective_minutes)
VALUES ('2026-07-24', '2026-07-24T07:00:00.000Z', '2026-07-24T11:00:00.000Z', 240, 240);

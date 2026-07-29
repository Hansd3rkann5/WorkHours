interface Env {
  DB: D1Database;
}

interface WorkEntry {
  id: number;
  date: string;
  clock_in: string;
  clock_out: string | null;
  clocked_minutes: number | null;
  effective_minutes: number | null;
  notes: string | null;
  paused_minutes: number | null;
  pause_started_at: string | null;
  created_at: string;
}

const PAUSE_THRESHOLD = 360; // 6h in minutes
const PAUSE_DEDUCTION = 30;

// Deduct the actual manual pauses, but never less than the legal 30 min break above 6h.
function calcEffective(clocked: number, paused: number): number {
  const deduction = Math.max(paused, clocked > PAUSE_THRESHOLD ? PAUSE_DEDUCTION : 0);
  return Math.max(0, clocked - deduction);
}

function cors(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data: unknown, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors(origin) },
  });
}

function err(msg: string, status = 400, origin = '*') {
  return new Response(msg, { status, headers: cors(origin) });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') ?? '*';
    const { pathname, method } = { pathname: url.pathname, method: request.method };

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    // GET /api/settings
    if (method === 'GET' && pathname === '/api/settings') {
      const row = await env.DB.prepare(
        "SELECT value FROM settings WHERE key = 'balance_offset_minutes'"
      ).first<{ value: string }>();
      return json({ balance_offset_minutes: row ? Number(row.value) : 0 }, 200, origin);
    }

    // GET /api/entries
    if (method === 'GET' && pathname === '/api/entries') {
      const { results } = await env.DB.prepare(
        'SELECT * FROM work_entries ORDER BY date DESC, clock_in DESC'
      ).all<WorkEntry>();
      return json(results, 200, origin);
    }

    // POST /api/entries — clock in
    if (method === 'POST' && pathname === '/api/entries') {
      const body = (await request.json()) as { clock_in: string };
      const clockIn = new Date(body.clock_in);
      const date = clockIn.toISOString().slice(0, 10);

      // Prevent duplicate open entry for same day
      const existing = await env.DB.prepare(
        'SELECT id FROM work_entries WHERE date = ? AND clock_out IS NULL'
      )
        .bind(date)
        .first<{ id: number }>();

      if (existing) return err('Bereits eingestempelt', 409, origin);

      const { meta } = await env.DB.prepare(
        'INSERT INTO work_entries (date, clock_in) VALUES (?, ?)'
      )
        .bind(date, body.clock_in)
        .run();

      const entry = await env.DB.prepare('SELECT * FROM work_entries WHERE id = ?')
        .bind(meta.last_row_id)
        .first<WorkEntry>();

      return json(entry, 201, origin);
    }

    // POST /api/entries/:id/pause | /resume — toggle a manual pause on an open entry
    const pauseMatch = pathname.match(/^\/api\/entries\/(\d+)\/(pause|resume)$/);
    if (method === 'POST' && pauseMatch) {
      const id = Number(pauseMatch[1]);
      const action = pauseMatch[2];

      const existing = await env.DB.prepare('SELECT * FROM work_entries WHERE id = ?')
        .bind(id)
        .first<WorkEntry>();

      if (!existing) return err('Nicht gefunden', 404, origin);
      if (existing.clock_out) return err('Eintrag bereits abgeschlossen', 409, origin);

      if (action === 'pause') {
        if (!existing.pause_started_at) {
          await env.DB.prepare('UPDATE work_entries SET pause_started_at = ? WHERE id = ?')
            .bind(new Date().toISOString(), id)
            .run();
        }
      } else if (existing.pause_started_at) {
        const delta = Math.floor(
          (Date.now() - new Date(existing.pause_started_at).getTime()) / 60000
        );
        const paused = (existing.paused_minutes ?? 0) + delta;
        await env.DB.prepare(
          'UPDATE work_entries SET paused_minutes = ?, pause_started_at = NULL WHERE id = ?'
        )
          .bind(paused, id)
          .run();
      }

      const updated = await env.DB.prepare('SELECT * FROM work_entries WHERE id = ?')
        .bind(id)
        .first<WorkEntry>();
      return json(updated, 200, origin);
    }

    // PATCH /api/entries/:id — clock out or edit
    const patchMatch = pathname.match(/^\/api\/entries\/(\d+)$/);
    if (method === 'PATCH' && patchMatch) {
      const id = Number(patchMatch[1]);
      const body = (await request.json()) as {
        clock_in?: string;
        clock_out?: string;
        notes?: string | null;
      };

      const existing = await env.DB.prepare('SELECT * FROM work_entries WHERE id = ?')
        .bind(id)
        .first<WorkEntry>();

      if (!existing) return err('Nicht gefunden', 404, origin);

      // Merge with existing values so a partial update keeps the other fields intact.
      const clockIn = new Date(body.clock_in ?? existing.clock_in);
      const clockOutStr = body.clock_out !== undefined ? body.clock_out : existing.clock_out;
      const clockOut = clockOutStr ? new Date(clockOutStr) : null;
      const notes = body.notes !== undefined ? body.notes : existing.notes;

      // A pause that is still open when clocking out ends at clock_out.
      let pausedMinutes = existing.paused_minutes ?? 0;
      let pauseStartedAt: string | null = existing.pause_started_at;
      if (clockOut && existing.pause_started_at) {
        pausedMinutes += Math.floor(
          (clockOut.getTime() - new Date(existing.pause_started_at).getTime()) / 60000
        );
        pauseStartedAt = null;
      }

      let clockedMinutes: number | null = null;
      let effectiveMinutes: number | null = null;

      if (clockOut) {
        clockedMinutes = Math.floor((clockOut.getTime() - clockIn.getTime()) / 60000);
        effectiveMinutes = calcEffective(clockedMinutes, pausedMinutes);
      }

      await env.DB.prepare(
        `UPDATE work_entries
         SET clock_in = ?, clock_out = ?, clocked_minutes = ?, effective_minutes = ?,
             notes = ?, paused_minutes = ?, pause_started_at = ?
         WHERE id = ?`
      )
        .bind(
          clockIn.toISOString(),
          clockOut ? clockOut.toISOString() : null,
          clockedMinutes,
          effectiveMinutes,
          notes ?? null,
          pausedMinutes,
          pauseStartedAt,
          id
        )
        .run();

      const updated = await env.DB.prepare('SELECT * FROM work_entries WHERE id = ?')
        .bind(id)
        .first<WorkEntry>();

      return json(updated, 200, origin);
    }

    // DELETE /api/entries/:id
    const deleteMatch = pathname.match(/^\/api\/entries\/(\d+)$/);
    if (method === 'DELETE' && deleteMatch) {
      const id = Number(deleteMatch[1]);
      const { meta } = await env.DB.prepare('DELETE FROM work_entries WHERE id = ?')
        .bind(id)
        .run();
      if (meta.changes === 0) return err('Nicht gefunden', 404, origin);
      return new Response(null, { status: 204, headers: cors(origin) });
    }

    return err('Not Found', 404, origin);
  },
} satisfies ExportedHandler<Env>;

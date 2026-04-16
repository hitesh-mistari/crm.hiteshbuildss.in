import pool from '../config/db.js';

export async function getFocusSessions(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM focus_sessions WHERE user_key=$1 ORDER BY started_at DESC', [user_key]);
    res.json(result.rows.map((r) => ({
      id: r.id, date: r.date, taskId: r.task_id ?? undefined, projectId: r.project_id ?? undefined,
      label: r.label, durationMinutes: r.duration_minutes, actualMinutes: r.actual_minutes ?? undefined,
      status: r.status, mode: r.mode, startedAt: r.started_at, endedAt: r.ended_at ?? undefined, notes: r.notes ?? undefined,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createFocusSession(req, res) {
  try {
    const { id, user_key, date, taskId, projectId, label, durationMinutes, actualMinutes, status, mode, startedAt, endedAt, notes } = req.body;
    await pool.query(
      'INSERT INTO focus_sessions (id,user_key,date,task_id,project_id,label,duration_minutes,actual_minutes,status,mode,started_at,ended_at,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
      [id, user_key, date, taskId ?? null, projectId ?? null, label, durationMinutes, actualMinutes ?? null, status, mode, startedAt, endedAt ?? null, notes ?? null]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getFocusStreak(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM focus_streak WHERE user_key=$1', [user_key]);
    if (result.rows.length === 0) return res.json(null);
    const r = result.rows[0];
    res.json({
      currentStreak: r.current_streak, longestStreak: r.longest_streak,
      lastFocusDate: r.last_focus_date ?? '', totalSessionsAllTime: r.total_sessions_all_time,
      totalMinutesAllTime: r.total_minutes_all_time,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function upsertFocusStreak(req, res) {
  try {
    const { user_key, currentStreak, longestStreak, lastFocusDate, totalSessionsAllTime, totalMinutesAllTime } = req.body;
    await pool.query(
      `INSERT INTO focus_streak (user_key,current_streak,longest_streak,last_focus_date,total_sessions_all_time,total_minutes_all_time,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,now())
       ON CONFLICT (user_key) DO UPDATE SET current_streak=$2,longest_streak=$3,last_focus_date=$4,total_sessions_all_time=$5,total_minutes_all_time=$6,updated_at=now()`,
      [user_key, currentStreak, longestStreak, lastFocusDate, totalSessionsAllTime, totalMinutesAllTime]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

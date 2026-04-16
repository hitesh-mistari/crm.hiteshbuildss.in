import pool from '../config/db.js';

export async function getWeeklyReviews(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM weekly_reviews WHERE user_key=$1 ORDER BY week_start_date DESC', [user_key]);
    res.json(result.rows.map((r) => ({
      id: r.id, weekStartDate: r.week_start_date, weekNumber: r.week_number, year: r.year,
      tasksCompleted: r.tasks_completed, focusMinutes: r.focus_minutes, revenueEarned: Number(r.revenue_earned),
      goalsAchieved: r.goals_achieved, wins: r.wins ?? '', challenges: r.challenges ?? '',
      lessons: r.lessons ?? '', oneThing: r.one_thing ?? '', energyLevel: r.energy_level,
      focusScore: r.focus_score, completedAt: r.completed_at ?? undefined, createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function upsertWeeklyReview(req, res) {
  try {
    const { id, user_key, weekStartDate, weekNumber, year, tasksCompleted, focusMinutes, revenueEarned, goalsAchieved, wins, challenges, lessons, oneThing, energyLevel, focusScore, completedAt, createdAt } = req.body;
    await pool.query(
      `INSERT INTO weekly_reviews (id,user_key,week_start_date,week_number,year,tasks_completed,focus_minutes,revenue_earned,goals_achieved,wins,challenges,lessons,one_thing,energy_level,focus_score,completed_at,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (id) DO UPDATE SET week_start_date=$3,week_number=$4,year=$5,tasks_completed=$6,focus_minutes=$7,revenue_earned=$8,goals_achieved=$9,wins=$10,challenges=$11,lessons=$12,one_thing=$13,energy_level=$14,focus_score=$15,completed_at=$16`,
      [id, user_key, weekStartDate, weekNumber, year, tasksCompleted, focusMinutes, revenueEarned, goalsAchieved, wins, challenges, lessons, oneThing, energyLevel, focusScore, completedAt ?? null, createdAt]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getOneThing(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM one_thing WHERE user_key=$1', [user_key]);
    if (result.rows.length === 0) return res.json(null);
    res.json({ text: result.rows[0].text, date: result.rows[0].date });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function upsertOneThing(req, res) {
  try {
    const { user_key, text, date } = req.body;
    await pool.query(
      `INSERT INTO one_thing (user_key, text, date, updated_at) VALUES ($1,$2,$3,now())
       ON CONFLICT (user_key) DO UPDATE SET text=$2, date=$3, updated_at=now()`,
      [user_key, text, date]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

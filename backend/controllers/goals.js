import pool from '../config/db.js';

export async function getGoals(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM goals WHERE user_key=$1 ORDER BY created_at DESC', [user_key]);
    res.json(result.rows.map((r) => ({
      id: r.id, title: r.title, target: Number(r.target), current: Number(r.current),
      unit: r.unit, period: r.period, linkedTaskIds: r.linked_task_ids ?? [], createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createGoal(req, res) {
  try {
    const { id, user_key, title, target, current, unit, period, linkedTaskIds, createdAt } = req.body;
    await pool.query(
      'INSERT INTO goals (id,user_key,title,target,current,unit,period,linked_task_ids,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [id, user_key, title, target, current, unit, period, JSON.stringify(linkedTaskIds ?? []), createdAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateGoal(req, res) {
  try {
    const { id } = req.params;
    const { user_key, title, target, current, unit, period, linkedTaskIds } = req.body;
    const fields = [];
    const vals = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title=$${idx++}`); vals.push(title); }
    if (target !== undefined) { fields.push(`target=$${idx++}`); vals.push(target); }
    if (current !== undefined) { fields.push(`current=$${idx++}`); vals.push(current); }
    if (unit !== undefined) { fields.push(`unit=$${idx++}`); vals.push(unit); }
    if (period !== undefined) { fields.push(`period=$${idx++}`); vals.push(period); }
    if (linkedTaskIds !== undefined) { fields.push(`linked_task_ids=$${idx++}`); vals.push(JSON.stringify(linkedTaskIds)); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(id); vals.push(user_key);
    await pool.query(`UPDATE goals SET ${fields.join(',')} WHERE id=$${idx++} AND user_key=$${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteGoal(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM goals WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

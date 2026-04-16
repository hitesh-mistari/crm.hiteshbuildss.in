import pool from '../config/db.js';

export async function getIdeas(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM ideas WHERE user_key=$1 ORDER BY created_at DESC', [user_key]);
    res.json(result.rows.map((r) => ({
      id: r.id, title: r.title, stage: r.stage, tags: r.tags ?? [], notes: r.notes ?? '', createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createIdea(req, res) {
  try {
    const { id, user_key, title, stage, tags, notes, createdAt } = req.body;
    await pool.query(
      'INSERT INTO ideas (id,user_key,title,stage,tags,notes,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, user_key, title, stage, JSON.stringify(tags ?? []), notes ?? '', createdAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateIdea(req, res) {
  try {
    const { id } = req.params;
    const { user_key, title, stage, tags, notes } = req.body;
    const fields = [];
    const vals = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title=$${idx++}`); vals.push(title); }
    if (stage !== undefined) { fields.push(`stage=$${idx++}`); vals.push(stage); }
    if (tags !== undefined) { fields.push(`tags=$${idx++}`); vals.push(JSON.stringify(tags)); }
    if (notes !== undefined) { fields.push(`notes=$${idx++}`); vals.push(notes); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(id); vals.push(user_key);
    await pool.query(`UPDATE ideas SET ${fields.join(',')} WHERE id=$${idx++} AND user_key=$${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteIdea(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM ideas WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

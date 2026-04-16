import pool from '../config/db.js';

export async function getInboxItems(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM inbox_items WHERE user_key=$1 ORDER BY created_at DESC', [user_key]);
    res.json(result.rows.map((r) => ({
      id: r.id, type: r.type, content: r.content, status: r.status,
      processedAs: r.processed_as, processedId: r.processed_id ?? '',
      createdAt: r.created_at, snoozedUntil: r.snoozed_until ?? '',
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createInboxItem(req, res) {
  try {
    const { id, user_key, type, content, status, processedAs, processedId, snoozedUntil, createdAt } = req.body;
    await pool.query(
      'INSERT INTO inbox_items (id,user_key,type,content,status,processed_as,processed_id,snoozed_until,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [id, user_key, type, content, status, processedAs ?? null, processedId ?? '', snoozedUntil ?? '', createdAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateInboxItem(req, res) {
  try {
    const { id } = req.params;
    const { user_key, status, processedAs, processedId, snoozedUntil } = req.body;
    const fields = [];
    const vals = [];
    let idx = 1;
    if (status !== undefined) { fields.push(`status=$${idx++}`); vals.push(status); }
    if (processedAs !== undefined) { fields.push(`processed_as=$${idx++}`); vals.push(processedAs); }
    if (processedId !== undefined) { fields.push(`processed_id=$${idx++}`); vals.push(processedId); }
    if (snoozedUntil !== undefined) { fields.push(`snoozed_until=$${idx++}`); vals.push(snoozedUntil); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(id); vals.push(user_key);
    await pool.query(`UPDATE inbox_items SET ${fields.join(',')} WHERE id=$${idx++} AND user_key=$${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteInboxItem(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM inbox_items WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

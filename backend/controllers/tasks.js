import pool from '../config/db.js';

export async function getTasks(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query(
      'SELECT * FROM tasks WHERE user_key=$1 ORDER BY created_at DESC', [user_key]
    );
    res.json(result.rows.map((r) => ({
      id: r.id, title: r.title, status: r.status, priority: r.priority,
      dueDate: r.due_date ?? '', assignedTo: r.assigned_to ?? '',
      description: r.description ?? '', createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createTask(req, res) {
  try {
    const { id, user_key, title, status, priority, dueDate, assignedTo, description, createdAt } = req.body;
    await pool.query(
      'INSERT INTO tasks (id,user_key,title,status,priority,due_date,assigned_to,description,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
      [id, user_key, title, status, priority, dueDate ?? '', assignedTo ?? '', description ?? '', createdAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { user_key, title, status, priority, dueDate, assignedTo, description } = req.body;
    const fields = [];
    const vals = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title=$${idx++}`); vals.push(title); }
    if (status !== undefined) { fields.push(`status=$${idx++}`); vals.push(status); }
    if (priority !== undefined) { fields.push(`priority=$${idx++}`); vals.push(priority); }
    if (dueDate !== undefined) { fields.push(`due_date=$${idx++}`); vals.push(dueDate); }
    if (assignedTo !== undefined) { fields.push(`assigned_to=$${idx++}`); vals.push(assignedTo); }
    if (description !== undefined) { fields.push(`description=$${idx++}`); vals.push(description); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(id); vals.push(user_key);
    await pool.query(`UPDATE tasks SET ${fields.join(',')} WHERE id=$${idx++} AND user_key=$${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM tasks WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

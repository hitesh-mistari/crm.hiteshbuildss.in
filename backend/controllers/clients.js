import pool from '../config/db.js';

export async function getClients(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM clients WHERE user_key=$1 ORDER BY created_at DESC', [user_key]);
    res.json(result.rows.map((r) => ({
      id: r.id, name: r.name, company: r.company ?? '', project: r.project ?? '',
      totalAmount: Number(r.total_amount), paidAmount: Number(r.paid_amount),
      email: r.email ?? '', phone: r.phone ?? '', notes: r.notes ?? '',
      projectProgress: r.project_progress ?? 0, payments: r.payments ?? [], createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createClient(req, res) {
  try {
    const { id, user_key, name, company, project, totalAmount, paidAmount, email, phone, notes, projectProgress, payments, createdAt } = req.body;
    await pool.query(
      'INSERT INTO clients (id,user_key,name,company,project,total_amount,paid_amount,email,phone,notes,project_progress,payments,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
      [id, user_key, name, company ?? '', project ?? '', totalAmount, paidAmount, email ?? '', phone ?? '', notes ?? '', projectProgress ?? 0, JSON.stringify(payments ?? []), createdAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateClient(req, res) {
  try {
    const { id } = req.params;
    const { user_key, name, company, project, totalAmount, paidAmount, email, phone, notes, projectProgress, payments } = req.body;
    const fields = [];
    const vals = [];
    let idx = 1;
    if (name !== undefined) { fields.push(`name=$${idx++}`); vals.push(name); }
    if (company !== undefined) { fields.push(`company=$${idx++}`); vals.push(company); }
    if (project !== undefined) { fields.push(`project=$${idx++}`); vals.push(project); }
    if (totalAmount !== undefined) { fields.push(`total_amount=$${idx++}`); vals.push(totalAmount); }
    if (paidAmount !== undefined) { fields.push(`paid_amount=$${idx++}`); vals.push(paidAmount); }
    if (email !== undefined) { fields.push(`email=$${idx++}`); vals.push(email); }
    if (phone !== undefined) { fields.push(`phone=$${idx++}`); vals.push(phone); }
    if (notes !== undefined) { fields.push(`notes=$${idx++}`); vals.push(notes); }
    if (projectProgress !== undefined) { fields.push(`project_progress=$${idx++}`); vals.push(projectProgress); }
    if (payments !== undefined) { fields.push(`payments=$${idx++}`); vals.push(JSON.stringify(payments)); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(id); vals.push(user_key);
    await pool.query(`UPDATE clients SET ${fields.join(',')} WHERE id=$${idx++} AND user_key=$${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteClient(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM clients WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

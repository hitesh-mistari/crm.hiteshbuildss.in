import pool from '../config/db.js';

export async function getTransactions(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query(
      'SELECT * FROM transactions WHERE user_key=$1 ORDER BY created_at DESC', [user_key]
    );
    res.json(result.rows.map((r) => ({
      id: r.id, title: r.title, type: r.type, amount: Number(r.amount),
      date: r.date, category: r.category, notes: r.notes ?? '', client: r.client ?? '',
      expenseType: r.expense_type || 'fixed',
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createTransaction(req, res) {
  try {
    const { id, user_key, title, type, amount, date, category, notes, client, expenseType } = req.body;
    await pool.query(
      'INSERT INTO transactions (id,user_key,title,type,amount,date,category,notes,client,expense_type) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [id, user_key, title, type, amount, date, category, notes ?? '', client ?? '', expenseType || 'fixed']
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const { user_key, title, type, amount, date, category, notes, client, expenseType } = req.body;
    const fields = [];
    const vals = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title=$${idx++}`); vals.push(title); }
    if (type !== undefined) { fields.push(`type=$${idx++}`); vals.push(type); }
    if (amount !== undefined) { fields.push(`amount=$${idx++}`); vals.push(amount); }
    if (date !== undefined) { fields.push(`date=$${idx++}`); vals.push(date); }
    if (category !== undefined) { fields.push(`category=$${idx++}`); vals.push(category); }
    if (notes !== undefined) { fields.push(`notes=$${idx++}`); vals.push(notes); }
    if (client !== undefined) { fields.push(`client=$${idx++}`); vals.push(client); }
    if (expenseType !== undefined) { fields.push(`expense_type=$${idx++}`); vals.push(expenseType); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(id); vals.push(user_key);
    await pool.query(`UPDATE transactions SET ${fields.join(',')} WHERE id=$${idx++} AND user_key=$${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM transactions WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

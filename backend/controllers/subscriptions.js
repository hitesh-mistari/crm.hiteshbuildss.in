import pool from '../config/db.js';

export const getSubscriptions = async (req, res) => {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key is required' });
    const { rows } = await pool.query('SELECT * FROM subscriptions WHERE user_key = $1 ORDER BY created_at DESC', [user_key]);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const processed = [];
    for (const sub of rows) {
      let currentSub = { ...sub, amount: parseFloat(sub.amount) };
      let endDate = new Date(sub.end_date);
      endDate.setHours(0, 0, 0, 0);

      // Auto-renew logic: if expired and auto_renew is true, push date forward
      if (endDate < today && sub.auto_renew) {
        let newStartDate = new Date(sub.end_date);
        let newEndDate = new Date(sub.end_date);
        
        while (newEndDate < today) {
          if (sub.billing_cycle === 'monthly') {
            newEndDate.setMonth(newEndDate.getMonth() + 1);
          } else {
            newEndDate.setFullYear(newEndDate.getFullYear() + 1);
          }
        }

        // Update in database
        await pool.query(
          'UPDATE subscriptions SET start_date = $1, end_date = $2 WHERE id = $3 AND user_key = $4',
          [newStartDate.toISOString().split('T')[0], newEndDate.toISOString().split('T')[0], sub.id, user_key]
        );
        
        currentSub.start_date = newStartDate.toISOString().split('T')[0];
        currentSub.end_date = newEndDate.toISOString().split('T')[0];
      }
      processed.push(currentSub);
    }
    res.json(processed);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { id, user_key, name, amount, billing_cycle, start_date, end_date, reminder_days, auto_renew, status } = req.body;
    await pool.query(
      `INSERT INTO subscriptions (id, user_key, name, amount, billing_cycle, start_date, end_date, reminder_days, auto_renew, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [id, user_key, name, amount, billing_cycle, start_date, end_date, reminder_days || 5, auto_renew || false, status || 'active']
    );
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_key, name, amount, billing_cycle, start_date, end_date, reminder_days, auto_renew, status } = req.body;
    
    const fields = [];
    const values = [];
    let i = 1;
    
    if (name !== undefined) { fields.push(`name = $${i++}`); values.push(name); }
    if (amount !== undefined) { fields.push(`amount = $${i++}`); values.push(amount); }
    if (billing_cycle !== undefined) { fields.push(`billing_cycle = $${i++}`); values.push(billing_cycle); }
    if (start_date !== undefined) { fields.push(`start_date = $${i++}`); values.push(start_date); }
    if (end_date !== undefined) { fields.push(`end_date = $${i++}`); values.push(end_date); }
    if (reminder_days !== undefined) { fields.push(`reminder_days = $${i++}`); values.push(reminder_days); }
    if (auto_renew !== undefined) { fields.push(`auto_renew = $${i++}`); values.push(auto_renew); }
    if (status !== undefined) { fields.push(`status = $${i++}`); values.push(status); }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    
    const query = `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = $${i} AND user_key = $${i+1}`;
    values.push(id);
    values.push(user_key);
    await pool.query(query, values);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM subscriptions WHERE id = $1 AND user_key = $2', [id, user_key]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import pool from '../config/db.js';

export async function getSettings(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM app_settings WHERE user_key = $1', [user_key]);
    if (result.rows.length === 0) return res.json(null);
    const r = result.rows[0];
    res.json({
      founderName: r.founder_name,
      currency: r.currency,
      darkMode: r.dark_mode,
      lowBalanceThreshold: Number(r.low_balance_threshold),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function upsertSettings(req, res) {
  try {
    const { user_key, founderName, currency, darkMode, lowBalanceThreshold } = req.body;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    await pool.query(
      `INSERT INTO app_settings (user_key, founder_name, currency, dark_mode, low_balance_threshold, updated_at)
       VALUES ($1,$2,$3,$4,$5,now())
       ON CONFLICT (user_key) DO UPDATE SET
         founder_name=$2, currency=$3, dark_mode=$4, low_balance_threshold=$5, updated_at=now()`,
      [user_key, founderName, currency, darkMode, lowBalanceThreshold]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.get('/keys', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT user_key, COUNT(*) as count 
      FROM projects 
      GROUP BY user_key 
      HAVING COUNT(*) > 0
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

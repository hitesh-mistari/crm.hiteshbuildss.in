import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

async function checkData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  });

  try {
    const res = await pool.query('SELECT DISTINCT user_key FROM transactions LIMIT 10');
    console.log('User Keys found in transactions:', res.rows.map(r => r.user_key));
    
    const count = await pool.query('SELECT COUNT(*) FROM transactions');
    console.log('Total transactions:', count.rows[0].count);

    const projectCount = await pool.query('SELECT COUNT(*) FROM projects');
    console.log('Total projects:', projectCount.rows[0].count);

    const taskCount = await pool.query('SELECT COUNT(*) FROM tasks');
    console.log('Total tasks:', taskCount.rows[0].count);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

checkData();

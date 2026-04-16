import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgres://postgres:kTIBvuz0ZH545BmqWeNZIaf6w07qQwyUXKWlbew8eae3bxHTDwpnaUKnywce8b4N@46.202.164.5:5422/postgres',
  ssl: false
});

async function alterTable() {
  const client = await pool.connect();
  try {
    await client.query(`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS expense_type TEXT DEFAULT 'fixed'`);
    console.log('Altered table transactions successfully');
  } catch(err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

alterTable();

import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgres://postgres:kTIBvuz0ZH545BmqWeNZIaf6w07qQwyUXKWlbew8eae3bxHTDwpnaUKnywce8b4N@46.202.164.5:5422/postgres',
  ssl: false
});

async function wipe() {
  const client = await pool.connect();
  try {
    const tables = [
      'transactions', 'subscriptions', 'tasks', 'goals', 'ideas', 'clients', 
      'team_members', 'projects', 'project_tasks', 'project_notes', 
      'project_links', 'project_members', 'focus_sessions', 'weekly_reviews', 'inbox_items'
    ];

    console.log('Wiping all data from database...');
    for (const table of tables) {
      try {
        await client.query(`DELETE FROM ${table}`);
        console.log(`- Cleared ${table}`);
      } catch (e) {
        console.log(`- Skipping ${table} (might not exist or already empty)`);
      }
    }
    console.log('All data wiped successfully!');
  } catch (err) {
    console.error('Error wiping data:', err);
  } finally {
    client.release();
    pool.end();
  }
}

wipe();

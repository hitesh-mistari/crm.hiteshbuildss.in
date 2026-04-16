import pool from './db.js';

export async function initSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        name TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        billing_cycle TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        reminder_days INTEGER DEFAULT 5,
        auto_renew BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS app_settings (
        user_key TEXT PRIMARY KEY,
        founder_name TEXT NOT NULL DEFAULT 'Founder',
        currency TEXT NOT NULL DEFAULT '₹',
        dark_mode BOOLEAN NOT NULL DEFAULT false,
        low_balance_threshold NUMERIC NOT NULL DEFAULT 10000,
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT '',
        expense_type TEXT DEFAULT 'fixed',
        notes TEXT DEFAULT '',
        client TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT NOT NULL DEFAULT 'medium',
        due_date TEXT DEFAULT '',
        assigned_to TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        title TEXT NOT NULL,
        target NUMERIC NOT NULL DEFAULT 0,
        current NUMERIC NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT '',
        period TEXT NOT NULL DEFAULT 'monthly',
        linked_task_ids JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS ideas (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        title TEXT NOT NULL,
        stage TEXT NOT NULL DEFAULT 'idea',
        tags JSONB DEFAULT '[]',
        notes TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        name TEXT NOT NULL,
        company TEXT DEFAULT '',
        project TEXT DEFAULT '',
        total_amount NUMERIC NOT NULL DEFAULT 0,
        paid_amount NUMERIC NOT NULL DEFAULT 0,
        email TEXT DEFAULT '',
        phone TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        project_progress NUMERIC DEFAULT 0,
        payments JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS team_members (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT '',
        email TEXT DEFAULT '',
        joined_at TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS inbox_items (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        processed_as TEXT,
        processed_id TEXT DEFAULT '',
        snoozed_until TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active',
        priority TEXT NOT NULL DEFAULT 'medium',
        cover_color TEXT DEFAULT 'blue',
        emoji TEXT DEFAULT '🚀',
        start_date TEXT,
        target_date TEXT,
        owner_id TEXT,
        linked_idea_id TEXT,
        linked_client_id TEXT,
        tags JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS project_tasks (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT NOT NULL DEFAULT 'medium',
        assigned_to TEXT DEFAULT '',
        due_date TEXT,
        description TEXT DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS project_notes (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        project_id TEXT NOT NULL,
        section_id TEXT NOT NULL DEFAULT 'overview',
        title TEXT NOT NULL,
        content TEXT DEFAULT '',
        author_id TEXT,
        is_pinned BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS project_links (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT NOT NULL DEFAULT 'other',
        added_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS project_members (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        project_id TEXT NOT NULL,
        user_id TEXT,
        team_member_id TEXT,
        role TEXT NOT NULL DEFAULT 'viewer',
        joined_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS focus_sessions (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        date TEXT NOT NULL,
        task_id TEXT,
        project_id TEXT,
        label TEXT NOT NULL,
        duration_minutes INT NOT NULL,
        actual_minutes INT,
        status TEXT NOT NULL DEFAULT 'completed',
        mode TEXT NOT NULL DEFAULT 'deep',
        started_at TIMESTAMPTZ DEFAULT now(),
        ended_at TIMESTAMPTZ,
        notes TEXT
      );

      CREATE TABLE IF NOT EXISTS focus_streak (
        user_key TEXT PRIMARY KEY,
        current_streak INT NOT NULL DEFAULT 0,
        longest_streak INT NOT NULL DEFAULT 0,
        last_focus_date TEXT DEFAULT '',
        total_sessions_all_time INT NOT NULL DEFAULT 0,
        total_minutes_all_time INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS weekly_reviews (
        id TEXT PRIMARY KEY,
        user_key TEXT NOT NULL,
        week_start_date TEXT NOT NULL,
        week_number INT NOT NULL,
        year INT NOT NULL,
        tasks_completed INT NOT NULL DEFAULT 0,
        focus_minutes INT NOT NULL DEFAULT 0,
        revenue_earned NUMERIC NOT NULL DEFAULT 0,
        goals_achieved INT NOT NULL DEFAULT 0,
        wins TEXT DEFAULT '',
        challenges TEXT DEFAULT '',
        lessons TEXT DEFAULT '',
        one_thing TEXT DEFAULT '',
        energy_level TEXT,
        focus_score TEXT,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS one_thing (
        user_key TEXT PRIMARY KEY,
        text TEXT NOT NULL DEFAULT '',
        date TEXT NOT NULL DEFAULT '',
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('Database schema initialized');
  } finally {
    client.release();
  }
}

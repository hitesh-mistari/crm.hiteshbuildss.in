import pool from '../config/db.js';

export async function getTeamMembers(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM team_members WHERE user_key=$1 ORDER BY created_at DESC', [user_key]);
    res.json(result.rows.map((r) => ({
      id: r.id, name: r.name, role: r.role, email: r.email ?? '', joinedAt: r.joined_at ?? '',
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createTeamMember(req, res) {
  try {
    const { id, user_key, name, role, email, joinedAt } = req.body;
    await pool.query(
      'INSERT INTO team_members (id,user_key,name,role,email,joined_at) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, user_key, name, role, email ?? '', joinedAt ?? '']
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteTeamMember(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM team_members WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

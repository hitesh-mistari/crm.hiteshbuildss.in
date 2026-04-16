import pool from '../config/db.js';

export async function getProjects(req, res) {
  try {
    const { user_key } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    const result = await pool.query('SELECT * FROM projects WHERE user_key=$1 ORDER BY created_at DESC', [user_key]);
    res.json(result.rows.map((r) => ({
      id: r.id, title: r.title, description: r.description ?? '', status: r.status,
      priority: r.priority, coverColor: r.cover_color ?? 'blue', emoji: r.emoji ?? '🚀',
      startDate: r.start_date ?? '', targetDate: r.target_date ?? '', ownerId: r.owner_id ?? '',
      linkedIdeaId: r.linked_idea_id ?? undefined, linkedClientId: r.linked_client_id ?? undefined,
      tags: r.tags ?? [], createdAt: r.created_at, updatedAt: r.updated_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createProject(req, res) {
  try {
    const { id, user_key, title, description, status, priority, coverColor, emoji, startDate, targetDate, ownerId, linkedIdeaId, linkedClientId, tags, createdAt, updatedAt } = req.body;
    await pool.query(
      `INSERT INTO projects (id,user_key,title,description,status,priority,cover_color,emoji,start_date,target_date,owner_id,linked_idea_id,linked_client_id,tags,created_at,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [id, user_key, title, description ?? '', status, priority, coverColor ?? 'blue', emoji ?? '🚀',
       startDate || null, targetDate || null, ownerId, linkedIdeaId ?? null, linkedClientId ?? null,
       JSON.stringify(tags ?? []), createdAt, updatedAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { user_key, title, description, status, priority, coverColor, emoji, startDate, targetDate, tags, linkedIdeaId, linkedClientId } = req.body;
    const fields = [`updated_at=now()`];
    const vals = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title=$${idx++}`); vals.push(title); }
    if (description !== undefined) { fields.push(`description=$${idx++}`); vals.push(description); }
    if (status !== undefined) { fields.push(`status=$${idx++}`); vals.push(status); }
    if (priority !== undefined) { fields.push(`priority=$${idx++}`); vals.push(priority); }
    if (coverColor !== undefined) { fields.push(`cover_color=$${idx++}`); vals.push(coverColor); }
    if (emoji !== undefined) { fields.push(`emoji=$${idx++}`); vals.push(emoji); }
    if (startDate !== undefined) { fields.push(`start_date=$${idx++}`); vals.push(startDate || null); }
    if (targetDate !== undefined) { fields.push(`target_date=$${idx++}`); vals.push(targetDate || null); }
    if (tags !== undefined) { fields.push(`tags=$${idx++}`); vals.push(JSON.stringify(tags)); }
    if (linkedIdeaId !== undefined) { fields.push(`linked_idea_id=$${idx++}`); vals.push(linkedIdeaId); }
    if (linkedClientId !== undefined) { fields.push(`linked_client_id=$${idx++}`); vals.push(linkedClientId); }
    vals.push(id); vals.push(user_key);
    await pool.query(`UPDATE projects SET ${fields.join(',')} WHERE id=$${idx++} AND user_key=$${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM projects WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProjectTasks(req, res) {
  try {
    const { user_key, project_id } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    let q = 'SELECT * FROM project_tasks WHERE user_key=$1';
    const vals = [user_key];
    if (project_id) { q += ' AND project_id=$2'; vals.push(project_id); }
    q += ' ORDER BY created_at DESC';
    const result = await pool.query(q, vals);
    res.json(result.rows.map((r) => ({
      id: r.id, projectId: r.project_id, title: r.title, status: r.status, priority: r.priority,
      assignedTo: r.assigned_to ?? '', dueDate: r.due_date ?? '', description: r.description ?? '', createdAt: r.created_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createProjectTask(req, res) {
  try {
    const { id, user_key, projectId, title, status, priority, assignedTo, dueDate, description, createdAt } = req.body;
    await pool.query(
      'INSERT INTO project_tasks (id,user_key,project_id,title,status,priority,assigned_to,due_date,description,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [id, user_key, projectId, title, status, priority, assignedTo ?? '', dueDate ?? null, description ?? '', createdAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProjectTask(req, res) {
  try {
    const { id } = req.params;
    const { user_key, title, status, priority, assignedTo, dueDate, description } = req.body;
    const fields = [];
    const vals = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title=$${idx++}`); vals.push(title); }
    if (status !== undefined) { fields.push(`status=$${idx++}`); vals.push(status); }
    if (priority !== undefined) { fields.push(`priority=$${idx++}`); vals.push(priority); }
    if (assignedTo !== undefined) { fields.push(`assigned_to=$${idx++}`); vals.push(assignedTo); }
    if (dueDate !== undefined) { fields.push(`due_date=$${idx++}`); vals.push(dueDate || null); }
    if (description !== undefined) { fields.push(`description=$${idx++}`); vals.push(description); }
    if (!fields.length) return res.json({ ok: true });
    vals.push(id); vals.push(user_key);
    await pool.query(`UPDATE project_tasks SET ${fields.join(',')} WHERE id=$${idx++} AND user_key=$${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteProjectTask(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM project_tasks WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProjectNotes(req, res) {
  try {
    const { user_key, project_id } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    let q = 'SELECT * FROM project_notes WHERE user_key=$1';
    const vals = [user_key];
    if (project_id) { q += ' AND project_id=$2'; vals.push(project_id); }
    q += ' ORDER BY created_at DESC';
    const result = await pool.query(q, vals);
    res.json(result.rows.map((r) => ({
      id: r.id, projectId: r.project_id, sectionId: r.section_id, title: r.title,
      content: r.content ?? '', authorId: r.author_id ?? '', isPinned: r.is_pinned ?? false,
      createdAt: r.created_at, updatedAt: r.updated_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createProjectNote(req, res) {
  try {
    const { id, user_key, projectId, sectionId, title, content, authorId, isPinned, createdAt, updatedAt } = req.body;
    await pool.query(
      'INSERT INTO project_notes (id,user_key,project_id,section_id,title,content,author_id,is_pinned,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',
      [id, user_key, projectId, sectionId, title, content ?? '', authorId, isPinned ?? false, createdAt, updatedAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function updateProjectNote(req, res) {
  try {
    const { id } = req.params;
    const { user_key, title, content, isPinned, sectionId } = req.body;
    const fields = [`updated_at=now()`];
    const vals = [];
    let idx = 1;
    if (title !== undefined) { fields.push(`title=$${idx++}`); vals.push(title); }
    if (content !== undefined) { fields.push(`content=$${idx++}`); vals.push(content); }
    if (isPinned !== undefined) { fields.push(`is_pinned=$${idx++}`); vals.push(isPinned); }
    if (sectionId !== undefined) { fields.push(`section_id=$${idx++}`); vals.push(sectionId); }
    vals.push(id); vals.push(user_key);
    await pool.query(`UPDATE project_notes SET ${fields.join(',')} WHERE id=$${idx++} AND user_key=$${idx}`, vals);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteProjectNote(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM project_notes WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProjectLinks(req, res) {
  try {
    const { user_key, project_id } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    let q = 'SELECT * FROM project_links WHERE user_key=$1';
    const vals = [user_key];
    if (project_id) { q += ' AND project_id=$2'; vals.push(project_id); }
    q += ' ORDER BY added_at DESC';
    const result = await pool.query(q, vals);
    res.json(result.rows.map((r) => ({
      id: r.id, projectId: r.project_id, title: r.title, url: r.url, category: r.category, addedAt: r.added_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createProjectLink(req, res) {
  try {
    const { id, user_key, projectId, title, url, category, addedAt } = req.body;
    await pool.query(
      'INSERT INTO project_links (id,user_key,project_id,title,url,category,added_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, user_key, projectId, title, url, category, addedAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteProjectLink(req, res) {
  try {
    const { id } = req.params;
    const { user_key } = req.query;
    await pool.query('DELETE FROM project_links WHERE id=$1 AND user_key=$2', [id, user_key]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProjectMembers(req, res) {
  try {
    const { user_key, project_id } = req.query;
    if (!user_key) return res.status(400).json({ error: 'user_key required' });
    let q = 'SELECT * FROM project_members WHERE user_key=$1';
    const vals = [user_key];
    if (project_id) { q += ' AND project_id=$2'; vals.push(project_id); }
    const result = await pool.query(q, vals);
    res.json(result.rows.map((r) => ({
      id: r.id, projectId: r.project_id, userId: r.user_id ?? '', teamMemberId: r.team_member_id ?? undefined,
      role: r.role, joinedAt: r.joined_at,
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createProjectMember(req, res) {
  try {
    const { id, user_key, projectId, userId, teamMemberId, role, joinedAt } = req.body;
    await pool.query(
      'INSERT INTO project_members (id,user_key,project_id,user_id,team_member_id,role,joined_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [id, user_key, projectId, userId, teamMemberId ?? null, role, joinedAt]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function deleteProjectMember(req, res) {
  try {
    const { project_id, team_member_id, user_key } = req.query;
    await pool.query(
      'DELETE FROM project_members WHERE project_id=$1 AND team_member_id=$2 AND user_key=$3',
      [project_id, team_member_id, user_key]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

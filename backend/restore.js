import pg from 'pg';

const pool = new pg.Pool({
  connectionString: 'postgres://postgres:kTIBvuz0ZH545BmqWeNZIaf6w07qQwyUXKWlbew8eae3bxHTDwpnaUKnywce8b4N@46.202.164.5:5422/postgres',
  ssl: false
});

const USER_KEY = '8b59eb2c-98ff-44da-9a73-9b31d8ef6a4a';
const d = (offset) => new Date(Date.now() + offset * 86400000).toISOString().split('T')[0];

const goals = [
  { id: 'g1', title: 'Close 2 New Clients', target: 2, current: 0, unit: 'clients', period: 'Week 1', createdAt: d(-30) },
  { id: 'g2', title: 'Launch 5 Tools', target: 5, current: 5, unit: 'tools', period: 'Week 2', createdAt: d(-30) },
  { id: 'g3', title: 'Reach ₹30k Revenue', target: 30000, current: 18000, unit: '₹', period: 'Week 3', createdAt: d(-1) },
  { id: 'g4', title: 'Publish 3 Blog Posts', target: 3, current: 2, unit: 'posts', period: 'Week 4', createdAt: d(-1) },
];

const ideas = [
  { id: 'i1', title: 'AI SaaS Concept', stage: 'idea', tags: ['saas'], notes: 'AI-powered analytics dashboard for SMBs. Could replace 3 tools in one.', createdAt: d(-1) },
  { id: 'i2', title: 'New eBook Topic', stage: 'idea', tags: ['content'], notes: 'Solo founder playbook — 0 to ₹1L/month guide', createdAt: d(-2) },
  { id: 'i3', title: 'IPL Prediction Site', stage: 'building', tags: ['tool'], notes: 'ML-based prediction engine. 70% accuracy currently.', createdAt: d(-30) },
  { id: 'i4', title: '300 Tools Project', stage: 'building', tags: ['tool', 'saas'], notes: 'Curated directory of startup tools. Monetize via affiliate.', createdAt: d(-30) },
  { id: 'i5', title: 'Product Hunt Launch', stage: 'launched', tags: ['saas'], notes: 'Analytics SaaS. Got #3 Product of the Day!', createdAt: d(-30) },
  { id: 'i6', title: 'SEO Dashboard', stage: 'launched', tags: ['tool'], notes: 'Real-time SEO tracking. 200 active users.', createdAt: d(-30) },
  { id: 'i7', title: 'Client Portal App', stage: 'planning', tags: ['client'], notes: 'Self-serve client portal. Reduce support queries by 60%.', createdAt: d(-1) },
];

const clients = [
  {
    id: 'c1', name: 'Arjun Sharma', company: 'TechCorp', project: 'Website Redesign',
    totalAmount: 15000, paidAmount: 15000,
    email: 'arjun@techcorp.in', phone: '+91 98765 43210', notes: 'Great client, always pays on time.',
    projectProgress: 100,
    payments: [{ id: 'p1', amount: 15000, date: d(-1), note: 'Full payment received' }],
    createdAt: d(-30),
  },
  {
    id: 'c2', name: 'Priya Mehta', company: 'StartupXYZ', project: 'SEO Retainer',
    totalAmount: 20000, paidAmount: 10000,
    email: 'priya@startupxyz.com', phone: '+91 87654 32109', notes: 'Monthly retainer. Invoice on 1st.',
    projectProgress: 60,
    payments: [{ id: 'p2', amount: 10000, date: d(-2), note: 'Month 1' }],
    createdAt: d(-30),
  },
  {
    id: 'c3', name: 'Rahul Gupta', company: 'FinTech Inc', project: 'App Development',
    totalAmount: 40000, paidAmount: 10000,
    email: 'rahul@fintech.io', phone: '+91 76543 21098', notes: 'Milestone-based payment. ₹30k pending.',
    projectProgress: 40,
    payments: [{ id: 'p3', amount: 10000, date: d(-30), note: 'Advance payment' }],
    createdAt: d(-30),
  },
  {
    id: 'c4', name: 'Sneha Patel', company: 'EduStart', project: 'Strategy Consulting',
    totalAmount: 8000, paidAmount: 0,
    email: 'sneha@edustart.in', phone: '+91 65432 10987', notes: 'Follow up urgently. Overdue by 15 days.',
    projectProgress: 80,
    payments: [],
    createdAt: d(-30),
  },
];

const teamMembers = [
  { id: 'tm1', name: 'Vikram Singh', role: 'Frontend Intern', email: 'vikram@intern.com', joinedAt: d(-30) },
  { id: 'tm2', name: 'Ananya Roy', role: 'Marketing Intern', email: 'ananya@intern.com', joinedAt: d(-30) },
];

const projects = [
  {
    id: 'proj1', title: 'TECHCORP REDESIGN', description: 'Transforming the legacy corporate portal into a modern AI-driven platform.',
    status: 'active', priority: 'high', coverColor: 'blue', emoji: '🚀',
    startDate: d(-10), targetDate: d(20), ownerId: 'tm1', linkedClientId: 'c1',
    tags: ['Next.js', 'UI/UX', 'Cloud'], createdAt: d(-10), updatedAt: d(-1),
  },
  {
    id: 'proj2', title: 'STARTUPXYZ SEO', description: 'Scaling organic traffic from 10k to 100k monthly visitors.',
    status: 'active', priority: 'medium', coverColor: 'emerald', emoji: '📈',
    startDate: d(-5), targetDate: d(45), ownerId: 'tm2', linkedClientId: 'c2',
    tags: ['SEO', 'Marketing'], createdAt: d(-5), updatedAt: d(0),
  }
];

const tasks = [
  { id: 'task1', title: 'Landing Page Design', status: 'todo', priority: 'high', dueDate: d(7), assignedTo: 'tm1', description: 'Create new landing page', createdAt: d(-3) },
  { id: 'task2', title: 'Client Research', status: 'todo', priority: 'medium', dueDate: d(14), assignedTo: 'tm2', description: 'Research 10 potential enterprise clients', createdAt: d(-2) },
  { id: 'pt1', projectId: 'proj1', title: 'Architecture Planning', status: 'done', priority: 'high', dueDate: d(-5), createdAt: d(-10) },
  { id: 'pt2', projectId: 'proj1', title: 'API Integration', status: 'inprogress', priority: 'high', dueDate: d(5), createdAt: d(-10) }
];

async function restore() {
  const client = await pool.connect();
  try {
    for (const g of goals) {
      await client.query(`INSERT INTO goals (id, user_key, title, target, current, unit, period, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (id) DO NOTHING`,
        [g.id, USER_KEY, g.title, g.target, g.current, g.unit, g.period, g.createdAt]);
    }
    for (const i of ideas) {
      await client.query(`INSERT INTO ideas (id, user_key, title, stage, tags, notes, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
        [i.id, USER_KEY, i.title, i.stage, JSON.stringify(i.tags || []), i.notes, i.createdAt]);
    }
    for (const c of clients) {
      await client.query(`INSERT INTO clients (id, user_key, name, company, project, total_amount, paid_amount, project_progress, email, phone, notes, payments, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (id) DO NOTHING`,
        [c.id, USER_KEY, c.name, c.company || '', c.project || '', c.totalAmount, c.paidAmount, c.projectProgress || 0, c.email || '', c.phone || '', c.notes || '', JSON.stringify(c.payments || []), c.createdAt]);
    }
    for (const t of teamMembers) {
      await client.query(`INSERT INTO team_members (id, user_key, name, role, email, joined_at) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [t.id, USER_KEY, t.name, t.role, t.email || '', t.joinedAt]);
    }
    for (const p of projects) {
        await client.query(`INSERT INTO projects (id, user_key, title, description, status, priority, cover_color, emoji, start_date, target_date, owner_id, linked_client_id, linked_idea_id, tags, created_at, updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT (id) DO NOTHING`,
          [p.id, USER_KEY, p.title, p.description, p.status, p.priority, p.coverColor, p.emoji, p.startDate, p.targetDate, p.ownerId, p.linkedClientId || null, p.linkedIdeaId || null, JSON.stringify(p.tags || []), p.createdAt, p.updatedAt]);
    }
    for (const t of tasks) {
      if (t.projectId) {
         await client.query(`INSERT INTO project_tasks (id, user_key, project_id, title, status, priority, due_date, assigned_to, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
          [t.id, USER_KEY, t.projectId, t.title, t.status, t.priority, t.dueDate || null, t.assignedTo || null, t.createdAt]);
      } else {
         await client.query(`INSERT INTO tasks (id, user_key, title, description, status, priority, due_date, assigned_to, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO NOTHING`,
          [t.id, USER_KEY, t.title, t.description || '', t.status, t.priority, t.dueDate || null, t.assignedTo || null, t.createdAt]);
      }
    }

    console.log('Restored all data!');
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    pool.end();
  }
}

restore();

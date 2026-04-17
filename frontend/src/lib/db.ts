import {
  Transaction, Task, Goal, Idea, Client, TeamMember,
  Project, ProjectNote, ProjectTask, ProjectMember, ProjectLink,
  FocusSession, FocusStreak, WeeklyReview, InboxItem, AppSettings, OneThing, Subscription,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const OVERRIDE_KEY = import.meta.env.VITE_USER_KEY;

export function getUserKey(): string {
  if (OVERRIDE_KEY) return OVERRIDE_KEY;
  let key = localStorage.getItem('founderos_user_key');
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem('founderos_user_key', key);
  }
  return key;
}

export function setUserKey(key: string) {
  localStorage.setItem('founderos_user_key', key);
  window.location.reload();
}

export async function discoverKeys(): Promise<{ user_key: string, count: number }[]> {
  return api<{ user_key: string, count: number }[]>('/debug/keys');
}

const uk = () => getUserKey();

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ─── SETTINGS ──────────────────────────────────────────────

export async function loadSettings(): Promise<AppSettings | null> {
  return api<AppSettings | null>(`/settings?user_key=${uk()}`);
}

export async function saveSettings(s: AppSettings): Promise<void> {
  await api('/settings', {
    method: 'POST',
    body: JSON.stringify({ user_key: uk(), ...s }),
  });
}

// ─── TRANSACTIONS ───────────────────────────────────────────

export async function loadTransactions(): Promise<Transaction[]> {
  return api<Transaction[]>(`/transactions?user_key=${uk()}`);
}

export async function insertTransaction(t: Transaction): Promise<void> {
  await api('/transactions', { method: 'POST', body: JSON.stringify({ ...t, user_key: uk() }) });
}

export async function patchTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  await api(`/transactions/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeTransaction(id: string): Promise<void> {
  await api(`/transactions/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── SUBSCRIPTIONS ─────────────────────────────────────────

export async function loadSubscriptions(): Promise<Subscription[]> {
  return api<Subscription[]>(`/subscriptions?user_key=${uk()}`);
}

export async function insertSubscription(t: Subscription): Promise<void> {
  await api('/subscriptions', { method: 'POST', body: JSON.stringify({ ...t, user_key: uk() }) });
}

export async function patchSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
  await api(`/subscriptions/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeSubscription(id: string): Promise<void> {
  await api(`/subscriptions/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── TASKS ──────────────────────────────────────────────────

export async function loadTasks(): Promise<Task[]> {
  return api<Task[]>(`/tasks?user_key=${uk()}`);
}

export async function insertTask(t: Task): Promise<void> {
  await api('/tasks', { method: 'POST', body: JSON.stringify({ ...t, user_key: uk() }) });
}

export async function patchTask(id: string, updates: Partial<Task>): Promise<void> {
  await api(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeTask(id: string): Promise<void> {
  await api(`/tasks/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── GOALS ──────────────────────────────────────────────────

export async function loadGoals(): Promise<Goal[]> {
  return api<Goal[]>(`/goals?user_key=${uk()}`);
}

export async function insertGoal(g: Goal): Promise<void> {
  await api('/goals', { method: 'POST', body: JSON.stringify({ ...g, user_key: uk() }) });
}

export async function patchGoal(id: string, updates: Partial<Goal>): Promise<void> {
  await api(`/goals/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeGoal(id: string): Promise<void> {
  await api(`/goals/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── IDEAS ──────────────────────────────────────────────────

export async function loadIdeas(): Promise<Idea[]> {
  return api<Idea[]>(`/ideas?user_key=${uk()}`);
}

export async function insertIdea(i: Idea): Promise<void> {
  await api('/ideas', { method: 'POST', body: JSON.stringify({ ...i, user_key: uk() }) });
}

export async function patchIdea(id: string, updates: Partial<Idea>): Promise<void> {
  await api(`/ideas/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeIdea(id: string): Promise<void> {
  await api(`/ideas/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── CLIENTS ────────────────────────────────────────────────

export async function loadClients(): Promise<Client[]> {
  return api<Client[]>(`/clients?user_key=${uk()}`);
}

export async function insertClient(c: Client): Promise<void> {
  await api('/clients', { method: 'POST', body: JSON.stringify({ ...c, user_key: uk() }) });
}

export async function patchClient(id: string, updates: Partial<Client>): Promise<void> {
  await api(`/clients/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeClient(id: string): Promise<void> {
  await api(`/clients/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── TEAM MEMBERS ───────────────────────────────────────────

export async function loadTeamMembers(): Promise<TeamMember[]> {
  return api<TeamMember[]>(`/team?user_key=${uk()}`);
}

export async function insertTeamMember(m: TeamMember): Promise<void> {
  await api('/team', { method: 'POST', body: JSON.stringify({ ...m, user_key: uk() }) });
}

export async function removeTeamMember(id: string): Promise<void> {
  await api(`/team/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── INBOX ITEMS ─────────────────────────────────────────────

export async function loadInboxItems(): Promise<InboxItem[]> {
  return api<InboxItem[]>(`/inbox?user_key=${uk()}`);
}

export async function insertInboxItem(item: InboxItem): Promise<void> {
  await api('/inbox', { method: 'POST', body: JSON.stringify({ ...item, user_key: uk() }) });
}

export async function patchInboxItem(id: string, updates: Partial<InboxItem>): Promise<void> {
  await api(`/inbox/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeInboxItem(id: string): Promise<void> {
  await api(`/inbox/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── PROJECTS ────────────────────────────────────────────────

export async function loadProjects(): Promise<Project[]> {
  return api<Project[]>(`/projects?user_key=${uk()}`);
}

export async function insertProject(p: Project): Promise<void> {
  await api('/projects', { method: 'POST', body: JSON.stringify({ ...p, user_key: uk() }) });
}

export async function patchProject(id: string, updates: Partial<Project>): Promise<void> {
  await api(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeProject(id: string): Promise<void> {
  await api(`/projects/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── PROJECT TASKS ───────────────────────────────────────────

export async function loadProjectTasks(projectId?: string): Promise<ProjectTask[]> {
  const qs = projectId ? `&project_id=${projectId}` : '';
  return api<ProjectTask[]>(`/projects/tasks?user_key=${uk()}${qs}`);
}

export async function insertProjectTask(t: ProjectTask): Promise<void> {
  await api('/projects/tasks', { method: 'POST', body: JSON.stringify({ ...t, user_key: uk() }) });
}

export async function patchProjectTask(id: string, updates: Partial<ProjectTask>): Promise<void> {
  await api(`/projects/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeProjectTask(id: string): Promise<void> {
  await api(`/projects/tasks/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── PROJECT NOTES ───────────────────────────────────────────

export async function loadProjectNotes(projectId?: string): Promise<ProjectNote[]> {
  const qs = projectId ? `&project_id=${projectId}` : '';
  return api<ProjectNote[]>(`/projects/notes?user_key=${uk()}${qs}`);
}

export async function insertProjectNote(n: ProjectNote): Promise<void> {
  await api('/projects/notes', { method: 'POST', body: JSON.stringify({ ...n, user_key: uk() }) });
}

export async function patchProjectNote(id: string, updates: Partial<ProjectNote>): Promise<void> {
  await api(`/projects/notes/${id}`, { method: 'PATCH', body: JSON.stringify({ ...updates, user_key: uk() }) });
}

export async function removeProjectNote(id: string): Promise<void> {
  await api(`/projects/notes/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── PROJECT LINKS ───────────────────────────────────────────

export async function loadProjectLinks(projectId?: string): Promise<ProjectLink[]> {
  const qs = projectId ? `&project_id=${projectId}` : '';
  return api<ProjectLink[]>(`/projects/links?user_key=${uk()}${qs}`);
}

export async function insertProjectLink(l: ProjectLink): Promise<void> {
  await api('/projects/links', { method: 'POST', body: JSON.stringify({ ...l, user_key: uk() }) });
}

export async function removeProjectLink(id: string): Promise<void> {
  await api(`/projects/links/${id}?user_key=${uk()}`, { method: 'DELETE' });
}

// ─── PROJECT MEMBERS ─────────────────────────────────────────

export async function loadProjectMembers(projectId?: string): Promise<ProjectMember[]> {
  const qs = projectId ? `&project_id=${projectId}` : '';
  return api<ProjectMember[]>(`/projects/members?user_key=${uk()}${qs}`);
}

export async function insertProjectMember(m: ProjectMember): Promise<void> {
  await api('/projects/members', { method: 'POST', body: JSON.stringify({ ...m, user_key: uk() }) });
}

export async function removeProjectMember(projectId: string, teamMemberId: string): Promise<void> {
  await api(`/projects/members?project_id=${projectId}&team_member_id=${teamMemberId}&user_key=${uk()}`, { method: 'DELETE' });
}

// ─── FOCUS SESSIONS ──────────────────────────────────────────

export async function loadFocusSessions(): Promise<FocusSession[]> {
  return api<FocusSession[]>(`/focus/sessions?user_key=${uk()}`);
}

export async function insertFocusSession(s: FocusSession): Promise<void> {
  await api('/focus/sessions', { method: 'POST', body: JSON.stringify({ ...s, user_key: uk() }) });
}

// ─── FOCUS STREAK ────────────────────────────────────────────

export async function loadFocusStreak(): Promise<FocusStreak | null> {
  return api<FocusStreak | null>(`/focus/streak?user_key=${uk()}`);
}

export async function saveFocusStreak(s: FocusStreak): Promise<void> {
  await api('/focus/streak', { method: 'POST', body: JSON.stringify({ ...s, user_key: uk() }) });
}

// ─── WEEKLY REVIEWS ──────────────────────────────────────────

export async function loadWeeklyReviews(): Promise<WeeklyReview[]> {
  return api<WeeklyReview[]>(`/reviews?user_key=${uk()}`);
}

export async function upsertWeeklyReview(r: WeeklyReview): Promise<void> {
  await api('/reviews', { method: 'POST', body: JSON.stringify({ ...r, user_key: uk() }) });
}

// ─── ONE THING ───────────────────────────────────────────────

export async function loadOneThing(): Promise<OneThing | null> {
  return api<OneThing | null>(`/reviews/one-thing?user_key=${uk()}`);
}

export async function saveOneThing(o: OneThing): Promise<void> {
  await api('/reviews/one-thing', { method: 'POST', body: JSON.stringify({ ...o, user_key: uk() }) });
}

// ─── LOAD ALL ────────────────────────────────────────────────

export async function loadAllData() {
  const [
    settings, transactions, subscriptions, tasks, goals, ideas, clients, teamMembers,
    inboxItems, projects, projectTasks, projectNotes, projectLinks,
    projectMembers, focusSessions, focusStreak, weeklyReviews, oneThing,
  ] = await Promise.all([
    loadSettings(),
    loadTransactions(),
    loadSubscriptions(),
    loadTasks(),
    loadGoals(),
    loadIdeas(),
    loadClients(),
    loadTeamMembers(),
    loadInboxItems(),
    loadProjects(),
    loadProjectTasks(),
    loadProjectNotes(),
    loadProjectLinks(),
    loadProjectMembers(),
    loadFocusSessions(),
    loadFocusStreak(),
    loadWeeklyReviews(),
    loadOneThing(),
  ]);
  return {
    settings, transactions, subscriptions, tasks, goals, ideas, clients, teamMembers,
    inboxItems, projects, projectTasks, projectNotes, projectLinks,
    projectMembers, focusSessions, focusStreak, weeklyReviews, oneThing,
  };
}

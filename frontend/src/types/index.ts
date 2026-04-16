export type ModuleView =
  | 'finance'
  | 'tasks'
  | 'goals'
  | 'ideas'
  | 'clients'
  | 'team'
  | 'settings'
  | 'projects'
  | 'focus'
  | 'weekly-review'
  | 'inbox';

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'inprogress' | 'done';
export type IdeaStage = 'idea' | 'planning' | 'building' | 'launched';
export type IdeaTag = 'saas' | 'tool' | 'client' | 'content';

export interface Transaction {
  id: string;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: string;
  expenseType?: 'fixed' | 'unfixed';
  notes: string;
  client?: string;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  end_date: string;
  reminder_days: number;
  auto_renew: boolean;
  status: 'active' | 'expired' | 'expiring soon';
  created_at?: string;
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  assignedTo?: string;
  description?: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  period: string;
  linkedTaskIds?: string[];
  createdAt: string;
}

export interface Idea {
  id: string;
  title: string;
  stage: IdeaStage;
  tags: IdeaTag[];
  notes: string;
  createdAt: string;
}

export interface PaymentEntry {
  id: string;
  amount: number;
  date: string;
  note: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  project: string;
  totalAmount: number;
  paidAmount: number;
  email: string;
  phone: string;
  notes: string;
  projectProgress: number;
  payments: PaymentEntry[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  joinedAt: string;
}

export interface Notification {
  id: string;
  type: 'task' | 'payment' | 'goal' | 'balance';
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AppSettings {
  founderName: string;
  currency: string;
  darkMode: boolean;
  lowBalanceThreshold: number;
}

export type ProjectStatus = 'active' | 'paused' | 'completed' | 'archived';

export type ProjectSectionId =
  | 'overview'
  | 'tasks'
  | 'notes'
  | 'docs'
  | 'team'
  | 'timeline'
  | 'decisions'
  | 'meetings'
  | 'links';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  coverColor: string;
  emoji: string;
  startDate: string;
  targetDate: string;
  ownerId: string;
  linkedIdeaId?: string;
  linkedClientId?: string;
  budget?: number;
  paidAmount?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  sectionId: ProjectSectionId;
  title: string;
  content: string;
  authorId: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo?: string;
  dueDate: string;
  description?: string;
  createdAt: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  teamMemberId?: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt: string;
}

export interface ProjectLink {
  id: string;
  projectId: string;
  title: string;
  url: string;
  category: 'design' | 'doc' | 'repo' | 'other';
  addedAt: string;
}

export type FocusSessionStatus = 'running' | 'paused' | 'completed' | 'abandoned';
export type TimerMode = 'pomodoro' | 'deep_work' | 'custom';

export interface FocusSession {
  id: string;
  date: string;
  taskId?: string;
  projectId?: string;
  label: string;
  durationMinutes: number;
  actualMinutes?: number;
  status: FocusSessionStatus;
  mode: TimerMode;
  startedAt: string;
  endedAt?: string;
  notes?: string;
}

export interface FocusBlock {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  taskId?: string;
  projectId?: string;
  color: string;
}

export interface FocusStreak {
  currentStreak: number;
  longestStreak: number;
  lastFocusDate: string;
  totalSessionsAllTime: number;
  totalMinutesAllTime: number;
}

export interface WeeklyReview {
  id: string;
  weekStartDate: string;
  weekNumber: number;
  year: number;
  tasksCompleted: number;
  focusMinutes: number;
  revenueEarned: number;
  goalsAchieved: number;
  wins: string;
  challenges: string;
  lessons: string;
  oneThing: string;
  energyLevel: 1 | 2 | 3 | 4 | 5;
  focusScore: 1 | 2 | 3 | 4 | 5;
  completedAt?: string;
  createdAt: string;
}

export type InboxItemType = 'thought' | 'task' | 'idea' | 'link' | 'note';
export type InboxItemStatus = 'uncaptured' | 'processed' | 'snoozed';

export interface InboxItem {
  id: string;
  type: InboxItemType;
  content: string;
  status: InboxItemStatus;
  processedAs?: 'task' | 'idea' | 'project' | 'discarded';
  processedId?: string;
  createdAt: string;
  snoozedUntil?: string;
}

export interface OneThing {
  text: string;
  date: string;
}

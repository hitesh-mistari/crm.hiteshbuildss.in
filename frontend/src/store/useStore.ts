import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ModuleView, Transaction, Task, Goal, Idea, Client, TeamMember, Notification, Subscription,
  TaskStatus, IdeaStage, PaymentEntry, AppSettings,
  Project, ProjectNote, ProjectTask, ProjectMember, ProjectLink, ProjectSectionId,
  FocusSession, FocusBlock, FocusStreak, WeeklyReview, InboxItem, InboxItemStatus, OneThing,
} from '../types';
import * as db from '../lib/db';

const today = () => new Date().toISOString().split('T')[0];

const defaultStreak: FocusStreak = {
  currentStreak: 0,
  longestStreak: 0,
  lastFocusDate: '',
  totalSessionsAllTime: 0,
  totalMinutesAllTime: 0,
};

const defaultSettings: AppSettings = {
  founderName: 'Hitesh',
  currency: '₹',
  darkMode: false,
  lowBalanceThreshold: 10000,
};

interface AppState {
  activeView: ModuleView;
  sidebarCollapsed: boolean;
  transactions: Transaction[];
  subscriptions: Subscription[];
  tasks: Task[];
  goals: Goal[];
  ideas: Idea[];
  clients: Client[];
  teamMembers: TeamMember[];
  notifications: Notification[];
  settings: AppSettings;
  showSearch: boolean;
  showNotifications: boolean;
  showQuickAdd: boolean;
  mobileSidebarOpen: boolean;
  dbLoaded: boolean;

  projects: Project[];
  projectNotes: ProjectNote[];
  projectTasks: ProjectTask[];
  projectMembers: ProjectMember[];
  projectLinks: ProjectLink[];
  activeProjectId: string | null;
  activeProjectSection: ProjectSectionId;

  focusSessions: FocusSession[];
  activeFocusSession: FocusSession | null;
  focusStreakData: FocusStreak;
  todayFocusBlocks: FocusBlock[];
  todayBlockDate: string;

  weeklyReviews: WeeklyReview[];
  inboxItems: InboxItem[];
  oneThing: OneThing;
  financeSection: 'transactions' | 'subscriptions';

  loadFromDB: () => Promise<void>;

  setActiveView: (view: ModuleView) => void;
  setFinanceSection: (section: 'transactions' | 'subscriptions') => void;
  toggleSidebar: () => void;

  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  addSubscription: (s: Subscription) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;

  addTask: (t: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  deleteTask: (id: string) => void;

  addGoal: (g: Goal) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  updateGoalProgress: (id: string, current: number) => void;
  deleteGoal: (id: string) => void;

  addIdea: (i: Idea) => void;
  updateIdea: (id: string, updates: Partial<Idea>) => void;
  updateIdeaStage: (id: string, stage: IdeaStage) => void;
  deleteIdea: (id: string) => void;

  addClient: (c: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  addPayment: (clientId: string, payment: PaymentEntry) => void;
  deleteClient: (id: string) => void;

  addTeamMember: (m: TeamMember) => void;
  deleteTeamMember: (id: string) => void;

  addNotification: (n: Notification) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  updateSettings: (updates: Partial<AppSettings>) => void;
  toggleSearch: () => void;
  toggleNotifications: () => void;
  toggleQuickAdd: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  resetData: () => void;

  addProject: (p: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  convertIdeaToProject: (ideaId: string) => void;
  openProject: (projectId: string) => void;
  closeProject: () => void;
  setActiveProjectSection: (section: ProjectSectionId) => void;

  addProjectNote: (n: ProjectNote) => void;
  updateProjectNote: (id: string, updates: Partial<ProjectNote>) => void;
  deleteProjectNote: (id: string) => void;

  addProjectTask: (t: ProjectTask) => void;
  updateProjectTask: (id: string, updates: Partial<ProjectTask>) => void;
  updateProjectTaskStatus: (id: string, status: TaskStatus) => void;
  deleteProjectTask: (id: string) => void;

  addProjectMember: (m: ProjectMember) => void;
  removeProjectMember: (projectId: string, teamMemberId: string) => void;

  addProjectLink: (l: ProjectLink) => void;
  deleteProjectLink: (id: string) => void;

  startFocusSession: (opts: { label: string; durationMinutes: number; mode: FocusSession['mode']; taskId?: string; projectId?: string }) => void;
  completeFocusSession: (actualMinutes: number, notes?: string) => void;
  abandonFocusSession: () => void;

  addFocusBlock: (block: FocusBlock) => void;
  removeFocusBlock: (id: string) => void;

  saveWeeklyReview: (review: WeeklyReview) => void;
  updateWeeklyReview: (id: string, updates: Partial<WeeklyReview>) => void;

  addInboxItem: (item: InboxItem) => void;
  processInboxItem: (id: string, processedAs: InboxItem['processedAs'], processedId?: string) => void;
  deleteInboxItem: (id: string) => void;
  updateInboxItemStatus: (id: string, status: InboxItemStatus) => void;

  setOneThing: (text: string) => void;
  setFinanceSection: (section: 'transactions' | 'subscriptions') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeView: 'finance',
      sidebarCollapsed: false,
      transactions: [],
      subscriptions: [],
      tasks: [],
      goals: [],
      ideas: [],
      clients: [],
      teamMembers: [],
      notifications: [],
      settings: defaultSettings,
      showSearch: false,
      showNotifications: false,
      showQuickAdd: false,
      mobileSidebarOpen: false,
      dbLoaded: false,

      projects: [],
      projectNotes: [],
      projectTasks: [],
      projectMembers: [],
      projectLinks: [],
      activeProjectId: null,
      activeProjectSection: 'overview',

      focusSessions: [],
      activeFocusSession: null,
      focusStreakData: defaultStreak,
      todayFocusBlocks: [],
      todayBlockDate: today(),

      weeklyReviews: [],
      inboxItems: [],
      oneThing: { text: '', date: '' },
      financeSection: 'transactions',

      loadFromDB: async () => {
        try {
          const data = await db.loadAllData();
          const update: Partial<AppState> = { dbLoaded: true };

          if (data.settings) update.settings = data.settings;
          update.transactions = data.transactions;
          update.subscriptions = data.subscriptions || [];
          update.tasks = data.tasks;
          update.goals = data.goals;
          update.ideas = data.ideas;
          update.clients = data.clients;
          update.teamMembers = data.teamMembers;
          update.inboxItems = data.inboxItems;
          update.projects = data.projects;
          update.projectTasks = data.projectTasks;
          update.projectNotes = data.projectNotes;
          update.projectLinks = data.projectLinks;
          update.projectMembers = data.projectMembers;
          update.focusSessions = data.focusSessions;
          if (data.focusStreak) update.focusStreakData = data.focusStreak;
          update.weeklyReviews = data.weeklyReviews;
          if (data.oneThing) update.oneThing = data.oneThing;

          set(update as AppState);
        } catch {
          set({ dbLoaded: true });
        }
      },

      setActiveView: (view) => set({ activeView: view, mobileSidebarOpen: false }),
      setFinanceSection: (section) => set({ financeSection: section }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      addTransaction: (t) => {
        set((s) => ({ transactions: [t, ...s.transactions] }));
        db.insertTransaction(t);
      },
      updateTransaction: (id, updates) => {
        set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
        db.patchTransaction(id, updates);
      },
      deleteTransaction: (id) => {
        set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
        db.removeTransaction(id);
      },

      addSubscription: (s_obj) => {
        set((s) => ({ subscriptions: [s_obj, ...s.subscriptions] }));
        db.insertSubscription(s_obj);
      },
      updateSubscription: (id, updates) => {
        set((s) => ({ subscriptions: s.subscriptions.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
        db.patchSubscription(id, updates);
      },
      deleteSubscription: (id) => {
        set((s) => ({ subscriptions: s.subscriptions.filter((t) => t.id !== id) }));
        db.removeSubscription(id);
      },

      addTask: (t) => {
        set((s) => ({ tasks: [t, ...s.tasks] }));
        db.insertTask(t);
      },
      updateTask: (id, updates) => {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
        db.patchTask(id, updates);
      },
      updateTaskStatus: (id, status) => {
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) }));
        db.patchTask(id, { status });
      },
      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
        db.removeTask(id);
      },

      addGoal: (g) => {
        set((s) => ({ goals: [g, ...s.goals] }));
        db.insertGoal(g);
      },
      updateGoal: (id, updates) => {
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) }));
        db.patchGoal(id, updates);
      },
      updateGoalProgress: (id, current) => {
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, current } : g)) }));
        db.patchGoal(id, { current });
      },
      deleteGoal: (id) => {
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) }));
        db.removeGoal(id);
      },

      addIdea: (i) => {
        set((s) => ({ ideas: [i, ...s.ideas] }));
        db.insertIdea(i);
      },
      updateIdea: (id, updates) => {
        set((s) => ({ ideas: s.ideas.map((i) => (i.id === id ? { ...i, ...updates } : i)) }));
        db.patchIdea(id, updates);
      },
      updateIdeaStage: (id, stage) => {
        set((s) => ({ ideas: s.ideas.map((i) => (i.id === id ? { ...i, stage } : i)) }));
        db.patchIdea(id, { stage });
      },
      deleteIdea: (id) => {
        set((s) => ({ ideas: s.ideas.filter((i) => i.id !== id) }));
        db.removeIdea(id);
      },

      addClient: (c) => {
        set((s) => {
          const newState: Partial<AppState> = { clients: [c, ...s.clients] };
          if (c.totalAmount > 0) {
            const t: Transaction = {
              id: `txn_client_${c.id}`,
              title: `${c.name}${c.project ? ` — ${c.project}` : ''}`,
              type: 'income',
              amount: c.totalAmount,
              date: c.createdAt,
              category: 'Client Payment',
              notes: `Auto-created from client: ${c.name}`,
              client: c.name,
            };
            newState.transactions = [t, ...s.transactions];
            db.insertTransaction(t);
          }
          return newState;
        });
        db.insertClient(c);
      },
      updateClient: (id, updates) => {
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)) }));
        db.patchClient(id, updates);
      },
      addPayment: (clientId, payment) => {
        set((s) => {
          const client = s.clients.find((c) => c.id === clientId);
          const paymentTxn: Transaction = {
            id: `txn_pay_${payment.id}`,
            title: `Payment received${client ? ` — ${client.name}` : ''}`,
            type: 'income',
            amount: payment.amount,
            date: payment.date,
            category: 'Client Payment',
            notes: payment.note || '',
            client: client?.name ?? '',
          };
          const updatedClients = s.clients.map((c) => {
            if (c.id !== clientId) return c;
            const updated = { ...c, paidAmount: c.paidAmount + payment.amount, payments: [...c.payments, payment] };
            db.patchClient(clientId, { paidAmount: updated.paidAmount, payments: updated.payments });
            return updated;
          });
          db.insertTransaction(paymentTxn);
          return {
            clients: updatedClients,
            transactions: [paymentTxn, ...s.transactions],
          };
        });
      },
      deleteClient: (id) => {
        set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }));
        db.removeClient(id);
      },

      addTeamMember: (m) => {
        set((s) => ({ teamMembers: [...s.teamMembers, m] }));
        db.insertTeamMember(m);
      },
      deleteTeamMember: (id) => {
        set((s) => ({ teamMembers: s.teamMembers.filter((m) => m.id !== id) }));
        db.removeTeamMember(id);
      },

      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      updateSettings: (updates) => {
        set((s) => {
          const next = { ...s.settings, ...updates };
          db.saveSettings(next);
          return { settings: next };
        });
      },
      toggleSearch: () => set((s) => ({ showSearch: !s.showSearch })),
      toggleNotifications: () => set((s) => ({ showNotifications: !s.showNotifications, showQuickAdd: false })),
      toggleQuickAdd: () => set((s) => ({ showQuickAdd: !s.showQuickAdd, showNotifications: false })),
      toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
      closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
      resetData: () =>
        set({
          transactions: initTransactions,
          tasks: initTasks,
          goals: initGoals,
          ideas: initIdeas,
          clients: initClients,
          teamMembers: initTeam,
          notifications: initNotifications,
          projects: [],
          projectNotes: [],
          projectTasks: [],
          projectMembers: [],
          projectLinks: [],
          focusSessions: [],
          weeklyReviews: [],
          inboxItems: [],
        }),

      addProject: (p) => {
        set((s) => ({ projects: [p, ...s.projects] }));
        db.insertProject(p);
      },
      updateProject: (id, updates) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
        db.patchProject(id, updates);
      },
      deleteProject: (id) => {
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== id),
          projectNotes: s.projectNotes.filter((n) => n.projectId !== id),
          projectTasks: s.projectTasks.filter((t) => t.projectId !== id),
          projectMembers: s.projectMembers.filter((m) => m.projectId !== id),
          projectLinks: s.projectLinks.filter((l) => l.projectId !== id),
        }));
        db.removeProject(id);
      },
      convertIdeaToProject: (ideaId) => {
        const idea = get().ideas.find((i) => i.id === ideaId);
        if (!idea) return;
        const newId = `proj_${Date.now()}`;
        const now = new Date().toISOString();
        const newProject: Project = {
          id: newId,
          title: idea.title,
          description: idea.notes,
          status: 'active',
          priority: 'medium',
          coverColor: 'blue',
          emoji: '🚀',
          startDate: today(),
          targetDate: '',
          ownerId: db.getUserKey(),
          linkedIdeaId: ideaId,
          tags: idea.tags,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({
          projects: [newProject, ...s.projects],
          ideas: s.ideas.map((i) => (i.id === ideaId ? { ...i, stage: 'building' as const } : i)),
          activeView: 'projects' as const,
          activeProjectId: newId,
          activeProjectSection: 'overview' as const,
        }));
        db.insertProject(newProject);
        db.patchIdea(ideaId, { stage: 'building' });
      },
      openProject: (projectId) =>
        set({ activeView: 'projects', activeProjectId: projectId, activeProjectSection: 'overview' }),
      closeProject: () => set({ activeProjectId: null }),
      setActiveProjectSection: (section) => set({ activeProjectSection: section }),

      addProjectNote: (n) => {
        set((s) => ({ projectNotes: [n, ...s.projectNotes] }));
        db.insertProjectNote(n);
      },
      updateProjectNote: (id, updates) => {
        set((s) => ({
          projectNotes: s.projectNotes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        }));
        db.patchProjectNote(id, updates);
      },
      deleteProjectNote: (id) => {
        set((s) => ({ projectNotes: s.projectNotes.filter((n) => n.id !== id) }));
        db.removeProjectNote(id);
      },

      addProjectTask: (t) => {
        set((s) => ({ projectTasks: [t, ...s.projectTasks] }));
        db.insertProjectTask(t);
      },
      updateProjectTask: (id, updates) => {
        set((s) => ({ projectTasks: s.projectTasks.map((t) => (t.id === id ? { ...t, ...updates } : t)) }));
        db.patchProjectTask(id, updates);
      },
      updateProjectTaskStatus: (id, status) => {
        set((s) => ({ projectTasks: s.projectTasks.map((t) => (t.id === id ? { ...t, status } : t)) }));
        db.patchProjectTask(id, { status });
      },
      deleteProjectTask: (id) => {
        set((s) => ({ projectTasks: s.projectTasks.filter((t) => t.id !== id) }));
        db.removeProjectTask(id);
      },

      addProjectMember: (m) => {
        set((s) => ({ projectMembers: [...s.projectMembers, m] }));
        db.insertProjectMember(m);
      },
      removeProjectMember: (projectId, teamMemberId) => {
        set((s) => ({
          projectMembers: s.projectMembers.filter(
            (m) => !(m.projectId === projectId && m.teamMemberId === teamMemberId)
          ),
        }));
        db.removeProjectMember(projectId, teamMemberId);
      },

      addProjectLink: (l) => {
        set((s) => ({ projectLinks: [l, ...s.projectLinks] }));
        db.insertProjectLink(l);
      },
      deleteProjectLink: (id) => {
        set((s) => ({ projectLinks: s.projectLinks.filter((l) => l.id !== id) }));
        db.removeProjectLink(id);
      },

      startFocusSession: (opts) => {
        const session: FocusSession = {
          id: `fs_${Date.now()}`,
          date: today(),
          ...opts,
          status: 'running',
          startedAt: new Date().toISOString(),
        };
        set({ activeFocusSession: session });
      },
      completeFocusSession: (actualMinutes, notes) => {
        const { activeFocusSession, focusSessions, focusStreakData } = get();
        if (!activeFocusSession) return;
        const completed: FocusSession = {
          ...activeFocusSession,
          status: 'completed',
          actualMinutes,
          notes,
          endedAt: new Date().toISOString(),
        };
        const sessionDate = today();
        const lastDate = focusStreakData.lastFocusDate;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const newStreak = lastDate === sessionDate
          ? focusStreakData.currentStreak
          : lastDate === yesterday
          ? focusStreakData.currentStreak + 1
          : 1;
        const newStreakData: FocusStreak = {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, focusStreakData.longestStreak),
          lastFocusDate: sessionDate,
          totalSessionsAllTime: focusStreakData.totalSessionsAllTime + 1,
          totalMinutesAllTime: focusStreakData.totalMinutesAllTime + actualMinutes,
        };
        set({
          activeFocusSession: null,
          focusSessions: [completed, ...focusSessions],
          focusStreakData: newStreakData,
        });
        db.insertFocusSession(completed);
        db.saveFocusStreak(newStreakData);
      },
      abandonFocusSession: () => set({ activeFocusSession: null }),

      addFocusBlock: (block) => {
        const d = today();
        set((s) => {
          const clearIfStale = s.todayBlockDate !== d ? [] : s.todayFocusBlocks;
          return { todayFocusBlocks: [...clearIfStale, block], todayBlockDate: d };
        });
      },
      removeFocusBlock: (id) =>
        set((s) => ({ todayFocusBlocks: s.todayFocusBlocks.filter((b) => b.id !== id) })),

      saveWeeklyReview: (review) => {
        set((s) => ({
          weeklyReviews: [review, ...s.weeklyReviews.filter((r) => r.weekStartDate !== review.weekStartDate)],
        }));
        db.upsertWeeklyReview(review);
      },
      updateWeeklyReview: (id, updates) => {
        set((s) => ({ weeklyReviews: s.weeklyReviews.map((r) => (r.id === id ? { ...r, ...updates } : r)) }));
        const review = get().weeklyReviews.find((r) => r.id === id);
        if (review) db.upsertWeeklyReview({ ...review, ...updates });
      },

      addInboxItem: (item) => {
        set((s) => ({ inboxItems: [item, ...s.inboxItems] }));
        db.insertInboxItem(item);
      },
      processInboxItem: (id, processedAs, processedId) => {
        set((s) => ({
          inboxItems: s.inboxItems.map((i) =>
            i.id === id ? { ...i, status: 'processed' as const, processedAs, processedId } : i
          ),
        }));
        db.patchInboxItem(id, { status: 'processed', processedAs, processedId });
      },
      deleteInboxItem: (id) => {
        set((s) => ({ inboxItems: s.inboxItems.filter((i) => i.id !== id) }));
        db.removeInboxItem(id);
      },
      updateInboxItemStatus: (id, status) => {
        set((s) => ({
          inboxItems: s.inboxItems.map((i) => (i.id === id ? { ...i, status } : i)),
        }));
        db.patchInboxItem(id, { status });
      },

      setOneThing: (text) => {
        const o: OneThing = { text, date: today() };
        set({ oneThing: o });
        db.saveOneThing(o);
      },
    }),
    {
      name: 'founderos-data',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeView: state.activeView,
        financeSection: state.financeSection,
        transactions: state.transactions,
        tasks: state.tasks,
        goals: state.goals,
        ideas: state.ideas,
        clients: state.clients,
        teamMembers: state.teamMembers,
        notifications: state.notifications,
        settings: state.settings,
        sidebarCollapsed: state.sidebarCollapsed,
        projects: state.projects,
        projectNotes: state.projectNotes,
        projectTasks: state.projectTasks,
        projectMembers: state.projectMembers,
        projectLinks: state.projectLinks,
        focusSessions: state.focusSessions,
        focusStreakData: state.focusStreakData,
        todayFocusBlocks: state.todayFocusBlocks,
        todayBlockDate: state.todayBlockDate,
        weeklyReviews: state.weeklyReviews,
        inboxItems: state.inboxItems,
        oneThing: state.oneThing,
      }),
    }
  )
);

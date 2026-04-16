import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import Sidebar from './components/layout/Sidebar';
import TopNavbar from './components/layout/TopNavbar';
import FinanceModule from './components/modules/finance/FinanceModule';
import TasksModule from './components/modules/tasks/TasksModule';
import GoalsModule from './components/modules/goals/GoalsModule';
import IdeasModule from './components/modules/ideas/IdeasModule';
import ClientsModule from './components/modules/clients/ClientsModule';
import TeamModule from './components/modules/team/TeamModule';
import SettingsModule from './components/modules/settings/SettingsModule';
import ProjectsModule from './components/modules/projects/ProjectsModule';
import FocusModule from './components/modules/focus/FocusModule';
import InboxModule from './components/modules/inbox/InboxModule';
import WeeklyReviewModule from './components/modules/weekly-review/WeeklyReviewModule';
import SearchModal from './components/common/SearchModal';

const moduleMap = {
  finance: FinanceModule,
  tasks: TasksModule,
  goals: GoalsModule,
  ideas: IdeasModule,
  clients: ClientsModule,
  team: TeamModule,
  settings: SettingsModule,
  projects: ProjectsModule,
  focus: FocusModule,
  inbox: InboxModule,
  'weekly-review': WeeklyReviewModule,
};

function QuickCaptureModal({ onClose }: { onClose: () => void }) {
  const { addInboxItem } = useStore();
  const [content, setContent] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleCapture = () => {
    if (!content.trim()) return;
    addInboxItem({
      id: `inbox_${Date.now()}`,
      type: 'thought',
      content: content.trim(),
      status: 'uncaptured',
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-32 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Quick Capture</p>
          <textarea
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleCapture();
              if (e.key === 'Escape') onClose();
            }}
            placeholder="What's on your mind? (⌘Enter to capture)"
            rows={3}
            className="w-full text-sm text-slate-800 outline-none resize-none placeholder:text-slate-300"
          />
        </div>
        <div className="flex items-center justify-between px-5 pb-5">
          <p className="text-xs text-slate-400">Goes to Inbox for processing</p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
            <button
              onClick={handleCapture}
              disabled={!content.trim()}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Capture
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function App() {
  const { activeView, sidebarCollapsed, showSearch, toggleSearch, loadFromDB } = useStore();
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const leftOffset = sidebarCollapsed ? 72 : 240;

  const ActiveModule = moduleMap[activeView as keyof typeof moduleMap] ?? null;

  useEffect(() => {
    loadFromDB();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggleSearch();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
        e.preventDefault();
        setShowQuickCapture(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearch]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans">
      <Sidebar />
      <TopNavbar />

      <main
        className="min-h-screen pt-16 transition-all duration-[250ms] md:ml-[var(--sidebar-width)]"
        style={{ '--sidebar-width': `${leftOffset}px` } as React.CSSProperties}
      >
        <AnimatePresence mode="wait">
          {ActiveModule && <ActiveModule key={activeView} />}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showSearch && <SearchModal />}
        {showQuickCapture && <QuickCaptureModal onClose={() => setShowQuickCapture(false)} />}
      </AnimatePresence>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, CheckSquare, Target, Lightbulb,
  Users, Settings, ChevronLeft, ChevronRight, Zap,
  FolderKanban, X
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ModuleView } from '../../types';

const topNavItems: { id: ModuleView; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'finance', label: 'Finance', icon: DollarSign, color: 'text-emerald-600' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, color: 'text-blue-600' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, color: 'text-sky-600' },
  { id: 'goals', label: 'Goals', icon: Target, color: 'text-orange-600' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: 'text-yellow-600' },
];

const bottomNavItems: { id: ModuleView; label: string; icon: React.ElementType; color: string }[] = [
  { id: 'clients', label: 'Clients', icon: Users, color: 'text-sky-600' },
  { id: 'settings', label: 'Settings', icon: Settings, color: 'text-slate-500' },
];

function NavButton({ item, isActive, sidebarCollapsed, setActiveView, badge }: {
  item: typeof topNavItems[number];
  isActive: boolean;
  sidebarCollapsed: boolean;
  setActiveView: (v: ModuleView) => void;
  badge?: number;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={() => setActiveView(item.id)}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 relative min-h-[44px]
        ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
        ${sidebarCollapsed ? 'justify-center' : ''}
      `}
      title={sidebarCollapsed ? item.label : undefined}
    >
      <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-white' : item.color}`} />
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="text-sm font-medium whitespace-nowrap overflow-hidden flex-1 text-left"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {badge !== undefined && badge > 0 && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center
          ${isActive ? 'bg-white text-slate-900' : 'bg-rose-500 text-white'}
          ${sidebarCollapsed ? 'absolute top-1 right-1' : ''}
        `}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

function SidebarContent({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const { activeView, setActiveView, settings } = useStore();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-5 border-b border-[#E6E8EC]">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-bold text-slate-900 text-base tracking-tight">FounderOS</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && !onClose && (
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center mx-auto">
            <Zap size={16} className="text-white" />
          </div>
        )}
        {!collapsed && onClose && (
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 text-base tracking-tight">FounderOS</span>
          </div>
        )}
        {onClose ? (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors ml-auto">
            <X size={18} />
          </button>
        ) : !collapsed ? (
          <DesktopToggle />
        ) : null}
      </div>

      {collapsed && !onClose && <DesktopExpandButton />}

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {topNavItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            sidebarCollapsed={collapsed && !onClose}
            setActiveView={setActiveView}
            badge={undefined}
          />
        ))}

        <div className="my-3 border-t border-[#E6E8EC]" />

        {bottomNavItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            sidebarCollapsed={collapsed && !onClose}
            setActiveView={setActiveView}
          />
        ))}
      </nav>

      {(!collapsed || onClose) && (
        <div className="px-4 py-4 border-t border-[#E6E8EC]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {settings.founderName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{settings.founderName}</p>
              <p className="text-xs text-slate-500">Solo Founder</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopToggle() {
  const { toggleSidebar } = useStore();
  return (
    <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
      <ChevronLeft size={16} />
    </button>
  );
}

function DesktopExpandButton() {
  const { toggleSidebar } = useStore();
  return (
    <button onClick={toggleSidebar} className="mx-auto mt-2 p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors block">
      <ChevronRight size={16} />
    </button>
  );
}

export default function Sidebar() {
  const { sidebarCollapsed, mobileSidebarOpen, closeMobileSidebar } = useStore();

  return (
    <>
      <motion.aside
        animate={{ width: sidebarCollapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full bg-[#F8F9FB] border-r border-[#E6E8EC] z-40 flex-col overflow-hidden hidden md:flex"
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </motion.aside>

      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={closeMobileSidebar}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="fixed left-0 top-0 h-full w-72 bg-[#F8F9FB] border-r border-[#E6E8EC] z-50 flex flex-col overflow-hidden md:hidden"
            >
              <SidebarContent collapsed={false} onClose={closeMobileSidebar} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

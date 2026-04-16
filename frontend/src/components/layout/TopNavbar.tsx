import { Bell, Plus, Search, Menu, Flame, Bomb, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuickAddDropdown from '../common/QuickAddDropdown';
import NotificationsPanel from '../common/NotificationsPanel';

const CHALLENGE_START = new Date('2025-09-11');
const CHALLENGE_TOTAL = 365;

function get365Stats() {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfChallenge = new Date(CHALLENGE_START.getFullYear(), CHALLENGE_START.getMonth(), CHALLENGE_START.getDate());
  const diffMs = startOfToday.getTime() - startOfChallenge.getTime();
  const completed = Math.max(0, Math.min(CHALLENGE_TOTAL, Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1));
  const remaining = Math.max(0, CHALLENGE_TOTAL - completed);
  return { completed, remaining };
}

export default function TopNavbar() {
  const {
    sidebarCollapsed, toggleSearch, toggleNotifications, toggleQuickAdd,
    showNotifications, showQuickAdd, notifications, settings, setActiveView,
    toggleMobileSidebar, subscriptions, setFinanceSection,
  } = useStore();
  const [showExpiringDetails, setShowExpiringDetails] = useState(false);
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        setShowExpiringDetails(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysLeft = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  const expiringSubscriptions = subscriptions.filter((s) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(s.end_date);
    end.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= s.reminder_days;
  });

  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (expiringSubscriptions.length === 0) return;
    
    // Find soonest expiry
    const soonestSub = [...expiringSubscriptions].sort((a,b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime())[0];
    const expiryDate = new Date(soonestSub.end_date);
    expiryDate.setHours(23, 59, 59, 999);

    const updateTimer = () => {
      const now = new Date();
      const diff = expiryDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      
      if (days > 0) {
        setTimeLeft(`${days} Day${days > 1 ? 's' : ''}`);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiringSubscriptions]);

  const unread = notifications.filter(n => !n.read).length + expiringSubscriptions.length;
  const leftOffset = sidebarCollapsed ? 72 : 240;
  const { completed, remaining } = get365Stats();

  return (
    <header
      className="fixed top-0 right-0 h-16 bg-white border-b border-[#E6E8EC] z-30 flex items-center justify-between px-4 md:px-6"
      style={{ left: 0, transition: 'left 0.25s ease-in-out' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <button
          onClick={toggleSearch}
          className="hidden sm:flex items-center gap-2.5 bg-[#F5F7FA] rounded-xl px-4 py-2 text-sm text-slate-400 hover:bg-slate-100 transition-colors w-48 md:w-64"
        >
          <Search size={15} />
          <span className="hidden md:inline">Search tasks, clients, ideas...</span>
          <span className="md:hidden">Search...</span>
        </button>

        <button
          onClick={toggleSearch}
          className="sm:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Search"
        >
          <Search size={20} />
        </button>
      </div>

      <div
        className="hidden md:block text-sm font-bold text-slate-900 tracking-tight absolute left-1/2 -translate-x-1/2"
        style={{ left: `calc(${leftOffset}px + (100% - ${leftOffset}px) / 2)` }}
      />

      <div className="hidden sm:flex items-center gap-3">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-full text-sm font-semibold">
          <Flame size={16} className="text-red-500 flex-shrink-0" />
          <span>Day {completed}<span className="text-red-400 font-medium"> / 365</span></span>
          <span className="w-px h-4 bg-red-200 mx-1" />
          <span className="text-red-500">{remaining} left</span>
          <span className="w-px h-4 bg-red-200 mx-1" />
          <span className="text-red-400 font-medium">Since 11 Sep 2025</span>
        </div>
        {expiringSubscriptions.length > 0 && (
          <div className="relative" ref={detailsRef}>
            <button 
              onClick={() => setShowExpiringDetails(!showExpiringDetails)}
              className="flex items-center gap-0 bg-black/90 border border-slate-700 rounded-xl overflow-hidden shadow-2xl hover:border-red-500/50 transition-all group scale-105"
            >
              <div className="relative w-20 h-10 overflow-hidden">
                <img src="/time_bomb.png" alt="Bomb" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/40" />
              </div>
              <div className="flex flex-col items-center justify-center bg-black px-4 h-10 border-l border-slate-800">
                <span className="font-mono text-base tracking-[0.2em] text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">{timeLeft}</span>
                <span className="text-[8px] uppercase tracking-widest text-slate-500 -mt-1 font-bold">Subscription Expiring</span>
              </div>
              <div className="flex items-center px-4 h-10 bg-slate-900/50 border-l border-slate-800">
                <span className="text-white text-xs font-black uppercase tracking-tight italic">
                  {expiringSubscriptions.length} <span className="text-red-500">Threat{expiringSubscriptions.length > 1 ? 's' : ''}</span>
                </span>
              </div>
            </button>
            <AnimatePresence>
              {showExpiringDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 right-0 bg-white border border-[#E6E8EC] shadow-xl rounded-2xl p-4 w-72 z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-2">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-tight">Expiring Soon</h3>
                    <button onClick={() => setShowExpiringDetails(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                      <X size={12} />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {expiringSubscriptions.map((s) => {
                      const days = getDaysLeft(s.end_date);
                      return (
                        <div key={s.id} className="flex items-center justify-between gap-4">
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-slate-800 truncate">{s.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Expires {s.end_date}</span>
                          </div>
                          <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg ${days <= 1 ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                            {days}d left
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 relative">
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
          <AnimatePresence>
            {showNotifications && <NotificationsPanel />}
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={toggleQuickAdd}
            className="flex items-center gap-1.5 bg-slate-900 text-white px-3 md:px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors min-h-[44px]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Add</span>
          </button>
          <AnimatePresence>
            {showQuickAdd && <QuickAddDropdown />}
          </AnimatePresence>
        </div>

        <button
          onClick={() => setActiveView('settings')}
          className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-bold hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px]"
          title="Settings"
        >
          {settings.founderName.charAt(0).toUpperCase() || 'F'}
        </button>
      </div>
    </header>
  );
}

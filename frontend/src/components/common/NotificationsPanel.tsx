import { motion } from 'framer-motion';
import { Bell, CheckSquare, DollarSign, Target, X, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';

const iconMap = {
  task: { icon: CheckSquare, color: 'text-blue-500 bg-blue-50' },
  payment: { icon: DollarSign, color: 'text-emerald-500 bg-emerald-50' },
  goal: { icon: Target, color: 'text-orange-500 bg-orange-50' },
};

export default function NotificationsPanel() {
  const { notifications, markNotificationRead, toggleNotifications, subscriptions } = useStore();

  const expiringSubscriptions = subscriptions.filter((s) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(s.end_date);
    end.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft >= 0 && daysLeft <= s.reminder_days;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-[#E6E8EC] overflow-hidden z-50"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E6E8EC]">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-slate-500" />
          <span className="text-sm font-semibold text-slate-800">Notifications</span>
        </div>
        <button onClick={toggleNotifications} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
          <X size={14} />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {expiringSubscriptions.map((s) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const end = new Date(s.end_date);
          end.setHours(0, 0, 0, 0);
          const daysLeft = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return (
            <div
              key={`sub-${s.id}`}
              className="flex items-start gap-3 px-4 py-3 bg-orange-50/50 border-b border-slate-50"
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-orange-500 bg-orange-100">
                <AlertTriangle size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs leading-relaxed text-slate-800 font-medium">
                  {s.name}
                </p>
                <p className="text-[10px] text-orange-600 font-bold mt-0.5">Expiring in {daysLeft} days</p>
              </div>
              <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
            </div>
          );
        })}
        {notifications.map((n) => {
          const meta = iconMap[n.type];
          const Icon = meta.icon;
          return (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 ${!n.read ? 'bg-slate-50/80' : ''}`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${!n.read ? 'text-slate-800 font-medium' : 'text-slate-500'}`}>
                  {n.message}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{n.createdAt}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

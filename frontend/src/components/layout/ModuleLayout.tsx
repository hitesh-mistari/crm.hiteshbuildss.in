import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { useStore } from '../../store/useStore';

interface ModuleLayoutProps {
  title: string;
  subtitle?: string;
  accentColor?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function ModuleLayout({ title, subtitle, accentColor = 'bg-slate-900', actions, children }: ModuleLayoutProps) {
  const { setActiveView } = useStore();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-full"
    >
      <div className="sticky top-16 z-20 bg-[#F5F7FA] border-b border-[#E6E8EC] px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <button
            onClick={() => setActiveView('dashboard')}
            className="flex items-center gap-1.5 md:gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors group flex-shrink-0 min-h-[44px]"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="hidden sm:block w-px h-4 bg-slate-300 flex-shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${accentColor}`} />
            <h1 className="text-sm md:text-base font-bold text-slate-900 truncate">{title}</h1>
            {subtitle && <span className="text-xs md:text-sm text-slate-400 truncate hidden sm:block">{subtitle}</span>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
      </div>
      <div className="p-4 md:p-8">
        {children}
      </div>
    </motion.div>
  );
}

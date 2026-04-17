import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, ArrowRight, X } from 'lucide-react';
import { discoverKeys, setUserKey, getUserKey } from '../../lib/db';
import { useStore } from '../../store/useStore';

export default function SyncDataOverlay() {
  const { projects } = useStore();
  const [availableKeys, setAvailableKeys] = useState<{ user_key: string, count: number }[]>([]);
  const [show, setShow] = useState(false);
  const currentKey = getUserKey();

  useEffect(() => {
    // Only fetch if zero projects found for current user
    if (projects.length === 0) {
      discoverKeys().then(keys => {
        // Filter out current key and only show if keys with data exist
        const others = keys.filter(k => k.user_key !== currentKey);
        if (others.length > 0) {
          setAvailableKeys(others);
          setShow(true);
        }
      });
    }
  }, [projects.length]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-4"
      >
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Database size={16} />
              <span className="text-sm font-semibold">Data Found</span>
            </div>
            <button onClick={() => setShow(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              We found your data in the database but you aren't seeing it because your local ID is different.
            </p>
            <div className="space-y-2">
              {availableKeys.map((k, i) => (
                <button
                  key={i}
                  onClick={() => setUserKey(k.user_key)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl group transition-all"
                >
                  <div className="text-left">
                    <p className="text-[10px] text-slate-400 font-mono mb-0.5">Account {k.user_key.substring(0, 8)}</p>
                    <p className="text-xs font-semibold text-slate-700">{k.count} Projects saved</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

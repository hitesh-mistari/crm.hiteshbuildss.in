import { useState } from 'react';
import { Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../layout/ModuleLayout';
import { useStore } from '../../../store/useStore';

export default function SettingsModule() {
  const { settings, updateSettings, resetData } = useStore();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetData();
    setShowResetConfirm(false);
  };

  return (
    <ModuleLayout title="Settings" subtitle="Preferences & Configuration" accentColor="bg-slate-500">
      <div className="max-w-2xl space-y-5">
        <form onSubmit={handleSave}>
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-[#E6E8EC] p-6 mb-5"
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Profile</h3>
            <div className="flex items-center gap-5 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {form.founderName.charAt(0) || 'F'}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">Your initials are auto-generated from your name</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Your Name</label>
                <input
                  value={form.founderName}
                  onChange={(e) => set('founderName', e.target.value)}
                  placeholder="e.g. Hitesh"
                  className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Currency Symbol</label>
                <input
                  value={form.currency}
                  onChange={(e) => set('currency', e.target.value)}
                  placeholder="₹"
                  maxLength={3}
                  className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="bg-white rounded-2xl border border-[#E6E8EC] p-6 mb-5"
          >
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Finance Alerts</h3>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Low Balance Threshold ({form.currency})</label>
              <p className="text-xs text-slate-400 mb-2">You'll see a warning on the dashboard when your balance falls below this amount</p>
              <input
                type="number"
                value={form.lowBalanceThreshold}
                onChange={(e) => set('lowBalanceThreshold', parseFloat(e.target.value) || 0)}
                placeholder="50000"
                min="0"
                className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="flex items-center justify-between bg-white rounded-2xl border border-[#E6E8EC] p-5 mb-5"
          >
            <div>
              <p className="text-sm font-medium text-slate-800">Dark Mode</p>
              <p className="text-xs text-slate-400 mt-0.5">Toggle dark theme across the app</p>
            </div>
            <button
              type="button"
              onClick={() => set('darkMode', !form.darkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors ${form.darkMode ? 'bg-slate-900' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
            >
              <Save size={14} />
              {saved ? 'Saved!' : 'Save Settings'}
            </button>
          </motion.div>
        </form>

        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="bg-white rounded-2xl border border-red-100 p-6"
        >
          <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
          <p className="text-xs text-slate-500 mb-4">This will permanently delete all your data and reset to defaults. This cannot be undone.</p>
          {showResetConfirm ? (
            <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
              <p className="text-xs text-red-700 font-medium flex-1">Are you sure? All data will be lost.</p>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">
                Yes, Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
              <RotateCcw size={13} />
              Reset All Data
            </button>
          )}
        </motion.div>
      </div>
    </ModuleLayout>
  );
}

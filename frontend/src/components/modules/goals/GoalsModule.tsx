import { useState } from 'react';
import { Plus, CheckCircle2, Circle, Target, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleLayout from '../../layout/ModuleLayout';
import { useStore } from '../../../store/useStore';
import Modal from '../../common/Modal';

function AddGoalForm({ onClose }: { onClose: () => void }) {
  const { addGoal } = useStore();
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [period, setPeriod] = useState('Week 1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !target) return;
    addGoal({
      id: `g${Date.now()}`,
      title: title.trim(),
      target: parseFloat(target),
      current: 0,
      unit,
      period,
      createdAt: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Goal Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Close 5 clients" required
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Target *</label>
          <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="0" required
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Unit</label>
          <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="clients"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Period</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
            {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Month'].map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">Add Goal</button>
      </div>
    </form>
  );
}

export default function GoalsModule() {
  const { goals, updateGoalProgress, deleteGoal, settings } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const overallProgress = goals.length > 0
    ? Math.round(goals.reduce((s, g) => s + Math.min((g.current / g.target) * 100, 100), 0) / goals.length)
    : 0;

  return (
    <ModuleLayout
      title="Goals"
      subtitle={`${overallProgress}% overall progress`}
      accentColor="bg-orange-500"
      actions={
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
          <Plus size={15} /> Add Goal
        </button>
      }
    >
      <div className="mb-6 bg-white rounded-2xl p-6 border border-[#E6E8EC]">
        <div className="flex items-center gap-3 mb-3">
          <Target size={18} className="text-orange-500" />
          <h3 className="text-sm font-semibold text-slate-800">Overall Progress</h3>
          <span className="ml-auto text-2xl font-bold text-orange-600">{overallProgress}%</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-slate-400">
          <span>{goals.filter((g) => g.current >= g.target).length} completed</span>
          <span>{goals.filter((g) => g.current < g.target).length} in progress</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {goals.map((goal, i) => {
            const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
            const completed = goal.current >= goal.target;
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-5 border border-[#E6E8EC] group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className="text-xs text-slate-400 font-medium">{goal.period}</span>
                    <h4 className="text-sm font-semibold text-slate-800 mt-0.5 leading-snug">{goal.title}</h4>
                  </div>
                  <div className="flex items-center gap-1">
                    {completed
                      ? <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" />
                      : <Circle size={18} className="text-slate-300 flex-shrink-0" />
                    }
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-medium text-slate-700">
                    {goal.unit === '₹' ? `${settings.currency}${goal.current.toLocaleString()}` : `${goal.current} ${goal.unit}`}
                  </span>
                  <span className={`font-bold text-base ${completed ? 'text-emerald-600' : 'text-orange-600'}`}>{progress}%</span>
                  <span>
                    {goal.unit === '₹' ? `${settings.currency}${goal.target.toLocaleString()}` : `${goal.target} ${goal.unit}`}
                  </span>
                </div>

                <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.6, delay: i * 0.06 }}
                    className={`h-full rounded-full ${completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-400 to-orange-600'}`}
                  />
                </div>

                <div className="space-y-1">
                  <input
                    type="range" min="0" max={goal.target} value={goal.current}
                    onChange={(e) => updateGoalProgress(goal.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 accent-orange-500 cursor-pointer"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Drag to update progress</span>
                    <input
                      type="number" min="0" max={goal.target} value={goal.current}
                      onChange={(e) => updateGoalProgress(goal.id, Math.min(goal.target, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="w-20 px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right outline-none"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {goals.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <Target size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No goals yet. Add your first goal!</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal title="Add Goal" onClose={() => setShowAddModal(false)}>
          <AddGoalForm onClose={() => setShowAddModal(false)} />
        </Modal>
      )}
    </ModuleLayout>
  );
}

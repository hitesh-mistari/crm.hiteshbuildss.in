import { motion } from 'framer-motion';
import { CheckSquare, DollarSign, Users, Lightbulb, FolderKanban } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState } from 'react';
import Modal from './Modal';
import QuickAddTask from './forms/QuickAddTask';
import QuickAddExpense from './forms/QuickAddExpense';
import QuickAddClient from './forms/QuickAddClient';
import QuickAddIdea from './forms/QuickAddIdea';
import NewProjectModal from '../modules/projects/NewProjectModal';

type FormType = 'task' | 'expense' | 'client' | 'idea' | 'project' | null;

const items = [
  { type: 'task' as FormType, label: 'Add Task', icon: CheckSquare, color: 'text-blue-600 bg-blue-50' },
  { type: 'project' as FormType, label: 'Add Project', icon: FolderKanban, color: 'text-blue-700 bg-blue-100' },
  { type: 'expense' as FormType, label: 'Add Expense', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
  { type: 'client' as FormType, label: 'Add Client', icon: Users, color: 'text-sky-600 bg-sky-50' },
  { type: 'idea' as FormType, label: 'Add Idea', icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50' },
];

export default function QuickAddDropdown() {
  const { toggleQuickAdd } = useStore();
  const [activeForm, setActiveForm] = useState<FormType>(null);

  const handleSelect = (type: FormType) => {
    toggleQuickAdd();
    setActiveForm(type);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-[#E6E8EC] overflow-hidden z-50 py-1"
      >
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              onClick={() => handleSelect(item.type)}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.color}`}>
                <Icon size={13} />
              </div>
              <span className="text-sm text-slate-700 font-medium">{item.label}</span>
            </button>
          );
        })}
      </motion.div>

      {activeForm === 'task' && <Modal title="Add Task" onClose={() => setActiveForm(null)}><QuickAddTask onClose={() => setActiveForm(null)} /></Modal>}
      {activeForm === 'project' && <Modal title="New Project" onClose={() => setActiveForm(null)}><NewProjectModal onClose={() => setActiveForm(null)} /></Modal>}
      {activeForm === 'expense' && <Modal title="Add Expense" onClose={() => setActiveForm(null)}><QuickAddExpense onClose={() => setActiveForm(null)} /></Modal>}
      {activeForm === 'client' && <Modal title="Add Client" onClose={() => setActiveForm(null)}><QuickAddClient onClose={() => setActiveForm(null)} /></Modal>}
      {activeForm === 'idea' && <Modal title="Add Idea" onClose={() => setActiveForm(null)}><QuickAddIdea onClose={() => setActiveForm(null)} /></Modal>}
    </>
  );
}

import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Priority } from '../../../types';

export default function QuickAddTask({ onClose }: { onClose: () => void }) {
  const { addTask } = useStore();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      id: `task${Date.now()}`,
      title: title.trim(),
      status: 'todo',
      priority,
      dueDate,
      description: '',
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Task Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Finish landing page"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">Add Task</button>
      </div>
    </form>
  );
}

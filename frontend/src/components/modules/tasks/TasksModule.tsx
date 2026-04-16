import { useState } from 'react';
import { Plus, Calendar, AlertCircle, ChevronRight, Trash2, Download, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleLayout from '../../layout/ModuleLayout';
import { useStore } from '../../../store/useStore';
import { Task, TaskStatus, Priority } from '../../../types';
import Modal from '../../common/Modal';
import { exportToCSV } from '../../../utils/csv';

const columns: { id: TaskStatus; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'todo', label: 'To Do', color: 'text-slate-700', bg: 'bg-slate-50', dot: 'bg-slate-400' },
  { id: 'inprogress', label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  { id: 'done', label: 'Done', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
];

const priorityConfig = {
  high: { color: 'text-red-600 bg-red-50', label: 'High' },
  medium: { color: 'text-yellow-600 bg-yellow-50', label: 'Med' },
  low: { color: 'text-green-600 bg-green-50', label: 'Low' },
};

const nextStatus: Record<TaskStatus, TaskStatus> = { todo: 'inprogress', inprogress: 'done', done: 'todo' };
const nextLabel: Record<TaskStatus, string> = { todo: 'Start', inprogress: 'Done', done: 'Reopen' };

const priorityOrder = { high: 3, medium: 2, low: 1 };

type UnifiedTask = (Task & { _type: 'task'; _projectName?: undefined }) | (import('../../../types').ProjectTask & { _type: 'project'; _projectName: string });

function TaskCard({ task }: { task: UnifiedTask }) {
  const { updateTaskStatus, deleteTask, updateProjectTaskStatus, deleteProjectTask, teamMembers } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.status !== 'done' && task.dueDate < today;
  const isDueToday = task.dueDate === today && task.status !== 'done';
  const assignee = teamMembers.find((m) => m.id === task.assignedTo);
  const pc = priorityConfig[task.priority];

  const handleAdvance = () => {
    if (task._type === 'task') updateTaskStatus(task.id, nextStatus[task.status]);
    else updateProjectTaskStatus(task.id, nextStatus[task.status]);
  };

  const handleDelete = () => {
    if (task._type === 'task') deleteTask(task.id);
    else deleteProjectTask(task.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-xl p-4 border shadow-sm group ${isOverdue ? 'border-red-200' : isDueToday ? 'border-orange-200' : 'border-[#E6E8EC]'}`}
    >
      {isOverdue && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertCircle size={10} className="text-red-500" />
          <span className="text-[10px] font-semibold text-red-500">OVERDUE</span>
        </div>
      )}
      {isDueToday && !isOverdue && (
        <div className="text-[10px] font-semibold text-orange-500 mb-1.5">DUE TODAY</div>
      )}
      <div className="flex items-center gap-2 mb-1.5">
        <p className="text-sm font-bold text-slate-800 leading-snug">
          {task._type === 'project' && (
            <span className="text-blue-600 mr-1.5 font-bold">[{task._projectName}]</span>
          )}
          {task.title}
        </p>
      </div>
      {'description' in task && task.description && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{task.description}</p>}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${pc.color}`}>{pc.label}</span>
          {task.dueDate && (
            <div className="flex items-center gap-0.5">
              <Calendar size={9} className="text-slate-400" />
              <span className="text-[10px] text-slate-400">{task.dueDate}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          {assignee && (
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
              {assignee.name.charAt(0)}
            </div>
          )}
          <button
            onClick={handleAdvance}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 text-[10px] text-blue-500 font-medium transition-opacity whitespace-nowrap">
            {nextLabel[task.status]} <ChevronRight size={9} />
          </button>
          <button
            onClick={handleDelete}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all">
            <Trash2 size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function AddTaskForm({ onClose }: { onClose: () => void }) {
  const { addTask, teamMembers } = useStore();
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' as Priority, dueDate: '', assignedTo: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask({
      id: `task${Date.now()}`,
      title: form.title.trim(),
      description: form.description,
      status: 'todo',
      priority: form.priority,
      dueDate: form.dueDate,
      assignedTo: form.assignedTo || undefined,
      createdAt: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Task Title *</label>
        <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Finish landing page" required
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Description</label>
        <textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Optional details..." rows={2}
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 resize-none" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Priority</label>
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Due Date</label>
          <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Assign To</label>
          <select value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
            <option value="">None</option>
            {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">Add Task</button>
      </div>
    </form>
  );
}

export default function TasksModule() {
  const { tasks, projectTasks, projects } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'standalone' | 'project'>('all');
  const today = new Date().toISOString().split('T')[0];

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.title]));

  const unifiedTasks: UnifiedTask[] = [
    ...tasks.map((t) => ({ ...t, _type: 'task' as const })),
    ...projectTasks.map((t) => ({ ...t, _type: 'project' as const, _projectName: projectMap[t.projectId] ?? 'Unknown Project' })),
  ];

  const overdueTasks = unifiedTasks.filter((t) => t.status !== 'done' && t.dueDate < today).length;
  const dueTodayTasks = unifiedTasks.filter((t) => t.dueDate === today && t.status !== 'done').length;

  const filteredTasks = unifiedTasks.filter((t) => {
    if (filter === 'today') return t.dueDate === today && t.status !== 'done';
    if (filter === 'overdue') return t.status !== 'done' && t.dueDate < today;
    if (filter === 'standalone') return t._type === 'task';
    if (filter === 'project') return t._type === 'project';
    return true;
  });

  const handleExport = () => {
    exportToCSV(
      unifiedTasks.map((t) => ({
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        source: t._type === 'project' ? `Project: ${t._projectName}` : 'Standalone',
      })),
      'tasks'
    );
  };

  return (
    <ModuleLayout
      title="Tasks"
      subtitle={overdueTasks > 0 ? `${overdueTasks} overdue` : undefined}
      accentColor="bg-blue-500"
      actions={
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-[#E6E8EC] text-slate-600 px-3.5 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
            <Download size={14} />
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
            <Plus size={15} /> Add Task
          </button>
        </div>
      }
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="flex gap-1 bg-white border border-[#E6E8EC] rounded-xl p-1 overflow-x-auto">
          {([
            { id: 'all', label: `All (${unifiedTasks.length})` },
            { id: 'standalone', label: `My Tasks (${tasks.length})` },
            { id: 'project', label: `Project Tasks (${projectTasks.length})` },
            { id: 'today', label: `Today (${dueTodayTasks})` },
            { id: 'overdue', label: `Overdue (${overdueTasks})` },
          ] as const).map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${filter === f.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-700'} ${f.id === 'overdue' && overdueTasks > 0 && filter !== 'overdue' ? 'text-red-500' : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {columns.map((col) => {
          const colTasks = filteredTasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
          return (
            <div key={col.id} className={`${col.bg} rounded-2xl p-4 border border-[#E6E8EC] min-h-64`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-white ${col.color}`}>{colTasks.length}</span>
              </div>
              <AnimatePresence>
                <div className="space-y-2.5">
                  {colTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                  {colTasks.length === 0 && (
                    <div className="text-center py-10">
                      <p className="text-xs text-slate-400">{filter !== 'all' ? 'No matching tasks' : 'Empty'}</p>
                    </div>
                  )}
                </div>
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <Modal title="Add Task" onClose={() => setShowAddModal(false)}>
          <AddTaskForm onClose={() => setShowAddModal(false)} />
        </Modal>
      )}
    </ModuleLayout>
  );
}

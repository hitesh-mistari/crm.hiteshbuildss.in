import { useState } from 'react';
import { Plus, Trash2, CheckSquare, Circle, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../../store/useStore';
import { ProjectTask, TaskStatus, Priority } from '../../../../types';

const statusCols: { id: TaskStatus; label: string; color: string; bg: string }[] = [
  { id: 'todo', label: 'To Do', color: 'text-slate-600', bg: 'bg-slate-100' },
  { id: 'inprogress', label: 'In Progress', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'done', label: 'Done', color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

const priorityOrder = { high: 3, medium: 2, low: 1 };

function AddTaskForm({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const { addProjectTask, teamMembers } = useStore();
  const [form, setForm] = useState({ title: '', priority: 'medium' as Priority, dueDate: '', assignedTo: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addProjectTask({
      id: `pt_${Date.now()}`,
      projectId,
      title: form.title.trim(),
      status: 'todo',
      priority: form.priority,
      dueDate: form.dueDate,
      assignedTo: form.assignedTo || undefined,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-xl space-y-3 mt-2">
      <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Task title..." required
        className="w-full px-3 py-2 bg-white rounded-lg text-sm outline-none border border-slate-200 focus:border-slate-400" />
      <div className="flex gap-2">
        <select value={form.priority} onChange={(e) => set('priority', e.target.value)}
          className="flex-1 px-3 py-2 bg-white rounded-lg text-xs outline-none border border-slate-200">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)}
          className="flex-1 px-3 py-2 bg-white rounded-lg text-xs outline-none border border-slate-200" />
      </div>
      <select value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}
        className="w-full px-3 py-2 bg-white rounded-lg text-xs outline-none border border-slate-200">
        <option value="">Unassigned</option>
        {teamMembers.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors">Add Task</button>
        <button type="button" onClick={onClose} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">Cancel</button>
      </div>
    </form>
  );
}

function TaskCard({ task }: { task: ProjectTask }) {
  const { updateProjectTaskStatus, deleteProjectTask, teamMembers } = useStore();
  const [delConfirm, setDelConfirm] = useState(false);
  const assignee = teamMembers.find((m) => m.id === task.assignedTo);
  const today = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'done';

  const nextStatus: Record<TaskStatus, TaskStatus> = { todo: 'inprogress', inprogress: 'done', done: 'todo' };
  const nextLabel: Record<TaskStatus, string> = { todo: 'Start', inprogress: 'Done', done: 'Reopen' };

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const NextIcon = task.status === 'done' ? Circle : task.status === 'inprogress' ? CheckSquare : ArrowRight;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-3 bg-white rounded-xl border group ${task.status === 'done' ? 'border-slate-100 opacity-60' : 'border-[#E6E8EC] hover:border-slate-300'}`}
    >
      <div className="flex items-start gap-2">
        <button onClick={() => updateProjectTaskStatus(task.id, nextStatus)} className="mt-0.5 flex-shrink-0">
          <NextIcon size={15} className={task.status === 'done' ? 'text-emerald-500' : 'text-slate-300 hover:text-blue-500 transition-colors'} />
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-tight ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${task.priority === 'high' ? 'bg-red-50 text-red-500' : task.priority === 'medium' ? 'bg-yellow-50 text-yellow-500' : 'bg-green-50 text-green-500'}`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                <Clock size={9} /> {task.dueDate}
              </span>
            )}
            {assignee && (
              <span className="text-[10px] text-slate-400">{assignee.name}</span>
            )}
          </div>
        </div>
        {delConfirm ? (
          <div className="flex gap-1">
            <button onClick={() => deleteProjectTask(task.id)} className="text-[10px] px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Del</button>
            <button onClick={() => setDelConfirm(false)} className="text-[10px] px-2 py-1 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">No</button>
          </div>
        ) : (
          <button onClick={() => setDelConfirm(true)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-red-50">
            <Trash2 size={12} className="text-slate-300 hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function TasksSection({ projectId }: { projectId: string }) {
  const { projectTasks } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const tasks = projectTasks.filter((t) => t.projectId === projectId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{tasks.length} tasks total</p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors"
        >
          <Plus size={12} /> Add Task
        </button>
      </div>

      {showAdd && <AddTaskForm projectId={projectId} onClose={() => setShowAdd(false)} />}

      <div className="grid grid-cols-3 gap-4">
        {statusCols.map((col) => {
          const colTasks = tasks
            .filter((t) => t.status === col.id)
            .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
          return (
            <div key={col.id}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${col.bg} mb-3`}>
                <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                <span className={`text-xs font-bold ${col.color}`}>({colTasks.length})</span>
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {colTasks.map((task) => <TaskCard key={task.id} task={task} />)}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No tasks</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

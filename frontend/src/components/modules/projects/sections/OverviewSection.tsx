import { useState } from 'react';
import { CreditCard as Edit2, Save, X, Calendar, Tag, User, Trash2, ShieldAlert } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { Project, ProjectStatus, Priority } from '../../../../types';

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  paused: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

const priorityColors: Record<string, string> = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-green-600 bg-green-50',
};

export default function OverviewSection({ project }: { project: Project }) {
  const { updateProject, deleteProject, closeProject, projectTasks, clients } = useStore();
  const [editing, setEditing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    description: project.description,
    status: project.status as ProjectStatus,
    priority: project.priority as Priority,
    targetDate: project.targetDate,
    budget: project.budget?.toString() || '',
    paidAmount: project.paidAmount?.toString() || '0',
    ownerId: project.ownerId || 'local',
  });

  const tasks = projectTasks.filter((t) => t.projectId === project.id);
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const linkedClient = clients.find((c) => c.id === project.linkedClientId);

  const handleSave = () => {
    updateProject(project.id, {
      ...form,
      budget: form.budget ? parseFloat(form.budget) : undefined,
      paidAmount: form.paidAmount ? parseFloat(form.paidAmount) : undefined,
    });
    setEditing(false);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    closeProject();
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-white rounded-2xl border border-[#E6E8EC] p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl">{project.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[project.status]}`}>
                  {project.status}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${priorityColors[project.priority]}`}>
                  {project.priority} priority
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            {editing ? <X size={16} /> : <Edit2 size={16} />}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Project description..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 resize-none"
            />
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
                  className="w-full px-3 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none"
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                  className="w-full px-3 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target Date</label>
                <input
                  type="date"
                  value={form.targetDate}
                  onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Total Budget</label>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Owner / Lead</label>
                <select
                  value={form.ownerId}
                  onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none"
                >
                  <option value="local">You (Founderos)</option>
                  {useStore.getState().teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Paid Amount</label>
                <input
                  type="number"
                  value={form.paidAmount}
                  onChange={(e) => setForm((f) => ({ ...f, paidAmount: e.target.value }))}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
                <Save size={13} /> Save
              </button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-600 leading-relaxed">
            {project.description || <span className="text-slate-400 italic">No description yet. Click edit to add one.</span>}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E6E8EC] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
              <div className="w-4 h-4 rounded-full border-2 border-blue-500 relative">
                <div
                  className="absolute inset-0 rounded-full bg-blue-500 origin-center"
                  style={{ clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((progress / 100) * 2 * Math.PI - Math.PI / 2)}% ${50 - 50 * Math.sin((progress / 100) * 2 * Math.PI - Math.PI / 2)}%, 50% 50%)` }}
                />
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Progress</span>
          </div>
          <p className="text-3xl font-bold text-slate-900">{progress}%</p>
          <p className="text-xs text-slate-500 mt-1">{doneTasks}/{tasks.length} tasks done</p>
          <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {project.targetDate && (
          <div className="bg-white rounded-2xl border border-[#E6E8EC] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
                <Calendar size={14} className="text-orange-500" />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Deadline</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{new Date(project.targetDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p className="text-xs text-slate-500 mt-1">
              {Math.ceil((new Date(project.targetDate).getTime() - Date.now()) / 86400000)} days remaining
            </p>
          </div>
        )}

        {linkedClient && (
          <div className="bg-white rounded-2xl border border-[#E6E8EC] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-sky-50 rounded-xl flex items-center justify-center">
                <User size={14} className="text-sky-500" />
              </div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Client</span>
            </div>
            <p className="text-sm font-bold text-slate-900">{linkedClient.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">{linkedClient.company}</p>
          </div>
        )}
      </div>

      {project.tags.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E6E8EC] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={13} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="text-xs px-3 py-1 bg-slate-100 text-slate-600 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="pt-6 border-t border-red-100">
        <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
        {deleteConfirm ? (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-sm font-bold text-red-900">Are you absolutely sure?</h4>
              <p className="text-xs text-red-600 mt-0.5">This action will permanently delete "{project.title}" and all its tasks, notes, and records. This cannot be undone.</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-md active:scale-95">Yes, Delete Forever</button>
              <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">Cancel</button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 w-full py-4 bg-white border border-red-100 rounded-2xl text-red-500 text-sm font-bold hover:bg-red-50 transition-all group"
          >
            <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
            Delete This Project
          </button>
        )}
      </div>
    </div>
  );
}

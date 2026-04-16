import { useState } from 'react';
import { Plus, CheckSquare, Clock, User, Trash2, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleLayout from '../../layout/ModuleLayout';
import { useStore } from '../../../store/useStore';
import Modal from '../../common/Modal';

function AddMemberForm({ onClose }: { onClose: () => void }) {
  const { addTeamMember } = useStore();
  const [form, setForm] = useState({ name: '', role: '', email: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return;
    addTeamMember({
      id: `tm${Date.now()}`,
      name: form.name.trim(),
      role: form.role.trim(),
      email: form.email.trim(),
      joinedAt: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Name *</label>
        <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Priya Sharma" required
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Role *</label>
        <input value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="e.g. Frontend Developer" required
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
        <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@company.com"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">Add Member</button>
      </div>
    </form>
  );
}

export default function TeamModule() {
  const { teamMembers, tasks, deleteTeamMember } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  return (
    <ModuleLayout
      title="Team"
      subtitle={`${teamMembers.length} member${teamMembers.length !== 1 ? 's' : ''}`}
      accentColor="bg-blue-500"
      actions={
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
          <Plus size={15} /> Add Member
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-6">
        <AnimatePresence>
          {teamMembers.map((member, i) => {
            const assignedTasks = tasks.filter((t) => t.assignedTo === member.id);
            const completedTasks = assignedTasks.filter((t) => t.status === 'done');
            const inProgressTasks = assignedTasks.filter((t) => t.status === 'inprogress');
            const todoTasks = assignedTasks.filter((t) => t.status === 'todo');
            const completionRate = assignedTasks.length > 0
              ? Math.round((completedTasks.length / assignedTasks.length) * 100)
              : 0;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden group"
              >
                <div className="p-6 border-b border-[#E6E8EC]">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 truncate">{member.name}</h3>
                      <p className="text-sm text-slate-500">{member.role}</p>
                      {member.email && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Mail size={10} className="text-slate-400" />
                          <p className="text-xs text-slate-400 truncate">{member.email}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">{completionRate}%</p>
                        <p className="text-xs text-slate-400">completion</p>
                      </div>
                      {deleteConfirm === member.id ? (
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => { deleteTeamMember(member.id); setDeleteConfirm(null); }}
                            className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">
                            Remove
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(member.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        transition={{ duration: 0.8, delay: i * 0.08 }}
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 grid grid-cols-3 gap-3 bg-slate-50/50">
                  {[
                    { label: 'Todo', count: todoTasks.length, icon: Clock, color: 'text-slate-600 bg-slate-100' },
                    { label: 'In Progress', count: inProgressTasks.length, icon: User, color: 'text-blue-600 bg-blue-50' },
                    { label: 'Completed', count: completedTasks.length, icon: CheckSquare, color: 'text-emerald-600 bg-emerald-50' },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="text-center">
                        <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-1.5`}>
                          <Icon size={14} />
                        </div>
                        <p className="text-lg font-bold text-slate-900">{stat.count}</p>
                        <p className="text-[10px] text-slate-500">{stat.label}</p>
                      </div>
                    );
                  })}
                </div>

                {assignedTasks.length > 0 && (
                  <div className="px-5 py-4">
                    <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Assigned Tasks</h4>
                    <div className="space-y-2">
                      {assignedTasks.slice(0, 4).map((task) => (
                        <div key={task.id} className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${task.status === 'done' ? 'bg-emerald-500' : task.status === 'inprogress' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                          <span className={`text-xs flex-1 truncate ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {task.title}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${task.priority === 'high' ? 'bg-red-50 text-red-500' : task.priority === 'medium' ? 'bg-yellow-50 text-yellow-500' : 'bg-green-50 text-green-500'}`}>
                            {task.priority}
                          </span>
                        </div>
                      ))}
                      {assignedTasks.length > 4 && (
                        <p className="text-xs text-slate-400">+{assignedTasks.length - 4} more tasks</p>
                      )}
                    </div>
                  </div>
                )}

                {assignedTasks.length === 0 && (
                  <div className="px-5 py-4 text-center">
                    <p className="text-xs text-slate-400">No tasks assigned yet</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {teamMembers.length === 0 && (
          <div className="col-span-2 text-center py-16">
            <User size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No team members yet. Add your first member!</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <Modal title="Add Team Member" onClose={() => setShowAddModal(false)}>
          <AddMemberForm onClose={() => setShowAddModal(false)} />
        </Modal>
      )}
    </ModuleLayout>
  );
}

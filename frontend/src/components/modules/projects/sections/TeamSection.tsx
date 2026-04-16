import { useState } from 'react';
import { UserPlus, Trash2, Shield, Eye, CreditCard as Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../../store/useStore';
import { ProjectMember } from '../../../../types';

const roleIcons = { owner: Shield, editor: Edit, viewer: Eye };
const roleColors = {
  owner: 'bg-slate-900 text-white',
  editor: 'bg-blue-50 text-blue-700',
  viewer: 'bg-slate-100 text-slate-600',
};

export default function TeamSection({ projectId }: { projectId: string }) {
  const { projectMembers, teamMembers, addProjectMember, removeProjectMember } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ teamMemberId: '', role: 'editor' as ProjectMember['role'] });

  const members = projectMembers.filter((m) => m.projectId === projectId);
  const alreadyAdded = new Set(members.map((m) => m.teamMemberId));
  const available = teamMembers.filter((m) => !alreadyAdded.has(m.id));

  const handleAdd = () => {
    if (!form.teamMemberId) return;
    addProjectMember({
      id: `pm_${Date.now()}`,
      projectId,
      userId: 'local',
      teamMemberId: form.teamMemberId,
      role: form.role,
      joinedAt: new Date().toISOString(),
    });
    setForm({ teamMemberId: '', role: 'editor' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        {available.length > 0 && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors"
          >
            <UserPlus size={12} /> Add Member
          </button>
        )}
      </div>

      {showAdd && (
        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
          <select
            value={form.teamMemberId}
            onChange={(e) => setForm((f) => ({ ...f, teamMemberId: e.target.value }))}
            className="w-full px-3 py-2 bg-white rounded-lg text-sm outline-none border border-slate-200"
          >
            <option value="">Select team member...</option>
            {available.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
          </select>
          <select
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as ProjectMember['role'] }))}
            className="w-full px-3 py-2 bg-white rounded-lg text-sm outline-none border border-slate-200"
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
            <option value="owner">Owner</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!form.teamMemberId}
              className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors disabled:opacity-50">
              Add
            </button>
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <AnimatePresence>
          {members.map((m) => {
            const tm = teamMembers.find((t) => t.id === m.teamMemberId);
            if (!tm) return null;
            const RoleIcon = roleIcons[m.role];
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-[#E6E8EC] group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {tm.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{tm.name}</p>
                  <p className="text-xs text-slate-500">{tm.role} • {tm.email}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${roleColors[m.role]}`}>
                  <RoleIcon size={11} />
                  {m.role}
                </div>
                {m.role !== 'owner' && (
                  <button
                    onClick={() => removeProjectMember(projectId, m.teamMemberId!)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {members.length === 0 && !showAdd && (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">No team members added yet.</p>
        </div>
      )}
    </div>
  );
}

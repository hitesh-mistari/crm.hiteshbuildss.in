import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { Project, ProjectStatus, Priority } from '../../../types';
import { Briefcase, User, ArrowLeft, Send } from 'lucide-react';

const EMOJIS = ['🚀', '💡', '🎯', '🛠️', '📱', '🌐', '💼', '🔥', '✨', '📊', '🤝', '🎨'];
const COLORS = ['blue', 'emerald', 'rose', 'orange', 'teal', 'sky', 'yellow', 'slate'];

export default function NewProjectModal({ onClose }: { onClose: () => void }) {
  const { addProject, clients, teamMembers, addClient } = useStore();
  const [step, setStep] = useState(0);
  const [projectType, setProjectType] = useState<'client' | 'self'>('self');
  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [newClientData, setNewClientData] = useState({ name: '', company: '' });

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'active' as ProjectStatus,
    priority: 'medium' as Priority,
    coverColor: 'blue',
    emoji: '🚀',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    linkedClientId: '',
    ownerId: '',
    tags: '',
    budget: '',
    paidAmount: '0',
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleQuickAddClient = () => {
    if (!newClientData.name.trim()) return;
    const cid = `client_${Date.now()}`;
    addClient({
      id: cid,
      name: newClientData.name.trim(),
      company: newClientData.company.trim(),
      email: '',
      phone: '',
      status: 'active',
      totalAmount: 0,
      paidAmount: 0,
      projects: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    set('linkedClientId', cid);
    setShowNewClientForm(false);
    setNewClientData({ name: '', company: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const now = new Date().toISOString();
    addProject({
      id: `proj_${Date.now()}`,
      title: form.title.trim(),
      description: form.description,
      status: form.status,
      priority: form.priority,
      coverColor: form.coverColor,
      emoji: form.emoji,
      startDate: form.startDate,
      targetDate: form.targetDate,
      ownerId: form.ownerId || 'local',
      linkedClientId: projectType === 'client' ? (form.linkedClientId || undefined) : undefined,
      budget: projectType === 'client' && form.budget ? parseFloat(form.budget) : undefined,
      paidAmount: projectType === 'client' && form.paidAmount ? parseFloat(form.paidAmount) : undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      createdAt: now,
      updatedAt: now,
    } as Project);
    onClose();
  };

  if (step === 0) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-slate-900">What kind of project?</h2>
          <p className="text-sm text-slate-500 text-balance px-4">Choose a type to customize your workflow and tracking options.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => { setProjectType('client'); setStep(1); }}
            className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-slate-900 hover:bg-white transition-all group text-left"
          >
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900">Client Project</h3>
              <p className="text-[11px] text-slate-500 mt-1 balance">Track budgets, payments, and client relationships.</p>
            </div>
          </button>

          <button
            onClick={() => { setProjectType('self'); setStep(1); }}
            className="flex flex-col items-center gap-4 p-6 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-slate-900 hover:bg-white transition-all group text-left"
          >
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-900">Self Project</h3>
              <p className="text-[11px] text-slate-500 mt-1 balance">Internal tools, personal projects, or open source.</p>
            </div>
          </button>
        </div>

        <button onClick={onClose} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setStep(0)} className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 capitalize">{projectType} Project Details</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <select
            value={form.emoji}
            onChange={(e) => set('emoji', e.target.value)}
            className="w-12 h-12 text-xl text-center bg-slate-100 rounded-xl border-0 outline-none cursor-pointer appearance-none"
          >
            {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project Name *</label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Landing Page"
            required
            className="w-full px-3 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Status</label>
          <select value={form.status} onChange={(e) => set('status', e.target.value)}
            className="w-full px-2.5 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
          <select value={form.priority} onChange={(e) => set('priority', e.target.value)}
            className="w-full px-2.5 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Owner</label>
          <select value={form.ownerId} onChange={(e) => set('ownerId', e.target.value)}
            className="w-full px-2.5 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
            <option value="local">You</option>
            {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name.split(' ')[0]}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
        <input
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder="Short project summary..."
          className="w-full px-3 py-2 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {projectType === 'client' ? (
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Client</label>
              <button 
                type="button" 
                onClick={() => setShowNewClientForm(!showNewClientForm)}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase"
              >
                {showNewClientForm ? 'Cancel' : '+ New'}
              </button>
            </div>
            {showNewClientForm ? (
              <div className="space-y-1.5 p-2 bg-white border border-blue-100 rounded-xl shadow-sm">
                <input 
                  placeholder="Name"
                  value={newClientData.name}
                  onChange={(e) => setNewClientData(d => ({ ...d, name: e.target.value }))}
                  className="w-full px-2 py-1 bg-slate-50 rounded-lg text-xs outline-none"
                />
                <button 
                  type="button"
                  onClick={handleQuickAddClient}
                  disabled={!newClientData.name.trim()}
                  className="w-full py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  Add
                </button>
              </div>
            ) : (
              <select value={form.linkedClientId} onChange={(e) => set('linkedClientId', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-[#F5F7FA] rounded-xl text-sm outline-none">
                <option value="">None</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="comma, separated"
              className="w-full px-2.5 py-1.5 bg-[#F5F7FA] rounded-xl text-sm outline-none" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start</label>
            <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)}
              className="w-full px-2 py-1.5 bg-[#F5F7FA] rounded-xl text-[11px] outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target</label>
            <input type="date" value={form.targetDate} onChange={(e) => set('targetDate', e.target.value)}
              className="w-full px-2 py-1.5 bg-[#F5F7FA] rounded-xl text-[11px] outline-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {projectType === 'client' && (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Financials (Budget / Paid)</label>
            <div className="flex gap-2">
              <input type="number" value={form.budget} onChange={(e) => set('budget', e.target.value)} placeholder="Budget"
                className="flex-1 px-2.5 py-1.5 bg-[#F5F7FA] rounded-xl text-sm outline-none" />
              <input type="number" value={form.paidAmount} onChange={(e) => set('paidAmount', e.target.value)} placeholder="Paid"
                className="flex-1 px-2.5 py-1.5 bg-[#F5F7FA] rounded-xl text-sm outline-none" />
            </div>
          </div>
        )}
        <div className={projectType === 'self' ? 'col-span-2' : ''}>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Cover & Appearance</label>
          <div className="flex gap-2 items-center h-8">
            {COLORS.map((c) => (
              <button
                key={c} type="button"
                onClick={() => set('coverColor', c)}
                className={`w-5 h-5 rounded-full ${c === 'blue' ? 'bg-blue-500' : c === 'emerald' ? 'bg-emerald-500' : c === 'rose' ? 'bg-rose-500' : c === 'orange' ? 'bg-orange-500' : c === 'teal' ? 'bg-teal-500' : c === 'sky' ? 'bg-sky-500' : c === 'yellow' ? 'bg-yellow-500' : 'bg-slate-500'} transition-transform ${form.coverColor === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : 'hover:scale-105'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {projectType === 'client' && (
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags (comma-separated)</label>
          <input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="design, dev, q1"
            className="w-full px-2.5 py-1.5 bg-[#F5F7FA] rounded-xl text-sm outline-none" />
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit" className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
          <Send size={16} /> Create Project
        </button>
      </div>
    </form>
  );
}

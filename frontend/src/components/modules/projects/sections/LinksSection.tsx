import { useState } from 'react';
import { Plus, Trash2, ExternalLink, Globe, FileText, Code, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../../store/useStore';
import { ProjectLink } from '../../../../types';

const categoryIcons = { design: Palette, doc: FileText, repo: Code, other: Globe };
const categoryColors = {
  design: 'bg-rose-50 text-rose-600',
  doc: 'bg-blue-50 text-blue-600',
  repo: 'bg-slate-900 text-white',
  other: 'bg-slate-100 text-slate-600',
};

export default function LinksSection({ projectId }: { projectId: string }) {
  const { projectLinks, addProjectLink, deleteProjectLink } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', category: 'other' as ProjectLink['category'] });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const links = projectLinks.filter((l) => l.projectId === projectId);

  const handleAdd = () => {
    if (!form.title.trim() || !form.url.trim()) return;
    addProjectLink({
      id: `pl_${Date.now()}`,
      projectId,
      title: form.title.trim(),
      url: form.url.trim(),
      category: form.category,
      addedAt: new Date().toISOString(),
    });
    setForm({ title: '', url: '', category: 'other' });
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{links.length} links</p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors"
        >
          <Plus size={12} /> Add Link
        </button>
      </div>

      {showAdd && (
        <div className="p-4 bg-slate-50 rounded-xl space-y-3">
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Link title"
            className="w-full px-3 py-2 bg-white rounded-lg text-sm outline-none border border-slate-200 focus:border-slate-400" />
          <input value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..."
            className="w-full px-3 py-2 bg-white rounded-lg text-sm outline-none border border-slate-200 focus:border-slate-400" />
          <select value={form.category} onChange={(e) => set('category', e.target.value)}
            className="w-full px-3 py-2 bg-white rounded-lg text-sm outline-none border border-slate-200">
            <option value="design">Design</option>
            <option value="doc">Document</option>
            <option value="repo">Repository</option>
            <option value="other">Other</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors">Add</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {links.map((link) => {
            const Icon = categoryIcons[link.category];
            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-[#E6E8EC] hover:border-slate-300 group transition-colors"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[link.category]}`}>
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{link.title}</p>
                  <p className="text-xs text-slate-400 truncate">{link.url}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={link.url} target="_blank" rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
                    <ExternalLink size={13} />
                  </a>
                  <button onClick={() => deleteProjectLink(link.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {links.length === 0 && !showAdd && (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">No links added yet.</p>
        </div>
      )}
    </div>
  );
}

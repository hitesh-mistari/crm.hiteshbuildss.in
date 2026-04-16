import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, CheckSquare, Users, Lightbulb, FolderKanban } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useState } from 'react';

export default function SearchModal() {
  const { tasks, clients, ideas, projects, toggleSearch, setActiveView, openProject } = useStore();
  const [query, setQuery] = useState('');

  const q = query.toLowerCase();
  const filteredTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q)) : [];
  const filteredClients = q ? clients.filter(c => c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q)) : [];
  const filteredIdeas = q ? ideas.filter(i => i.title.toLowerCase().includes(q)) : [];
  const filteredProjects = q ? projects.filter(p => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : [];
  const hasResults = filteredTasks.length > 0 || filteredClients.length > 0 || filteredIdeas.length > 0 || filteredProjects.length > 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-start justify-center pt-24 px-4"
        onClick={toggleSearch}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E6E8EC]">
            <Search size={16} className="text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Escape' && toggleSearch()}
              placeholder="Search projects, tasks, clients, ideas..."
              className="flex-1 text-sm text-slate-800 outline-none"
            />
            <button onClick={toggleSearch} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
              <X size={15} />
            </button>
          </div>

          {query && (
            <div className="max-h-96 overflow-y-auto py-2">
              {!hasResults && (
                <p className="text-sm text-slate-400 text-center py-6">No results for "{query}"</p>
              )}

              {filteredProjects.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Projects</p>
                  {filteredProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { openProject(p.id); toggleSearch(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-base">{p.emoji}</span>
                      <span className="text-sm text-slate-700 flex-1 text-left">{p.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${p.status === 'active' ? 'bg-blue-50 text-blue-600' : p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>{p.status}</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredTasks.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tasks</p>
                  {filteredTasks.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveView('tasks'); toggleSearch(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <CheckSquare size={14} className="text-blue-500" />
                      <span className="text-sm text-slate-700 flex-1 text-left">{t.title}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${t.priority === 'high' ? 'bg-red-50 text-red-600' : t.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>{t.priority}</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredClients.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Clients</p>
                  {filteredClients.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setActiveView('clients'); toggleSearch(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <Users size={14} className="text-sky-500" />
                      <span className="text-sm text-slate-700 flex-1 text-left">{c.name}</span>
                      <span className="ml-auto text-xs text-slate-400">{c.company}</span>
                    </button>
                  ))}
                </div>
              )}

              {filteredIdeas.length > 0 && (
                <div>
                  <p className="px-4 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Ideas</p>
                  {filteredIdeas.map(i => (
                    <button
                      key={i.id}
                      onClick={() => { setActiveView('ideas'); toggleSearch(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <Lightbulb size={14} className="text-yellow-500" />
                      <span className="text-sm text-slate-700 flex-1 text-left">{i.title}</span>
                      <span className="ml-auto text-[10px] text-slate-400 capitalize">{i.stage}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!query && (
            <div className="px-4 py-6 text-center">
              <div className="flex items-center justify-center gap-4 mb-3">
                <FolderKanban size={18} className="text-slate-300" />
                <CheckSquare size={18} className="text-slate-300" />
                <Users size={18} className="text-slate-300" />
                <Lightbulb size={18} className="text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">Search across projects, tasks, clients, and ideas</p>
              <p className="text-xs text-slate-300 mt-1">Press Esc to close</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

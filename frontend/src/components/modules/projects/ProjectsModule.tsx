import { useState } from 'react';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { ProjectStatus } from '../../../types';
import ProjectCard from './ProjectCard';
import ProjectDetailView from './ProjectDetailView';
import Modal from '../../common/Modal';
import NewProjectModal from './NewProjectModal';

const STATUS_FILTERS: { id: ProjectStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'paused', label: 'Paused' },
  { id: 'completed', label: 'Completed' },
  { id: 'archived', label: 'Archived' },
];

export default function ProjectsModule() {
  const { activeProjectId, projects } = useStore();

  if (activeProjectId) {
    return <ProjectDetailView />;
  }

  return <ProjectListView />;
}

function ProjectListView() {
  const { projects, setActiveView } = useStore();
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const filtered = projects.filter((p) => {
    const matchStatus = filter === 'all' || p.status === filter;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const activeCount = projects.filter((p) => p.status === 'active').length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="p-4 md:p-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5 md:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Projects</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">
              {projects.length === 0 ? 'Your Projects' : `${activeCount} Active Project${activeCount !== 1 ? 's' : ''}`}
            </h1>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-3.5 md:px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors min-h-[44px]"
          >
            <Plus size={15} /> <span className="hidden sm:inline">New Project</span><span className="sm:hidden">New</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5 md:mb-6">
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E6E8EC] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-[#E6E8EC] rounded-xl p-1 overflow-x-auto">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                  filter === f.id ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {f.label}
                {f.id !== 'all' && (
                  <span className="ml-1 opacity-60">
                    ({projects.filter((p) => p.status === f.id).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderKanban size={28} className="text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">
              {projects.length === 0 ? 'No projects yet' : 'No matching projects'}
            </h3>
            <p className="text-sm text-slate-400 mb-5">
              {projects.length === 0 ? 'Create your first project to start building' : 'Try a different filter or search term'}
            </p>
            {projects.length === 0 && (
              <button
                onClick={() => setShowNewModal(true)}
                className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
              >
                Create First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        )}
      </div>

      {showNewModal && (
        <Modal title="New Project" onClose={() => setShowNewModal(false)}>
          <NewProjectModal onClose={() => setShowNewModal(false)} />
        </Modal>
      )}
    </motion.div>
  );
}

import { ArrowLeft, MoreHorizontal, Archive, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useStore } from '../../../store/useStore';
import { ProjectSectionId } from '../../../types';
import OverviewSection from './sections/OverviewSection';
import TasksSection from './sections/TasksSection';
import NotesSection from './sections/NotesSection';
import TeamSection from './sections/TeamSection';
import LinksSection from './sections/LinksSection';

const SECTIONS: { id: ProjectSectionId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'notes', label: 'Notes' },
  { id: 'docs', label: 'Docs' },
  { id: 'team', label: 'Team' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'meetings', label: 'Meetings' },
  { id: 'links', label: 'Links' },
];

const colorMap: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  orange: 'bg-orange-500',
  teal: 'bg-teal-500',
  sky: 'bg-sky-500',
  yellow: 'bg-yellow-500',
  slate: 'bg-slate-500',
};

export default function ProjectDetailView() {
  const {
    activeProjectId, activeProjectSection, setActiveProjectSection,
    closeProject, projects, deleteProject, updateProject,
    projectTasks,
  } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const project = projects.find((p) => p.id === activeProjectId);
  if (!project) return null;

  const tasks = projectTasks.filter((t) => t.projectId === project.id);
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  const handleDelete = () => {
    deleteProject(project.id);
    closeProject();
  };

  const renderSection = () => {
    switch (activeProjectSection) {
      case 'overview': return <OverviewSection project={project} />;
      case 'tasks': return <TasksSection projectId={project.id} />;
      case 'notes': return <NotesSection projectId={project.id} sectionId="notes" title="Notes" placeholder="New note title..." />;
      case 'docs': return <NotesSection projectId={project.id} sectionId="docs" title="Docs" placeholder="Document title..." />;
      case 'team': return <TeamSection projectId={project.id} />;
      case 'decisions': return <NotesSection projectId={project.id} sectionId="decisions" title="Decisions" placeholder="Decision title..." />;
      case 'meetings': return <NotesSection projectId={project.id} sectionId="meetings" title="Meeting Notes" placeholder="Meeting title..." />;
      case 'links': return <LinksSection projectId={project.id} />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-[#F5F7FA]"
    >
      <div className="sticky top-16 z-30 bg-white border-b border-[#E6E8EC]">
        <div className="flex items-center gap-0 px-4 md:px-6">
          <button
            onClick={closeProject}
            className="flex items-center gap-2 py-4 pr-4 md:pr-6 mr-2 md:mr-3 border-r border-[#E6E8EC] text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0 min-h-[52px]"
          >
            <ArrowLeft size={15} />
            <span className="text-xs font-medium hidden sm:inline">Projects</span>
          </button>

          <div className="flex items-center gap-2 px-2 md:px-4 py-3 border-r border-[#E6E8EC] flex-shrink-0 min-w-0">
            <span className="text-lg flex-shrink-0">{project.emoji}</span>
            <span className="text-sm font-bold text-slate-900 truncate max-w-[80px] sm:max-w-[160px]">{project.title}</span>
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colorMap[project.coverColor] || 'bg-blue-500'}`} />
          </div>

          <div className="flex items-center overflow-x-auto scrollbar-hide flex-1 px-1">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveProjectSection(sec.id)}
                className={`px-2.5 md:px-3 py-4 text-xs font-medium whitespace-nowrap transition-colors border-b-2 flex-shrink-0 min-h-[52px] ${
                  activeProjectSection === sec.id
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {sec.label}
                {sec.id === 'tasks' && tasks.length > 0 && (
                  <span className="ml-1 text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                    {doneTasks}/{tasks.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <MoreHorizontal size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-[#E6E8EC] shadow-lg py-1 z-50">
                <button
                  onClick={() => { updateProject(project.id, { status: 'archived' }); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors min-h-[44px]"
                >
                  <Archive size={14} /> Archive Project
                </button>
                {deleteConfirm ? (
                  <div className="px-3 py-2">
                    <p className="text-xs text-red-600 font-medium mb-2">Delete permanently?</p>
                    <div className="flex gap-2">
                      <button onClick={handleDelete} className="flex-1 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors">Delete</button>
                      <button onClick={() => setDeleteConfirm(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(true)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors min-h-[44px]"
                  >
                    <Trash2 size={14} /> Delete Project
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 py-4 md:py-6 max-w-5xl mx-auto">
        {renderSection()}
      </div>
    </motion.div>
  );
}

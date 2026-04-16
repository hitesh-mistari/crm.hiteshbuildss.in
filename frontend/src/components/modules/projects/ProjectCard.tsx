import { Calendar, Users, CheckSquare, ArrowRight, CalendarDays, Briefcase, User, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Project } from '../../../types';
import { useStore } from '../../../store/useStore';

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

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  paused: 'bg-yellow-50 text-yellow-700',
  completed: 'bg-blue-50 text-blue-700',
  archived: 'bg-slate-100 text-slate-500',
};

function daysLeft(targetDate: string): string | null {
  if (!targetDate) return null;
  const diff = Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff < 7) return `${diff}d left`;
  if (diff < 30) return `${Math.ceil(diff / 7)}w left`;
  return `${Math.ceil(diff / 30)}mo left`;
}

export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { openProject, deleteProject, projectTasks, projectMembers, teamMembers, clients, settings } = useStore();
  const tasks = projectTasks.filter((t) => t.projectId === project.id);
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const progress = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const members = projectMembers.filter((m) => m.projectId === project.id);
  const dl = daysLeft(project.targetDate);
  const isOverdue = dl?.includes('overdue');
  const client = clients.find((c) => c.id === project.linkedClientId);
  const owner = project.ownerId === 'local' ? { name: 'You' } : teamMembers.find((m) => m.id === project.ownerId);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      deleteProject(project.id);
    }
  };

  const formattedStartDate = project.startDate
    ? new Date(project.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const formattedUpdatedAt = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => openProject(project.id)}
      className="bg-white rounded-2xl border border-[#E6E8EC] hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group overflow-hidden flex flex-col h-full"
    >
      <div className={`h-2 ${colorMap[project.coverColor] || 'bg-blue-500'}`} />

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <span className="text-4xl leading-none group-hover:scale-110 transition-transform">{project.emoji}</span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors uppercase">{project.title}</h3>
              {client && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Briefcase size={10} className="text-slate-400" />
                  <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{client.name}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${statusColors[project.status]}`}>
              {project.status}
            </span>
            <button 
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              title="Delete Project"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {project.description && (
          <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed italic">
            "{project.description}"
          </p>
        )}

        <div className="mb-4 mt-auto">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
              <CheckSquare size={12} className="text-slate-400" />
              <span>Project Progress</span>
            </div>
            <span className="text-xs font-bold text-slate-700">{progress}%</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${colorMap[project.coverColor] || 'bg-blue-500'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
            <span>{doneTasks} completed</span>
            <span>{tasks.length} total tasks</span>
          </div>
        </div>

        {project.budget && project.budget > 0 && (
          <div className="mb-4 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Project Budget</span>
              <span className="text-[11px] font-bold text-slate-900">{settings.currency}{project.budget.toLocaleString()}</span>
            </div>
            <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500" 
                style={{ width: `${((project.paidAmount || 0) / project.budget) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-slate-400">
              <span>Paid: {settings.currency}{(project.paidAmount || 0).toLocaleString()}</span>
              <span>{Math.round(((project.paidAmount || 0) / project.budget) * 100)}%</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Start Date</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <CalendarDays size={12} className="text-slate-400" />
              <span className="font-semibold">{formattedStartDate || 'N/A'}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Project Lead</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <User size={12} className="text-slate-400" />
              <span className="font-semibold">{owner?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-50">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Deadline</span>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${isOverdue ? 'text-red-500' : dl ? 'text-slate-700' : 'text-slate-400 italic'}`}>
              <Calendar size={12} />
              <span>{dl || 'No deadline'}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-1.5">
            {members.length > 0 ? (
              members.slice(0, 4).map((m) => {
                const tm = teamMembers.find((t) => t.id === m.teamMemberId);
                return (
                  <div
                    key={m.id}
                    className="w-7 h-7 rounded-lg bg-white border-2 border-slate-50 shadow-sm flex items-center justify-center text-[10px] font-bold text-slate-600 transition-transform hover:-translate-y-1 hover:z-10"
                    title={tm?.name}
                  >
                    {tm?.name?.charAt(0) || '?'}
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] text-slate-400 font-medium italic">No members assigned</div>
            )}
            {members.length > 4 && (
              <div className="w-7 h-7 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                +{members.length - 4}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Updated</span>
            <span className="text-[10px] font-semibold text-slate-600">{formattedUpdatedAt || 'Just now'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

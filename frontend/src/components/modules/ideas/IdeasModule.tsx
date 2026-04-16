import { useState } from 'react';
import { Plus, Lightbulb, ArrowRight, FolderKanban } from 'lucide-react';
import { motion } from 'framer-motion';
import ModuleLayout from '../../layout/ModuleLayout';
import { useStore } from '../../../store/useStore';
import { Idea, IdeaStage } from '../../../types';
import Modal from '../../common/Modal';
import QuickAddIdea from '../../common/forms/QuickAddIdea';

const stages: { id: IdeaStage; label: string; color: string; bg: string; dot: string }[] = [
  { id: 'idea', label: 'Ideas', color: 'text-slate-700', bg: 'bg-slate-50', dot: 'bg-slate-400' },
  { id: 'planning', label: 'Planning', color: 'text-orange-700', bg: 'bg-orange-50', dot: 'bg-orange-500' },
  { id: 'building', label: 'Building', color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500' },
  { id: 'launched', label: 'Launched', color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500' },
];

const tagColors: Record<string, string> = {
  saas: 'bg-blue-50 text-blue-700',
  tool: 'bg-orange-50 text-orange-700',
  client: 'bg-sky-50 text-sky-700',
  content: 'bg-yellow-50 text-yellow-700',
};

function IdeaCard({ idea }: { idea: Idea }) {
  const { updateIdeaStage, convertIdeaToProject } = useStore();
  const stageOrder: IdeaStage[] = ['idea', 'planning', 'building', 'launched'];
  const currentIdx = stageOrder.indexOf(idea.stage);
  const nextStage = currentIdx < stageOrder.length - 1 ? stageOrder[currentIdx + 1] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl p-4 border border-[#E6E8EC] shadow-sm group"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold text-slate-800 leading-snug">{idea.title}</p>
        <Lightbulb size={13} className="text-yellow-500 flex-shrink-0 mt-0.5" />
      </div>
      {idea.notes && <p className="text-xs text-slate-400 mb-3 line-clamp-2">{idea.notes}</p>}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {idea.tags.map(tag => (
            <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tagColors[tag] || 'bg-slate-50 text-slate-600'}`}>
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => convertIdeaToProject(idea.id)}
            className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium hover:text-emerald-700"
            title="Convert to Project"
          >
            <FolderKanban size={10} /> Project
          </button>
          {nextStage && (
            <button
              onClick={() => updateIdeaStage(idea.id, nextStage)}
              className="flex items-center gap-1 text-[10px] text-blue-500 font-medium"
            >
              Move <ArrowRight size={10} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function IdeasModule() {
  const { ideas } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <ModuleLayout
      title="Ideas & Projects"
      accentColor="bg-yellow-500"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <Plus size={15} />
          Add Idea
        </button>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        {stages.map((stage) => {
          const stageIdeas = ideas.filter(i => i.stage === stage.id);
          return (
            <div key={stage.id} className={`${stage.bg} rounded-2xl p-4 border border-[#E6E8EC] min-h-80`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                  <span className={`text-sm font-semibold ${stage.color}`}>{stage.label}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium bg-white ${stage.color}`}>
                  {stageIdeas.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {stageIdeas.map(idea => (
                  <IdeaCard key={idea.id} idea={idea} />
                ))}
                {stageIdeas.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-400">Nothing here yet</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <Modal title="Add Idea" onClose={() => setShowAddModal(false)}>
          <QuickAddIdea onClose={() => setShowAddModal(false)} />
        </Modal>
      )}
    </ModuleLayout>
  );
}

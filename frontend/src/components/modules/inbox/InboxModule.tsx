import { useState } from 'react';
import { Plus, Trash2, CheckCircle, ArrowRight, Inbox, Lightbulb, CheckSquare, Link, FileText, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { InboxItem, InboxItemType } from '../../../types';
import ModuleLayout from '../../layout/ModuleLayout';

const typeIcons: Record<InboxItemType, React.ElementType> = {
  thought: MessageSquare,
  task: CheckSquare,
  idea: Lightbulb,
  link: Link,
  note: FileText,
};

const typeColors: Record<InboxItemType, string> = {
  thought: 'bg-slate-100 text-slate-600',
  task: 'bg-blue-50 text-blue-600',
  idea: 'bg-yellow-50 text-yellow-600',
  link: 'bg-teal-50 text-teal-600',
  note: 'bg-green-50 text-green-600',
};

function CaptureForm({ onClose }: { onClose?: () => void }) {
  const { addInboxItem, addTask, addIdea } = useStore();
  const [content, setContent] = useState('');
  const [type, setType] = useState<InboxItemType>('thought');

  const handleCapture = () => {
    if (!content.trim()) return;
    addInboxItem({
      id: `inbox_${Date.now()}`,
      type,
      content: content.trim(),
      status: 'uncaptured',
      createdAt: new Date().toISOString(),
    });
    setContent('');
    onClose?.();
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E6E8EC] p-5">
      <h3 className="text-sm font-semibold text-slate-800 mb-3">Capture a thought</h3>
      <div className="flex gap-2 mb-3">
        {(Object.keys(typeIcons) as InboxItemType[]).map((t) => {
          const Icon = typeIcons[t];
          return (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${type === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <Icon size={11} /> {t}
            </button>
          );
        })}
      </div>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) handleCapture(); }}
        placeholder="What's on your mind? (⌘Enter to capture)"
        rows={3}
        autoFocus
        className="w-full px-3.5 py-3 bg-[#F5F7FA] rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-slate-900/10 mb-3"
      />
      <div className="flex gap-2">
        <button
          onClick={handleCapture}
          disabled={!content.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          <Plus size={14} /> Capture
        </button>
        {onClose && (
          <button onClick={onClose} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function InboxItemCard({ item }: { item: InboxItem }) {
  const { processInboxItem, deleteInboxItem, addTask, addIdea } = useStore();
  const [showActions, setShowActions] = useState(false);
  const Icon = typeIcons[item.type];

  const handleConvertToTask = () => {
    const now = new Date().toISOString();
    const taskId = `t_inbox_${Date.now()}`;
    addTask({
      id: taskId,
      title: item.content.substring(0, 100),
      status: 'todo',
      priority: 'medium',
      dueDate: '',
      createdAt: now,
    });
    processInboxItem(item.id, 'task', taskId);
  };

  const handleConvertToIdea = () => {
    const now = new Date().toISOString();
    const ideaId = `i_inbox_${Date.now()}`;
    addIdea({
      id: ideaId,
      title: item.content.substring(0, 100),
      stage: 'idea',
      tags: [],
      notes: item.content,
      createdAt: now,
    });
    processInboxItem(item.id, 'idea', ideaId);
  };

  const isProcessed = item.status === 'processed';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl border group transition-colors ${isProcessed ? 'border-slate-100 opacity-60' : 'border-[#E6E8EC] hover:border-slate-300'}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${typeColors[item.type]}`}>
            <Icon size={13} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm leading-relaxed ${isProcessed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {item.content}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
              {isProcessed && item.processedAs && (
                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">
                  → {item.processedAs}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isProcessed && (
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <ArrowRight size={14} />
              </button>
            )}
            {isProcessed && (
              <CheckCircle size={16} className="text-emerald-500" />
            )}
            <button
              onClick={() => deleteInboxItem(item.id)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showActions && !isProcessed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 pt-3 border-t border-slate-100"
            >
              <p className="text-xs text-slate-500 mb-2">Process as:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleConvertToTask}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  <CheckSquare size={11} /> Task
                </button>
                <button
                  onClick={handleConvertToIdea}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-100 transition-colors"
                >
                  <Lightbulb size={11} /> Idea
                </button>
                <button
                  onClick={() => processInboxItem(item.id, 'discarded')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function InboxModule() {
  const { inboxItems } = useStore();
  const [showCapture, setShowCapture] = useState(false);
  const [filter, setFilter] = useState<'all' | 'uncaptured' | 'processed'>('uncaptured');

  const filtered = inboxItems.filter((i) => {
    if (filter === 'all') return true;
    if (filter === 'uncaptured') return i.status === 'uncaptured';
    return i.status === 'processed';
  });

  const unprocessedCount = inboxItems.filter((i) => i.status === 'uncaptured').length;

  return (
    <ModuleLayout
      title="Inbox"
      subtitle={`${unprocessedCount} item${unprocessedCount !== 1 ? 's' : ''} to process`}
      accentColor="bg-teal-500"
      actions={
        <button
          onClick={() => setShowCapture(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <Plus size={15} /> Capture
        </button>
      }
    >
      <div className="max-w-2xl space-y-5">
        {showCapture && <CaptureForm onClose={() => setShowCapture(false)} />}

        <div className="flex items-center gap-2">
          {(['uncaptured', 'processed', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'bg-white border border-[#E6E8EC] text-slate-600 hover:bg-slate-50'}`}
            >
              {f === 'uncaptured' ? 'To Process' : f === 'processed' ? 'Processed' : 'All'}
              <span className="ml-1.5 opacity-60">({f === 'all' ? inboxItems.length : inboxItems.filter((i) => i.status === f).length})</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((item) => <InboxItemCard key={item.id} item={item} />)}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <Inbox size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-400">
              {filter === 'uncaptured' ? 'Inbox zero! You\'re all caught up.' : 'Nothing here yet.'}
            </p>
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}

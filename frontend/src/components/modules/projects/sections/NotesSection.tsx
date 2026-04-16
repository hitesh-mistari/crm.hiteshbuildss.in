import { useState, useRef } from 'react';
import { Plus, Trash2, Pin, CreditCard as Edit2, Save, X, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../../store/useStore';
import { ProjectNote, ProjectSectionId } from '../../../../types';

interface Props {
  projectId: string;
  sectionId: ProjectSectionId;
  title?: string;
  placeholder?: string;
}

function NoteCard({ note }: { note: ProjectNote }) {
  const { updateProjectNote, deleteProjectNote } = useStore();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: note.title, content: note.content });
  const [delConfirm, setDelConfirm] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    const initialContent = form.content;
    let accumulatedSessionTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let newFinalSegments = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalSegments += (newFinalSegments || !accumulatedSessionTranscript ? '' : ' ') + transcript;
        } else {
          interimTranscript = transcript;
        }
      }

      if (newFinalSegments) {
        accumulatedSessionTranscript += (accumulatedSessionTranscript ? ' ' : '') + newFinalSegments;
      }

      const displayTranscript = accumulatedSessionTranscript + (interimTranscript ? (accumulatedSessionTranscript ? ' ' : '') + interimTranscript : '');
      setForm(f => ({ 
        ...f, 
        content: initialContent + (initialContent && displayTranscript ? '\n\n' : '') + displayTranscript 
      }));
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
    setIsRecording(true);
  };

  const handleSave = () => {
    updateProjectNote(note.id, form);
    setEditing(false);
    if (isRecording) recognitionRef.current?.stop();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-2xl border group overflow-hidden ${note.isPinned ? 'border-blue-200 ring-1 ring-blue-100' : 'border-[#E6E8EC]'}`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          {editing ? (
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="flex-1 text-sm font-semibold bg-[#F5F7FA] rounded-lg px-2 py-1 outline-none mr-2"
            />
          ) : (
            <div className="flex items-center gap-2 flex-1">
              {note.isPinned && <Pin size={11} className="text-blue-500 flex-shrink-0" />}
              <h4 className="text-sm font-semibold text-slate-800">{note.title}</h4>
            </div>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => updateProjectNote(note.id, { isPinned: !note.isPinned })}
              className={`p-1 rounded-lg transition-colors ${note.isPinned ? 'text-blue-500 bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <Pin size={12} />
            </button>
            <button onClick={() => setEditing(!editing)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
              {editing ? <X size={12} /> : <Edit2 size={12} />}
            </button>
            {delConfirm ? (
              <>
                <button onClick={() => deleteProjectNote(note.id)} className="text-[10px] px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">Del</button>
                <button onClick={() => setDelConfirm(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"><X size={12} /></button>
              </>
            ) : (
              <button onClick={() => setDelConfirm(true)} className="p-1 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>

        {editing ? (
          <div className="space-y-2">
            <div className="relative">
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={5}
                className="w-full px-3 py-2 bg-[#F5F7FA] rounded-xl text-sm text-slate-700 outline-none resize-none pr-10"
              />
              <button
                type="button"
                onClick={toggleRecording}
                className={`absolute right-3 top-2 p-1.5 rounded-lg transition-colors ${
                  isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:bg-slate-200'
                }`}
              >
                {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors">
              <Save size={11} /> Save
            </button>
          </div>
        ) : (
          <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
            {note.content || <span className="text-slate-400 italic">Empty note. Click edit to write.</span>}
          </p>
        )}

        <p className="text-[10px] text-slate-400 mt-3">
          Updated {new Date(note.updatedAt).toLocaleDateString()}
        </p>
      </div>
    </motion.div>
  );
}

export default function NotesSection({ projectId, sectionId, title = 'Notes', placeholder = 'New note...' }: Props) {
  const { projectNotes, addProjectNote } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    const initialTitle = newTitle;
    let accumulatedSessionTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let newFinalSegments = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          newFinalSegments += (newFinalSegments || !accumulatedSessionTranscript ? '' : ' ') + transcript;
        } else {
          interimTranscript = transcript;
        }
      }

      if (newFinalSegments) accumulatedSessionTranscript += (accumulatedSessionTranscript ? ' ' : '') + newFinalSegments;

      const displayTranscript = accumulatedSessionTranscript + (interimTranscript ? (accumulatedSessionTranscript ? ' ' : '') + interimTranscript : '');
      setNewTitle(initialTitle + (initialTitle && displayTranscript ? ' ' : '') + displayTranscript);
    };

    recognition.onend = () => setIsRecording(false);
    recognition.start();
    setIsRecording(true);
  };

  const notes = projectNotes
    .filter((n) => n.projectId === projectId && n.sectionId === sectionId)
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    const now = new Date().toISOString();
    addProjectNote({
      id: `pn_${Date.now()}`,
      projectId,
      sectionId,
      title: newTitle.trim(),
      content: '',
      authorId: 'local',
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });
    setNewTitle('');
    setShowAdd(false);
    if (isRecording) recognitionRef.current?.stop();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{notes.length} {title.toLowerCase()}</p>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-medium hover:bg-slate-700 transition-colors"
        >
          <Plus size={12} /> Add {title.slice(0, -1) || 'Note'}
        </button>
      </div>

      {showAdd && (
        <div className="p-4 bg-slate-50 rounded-xl space-y-2">
          <div className="relative">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={placeholder}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowAdd(false); }}
              autoFocus
              className="w-full px-3 py-2 bg-white rounded-lg text-sm outline-none border border-slate-200 focus:border-slate-400 pr-10"
            />
            <button
              type="button"
              onClick={toggleRecording}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                isRecording ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors">Add</button>
            <button onClick={() => setShowAdd(false)} className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <AnimatePresence>
          {notes.map((note) => <NoteCard key={note.id} note={note} />)}
        </AnimatePresence>
      </div>

      {notes.length === 0 && !showAdd && (
        <div className="text-center py-12">
          <p className="text-sm text-slate-400">No {title.toLowerCase()} yet.</p>
        </div>
      )}
    </div>
  );
}

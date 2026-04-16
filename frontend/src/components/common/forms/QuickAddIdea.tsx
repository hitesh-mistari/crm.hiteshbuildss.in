import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { IdeaTag } from '../../../types';

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export default function QuickAddIdea({ onClose }: { onClose: () => void }) {
  const { addIdea } = useStore();
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [tag, setTag] = useState<IdeaTag>('saas');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [micError, setMicError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addIdea({
      id: `i${Date.now()}`,
      title: title.trim(),
      stage: 'idea',
      tags: [tag],
      notes,
      createdAt: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  const toggleRecording = () => {
    setMicError('');

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setMicError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    const initialNotes = notes;
    let accumulatedSessionTranscript = '';

    recognition.onstart = () => {
      setIsRecording(true);
      setIsProcessing(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
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
      setNotes(initialNotes + (initialNotes && displayTranscript ? '\n\n' : '') + displayTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed') {
        setMicError('Microphone access denied. Please allow microphone permissions.');
      } else if (event.error !== 'no-speech') {
        setMicError('Recording error. Please try again.');
      }
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setIsProcessing(false);
    };

    recognitionRef.current = recognition;
    setIsProcessing(true);
    recognition.start();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Idea Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. AI productivity tool"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Tag</label>
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value as IdeaTag)}
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
        >
          <option value="saas">SaaS</option>
          <option value="tool">Tool</option>
          <option value="client">Client</option>
          <option value="content">Content</option>
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-slate-600">Notes</label>
          <button
            type="button"
            onClick={toggleRecording}
            title={isRecording ? 'Stop recording' : 'Record voice note'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              isRecording
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
            }`}
          >
            {isProcessing && !isRecording ? (
              <Loader size={12} className="animate-spin" />
            ) : isRecording ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <MicOff size={12} />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic size={12} />
                <span>Voice</span>
              </>
            )}
          </button>
        </div>
        <div className="relative">
          <textarea
            ref={notesRef}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={isRecording ? 'Listening...' : 'Describe the idea...'}
            rows={3}
            className={`w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none resize-none transition-all ${
              isRecording
                ? 'ring-2 ring-red-300 bg-red-50/50'
                : 'focus:ring-2 focus:ring-slate-900/10'
            }`}
          />
          {isRecording && (
            <div className="absolute bottom-2.5 right-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="w-1.5 h-2 rounded-full bg-red-400 animate-pulse delay-75" />
              <span className="w-1.5 h-3 rounded-full bg-red-500 animate-pulse delay-150" />
              <span className="w-1.5 h-2 rounded-full bg-red-400 animate-pulse delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
          )}
        </div>
        {micError && (
          <p className="mt-1.5 text-xs text-red-500">{micError}</p>
        )}
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">Add Idea</button>
      </div>
    </form>
  );
}

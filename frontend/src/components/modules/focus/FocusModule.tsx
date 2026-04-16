import { useState } from 'react';
import { Play, Pause, Square, RotateCcw, Flame, Clock, Trophy, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { useFocusTimer } from '../../../hooks/useFocusTimer';
import { TimerMode } from '../../../types';
import ModuleLayout from '../../layout/ModuleLayout';

const PRESETS: { label: string; minutes: number; mode: TimerMode; color: string }[] = [
  { label: 'Pomodoro', minutes: 25, mode: 'pomodoro', color: 'bg-rose-500' },
  { label: 'Deep Work', minutes: 90, mode: 'deep_work', color: 'bg-blue-500' },
  { label: 'Short Focus', minutes: 45, mode: 'deep_work', color: 'bg-teal-500' },
  { label: 'Quick Sprint', minutes: 15, mode: 'pomodoro', color: 'bg-orange-500' },
];

function TimerCircle({ percent, timeLeft, isRunning }: { percent: number; timeLeft: number; isRunning: boolean }) {
  const r = 90;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
        <motion.circle
          cx="100" cy="100" r={r}
          fill="none"
          stroke="#0f172a"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transition={{ duration: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.p
          key={timeLeft}
          className="text-4xl font-bold text-slate-900 tabular-nums"
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </motion.p>
        <p className="text-xs text-slate-400 mt-1">{isRunning ? 'Focus...' : percent === 0 ? 'Ready' : 'Paused'}</p>
        {isRunning && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 bg-emerald-500 rounded-full mt-2"
          />
        )}
      </div>
    </div>
  );
}

function SessionHistoryItem({ minutes, label, mode }: { minutes: number; label: string; mode: string }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#E6E8EC] last:border-0">
      <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
        <Trophy size={13} className="text-emerald-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{label}</p>
        <p className="text-xs text-slate-400">{mode}</p>
      </div>
      <span className="text-xs font-semibold text-slate-600">{minutes}m</span>
    </div>
  );
}

export default function FocusModule() {
  const {
    tasks, projects, focusSessions, focusStreakData,
    activeFocusSession, startFocusSession, completeFocusSession, abandonFocusSession,
  } = useStore();

  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0]);
  const [label, setLabel] = useState('');
  const [linkedTaskId, setLinkedTaskId] = useState('');
  const [linkedProjectId, setLinkedProjectId] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const durationMinutes = customMinutes ? parseInt(customMinutes) || selectedPreset.minutes : selectedPreset.minutes;
  const timer = useFocusTimer(durationMinutes * 60);

  const todaySessions = focusSessions.filter((s) => s.date === new Date().toISOString().split('T')[0] && s.status === 'completed');
  const todayMinutes = todaySessions.reduce((sum, s) => sum + (s.actualMinutes || 0), 0);

  const handleStart = () => {
    const sessionLabel = label || selectedPreset.label;
    startFocusSession({
      label: sessionLabel,
      durationMinutes,
      mode: customMinutes ? 'custom' : selectedPreset.mode,
      taskId: linkedTaskId || undefined,
      projectId: linkedProjectId || undefined,
    });
    timer.start();
  };

  const handleComplete = () => {
    timer.pause();
    setShowComplete(true);
  };

  const handleConfirmComplete = () => {
    const actualMinutes = Math.round(timer.elapsed / 60);
    completeFocusSession(Math.max(1, actualMinutes), sessionNotes);
    timer.reset();
    setShowComplete(false);
    setSessionNotes('');
    setLabel('');
  };

  const handleAbandon = () => {
    abandonFocusSession();
    timer.reset();
    setShowComplete(false);
  };

  const isSessionActive = !!activeFocusSession;

  return (
    <ModuleLayout title="Focus Mode" subtitle="Deep work timer & time blocking" accentColor="bg-rose-500">
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-[#E6E8EC] p-8">
            <div className="text-center mb-8">
              {!isSessionActive ? (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => { setSelectedPreset(p); setCustomMinutes(''); }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${selectedPreset.label === p.label && !customMinutes ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      >
                        <Clock size={13} /> {p.label}
                        <span className="text-xs opacity-70">{p.minutes}m</span>
                      </button>
                    ))}
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl">
                      <input
                        type="number"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                        placeholder="Custom"
                        min="1" max="240"
                        className="w-16 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      />
                      <span className="text-xs text-slate-500">min</span>
                    </div>
                  </div>

                  <input
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder={`What will you work on? (${selectedPreset.label})`}
                    className="w-full px-4 py-3 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 text-center"
                  />

                  <div className="flex gap-3 justify-center">
                    <select value={linkedTaskId} onChange={(e) => setLinkedTaskId(e.target.value)}
                      className="px-3 py-2 bg-[#F5F7FA] rounded-xl text-xs outline-none max-w-[180px]">
                      <option value="">Link to task (optional)</option>
                      {tasks.filter((t) => t.status !== 'done').map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                    <select value={linkedProjectId} onChange={(e) => setLinkedProjectId(e.target.value)}
                      className="px-3 py-2 bg-[#F5F7FA] rounded-xl text-xs outline-none max-w-[180px]">
                      <option value="">Link to project (optional)</option>
                      {projects.filter((p) => p.status === 'active').map((p) => (
                        <option key={p.id} value={p.id}>{p.emoji} {p.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-700 mb-1">{activeFocusSession.label}</p>
                  <p className="text-xs text-slate-400">{activeFocusSession.mode} • {activeFocusSession.durationMinutes}m session</p>
                </div>
              )}
            </div>

            <TimerCircle percent={timer.percentComplete} timeLeft={timer.timeLeft} isRunning={timer.isRunning} />

            <div className="flex items-center justify-center gap-3 mt-8">
              {!isSessionActive ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2.5 px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-semibold hover:bg-slate-700 transition-colors"
                >
                  <Play size={16} /> Start Session
                </button>
              ) : (
                <>
                  {timer.isRunning ? (
                    <button onClick={timer.pause} className="flex items-center gap-2 px-5 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                      <Pause size={15} /> Pause
                    </button>
                  ) : (
                    <button onClick={timer.resume} className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
                      <Play size={15} /> Resume
                    </button>
                  )}
                  <button onClick={handleComplete} className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                    <Trophy size={15} /> Complete
                  </button>
                  <button onClick={handleAbandon} className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                    <Square size={15} /> Abandon
                  </button>
                </>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showComplete && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5"
              >
                <h3 className="text-sm font-bold text-emerald-800 mb-3">Session Complete! Any notes?</h3>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="What did you accomplish? What's next?"
                  rows={2}
                  className="w-full px-3 py-2 bg-white rounded-xl text-sm outline-none border border-emerald-200 resize-none mb-3"
                />
                <div className="flex gap-2">
                  <button onClick={handleConfirmComplete} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
                    Save Session
                  </button>
                  <button onClick={handleAbandon} className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors">
                    Discard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E6E8EC] p-5">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-4">Today's Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Sessions', value: todaySessions.length, icon: Target, color: 'bg-blue-50 text-blue-500' },
                { label: 'Minutes', value: todayMinutes, icon: Clock, color: 'bg-teal-50 text-teal-500' },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center p-3 bg-slate-50 rounded-xl">
                    <div className={`w-8 h-8 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-1.5`}>
                      <Icon size={14} />
                    </div>
                    <p className="text-xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-[10px] text-slate-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E6E8EC] p-5">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-4">Focus Streak</h3>
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame size={20} className={focusStreakData.currentStreak > 0 ? 'text-orange-500' : 'text-slate-300'} />
                <span className="text-3xl font-bold text-slate-900">{focusStreakData.currentStreak}</span>
              </div>
              <p className="text-xs text-slate-500">day streak</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-sm font-bold text-slate-900">{focusStreakData.longestStreak}</p>
                <p className="text-[10px] text-slate-500">Best streak</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-sm font-bold text-slate-900">{focusStreakData.totalSessionsAllTime}</p>
                <p className="text-[10px] text-slate-500">All time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E6E8EC] p-5">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">Today's Sessions</h3>
            {todaySessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No sessions yet today</p>
            ) : (
              <div>
                {todaySessions.slice(0, 5).map((s) => (
                  <SessionHistoryItem key={s.id} minutes={s.actualMinutes || 0} label={s.label} mode={s.mode} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ModuleLayout>
  );
}

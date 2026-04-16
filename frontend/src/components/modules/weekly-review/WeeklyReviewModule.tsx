import { useState } from 'react';
import { Calendar, Zap, CheckSquare, Clock, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../../store/useStore';
import { WeeklyReview } from '../../../types';
import ModuleLayout from '../../layout/ModuleLayout';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekNumber(d: Date): number {
  const oneJan = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay() + 1) / 7);
}

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-2">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${n <= value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: WeeklyReview }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Calendar size={16} className="text-slate-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-900">Week {review.weekNumber}, {review.year}</p>
            <p className="text-xs text-slate-500">{new Date(review.weekStartDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</p>
          </div>
          <div className="flex gap-3 ml-4">
            {[
              { label: 'Tasks', value: review.tasksCompleted, icon: CheckSquare },
              { label: 'Focus', value: `${review.focusMinutes}m`, icon: Clock },
              { label: 'Energy', value: `${review.energyLevel}/5`, icon: Zap },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-1 text-xs text-slate-500">
                  <Icon size={11} />
                  <span>{s.value}</span>
                </div>
              );
            })}
          </div>
        </div>
        {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-3 border-t border-[#E6E8EC] pt-4">
              {review.oneThing && (
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">ONE Thing</p>
                  <p className="text-sm text-slate-700">{review.oneThing}</p>
                </div>
              )}
              {review.wins && (
                <div>
                  <p className="text-xs font-semibold text-emerald-600 mb-1">Wins</p>
                  <p className="text-sm text-slate-700">{review.wins}</p>
                </div>
              )}
              {review.challenges && (
                <div>
                  <p className="text-xs font-semibold text-orange-600 mb-1">Challenges</p>
                  <p className="text-sm text-slate-700">{review.challenges}</p>
                </div>
              )}
              {review.lessons && (
                <div>
                  <p className="text-xs font-semibold text-blue-600 mb-1">Lessons</p>
                  <p className="text-sm text-slate-700">{review.lessons}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WeeklyReviewModule() {
  const { weeklyReviews, saveWeeklyReview, tasks, focusSessions, transactions, goals, settings } = useStore();
  const [view, setView] = useState<'form' | 'history'>('form');

  const weekStart = getWeekStart(new Date());
  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekNumber = getWeekNumber(weekStart);
  const year = weekStart.getFullYear();

  const existingReview = weeklyReviews.find((r) => r.weekStartDate === weekStartStr);
  const weekStartMs = weekStart.getTime();
  const weekEndMs = weekStartMs + 7 * 86400000;

  const weekTasksDone = tasks.filter((t) => {
    if (t.status !== 'done') return false;
    const d = new Date(t.createdAt).getTime();
    return d >= weekStartMs && d < weekEndMs;
  }).length;

  const weekFocusMinutes = focusSessions
    .filter((s) => s.status === 'completed' && new Date(s.date).getTime() >= weekStartMs && new Date(s.date).getTime() < weekEndMs)
    .reduce((sum, s) => sum + (s.actualMinutes || 0), 0);

  const weekRevenue = transactions
    .filter((t) => t.type === 'income' && new Date(t.date).getTime() >= weekStartMs && new Date(t.date).getTime() < weekEndMs)
    .reduce((sum, t) => sum + t.amount, 0);

  const weekGoalsDone = goals.filter((g) => g.current >= g.target).length;

  const [form, setForm] = useState<Partial<WeeklyReview>>(existingReview || {
    wins: '',
    challenges: '',
    lessons: '',
    oneThing: '',
    energyLevel: 3,
    focusScore: 3,
  });

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    saveWeeklyReview({
      id: existingReview?.id || `wr_${Date.now()}`,
      weekStartDate: weekStartStr,
      weekNumber,
      year,
      tasksCompleted: weekTasksDone,
      focusMinutes: weekFocusMinutes,
      revenueEarned: weekRevenue,
      goalsAchieved: weekGoalsDone,
      wins: form.wins || '',
      challenges: form.challenges || '',
      lessons: form.lessons || '',
      oneThing: form.oneThing || '',
      energyLevel: (form.energyLevel || 3) as WeeklyReview['energyLevel'],
      focusScore: (form.focusScore || 3) as WeeklyReview['focusScore'],
      completedAt: now,
      createdAt: existingReview?.createdAt || now,
    });
  };

  return (
    <ModuleLayout title="Weekly Review" subtitle={`Week ${weekNumber}, ${year}`} accentColor="bg-teal-500">
      <div className="flex items-center gap-2 mb-6">
        {(['form', 'history'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === v ? 'bg-slate-900 text-white' : 'bg-white border border-[#E6E8EC] text-slate-600 hover:bg-slate-50'}`}
          >
            {v === 'form' ? 'This Week' : `History (${weeklyReviews.length})`}
          </button>
        ))}
      </div>

      {view === 'form' && (
        <div className="max-w-2xl">
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Tasks Done', value: weekTasksDone, icon: CheckSquare, color: 'text-blue-500' },
              { label: 'Focus Time', value: `${weekFocusMinutes}m`, icon: Clock, color: 'text-rose-500' },
              { label: 'Revenue', value: `${settings.currency}${weekRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
              { label: 'Goals Done', value: weekGoalsDone, icon: Zap, color: 'text-orange-500' },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white rounded-2xl border border-[#E6E8EC] p-4 text-center">
                  <Icon size={16} className={`${s.color} mx-auto mb-1.5`} />
                  <p className="text-lg font-bold text-slate-900">{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.label}</p>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSave} className="space-y-5 bg-white rounded-2xl border border-[#E6E8EC] p-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                What is the ONE Thing for next week?
              </label>
              <textarea
                value={form.oneThing || ''}
                onChange={(e) => set('oneThing', e.target.value)}
                placeholder="The single most important thing that will move the needle..."
                rows={2}
                className="w-full px-3.5 py-3 bg-[#F5F7FA] rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            {[
              { key: 'wins', label: 'What went well this week?', color: 'text-emerald-600', placeholder: 'Wins, accomplishments, things to celebrate...' },
              { key: 'challenges', label: 'What was challenging?', color: 'text-orange-600', placeholder: 'Blockers, struggles, what got in the way...' },
              { key: 'lessons', label: 'What did I learn?', color: 'text-blue-600', placeholder: 'Insights, lessons, what to do differently...' },
            ].map((field) => (
              <div key={field.key}>
                <label className={`block text-xs font-semibold mb-2 ${field.color}`}>{field.label}</label>
                <textarea
                  value={(form as Record<string, string>)[field.key] || ''}
                  onChange={(e) => set(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={2}
                  className="w-full px-3.5 py-3 bg-[#F5F7FA] rounded-xl text-sm outline-none resize-none focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-5">
              <StarRating value={form.energyLevel || 3} onChange={(v) => set('energyLevel', v)} label="Energy Level" />
              <StarRating value={form.focusScore || 3} onChange={(v) => set('focusScore', v)} label="Focus Quality" />
            </div>

            <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
              {existingReview ? 'Update Review' : 'Save Weekly Review'}
            </button>
          </form>
        </div>
      )}

      {view === 'history' && (
        <div className="max-w-2xl space-y-3">
          {weeklyReviews.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={32} className="text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-400">No reviews saved yet. Complete your first one!</p>
            </div>
          ) : (
            weeklyReviews.map((r) => <ReviewCard key={r.id} review={r} />)
          )}
        </div>
      )}
    </ModuleLayout>
  );
}

import { useState } from 'react';
import { useStore } from '../../../store/useStore';

export default function QuickAddExpense({ onClose }: { onClose: () => void }) {
  const { addTransaction } = useStore();
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !title) return;
    addTransaction({
      id: `t${Date.now()}`,
      title: title.trim(),
      type,
      amount: parseFloat(amount),
      category,
      notes,
      date,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${type === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            {t}
          </button>
        ))}
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Office Rent"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g. Salary, Software"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
          Add {type === 'expense' ? 'Expense' : 'Income'}
        </button>
      </div>
    </form>
  );
}

import { useState } from 'react';
import { useStore } from '../../../store/useStore';

export default function QuickAddClient({ onClose }: { onClose: () => void }) {
  const { addClient } = useStore();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [project, setProject] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addClient({
      id: `c${Date.now()}`,
      name: name.trim(),
      company,
      project,
      totalAmount: parseFloat(totalAmount) || 0,
      paidAmount: 0,
      payments: [],
      email,
      phone: '',
      notes: '',
      projectProgress: 0,
      createdAt: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Client name" required
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Company</label>
          <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Project</label>
        <input value={project} onChange={(e) => setProject(e.target.value)} placeholder="Project name"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Total Amount</label>
          <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm text-slate-800 outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">Add Client</button>
      </div>
    </form>
  );
}

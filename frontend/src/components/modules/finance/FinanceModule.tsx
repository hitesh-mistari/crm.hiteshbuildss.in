import { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Download, Pencil, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleLayout from '../../layout/ModuleLayout';
import { useStore } from '../../../store/useStore';
import { Transaction, Subscription } from '../../../types';
import Modal from '../../common/Modal';
import { exportToCSV } from '../../../utils/csv';

const CATEGORIES_INCOME = ['Client Payment', 'Project', 'Consulting', 'Other'];
const CATEGORIES_EXPENSE = ['Salary', 'Rent', 'Utilities', 'Software', 'Marketing', 'Tools', 'Other'];

interface TransactionFormData {
  title: string;
  type: 'income' | 'expense';
  amount: string;
  date: string;
  category: string;
  expenseType: 'fixed' | 'unfixed';
  notes: string;
  client: string;
}

const emptyForm: TransactionFormData = {
  title: '', type: 'expense', amount: '', date: new Date().toISOString().split('T')[0],
  category: '', expenseType: 'fixed', notes: '', client: '',
};

function TransactionForm({ initial, onSubmit, onCancel, submitLabel, clientNames = [] }: {
  initial?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  submitLabel: string;
  clientNames?: string[];
}) {
  const [form, setForm] = useState<TransactionFormData>({ ...emptyForm, ...initial });
  const [showCustomCategory, setShowCustomCategory] = useState(
    initial?.category ? (!CATEGORIES_INCOME.includes(initial.category) && !CATEGORIES_EXPENSE.includes(initial.category)) : false
  );

  const categories = form.type === 'income' ? CATEGORIES_INCOME : CATEGORIES_EXPENSE;

  const set = (k: keyof TransactionFormData, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
        {(['expense', 'income'] as const).map((t) => (
          <button key={t} type="button" onClick={() => set('type', t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${form.type === t ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
            {t}
          </button>
        ))}
      </div>
      {form.type === 'expense' && (
        <div className="flex gap-4 px-2 py-1">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
            <input type="radio" checked={form.expenseType === 'fixed'} onChange={() => set('expenseType', 'fixed')} className="accent-slate-900 w-4 h-4 cursor-pointer" /> 
            <span className="font-medium">Fixed</span> <span className="text-slate-400 text-xs hidden sm:inline">(e.g. Salary, Rent)</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
            <input type="radio" checked={form.expenseType === 'unfixed'} onChange={() => set('expenseType', 'unfixed')} className="accent-slate-900 w-4 h-4 cursor-pointer" /> 
            <span className="font-medium">Unfixed</span> <span className="text-slate-400 text-xs hidden sm:inline">(e.g. Subscriptions)</span>
          </label>
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Title *</label>
        <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Website Project" required
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Amount *</label>
          <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0" required min="1"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Date *</label>
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between mb-0.5">
            <label className="block text-xs font-medium text-slate-600">Category *</label>
            <button 
              type="button" 
              onClick={() => {
                setShowCustomCategory(!showCustomCategory);
                if (showCustomCategory) set('category', '');
              }}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase"
            >
              {showCustomCategory ? 'Use List' : '+ Custom'}
            </button>
          </div>
          {showCustomCategory ? (
            <input 
              value={form.category} 
              onChange={(e) => set('category', e.target.value)} 
              placeholder="Enter category" 
              required
              className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          ) : (
            <select value={form.category} onChange={(e) => set('category', e.target.value)} required
              className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
              <option value="">Select...</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Client</label>
          {clientNames.length > 0 ? (
            <select value={form.client} onChange={(e) => set('client', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
              <option value="">None</option>
              {clientNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          ) : (
            <input value={form.client} onChange={(e) => set('client', e.target.value)} placeholder="Optional"
              className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
          )}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
        <input value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Optional notes"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">{submitLabel}</button>
      </div>
    </form>
  );
}

interface SubscriptionFormData {
  name: string;
  amount: string;
  billing_cycle: 'monthly' | 'yearly';
  start_date: string;
  validity: string;
  reminder_days: string;
  auto_renew: boolean;
}

const emptySubForm: SubscriptionFormData = {
  name: '', amount: '', billing_cycle: 'monthly',
  start_date: new Date().toISOString().split('T')[0],
  validity: '1',
  reminder_days: '5',
  auto_renew: false,
};

function SubscriptionForm({ initial, onSubmit, onCancel, submitLabel }: {
  initial?: Partial<SubscriptionFormData>;
  onSubmit: (data: SubscriptionFormData) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState<SubscriptionFormData>({ ...emptySubForm, ...initial });
  const set = (k: keyof SubscriptionFormData, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Name *</label>
        <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Vercel Pro" required
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Amount *</label>
          <input type="number" value={form.amount} onChange={(e) => set('amount', e.target.value)} placeholder="0" required min="1"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Billing Cycle *</label>
          <select value={form.billing_cycle} onChange={(e) => set('billing_cycle', e.target.value as any)} required
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Start Date *</label>
          <input type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} required
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Plan Validity *</label>
          <select value={form.validity} onChange={(e) => set('validity', e.target.value)} required
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10">
            <option value="1">1 Month</option>
            <option value="2">2 Months</option>
            <option value="3">3 Months</option>
            <option value="6">6 Months</option>
            <option value="12">1 Year</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Reminder Days</label>
        <input type="number" value={form.reminder_days} onChange={(e) => set('reminder_days', e.target.value)} placeholder="5" required min="1"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div className="flex items-center gap-2 py-1">
        <input 
          type="checkbox" 
          id="auto_renew"
          checked={form.auto_renew} 
          onChange={(e) => set('auto_renew', e.target.checked)} 
          className="w-4 h-4 accent-slate-900 cursor-pointer"
        />
        <label htmlFor="auto_renew" className="text-sm text-slate-600 cursor-pointer font-medium select-none">Enable Auto-Renew</label>
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">{submitLabel}</button>
      </div>
    </form>
  );
}

export default function FinanceModule() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, subscriptions, addSubscription, updateSubscription, deleteSubscription, settings, clients, financeSection, setFinanceSection } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddSubModal, setShowAddSubModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense' | 'fixed' | 'unfixed'>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleteSubConfirm, setDeleteSubConfirm] = useState<string | null>(null);

  const getDaysLeft = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getSubStatus = (sub: Subscription) => {
    const daysLeft = getDaysLeft(sub.end_date);
    if (daysLeft < 0) return { label: 'Expired', color: 'bg-red-50 text-red-700 font-bold', daysLeft };
    if (daysLeft <= sub.reminder_days) return { label: 'Expiring Soon', color: 'bg-orange-50 text-orange-700 font-bold', daysLeft };
    return { label: 'Active', color: 'bg-emerald-50 text-emerald-700 font-bold', daysLeft };
  };

  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;

  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthlyExpenses = transactions
    .filter((t) => t.type === 'expense' && t.date.startsWith(thisMonth))
    .reduce((s, t) => s + t.amount, 0);
  const runway = monthlyExpenses > 0 ? Math.floor(balance / monthlyExpenses) : null;

  const filtered = transactions
    .filter((t) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'income') return t.type === 'income';
      if (activeTab === 'expense') return t.type === 'expense';
      if (activeTab === 'fixed') return t.type === 'expense' && t.expenseType === 'fixed';
      if (activeTab === 'unfixed') return t.type === 'expense' && t.expenseType === 'unfixed';
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAdd = (form: TransactionFormData) => {
    addTransaction({
      id: `t${Date.now()}`,
      title: form.title,
      type: form.type,
      amount: parseFloat(form.amount),
      date: form.date,
      category: form.category,
      expenseType: form.type === 'expense' ? form.expenseType : undefined,
      notes: form.notes,
      client: form.client,
    });
    setShowAddModal(false);
  };

  const handleUpdate = (form: TransactionFormData) => {
    if (!editingId) return;
    updateTransaction(editingId, {
      title: form.title, type: form.type, amount: parseFloat(form.amount),
      date: form.date, category: form.category,
      expenseType: form.type === 'expense' ? form.expenseType : undefined,
      notes: form.notes, client: form.client,
    });
    setEditingId(null);
  };

  const handleAddSub = (form: SubscriptionFormData) => {
    const end = new Date(form.start_date);
    end.setMonth(end.getMonth() + parseInt(form.validity));
    
    addSubscription({
      id: `sub${Date.now()}`,
      name: form.name,
      amount: parseFloat(form.amount),
      billing_cycle: form.billing_cycle,
      start_date: form.start_date,
      end_date: end.toISOString().split('T')[0],
      reminder_days: parseInt(form.reminder_days) || 5,
      auto_renew: form.auto_renew,
      status: 'active'
    });
    setShowAddSubModal(false);
  };

  const handleUpdateSub = (form: SubscriptionFormData) => {
    if (!editingSubId) return;
    const end = new Date(form.start_date);
    end.setMonth(end.getMonth() + parseInt(form.validity));

    updateSubscription(editingSubId, {
      name: form.name,
      amount: parseFloat(form.amount),
      billing_cycle: form.billing_cycle,
      start_date: form.start_date,
      end_date: end.toISOString().split('T')[0],
      reminder_days: parseInt(form.reminder_days) || 5,
      auto_renew: form.auto_renew,
    });
    setEditingSubId(null);
  };

  const handleExport = () => {
    exportToCSV(
      transactions.map((t) => ({ title: t.title, type: t.type, amount: t.amount, date: t.date, category: t.category, notes: t.notes, client: t.client || '' })),
      'transactions'
    );
  };

  const editingTransaction = editingId ? transactions.find((t) => t.id === editingId) : null;
  const editingSubscription = editingSubId ? subscriptions.find((s) => s.id === editingSubId) : null;

  const stats = [
    { label: 'Total Income', value: totalIncome, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', prefix: `+${settings.currency}` },
    { label: 'Total Expenses', value: totalExpenses, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50', prefix: `-${settings.currency}` },
    { label: 'Net Balance', value: Math.abs(balance), icon: DollarSign, color: balance >= 0 ? 'text-emerald-600' : 'text-red-600', bg: balance >= 0 ? 'bg-emerald-50' : 'bg-red-50', prefix: balance >= 0 ? `+${settings.currency}` : `-${settings.currency}` },
    { label: 'Monthly Burn', value: monthlyExpenses, icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50', prefix: settings.currency },
  ];

  return (
    <ModuleLayout
      title="Finance"
      subtitle="Cashflow & Transactions"
      accentColor="bg-emerald-500"
      actions={
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-[#E6E8EC] text-slate-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors min-h-[44px]">
            <Download size={14} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button onClick={() => financeSection === 'subscriptions' ? setShowAddSubModal(true) : setShowAddModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-3.5 md:px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors min-h-[44px]">
            <Plus size={15} /> <span className="hidden sm:inline">Add {financeSection === 'subscriptions' ? 'Subscription' : 'Transaction'}</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      }
    >
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 w-fit">
        <button 
          onClick={() => setFinanceSection('transactions')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${financeSection === 'transactions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Transactions
        </button>
        <button 
          onClick={() => setFinanceSection('subscriptions')}
          className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${financeSection === 'subscriptions' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
          Subscriptions ({subscriptions.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {financeSection === 'transactions' ? (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="bg-white rounded-2xl p-5 border border-[#E6E8EC]">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-slate-500">{s.label}</p>
                      <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}><Icon size={14} className={s.color} /></div>
                    </div>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.prefix}{s.value.toLocaleString('en-IN')}</p>
                    {s.label === 'Net Balance' && runway !== null && (
                      <p className="text-xs text-slate-500 mt-1">~{runway} month{runway !== 1 ? 's' : ''} runway</p>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden">
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[#E6E8EC]">
                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                    {(['all', 'income', 'expense'] as const).map((tab) => {
                      const count = transactions.filter((t) => {
                        if (tab === 'all') return true;
                        if (tab === 'income') return t.type === 'income';
                        if (tab === 'expense') return t.type === 'expense';
                        return true;
                      }).length;
                      
                      const isActive = tab === 'all' ? activeTab === 'all' : 
                                      tab === 'income' ? activeTab === 'income' :
                                      (activeTab === 'expense' || activeTab === 'fixed' || activeTab === 'unfixed');

                      return (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          className={`px-4 py-1.5 rounded-lg text-xs md:text-sm font-medium capitalize transition-colors whitespace-nowrap ${isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                          {tab} {tab !== 'all' && `(${count})`}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Nested Expense Filters - Below */}
                  <AnimatePresence>
                    {(activeTab === 'expense' || activeTab === 'fixed' || activeTab === 'unfixed') && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 pb-1">
                          {(['fixed', 'unfixed'] as const).map((subTab) => {
                            const count = transactions.filter(t => t.type === 'expense' && t.expenseType === subTab).length;
                            return (
                              <button key={subTab} onClick={() => setActiveTab(subTab)}
                                className={`px-4 py-1.5 rounded-xl text-[11px] md:text-xs font-bold transition-all border ${activeTab === subTab ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 italic'}`}>
                                {subTab === 'fixed' ? 'Fixed Exp.' : 'Unfixed Exp.'} ({count})
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-xs text-slate-400 absolute top-4 right-6 pointer-events-none hidden md:block">{filtered.length} entries</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E6E8EC] bg-slate-50/50">
                      {['Date', 'Title', 'Client', 'Category', 'Notes', 'Amount', ''].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {filtered.map((t, i) => (
                        <motion.tr key={t.id}
                          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                        >
                          <td className="px-5 py-3.5 text-sm text-slate-400 whitespace-nowrap">{t.date}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-800">{t.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${t.type === 'income' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{t.type}</span>
                              {t.type === 'expense' && t.expenseType && (
                                 <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 bg-slate-100 text-slate-600 capitalize uppercase tracking-wider">{t.expenseType}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {t.client ? (
                              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-sky-50 text-sky-700 border border-sky-100 whitespace-nowrap">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                                {t.client}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-300">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-sm text-slate-600">{t.category}</td>
                          <td className="px-5 py-3.5 text-sm text-slate-400 max-w-[140px] truncate">{t.notes || '—'}</td>
                          <td className={`px-5 py-3.5 text-sm font-bold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {t.type === 'income' ? '+' : '-'}{settings.currency}{t.amount.toLocaleString()}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingId(t.id)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                                <Pencil size={12} />
                              </button>
                              {deleteConfirm === t.id ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => { deleteTransaction(t.id); setDeleteConfirm(null); }}
                                    className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                    <Check size={12} />
                                  </button>
                                  <button onClick={() => setDeleteConfirm(null)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                                    <X size={12} />
                                  </button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirm(t.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-sm text-slate-400">No transactions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="subscriptions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden">
              <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[#E6E8EC]">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">Manage Subscriptions</h2>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full font-medium">{subscriptions.length} active</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E6E8EC] bg-slate-50/50">
                      {['Name', 'Billing Cycle', 'Duration', 'Days Left', 'Status', 'Amount', ''].map((h) => (
                        <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {subscriptions.map((s, i) => {
                        const status = getSubStatus(s);
                        return (
                          <motion.tr key={s.id}
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                            transition={{ delay: i * 0.03 }}
                            className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
                          >
                            <td className="px-5 py-3.5 text-sm font-medium text-slate-800 whitespace-nowrap">{s.name}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-600 capitalize">{s.billing_cycle}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-400">{s.start_date} to {s.end_date}</td>
                            <td className="px-5 py-3.5 text-sm text-slate-600">{status.daysLeft} days</td>
                            <td className="px-5 py-3.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${status.color} uppercase tracking-wider`}>{status.label}</span>
                            </td>
                            <td className={`px-5 py-3.5 text-sm font-bold whitespace-nowrap text-red-600`}>
                              -{settings.currency}{s.amount.toLocaleString()}
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => setEditingSubId(s.id)}
                                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors">
                                  <Pencil size={12} />
                                </button>
                                {deleteSubConfirm === s.id ? (
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => { deleteSubscription(s.id); setDeleteSubConfirm(null); }}
                                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                                      <Check size={12} />
                                    </button>
                                    <button onClick={() => setDeleteSubConfirm(null)}
                                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                                      <X size={12} />
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => setDeleteSubConfirm(s.id)}
                                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                    {subscriptions.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-sm text-slate-400">No subscriptions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showAddSubModal && (
        <Modal title="Add Subscription" onClose={() => setShowAddSubModal(false)}>
          <SubscriptionForm onSubmit={handleAddSub} onCancel={() => setShowAddSubModal(false)} submitLabel="Add Subscription" />
        </Modal>
      )}

      {editingSubscription && (
        <Modal title="Edit Subscription" onClose={() => setEditingSubId(null)}>
          <SubscriptionForm
            initial={{ 
              ...editingSubscription, 
              amount: String(editingSubscription.amount), 
              reminder_days: String(editingSubscription.reminder_days),
              validity: (() => {
                const s = new Date(editingSubscription.start_date);
                const e = new Date(editingSubscription.end_date);
                const diffMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
                return String(diffMonths || 1);
              })()
            }}
            onSubmit={handleUpdateSub}
            onCancel={() => setEditingSubId(null)}
            submitLabel="Save Changes"
          />
        </Modal>
      )}

      {showAddModal && (
        <Modal title="Add Transaction" onClose={() => setShowAddModal(false)}>
          <TransactionForm onSubmit={handleAdd} onCancel={() => setShowAddModal(false)} submitLabel="Add Transaction" clientNames={clients.map((c) => c.name)} />
        </Modal>
      )}

      {editingTransaction && (
        <Modal title="Edit Transaction" onClose={() => setEditingId(null)}>
          <TransactionForm
            initial={{ ...editingTransaction, amount: String(editingTransaction.amount) }}
            onSubmit={handleUpdate}
            onCancel={() => setEditingId(null)}
            submitLabel="Save Changes"
            clientNames={clients.map((c) => c.name)}
          />
        </Modal>
      )}
    </ModuleLayout>
  );
}

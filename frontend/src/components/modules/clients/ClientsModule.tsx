import { useState } from 'react';
import { Plus, ArrowLeft, Mail, Phone, Download, Trash2, X, Check, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModuleLayout from '../../layout/ModuleLayout';
import { useStore } from '../../../store/useStore';
import { Client, PaymentEntry } from '../../../types';
import Modal from '../../common/Modal';
import { exportToCSV } from '../../../utils/csv';

const getClientStatus = (c: Client): 'paid' | 'partial' | 'pending' => {
  if (c.paidAmount >= c.totalAmount) return 'paid';
  if (c.paidAmount > 0) return 'partial';
  return 'pending';
};

const statusConfig = {
  paid: { color: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Paid' },
  partial: { color: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500', label: 'Partial' },
  pending: { color: 'bg-red-50 text-red-700', dot: 'bg-red-500', label: 'Pending' },
};

function AddPaymentForm({ client, onClose }: { client: Client; onClose: () => void }) {
  const { addPayment, settings } = useStore();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const remaining = client.totalAmount - client.paidAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const payment: PaymentEntry = { id: `pay${Date.now()}`, amount: amt, date, note };
    addPayment(client.id, payment);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 bg-orange-50 rounded-xl">
        <p className="text-xs text-orange-700 font-medium">Remaining: {settings.currency}{remaining.toLocaleString()}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Amount *</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" required min="1" max={remaining}
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Date *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Note</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Milestone 1 payment"
          className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">Record Payment</button>
      </div>
    </form>
  );
}

function AddClientForm({ onClose }: { onClose: () => void }) {
  const { addClient } = useStore();
  const [form, setForm] = useState({ name: '', company: '', project: '', totalAmount: '', email: '', phone: '', notes: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addClient({
      id: `c${Date.now()}`,
      name: form.name, company: form.company, project: form.project,
      totalAmount: parseFloat(form.totalAmount) || 0, paidAmount: 0,
      email: form.email, phone: form.phone, notes: form.notes,
      projectProgress: 0, payments: [],
      createdAt: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Name *</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Client name" required
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Company</label>
          <input value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Company name"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Project</label>
          <input value={form.project} onChange={(e) => set('project', e.target.value)} placeholder="Project name"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Total Amount</label>
          <input type="number" value={form.totalAmount} onChange={(e) => set('totalAmount', e.target.value)} placeholder="0"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@example.com"
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Phone</label>
          <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+91 ..."
            className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1.5">Notes</label>
        <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Any notes..."
          rows={2} className="w-full px-3.5 py-2.5 bg-[#F5F7FA] rounded-xl text-sm outline-none focus:ring-2 focus:ring-slate-900/10 resize-none" />
      </div>
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">Add Client</button>
      </div>
    </form>
  );
}

function ClientDetail({ client, onBack }: { client: Client; onBack: () => void }) {
  const { updateClient, deleteClient, setActiveView, settings } = useStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const status = getClientStatus(client);
  const sc = statusConfig[status];
  const pendingAmount = client.totalAmount - client.paidAmount;
  const progressPct = client.totalAmount > 0 ? Math.round((client.paidAmount / client.totalAmount) * 100) : 0;

  const handleDelete = () => {
    deleteClient(client.id);
    onBack();
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors group">
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Clients
        </button>
        <div className="flex items-center gap-2">
          {deleteConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Are you sure?</span>
              <button onClick={handleDelete} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-medium">Delete</button>
              <button onClick={() => setDeleteConfirm(false)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors">
              <Trash2 size={12} /> Delete Client
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
        <div className="md:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-[#E6E8EC]">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-xl font-bold">{client.name.charAt(0)}</div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{client.name}</h2>
                  <p className="text-sm text-slate-500">{client.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${sc.dot}`} />
                <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {client.email && <div className="flex items-center gap-2 text-sm text-slate-600"><Mail size={13} className="text-slate-400" />{client.email}</div>}
              {client.phone && <div className="flex items-center gap-2 text-sm text-slate-600"><Phone size={13} className="text-slate-400" />{client.phone}</div>}
            </div>
            {client.notes && <div className="p-3 bg-slate-50 rounded-xl"><p className="text-xs text-slate-600 leading-relaxed">{client.notes}</p></div>}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#E6E8EC]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-800">Project Progress</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Progress:</span>
                <input type="number" min="0" max="100" value={client.projectProgress}
                  onChange={(e) => updateClient(client.id, { projectProgress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                  className="w-16 px-2 py-1 bg-slate-100 rounded-lg text-xs text-center outline-none" />
                <span className="text-xs text-slate-500">%</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">{client.project}</span>
              <span className="text-sm font-bold text-slate-900">{client.projectProgress}%</span>
            </div>
            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${client.projectProgress}%` }} transition={{ duration: 0.8 }}
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E6E8EC]">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Payment Overview</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Total</span>
                <span className="text-sm font-bold text-slate-900">{settings.currency}{client.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Received</span>
                <span className="text-sm font-bold text-emerald-600">{settings.currency}{client.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Pending</span>
                <span className={`text-sm font-bold ${pendingAmount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {settings.currency}{pendingAmount.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8 }}
                  className="h-full bg-emerald-500 rounded-full" />
              </div>
              <p className="text-[10px] text-slate-400 text-right">{progressPct}% received</p>
            </div>
            {pendingAmount > 0 && (
              <button onClick={() => setShowPaymentModal(true)}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                <PlusCircle size={14} /> Record Payment
              </button>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-[#E6E8EC]">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Payment History</h3>
            {client.payments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No payments yet</p>
            ) : (
              <div className="space-y-2.5">
                {client.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600">+{settings.currency}{p.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400">{p.date}{p.note ? ` · ${p.note}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <Modal title="Record Payment" onClose={() => setShowPaymentModal(false)}>
          <AddPaymentForm client={client} onClose={() => setShowPaymentModal(false)} />
        </Modal>
      )}
    </motion.div>
  );
}

export default function ClientsModule() {
  const { clients, deleteClient, settings } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const syncedClient = selectedClient ? clients.find((c) => c.id === selectedClient.id) || null : null;

  if (syncedClient) {
    return (
      <ModuleLayout title="Clients" accentColor="bg-sky-500">
        <ClientDetail client={syncedClient} onBack={() => setSelectedClient(null)} />
      </ModuleLayout>
    );
  }

  const totalReceivable = clients.reduce((s, c) => s + (c.totalAmount - c.paidAmount), 0);
  const totalReceived = clients.reduce((s, c) => s + c.paidAmount, 0);
  const partialClients = clients.filter((c) => getClientStatus(c) === 'partial').length;
  const pendingClients = clients.filter((c) => getClientStatus(c) === 'pending').length;

  const handleExport = () => {
    exportToCSV(
      clients.map((c) => ({
        name: c.name, company: c.company, project: c.project,
        totalAmount: c.totalAmount, paidAmount: c.paidAmount,
        pending: c.totalAmount - c.paidAmount, status: getClientStatus(c)
      })),
      'clients'
    );
  };

  return (
    <ModuleLayout
      title="Clients"
      subtitle={`${clients.length} clients · ${settings.currency}${totalReceivable.toLocaleString()} receivable`}
      accentColor="bg-sky-500"
      actions={
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 bg-white border border-[#E6E8EC] text-slate-600 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors min-h-[44px]">
            <Download size={14} /> <span className="hidden sm:inline">Export</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-3.5 md:px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors min-h-[44px]">
            <Plus size={15} /> <span className="hidden sm:inline">Add Client</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-6">
        {[
          { label: 'Total Clients', value: clients.length, color: 'text-slate-800', suffix: '' },
          { label: 'Total Receivable', value: `${settings.currency}${totalReceivable.toLocaleString()}`, color: 'text-orange-600', suffix: '' },
          { label: 'Amount Received', value: `${settings.currency}${totalReceived.toLocaleString()}`, color: 'text-emerald-600', suffix: '' },
          { label: 'Partial Payments', value: partialClients, color: 'text-yellow-600', suffix: ' clients' },
          { label: 'No Payment Yet', value: pendingClients, color: 'text-red-600', suffix: ' clients' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#E6E8EC]">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}{s.suffix}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E6E8EC] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E6E8EC]">
          <h3 className="text-sm font-semibold text-slate-800">All Clients</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E6E8EC] bg-slate-50/50">
                {['Client', 'Project', 'Total', 'Received', 'Pending', 'Payment', ''].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {clients.map((c, i) => {
                  const status = getClientStatus(c);
                  const sc = statusConfig[status];
                  const pending = c.totalAmount - c.paidAmount;
                  const paidPct = c.totalAmount > 0 ? Math.round((c.paidAmount / c.totalAmount) * 100) : 0;
                  return (
                    <motion.tr key={c.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.04 }}
                      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors cursor-pointer group"
                      onClick={() => setSelectedClient(c)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">{c.name.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{c.name}</p>
                            <p className="text-xs text-slate-400">{c.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">{c.project}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">{settings.currency}{c.totalAmount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-emerald-600">{settings.currency}{c.paidAmount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-sm font-semibold text-red-500">{settings.currency}{pending.toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paidPct}%` }} />
                            </div>
                            <span className="text-xs text-slate-400">{paidPct}%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sc.color}`}>{sc.label}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        {deleteConfirm === c.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => { deleteClient(c.id); setDeleteConfirm(null); }}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><Check size={11} /></button>
                            <button onClick={() => setDeleteConfirm(null)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={11} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(c.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
              {clients.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-sm text-slate-400">No clients yet. Add your first client!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <Modal title="Add Client" onClose={() => setShowAddModal(false)}>
          <AddClientForm onClose={() => setShowAddModal(false)} />
        </Modal>
      )}
    </ModuleLayout>
  );
}

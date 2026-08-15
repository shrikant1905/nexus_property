import { useState } from 'react';
import { Plus, CreditCard, CheckCircle2, AlertTriangle, Clock, ArrowRight, Link } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/tables/SearchBar';
import FilterTabs from '../../../components/tables/FilterTabs';
import FormModal from '../../../components/modals/FormModal';
import { FormField, SelectField } from '../../../components/forms/FormFields';
import { formatCurrency } from '../../../utils/formatters';
import { useAuth } from '../../../hooks/useAuth';

const initPayments = [
  {
    id: 'pay1',
    ownerName: 'Sarah Johnson',
    date: '2026-03-05',
    method: 'Bank Transfer',
    ref: 'TRF-20260305-001',
    invoiceNum: 'INV-002',
    amount: 3160.00,
    status: 'Matched',
    matchedTags: ['Bank Reference', 'Owner Name', 'Invoice Number', 'Amount Match'],
  },
  {
    id: 'pay2',
    ownerName: 'John Smith',
    date: '2026-03-01',
    method: 'Bank Transfer',
    ref: 'TRF-20260301-002',
    invoiceNum: 'INV-005',
    amount: 2400.00,
    status: 'Matched',
    matchedTags: ['Bank Reference', 'Owner Name', 'Invoice Number', 'Amount Match'],
  },
  {
    id: 'pay3',
    ownerName: 'Emily Davis',
    date: '2026-02-28',
    method: 'Check',
    ref: 'CHK-8842',
    invoiceNum: null,
    amount: 4160.00,
    status: 'Unmatched',
    matchedTags: [],
  },
  {
    id: 'pay4',
    ownerName: 'Michael Chen',
    date: '2026-02-25',
    method: 'Wire Transfer',
    ref: 'WIR-20260225-001',
    invoiceNum: 'INV-003',
    amount: 1600.00,
    status: 'Partial',
    matchedTags: [],
  },
];

const emptyForm = { ownerName: '', date: '', amount: '', method: 'Bank Transfer', ref: '' };

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState(initPayments);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [month, setMonth] = useState('March 2026');

  const isOwner = user?.roleKey === 'property-owner';

  const filtered = payments.filter((p) => {
    const matchSearch = p.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      p.ref.toLowerCase().includes(search.toLowerCase()) ||
      (p.invoiceNum && p.invoiceNum.toLowerCase().includes(search.toLowerCase()));
    const matchTab = tab === 'All' || p.status === tab;
    return matchSearch && matchTab;
  });

  const fieldChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    setPayments([...payments, {
      ...form,
      id: `pay${Date.now()}`,
      amount: +form.amount,
      status: 'Unmatched',
      matchedTags: [],
    }]);
    setAddOpen(false);
  };

  // Property Owner View matching Screenshot 4
  if (isOwner) {
    const ownerPaymentList = [
      {
        id: 'owner-pay-1',
        ref: 'TRF-20260301-002',
        status: 'Matched',
        date: '2026-03-01',
        method: 'Bank Transfer',
        amount: 2400,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Payments</h1>
            <p className="text-sm text-slate-400 mt-1">View and manage your payments detail</p>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none cursor-pointer font-medium"
          >
            <option>March 2026</option>
            <option>February 2026</option>
            <option>January 2026</option>
          </select>
        </div>

        {/* Payment Card List matching Screenshot 4 */}
        <div className="space-y-4">
          {ownerPaymentList.map((item) => (
            <div key={item.id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
              <div className="space-y-2">
                <p className="text-base font-bold text-white">{item.ref}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                  <StatusBadge status={item.status} />
                  <span>{item.date} • {item.method}</span>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-emerald-400">{formatCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Admin / Finance Manager / Operations View
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-sm text-slate-400 mt-0.5">Payment recognition and invoice matching</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors cursor-pointer shadow-[0_4px_14px_rgba(0,155,242,0.3)]"
        >
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Received */}
        <div className="bg-[#061a14] border border-emerald-500/20 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Total Received</p>
              <p className="text-2xl font-bold text-white mt-1">$11,320.00</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-emerald-400 mt-3">↓ This month</p>
        </div>

        {/* Matched */}
        <div className="bg-[#0e1d2e] border border-cyan-500/20 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Matched</p>
              <p className="text-2xl font-bold text-white mt-1">2</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-cyan-400 mt-3">↓ Auto-matched</p>
        </div>

        {/* Unmatched */}
        <div className="bg-[#1c1505] border border-amber-500/20 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Unmatched</p>
              <p className="text-2xl font-bold text-white mt-1">1</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-amber-400 mt-3">↓ Needs review</p>
        </div>

        {/* Partial */}
        <div className="bg-[#120d1f] border border-purple-500/20 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Partial</p>
              <p className="text-2xl font-bold text-white mt-1">1</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-purple-400 mt-3">↓ Pending balance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar placeholder="Search payments by owner or ref..." value={search} onChange={setSearch} />
        <FilterTabs tabs={['All', 'Matched', 'Unmatched', 'Partial']} active={tab} onChange={setTab} />
      </div>

      {/* Section Subheading */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Payment Recognition</h2>
      </div>

      {/* Payment Card List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isMatched = item.status === 'Matched';
          const isPartial = item.status === 'Partial';

          return (
            <div key={item.id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 hover:border-white/10 transition-colors">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isMatched
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : isPartial
                      ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                      : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                  }`}>
                    {isMatched ? <CheckCircle2 size={18} /> : isPartial ? <Clock size={18} /> : <AlertTriangle size={18} />}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">{item.ownerName}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {item.date} &nbsp; {item.method} &nbsp; <span className="text-slate-500">Ref: {item.ref}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {item.invoiceNum && (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                      <Link size={12} />
                      <span>{item.invoiceNum}</span>
                      <ArrowRight size={12} className="text-slate-500" />
                    </div>
                  )}
                  <span className="text-base font-bold text-emerald-400">${item.amount.toFixed(2)}</span>
                  <StatusBadge status={item.status} />
                </div>
              </div>

              {item.matchedTags.length > 0 && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                  <span className="text-slate-500 font-medium">Matched using:</span>
                  {item.matchedTags.map((tag) => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-sm bg-[#0f172a] border border-white/10 rounded-2xl">
            No payments found
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <FormModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Record Payment" onSubmit={handleSave} submitLabel="Record Payment">
        <div className="space-y-4">
          <FormField label="Owner Name" name="ownerName" value={form.ownerName} onChange={fieldChange} required placeholder="Select owner..." />
          <FormField label="Date" name="date" type="date" value={form.date} onChange={fieldChange} required />
          <FormField label="Amount ($)" name="amount" type="number" value={form.amount} onChange={fieldChange} required placeholder="0.00" />
          <SelectField label="Payment Method" name="method" value={form.method} onChange={fieldChange} options={['Bank Transfer', 'Check', 'Wire Transfer', 'Stripe']} required />
          <FormField label="Reference" name="ref" value={form.ref} onChange={fieldChange} placeholder="e.g. TRF-20260305-001" />
        </div>
      </FormModal>
    </div>
  );
}

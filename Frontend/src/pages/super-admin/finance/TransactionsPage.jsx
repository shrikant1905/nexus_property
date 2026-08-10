import { useState } from 'react';
import { Download, RefreshCw, CheckCircle } from 'lucide-react';
import { transactions as initData, transactionStats } from '../../../data/transactions';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/tables/SearchBar';
import FilterTabs from '../../../components/tables/FilterTabs';
import FormModal from '../../../components/modals/FormModal';
import { formatCurrency } from '../../../utils/formatters';
import { useAuth } from '../../../hooks/useAuth';

const categoryColors = {
  Utilities: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  UTILITIES: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  Supplies: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  Revenue: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  REVENUE: 'bg-teal-500/15 text-teal-400 border border-teal-500/25',
  Maintenance: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  MAINTENANCE: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  Cleaning: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
  'Owner Payment': 'bg-teal-500/15 text-teal-400 border border-teal-500/25',
  Marketing: 'bg-pink-500/15 text-pink-400 border border-pink-500/25',
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [data] = useState(initData);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [viewTx, setViewTx] = useState(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [month, setMonth] = useState('March 2026');

  const isOwner = user?.roleKey === 'property-owner';

  const filtered = data.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.vendor.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'All' || t.status === tab;
    return matchSearch && matchTab;
  });

  // Property Owner View matching Screenshot 5
  if (isOwner) {
    const ownerTxList = [
      {
        id: 'otx-1',
        date: '2026-03-05',
        property: 'Sunset Villa',
        description: 'Zone Water Supply',
        category: 'UTILITIES',
        amount: -245,
      },
      {
        id: 'otx-2',
        date: '2026-03-04',
        property: 'Sunset Villa',
        description: 'Airbnb Payout - Sunset Villa',
        category: 'REVENUE',
        amount: 2850,
      },
      {
        id: 'otx-3',
        date: '2026-03-01',
        property: 'Palm Court Apartment',
        description: 'Pest Control Service',
        category: 'MAINTENANCE',
        amount: -175,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Transactions</h1>
            <p className="text-sm text-slate-400 mt-1">View and manage your transactions detail</p>
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

        {/* Table matching Screenshot 5 */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                {['DATE', 'PROPERTY', 'DESCRIPTION', 'CATEGORY', 'AMOUNT'].map((col) => (
                  <th key={col} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-5">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ownerTxList.map((t) => (
                <tr key={t.id} className="border-t border-white/5 hover:bg-white/[0.025] transition-colors">
                  <td className="py-4.5 px-5 text-slate-400 text-sm font-medium">{t.date}</td>
                  <td className="py-4.5 px-5 font-bold text-white text-sm">{t.property}</td>
                  <td className="py-4.5 px-5 text-slate-300 font-medium text-sm">{t.description}</td>
                  <td className="py-4.5 px-5">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${categoryColors[t.category] || 'bg-slate-800 text-slate-300'}`}>
                      {t.category}
                    </span>
                  </td>
                  <td className={`py-4.5 px-5 font-bold text-base ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {t.amount >= 0 ? `+${t.amount.toLocaleString()}` : t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-sm text-slate-400 mt-0.5">Bank feed and transaction management</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:border-white/20 hover:text-white transition-colors cursor-pointer">
            <Download size={14} /> Import
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors cursor-pointer shadow-[0_4px_14px_rgba(0,155,242,0.3)]">
            <RefreshCw size={14} /> Sync Bank
          </button>
        </div>
      </div>

      {/* 3 Stat Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Inflow', value: formatCurrency(transactionStats.totalInflow), color: 'text-emerald-400' },
          { label: 'Total Outflow', value: `-${formatCurrency(transactionStats.totalOutflow)}`, color: 'text-red-400' },
          { label: 'Net Flow', value: formatCurrency(transactionStats.netFlow), color: 'text-emerald-400' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
            <p className="text-sm font-medium text-slate-400 mb-2">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar placeholder="Search transactions..." value={search} onChange={setSearch} />
        <FilterTabs tabs={['All', 'Pending', 'Categorized', 'Matched']} active={tab} onChange={setTab} />
      </div>

      {/* Table */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[960px]">
          <thead>
            <tr className="border-b border-white/5">
              {['DATE', 'DESCRIPTION', 'VENDOR', 'AMOUNT', 'BANK ACCOUNT', 'CATEGORY', 'PROPERTY', 'BILLABLE', 'STATUS'].map((col) => (
                <th key={col} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-4">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                onClick={() => setViewTx(t)}
                className="border-t border-white/5 hover:bg-white/[0.025] transition-colors cursor-pointer"
              >
                <td className="py-4 px-4 text-slate-400 text-xs whitespace-nowrap">{t.date}</td>
                <td className="py-4 px-4 font-semibold text-white max-w-[180px] truncate">{t.description}</td>
                <td className="py-4 px-4 text-slate-300 text-xs whitespace-nowrap">{t.vendor}</td>
                <td className={`py-4 px-4 font-bold text-sm ${t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {t.amount >= 0 ? `+${formatCurrency(t.amount)}` : formatCurrency(Math.abs(t.amount))}
                </td>
                <td className="py-4 px-4 text-slate-400 text-xs whitespace-nowrap">{t.bankAccount}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${categoryColors[t.category] || 'bg-slate-800 text-slate-300'}`}>
                    {t.category}
                  </span>
                </td>
                <td className={`py-4 px-4 text-sm ${!t.propertyName || t.propertyName === 'Unassigned' ? 'text-slate-500 italic' : 'text-slate-300'}`}>
                  {t.propertyName || 'Unassigned'}
                </td>
                <td className="py-4 px-4 text-center">
                  {t.billable
                    ? <CheckCircle size={15} className="text-emerald-400 mx-auto" />
                    : <span className="text-slate-600 text-base">—</span>}
                </td>
                <td className="py-4 px-4"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-sm">No transactions found</div>
        )}
      </div>

      {/* Transaction Details Modal */}
      <FormModal isOpen={!!viewTx} onClose={() => setViewTx(null)} title="Transaction Details">
        {viewTx && (
          <div className="space-y-3 text-sm">
            {[
              ['Date', viewTx.date],
              ['Description', viewTx.description],
              ['Vendor', viewTx.vendor],
              ['Amount', viewTx.amount >= 0 ? `+${formatCurrency(viewTx.amount)}` : `-${formatCurrency(Math.abs(viewTx.amount))}`],
              ['Bank Account', viewTx.bankAccount],
              ['Category', viewTx.category],
              ['Property', viewTx.propertyName || 'Unassigned'],
              ['Status', viewTx.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
            <button
              onClick={() => setAssignOpen(true)}
              className="mt-3 w-full px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#009bf2]/20 border border-[#009bf2]/30 hover:bg-[#009bf2]/30 transition-colors cursor-pointer"
            >
              Assign Property
            </button>
          </div>
        )}
      </FormModal>

      {/* Assign Property Modal */}
      <FormModal isOpen={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Property" onSubmit={() => setAssignOpen(false)} submitLabel="Assign">
        <p className="text-sm text-slate-400 mb-4">Select a property to assign this transaction to:</p>
        <select className="w-full bg-[#0b0f19] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none cursor-pointer">
          <option value="">Select property...</option>
          {['Sunset Villa', 'Ocean Breeze Condo', 'Palm Court Apartment', 'Harbor View Loft', 'Garden Estate', 'Bayfront Penthouse'].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </FormModal>
    </div>
  );
}

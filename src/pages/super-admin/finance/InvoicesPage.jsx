import { useState } from 'react';
import { Plus, Eye } from 'lucide-react';
import { invoices as initData, invoiceStats } from '../../../data/invoices';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/tables/SearchBar';
import FilterTabs from '../../../components/tables/FilterTabs';
import FormModal from '../../../components/modals/FormModal';
import { FormField, SelectField } from '../../../components/forms/FormFields';
import { formatCurrency } from '../../../utils/formatters';
import { useAuth } from '../../../hooks/useAuth';

const emptyForm = { ownerName: '', propertyName: '', revenue: '', expenses: '', period: '', dueDate: '', status: 'Draft' };

export default function InvoicesPage() {
  const { user } = useAuth();
  const [data] = useState(initData);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [genOpen, setGenOpen] = useState(false);
  const [viewInv, setViewInv] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [month, setMonth] = useState('March 2026');

  const isOwner = user?.roleKey === 'property-owner';

  // If owner role, filter for owner's data only
  const ownerInvoices = data.filter((inv) => inv.ownerName === 'John Smith' || isOwner);

  const filtered = data.filter((inv) => {
    const matchSearch = inv.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.propertyName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === 'All' || inv.status === tab;
    return matchSearch && matchTab;
  });

  const fieldChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Property Owner View (Matching Screenshot 2)
  if (isOwner) {
    const ownerCards = [
      {
        id: 'inv-1',
        number: 'INV-001',
        status: 'Sent',
        property: 'Sunset Villa',
        period: 'March 2026',
        dueDate: '2026-03-15',
        amount: 4700,
        unpaid: true,
      },
      {
        id: 'inv-5',
        number: 'INV-005',
        status: 'Paid',
        property: 'Palm Court Apartment',
        period: 'February 2026',
        dueDate: '2026-02-15',
        amount: 2640,
        unpaid: false,
      },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Invoices</h1>
            <p className="text-sm text-slate-400 mt-1">View and manage your invoices detail</p>
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

        {/* Card List matching Screenshot 2 */}
        <div className="space-y-4">
          {ownerCards.map((inv) => (
            <div key={inv.id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 font-bold text-base cursor-pointer hover:underline">{inv.number}</span>
                  <StatusBadge status={inv.status} />
                </div>
                <p className="text-lg font-bold text-white">{inv.property}</p>
                <p className="text-xs text-slate-400 font-medium">{inv.period} • Due: {inv.dueDate}</p>
              </div>
              <div className="flex items-center gap-5">
                <span className="text-2xl font-bold text-white">{formatCurrency(inv.amount)}</span>
                {inv.unpaid && (
                  <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors cursor-pointer shadow-[0_4px_14px_rgba(0,155,242,0.3)]">
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Admin / Finance Manager / Operations View
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-sm text-slate-400 mt-0.5">Owner invoice generation and management</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setGenOpen(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors cursor-pointer shadow-[0_4px_14px_rgba(0,155,242,0.3)]">
          <Plus size={16} /> Generate Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-400 mb-2">Total Invoices</p>
          <p className="text-2xl font-bold text-white">{invoiceStats.totalInvoices}</p>
        </div>
        <div className="bg-[#1c1505] border border-amber-500/20 rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-400 mb-2">Outstanding</p>
          <p className="text-2xl font-bold text-amber-400">{formatCurrency(invoiceStats.outstanding)}</p>
        </div>
        <div className="bg-[#061a14] border border-emerald-500/20 rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-400 mb-2">Paid</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(invoiceStats.paid)}</p>
        </div>
        <div className="bg-[#1d0a10] border border-red-500/20 rounded-2xl p-5">
          <p className="text-sm font-medium text-slate-400 mb-2">Overdue</p>
          <p className="text-2xl font-bold text-red-400">{invoiceStats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar placeholder="Search invoices..." value={search} onChange={setSearch} />
        <FilterTabs tabs={['All', 'Draft', 'Sent', 'Paid', 'Overdue']} active={tab} onChange={setTab} />
      </div>

      {/* Table */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-white/5">
              {['INVOICE #', 'OWNER', 'PROPERTY', 'PERIOD', 'REVENUE', 'EXPENSES', 'MGMT FEE', 'NET PAYOUT', 'STATUS', 'DUE DATE', 'ACTIONS'].map((col) => (
                <th key={col} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-4">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.id} className="border-t border-white/5 hover:bg-white/[0.025] transition-colors">
                <td className="py-4 px-4 text-cyan-400 font-bold cursor-pointer hover:underline" onClick={() => setViewInv(inv)}>{inv.invoiceNumber}</td>
                <td className="py-4 px-4 font-semibold text-white">{inv.ownerName}</td>
                <td className="py-4 px-4 text-slate-300 font-medium">{inv.propertyName}</td>
                <td className="py-4 px-4 text-slate-400">{inv.period}</td>
                <td className="py-4 px-4 text-emerald-400 font-bold">{formatCurrency(inv.revenue)}</td>
                <td className="py-4 px-4 text-red-400 font-bold">{formatCurrency(inv.expenses)}</td>
                <td className="py-4 px-4 text-amber-400 font-bold">{formatCurrency(inv.managementFee)}</td>
                <td className="py-4 px-4 text-white font-extrabold">{formatCurrency(inv.netPayout)}</td>
                <td className="py-4 px-4"><StatusBadge status={inv.status} /></td>
                <td className="py-4 px-4 text-slate-400 text-xs">{inv.dueDate}</td>
                <td className="py-4 px-4">
                  <button onClick={() => setViewInv(inv)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-slate-500 text-sm">No invoices found</div>}
      </div>

      {/* Generate Invoice Modal */}
      <FormModal isOpen={genOpen} onClose={() => setGenOpen(false)} title="Generate Invoice" onSubmit={() => setGenOpen(false)} submitLabel="Generate Invoice">
        <div className="space-y-4">
          <FormField label="Owner Name" name="ownerName" value={form.ownerName} onChange={fieldChange} required placeholder="Select owner..." />
          <FormField label="Property" name="propertyName" value={form.propertyName} onChange={fieldChange} required placeholder="Select property..." />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Total Revenue ($)" name="revenue" type="number" value={form.revenue} onChange={fieldChange} placeholder="0.00" />
            <FormField label="Total Expenses ($)" name="expenses" type="number" value={form.expenses} onChange={fieldChange} placeholder="0.00" />
          </div>
          <FormField label="Billing Period" name="period" value={form.period} onChange={fieldChange} placeholder="e.g. March 2026" />
          <FormField label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={fieldChange} />
          <SelectField label="Status" name="status" value={form.status} onChange={fieldChange} options={['Draft', 'Sent', 'Paid', 'Overdue']} />
        </div>
      </FormModal>

      {/* Invoice Details Modal */}
      <FormModal isOpen={!!viewInv} onClose={() => setViewInv(null)} title={`Invoice ${viewInv?.invoiceNumber || ''}`}>
        {viewInv && (
          <div className="space-y-3 text-sm">
            {[
              ['Invoice #', viewInv.invoiceNumber],
              ['Owner', viewInv.ownerName],
              ['Property', viewInv.propertyName],
              ['Period', viewInv.period],
              ['Revenue', formatCurrency(viewInv.revenue)],
              ['Expenses', formatCurrency(viewInv.expenses)],
              ['Management Fee', formatCurrency(viewInv.managementFee)],
              ['Net Payout', formatCurrency(viewInv.netPayout)],
              ['Status', viewInv.status],
              ['Due Date', viewInv.dueDate],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-slate-400">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
        )}
      </FormModal>
    </div>
  );
}

import { useState } from 'react';
import { Plus, Scissors, AlertTriangle, Building2, FileText, CheckCircle2, Building, Tag } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/tables/SearchBar';
import FilterTabs from '../../../components/tables/FilterTabs';
import FormModal from '../../../components/modals/FormModal';
import { FormField, SelectField, ToggleField } from '../../../components/forms/FormFields';
import { formatCurrency } from '../../../utils/formatters';

const initExpenses = [
  { id: 'be1', description: 'Zone Water Supply', status: 'Assigned', date: '2026-03-05', vendor: 'Zone Water', category: 'Utilities', propertyName: 'Sunset Villa', amount: 245.00, billable: true, canSplit: false },
  { id: 'be2', description: 'Amazon - Cleaning Supplies', status: 'Unassigned', date: '2026-03-04', vendor: 'Amazon', category: 'Supplies', propertyName: null, amount: 350.00, billable: true, canSplit: true },
  { id: 'be3', description: 'Home Depot - Door Repair', status: 'Ready', date: '2026-03-03', vendor: 'Home Depot', category: 'Maintenance', propertyName: 'Harbor View Loft', amount: 189.50, billable: true, canSplit: false },
  { id: 'be4', description: 'Pro Clean Services', status: 'Invoiced', date: '2026-03-02', vendor: 'Pro Clean', category: 'Cleaning', propertyName: 'Garden Estate', amount: 450.00, billable: true, canSplit: false },
  { id: 'be5', description: 'Pest Control Service', status: 'Paid', date: '2026-03-01', vendor: 'Terminix', category: 'Maintenance', propertyName: 'Palm Court Apartment', amount: 175.00, billable: true, canSplit: false },
  { id: 'be6', description: 'AT&T Internet', status: 'Assigned', date: '2026-02-28', vendor: 'AT&T', category: 'Utilities', propertyName: 'Downtown Studio', amount: 89.99, billable: true, canSplit: false },
  { id: 'be7', description: 'FPL Electric', status: 'Unassigned', date: '2026-03-05', vendor: 'FPL', category: 'Utilities', propertyName: null, amount: 312.00, billable: true, canSplit: true },
];

const categoryColors = {
  Utilities: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  Supplies: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  Maintenance: 'bg-teal-500/15 text-teal-400 border border-teal-500/25',
  Cleaning: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
};

const emptyForm = { description: '', vendor: '', date: '', amount: '', category: 'Utilities', propertyName: '', billable: true };

export default function BillableExpensesPage() {
  const [expenses, setExpenses] = useState(initExpenses);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [splitOpen, setSplitOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = expenses.filter((e) => {
    const matchSearch = e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.vendor.toLowerCase().includes(search.toLowerCase()) ||
      (e.propertyName && e.propertyName.toLowerCase().includes(search.toLowerCase()));
    const matchTab = tab === 'All' || e.status === tab;
    return matchSearch && matchTab;
  });

  const toggleBillable = (id) => {
    setExpenses(expenses.map((e) => e.id === id ? { ...e, billable: !e.billable } : e));
  };

  const fieldChange = (ev) => setForm({ ...form, [ev.target.name]: ev.target.value });

  const handleSave = () => {
    setExpenses([...expenses, {
      ...form,
      id: `be${Date.now()}`,
      amount: +form.amount,
      status: form.propertyName ? 'Assigned' : 'Unassigned',
      canSplit: !form.propertyName,
    }]);
    setAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Billable Expenses</h1>
          <p className="text-sm text-slate-400 mt-0.5">Central expense allocation and owner billing</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors"
        >
          <Plus size={16} /> Add Expense
        </button>
      </div>

      {/* Stat Cards Grid (Exact matching image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Unassigned Expenses */}
        <div className="bg-gradient-to-br from-[#271d13] to-[#121826] border border-amber-500/10 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Unassigned Expenses</p>
              <p className="text-2xl font-bold text-white mt-1">2</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-amber-400 mt-3">↓ Needs attention</p>
        </div>

        {/* Assigned to Property */}
        <div className="bg-gradient-to-br from-[#0f242d] to-[#121826] border border-cyan-500/10 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Assigned to Property</p>
              <p className="text-2xl font-bold text-white mt-1">2</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Building2 size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-cyan-400 mt-3">↓ Ready to review</p>
        </div>

        {/* Ready for Invoice */}
        <div className="bg-gradient-to-br from-[#1c1830] to-[#121826] border border-purple-500/10 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Ready for Invoice</p>
              <p className="text-2xl font-bold text-white mt-1">2</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FileText size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-purple-400 mt-3">↓ Auto-generated</p>
        </div>

        {/* Paid by Owner */}
        <div className="bg-gradient-to-br from-[#0f2621] to-[#121826] border border-emerald-500/10 rounded-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-slate-400">Paid by Owner</p>
              <p className="text-2xl font-bold text-white mt-1">1</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="text-xs font-medium text-emerald-400 mt-3">↓ Completed</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar placeholder="Search expenses..." value={search} onChange={setSearch} />
        <FilterTabs tabs={['All', 'Unassigned', 'Assigned', 'Ready', 'Invoiced', 'Paid']} active={tab} onChange={setTab} />
      </div>

      {/* Card List Items (Exact match to image 3 layout!) */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 hover:border-white/10 transition-colors">
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-white">{item.description}</h3>
                <StatusBadge status={item.status} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-base font-bold text-white">${item.amount.toFixed(2)}</span>
                <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.billable}
                    onChange={() => toggleBillable(item.id)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Billable</span>
                </label>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
              <div className="flex items-center gap-4 flex-wrap">
                <span>{item.date}</span>
                <span>Vendor: <span className="text-slate-300 font-medium">{item.vendor}</span></span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${categoryColors[item.category] || 'bg-slate-800 text-slate-300'}`}>
                  {item.category}
                </span>
                {item.propertyName && (
                  <span className="flex items-center gap-1 text-slate-300">
                    <Building size={13} className="text-slate-500" />
                    {item.propertyName}
                  </span>
                )}
              </div>

              {item.canSplit && (
                <button
                  onClick={() => setSplitOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors"
                >
                  <Scissors size={12} /> Split
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-sm bg-[#0f172a] border border-white/10 rounded-2xl">
            No expenses found
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <FormModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Expense" onSubmit={handleSave} submitLabel="Save Expense">
        <div className="space-y-4">
          <FormField label="Description" name="description" value={form.description} onChange={fieldChange} required placeholder="e.g. Amazon - Cleaning Supplies" />
          <FormField label="Vendor" name="vendor" value={form.vendor} onChange={fieldChange} required placeholder="e.g. Amazon" />
          <FormField label="Date" name="date" type="date" value={form.date} onChange={fieldChange} required />
          <FormField label="Amount ($)" name="amount" type="number" value={form.amount} onChange={fieldChange} required placeholder="0.00" />
          <SelectField label="Category" name="category" value={form.category} onChange={fieldChange} options={['Utilities', 'Supplies', 'Maintenance', 'Cleaning']} required />
          <FormField label="Property (Optional)" name="propertyName" value={form.propertyName} onChange={fieldChange} placeholder="Leave blank if unassigned" />
          <ToggleField label="Billable to Owner" description="Include this expense in owner invoices" checked={!!form.billable} onChange={(v) => setForm({ ...form, billable: v })} />
        </div>
      </FormModal>

      {/* Split Modal */}
      <FormModal isOpen={splitOpen} onClose={() => setSplitOpen(false)} title="Expense Allocation" onSubmit={() => setSplitOpen(false)} submitLabel="Save Allocation">
        <p className="text-sm text-slate-400 mb-4">Split this expense across multiple properties:</p>
        {['Sunset Villa', 'Ocean Breeze Condo', 'Garden Estate'].map((prop) => (
          <div key={prop} className="flex items-center justify-between py-3 border-b border-white/5">
            <span className="text-sm text-slate-300">{prop}</span>
            <input type="number" placeholder="0.00" className="w-24 bg-[#0b0f19] border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none" />
          </div>
        ))}
      </FormModal>
    </div>
  );
}

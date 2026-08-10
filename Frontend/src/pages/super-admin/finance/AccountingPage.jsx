import { useState } from 'react';
import { Plus, BookOpen, ChevronDown, ChevronRight, Folder, TrendingDown, Shield, TrendingUp, DollarSign } from 'lucide-react';
import SearchBar from '../../../components/tables/SearchBar';
import FormModal from '../../../components/modals/FormModal';
import { FormField, SelectField } from '../../../components/forms/FormFields';

const categoryGroups = [
  {
    id: 'assets',
    code: '1000 - Assets',
    icon: Folder,
    iconColor: 'text-[#38bdf8] bg-[#009bf2]/10 border-[#009bf2]/20',
    count: '3 accounts',
    total: '78,090.5',
    items: [
      { code: '1100', name: 'Chase Business Checking', balance: '45,680.5' },
      { code: '1200', name: 'Wells Fargo Business', balance: '23,450' },
      { code: '1300', name: 'Accounts Receivable', balance: '8,960' },
    ],
  },
  {
    id: 'liabilities',
    code: '2000 - Liabilities',
    icon: TrendingDown,
    iconColor: 'text-[#f87171] bg-red-500/10 border-red-500/20',
    count: '2 accounts',
    total: '49,220',
    items: [
      { code: '2100', name: 'Owner Payables', balance: '14,220' },
      { code: '2200', name: 'Business Loan', balance: '35,000' },
    ],
  },
  {
    id: 'equity',
    code: '3000 - Equity',
    icon: Shield,
    iconColor: 'text-[#c084fc] bg-purple-500/10 border-purple-500/20',
    count: '2 accounts',
    total: '68,500',
    items: [
      { code: '3100', name: 'Owner Equity', balance: '50,000' },
      { code: '3200', name: 'Retained Earnings', balance: '18,500' },
    ],
  },
  {
    id: 'income',
    code: '4000 - Income',
    icon: TrendingUp,
    iconColor: 'text-[#34d399] bg-emerald-500/10 border-emerald-500/20',
    count: '2 accounts',
    total: '56,880',
    items: [
      { code: '4100', name: 'Airbnb Revenue', balance: '47,400' },
      { code: '4200', name: 'Management Fees', balance: '9,480' },
    ],
  },
  {
    id: 'expenses',
    code: '5000 - Expenses',
    icon: DollarSign,
    iconColor: 'text-[#fbbf24] bg-amber-500/10 border-amber-500/20',
    count: '5 accounts',
    total: '12,460',
    items: [
      { code: '5100', name: 'Utilities', balance: '3,240' },
      { code: '5200', name: 'Maintenance', balance: '2,180' },
      { code: '5300', name: 'Cleaning', balance: '4,500' },
      { code: '5400', name: 'Supplies', balance: '1,890' },
      { code: '5500', name: 'Marketing', balance: '650' },
    ],
  },
];

const emptyJournal = { debitAccount: '', creditAccount: '', amount: '', date: '', memo: '' };
const emptyAccount = { category: 'Assets', code: '', name: '', openingBalance: '' };

export default function AccountingPage() {
  const [search, setSearch] = useState('');
  // Matching live site expand state: Assets is expanded (true), others collapsed (false)
  const [expandedGroups, setExpandedGroups] = useState({
    assets: true,
    liabilities: false,
    equity: false,
    income: false,
    expenses: false,
  });
  const [journalOpen, setJournalOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [journalForm, setJournalForm] = useState(emptyJournal);
  const [accForm, setAccForm] = useState(emptyAccount);

  const toggleGroup = (id) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const jChange = (e) => setJournalForm({ ...journalForm, [e.target.name]: e.target.value });
  const aChange = (e) => setAccForm({ ...accForm, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6 select-none">
      {/* Row 1: Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounting</h1>
          <p className="text-sm text-slate-400 mt-0.5">Chart of Accounts — QuickBooks style</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setJournalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-slate-300 border border-white/10 hover:border-white/20 hover:text-white transition-colors cursor-pointer"
          >
            <BookOpen size={15} /> Journal Entry
          </button>
          <button
            onClick={() => { setAccForm(emptyAccount); setAddAccountOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors cursor-pointer"
          >
            <Plus size={16} /> Add Account
          </button>
        </div>
      </div>

      {/* Row 2: Search Bar (Placed ABOVE stat cards matching live site Image 2!) */}
      <div className="w-full max-w-md">
        <SearchBar placeholder="Search chart of accounts..." value={search} onChange={setSearch} />
      </div>

      {/* Row 3: 5 Top Stat Cards (Matching live site Image 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {categoryGroups.map((g) => {
          const Icon = g.icon;
          return (
            <div key={g.id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2.5 mb-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${g.iconColor}`}>
                  <Icon size={14} />
                </div>
                <span className="text-xs font-semibold text-slate-400">{g.id.charAt(0).toUpperCase() + g.id.slice(1)}</span>
              </div>
              <p className="text-xl font-bold text-white">${g.total}</p>
            </div>
          );
        })}
      </div>

      {/* Row 4: Main Container Chart of Accounts */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h2 className="text-base font-bold text-white">Chart of Accounts</h2>
          <span className="text-xs text-slate-500 font-medium">19 accounts</span>
        </div>

        {/* Group Accordions */}
        <div className="divide-y divide-white/5">
          {categoryGroups.map((group) => {
            const Icon = group.icon;
            const isExpanded = expandedGroups[group.id];

            const filteredItems = group.items.filter((item) =>
              item.name.toLowerCase().includes(search.toLowerCase()) ||
              item.code.includes(search)
            );

            if (search && filteredItems.length === 0) return null;

            return (
              <div key={group.id}>
                {/* Group Header Row */}
                <div
                  onClick={() => toggleGroup(group.id)}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${group.iconColor}`}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-white text-sm">{group.code}</span>
                      <span className="text-xs text-slate-500 ml-2 font-normal">{group.count}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">${group.total}</span>
                    {isExpanded ? (
                      <ChevronDown size={16} className="text-slate-400" />
                    ) : (
                      <ChevronRight size={16} className="text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Sub-items list */}
                {isExpanded && (
                  <div className="bg-[#0b0f19]/60 divide-y divide-white/5 border-t border-white/5">
                    {filteredItems.map((item) => (
                      <div key={item.code} className="flex items-center justify-between py-3.5 px-6 pl-14 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-center gap-6">
                          <span className="text-xs font-mono text-slate-500 w-10">{item.code}</span>
                          <span className="text-sm font-medium text-slate-200">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-white">${item.balance}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Journal Entry Modal */}
      <FormModal isOpen={journalOpen} onClose={() => setJournalOpen(false)} title="New Journal Entry" onSubmit={() => setJournalOpen(false)} submitLabel="Record Entry">
        <div className="space-y-4">
          <FormField label="Debit Account (From)" name="debitAccount" value={journalForm.debitAccount} onChange={jChange} required placeholder="Select account..." />
          <FormField label="Credit Account (To)" name="creditAccount" value={journalForm.creditAccount} onChange={jChange} required placeholder="Select account..." />
          <FormField label="Amount ($)" name="amount" type="number" value={journalForm.amount} onChange={jChange} required placeholder="0.00" />
          <FormField label="Date" name="date" type="date" value={journalForm.date} onChange={jChange} required />
          <FormField label="Memo" name="memo" value={journalForm.memo} onChange={jChange} placeholder="Optional description..." />
        </div>
      </FormModal>

      {/* Add Account Modal */}
      <FormModal isOpen={addAccountOpen} onClose={() => setAddAccountOpen(false)} title="Add Account" onSubmit={() => setAddAccountOpen(false)} submitLabel="Add Account">
        <div className="space-y-4">
          <SelectField label="Account Category" name="category" value={accForm.category} onChange={aChange} options={['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses']} required />
          <FormField label="Account Code" name="code" value={accForm.code} onChange={aChange} required placeholder="e.g. 1003" />
          <FormField label="Account Name" name="name" value={accForm.name} onChange={aChange} required placeholder="e.g. Operating Checking" />
          <FormField label="Opening Balance ($)" name="openingBalance" type="number" value={accForm.openingBalance} onChange={aChange} placeholder="0.00" />
        </div>
      </FormModal>
    </div>
  );
}

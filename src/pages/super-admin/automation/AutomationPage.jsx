import { useState } from 'react';
import { Plus, Zap, Pause, Play, Pencil, Trash2 } from 'lucide-react';
import FormModal from '../../../components/modals/FormModal';
import { FormField } from '../../../components/forms/FormFields';

const initRules = [
  {
    id: 'ar1',
    name: 'Water Utility Auto-Categorize',
    status: 'Active',
    ifTag: 'Description contains "Zone Water"',
    thenTag: 'Category → Utilities, Property → Auto Detect',
    matchedCount: 24,
  },
  {
    id: 'ar2',
    name: 'Amazon Supplies',
    status: 'Active',
    ifTag: 'Vendor = Amazon',
    thenTag: 'Category → Supplies, Require Property Assignment',
    matchedCount: 18,
  },
  {
    id: 'ar3',
    name: 'Airbnb Revenue Match',
    status: 'Active',
    ifTag: 'Vendor = Airbnb AND Amount > 0',
    thenTag: 'Category → Revenue, Auto Match Property',
    matchedCount: 156,
  },
  {
    id: 'ar4',
    name: 'FPL Electric',
    status: 'Active',
    ifTag: 'Description contains "FPL"',
    thenTag: 'Category → Utilities, Split by Property Count',
    matchedCount: 12,
  },
  {
    id: 'ar5',
    name: 'Pro Clean Services',
    status: 'Active',
    ifTag: 'Vendor = Pro Clean',
    thenTag: 'Category → Cleaning, Billable → Yes',
    matchedCount: 32,
  },
  {
    id: 'ar6',
    name: 'Owner Payment Detection',
    status: 'Paused',
    ifTag: 'Amount > 0 AND Description contains "Owner"',
    thenTag: 'Category → Owner Payment, Auto Match Invoice',
    matchedCount: 8,
  },
];

const emptyForm = { name: '', ifTag: '', thenTag: '' };

export default function AutomationPage() {
  const [rules, setRules] = useState(initRules);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const togglePause = (id) => {
    setRules(rules.map((r) => r.id === id ? { ...r, status: r.status === 'Active' ? 'Paused' : 'Active' } : r));
  };

  const openEdit = (rule) => {
    setSelected(rule);
    setForm({ name: rule.name, ifTag: rule.ifTag, thenTag: rule.thenTag });
    setEditOpen(true);
  };

  const fieldChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (editOpen) {
      setRules(rules.map((r) => r.id === selected.id ? { ...r, ...form } : r));
      setEditOpen(false);
    } else {
      setRules([...rules, { ...form, id: `ar${Date.now()}`, status: 'Active', matchedCount: 0 }]);
      setAddOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Automation Rules</h1>
          <p className="text-sm text-slate-400 mt-0.5">Auto-categorize 99% of transactions</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setAddOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors"
        >
          <Plus size={16} /> Create Rule
        </button>
      </div>

      {/* 3 Stat Cards (Matching image 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400">Active Rules</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">5</p>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400">Total Matches</p>
          <p className="text-2xl font-bold text-cyan-400 mt-1">250</p>
        </div>
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-4">
          <p className="text-xs font-medium text-slate-400">Auto-Categorized</p>
          <p className="text-2xl font-bold text-teal-400 mt-1">96%</p>
        </div>
      </div>

      {/* Rule Cards List (Matching image 3 layout!) */}
      <div className="space-y-3">
        {rules.map((rule) => {
          const isActive = rule.status === 'Active';
          return (
            <div key={rule.id} className="bg-[#0f172a] border border-white/10 rounded-2xl p-5 hover:border-white/10 transition-colors">
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    <Zap size={16} />
                  </div>
                  <h3 className="text-sm font-bold text-white">{rule.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                  }`}>
                    {rule.status}
                  </span>
                </div>

                {/* Right Action Icons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePause(rule.id)}
                    className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title={isActive ? 'Pause' : 'Activate'}
                  >
                    {isActive ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    onClick={() => openEdit(rule)}
                    className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Middle row: IF / THEN tags */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20">
                  <span className="text-amber-400 font-bold">IF</span> &nbsp; {rule.ifTag}
                </span>
                <span className="text-slate-500 text-xs">→</span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-emerald-400 font-bold">THEN</span> &nbsp; {rule.thenTag}
                </span>
              </div>

              {/* Bottom row: matched count */}
              <p className="text-[11px] text-slate-500 mt-3 font-medium">
                # {rule.matchedCount} transactions matched
              </p>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <FormModal isOpen={addOpen || editOpen} onClose={() => { setAddOpen(false); setEditOpen(false); }} title={editOpen ? 'Edit Automation Rule' : 'Create Automation Rule'} onSubmit={handleSave} submitLabel={editOpen ? 'Save Rule' : 'Create Rule'}>
        <div className="space-y-4">
          <FormField label="Rule Name" name="name" value={form.name} onChange={fieldChange} required placeholder="e.g. Water Utility Auto-Categorize" />
          <FormField label="IF Condition" name="ifTag" value={form.ifTag} onChange={fieldChange} required placeholder="e.g. Description contains &quot;Zone Water&quot;" />
          <FormField label="THEN Action" name="thenTag" value={form.thenTag} onChange={fieldChange} required placeholder="e.g. Category → Utilities, Property → Auto Detect" />
        </div>
      </FormModal>
    </div>
  );
}

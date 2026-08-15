import { useState } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { properties as initialProperties } from '../../../data/properties';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/tables/SearchBar';
import FormModal from '../../../components/modals/FormModal';
import { FormField, SelectField } from '../../../components/forms/FormFields';
import { formatCurrency } from '../../../utils/formatters';

const emptyForm = {
  name: '', owner: '', location: '', status: 'Active',
  occupancyPercent: '', monthlyRevenue: '', monthlyExpenses: '',
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState(initialProperties);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewTab, setViewTab] = useState('Overview');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = properties.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.owner.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openAdd = () => { setForm(emptyForm); setAddOpen(true); };
  const openEdit = (p) => { setSelected(p); setForm({ ...p }); setEditOpen(true); };
  const openView = (p) => { setSelected(p); setViewTab('Overview'); setViewOpen(true); };

  const handleSave = () => {
    if (editOpen) {
      setProperties(properties.map((p) => (p.id === selected.id ? { ...p, ...form, monthlyRevenue: +form.monthlyRevenue, monthlyExpenses: +form.monthlyExpenses, netProfit: +form.monthlyRevenue - +form.monthlyExpenses } : p)));
      setEditOpen(false);
    } else {
      const newP = { ...form, id: `p${Date.now()}`, icon: '🏠', monthlyRevenue: +form.monthlyRevenue, monthlyExpenses: +form.monthlyExpenses, netProfit: +form.monthlyRevenue - +form.monthlyExpenses };
      setProperties([...properties, newP]);
      setAddOpen(false);
    }
  };

  const fieldChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Properties</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your property portfolio</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors cursor-pointer shadow-[0_4px_14px_rgba(0,155,242,0.3)]">
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar placeholder="Search properties..." value={search} onChange={setSearch} />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none cursor-pointer font-medium"
        >
          <option value="">All Status</option>
          <option>Active</option>
          <option>Maintenance</option>
          <option>Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl overflow-x-auto shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
        <table className="w-full text-sm min-w-[900px]">
          <thead>
            <tr className="border-b border-white/5">
              {['PROPERTY NAME', 'OWNER', 'LOCATION', 'STATUS', 'MONTHLY REVENUE', 'MONTHLY EXPENSES', 'NET PROFIT', 'ACTIONS'].map((col) => (
                <th key={col} className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider py-4 px-4">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-white/5 hover:bg-white/[0.025] transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{p.icon}</span>
                    <span className="font-semibold text-white text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-300 font-medium text-sm">{p.owner}</td>
                <td className="py-4 px-4 text-slate-400 text-sm">📍 {p.location}</td>
                <td className="py-4 px-4"><StatusBadge status={p.status} /></td>
                <td className="py-4 px-4 text-emerald-400 font-bold text-sm">{formatCurrency(p.monthlyRevenue)}</td>
                <td className="py-4 px-4 text-red-400 font-bold text-sm">{formatCurrency(p.monthlyExpenses)}</td>
                <td className="py-4 px-4 text-white font-extrabold text-sm">{formatCurrency(p.netProfit)}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openView(p)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Eye size={16} /></button>
                    <button onClick={() => openEdit(p)} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Pencil size={16} /></button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-sm">No properties found</div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <FormModal
        isOpen={addOpen || editOpen}
        onClose={() => { setAddOpen(false); setEditOpen(false); }}
        title={editOpen ? 'Edit Property' : 'Add New Property'}
        onSubmit={handleSave}
        submitLabel={editOpen ? 'Save Changes' : 'Save Property'}
      >
        <div className="space-y-4">
          <FormField label="Property Name" name="name" value={form.name} onChange={fieldChange} required placeholder="e.g. Sunset Villa" />
          <FormField label="Owner" name="owner" value={form.owner} onChange={fieldChange} required placeholder="Owner name" />
          <FormField label="Location" name="location" value={form.location} onChange={fieldChange} required placeholder="e.g. Miami Beach, FL" />
          <SelectField label="Status" name="status" value={form.status} onChange={fieldChange} options={['Active', 'Maintenance', 'Inactive']} required />
          <FormField label="Occupancy (%)" name="occupancyPercent" type="number" value={form.occupancyPercent} onChange={fieldChange} placeholder="e.g. 85" />
          <FormField label="Monthly Revenue ($)" name="monthlyRevenue" type="number" value={form.monthlyRevenue} onChange={fieldChange} placeholder="e.g. 8500" />
          <FormField label="Monthly Expenses ($)" name="monthlyExpenses" type="number" value={form.monthlyExpenses} onChange={fieldChange} placeholder="e.g. 2100" />
        </div>
      </FormModal>

      {/* View Modal */}
      <FormModal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={selected?.name || 'Property Details'}>
        <div className="space-y-1 mb-4">
          <div className="flex gap-2">
            {['Overview', 'Transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setViewTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${viewTab === tab ? 'bg-[#009bf2]/20 text-[#38bdf8] border border-[#009bf2]/40' : 'text-slate-400 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        {viewTab === 'Overview' && selected && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Owner', selected.owner],
              ['Location', selected.location],
              ['Status', selected.status],
              ['Occupancy', `${selected.occupancyPercent}%`],
              ['Monthly Revenue', formatCurrency(selected.monthlyRevenue)],
              ['Monthly Expenses', formatCurrency(selected.monthlyExpenses)],
              ['Net Profit', formatCurrency(selected.netProfit)],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#0b0f19] border border-white/5 rounded-xl p-3.5">
                <p className="text-xs font-semibold text-slate-400 mb-1">{k}</p>
                <p className="font-bold text-white text-sm">{v}</p>
              </div>
            ))}
          </div>
        )}
        {viewTab === 'Transactions' && (
          <div className="text-sm text-slate-400 text-center py-8">No transactions to display</div>
        )}
      </FormModal>
    </div>
  );
}

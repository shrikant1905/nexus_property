import { useState } from 'react';
import { Plus, Eye, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { owners as initialOwners } from '../../../data/owners';
import SearchBar from '../../../components/tables/SearchBar';
import FormModal from '../../../components/modals/FormModal';
import { FormField, ToggleField } from '../../../components/forms/FormFields';
import { formatCurrency } from '../../../utils/formatters';

const emptyForm = { name: '', email: '', properties: '', totalRevenue: '', outstandingBalance: '', portalAccess: false };

export default function OwnersPage() {
  const [owners, setOwners] = useState(initialOwners);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = owners.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(emptyForm); setAddOpen(true); };
  const openEdit = (o) => { setSelected(o); setForm({ ...o }); setEditOpen(true); };
  const openView = (o) => { setSelected(o); setViewOpen(true); };
  const fieldChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (editOpen) {
      setOwners(owners.map((o) => (o.id === selected.id ? { ...o, ...form } : o)));
      setEditOpen(false);
    } else {
      setOwners([...owners, { ...form, id: `o${Date.now()}`, initials: form.name.split(' ').map(n => n[0]).join('').toUpperCase() }]);
      setAddOpen(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Owners</h1>
          <p className="text-sm text-slate-400 mt-0.5">Property owner management and portal access</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
          <Plus size={15} /> Add Owner
        </button>
      </div>

      <div className="mb-5">
        <SearchBar placeholder="Search owners..." value={search} onChange={setSearch} />
      </div>

      <div className="bg-gradient-to-br from-[#1a2535] to-[#131e2e] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5">
              {['OWNER NAME', 'EMAIL', 'PROPERTIES', 'TOTAL REVENUE', 'OUTSTANDING', 'PORTAL ACCESS', 'ACTIONS'].map((col) => (
                <th key={col} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{o.initials}</div>
                    <span className="font-medium text-white">{o.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-400">{o.email}</td>
                <td className="py-4 px-4 text-slate-300">{o.properties}</td>
                <td className="py-4 px-4 text-emerald-400 font-medium">{formatCurrency(o.totalRevenue)}</td>
                <td className="py-4 px-4 text-amber-400 font-medium">{formatCurrency(o.outstandingBalance)}</td>
                <td className="py-4 px-4">
                  {o.portalAccess
                    ? <span className="flex items-center gap-1 text-emerald-400 text-xs"><CheckCircle size={13} /> Enabled</span>
                    : <span className="flex items-center gap-1 text-slate-500 text-xs"><XCircle size={13} /> Disabled</span>}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openView(o)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Eye size={14} /></button>
                    <button onClick={() => openEdit(o)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Pencil size={14} /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-slate-500 text-sm">No owners found</div>}
      </div>

      <FormModal isOpen={addOpen || editOpen} onClose={() => { setAddOpen(false); setEditOpen(false); }} title={editOpen ? 'Edit Owner' : 'Add New Owner'} onSubmit={handleSave} submitLabel={editOpen ? 'Save Changes' : 'Save Owner'}>
        <div className="space-y-4">
          <FormField label="Owner Name" name="name" value={form.name} onChange={fieldChange} required placeholder="Full name" />
          <FormField label="Email Address" name="email" type="email" value={form.email} onChange={fieldChange} required placeholder="email@example.com" />
          <FormField label="Properties Owned" name="properties" type="number" value={form.properties} onChange={fieldChange} placeholder="0" />
          <FormField label="Total Revenue ($)" name="totalRevenue" type="number" value={form.totalRevenue} onChange={fieldChange} placeholder="0" />
          <FormField label="Outstanding Balance ($)" name="outstandingBalance" type="number" value={form.outstandingBalance} onChange={fieldChange} placeholder="0" />
          <ToggleField label="Portal Access" description="Allow owner to log into the owner portal" checked={!!form.portalAccess} onChange={(v) => setForm({ ...form, portalAccess: v })} />
        </div>
      </FormModal>

      <FormModal isOpen={viewOpen} onClose={() => setViewOpen(false)} title={selected?.name || 'Owner Details'}>
        {selected && (
          <div className="space-y-3 text-sm">
            {[['Name', selected.name], ['Email', selected.email], ['Properties', selected.properties], ['Total Revenue', formatCurrency(selected.totalRevenue)], ['Outstanding Balance', formatCurrency(selected.outstandingBalance)], ['Portal Access', selected.portalAccess ? 'Enabled' : 'Disabled']].map(([k, v]) => (
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

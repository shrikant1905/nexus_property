import { useState } from 'react';
import { Plus, Pencil, Key, Trash2 } from 'lucide-react';
import { users as initUsers, roleSummaries } from '../../../data/users';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/tables/SearchBar';
import FormModal from '../../../components/modals/FormModal';
import { FormField, SelectField } from '../../../components/forms/FormFields';

const roleCardBorder = {
  'Super Admin': 'border-red-500/30',
  'Finance Manager': 'border-cyan-500/30',
  'Operations Staff': 'border-amber-500/30',
  'Property Owner': 'border-blue-500/30',
};
const roleTitleColor = {
  'Super Admin': 'text-red-400',
  'Finance Manager': 'text-cyan-400',
  'Operations Staff': 'text-amber-400',
  'Property Owner': 'text-blue-400',
};

const emptyForm = { name: '', email: '', role: 'Finance Manager', status: 'Active' };

export default function UsersPage() {
  const [users] = useState(initUsers);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, role: u.role, status: u.status }); setEditOpen(true); };
  const fieldChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Users & Permissions</h1>
          <p className="text-sm text-slate-400 mt-0.5">Role-based access control and user management</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
          <Plus size={15} /> Add User
        </button>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
        {roleSummaries.map((r) => (
          <div key={r.role} className={`border rounded-xl p-5 bg-gradient-to-br from-[#1a2535] to-[#131e2e] ${roleCardBorder[r.role]}`}>
            <h3 className={`text-sm font-bold mb-3 ${roleTitleColor[r.role]}`}>{r.role}</h3>
            <ul className="space-y-1 mb-3">
              {r.permissions.map((p) => (
                <li key={p} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-1 h-1 rounded-full bg-slate-500 flex-shrink-0" />
                  {p}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500">{r.userCount} users</p>
          </div>
        ))}
      </div>

      {/* All Users */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-white">All Users</h2>
        <SearchBar placeholder="Search users..." value={search} onChange={setSearch} />
      </div>

      <div className="bg-gradient-to-br from-[#1a2535] to-[#131e2e] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5">
              {['USER', 'EMAIL', 'ROLE', 'STATUS', 'LAST LOGIN', 'ACTIONS'].map((col) => (
                <th key={col} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{u.initials}</div>
                    <span className="font-medium text-white">{u.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-400">{u.email}</td>
                <td className="py-4 px-4"><StatusBadge status={u.role} /></td>
                <td className="py-4 px-4"><StatusBadge status={u.status} /></td>
                <td className="py-4 px-4 text-slate-400 text-xs">{u.lastLogin}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(u)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Pencil size={14} /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-amber-400 hover:bg-amber-500/5 transition-colors"><Key size={14} /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal isOpen={addOpen || editOpen} onClose={() => { setAddOpen(false); setEditOpen(false); }} title={editOpen ? 'Edit User' : 'Add New User'} onSubmit={() => { setAddOpen(false); setEditOpen(false); }} submitLabel={editOpen ? 'Save Changes' : 'Add User'}>
        <div className="space-y-4">
          <FormField label="Full Name" name="name" value={form.name} onChange={fieldChange} required placeholder="Full name" />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={fieldChange} required placeholder="email@example.com" />
          <SelectField label="Role" name="role" value={form.role} onChange={fieldChange} options={['Super Admin', 'Finance Manager', 'Operations Staff', 'Property Owner']} required />
          <SelectField label="Status" name="status" value={form.status} onChange={fieldChange} options={['Active', 'Inactive']} required />
        </div>
      </FormModal>
    </div>
  );
}

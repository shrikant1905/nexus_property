import { useState } from 'react';
import { Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { reservations as initData, reservationStats } from '../../../data/reservations';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchBar from '../../../components/tables/SearchBar';
import FormModal from '../../../components/modals/FormModal';
import { FormField, SelectField } from '../../../components/forms/FormFields';
import { formatCurrency } from '../../../utils/formatters';

const emptyForm = { guestName: '', propertyName: '', checkIn: '', checkOut: '', nights: '', amount: '', platform: 'Airbnb', status: 'Confirmed' };

const platformColors = { Airbnb: 'bg-pink-500/15 text-pink-400 border border-pink-500/25', VRBO: 'bg-blue-500/15 text-blue-400 border border-blue-500/25', Direct: 'bg-slate-500/15 text-slate-400 border border-slate-500/25' };

export default function ReservationsPage() {
  const [data, setData] = useState(initData);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = data.filter((r) =>
    r.guestName.toLowerCase().includes(search.toLowerCase()) ||
    r.propertyName.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (r) => { setSelected(r); setForm({ ...r }); setEditOpen(true); };
  const fieldChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = () => {
    if (editOpen) {
      setData(data.map((r) => (r.id === selected.id ? { ...r, ...form } : r)));
      setEditOpen(false);
    } else {
      setData([...data, { ...form, id: `r${Date.now()}` }]);
      setAddOpen(false);
    }
  };

  const stats = [
    { label: 'Total Reservations', value: String(reservationStats.totalReservations), sub: reservationStats.totalReservationsSub, trend: 'down', icon: 'building' },
    { label: 'Active Guests', value: String(reservationStats.activeGuests), sub: reservationStats.activeGuestsSub, trend: 'down', icon: 'users' },
    { label: 'Booking Revenue', value: formatCurrency(reservationStats.bookingRevenue), sub: reservationStats.bookingRevenueSub, trend: 'down', icon: 'dollar' },
    { label: 'Avg Stay Length', value: `${reservationStats.avgStayLength} nights`, sub: reservationStats.avgStayLengthSub, trend: 'up', icon: 'building', variant: 'blue' },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reservations / Airbnb Income</h1>
          <p className="text-sm text-slate-400 mt-0.5">Track bookings and rental income across platforms</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 border border-white/10 hover:border-white/20 hover:text-white transition-colors">
            <RefreshCw size={14} /> Sync Airbnb
          </button>
          <button onClick={() => { setForm(emptyForm); setAddOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
            <Plus size={15} /> Add Reservation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <div className="mb-5">
        <SearchBar placeholder="Search reservations..." value={search} onChange={setSearch} />
      </div>

      <div className="bg-gradient-to-br from-[#1a2535] to-[#131e2e] border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5">
              {['GUEST', 'PROPERTY', 'CHECK IN', 'CHECK OUT', 'NIGHTS', 'AMOUNT', 'PLATFORM', 'STATUS', 'ACTIONS'].map((col) => (
                <th key={col} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider py-3 px-4">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 px-4 font-medium text-white">{r.guestName}</td>
                <td className="py-4 px-4 text-slate-300">{r.propertyName}</td>
                <td className="py-4 px-4 text-slate-400">{r.checkIn}</td>
                <td className="py-4 px-4 text-slate-400">{r.checkOut}</td>
                <td className="py-4 px-4 text-slate-300">{r.nights}</td>
                <td className="py-4 px-4 text-emerald-400 font-medium">{formatCurrency(r.amount)}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${platformColors[r.platform] || ''}`}>{r.platform}</span>
                </td>
                <td className="py-4 px-4"><StatusBadge status={r.status} /></td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(r)} className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Pencil size={14} /></button>
                    <button className="w-7 h-7 flex items-center justify-center rounded text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-slate-500 text-sm">No reservations found</div>}
      </div>

      <FormModal isOpen={addOpen || editOpen} onClose={() => { setAddOpen(false); setEditOpen(false); }} title={editOpen ? 'Edit Reservation' : 'Add New Reservation'} onSubmit={handleSave} submitLabel={editOpen ? 'Save Changes' : 'Save Reservation'}>
        <div className="space-y-4">
          <FormField label="Guest Name" name="guestName" value={form.guestName} onChange={fieldChange} required placeholder="Full name" />
          <FormField label="Property" name="propertyName" value={form.propertyName} onChange={fieldChange} required placeholder="Property name" />
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Check In" name="checkIn" type="date" value={form.checkIn} onChange={fieldChange} required />
            <FormField label="Check Out" name="checkOut" type="date" value={form.checkOut} onChange={fieldChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Nights" name="nights" type="number" value={form.nights} onChange={fieldChange} placeholder="0" />
            <FormField label="Amount ($)" name="amount" type="number" value={form.amount} onChange={fieldChange} placeholder="0" />
          </div>
          <SelectField label="Platform" name="platform" value={form.platform} onChange={fieldChange} options={['Airbnb', 'VRBO', 'Direct']} required />
          <SelectField label="Status" name="status" value={form.status} onChange={fieldChange} options={['Active', 'Confirmed', 'Completed', 'Cancelled']} required />
        </div>
      </FormModal>
    </div>
  );
}

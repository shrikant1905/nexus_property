import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Clock, AlertCircle, Plus, Edit2, Trash2, Phone, Mail, Loader2 } from 'lucide-react';
import { staffService } from '../../services/staffService';
import { useAuth } from '../../hooks/useAuth';
import FormModal from '../../components/modals/FormModal';
import { FormField } from '../../components/forms/FormFields';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MaintenanceStaffPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'OFFICE_ADMIN' || user?.roleKey === 'office-admin';

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    startTime: '08:00',
    endTime: '17:00',
    color: '#009bf2',
  });

  const loadStaff = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await staffService.getStaff();
      const list = Array.isArray(res) ? res : res?.data || [];
      setStaffList(list);
    } catch (err) {
      setError(err.message || 'Failed to load staff profiles from server');
      setStaffList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const openAddModal = () => {
    setEditingStaff(null);
    setForm({
      name: '',
      email: '',
      role: 'Maintenance Technician',
      phone: '',
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      startTime: '08:00',
      endTime: '17:00',
      color: '#009bf2',
    });
    setModalOpen(true);
  };

  const openEditModal = (staff) => {
    setEditingStaff(staff);
    setForm({
      name: staff.name || '',
      email: staff.email || '',
      role: staff.role || 'Maintenance Specialist',
      phone: staff.phone || '',
      workingDays: staff.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      startTime: staff.workingHours?.start || '08:00',
      endTime: staff.workingHours?.end || '17:00',
      color: staff.color || '#009bf2',
    });
    setModalOpen(true);
  };

  const toggleDay = (day) => {
    if (form.workingDays.includes(day)) {
      setForm({ ...form, workingDays: form.workingDays.filter((d) => d !== day) });
    } else {
      setForm({ ...form, workingDays: [...form.workingDays, day] });
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) {
      alert('Staff Full Name is mandatory.');
      return;
    }
    if (!form.phone.trim()) {
      alert('Phone Number is mandatory.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('full_name', form.name.trim());
      formData.append('email', form.email.trim());
      formData.append('phone', form.phone.trim());
      formData.append('role_title', form.role.trim() || 'Maintenance Technician');
      formData.append('color', form.color);
      formData.append('workingDays', JSON.stringify(form.workingDays));
      formData.append('startTime', form.startTime);
      formData.append('endTime', form.endTime);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      if (editingStaff) {
        await staffService.updateStaff(editingStaff.id, formData);
      } else {
        await staffService.addStaff(formData);
      }
      await loadStaff();
      setModalOpen(false);
      setAvatarFile(null);
    } catch (err) {
      alert(err.message || 'Failed to save staff member.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (staffId) => {
    if (window.confirm('Are you sure you want to delete this staff member? This will also delete their login account.')) {
      try {
        await staffService.deleteStaff(staffId);
        await loadStaff();
      } catch (err) {
        alert(err.message || 'Failed to delete staff member.');
      }
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#00204a] tracking-tight">Staff Management</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Configure {staffList.length} maintenance technicians, shift hours, and working schedules</p>
        </div>

        {isAdmin && (
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer"
          >
            <Plus size={16} /> Add Staff Member
          </motion.button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#00204a]" />
          <span>Loading staff directory from MySQL backend...</span>
        </div>
      ) : staffList.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
          No staff members found in directory.
        </div>
      ) : (
        /* Staff Cards Grid */
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {staffList.map((staff) => (
            <motion.div
              key={staff.id}
              variants={staggerItem}
              whileHover={{ scale: 1.02, y: -3, boxShadow: '0 12px 24px rgba(0,32,74,0.08)' }}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden transition-all duration-200 shadow-sm"
            >
              {/* Top Bar Color Accent */}
              <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: staff.color || '#009bf2' }} />

              <div>
                {/* Header Info */}
                <div className="flex items-start justify-between gap-3 mb-3 pt-1">
                  <div className="flex items-center gap-3">
                    {staff.avatarUrl ? (
                      <img
                        src={staff.avatarUrl.startsWith('/uploads') ? `http://localhost:5000${staff.avatarUrl}` : staff.avatarUrl}
                        alt={staff.name}
                        className="w-12 h-12 rounded-2xl object-cover shadow-xs flex-shrink-0 border border-slate-200"
                      />
                    ) : (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs flex-shrink-0"
                        style={{ backgroundColor: `${staff.color || '#009bf2'}25`, border: `1px solid ${staff.color || '#009bf2'}40`, color: staff.color || '#009bf2' }}
                      >
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-slate-900 leading-tight">{staff.name}</h3>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 font-bold">{staff.role}</p>
                      <span className="inline-block text-[10px] font-mono text-slate-400 mt-0.5">
                        {staff.staffCode}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(staff)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Staff Member"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(staff.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Staff Member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Working Hours & Contact */}
                <div className="space-y-2.5 py-3 border-y border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400" /> Shift Hours:
                    </span>
                    <span className="text-slate-900 font-black">{staff.workingHours?.start || '08:00'} - {staff.workingHours?.end || '17:00'}</span>
                  </div>

                  {staff.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                        <Phone size={14} className="text-emerald-600" /> Phone:
                      </span>
                      <span className="text-emerald-700 font-bold">{staff.phone}</span>
                    </div>
                  )}

                  {staff.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                        <Mail size={14} className="text-sky-600" /> Email:
                      </span>
                      <span className="text-slate-700 font-medium truncate max-w-[140px]">{staff.email}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 font-semibold">Duty Status:</span>
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      🟢 Available / On Duty
                    </span>
                  </div>
                </div>

                {/* Working Days Badges */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-slate-500 mb-2">Working Days:</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ALL_DAYS.map((day) => {
                      const isWorking = staff.workingDays?.includes(day);
                      return (
                        <span
                          key={day}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                            isWorking
                              ? 'bg-sky-50 text-sky-800 border-sky-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}
                        >
                          {day}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Add / Edit Staff Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingStaff ? `Edit ${editingStaff.name}` : 'Add New Staff Member'}
        onSubmit={handleSubmit}
        submitLabel={saving ? 'Saving...' : editingStaff ? 'Update Staff' : 'Save Staff Member'}
      >
        <div className="space-y-4 text-xs">
          <FormField
            label="Staff Full Name *"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. John Smith"
          />

          {!editingStaff && (
            <FormField
              label="Email Address (Login Username)"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="technician@nexusfms.com"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Role / Skill Title *"
              name="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="e.g. HVAC Specialist"
            />
            <FormField
              label="Phone Number *"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Profile Picture (File Upload)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setAvatarFile(e.target.files[0])}
              className="w-full text-xs border border-slate-200 rounded-xl p-2 bg-slate-50 font-bold focus:outline-none focus:border-[#00204a]"
            />
          </div>

          {/* Working Days Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Working Days *</label>
            <div className="flex items-center gap-2 flex-wrap">
              {ALL_DAYS.map((day) => {
                const active = form.workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#00204a] text-white border-[#00204a]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shift Hours */}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Shift Start Time"
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
            <FormField
              label="Shift End Time"
              type="time"
              name="endTime"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>
      </FormModal>
    </div>
  );
}


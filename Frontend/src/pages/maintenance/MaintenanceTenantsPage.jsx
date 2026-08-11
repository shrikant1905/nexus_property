import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Edit2, Trash2, Eye, Phone, Mail, MapPin, Loader2, AlertCircle, ExternalLink, User } from 'lucide-react';
import { tenantService } from '../../services/tenantService';
import FormModal from '../../components/modals/FormModal';
import { FormField } from '../../components/forms/FormFields';
import { slideInBottom } from '../../utils/motionVariants';

const emptyTenantForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

function normalizeTenant(t) {
  return {
    id: t.id,
    name: t.full_name || t.name || '',
    full_name: t.full_name || t.name || '',
    phone: t.phone || '',
    email: t.email || '',
    address: t.address || '',
    notes: t.notes || '',
    documentUrl: t.document_url || '',
    createdAt: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A',
  };
}

export default function MaintenanceTenantsPage() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [viewingTenant, setViewingTenant] = useState(null);
  const [deletingTenantId, setDeletingTenantId] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [form, setForm] = useState(emptyTenantForm);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await tenantService.getTenants();
      const list = Array.isArray(res) ? res : res?.data || [];
      setTenants(list.map(normalizeTenant));
    } catch (err) {
      setError(err.message || 'Failed to load residents from server');
      setTenants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const openAddModal = () => {
    setEditingTenant(null);
    setForm({
      ...emptyTenantForm,
      documentUrl: '',
    });
    setDocumentFile(null);
    setModalOpen(true);
  };

  const openEditModal = (tenant) => {
    setEditingTenant(tenant);
    setForm({
      name: tenant.name || tenant.full_name || '',
      phone: tenant.phone || '',
      email: tenant.email || '',
      address: tenant.address || '',
      notes: tenant.notes || '',
      documentUrl: tenant.documentUrl || '',
    });
    setDocumentFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!form.name.trim()) {
      alert('Full Name is mandatory.');
      return;
    }
    if (!form.phone.trim()) {
      alert('Phone Number is mandatory.');
      return;
    }
    if (!form.address.trim()) {
      alert('Full Property Address is mandatory.');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('full_name', form.name.trim());
      formData.append('phone', form.phone.trim());
      formData.append('email', form.email.trim());
      formData.append('address', form.address.trim());
      formData.append('notes', form.notes.trim());
      if (documentFile) {
        formData.append('document', documentFile);
      }

      if (editingTenant) {
        await tenantService.updateTenant(editingTenant.id, formData);
      } else {
        await tenantService.addTenant(formData);
      }
      await loadTenants();
      setModalOpen(false);
      setDocumentFile(null);
    } catch (err) {
      alert(err.message || 'Failed to save resident.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeletingTenantId(id);
  };

  const confirmDelete = async () => {
    if (!deletingTenantId) return;
    try {
      await tenantService.deleteTenant(deletingTenantId);
      await loadTenants();
      setDeletingTenantId(null);
    } catch (err) {
      alert(err.message || 'Failed to delete resident.');
    }
  };

  const filteredTenants = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search)
  );

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#00204a] tracking-tight">Tenants & Residents Directory</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage resident contacts and property maintenance notes</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tenants or address..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] shadow-xs"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer flex-shrink-0"
          >
            <UserPlus size={18} /> Add Resident
          </motion.button>
        </div>
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
          <span>Loading residents directory from MySQL backend...</span>
        </div>
      ) : (
        <>
          {/* ========= MOBILE TENANT CARDS (visible below md) ========= */}
          <div className="md:hidden space-y-3">
            {filteredTenants.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No residents found matching search.
              </div>
            ) : (
              filteredTenants.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 overflow-hidden flex items-center justify-center font-black flex-shrink-0 text-sky-700">
                        {t.documentUrl ? (
                          <img
                            src={t.documentUrl.startsWith('/uploads') ? `http://localhost:5000${t.documentUrl}` : t.documentUrl}
                            alt={t.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <span
                          className="w-full h-full flex items-center justify-center font-black text-sky-700"
                          style={{ display: t.documentUrl ? 'none' : 'flex' }}
                        >
                          {(t.full_name || t.name || '?').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">{t.name}</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Added {t.createdAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewingTenant(t)}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                        title="View Resident"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-2 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer border border-sky-200"
                        title="Edit Resident"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(t.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-slate-200"
                        title="Delete Resident"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-slate-700">
                      <MapPin size={14} className="text-slate-400 flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-slate-800">{t.address}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl text-slate-700 border border-slate-200">
                        <Phone size={13} className="text-emerald-600 flex-shrink-0" />
                        <span className="font-bold text-emerald-800">{t.phone}</span>
                      </div>
                      {t.email && (
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl text-slate-700 border border-slate-200 truncate">
                          <Mail size={13} className="text-sky-600 flex-shrink-0" />
                          <span className="truncate">{t.email}</span>
                        </div>
                      )}
                    </div>

                    {t.notes && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 italic">
                        {t.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ========= DESKTOP TENANTS TABLE (hidden below md) ========= */}
          <motion.div
            variants={slideInBottom}
            initial="hidden"
            animate="visible"
            className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#00204a] text-white font-extrabold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Resident Name</th>
                    <th className="px-6 py-3.5">Address / Unit</th>
                    <th className="px-6 py-3.5">Contact Details</th>
                    <th className="px-6 py-3.5">Notes</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {filteredTenants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                        No residents found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredTenants.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 overflow-hidden flex items-center justify-center font-black text-sky-800">
                            {t.documentUrl ? (
                              <img
                                src={t.documentUrl.startsWith('/uploads') ? `http://localhost:5000${t.documentUrl}` : t.documentUrl}
                                alt={t.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <span
                              className="w-full h-full flex items-center justify-center font-black text-sky-800"
                              style={{ display: t.documentUrl ? 'none' : 'flex' }}
                            >
                              {(t.full_name || t.name || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{t.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">Added {t.createdAt}</p>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                            <span>{t.address}</span>
                          </div>
                        </td>

                        <td className="px-6 py-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-800">
                            <Phone size={13} className="text-slate-400" />
                            <span>{t.phone}</span>
                          </div>
                          {t.email ? (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Mail size={13} className="text-slate-400" />
                              <span>{t.email}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">No email</span>
                          )}
                        </td>

                        <td className="px-6 py-4 max-w-xs truncate text-slate-600">
                          {t.notes || <span className="text-slate-400 italic">No notes</span>}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setViewingTenant(t)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="View Resident"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => openEditModal(t)}
                              className="p-1.5 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                              title="Edit Resident"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Resident"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Add / Edit Tenant Modal */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTenant ? 'Edit Resident Information' : 'Add New Resident / Tenant'}
        onSubmit={handleSubmit}
        submitLabel={saving ? 'Saving...' : editingTenant ? 'Update Resident' : 'Save Resident'}
      >
        <div className="space-y-4">
          {/* Avatar / Profile Picture Uploader */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('resident-avatar-input').click()}>
              <div className="w-20 h-20 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center relative shadow-sm group-hover:border-[#00204a] transition-all">
                {documentFile ? (
                  <img
                    src={URL.createObjectURL(documentFile)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : form.documentUrl ? (
                  <img
                    src={form.documentUrl.startsWith('/uploads') ? `http://localhost:5000${form.documentUrl}` : form.documentUrl}
                    alt="Resident Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="text-slate-400 w-8 h-8" />
                )}
                
                {/* Overlay camera icon on hover */}
                <div className="absolute inset-0 bg-[#00204a]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <span className="text-white text-[10px] font-bold">Upload</span>
                </div>
              </div>
            </div>
            <input
              id="resident-avatar-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setDocumentFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <p className="text-[11px] text-slate-500 font-bold mt-1.5">Click to upload photo</p>
          </div>

          <FormField
            label="Full Name *"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. John Doe"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Phone Number *"
              name="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />
            <FormField
              label="Email Address (Optional)"
              name="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="resident@example.com"
            />
          </div>

          <FormField
            label="Property Address & Unit *"
            name="address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Preferred contact hours, pet notes, gate codes..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white"
            />
          </div>
        </div>
      </FormModal>

      {/* View Tenant Details Modal */}
      <FormModal
        isOpen={!!viewingTenant}
        onClose={() => setViewingTenant(null)}
        title={viewingTenant?.name || 'Resident Details'}
      >
        {viewingTenant && (
          <div className="space-y-4 text-xs">
            {/* Profile Avatar */}
            <div className="flex justify-center pb-1">
              <div className="w-16 h-16 rounded-full border-2 border-slate-200 overflow-hidden bg-sky-50 flex items-center justify-center shadow-sm">
                {viewingTenant.documentUrl ? (
                  <img
                    src={viewingTenant.documentUrl.startsWith('/uploads') ? `http://localhost:5000${viewingTenant.documentUrl}` : viewingTenant.documentUrl}
                    alt={viewingTenant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <span
                  className="text-2xl font-black text-sky-700"
                  style={{ display: viewingTenant.documentUrl ? 'none' : 'flex' }}
                >
                  {(viewingTenant.name || '?').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Resident Name:</span>
                <span className="text-slate-900 font-bold text-sm">{viewingTenant.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Phone:</span>
                <span className="text-sky-700 font-bold">{viewingTenant.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="text-slate-800">{viewingTenant.email || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Address:</span>
                <span className="text-slate-800 font-medium">{viewingTenant.address}</span>
              </div>
              {viewingTenant.documentUrl && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Agreement/ID Document:</span>
                  <a
                    href={viewingTenant.documentUrl.startsWith('/uploads') ? `http://localhost:5000${viewingTenant.documentUrl}` : viewingTenant.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-950 font-bold flex items-center gap-1 underline"
                  >
                    View Document <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <div>
              <p className="text-slate-500 font-medium mb-1">Notes & Access Info:</p>
              <p className="p-3 rounded-xl bg-slate-50 text-slate-800 leading-relaxed border border-slate-200">
                {viewingTenant.notes || 'No special notes recorded.'}
              </p>
            </div>
          </div>
        )}
      </FormModal>
      {/* Delete Confirmation Modal */}
      <FormModal
        isOpen={!!deletingTenantId}
        onClose={() => setDeletingTenantId(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl">
            <AlertCircle size={24} className="shrink-0 text-red-600" />
            <p className="text-sm font-medium">Are you sure you want to delete this resident contact? This action cannot be undone.</p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => setDeletingTenantId(null)}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-md"
            >
              Yes, Delete Resident
            </button>
          </div>
        </div>
      </FormModal>
    </div>
  );
}


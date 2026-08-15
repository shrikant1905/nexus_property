import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench, User, MapPin, Phone, Calendar, Clock, CheckCircle2,
  AlertCircle, Sparkles, ExternalLink, Play, Check, ChevronRight,
  Image as ImageIcon, RefreshCw, FileText, Bell, X, ShieldCheck, Eye, Loader2, Upload
} from 'lucide-react';
import { staffPortalService } from '../../services/staffPortalService';
import { useAuth } from '../../hooks/useAuth';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';

export default function MaintenanceStaffPortalPage() {
  const { user } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeJobId, setActiveJobId] = useState(null);
  const [inspectJob, setInspectJob] = useState(null);
  const [completeJobTarget, setCompleteJobTarget] = useState(null);
  const [reportText, setReportText] = useState('');
  const [beforePhotos, setBeforePhotos] = useState([]);
  const [afterPhotos, setAfterPhotos] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [actualHours, setActualHours] = useState('1.5');
  const [dutyStatus, setDutyStatus] = useState('AVAILABLE');

  // Cancellation State
  const [cancelJobTarget, setCancelJobTarget] = useState(null);
  const [cancelType, setCancelType] = useState('TENANT_CANCELLED');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [cancelProof, setCancelProof] = useState(null);

  const loadStaffPortalData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await staffPortalService.getMyJobs();
      const list = Array.isArray(res) ? res : res?.data || [];
      setJobs(list);
    } catch (err) {
      setError(err.message || 'Failed to load assigned work orders.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaffPortalData();
  }, [loadStaffPortalData]);

  const openCompleteModal = (job) => {
    setCompleteJobTarget(job);
    setReportText(job.workReport || '');
    setBeforePhotos([]);
    setAfterPhotos([]);
    setReceipts([]);
    setMaterials([]);
  };
  const openCompleteModal = (job) => {
    setInspectJob(job);
    setReportText(job.workReport || '');
    setActualHours(String(job.actualHours || job.durationHours || 1.5));
  };

  const handlePhotoUpload = async (jobId, event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('photos', files[i]);
    }

    setUploading(true);
    try {
      const uploadRes = await staffPortalService.uploadProofPhotos(jobId, formData);
      alert(`✓ ${uploadRes.count || 1} Proof photo(s) uploaded successfully to server!`);
      await loadStaffPortalData();
      if (inspectJob && inspectJob.id === jobId) {
        const updatedRes = await staffPortalService.getMyJobById(jobId);
        if (updatedRes?.data) setInspectJob(updatedRes.data);
      }
    } catch (err) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const openCancelModal = (job) => {
    setCancelJobTarget(job);
    setCancelType('TENANT_CANCELLED');
    setCancelReason('');
    setCancelNotes('');
    setCancelProof(null);
  };

  const handleCancelJob = async () => {
    if (!cancelReason.trim()) {
      alert('Cancellation reason is required.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('cancellationType', cancelType);
      formData.append('reason', cancelReason.trim());
      if (cancelNotes) formData.append('notes', cancelNotes.trim());
      if (cancelProof) formData.append('proof', cancelProof);

      await staffPortalService.cancelJob(cancelJobTarget.id, formData);
      alert('✓ Job cancelled/rescheduled successfully.');
      setCancelJobTarget(null);
      await loadStaffPortalData();
    } catch (err) {
      alert(`⚠️ Cancellation Failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  
  const handleCompleteJob = async (e) => {
    e.preventDefault();
    if (!reportText.trim()) {
      alert('Please enter technician work completion notes before completing.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('completion_report', reportText.trim());
      formData.append('materials', JSON.stringify(materials));
      
      for (let i = 0; i < beforePhotos.length; i++) {
        formData.append('beforePhotos', beforePhotos[i]);
      }
      for (let i = 0; i < afterPhotos.length; i++) {
        formData.append('afterPhotos', afterPhotos[i]);
      }
      for (let i = 0; i < receipts.length; i++) {
        formData.append('receipts', receipts[i]);
      }

      await staffPortalService.completeJobAtomic(completeJobTarget.id, formData);
      alert('✓ Work Order completed successfully!');
      setCompleteJobTarget(null);
      await loadStaffPortalData();
    } catch (err) {
      alert(`⚠️ Completion Failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSubmitting(false);
    }
  };


  const activeWorkOrders = jobs.filter(
    (j) => j.section === 'Jobs' || j.section === 'Quotes' || j.section === 'Jobs Waiting Booking'
  );

  const completedJobs = jobs.filter(
    (j) => j.section === 'Completed Jobs' || j.section === 'Completed Quotes'
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* Technician Header & Duty Status Control */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#00204a] text-white flex items-center justify-center font-black text-lg shadow-md flex-shrink-0">
            {user?.name?.charAt(0) || 'T'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-black text-[#00204a] tracking-tight">{user?.name || 'Technician'}</h1>

              {dutyStatus === 'AVAILABLE' && (
                <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Available / On Duty
                </span>
              )}
              {dutyStatus === 'BUSY' && (
                <span className="text-[11px] font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Busy on Repair
                </span>
              )}
              {dutyStatus === 'BREAK' && (
                <span className="text-[11px] font-extrabold text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded-full border border-sky-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Shift Break
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">Technician Task Portal • {user?.email}</p>
          </div>
        </div>

        {/* Duty Status Dropdown */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1.5">Duty Status:</span>
          <select
            value={dutyStatus}
            onChange={(e) => setDutyStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold focus:outline-none cursor-pointer border bg-white text-slate-800"
          >
            <option value="AVAILABLE">🟢 Available / Ready for Jobs</option>
            <option value="BUSY">🟡 Busy on Maintenance Repair</option>
            <option value="BREAK">☕ On Lunch / Shift Break</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Assigned Jobs</p>
            <p className="text-2xl font-black text-[#00204a] mt-1">{activeWorkOrders.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#00204a] border border-sky-200 flex items-center justify-center font-bold">
            <Wrench size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed Repairs</p>
            <p className="text-2xl font-black text-emerald-800 mt-1">{completedJobs.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Shift Hours</p>
            <p className="text-sm font-black text-purple-900 mt-1">08:00 - 17:00</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center font-bold">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#00204a]" />
          <span>Loading your assigned work orders from MySQL backend...</span>
        </div>
      ) : (
        /* Work Orders Table */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#00204a] flex items-center gap-2">
              <Wrench size={18} className="text-emerald-600" /> My Assigned Work Orders ({activeWorkOrders.length})
            </h2>
            <span className="text-xs text-slate-500 font-medium">Select a job to view details, upload photos, and complete</span>
          </div>

          {activeWorkOrders.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2">
              <CheckCircle2 size={36} className="mx-auto text-emerald-600" />
              <h3 className="text-base font-black text-[#00204a]">No Active Assigned Jobs</h3>
              <p className="text-xs text-slate-500 font-medium">Work orders assigned specifically to you will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4">Job Title & Resident</th>
                    <th className="py-3 px-4">Address / Unit</th>
                    <th className="py-3 px-4">Scheduled Slot</th>
                    <th className="py-3 px-4">Stage Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {activeWorkOrders.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                        <p className="text-[11px] text-slate-500">Resident: {job.tenantName}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span>{job.address}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{job.scheduledDate || 'Not Booked Yet'}</p>
                        <p className="text-[10px] text-slate-500">{job.scheduledTimeSlot || `${job.durationHours || 1.5}h required`}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px] block w-max mb-1">
                          {job.section}
                        </span>
                        {job.priority === 'URGENT' && (
                          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-bold border border-red-200 text-[10px] block w-max">🚨 URGENT</span>
                        )}
                        {job.priority === 'HIGH' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200 text-[10px] block w-max">🔥 HIGH</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openCompleteModal(job)}
                            className="px-3 py-1.5 rounded-xl font-bold text-white text-xs bg-[#00204a] hover:bg-[#001738] transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye size={14} /> View & Complete
                          </button>
                          <button
                            type="button"
                            onClick={() => openCancelModal(job)}
                            className="px-3 py-1.5 rounded-xl font-bold text-red-700 text-xs bg-red-50 hover:bg-red-100 border border-red-200 transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <AlertCircle size={14} /> Reschedule / Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* COMPLETED JOBS TABLE */}
      {!loading && completedJobs.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-[#00204a] flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-600" /> My Completed Jobs ({completedJobs.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100/50 rounded-tl-xl">Job</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100/50">Address</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100/50">Date</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100/50">Status</th>
                  <th className="py-3 px-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider bg-slate-100/50 rounded-tr-xl text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-100/50 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                      <p className="text-[11px] text-slate-500">#{job.id}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 text-xs">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{job.address}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-800">
                      {job.scheduledDate || 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[10px] block w-max">
                        {job.section}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {/* No financial details button, just basic view if needed later */}
                      <span className="text-[10px] text-slate-400 font-bold">Closed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Task Inspection, Proof Photo Upload & Work Sign-off */}
      {completeJobTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 text-slate-800"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {completeJobTarget.section}
                </span>
                <h3 className="text-xl font-black text-[#00204a] mt-1">{completeJobTarget.title}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Job #{completeJobTarget.id} • Scheduled: {completeJobTarget.scheduledDate || 'Pending'} ({completeJobTarget.scheduledTimeSlot || `${completeJobTarget.durationHours || 1.5}h duration`})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCompleteJobTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Resident Info Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500 font-bold">Resident Details:</p>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" /> {completeJobTarget.tenantName}
                </p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500 font-bold">Property Address:</p>
                <p className="text-slate-800 font-bold flex items-start gap-1.5">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  {completeJobTarget.address}
                </p>
              </div>
            </div>

            <form onSubmit={handleCompleteJob} className="space-y-5">
              {/* SECTION 1: Work Report */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileText size={14} className="text-sky-600" /> SECTION 1: Work Report (Required)
                </label>
                <textarea
                  rows={3}
                  required
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Describe the work completed, issues found, and actions taken..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a]"
                />
              </div>

              {/* SECTION 2 & 3: Photos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-800 mb-2">SECTION 2: Before Photos</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setBeforePhotos(Array.from(e.target.files))} className="text-xs" />
                  {beforePhotos.length > 0 && <p className="text-[10px] text-slate-500 mt-1">{beforePhotos.length} file(s) selected</p>}
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-800 mb-2">SECTION 3: After Photos</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setAfterPhotos(Array.from(e.target.files))} className="text-xs" />
                  {afterPhotos.length > 0 && <p className="text-[10px] text-slate-500 mt-1">{afterPhotos.length} file(s) selected</p>}
                </div>
              </div>

              {/* SECTION 4: Materials */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span><Wrench size={14} className="inline mr-1 text-amber-600" /> SECTION 4: Materials Used</span>
                  <button type="button" onClick={() => setMaterials([...materials, { material_name: '', quantity: 1, unit_cost: 0 }])} className="text-[10px] bg-amber-100 text-amber-800 px-2 py-1 rounded-lg hover:bg-amber-200 cursor-pointer transition-colors">
                    + Add Material
                  </button>
                </label>
                {materials.map((m, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input type="text" placeholder="Material Name" value={m.material_name} onChange={e => { const nm = [...materials]; nm[idx].material_name = e.target.value; setMaterials(nm); }} className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs" required />
                    <input type="number" placeholder="Qty" value={m.quantity} min="0.1" step="0.1" onChange={e => { const nm = [...materials]; nm[idx].quantity = e.target.value; setMaterials(nm); }} className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs" required />
                    <input type="number" placeholder="Unit Cost (£)" value={m.unit_cost} min="0" step="0.01" onChange={e => { const nm = [...materials]; nm[idx].unit_cost = e.target.value; setMaterials(nm); }} className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs" required />
                    <button type="button" onClick={() => setMaterials(materials.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 cursor-pointer">
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Receipts for Materials</label>
                  <input type="file" multiple accept="image/*,.pdf" onChange={(e) => setReceipts(Array.from(e.target.files))} className="text-xs" />
                  {receipts.length > 0 && <p className="text-[10px] text-slate-500 mt-1">{receipts.length} receipt(s) selected</p>}
                </div>
              </div>

              {/* SECTION 5: Submit */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button type="button" onClick={() => setCompleteJobTarget(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 rounded-xl font-bold text-white text-xs bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60">
                  {submitting ? <><Loader2 size={15} className="animate-spin" /> Finalizing...</> : <><CheckCircle2 size={15} /> Complete Job</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
      
      {/* CANCEL / RESCHEDULE MODAL */}
      {cancelJobTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 my-8 text-slate-800"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-red-700 mt-1 flex items-center gap-2">
                  <AlertCircle size={20} /> Reschedule / Cancel
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Job #{cancelJobTarget.id} • Scheduled: {cancelJobTarget.scheduledDate || 'Pending'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCancelJobTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* 48-Hour UI Check */}
            {(() => {
              let inside48 = false;
              if (cancelJobTarget.scheduledDate && cancelJobTarget.scheduledTimeSlot) {
                const parts = cancelJobTarget.scheduledTimeSlot.split('-');
                const startTime = parts[0].trim();
                const d = new Date(`${cancelJobTarget.scheduledDate}T${startTime}:00`);
                if (!isNaN(d.getTime())) {
                  const diff = d.getTime() - new Date().getTime();
                  if (diff <= 172800000) inside48 = true; // 48 * 60 * 60 * 1000
                }
              }
              return inside48 ? (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-bold text-center space-y-2">
                  <p>This appointment is within the 48-hour cancellation window.</p>
                  <p className="text-base">Please contact our office: 0121 769 1767</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-2">Why are you cancelling?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${cancelType === 'TENANT_CANCELLED' ? 'border-purple-600 bg-purple-50 text-purple-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input type="radio" name="cancelType" value="TENANT_CANCELLED" className="hidden" checked={cancelType === 'TENANT_CANCELLED'} onChange={(e) => setCancelType(e.target.value)} />
                        <User size={20} className="mb-1" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-center">Tenant Cancelled</span>
                      </label>
                      <label className={`border rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors ${cancelType === 'TECHNICIAN_CANCELLED' ? 'border-red-600 bg-red-50 text-red-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                        <input type="radio" name="cancelType" value="TECHNICIAN_CANCELLED" className="hidden" checked={cancelType === 'TECHNICIAN_CANCELLED'} onChange={(e) => setCancelType(e.target.value)} />
                        <Wrench size={20} className="mb-1" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-center">Technician Cancelled</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Reason *</label>
                    <input
                      type="text"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder="e.g. Tenant not home, Vehicle broken down..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  {cancelType === 'TENANT_CANCELLED' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">Proof Upload (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCancelProof(e.target.files[0] || null)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">Upload SMS screenshot or WhatsApp message</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">Additional Notes (Optional)</label>
                    <textarea
                      rows={2}
                      value={cancelNotes}
                      onChange={(e) => setCancelNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>
              );
            })()}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setCancelJobTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>

              {(() => {
                let inside48 = false;
                if (cancelJobTarget.scheduledDate && cancelJobTarget.scheduledTimeSlot) {
                  const parts = cancelJobTarget.scheduledTimeSlot.split('-');
                  const startTime = parts[0].trim();
                  const d = new Date(`${cancelJobTarget.scheduledDate}T${startTime}:00`);
                  if (!isNaN(d.getTime())) {
                    const diff = d.getTime() - new Date().getTime();
                    if (diff <= 172800000) inside48 = true;
                  }
                }
                return (
                  <button
                    type="button"
                    disabled={submitting || inside48}
                    onClick={handleCancelJob}
                    className="px-5 py-2.5 rounded-xl font-bold text-white text-xs bg-red-600 hover:bg-red-700 shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      'Submit Cancellation'
                    )}
                  </button>
                );
              })()}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

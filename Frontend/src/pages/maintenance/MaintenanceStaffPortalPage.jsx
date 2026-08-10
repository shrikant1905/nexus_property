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
  const [reportText, setReportText] = useState('');
  const [actualHours, setActualHours] = useState('1.5');
  const [dutyStatus, setDutyStatus] = useState('AVAILABLE');

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

  const openInspectModal = (job) => {
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

  const handleCompleteJob = async (jobId) => {
    if (!reportText.trim()) {
      alert('Please enter technician work completion notes before completing.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Submit work report
      await staffPortalService.submitReport(jobId, {
        workReport: reportText.trim(),
        actualHours: parseFloat(actualHours) || 1.5,
      });

      // 2. Finalize completion (requires proof photo + report verified by backend)
      await staffPortalService.finalizeCompletion(jobId);
      alert('✓ Work Order completed successfully! Verified report & proof photos.');
      setInspectJob(null);
      await loadStaffPortalData();
    } catch (err) {
      alert(`⚠️ Completion Failed: ${err.message}`);
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
                        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[10px]">
                          {job.section}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => openInspectModal(job)}
                          className="px-3 py-1.5 rounded-xl font-bold text-white text-xs bg-[#00204a] hover:bg-[#001738] transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={14} /> View & Complete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Task Inspection, Proof Photo Upload & Work Sign-off */}
      {inspectJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 text-slate-800"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {inspectJob.section}
                </span>
                <h3 className="text-xl font-black text-[#00204a] mt-1">{inspectJob.title}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Job #{inspectJob.id} • Scheduled: {inspectJob.scheduledDate || 'Pending'} ({inspectJob.scheduledTimeSlot || `${inspectJob.durationHours || 1.5}h duration`})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setInspectJob(null)}
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
                  <User size={14} className="text-slate-400" /> {inspectJob.tenantName}
                </p>
                {inspectJob.contactPhone && (
                  <a href={`tel:${inspectJob.contactPhone}`} className="text-[#00204a] font-bold hover:underline flex items-center gap-1.5">
                    <Phone size={13} /> {inspectJob.contactPhone}
                  </a>
                )}
              </div>

              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500 font-bold">Property Address:</p>
                <p className="text-slate-800 font-bold flex items-start gap-1.5">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  {inspectJob.address}
                </p>
              </div>
            </div>

            {/* Work Description */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-1">Work Instructions:</p>
              <p className="p-3 rounded-xl bg-slate-50 text-slate-800 text-xs leading-relaxed border border-slate-200 font-medium">
                {inspectJob.description || 'No specific description provided.'}
              </p>
            </div>

            {/* Proof Photos Section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon size={15} className="text-purple-600" /> Proof Completion Photos (Required for completion):
                </p>
                {uploading && (
                  <span className="text-[11px] text-purple-700 font-bold flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" /> Uploading to server...
                  </span>
                )}
              </div>

              {/* Upload Input */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 cursor-pointer shadow-xs transition-colors">
                  <Upload size={14} /> Choose & Upload Photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={uploading}
                    className="hidden"
                    onChange={(e) => handlePhotoUpload(inspectJob.id, e)}
                  />
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Accepted: JPEG, PNG, WebP (Max 5MB)</span>
              </div>
            </div>

            {/* Technician Completion Report */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Actual Hours Spent *</label>
                  <input
                    type="number"
                    step="0.5"
                    value={actualHours}
                    onChange={(e) => setActualHours(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00204a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileText size={14} className="text-sky-600" /> Work Summary & Completion Notes *
                </label>
                <textarea
                  rows={3}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Enter details of work performed, parts replaced, and recommendations..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setInspectJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleCompleteJob(inspectJob.id)}
                className="px-5 py-2.5 rounded-xl font-bold text-white text-xs bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Finalizing Completion...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Finalize Work Order Completion
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

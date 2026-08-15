import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Link as LinkIcon, Copy, ExternalLink, Check, MessageSquare, Mail,
  Clock, Shield, User, MapPin, Sparkles, AlertCircle, Eye, Calendar, Phone
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { staffService } from '../../services/staffService';
import { tenantService } from '../../services/tenantService';
import FormModal from '../../components/modals/FormModal';
import { FormField, SelectField } from '../../components/forms/FormFields';
import { slideInBottom, staggerContainer, staggerItem } from '../../utils/motionVariants';

const DURATION_OPTIONS = [
  { value: '0.5', label: '30 Minutes (0.5h)' },
  { value: '1.0', label: '1 Hour (1.0h)' },
  { value: '1.5', label: '1.5 Hours' },
  { value: '2.0', label: '2 Hours' },
  { value: '3.0', label: '3 Hours' },
  { value: '4.0', label: '4 Hours (Half Day)' },
  { value: '8.0', label: '8 Hours (Full Day)' },
];

const EXPIRY_OPTIONS = [
  { value: '1', label: '1 Day' },
  { value: '3', label: '3 Days' },
  { value: '7', label: '7 Days (Recommended)' },
  { value: '14', label: '14 Days' },
  { value: '30', label: '30 Days' },
];

export default function MaintenanceBookingLinkPage() {
  const [tenants, setTenants] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [requests, setRequests] = useState([]);
  const [inspectReq, setInspectReq] = useState(null);

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        const [requestsRes, staffRes, tenantsRes] = await Promise.all([
          bookingService.getBookingRequests().catch(() => []),
          staffService.getStaff().catch(() => []),
          tenantService.getTenants().catch(() => []),
        ]);
        setRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes?.data || []);
        setStaffList(Array.isArray(staffRes) ? staffRes : staffRes?.data || []);
        const list = Array.isArray(tenantsRes) ? tenantsRes : tenantsRes?.data || [];
        setTenants(list);
        if (list.length > 0) {
          setForm((prev) => ({ ...prev, tenantId: list[0].id }));
        }
      } catch (err) {
        setRequests([]);
        setStaffList([]);
        setTenants([]);
      }
    };
    loadBookingData();
  }, []);

  const [form, setForm] = useState({
    tenantId: tenants[0]?.id || '',
    description: '',
    durationHours: '1.5',
    assignmentPreference: 'ANY',
    earliestDate: new Date().toISOString().split('T')[0],
    internalNotes: '',
    linkExpiryDays: '7',
    priority: 'NORMAL',
  });

  const [generatedResult, setGeneratedResult] = useState(null);
  const [copiedType, setCopiedType] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!form.description.trim()) {
      alert('Please enter a job description.');
      return;
    }

    try {
      const result = await bookingService.generateBookingLink(form);
      setGeneratedResult(result);
      const requestsRes = await bookingService.getBookingRequests().catch(() => []);
      setRequests(Array.isArray(requestsRes) ? requestsRes : requestsRes?.data || []);
    } catch (err) {
      alert(err.message || 'Failed to generate booking link');
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'BOOKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> BOOKED
          </span>
        );
      case 'RESCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-sky-500" /> RESCHEDULED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-800 border border-red-200 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-red-500" /> CANCELLED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-slate-400" /> EXPIRED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> WAITING FOR BOOKING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#00204a] tracking-tight">Booking Link Generator</h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Generate secure SMS & Email booking links with duration-based slot calculation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <motion.div
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <h2 className="text-base font-black text-[#00204a] mb-4 flex items-center gap-2">
            <Sparkles className="text-sky-600" size={18} /> New Resident Booking Request
          </h2>

          <form onSubmit={handleGenerate} className="space-y-4 text-sm">
            <SelectField
              label="Select Resident / Property *"
              name="tenantId"
              value={form.tenantId}
              onChange={(e) => setForm({ ...form, tenantId: e.target.value })}
              options={tenants.map((t) => ({ value: t.id, label: `${t.full_name || t.name || 'Resident'} — ${t.address}` }))}
            />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description *</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="e.g. Kitchen sink drain replacement & supply line check"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Estimated Duration *"
                name="durationHours"
                value={form.durationHours}
                onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
                options={DURATION_OPTIONS}
              />

              <SelectField
                label="Staff Preference *"
                name="assignmentPreference"
                value={form.assignmentPreference}
                onChange={(e) => setForm({ ...form, assignmentPreference: e.target.value })}
                options={[
                  { value: 'ANY', label: '⚡ Any Available Staff (Recommended)' },
                  ...staffList.map((s) => ({ value: s.id, label: `👤 ${s.name} (${s.role.split(' ')[0]})` })),
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Earliest Booking Date"
                type="date"
                name="earliestDate"
                value={form.earliestDate}
                onChange={(e) => setForm({ ...form, earliestDate: e.target.value })}
              />

              <SelectField
                label="Link Expiry Period"
                name="linkExpiryDays"
                value={form.linkExpiryDays}
                onChange={(e) => setForm({ ...form, linkExpiryDays: e.target.value })}
                options={EXPIRY_OPTIONS}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                label="Job Priority *"
                name="priority"
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                options={[
                  { value: 'URGENT', label: '🚨 URGENT' },
                  { value: 'HIGH', label: '🔥 HIGH' },
                  { value: 'NORMAL', label: '✅ NORMAL' },
                  { value: 'LOW', label: '🔽 LOW' },
                ]}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes (Optional)</label>
                <input
                  type="text"
                  value={form.internalNotes}
                  onChange={(e) => setForm({ ...form, internalNotes: e.target.value })}
                  placeholder="e.g. Tenant requested morning slot if possible"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white"
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <LinkIcon size={16} /> Generate Booking Link & Messages
            </motion.button>
          </form>
        </motion.div>

        {/* Output Action Panel */}
        <motion.div
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <h2 className="text-base font-black text-[#00204a] mb-4 flex items-center gap-2">
              <LinkIcon className="text-emerald-600" size={18} /> Generated Link Output
            </h2>

            {!generatedResult ? (
              <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                <Clock size={32} className="mx-auto text-slate-400" />
                <p className="text-xs text-slate-500 font-medium">Fill out the form on the left to generate SMS, Email, and Booking URL.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Public URL Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-300 space-y-2">
                  <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
                    Public Booking URL (UUID Secure Token):
                  </span>
                  <div className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-900 shadow-2xs">
                    <span className="truncate">{generatedResult.publicUrl}</span>
                    <button
                      onClick={() => copyToClipboard(generatedResult.publicUrl, 'URL')}
                      className="p-1.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer flex-shrink-0"
                      title="Copy URL"
                    >
                      {copiedType === 'URL' ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                {/* Copy Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => copyToClipboard(generatedResult.smsMessage, 'SMS')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquare size={15} className="text-sky-600" /> Copy SMS Message
                    </span>
                    {copiedType === 'SMS' ? <span className="text-emerald-700 text-[11px] font-bold">Copied!</span> : <Copy size={14} className="text-slate-400" />}
                  </button>

                  <button
                    onClick={() => copyToClipboard(generatedResult.emailMessage, 'EMAIL')}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Mail size={15} className="text-purple-600" /> Copy Email Message
                    </span>
                    {copiedType === 'EMAIL' ? <span className="text-emerald-700 text-[11px] font-bold">Copied!</span> : <Copy size={14} className="text-slate-400" />}
                  </button>
                </div>

                {/* Open Portal Link */}
                <a
                  href={generatedResult.publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 rounded-xl bg-[#00204a] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#001738] shadow-md transition-colors cursor-pointer"
                >
                  Open Resident Portal <ExternalLink size={15} />
                </a>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Secure Mock UUID Tokens</span>
            <span>No IDs exposed</span>
          </div>
        </motion.div>
      </div>

      {/* Existing Generated Links Table */}
      <motion.div
        variants={slideInBottom}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-[#00204a]">Active Booking Links & Statuses</h3>
          <span className="text-xs text-slate-500 font-medium">{requests.length} Requests Total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#00204a] text-white font-extrabold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Resident & Address</th>
                <th className="px-6 py-3.5">Description</th>
                <th className="px-6 py-3.5">Duration & Staff</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{req.tenantName}</p>
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{req.address}</p>
                  </td>

                  <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-800">
                    {req.description}
                  </td>

                  <td className="px-6 py-4">
                    <p className="font-bold text-amber-700">{req.durationHours} Hours</p>
                    <p className="text-[11px] text-slate-500">{req.assignedStaffName}</p>
                  </td>

                  <td className="px-6 py-4">{getStatusBadge(req.status)}</td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setInspectReq(req)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-[#00204a] text-slate-700 hover:text-white transition-all cursor-pointer shadow-2xs"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      <a
                        href={`/booking/${req.secureToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors cursor-pointer shadow-2xs"
                        title="Open Resident Portal"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* INSPECT CUSTOMER BOOKING DETAILS MODAL */}
      <FormModal
        isOpen={!!inspectReq}
        onClose={() => setInspectReq(null)}
        title={`Resident Booking Details — ${inspectReq?.tenantName || ''}`}
      >
        {inspectReq && (
          <div className="space-y-4 text-xs text-slate-800">
            {/* Status Summary Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking Status</span>
                <div className="mt-1">{getStatusBadge(inspectReq.status)}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Duration</span>
                <span className="font-extrabold text-amber-700 text-sm">{inspectReq.durationHours} Hours</span>
              </div>
            </div>

            {/* Resident Information Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-[#00204a] text-xs flex items-center gap-1.5">
                <User size={14} className="text-sky-600" /> Customer / Resident Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium">
                <div>
                  <span className="text-slate-400 block text-[11px]">Resident Name:</span>
                  <span className="text-slate-900 font-bold">{inspectReq.tenantName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Property Address:</span>
                  <span className="text-slate-900 font-bold truncate block">{inspectReq.address}</span>
                </div>
              </div>
            </div>

            {/* Job Description & Notes */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-[#00204a] text-xs flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600" /> Maintenance Job Description
              </h4>
              <p className="text-slate-800 font-bold text-xs leading-relaxed">{inspectReq.description}</p>
              {inspectReq.internalNotes && (
                <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <strong className="text-slate-700">Internal Office Notes:</strong> {inspectReq.internalNotes}
                </div>
              )}
            </div>

            {/* Booked Appointment Confirmation Details */}
            {inspectReq.bookingDetails ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-3">
                <h4 className="font-black text-emerald-900 text-xs flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-700" /> Confirmed Calendar Slot
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-800">
                  <div>
                    <span className="text-emerald-800 text-[10px] block uppercase">Scheduled Date:</span>
                    <span className="text-slate-900 text-sm font-black">{inspectReq.bookingDetails.date}</span>
                  </div>
                  <div>
                    <span className="text-emerald-800 text-[10px] block uppercase">Scheduled Time Slot:</span>
                    <span className="text-slate-900 text-sm font-black">{inspectReq.bookingDetails.timeSlot} ({inspectReq.durationHours}h)</span>
                  </div>
                  <div className="col-span-2 pt-1">
                    <span className="text-emerald-800 text-[10px] block uppercase">Assigned Technician:</span>
                    <span className="text-[#00204a] text-sm font-black">👤 {inspectReq.bookingDetails.staffName || inspectReq.assignedStaffName}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200">
                  <a
                    href="/maintenance/calendar"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#00204a] hover:bg-[#001738] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <Calendar size={14} /> View Slot on Staff Calendar ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Clock size={14} /> Awaiting Resident Booking
                </p>
                <p className="text-[11px] text-amber-800">
                  Resident has not selected a date/time slot yet. Link expires: <strong>{inspectReq.expiresAt || 'In 7 days'}</strong>
                </p>
              </div>
            )}

            {/* Public URL Copy Box */}
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-[11px] text-slate-800 flex items-center justify-between gap-2">
              <span className="truncate">{window.location.origin}/booking/{inspectReq.secureToken}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(`${window.location.origin}/booking/${inspectReq.secureToken}`, 'MODAL_URL')}
                className="px-2.5 py-1 rounded-lg bg-[#00204a] text-white text-[10px] font-bold hover:bg-[#001738] transition-colors flex-shrink-0 cursor-pointer"
              >
                {copiedType === 'MODAL_URL' ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        )}
      </FormModal>
    </div>
  );
}

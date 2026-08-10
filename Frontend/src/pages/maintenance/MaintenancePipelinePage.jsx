import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Plus, Search, User, MapPin, Calendar as CalendarIcon,
  Copy, Check, FileText, CheckCircle2, Wrench, Clock, ExternalLink
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { staffService } from '../../services/staffService';
import { tenantService } from '../../services/tenantService';
import FormModal from '../../components/modals/FormModal';
import { FormField, SelectField } from '../../components/forms/FormFields';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';
import Toast from '../../components/common/Toast';

const SECTIONS = [
  { id: 'Quotes', label: 'Quotes', icon: FileText, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
  { id: 'Completed Quotes', label: 'Completed Quotes', icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { id: 'Jobs Waiting Booking', label: 'Jobs Waiting Booking', icon: Clock, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { id: 'Jobs', label: 'Jobs', icon: Wrench, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { id: 'Completed Jobs', label: 'Completed Jobs', icon: CheckCircle2, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
];

const initialFormState = {
  title: '',
  managerName: '',
  tenantId: '',
  contactPhone: '',
  address: '',
  description: '',
  durationHours: '1.5',
  assignedStaffId: '',
  section: 'Quotes',
};

export default function MaintenancePipelinePage() {
  const [searchParams] = useSearchParams();
  const initialStage = searchParams.get('stage') || 'Quotes';

  const [jobs, setJobs] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState(initialStage);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadPipelineData = async () => {
      try {
        const [jobsRes, staffRes, tenantsRes] = await Promise.all([
          jobService.getJobs().catch(() => []),
          staffService.getStaff().catch(() => []),
          tenantService.getTenants().catch(() => []),
        ]);
        setJobs(Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || []);
        setStaffList(Array.isArray(staffRes) ? staffRes : staffRes?.data || []);
        setTenants(Array.isArray(tenantsRes) ? tenantsRes : tenantsRes?.data || []);
      } catch (err) {
        setJobs([]);
        setStaffList([]);
        setTenants([]);
      }
    };
    loadPipelineData();
  }, []);
  const [selectedJob, setSelectedJob] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);


  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    const stageFromUrl = searchParams.get('stage');
    if (stageFromUrl) {
      setActiveTab(stageFromUrl);
    }
  }, [searchParams]);

  const loadPipelineData = useCallback(async () => {
    try {
      const [jobsRes, staffRes, tenantsRes] = await Promise.all([
        jobService.getJobs().catch(() => []),
        staffService.getStaff().catch(() => []),
        tenantService.getTenants().catch(() => []),
      ]);
      setJobs(Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || []);
      setStaffList(Array.isArray(staffRes) ? staffRes : staffRes?.data || []);
      setTenants(Array.isArray(tenantsRes) ? tenantsRes : tenantsRes?.data || []);
    } catch (err) {
      setJobs([]);
      setStaffList([]);
      setTenants([]);
    }
  }, []);

  const handleSectionChange = async (jobId, newSection) => {
    try {
      await jobService.moveJobStage(jobId, newSection);
      await loadPipelineData();
    } catch (err) {
      alert(err.message || 'Failed to update job stage');
    }
  };

  const handleTenantSelect = (tenantId) => {
    const tenant = tenants.find((t) => String(t.id) === String(tenantId));
    if (tenant) {
      setForm((prev) => ({
        ...prev,
        tenantId: tenant.id,
        address: tenant.address || '',
        contactPhone: tenant.phone || '',
      }));
    }
  };

  const handleCreateJob = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a job title.');
      return;
    }
    if (!form.address.trim()) {
      alert('Please enter full address.');
      return;
    }

    const tenant = tenants.find((t) => String(t.id) === String(form.tenantId));

    try {
      const payload = {
        title: form.title.trim(),
        manager_name: form.managerName.trim() || undefined,
        resident_id: form.tenantId || undefined,
        resident_name: tenant?.name || form.name || 'Resident',
        contact_phone: form.contactPhone.trim() || tenant?.phone || '',
        property_address: form.address.trim(),
        description: form.description.trim() || undefined,
        duration_hours: parseFloat(form.durationHours) || 1.5,
        assigned_staff_id: form.assignedStaffId || undefined,
        section: form.section || 'Quotes',
      };

      await jobService.createJob(payload);
      await loadPipelineData();
      setNewModalOpen(false);
      setForm(initialFormState);
    } catch (err) {
      alert(err.message || 'Failed to create work order.');
    }
  };

  const copyJobLink = async (job) => {
    try {
      const linkRes = await jobService.generatePublicLink(job.id, 'BOOKING');
      const token = linkRes.data?.secureToken || job.secureToken;
      const url = `${window.location.origin}/booking/${token}`;
      navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2500);
      setToast({ message: '✓ Booking link successfully generated and copied to clipboard!', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ message: err.message || 'Failed to generate link', type: 'error' });
      setTimeout(() => setToast(null), 3000);
    }
  };


  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.tenantName.toLowerCase().includes(search.toLowerCase()) ||
    j.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 max-w-full overflow-hidden text-slate-800">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#00204a] tracking-tight flex items-center gap-2.5">
            <Sparkles size={24} className="text-amber-500 flex-shrink-0" />
            <span>Workflow Maintenance Pipeline</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Asana-style 5-stage work order tracking, status boards, and booking link generator
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search work orders, address..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer flex-shrink-0"
          >
            <Plus size={16} /> New Work Order
          </button>
        </div>
      </div>

      {/* Mobile Stage Selector Tabs */}
      <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {SECTIONS.map((sec) => {
          const count = filteredJobs.filter((j) => j.section === sec.id).length;
          const Icon = sec.icon;
          const isActive = activeTab === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveTab(sec.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#00204a] text-white shadow-md border border-[#00204a]'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-white' : sec.color} />
              <span>{sec.label}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* STRICT BOUNDED CONTAINER BOX */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-3 shadow-inner h-[calc(100vh-210px)] overflow-hidden flex flex-col">
        {/* ========= MOBILE PIPELINE VIEW ========= */}
        <div className="lg:hidden flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {(() => {
            const sec = SECTIONS.find((s) => s.id === activeTab) || SECTIONS[0];
            const sectionJobs = filteredJobs.filter((j) => j.section === sec.id);
            const Icon = sec.icon;

            return (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl ${sec.bg} flex items-center justify-center`}>
                      <Icon size={16} className={sec.color} />
                    </div>
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{sec.label}</h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                    {sectionJobs.length} {sectionJobs.length === 1 ? 'Job' : 'Jobs'}
                  </span>
                </div>

                <div className="space-y-3">
                  {sectionJobs.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                      <p className="text-xs text-slate-400 font-semibold">No items in {sec.label}</p>
                    </div>
                  ) : (
                    sectionJobs.map((job) => (
                      <div
                        key={job.id}
                        onClick={() => setSelectedJob(job)}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer space-y-2.5"
                      >
                        <p className="text-sm font-bold text-slate-900 leading-snug">{job.title}</p>
                        <div className="space-y-1 text-xs text-slate-500">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate">
                              <User size={13} className="text-slate-400 flex-shrink-0" />
                              <span className="truncate font-semibold text-slate-700">{job.tenantName}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin size={13} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate text-slate-500">{job.address}</span>
                          </div>
                        </div>

                        {job.assignedStaffName && (
                          <div className="text-[11px] text-sky-800 font-bold bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200 w-fit">
                            👤 Staff: {job.assignedStaffName}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                          <span className="text-amber-700 font-extrabold">⏱ {job.durationHours}h</span>
                          <select
                            value={job.section}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleSectionChange(job.id, e.target.value)}
                            className="bg-white text-[11px] text-slate-800 font-bold border border-slate-200 rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                          >
                            {SECTIONS.map((s) => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ========= DESKTOP PIPELINE VIEW ========= */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="hidden lg:grid lg:grid-cols-5 gap-3 h-full items-start"
        >
          {SECTIONS.map((sec) => {
            const sectionJobs = filteredJobs.filter((j) => j.section === sec.id);
            const Icon = sec.icon;

            return (
              <motion.div
                key={sec.id}
                variants={staggerItem}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 h-full flex flex-col justify-between shadow-xs min-w-0"
              >
                {/* Column Header */}
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-7 h-7 rounded-xl ${sec.bg} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={15} className={sec.color} />
                      </div>
                      <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-tight" title={sec.label}>{sec.label}</h3>
                    </div>
                    <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                      {sectionJobs.length}
                    </span>
                  </div>

                  {/* Column Scrollable Cards Container */}
                  <div className="space-y-3 overflow-y-auto pr-1 flex-1 max-h-[calc(100vh-310px)] scrollbar-thin scrollbar-thumb-slate-200">
                    {sectionJobs.length === 0 ? (
                      <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl my-auto">
                        <p className="text-xs text-slate-400 font-semibold">No items in {sec.label}</p>
                      </div>
                    ) : (
                      sectionJobs.map((job) => (
                        <motion.div
                          key={job.id}
                          whileHover={{ scale: 1.01, y: -1 }}
                          onClick={() => setSelectedJob(job)}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all cursor-pointer group space-y-2.5 shadow-2xs"
                        >
                          <p className="text-xs font-bold text-slate-900 group-hover:text-[#00204a] transition-colors leading-snug">
                            {job.title}
                          </p>

                          <div className="space-y-1 text-[11px] text-slate-500">
                            <div className="flex items-center justify-between gap-1">
                              <div className="flex items-center gap-1 min-w-0 flex-1 truncate">
                                <User size={12} className="text-slate-400 flex-shrink-0" />
                                <span className="truncate font-semibold text-slate-700">{job.tenantName}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 truncate">
                              <MapPin size={12} className="text-slate-400 flex-shrink-0" />
                              <span className="truncate text-slate-500">{job.address}</span>
                            </div>
                          </div>

                          {(job.assignedStaffName || job.scheduledDate) && (
                            <div className="space-y-1 pt-0.5">
                              {job.assignedStaffName && (
                                <div className="text-[10px] text-sky-800 font-bold bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 w-fit truncate">
                                  👤 Staff: {job.assignedStaffName}
                                </div>
                              )}
                              {job.scheduledDate && (
                                <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 truncate">
                                  <CalendarIcon size={11} /> {job.scheduledDate}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1 text-xs">
                            <span className="text-amber-700 font-extrabold text-[11px] flex-shrink-0">⏱ {job.durationHours}h</span>

                            <div className="flex items-center gap-1 min-w-0 flex-1 justify-end">
                              {job.secureToken && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyJobLink(job.secureToken);
                                  }}
                                  className="p-1 rounded bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer flex-shrink-0"
                                  title="Copy Booking Link"
                                >
                                  {copiedToken === job.secureToken ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                              )}

                              <select
                                value={job.section}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleSectionChange(job.id, e.target.value)}
                                className="bg-white text-[10px] text-slate-800 font-bold border border-slate-200 rounded px-1 py-0.5 focus:outline-none cursor-pointer w-full max-w-[125px] truncate"
                              >
                                {SECTIONS.map((s) => (
                                  <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* New Maintenance Job Creation Modal */}
      <FormModal
        isOpen={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        title="Create New Maintenance Quote / Work Order"
        onSubmit={handleCreateJob}
        submitLabel="Create Quote / Job"
      >
        <div className="space-y-4">
          <FormField
            label="Job Title *"
            name="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Repaint Bathroom / AC Duct Swap"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Resident / Tenant Name *"
              name="managerName"
              value={form.managerName}
              onChange={(e) => setForm({ ...form, managerName: e.target.value, tenantName: e.target.value })}
              placeholder="e.g. Robert Fox / Jenny Wilson"
            />

            <FormField
              label="Contact Phone / Email *"
              name="contactPhone"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="e.g. 0121 270 2633 / robert@example.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Property Address / Unit Number *"
              name="address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. Apt 3110 Fabrick Square, Birmingham B12 0AF"
            />

            <SelectField
              label="Hours Required for Job *"
              name="durationHours"
              value={form.durationHours}
              onChange={(e) => setForm({ ...form, durationHours: e.target.value })}
              options={[
                { value: '0.5', label: '30 mins (0.5h)' },
                { value: '1.0', label: '1 hour (1.0h)' },
                { value: '1.5', label: '1.5 hours' },
                { value: '2.0', label: '2.0 hours' },
                { value: '3.0', label: '3.0 hours' },
                { value: '4.0', label: 'Half Day (4.0h)' },
                { value: '8.0', label: 'Full Day (8.0h)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SelectField
              label="Assigned Technician"
              name="assignedStaffId"
              value={form.assignedStaffId}
              onChange={(e) => setForm({ ...form, assignedStaffId: e.target.value })}
              options={staffList.map((s) => ({ value: s.id, label: `👤 ${s.name} (${s.role.split(' ')[0]})` }))}
            />

            <SelectField
              label="Pipeline Stage / Section"
              name="section"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              options={SECTIONS.map((s) => ({ value: s.id, label: s.label }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Work Description Required *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe works required (e.g. Repaint whole property, walls, ceilings, skirting boards)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white font-medium"
            />
          </div>
        </div>
      </FormModal>

      {/* Asana-Style Work Order Details Modal (Full — Matching Netlify Version) */}
      <FormModal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title || 'Work Order Details'}
      >
        {selectedJob && (
          <div className="space-y-4 text-xs">

            {/* Top Data Rows — matching Netlify layout */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-[#0b0f19] border border-white/10 text-xs">
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 font-semibold w-40 flex-shrink-0">Work Order Sent By:</span>
                <span className="font-bold text-white text-right">{selectedJob.tenantName || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 font-semibold w-40 flex-shrink-0">Full Address:</span>
                <span className="font-medium text-slate-200 text-right">{selectedJob.address || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 font-semibold w-40 flex-shrink-0">Contact Details:</span>
                <span className="font-bold text-[#38bdf8] text-right">{selectedJob.contactPhone || selectedJob.tenantName || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 font-semibold w-40 flex-shrink-0">Hours Required:</span>
                <span className="font-extrabold text-amber-400 text-right">{selectedJob.durationHours}h Hours</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 font-semibold w-40 flex-shrink-0">Assigned Staff / Technician:</span>
                <span className="font-bold text-[#38bdf8] text-right">
                  {selectedJob.assignedStaffName && selectedJob.assignedStaffName !== 'Unassigned'
                    ? `👤 ${selectedJob.assignedStaffName}`
                    : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 font-semibold w-40 flex-shrink-0">Request Raised Date:</span>
                <span className="font-mono text-slate-200 text-right">{selectedJob.createdAt || '—'}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-400 font-semibold w-40 flex-shrink-0">Current Status Section:</span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-[#38bdf8] font-bold border border-blue-500/30">
                  {selectedJob.section}
                </span>
              </div>
            </div>

            {/* Work Description */}
            <div className="space-y-2">
              <p className="text-slate-400 font-semibold">Work Description:</p>
              <div className="p-3 rounded-xl bg-slate-900/80 text-slate-200 leading-relaxed border border-white/5 whitespace-pre-line">
                {selectedJob.description || '—'}
              </div>
            </div>

            {/* Staff Calendar Allocation Dropdown */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                📅 Allocate Job to Staff Calendar:
              </label>
              <select
                value={selectedJob.assignedStaffId || ''}
                onChange={async (e) => {
                  const newStaffId = e.target.value;
                  const staff = staffList.find((s) => String(s.id) === String(newStaffId) || String(s.profileId) === String(newStaffId));
                  try {
                    await jobService.updateJobStatus(selectedJob.id, { assignedStaffId: newStaffId || null });
                    await loadPipelineData();
                    setSelectedJob((prev) => ({
                      ...prev,
                      assignedStaffId: newStaffId,
                      assignedStaffName: staff?.name || 'Unassigned',
                    }));
                  } catch (err) {
                    alert(err.message || 'Failed to update assigned staff member.');
                  }
                }}
                className="w-full bg-[#111827] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#009bf2]"
              >
                <option value="">— Select Staff —</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.profileId || s.id}>
                    👤 {s.name} — {s.role}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                Specialty jobs will only appear on this staff member&apos;s calendar for resident booking.
              </p>
            </div>

            {/* Bottom Workflow Action Buttons */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const linkRes = await jobService.generatePublicLink(selectedJob.id, 'QUOTE_UPLOAD');
                    const token = linkRes.data?.secureToken || selectedJob.secureToken;
                    const url = `${window.location.origin}/quote-upload/${token}`;
                    navigator.clipboard.writeText(url);
                    setToast({ message: '✓ Request link successfully generated and copied to clipboard!', type: 'success' });
                    setTimeout(() => setToast(null), 3000);
                  } catch (err) {
                    setToast({ message: err.message || 'Failed to generate link.', type: 'error' });
                    setTimeout(() => setToast(null), 3000);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                📷 Request Photos & Information
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleSectionChange(selectedJob.id, 'Completed Quotes');
                  setToast({ message: '✓ Job quote marked as sent! Moved to "Completed Quotes".', type: 'success' });
                  setTimeout(() => setToast(null), 3000);
                  setSelectedJob(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 shadow-lg hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                ✅ Quote Sent
              </button>
            </div>

          </div>
        )}
      </FormModal>

      <AnimatePresence>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

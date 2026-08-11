import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, CheckCircle2, Wrench, Clock, Plus, Search, User, MapPin,
  Calendar as CalendarIcon, ArrowRight, Shield, DollarSign, Users,
  TrendingUp, TrendingDown, Sparkles, Filter, Copy, Check, ExternalLink,
  Boxes, AlertTriangle, RefreshCw, MessageSquare, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { dashboardService } from '../../services/dashboardService';
import { jobService } from '../../services/jobService';
import { staffService } from '../../services/staffService';
import { tenantService } from '../../services/tenantService';
import FormModal from '../../components/modals/FormModal';
import { FormField, SelectField } from '../../components/forms/FormFields';
import { staggerContainer, staggerItem, slideInBottom } from '../../utils/motionVariants';
import Toast from '../../components/common/Toast';

const SECTIONS = [
  { id: 'Quotes', label: 'Quotes', icon: FileText, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
  { id: 'Completed Quotes', label: 'Completed Quotes', icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { id: 'Jobs Waiting Booking', label: 'Jobs Waiting Booking', icon: Clock, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
  { id: 'Jobs', label: 'Jobs', icon: Wrench, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { id: 'Completed Jobs', label: 'Completed Jobs', icon: CheckCircle2, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
];

// ── Skeleton Loader Card ────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="h-2.5 w-24 bg-slate-200 rounded-full" />
          <div className="h-8 w-12 bg-slate-200 rounded-xl" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-200" />
      </div>
      <div className="h-2.5 w-32 bg-slate-100 rounded-full mt-3" />
    </div>
  );
}

// ── Loading Skeleton for Charts ─────────────────────────────────────────────
function SkeletonChart({ height = 220 }) {
  return (
    <div className="animate-pulse" style={{ height }}>
      <div className="h-full bg-slate-100 rounded-2xl flex items-center justify-center">
        <Loader2 size={28} className="text-slate-300 animate-spin" />
      </div>
    </div>
  );
}

export default function MaintenanceDashboardPage() {
  const navigate = useNavigate();

  // ── Dashboard Stats State ──────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  // ── Job list for modals (separate fetch) ──────────────────────────────────
  const [jobs, setJobs] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [tenants, setTenants] = useState([]);

  // ── UI State ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [toast, setToast] = useState(null);

  const refreshIntervalRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Fetch aggregated dashboard stats ──────────────────────────────────────
  const loadStats = useCallback(async (isManual = false) => {
    try {
      if (isManual) setLoading(true);
      const res = await dashboardService.getStats();
      if (res?.success && res?.data) {
        setStats(res.data);
        setLastRefreshed(new Date());
        // Sync staff list from stats (used in modals)
        if (res.data.staffWorkload?.length > 0) {
          setStaffList(res.data.staffWorkload);
        }
      }
    } catch (err) {
      if (isManual) showToast('⚠ Could not refresh dashboard data. Check your connection.', 'error');
    } finally {
      if (isManual) setLoading(false);
    }
  }, [showToast]);

  // ── Fetch supporting data for modals (jobs, tenants, staff) ───────────────
  const loadSupportingData = useCallback(async () => {
    try {
      const [jobsRes, staffRes, tenantsRes] = await Promise.all([
        jobService.getJobs().catch(() => ({ data: [] })),
        staffService.getStaff().catch(() => ({ data: [] })),
        tenantService.getTenants().catch(() => ({ data: [] })),
      ]);
      setJobs(Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || []);
      setStaffList(Array.isArray(staffRes) ? staffRes : staffRes?.data || []);
      setTenants(Array.isArray(tenantsRes) ? tenantsRes : tenantsRes?.data || []);
    } catch (_) {
      // Silent — supporting data failure doesn't block dashboard
    }
  }, []);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadStats(false), loadSupportingData()]);
      setLoading(false);
    };
    init();

    // Auto-refresh stats every 30 seconds
    refreshIntervalRef.current = setInterval(() => loadStats(false), 30000);
    return () => clearInterval(refreshIntervalRef.current);
  }, [loadStats, loadSupportingData]);

  // ── Derived stats from API ─────────────────────────────────────────────────
  const stageCounts = stats?.stageCounts || {};
  const quotesCount         = stageCounts['Quotes'] || 0;
  const completedQuotes     = stageCounts['Completed Quotes'] || 0;
  const activeJobsCount     = stageCounts['Jobs'] || 0;
  const completedJobsCount  = stageCounts['Completed Jobs'] || 0;
  const waitingBookingCount = stageCounts['Jobs Waiting Booking'] || 0;
  const totalJobs           = stats?.totalJobs || 0;
  const staffWorkload       = stats?.staffWorkload || [];
  const weeklyTrend         = stats?.weeklyTrend || [];
  const recentJobs          = stats?.recentJobs || [];
  const pendingQuoteRequests = stats?.pendingQuoteRequests || 0;

  // ── Category breakdown — comes from server (all jobs, not just recent 10) ──
  const categoryBreakdown = stats?.categoryBreakdown || [
    { name: 'Plumbing & Leaks',      value: 0, color: '#009bf2' },
    { name: 'Electrical & Lighting', value: 0, color: '#10b981' },
    { name: 'HVAC & Air Con',        value: 0, color: '#f59e0b' },
    { name: 'Locks & Carpentry',     value: 0, color: '#a855f7' },
    { name: 'Appliance Repair',      value: 0, color: '#ec4899' },
  ];

  // ── Bar chart data — activeJobs from server-side GROUP BY ──────────────────
  const staffBarData = staffWorkload.map(s => ({
    name:     s.name.split(' ')[0],
    fullName: s.name,
    jobs:     s.activeJobs,
    color:    s.color || '#a855f7',
  }));

  // ── Show last 7 days of the 30-day trend for chart display ───────────────────
  const chartTrend = weeklyTrend.slice(-7);

  // ── Overall workload % ─────────────────────────────────────────────────────
  const overallWorkload = staffWorkload.length > 0
    ? Math.round((totalJobs / (staffWorkload.length * 8)) * 100)
    : 0;

  // ── Modal form state ───────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title: '',
    managerName: '',
    tenantId: '',
    address: '',
    contactPhone: '',
    description: '',
    durationHours: '1.5',
    assignedStaffId: '',
    section: 'Quotes',
  });

  const handleTenantSelect = (selectedId) => {
    const tenant = tenants.find(t => String(t.id) === String(selectedId));
    setForm(prev => ({
      ...prev,
      tenantId: selectedId,
      address: tenant?.address || '',
      contactPhone: tenant?.phone || '',
      managerName: prev.managerName || tenant?.name || '',
    }));
  };

  const handleSectionChange = async (jobId, newSection) => {
    try {
      await jobService.moveJobStage(jobId, newSection);
      if (selectedJob?.id === jobId) setSelectedJob(prev => ({ ...prev, section: newSection }));
      await loadStats(false);
      showToast(`✓ Job moved to "${newSection}".`);
    } catch (err) {
      showToast(err.message || 'Failed to update job stage.', 'error');
    }
  };

  const handleStaffChange = async (jobId, staffId) => {
    try {
      await jobService.updateJobStatus(jobId, { assignedStaffId: staffId || null });
      await loadStats(false);
      showToast('✓ Technician assigned successfully.');
    } catch (err) {
      showToast(err.message || 'Failed to update assigned staff.', 'error');
    }
  };

  const handleCreateJob = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) { showToast('Job Title is mandatory.', 'error'); return; }
    if (!form.address.trim()) { showToast('Full Address is mandatory.', 'error'); return; }

    try {
      const tenant = tenants.find(t => String(t.id) === String(form.tenantId));
      const payload = {
        title: form.title.trim(),
        manager_name: form.managerName.trim() || undefined,
        resident_id: form.tenantId || undefined,
        resident_name: tenant?.name || form.managerName || 'Resident',
        contact_phone: form.contactPhone.trim() || tenant?.phone || '',
        property_address: form.address.trim(),
        description: form.description.trim() || undefined,
        duration_hours: parseFloat(form.durationHours) || 1.5,
        assigned_staff_id: form.assignedStaffId || undefined,
        section: form.section || 'Quotes',
      };

      await jobService.createJob(payload);

      // Refresh stats + job list after creation
      await Promise.all([loadStats(false), loadSupportingData()]);

      setNewModalOpen(false);
      setForm({ title: '', managerName: '', tenantId: '', address: '', contactPhone: '', description: '', durationHours: '1.5', assignedStaffId: '', section: 'Quotes' });
      showToast('✓ New maintenance job created successfully!');
    } catch (err) {
      showToast(err.message || 'Failed to create work order.', 'error');
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
      showToast('✓ Booking link generated and copied to clipboard!');
    } catch (err) {
      showToast(err.message || 'Failed to generate booking link', 'error');
    }
  };

  const filteredRecentJobs = recentJobs.filter(j =>
    (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const timeAgo = (date) => {
    if (!date) return '';
    const now = new Date();
    const d = new Date(date);
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const sectionBadge = {
    'Quotes':              'bg-sky-100 text-sky-800 border-sky-200',
    'Completed Quotes':    'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Jobs Waiting Booking':'bg-amber-100 text-amber-800 border-amber-200',
    'Jobs':                'bg-blue-100 text-blue-800 border-blue-200',
    'Completed Jobs':      'bg-purple-100 text-purple-800 border-purple-200',
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-full overflow-x-hidden text-slate-800">

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#00204a] tracking-tight leading-tight">
            Maintenance Dashboard
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage jobs, quotes, bookings, residents, and staff availability
            </p>
            {lastRefreshed && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                Updated {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search jobs, tenants..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] shadow-xs"
            />
          </div>

          {/* Manual Refresh */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loadStats(true)}
            disabled={loading}
            title="Refresh dashboard data"
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all cursor-pointer flex-shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </motion.button>

          {/* New Job */}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setNewModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer flex-shrink-0"
          >
            <Plus size={18} /> New Maintenance Job
          </motion.button>
        </div>
      </div>

      {/* ── Stat Cards (6 cards) ─────────────────────────────────────────── */}
      {loading && !stats ? (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4"
        >
          {/* Card 1: Active Quotes */}
          <motion.div
            variants={staggerItem} whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => navigate('/maintenance/pipeline?stage=Quotes')}
            className="bg-white border border-slate-200 hover:border-sky-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Active Quotes</p>
                <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{quotesCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                <FileText size={20} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-sky-600 mt-2">↑ Pending photos/quote</p>
          </motion.div>

          {/* Card 2: Active Jobs */}
          <motion.div
            variants={staggerItem} whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => navigate('/maintenance/pipeline?stage=Jobs')}
            className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Active Jobs</p>
                <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{activeJobsCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Wrench size={20} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-blue-600 mt-2">↑ In progress today</p>
          </motion.div>

          {/* Card 3: Completed Jobs */}
          <motion.div
            variants={staggerItem} whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => navigate('/maintenance/pipeline?stage=Completed Jobs')}
            className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Completed Jobs</p>
                <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{completedJobsCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={20} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-emerald-600 mt-2">↑ 100% sign-off rate</p>
          </motion.div>

          {/* Card 4: Waiting Booking */}
          <motion.div
            variants={staggerItem} whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => navigate('/maintenance/pipeline?stage=Jobs Waiting Booking')}
            className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Waiting Booking</p>
                <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{waitingBookingCount}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Clock size={20} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-amber-600 mt-2">↓ SMS link sent to tenant</p>
          </motion.div>

          {/* Card 5: Active Technicians */}
          <motion.div
            variants={staggerItem} whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => {
              const el = document.getElementById('staff-workload-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-white border border-slate-200 hover:border-purple-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Technicians</p>
                <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{staffWorkload.length}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-purple-600 mt-2">↑ {staffWorkload.length} Active technicians</p>
          </motion.div>

          {/* Card 6: Pending Quote Requests (NEW) */}
          <motion.div
            variants={staggerItem} whileHover={{ scale: 1.02, y: -2 }}
            onClick={() => navigate('/maintenance/quote-requests')}
            className="bg-white border border-slate-200 hover:border-rose-400 rounded-2xl p-4 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Quote Requests</p>
                <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{pendingQuoteRequests}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                <MessageSquare size={20} />
              </div>
            </div>
            <p className="text-[11px] font-bold text-rose-600 mt-2">
              {pendingQuoteRequests > 0 ? '⚠ Awaiting resident photos' : '✓ All requests handled'}
            </p>
          </motion.div>
        </motion.div>
      )}

      {/* ── Analytics Charts ────────────────────────────────────────────────── */}
      <motion.div
        variants={slideInBottom}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Weekly AreaChart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#00204a] flex items-center gap-2">
                <TrendingUp size={18} className="text-sky-600" /> Weekly Maintenance Volume & Jobs Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Daily incoming quotes vs scheduled & completed jobs (last 30 days)</p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              20 Jobs/Day Capacity
            </span>
          </div>

          {loading && !stats ? <SkeletonChart height={220} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartTrend} margin={{ top: 10, right: 10, left: -25, bottom: 15 }}>
                <defs>
                  <linearGradient id="quotesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00204a" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00204a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="jobsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="quotes"    stroke="#00204a" strokeWidth={2.5} fillOpacity={1} fill="url(#quotesGrad)" name="Quotes Received" />
                <Area type="monotone" dataKey="completed" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#jobsGrad)"   name="Completed Jobs" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category PieChart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#00204a] mb-1">Maintenance Categories</h3>
            <p className="text-xs text-slate-500 mb-3 font-medium">Job volume distribution by trade</p>

            {loading && !stats ? <SkeletonChart height={150} /> : (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto pr-1">
            {categoryBreakdown.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-700 font-medium truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}</span>
                </span>
                <span className="font-bold text-slate-900 ml-2 flex-shrink-0">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Staff Workload Section ────────────────────────────────────────── */}
      <motion.div
        id="staff-workload-section"
        variants={slideInBottom}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#00204a] flex items-center gap-2">
              <Users size={18} className="text-purple-600" /> Staff Workload & Availability ({staffWorkload.length} Technicians)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Live capacity distribution and shift availability</p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 w-fit">
            Overall Workload: {overallWorkload}% Allocated
          </span>
        </div>

        {loading && !stats ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7"><SkeletonChart height={175} /></div>
            <div className="lg:col-span-5 space-y-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Bar Chart */}
            <div className="lg:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700">Workload Bar Graph</span>
                <span className="text-[10px] text-slate-500 font-normal">Active Jobs / Staff</span>
              </div>

              {staffBarData.length === 0 ? (
                <div className="h-[175px] flex items-center justify-center text-xs text-slate-400">
                  No staff data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={175}>
                  <BarChart data={staffBarData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-xl text-xs space-y-0.5 text-slate-800">
                              <p className="font-bold text-slate-900">{d.fullName}</p>
                              <p className="text-sky-700 font-semibold">{d.jobs} Active Jobs</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="jobs" radius={[6, 6, 0, 0]}>
                      {staffBarData.map((s, index) => (
                        <Cell key={`cell-${index}`} fill={s.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Live Staff Availability */}
            <div className="lg:col-span-5 space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">Technician Availability</span>
                <span className="text-[10px] text-slate-400 font-mono">Live Status</span>
              </div>

              {staffWorkload.length === 0 ? (
                <div className="text-xs text-slate-400 text-center py-6">
                  No technicians added yet
                </div>
              ) : staffWorkload.map(staff => {
                const hasLeave = staff.unavailable && staff.unavailable.length > 0;
                return (
                  <div
                    key={staff.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 hover:border-slate-300 transition-all text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs"
                        style={{ backgroundColor: staff.color || '#a855f7' }}
                      >
                        {staff.name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-slate-900 truncate leading-tight">{staff.name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{(staff.role || '').split('&')[0]}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                        {staff.activeJobs} Jobs
                      </span>
                      {hasLeave ? (
                        <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> On Leave
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Available
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Recent Jobs List ─────────────────────────────────────────────── */}
      {recentJobs.length > 0 && (
        <motion.div
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-[#00204a] flex items-center gap-2">
              <Wrench size={18} className="text-blue-600" /> Recent Work Orders
            </h3>
            <button
              onClick={() => navigate('/maintenance/pipeline')}
              className="text-xs font-bold text-[#00204a] hover:text-blue-700 flex items-center gap-1 transition-colors"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          <div className="space-y-2">
            {(search ? filteredRecentJobs : recentJobs).slice(0, 8).map(job => (
              <div
                key={job.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all gap-3 cursor-pointer"
                onClick={() => navigate('/maintenance/pipeline')}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: job.staffColor || '#009bf2' }}
                  >
                    {(job.title || 'J').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{job.title}</p>
                    <p className="text-[10px] text-slate-500 truncate">{job.tenantName} • {job.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sectionBadge[job.section] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {job.section}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:inline">{timeAgo(job.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Workflow Pipeline Quick Access ──────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-[#00204a] flex items-center gap-2">
              Asana Workflow Pipeline ({totalJobs} Active Work Orders)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage quotes, booked repairs, completed history, and resident scheduling in a dedicated bounded board
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/maintenance/pipeline')}
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 flex-shrink-0 self-start sm:self-auto"
        >
          <span>Open Full Workflow Pipeline</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* ── Create New Job Modal ─────────────────────────────────────────── */}
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
            onChange={e => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Repaint Bathroom / AC Duct Swap"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Resident / Tenant Name *"
              name="managerName"
              value={form.managerName}
              onChange={e => setForm({ ...form, managerName: e.target.value })}
              placeholder="e.g. Robert Fox / Jenny Wilson"
            />
            <FormField
              label="Contact Phone / Email *"
              name="contactPhone"
              value={form.contactPhone}
              onChange={e => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="e.g. 0121 270 2633"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              label="Property Address / Unit Number *"
              name="address"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. Apt 3110 Fabrick Square, B12 0AF"
            />
            <SelectField
              label="Hours Required *"
              name="durationHours"
              value={form.durationHours}
              onChange={e => setForm({ ...form, durationHours: e.target.value })}
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
              onChange={e => setForm({ ...form, assignedStaffId: e.target.value })}
              options={staffWorkload.map(s => ({ value: s.profileId || s.id, label: `👤 ${s.name} (${(s.role || '').split(' ')[0]})` }))}
            />
            <SelectField
              label="Pipeline Stage"
              name="section"
              value={form.section}
              onChange={e => setForm({ ...form, section: e.target.value })}
              options={SECTIONS.map(s => ({ value: s.id, label: s.label }))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">Work Description *</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe works required (e.g. Repaint whole property, walls, ceilings, skirting boards)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white font-medium"
            />
          </div>
        </div>
      </FormModal>

      {/* ── Toast ───────────────────────────────────────────────────────── */}
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

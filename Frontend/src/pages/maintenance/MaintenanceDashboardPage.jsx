import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText, CheckCircle2, Wrench, Clock, Plus, Search, User, MapPin,
  Calendar as CalendarIcon, ArrowRight, Shield, DollarSign, Users,
  TrendingUp, TrendingDown, Sparkles, Filter, Copy, Check, ExternalLink,
  Boxes, AlertTriangle
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { jobService } from '../../services/jobService';
import { staffService } from '../../services/staffService';
import { tenantService } from '../../services/tenantService';
import { bookingService } from '../../services/bookingService';
import { quoteService } from '../../services/quoteService';
import FormModal from '../../components/modals/FormModal';
import { FormField, SelectField } from '../../components/forms/FormFields';
import { staggerContainer, staggerItem, slideInBottom } from '../../utils/motionVariants';

// Recharts Analytics Data Structure (Rendered dynamically when real API data returns)

const SECTIONS = [
  { id: 'Quotes', label: 'Quotes', icon: FileText, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' },
  { id: 'Completed Quotes', label: 'Completed Quotes', icon: CheckCircle2, color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  { id: 'Jobs', label: 'Jobs', icon: Wrench, color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' },
  { id: 'Completed Jobs', label: 'Completed Jobs', icon: CheckCircle2, color: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10' },
  { id: 'Jobs Waiting Booking', label: 'Jobs Waiting Booking', icon: Clock, color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' },
];

export default function MaintenanceDashboardPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [search, setSearch] = useState('');
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [copiedToken, setCopiedToken] = useState(null);
  const [mobileSectionTab, setMobileSectionTab] = useState('Quotes');

  // Load API Data
  useEffect(() => {
    const loadDashboardData = async () => {
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
    loadDashboardData();
  }, []);

  const initialFormState = {
    title: '',
    managerName: '',
    tenantId: tenants[0]?.id || '',
    address: tenants[0]?.address || '',
    contactPhone: tenants[0]?.phone || '',
    description: '',
    durationHours: '1.5',
    assignedStaffId: staffList[0]?.id || '',
    section: 'Quotes',
  };

  const [form, setForm] = useState(initialFormState);

  const handleTenantSelect = (selectedId) => {
    const tenant = tenants.find((t) => t.id === selectedId);
    setForm((prev) => ({
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
      const jobsRes = await jobService.getJobs();
      setJobs(Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || []);
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob((prev) => ({ ...prev, section: newSection }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update job stage');
    }
  };

  const handleStaffChange = async (jobId, staffId) => {
    try {
      await jobService.updateJobStatus(jobId, { assignedStaffId: staffId || null });
      const jobsRes = await jobService.getJobs();
      setJobs(Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || []);
    } catch (err) {
      alert(err.message || 'Failed to update assigned staff.');
    }
  };

  const handleCreateJob = async (e) => {
    e?.preventDefault();
    if (!form.title.trim()) {
      alert('Job Title is mandatory.');
      return;
    }
    if (!form.address.trim()) {
      alert('Full Address is mandatory.');
      return;
    }

    try {
      const tenant = tenants.find((t) => String(t.id) === String(form.tenantId));

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
      const jobsRes = await jobService.getJobs();
      setJobs(Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || []);
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
      alert(`Booking Link copied to clipboard!\n\n${url}`);
    } catch (err) {
      alert(err.message || 'Failed to generate booking link');
    }
  };

  const filteredJobs = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
    (j.address || '').toLowerCase().includes(search.toLowerCase())
  );

  const quotesCount = jobs.filter((j) => j.section === 'Quotes').length;
  const activeJobsCount = jobs.filter((j) => j.section === 'Jobs').length;
  const completedJobsCount = jobs.filter((j) => j.section === 'Completed Jobs').length;
  const waitingBookingCount = jobs.filter((j) => j.section === 'Jobs Waiting Booking').length;

  // Calculate dynamic weekly trend
  const weeklyJobsTrend = [
    { day: 'Mon', quotes: 0, bookedJobs: 0, completed: 0 },
    { day: 'Tue', quotes: 0, bookedJobs: 0, completed: 0 },
    { day: 'Wed', quotes: 0, bookedJobs: 0, completed: 0 },
    { day: 'Thu', quotes: 0, bookedJobs: 0, completed: 0 },
    { day: 'Fri', quotes: 0, bookedJobs: 0, completed: 0 },
    { day: 'Sat', quotes: 0, bookedJobs: 0, completed: 0 },
    { day: 'Sun', quotes: 0, bookedJobs: 0, completed: 0 },
  ];

  jobs.forEach(j => {
    if (!j.createdAt) return;
    const date = new Date(j.createdAt);
    const dayIndex = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayName = daysMap[dayIndex];
    const trendDay = weeklyJobsTrend.find(d => d.day === dayName);
    if (trendDay) {
      if (j.section === 'Quotes') trendDay.quotes += 1;
      else if (j.section === 'Jobs') trendDay.bookedJobs += 1;
      else if (j.section === 'Completed Jobs') trendDay.completed += 1;
    }
  });

  const catCounts = {
    'Plumbing & Leaks': 0,
    'Electrical & Lighting': 0,
    'HVAC & Air Con': 0,
    'Locks & Carpentry': 0,
    'Appliance Repair': 0
  };

  jobs.forEach(j => {
    const text = `${j.title} ${j.description}`.toLowerCase();
    if (text.includes('plumb') || text.includes('leak') || text.includes('pipe') || text.includes('water') || text.includes('drain') || text.includes('heater')) {
      catCounts['Plumbing & Leaks'] += 1;
    } else if (text.includes('electr') || text.includes('light') || text.includes('wiring') || text.includes('power') || text.includes('bulb') || text.includes('fuse')) {
      catCounts['Electrical & Lighting'] += 1;
    } else if (text.includes('hvac') || text.includes('air con') || text.includes('heating') || text.includes('ac ') || text.includes('cooler')) {
      catCounts['HVAC & Air Con'] += 1;
    } else if (text.includes('lock') || text.includes('key') || text.includes('door') || text.includes('carpentry') || text.includes('wood') || text.includes('hinge')) {
      catCounts['Locks & Carpentry'] += 1;
    } else {
      catCounts['Appliance Repair'] += 1; // Default
    }
  });

  const totalCategorized = Object.values(catCounts).reduce((a, b) => a + b, 0) || 1;
  const categoryBreakdown = [
    { name: 'Plumbing & Leaks', value: Math.round((catCounts['Plumbing & Leaks'] / totalCategorized) * 100), color: '#009bf2' },
    { name: 'Electrical & Lighting', value: Math.round((catCounts['Electrical & Lighting'] / totalCategorized) * 100), color: '#10b981' },
    { name: 'HVAC & Air Con', value: Math.round((catCounts['HVAC & Air Con'] / totalCategorized) * 100), color: '#f59e0b' },
    { name: 'Locks & Carpentry', value: Math.round((catCounts['Locks & Carpentry'] / totalCategorized) * 100), color: '#a855f7' },
    { name: 'Appliance Repair', value: Math.round((catCounts['Appliance Repair'] / totalCategorized) * 100), color: '#ec4899' },
  ];

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden text-slate-800">
      {/* Responsive Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#00204a] tracking-tight leading-tight">
            Maintenance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage jobs, quotes, bookings, residents, and staff availability
          </p>
        </div>

        {/* Fully Responsive Search and Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, tenants..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00204a] shadow-xs"
            />
          </div>

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

      {/* Top 5 Stat Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        {/* Card 1: Active Quotes */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate('/maintenance/pipeline?stage=Quotes')}
          className="bg-white border border-slate-200 hover:border-sky-400 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Active Quotes</p>
              <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{quotesCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 flex-shrink-0 group-hover:scale-110 transition-transform">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-sky-600 mt-2.5">↑ Pending photos/quote</p>
        </motion.div>

        {/* Card 2: Active Jobs */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate('/maintenance/pipeline?stage=Jobs')}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Active Jobs</p>
              <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{activeJobsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 flex-shrink-0 group-hover:scale-110 transition-transform">
              <Wrench size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-blue-600 mt-2.5">↑ In progress today</p>
        </motion.div>

        {/* Card 3: Completed Jobs */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate('/maintenance/pipeline?stage=Completed Jobs')}
          className="bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Completed Jobs</p>
              <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{completedJobsCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-emerald-600 mt-2.5">↑ 100% Sign-off rate</p>
        </motion.div>

        {/* Card 4: Jobs Waiting Booking */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => navigate('/maintenance/pipeline?stage=Jobs Waiting Booking')}
          className="bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Waiting Booking</p>
              <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{waitingBookingCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 flex-shrink-0 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-amber-600 mt-2.5">↓ SMS link sent to tenant</p>
        </motion.div>

        {/* Card 5: Staff Workload */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.02, y: -2 }}
          onClick={() => {
            const el = document.getElementById('staff-workload-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white border border-slate-200 hover:border-purple-400 rounded-2xl p-4.5 flex flex-col justify-between shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-[#00204a] transition-colors">Active Technicians</p>
              <p className="text-2xl sm:text-3xl font-black text-[#00204a] mt-1">{staffList.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 flex-shrink-0 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <p className="text-xs font-bold text-purple-600 mt-2.5">↑ {staffList.length} Technicians active</p>
        </motion.div>
      </motion.div>

      {/* Middle Section: Analytics Charts (Responsive Layout) */}
      <motion.div
        variants={slideInBottom}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Weekly Jobs AreaChart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#00204a] flex items-center gap-2">
                <TrendingUp size={18} className="text-sky-600" /> Weekly Maintenance Volume & Jobs Trend
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Daily incoming quotes vs scheduled & completed jobs</p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              20 Jobs/Day Capacity
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyJobsTrend} margin={{ top: 10, right: 10, left: -25, bottom: 15 }}>
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
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
              />
              <Area type="monotone" dataKey="quotes" stroke="#00204a" strokeWidth={2.5} fillOpacity={1} fill="url(#quotesGrad)" name="Quotes Received" />
              <Area type="monotone" dataKey="completed" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#jobsGrad)" name="Completed Jobs" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Maintenance Categories PieChart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#00204a] mb-1">Maintenance Categories</h3>
            <p className="text-xs text-slate-500 mb-3 font-medium">Job volume distribution by trade</p>

            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '12px', color: '#0f172a' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
            {categoryBreakdown.map((item) => (
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

      {/* Staff Workload Distribution & Live Availability (Split View) */}
      <motion.div
        variants={slideInBottom}
        initial="hidden"
        animate="visible"
        className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[#00204a] flex items-center gap-2">
              <Users size={18} className="text-purple-600" /> Staff Workload & Availability ({staffList.length} Technicians)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Live capacity distribution and shift availability</p>
          </div>
          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-lg border border-purple-200 w-fit">
            Overall Workload: {staffList.length > 0 ? Math.round((jobs.length / (staffList.length * 8)) * 100) : 0}% Allocated
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column (7 cols = ~58% width): Compact Bar Chart */}
          <div className="lg:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Workload Bar Graph</span>
              <span className="text-[10px] text-slate-500 font-normal">Assigned Jobs / Staff</span>
            </div>

            <ResponsiveContainer width="100%" height={175}>
              <BarChart
                data={staffList.map((s) => ({
                  name: s.name.split(' ')[0],
                  fullName: s.name,
                  jobs: jobs.filter((j) => j.assignedStaffId === s.id).length,
                  color: s.color || '#a855f7',
                }))}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
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
                  {staffList.map((s, index) => (
                    <Cell key={`cell-${index}`} fill={s.color || '#a855f7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Right Column (5 cols = ~42% width): Live Staff Availability Status */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700">Technician Availability</span>
              <span className="text-[10px] text-slate-400 font-mono">Live Status</span>
            </div>

            {staffList.map((staff) => {
              const assignedCount = jobs.filter((j) => j.assignedStaffId === staff.id).length;
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
                      <p className="text-[10px] text-slate-500 truncate">{staff.role.split('&')[0]}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                      {assignedCount} Jobs
                    </span>

                    {hasLeave ? (
                      <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1" title={staff.unavailable[0]?.reason}>
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
      </motion.div>

      {/* Workflow Pipeline Quick Access Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-base font-black text-[#00204a] flex items-center gap-2">
              Asana Workflow Pipeline ({jobs.length} Active Work Orders)
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

      {/* New Job Modal */}
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

      {/* View / Manage Job Details Modal */}
      <FormModal
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
        title={selectedJob?.title || 'Work Order Details'}
      >
        {selectedJob && (
          <div className="space-y-4 text-xs">
            {/* Top Meta Bar */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              {/* Assigned to */}
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Assigned to</p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {selectedJob.assignedStaffName ? selectedJob.assignedStaffName : 'Booked In'}
                  </p>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center flex-shrink-0">
                  <CalendarIcon size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Due date</p>
                  <p className="text-sm font-extrabold text-slate-900">
                    {selectedJob.scheduledDate || '15 May'}
                  </p>
                </div>
              </div>
            </div>

            {/* Projects & Stage Pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-semibold">Projects:</span>
                <span className="px-3 py-1 rounded-lg bg-sky-100 text-sky-800 font-bold border border-sky-200 text-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-600" />
                  {selectedJob.section}
                </span>
              </div>
              <span className="text-[11px] text-amber-700 font-mono font-bold">⏱ {selectedJob.durationHours}h Allocated</span>
            </div>

            {/* Structured Work Order Details Block */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Work Order Description</h4>
                <span className="text-slate-400 text-[10px]">Reference #{selectedJob.id}</span>
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {selectedJob.managerName || 'Maria'}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-slate-500 font-bold">Full Address:</p>
                <p className="text-slate-800 font-medium leading-snug">
                  {selectedJob.address}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-slate-500 font-bold">Contact:</p>
                <p className="text-sky-700 font-bold">
                  {selectedJob.contactPhone || 'Martin & Co Birmingham city (0121 270 2633)'}
                </p>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-200">
                <p className="text-slate-500 font-bold">Description Scope:</p>
                <div className="p-3 rounded-xl bg-white text-slate-800 leading-relaxed text-xs border border-slate-200 font-normal whitespace-pre-line shadow-2xs">
                  {selectedJob.description}
                </div>
              </div>
            </div>

            {/* Staff Calendar Allocation Dropdown at Bottom */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                📅 Allocate Job to Staff Calendar:
              </label>
              <select
                value={selectedJob.assignedStaffId || ''}
                onChange={(e) => handleStaffChange(selectedJob.id, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#00204a] focus:bg-white"
              >
                <option value="">— Select Staff —</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.profileId || s.id}>
                    👤 {s.name} — {s.role}
                  </option>
                ))}
              </select>
            </div>

            {/* Bottom Workflow Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const linkRes = await jobService.generatePublicLink(selectedJob.id, 'QUOTE_UPLOAD');
                    const token = linkRes.data?.secureToken || selectedJob.secureToken;
                    const url = `${window.location.origin}/quote-upload/${token}`;
                    navigator.clipboard.writeText(url);
                    alert(`Request link generated and copied to clipboard!\n\n${url}`);
                  } catch (err) {
                    alert(err.message || 'Failed to generate link.');
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-purple-900 bg-purple-100 hover:bg-purple-200 border border-purple-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                📷 Request Photos & Information
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleSectionChange(selectedJob.id, 'Completed Quotes');
                  alert(`Job quote marked as sent! Moved to "Completed Quotes".`);
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



    </div>
  );
}

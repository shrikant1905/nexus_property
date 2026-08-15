import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Search, Calendar, MapPin, User, FileText,
  Star, Image as ImageIcon, ExternalLink, ShieldCheck, Filter
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';

export default function MaintenanceStaffHistoryPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  useEffect(() => {
    const loadHistoryData = async () => {
      try {
        const res = await jobService.getJobs();
        setJobs(Array.isArray(res) ? res : res?.data || []);
      } catch (err) {
        setJobs([]);
      }
    };
    loadHistoryData();
  }, []);

  // Filter completed jobs
  const completedJobs = jobs.filter(
    (j) => j.section === 'Completed Jobs' || j.section === 'Completed Quotes'
  );

  const filtered = completedJobs.filter((j) => {
    const matchesSearch =
      (j.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.tenantName || '').toLowerCase().includes(search.toLowerCase()) ||
      (j.address || '').toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });


  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-[#00204a] tracking-tight flex items-center gap-2">
            <CheckCircle2 size={24} className="text-emerald-600" /> Completed Repairs & Sign-off History
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Audit log of finished maintenance work orders, sign-offs, and proof photos</p>
        </div>
        <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-300 w-fit shadow-2xs">
          Total Completed: {completedJobs.length} Repairs
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by job title, resident, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#00204a] focus:bg-white font-medium"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 self-end sm:self-auto font-medium">
          <Filter size={14} className="text-slate-400" /> Filter Range:
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Time</option>
            <option value="THIS_MONTH">This Month (August 2026)</option>
            <option value="LAST_MONTH">July 2026</option>
          </select>
        </div>
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center space-y-2">
          <CheckCircle2 size={40} className="mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-[#00204a]">No Completed History Found</h3>
          <p className="text-xs text-slate-500 font-medium">Completed jobs will appear here once marked finished.</p>
        </div>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">
          {filtered.map((job) => (
            <motion.div
              key={job.id}
              variants={staggerItem}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-[#00204a]/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-300">
                      SIGNED OFF
                    </span>
                    <span className="text-xs font-mono text-slate-400">ID: #{job.id}</span>
                  </div>
                  <h3 className="text-base font-black text-[#00204a] mt-1">{job.title}</h3>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 w-fit">
                  <Calendar size={14} className="text-slate-400" /> Completed on {job.createdAt || '2026-08-05'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-slate-500 font-semibold text-[11px]">Resident & Contact:</p>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User size={13} className="text-slate-400" /> {job.tenantName}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-slate-500 font-semibold text-[11px]">Property Location:</p>
                  <p className="text-slate-700 font-medium flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" /> {job.address}
                  </p>
                </div>
              </div>

              {/* Work Sign-off Details */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-700">Technician Sign-off Notes & Replaced Parts:</p>
                <div className="p-3 rounded-xl bg-slate-50 text-slate-700 text-xs leading-relaxed border border-slate-200 space-y-1 font-medium">
                  <p className="text-emerald-800 font-bold">✓ Repair completed according to safety standards.</p>
                  <p className="text-slate-600">Replaced faulty wiring harness / pipe fitting. Verified pressure seals and tested circuit line.</p>
                </div>
              </div>

              {/* Resident Rating */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  <span className="text-slate-900 font-bold ml-1 text-xs">5.0 Resident Rating</span>
                </div>

                <span className="text-slate-500 text-[11px] font-medium">Assigned Staff: {job.assignedStaffName || 'Dave Miller'}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

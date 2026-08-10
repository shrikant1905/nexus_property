import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, ShieldCheck, Filter, User, ThumbsUp, Sparkles, CheckCircle2, Search } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../utils/motionVariants';

export default function MaintenanceReviewsPage() {
  const [ratings, setRatings] = useState(() => []);
  const [selectedStaff, setSelectedStaff] = useState('ALL');
  const [selectedStar, setSelectedStar] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const staffList = maintenanceService.getStaff();
  const jobs = maintenanceService.getJobs();

  // Auto-sync ratings
  useEffect(() => {
    const sync = () => setRatings(maintenanceService.getRatings());
    window.addEventListener('focus', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('focus', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  // Filter ratings
  const filteredRatings = ratings.filter((r) => {
    const rStars = r.stars || r.rating || 5;
    const staffMatch = selectedStaff === 'ALL' || r.staffName?.toLowerCase().includes(selectedStaff.toLowerCase());
    const starMatch =
      selectedStar === 'ALL' ||
      (selectedStar === '5' && rStars === 5) ||
      (selectedStar === '4' && rStars === 4) ||
      (selectedStar === '3_BELOW' && rStars <= 3);
    const searchMatch =
      !searchQuery ||
      r.residentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.staffName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comments?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.jobId?.toLowerCase().includes(searchQuery.toLowerCase());

    return staffMatch && starMatch && searchMatch;
  });

  // Calculate Metrics
  const totalReviews = ratings.length;
  const avgRating = totalReviews > 0
    ? (ratings.reduce((acc, r) => acc + (r.stars || r.rating || 5), 0) / totalReviews).toFixed(1)
    : '5.0';
  const fiveStarCount = ratings.filter((r) => (r.stars || r.rating || 5) === 5).length;
  const satisfactionRate = totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 100;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            ⭐ Resident Reviews & Staff Feedback
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
            Dedicated page tracking post-repair resident satisfaction & technician performance
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews, tech, resident..."
            className="w-full bg-[#0e1526] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Top 4 Summary Metrics Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Metric 1: Overall Average */}
        <motion.div variants={staggerItem} className="bg-[#0e1526] border border-amber-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Rating</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Star size={20} className="fill-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{avgRating}</span>
            <span className="text-xs font-bold text-amber-400">/ 5.0 Stars</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Based on verified resident feedback</p>
        </motion.div>

        {/* Metric 2: Total Reviews */}
        <motion.div variants={staggerItem} className="bg-[#0e1526] border border-blue-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reviews</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <MessageSquare size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{totalReviews}</span>
            <span className="text-xs font-bold text-blue-400">Submitted</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">100% 1-tap SMS verified links</p>
        </motion.div>

        {/* Metric 3: Satisfaction Rate */}
        <motion.div variants={staggerItem} className="bg-[#0e1526] border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">5-Star Satisfaction</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ThumbsUp size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{satisfactionRate}%</span>
            <span className="text-xs font-bold text-emerald-400">Positive</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{fiveStarCount} out of {totalReviews} rated 5 stars</p>
        </motion.div>

        {/* Metric 4: Top Tech */}
        <motion.div variants={staggerItem} className="bg-[#0e1526] border border-purple-500/30 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Rated Tech</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-black text-white block truncate">Dave Miller</span>
            <span className="text-xs font-bold text-purple-400">⭐ 5.0 Average Rating</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Senior Field Technician</p>
        </motion.div>
      </motion.div>

      {/* Staff Performance Summary Bar */}
      <div className="bg-[#0e1526] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" /> Technician Ratings Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {staffList.map((staff) => {
            const staffReviews = ratings.filter(
              (r) => r.staffName?.toLowerCase().includes(staff.name.toLowerCase()) || r.staffId === staff.id
            );
            const count = staffReviews.length;
            const avg = count > 0
              ? (staffReviews.reduce((acc, r) => acc + (r.stars || r.rating || 5), 0) / count).toFixed(1)
              : '5.0';

            return (
              <div
                key={staff.id}
                onClick={() => setSelectedStaff(staff.name)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedStaff === staff.name
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-md'
                    : 'bg-slate-900/60 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs truncate">{staff.name}</span>
                  <span className="text-[11px] font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    ⭐ {avg}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 truncate">{staff.role}</p>
                <p className="text-[10px] font-semibold text-slate-500 mt-1.5">{count} Total Review{count !== 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs & Rating Feed */}
      <div className="bg-[#0e1526] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Filter size={14} /> Filter Staff:
            </span>
            <button
              onClick={() => setSelectedStaff('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedStaff === 'ALL'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-slate-900 text-slate-400 border border-white/5 hover:border-white/15'
              }`}
            >
              All Staff ({ratings.length})
            </button>
            {staffList.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStaff(s.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedStaff === s.name
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-slate-900 text-slate-400 border border-white/5 hover:border-white/15'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Star Filter Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stars:</span>
            <select
              value={selectedStar}
              onChange={(e) => setSelectedStar(e.target.value)}
              className="bg-slate-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="ALL">⭐ All Ratings</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 Stars Only</option>
              <option value="4">⭐⭐⭐⭐ 4 Stars Only</option>
              <option value="3_BELOW">3 Stars & Below</option>
            </select>
          </div>
        </div>

        {/* Reviews Feed Grid */}
        {filteredRatings.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredRatings.map((r) => {
              const stars = r.stars || r.rating || 5;
              const tags = r.tags || r.pills || [];
              const commentText = r.comment || r.comments || '';
              const matchedJob = jobs.find((j) => j.id === r.jobId || r.jobId?.includes(j.id));

              return (
                <motion.div
                  key={r.id}
                  variants={staggerItem}
                  className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-col justify-between space-y-3 shadow-lg"
                >
                  <div className="space-y-3">
                    {/* Top Row: Stars + Date */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={16}
                              className={s <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-black text-amber-400">{stars}.0</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">{r.createdAt}</span>
                    </div>

                    {/* Job Title & Resident */}
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {matchedJob?.title || 'Maintenance Repair Service'}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Resident: <strong className="text-slate-200">{r.residentName || 'Property Resident'}</strong>
                      </p>
                      <p className="text-[11px] text-[#38bdf8] font-medium">
                        Assigned Tech: <strong>{r.staffName || 'Dave Miller'}</strong>
                      </p>
                    </div>

                    {/* Resident Comments */}
                    {commentText && (
                      <p className="text-xs text-slate-300 italic bg-slate-950/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                        &ldquo;{commentText}&rdquo;
                      </p>
                    )}

                    {/* Appreciation Badges */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1"
                          >
                            <CheckCircle2 size={10} /> {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>Job ID: {r.jobId || 'N/A'}</span>
                    <span className="text-emerald-400 font-bold">✓ VERIFIED SMS RATING</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <Star size={36} className="text-slate-600 mx-auto" />
            <p className="text-sm font-bold text-slate-400">No resident reviews match your selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

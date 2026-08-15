import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Award, Star, Activity, AlertCircle, Users, CheckCircle2 } from 'lucide-react';
import { staffService } from '../../services/staffService';
import { slideInBottom } from '../../utils/motionVariants';

export default function MaintenanceKPIDashboardPage() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const staffRes = await staffService.getStaff();
        const list = Array.isArray(staffRes) ? staffRes : staffRes?.data || [];
        
        // Rely on real API data from backend
        const enhancedList = list.map((staff) => ({
          ...staff,
          kpiScore: staff.kpiScore || 0,
          jobsCompleted: staff.jobsCompleted || 0,
          revisitRate: staff.revisitRate || 0,
          rating: staff.rating || 0,
          trend: staff.trend || 'up',
        })).sort((a, b) => b.kpiScore - a.kpiScore);
        
        setStaffList(enhancedList);
      } catch (err) {
        console.error("Failed to load staff list for KPI Dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    loadStaff();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading KPI Data...</div>;
  }

  // Top Performers
  const topPerformers = staffList.slice(0, 3);
  const remainingStaff = staffList.slice(3);

  // Dynamic Summary Metrics
  const totalJobs = staffList.reduce((sum, staff) => sum + (Number(staff.jobsCompleted) || 0), 0);
  const avgRating = staffList.length ? (staffList.reduce((sum, staff) => sum + (Number(staff.rating) || 0), 0) / staffList.length).toFixed(1) : '0.0';
  const avgRevisitRate = staffList.length ? (staffList.reduce((sum, staff) => sum + (Number(staff.revisitRate) || 0), 0) / staffList.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#00204a] tracking-tight flex items-center gap-2">
          <Trophy className="text-amber-500" size={26} /> 
          Maintenance Staff Performance & KPI Leaderboard
        </h1>
        <p className="text-sm text-slate-500 mt-1 font-medium">
          Track and optimize technician performance, jobs completed, and quality ratings.
        </p>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Jobs Completed', value: totalJobs.toString(), sub: 'Across all technicians', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { title: 'Average Staff Rating', value: avgRating, sub: 'Out of 5.0 stars', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
          { title: 'Average Revisit Rate', value: `${avgRevisitRate}%`, sub: 'Current month average', icon: AlertCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
          { title: 'Active Technicians', value: staffList.length.toString(), sub: 'Registered in system', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            variants={slideInBottom}
            initial="hidden"
            animate="visible"
            custom={idx}
            className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
              <h3 className="text-2xl font-black text-[#00204a] mt-1">{stat.value}</h3>
              <p className="text-[10px] font-semibold text-slate-500 mt-1">{stat.sub}</p>
            </div>
            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Leaderboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Podium (Top 3) */}
        <motion.div
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          className="lg:col-span-1 space-y-4"
        >
          <h2 className="text-base font-black text-[#00204a] flex items-center gap-2">
            <Award className="text-amber-500" size={18} /> Top Performers This Month
          </h2>
          
          <div className="space-y-3">
            {topPerformers.map((staff, idx) => (
              <div 
                key={staff.id} 
                className={`p-4 rounded-2xl border flex items-center gap-4 relative overflow-hidden shadow-sm ${
                  idx === 0 ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' :
                  idx === 1 ? 'bg-gradient-to-br from-slate-50 to-gray-100 border-slate-300' :
                  'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
                }`}
              >
                {/* Ranking Number Background */}
                <div className="absolute -right-4 -bottom-6 text-9xl font-black opacity-[0.04] pointer-events-none">
                  {idx + 1}
                </div>
                
                <div className="flex-shrink-0 relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black text-white shadow-md z-10 ${
                    idx === 0 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                    idx === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                    'bg-gradient-to-r from-orange-400 to-orange-600'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx === 0 && <span className="absolute -top-2 -right-2 text-xl animate-bounce">👑</span>}
                </div>
                
                <div className="flex-1 z-10">
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">{staff.name}</h3>
                  <p className="text-[10px] font-bold text-slate-500">{staff.role}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs font-black text-[#00204a] bg-white/60 px-2 py-0.5 rounded shadow-2xs inline-block">
                      {staff.kpiScore} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Full Leaderboard Table */}
        <motion.div
          variants={slideInBottom}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col"
        >
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-black text-[#00204a] flex items-center gap-2">
              <Activity className="text-sky-600" size={18} /> Staff Performance Rankings
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#00204a] text-white font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center">Rank</th>
                  <th className="px-4 py-3">Technician</th>
                  <th className="px-4 py-3 text-right">Jobs Done</th>
                  <th className="px-4 py-3 text-right">Revisits</th>
                  <th className="px-4 py-3 text-right">Rating</th>
                  <th className="px-4 py-3 text-right">KPI Score</th>
                  <th className="px-4 py-3 text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {staffList.map((staff, idx) => (
                  <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3.5 text-center">
                      <span className="font-black text-[#00204a]">{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900">{staff.name}</p>
                      <p className="text-[10px] text-slate-500">{staff.role}</p>
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-600">
                      {staff.jobsCompleted}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-red-500">
                      {staff.revisitRate}%
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-amber-500 flex items-center justify-end gap-1">
                      {staff.rating} <Star size={10} className="fill-amber-500" />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="px-2 py-1 rounded bg-[#00204a] text-white font-black text-[11px] shadow-sm">
                        {staff.kpiScore}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {staff.trend === 'up' ? (
                        <TrendingUp size={16} className="text-emerald-500 mx-auto" />
                      ) : (
                        <TrendingDown size={16} className="text-red-500 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
        
      </div>
    </div>
  );
}

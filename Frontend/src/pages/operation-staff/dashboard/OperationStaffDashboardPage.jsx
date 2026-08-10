import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Wrench, Sparkles, LogIn, Eye, FileText,
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { staggerContainer, staggerItem, slideInBottom } from '../../../utils/motionVariants';

const revenueData = [
  { name: 'Sunset Villa', revenue: 7800 },
  { name: 'Bayfront PH', revenue: 11200 },
  { name: 'Ocean Breeze', revenue: 5400 },
  { name: 'Garden Estate', revenue: 6100 },
  { name: 'Harbor View', revenue: 4900 },
  { name: 'Palm Court', revenue: 4200 },
  { name: 'Downtown', revenue: 3500 },
];

const expenseCategories = [
  { name: 'Utilities', value: 3240, color: '#00d2ff' },
  { name: 'Maintenance', value: 2180, color: '#f59e0b' },
  { name: 'Cleaning', value: 4500, color: '#10b981' },
  { name: 'Supplies', value: 1890, color: '#a855f7' },
  { name: 'Marketing', value: 650, color: '#f43f5e' },
];

const profitTrend = [
  { month: 'Sep', revenue: 27000, expenses: 8000, profit: 19000 },
  { month: 'Oct', revenue: 31000, expenses: 9500, profit: 21500 },
  { month: 'Nov', revenue: 29000, expenses: 8800, profit: 20200 },
  { month: 'Dec', revenue: 36000, expenses: 11000, profit: 25000 },
  { month: 'Jan', revenue: 33000, expenses: 10200, profit: 22800 },
  { month: 'Feb', revenue: 35000, expenses: 10800, profit: 24200 },
  { month: 'Mar', revenue: 39000, expenses: 11500, profit: 27500 },
];

const occupancyTrend = [
  { month: 'Sep', rate: 78 },
  { month: 'Oct', rate: 82 },
  { month: 'Nov', rate: 75 },
  { month: 'Dec', rate: 91 },
  { month: 'Jan', rate: 84 },
  { month: 'Feb', rate: 88 },
  { month: 'Mar', rate: 86 },
];

const topVendors = [
  { name: 'Pro Clean', amount: 4500, max: 6000, color: '#f59e0b' },
  { name: 'FPL', amount: 3240, max: 6000, color: '#f59e0b' },
  { name: 'Amazon', amount: 1890, max: 6000, color: '#d1d5db' },
  { name: 'Home Depot', amount: 2180, max: 6000, color: '#f59e0b' },
  { name: 'Zone Water', amount: 950, max: 6000, color: '#f59e0b' },
];

const cleaningTasks = [
  { property: 'Sunset Villa', staff: 'Ana G.', date: '2026-03-06', status: 'In Progress', statusColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { property: 'Ocean Breeze Condo', staff: 'Luis M.', date: '2026-03-08', status: 'Completed', statusColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { property: 'Garden Estate', staff: 'Ana G.', date: '2026-03-07', status: 'Scheduled', statusColor: 'bg-slate-700/50 text-slate-300 border-slate-600/40' },
];

const recentArrivals = [
  { guest: 'Robert P.', property: 'Bayfront Penthouse', date: '2026-03-06', type: 'CHECK-IN', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { guest: 'Linda S.', property: 'Sunset Villa', date: '2026-03-05', type: 'CHECK-OUT', badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { guest: 'Mark T.', property: 'Beachfront Condo', date: '2026-03-06', type: 'CHECK-IN', badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
];

export default function OperationsDashboard() {
  const [timeframe, setTimeframe] = useState('This Month');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Operations Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Maintenance, cleaning, and guest operations</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-[#0b0f19] border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none cursor-pointer font-medium"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors cursor-pointer shadow-[0_4px_14px_rgba(0,155,242,0.3)]">
            <FileText size={16} /> Generate Report
          </button>
        </div>
      </div>

      {/* 4 Stat Cards matching Image 1 */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: Active Properties */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 30px rgba(6,182,212,0.25)' }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#0e1d2e] border border-cyan-500/25 hover:border-cyan-500/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all duration-200 cursor-default"
        >
          <div>
            <p className="text-sm font-medium text-slate-400">Active Properties</p>
            <p className="text-3xl font-extrabold text-white mt-1">8</p>
            <p className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1">↑ All active</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Building2 size={22} />
          </div>
        </motion.div>

        {/* Card 2: In Maintenance */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 30px rgba(245,158,11,0.25)' }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#1c1505] border border-amber-500/25 hover:border-amber-500/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all duration-200 cursor-default"
        >
          <div>
            <p className="text-sm font-medium text-slate-400">In Maintenance</p>
            <p className="text-3xl font-extrabold text-white mt-1">1</p>
            <p className="text-xs font-semibold text-amber-400 mt-2 flex items-center gap-1">↓ High priority</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Wrench size={22} />
          </div>
        </motion.div>

        {/* Card 3: Cleaning Tasks */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 30px rgba(16,185,129,0.25)' }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#061a14] border border-emerald-500/25 hover:border-emerald-500/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all duration-200 cursor-default"
        >
          <div>
            <p className="text-sm font-medium text-slate-400">Cleaning Tasks</p>
            <p className="text-3xl font-extrabold text-white mt-1">2</p>
            <p className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1">↑ Assigned today</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Sparkles size={22} />
          </div>
        </motion.div>

        {/* Card 4: Guest Check-Ins */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 30px rgba(168,85,247,0.25)' }}
          whileTap={{ scale: 0.98 }}
          className="bg-[#120d1f] border border-purple-500/25 hover:border-purple-500/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden transition-all duration-200 cursor-default"
        >
          <div>
            <p className="text-sm font-medium text-slate-400">Guest Check-Ins</p>
            <p className="text-3xl font-extrabold text-white mt-1">2</p>
            <p className="text-xs font-semibold text-emerald-400 mt-2 flex items-center gap-1">↑ Next 24h</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <LogIn size={22} />
          </div>
        </motion.div>
      </motion.div>

      {/* Row 2: Charts */}
      <motion.div variants={slideInBottom} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by Property */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Revenue by Property (This Month)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="opRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00d2ff" />
                  <stop offset="100%" stopColor="#009bf2" />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: '#1a2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px' }}
                formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="url(#opRevenueGrad)" radius={[6, 6, 0, 0]} barSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category Donut */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <h3 className="text-base font-bold text-white mb-2">Expenses by Category (This Month)</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={expenseCategories}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                dataKey="value"
                strokeWidth={3}
                stroke="#121826"
              >
                {expenseCategories.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {expenseCategories.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 font-medium">{item.name}</span>
                </div>
                <span className="text-white font-bold">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Row 3: Profit & Occupancy Trends */}
      <motion.div variants={slideInBottom} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Profit Trend */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Monthly Profit Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={profitTrend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
              <Tooltip contentStyle={{ background: '#1a2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#38bdf8" strokeWidth={2.5} dot={false} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke="#f43f5e" strokeWidth={2.5} dot={false} name="Net Profit" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Trend */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Occupancy Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={occupancyTrend} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: '#1a2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '13px' }} formatter={(val) => [`${val}%`, 'Occupancy']} />
              <Line type="monotone" dataKey="rate" stroke="#a855f7" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 4: Top Expense Vendors */}
      <motion.div variants={slideInBottom} initial="hidden" animate="visible" className="bg-[#0f172a] border border-white/10 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-5">Top Expense Vendors</h3>
        <div className="space-y-4">
          {topVendors.map((v) => (
            <div key={v.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-semibold">{v.name}</span>
                <span className="text-slate-400 font-bold">${v.amount.toLocaleString()}</span>
              </div>
              <div className="w-full h-3 bg-slate-800/80 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(v.amount / v.max) * 100}%`, backgroundColor: v.color }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Row 5: 3 Column Summary Cards matching Image 1 */}
      <motion.div variants={slideInBottom} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Cleaning Tasks */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Cleaning Tasks</h3>
            <Sparkles size={18} className="text-cyan-400" />
          </div>
          <div className="space-y-3">
            {cleaningTasks.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">{t.property}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{t.staff} • {t.date}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${t.statusColor}`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Recent Arrivals */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Recent Arrivals</h3>
            <LogIn size={18} className="text-purple-400" />
          </div>
          <div className="space-y-3">
            {recentArrivals.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <div>
                  <p className="text-sm font-bold text-white">{r.guest}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.property} • {r.date}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${r.badgeColor}`}>
                  {r.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Maintenance */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Maintenance</h3>
            <Wrench size={18} className="text-amber-400" />
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">Harbor View Loft</p>
              <p className="text-xs font-semibold text-red-400 mt-0.5">Repair Required</p>
            </div>
            <button className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <Eye size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

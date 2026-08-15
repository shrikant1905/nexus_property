import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import StatCard from '../../../components/common/StatCard';
import StatusBadge from '../../../components/common/StatusBadge';
import { adminDashboardData } from '../../../data/dashboard';
import { formatCurrency } from '../../../utils/formatters';
import { staggerContainer, slideInBottom } from '../../../utils/motionVariants';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a2535] border border-white/10 rounded-lg px-3 py-2 text-xs">
        <p className="text-slate-400">{label || payload[0].name}</p>
        <p className="text-white font-semibold">
          {label ? `revenue: $${payload[0].value?.toLocaleString()}` : `$${payload[0].value?.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

// Monthly profit trend data
const profitTrendData = [
  { month: 'Sep', revenue: 26000, profit: 17000, expenses: 8000 },
  { month: 'Oct', revenue: 28000, profit: 18000, expenses: 9000 },
  { month: 'Nov', revenue: 27000, profit: 17000, expenses: 8500 },
  { month: 'Dec', revenue: 32000, profit: 21000, expenses: 10000 },
  { month: 'Jan', revenue: 30000, profit: 19000, expenses: 9500 },
  { month: 'Feb', revenue: 33000, profit: 21500, expenses: 10500 },
  { month: 'Mar', revenue: 36000, profit: 23000, expenses: 11000 },
];

// Occupancy trend data
const occupancyTrendData = [
  { month: 'Sep', rate: 72 },
  { month: 'Oct', rate: 78 },
  { month: 'Nov', rate: 74 },
  { month: 'Dec', rate: 89 },
  { month: 'Jan', rate: 81 },
  { month: 'Feb', rate: 84 },
  { month: 'Mar', rate: 85 },
];

// Top expense vendors data
const vendorExpenseData = [
  { vendor: 'Pro Clean', amount: 6000 },
  { vendor: 'FPL', amount: 3300 },
  { vendor: 'Amazon', amount: 1500 },
  { vendor: 'Home Depot', amount: 2000 },
  { vendor: 'Zone Water', amount: 800 },
];

export default function AdminDashboard() {
  const [period, setPeriod] = useState('This Month');
  const { stats, revenueByProperty, expensesByCategory } = adminDashboardData;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">Portfolio overview and key metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
          >
            {['This Month', 'Last Month', 'This Quarter', 'This Year'].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stat cards - staggered entrance */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </motion.div>

      {/* Row 1: Charts */}
      <motion.div variants={slideInBottom} initial="hidden" animate="visible" className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Revenue by Property */}
        <div className="xl:col-span-2 bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Revenue by Property (This Month)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByProperty} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="property" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="revenue" fill="#009bf2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expenses by Category */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Expenses by Category (This Month)</h3>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={expensesByCategory} cx="50%" cy="50%" innerRadius={48} outerRadius={70} dataKey="value" strokeWidth={2} stroke="#121826">
                {expensesByCategory.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {expensesByCategory.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-400 font-medium">{item.name}</span>
                </div>
                <span className="text-slate-200 font-bold">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Row 2: Trends */}
      <motion.div variants={slideInBottom} initial="hidden" animate="visible" className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Monthly Profit Trend */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Monthly Profit Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={profitTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#1a2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="expenses" stroke="#f87171" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Trend */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Occupancy Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={occupancyTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[50, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: '#1a2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
              <Line type="monotone" dataKey="rate" stroke="#a855f7" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Row 3: Top Expense Vendors */}
      <motion.div variants={slideInBottom} initial="hidden" animate="visible" className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4">Top Expense Vendors</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart layout="vertical" data={vendorExpenseData} margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} />
            <YAxis type="category" dataKey="vendor" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#1a2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }} />
            <Bar dataKey="amount" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Row 4: 3 Column Summary Lists */}
      <motion.div variants={slideInBottom} initial="hidden" animate="visible" className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Recent Transactions */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {[
              { desc: 'Zone Water Supply', date: '2026-03-05', amt: '-$245.00', color: 'text-red-400' },
              { desc: 'Amazon - Cleaning Supplies', date: '2026-03-04', amt: '-$350.00', color: 'text-red-400' },
              { desc: 'Airbnb Payout - Sunset Villa', date: '2026-03-04', amt: '+$2,850.00', color: 'text-emerald-400' },
              { desc: 'Home Depot - Door Repair', date: '2026-03-03', amt: '-$189.50', color: 'text-red-400' },
              { desc: 'FPL Electric Bill', date: '2026-03-03', amt: '-$312.00', color: 'text-red-400' },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between pb-2.5 border-b border-white/5 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-medium text-slate-200">{t.desc}</p>
                  <p className="text-[10px] text-slate-500">{t.date}</p>
                </div>
                <span className={`text-xs font-bold ${t.color}`}>{t.amt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Expenses */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Pending Expenses</h3>
          <div className="space-y-3">
            {[
              { desc: 'Zone Water Supply', badge: 'Assigned', prop: 'Sunset Villa', amt: '$245.00' },
              { desc: 'Amazon - Cleaning Supplies', badge: 'Unassigned', prop: '', amt: '$350.00' },
              { desc: 'AT&T Internet', badge: 'Assigned', prop: 'Downtown Studio', amt: '$89.99' },
              { desc: 'FPL Electric', badge: 'Unassigned', prop: '', amt: '$312.00' },
            ].map((e, i) => (
              <div key={i} className="flex items-center justify-between pb-2.5 border-b border-white/5 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-medium text-slate-200">{e.desc}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusBadge status={e.badge} />
                    {e.prop && <span className="text-[10px] text-slate-500">{e.prop}</span>}
                  </div>
                </div>
                <span className="text-xs font-bold text-white">{e.amt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Owner Payments */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4">Latest Owner Payments</h3>
          <div className="space-y-3">
            {[
              { owner: 'Sarah Johnson', badge: 'Matched', date: '2026-03-05', amt: '+$3,160.00' },
              { owner: 'John Smith', badge: 'Matched', date: '2026-03-01', amt: '+$2,400.00' },
              { owner: 'Emily Davis', badge: 'Unmatched', date: '2026-02-28', amt: '+$4,160.00' },
              { owner: 'Michael Chen', badge: 'Partial', date: '2026-02-25', amt: '+$1,600.00' },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between pb-2.5 border-b border-white/5 last:border-0 last:pb-0">
                <div>
                  <p className="text-xs font-medium text-slate-200">{p.owner}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusBadge status={p.badge} />
                    <span className="text-[10px] text-slate-500">{p.date}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-400">{p.amt}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingDown, TrendingUp, FileText, CreditCard,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { staggerContainer, staggerItem, slideInBottom } from '../../../utils/motionVariants';

const monthlyProfit = [
  { month: 'Sep', profit: 25500 },
  { month: 'Oct', profit: 27000 },
  { month: 'Nov', profit: 26200 },
  { month: 'Dec', profit: 29800 },
  { month: 'Jan', profit: 28500 },
  { month: 'Feb', profit: 31000 },
  { month: 'Mar', profit: 34000 },
];

const expensesByCategory = [
  { name: 'Utilities', value: 3240, color: '#00d2ff' },
  { name: 'Maintenance', value: 2180, color: '#f59e0b' },
  { name: 'Cleaning', value: 4500, color: '#10b981' },
  { name: 'Supplies', value: 1890, color: '#a855f7' },
  { name: 'Marketing', value: 650, color: '#f43f5e' },
];

export default function OwnerPortalPage() {
  const [month, setMonth] = useState('March 2026');
  const months = ['January 2026', 'February 2026', 'March 2026'];

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-[#0f172a] via-[#101b33] to-[#0f172a] border border-white/10 rounded-2xl p-6 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#009bf2] to-[#00d2ff] flex items-center justify-center text-white text-xl font-black flex-shrink-0 shadow-[0_6px_20px_rgba(0,155,242,0.4)]">
            JS
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, John Smith</h1>
            <p className="text-sm text-slate-400 mt-1">Owner Portal • 2 Properties</p>
          </div>
        </div>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-[#090d16] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none cursor-pointer font-medium"
        >
          {months.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      {/* 5 Stat Cards with distinct rich dark gradients matching live app */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {/* Card 1: Property Revenue */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 30px rgba(16,185,129,0.25)' }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-[#0c2423] to-[#0f172a] border border-emerald-500/25 hover:border-emerald-500/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all duration-200 cursor-default"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400">Property Revenue</p>
              <p className="text-2xl font-extrabold text-white mt-1">$13,300</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-xs font-semibold text-emerald-400 mt-3 flex items-center gap-1">↑ +12.5% this month</p>
        </motion.div>

        {/* Card 2: Expenses */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 30px rgba(244,63,94,0.25)' }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-[#2a131b] to-[#0f172a] border border-rose-500/25 hover:border-rose-500/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all duration-200 cursor-default"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400">Expenses</p>
              <p className="text-2xl font-extrabold text-white mt-1">$3,300</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <TrendingDown size={20} />
            </div>
          </div>
          <p className="text-xs font-semibold text-rose-400 mt-3 flex items-center gap-1">↓ All properties</p>
        </motion.div>

        {/* Card 3: Net Profit */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 30px rgba(20,184,166,0.25)' }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-[#0c2628] to-[#0f172a] border border-teal-500/25 hover:border-teal-500/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all duration-200 cursor-default"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400">Net Profit</p>
              <p className="text-2xl font-extrabold text-white mt-1">$10,000</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-xs font-semibold text-emerald-400 mt-3 flex items-center gap-1">↑ After fees</p>
        </motion.div>

        {/* Card 4: Open Invoices */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 30px rgba(245,158,11,0.25)' }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-[#261f12] to-[#0f172a] border border-amber-500/25 hover:border-amber-500/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all duration-200 cursor-default"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400">Open Invoices</p>
              <p className="text-2xl font-extrabold text-white mt-1">1</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText size={20} />
            </div>
          </div>
          <p className="text-xs font-semibold text-amber-400 mt-3 flex items-center gap-1">↓ Action needed</p>
        </motion.div>

        {/* Card 5: Payments Made */}
        <motion.div
          variants={staggerItem}
          whileHover={{ scale: 1.03, y: -3, boxShadow: '0 10px 30px rgba(6,182,212,0.25)' }}
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-br from-[#0e2133] to-[#0f172a] border border-cyan-500/25 hover:border-cyan-500/60 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all duration-200 cursor-default"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400">Payments Made</p>
              <p className="text-2xl font-extrabold text-white mt-1">$2,400</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <CreditCard size={20} />
            </div>
          </div>
          <p className="text-xs font-semibold text-cyan-400 mt-3 flex items-center gap-1">↓ This period</p>
        </motion.div>
      </motion.div>

      {/* Row 2: Monthly Profit Chart & Expense Breakdown */}
      <motion.div variants={slideInBottom} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Profit Line Chart */}
        <div className="lg:col-span-2 bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <h3 className="text-base font-bold text-white mb-4">Monthly Profit</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyProfit} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`} domain={[0, 34000]} />
              <Tooltip
                contentStyle={{ background: '#131b2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', fontSize: '13px' }}
                formatter={(val) => [`$${val.toLocaleString()}`, 'Profit']}
              />
              <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Breakdown Donut Chart */}
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.35)]">
          <h3 className="text-base font-bold text-white mb-2">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={170}>
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                dataKey="value"
                strokeWidth={3}
                stroke="#0f172a"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2.5 mt-3">
            {expensesByCategory.map((item) => (
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
    </div>
  );
}

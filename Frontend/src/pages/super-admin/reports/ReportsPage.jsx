import { useState } from 'react';
import { Eye, Download, Building, Users, DollarSign, TrendingUp, Percent, FileText } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

const reports = [
  { id: 'pnl', title: 'Property Profit & Loss', desc: 'Revenue, expenses, and net profit per property', icon: Building, color: 'border-cyan-500/20 bg-[#12222d]' },
  { id: 'owner-stmt', title: 'Owner Statement', desc: 'Detailed income and expense statement for each owner', icon: Users, color: 'border-blue-500/20 bg-[#121c2d]' },
  { id: 'expense', title: 'Expense Report', desc: 'Breakdown of all expenses by category and property', icon: DollarSign, color: 'border-amber-500/20 bg-[#251e16]' },
  { id: 'income', title: 'Income Report', desc: 'Revenue analysis by source, property, and platform', icon: TrendingUp, color: 'border-teal-500/20 bg-[#122625]' },
  { id: 'mgmt-fee', title: 'Management Fee Report', desc: 'Management fee calculations and summaries', icon: Percent, color: 'border-purple-500/20 bg-[#1e172e]' },
  { id: 'tax', title: 'Tax Report', desc: 'Tax-ready reports for 1099 and deduction tracking', icon: FileText, color: 'border-red-500/20 bg-[#2a1720]' },
];

const samplePnlData = [
  { property: 'Sunset Villa', revenue: 8500, expenses: 2100, net: 6400 },
  { property: 'Ocean Breeze', revenue: 6200, expenses: 1800, net: 4400 },
  { property: 'Garden Estate', revenue: 7200, expenses: 1600, net: 5600 },
  { property: 'Bayfront PH', revenue: 12000, expenses: 3200, net: 8800 },
  { property: 'Harbor View', revenue: 5500, expenses: 2800, net: 2700 },
];

const pnlLineItems = [
  { label: 'Airbnb Revenue', amount: '+$12,000', color: 'text-emerald-400 font-bold' },
  { label: 'Cleaning', amount: '$1,200', color: 'text-red-400 font-medium' },
  { label: 'Utilities', amount: '$500', color: 'text-red-400 font-medium' },
  { label: 'Supplies', amount: '$400', color: 'text-red-400 font-medium' },
  { label: 'Maintenance', amount: '$350', color: 'text-red-400 font-medium' },
  { label: 'Management Fee (20%)', amount: '$2,400', color: 'text-purple-400 font-medium' },
];

const periods = ['March 2026', 'February 2026', 'January 2026', 'Q1 2026'];

export default function ReportsPage() {
  const [period, setPeriod] = useState('March 2026');
  const [selectedReport] = useState('pnl');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-sm text-slate-400 mt-0.5">Financial reports and analytics</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="bg-[#111827] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none cursor-pointer"
        >
          {periods.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* 6 Report Cards Grid (Matching image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.id} className={`border rounded-2xl p-5 ${r.color}`}>
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white flex-shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{r.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 border-t border-white/5 pt-3">
                <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer font-medium">
                  <Eye size={13} /> View
                </button>
                <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer font-medium">
                  <Download size={13} /> Export
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sample Report Section (Matching image 2) */}
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Property Profit & Loss — Sample Report</h3>
          <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition-colors cursor-pointer">
            <Download size={13} /> Export PDF
          </button>
        </div>

        {/* 3-Bar Chart per Property */}
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={samplePnlData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis dataKey="property" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: '#1a2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[3, 3, 0, 0]} barSize={16} />
            <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} barSize={16} />
            <Bar dataKey="net" name="Net Profit" fill="#38bdf8" radius={[3, 3, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>

        {/* Sunset Villa — Detailed P&L Card (Matching image 2) */}
        <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 space-y-3">
          <h4 className="text-sm font-bold text-white pb-2 border-b border-white/5">Sunset Villa — Detailed P&L</h4>
          <div className="space-y-2.5">
            {pnlLineItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                <span className="text-slate-300 font-medium">{item.label}</span>
                <span className={item.color}>{item.amount}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-sm">
            <span className="font-bold text-white">Net Owner Profit</span>
            <span className="font-extrabold text-emerald-400 text-base">$7,150</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// StatusBadge — colored pill badge
const statusConfig = {
  // Property statuses
  Active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  Maintenance: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  Inactive: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
  // Invoice statuses
  Sent: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  Paid: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  Overdue: 'bg-red-500/15 text-red-400 border border-red-500/25',
  Draft: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
  // Transaction statuses
  Categorized: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  Pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  Matched: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  Unmatched: 'bg-red-500/15 text-red-400 border border-red-500/25',
  Partial: 'bg-orange-500/15 text-orange-400 border border-orange-500/25',
  // Reservation statuses
  Confirmed: 'bg-slate-500/15 text-slate-300 border border-slate-500/25',
  Completed: 'bg-slate-600/15 text-slate-400 border border-slate-600/25',
  Cancelled: 'bg-red-500/15 text-red-400 border border-red-500/25',
  // Expense statuses
  Unassigned: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  Assigned: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  Ready: 'bg-purple-500/15 text-purple-400 border border-purple-500/25',
  Invoiced: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  // User/role statuses
  'Super Admin': 'bg-red-500/15 text-red-400 border border-red-500/25',
  'Finance Manager': 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
  'Operations Staff': 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  'Property Owner': 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  // Generic
  Connected: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  Disconnected: 'bg-slate-500/15 text-slate-400 border border-slate-500/25',
};

export default function StatusBadge({ status }) {
  const classes = statusConfig[status] || 'bg-slate-500/15 text-slate-400 border border-slate-500/25';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {status}
    </span>
  );
}

import {
  Building2, Users, DollarSign, Percent, AlertTriangle,
  FileText, CreditCard, TrendingUp, TrendingDown,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerItem } from '../../utils/motionVariants';

const iconMap = {
  building: Building2,
  users: Users,
  dollar: DollarSign,
  percent: Percent,
  warning: AlertTriangle,
  document: FileText,
  card: CreditCard,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
};

const variantConfig = {
  default: {
    bg: 'bg-gradient-to-br from-[#1a2535] to-[#131e2e]',
    border: 'border border-blue-500/15 hover:border-blue-500/50',
    icon: 'bg-blue-500/10 text-blue-400',
    trend: { up: 'text-emerald-400', down: 'text-red-400' },
    glow: '0 10px 30px rgba(59,130,246,0.22)',
    cornerColor: 'rgba(59,130,246,0.18)',
  },
  green: {
    bg: 'bg-gradient-to-br from-emerald-900/25 to-[#131e2e]',
    border: 'border border-emerald-500/15 hover:border-emerald-500/50',
    icon: 'bg-emerald-500/10 text-emerald-400',
    trend: { up: 'text-emerald-400', down: 'text-red-400' },
    glow: '0 10px 30px rgba(16,185,129,0.22)',
    cornerColor: 'rgba(16,185,129,0.18)',
  },
  orange: {
    bg: 'bg-gradient-to-br from-amber-900/25 to-[#131e2e]',
    border: 'border border-amber-500/15 hover:border-amber-500/50',
    icon: 'bg-amber-500/10 text-amber-400',
    trend: { up: 'text-emerald-400', down: 'text-amber-400' },
    glow: '0 10px 30px rgba(245,158,11,0.22)',
    cornerColor: 'rgba(245,158,11,0.18)',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-900/25 to-[#131e2e]',
    border: 'border border-red-500/15 hover:border-red-500/50',
    icon: 'bg-red-500/10 text-red-400',
    trend: { up: 'text-emerald-400', down: 'text-red-400' },
    glow: '0 10px 30px rgba(239,68,68,0.22)',
    cornerColor: 'rgba(239,68,68,0.18)',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-900/25 to-[#131e2e]',
    border: 'border border-blue-500/15 hover:border-blue-500/50',
    icon: 'bg-blue-500/10 text-blue-400',
    trend: { up: 'text-emerald-400', down: 'text-red-400' },
    glow: '0 10px 30px rgba(59,130,246,0.22)',
    cornerColor: 'rgba(59,130,246,0.18)',
  },
};

export default function StatCard({ label, value, sub, trend, icon, variant = 'default' }) {
  const cfg = variantConfig[variant] || variantConfig.default;
  const Icon = iconMap[icon] || DollarSign;
  const trendColor = trend === 'up' ? cfg.trend.up : cfg.trend.down;
  const TrendArrow = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{
        scale: 1.03,
        y: -3,
        boxShadow: cfg.glow,
        transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] },
      }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl p-5 cursor-default overflow-hidden transition-all duration-200 ${cfg.bg} ${cfg.border}`}
    >
      {/* Colored corner ambient glow */}
      <div
        className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-xl pointer-events-none transition-opacity duration-200"
        style={{ backgroundColor: cfg.cornerColor }}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.14, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${cfg.icon}`}
        >
          <Icon size={18} />
        </motion.div>
      </div>

      {sub && (
        <div className={`relative flex items-center gap-1 mt-3 text-xs font-medium ${trendColor}`}>
          <TrendArrow size={12} />
          <span>{sub}</span>
        </div>
      )}
    </motion.div>
  );
}

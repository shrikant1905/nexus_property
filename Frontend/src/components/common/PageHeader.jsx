// PageHeader — page title, subheading, right-side actions with hover effects
import { motion } from 'framer-motion';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {actions.map((action, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={action.onClick}
              className={
                action.variant === 'outline'
                  ? 'flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 border border-white/10 hover:border-white/25 hover:text-white hover:bg-white/[0.04] transition-all duration-150 cursor-pointer'
                  : 'flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-[#009bf2] hover:bg-[#008be0] shadow-[0_4px_14px_rgba(0,155,242,0.3)] hover:shadow-[0_6px_18px_rgba(0,155,242,0.45)] transition-all duration-150 cursor-pointer'
              }
            >
              {action.icon && <span>{action.icon}</span>}
              {action.label}
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

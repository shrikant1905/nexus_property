import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  return (
    <div className="fixed bottom-5 right-5 z-[9999] max-w-sm w-full pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`p-4 rounded-2xl border shadow-xl flex items-start justify-between gap-3 pointer-events-auto bg-white ${
          type === 'success' 
            ? 'border-emerald-200 text-emerald-800' 
            : 'border-rose-200 text-rose-800'
        }`}
      >
        <div className="flex items-start gap-2.5">
          {type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
          )}
          <div>
            <p className="text-xs font-black leading-tight uppercase tracking-wider text-slate-900">
              {type === 'success' ? 'Success' : 'Error'}
            </p>
            <p className="text-xs font-semibold text-slate-600 mt-1 leading-snug">
              {message}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex-shrink-0"
        >
          <X size={14} />
        </button>
      </motion.div>
    </div>
  );
}

// Modal wrapper component with Framer Motion animations
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { backdropAnimation, modalAnimation } from '../../utils/motionVariants';

export default function FormModal({ isOpen, onClose, title, children, onSubmit, submitLabel = 'Save', submitVariant = 'primary' }) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Panel */}
          <motion.div
            variants={modalAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white text-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#00204a] text-white rounded-t-2xl">
              <h2 className="text-base font-extrabold text-white">{title}</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </motion.button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {children}
            </div>

            {/* Footer */}
            {onSubmit && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSubmit}
                  className={
                    submitVariant === 'danger'
                      ? 'px-4 py-2 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-md'
                      : 'px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#00204a] hover:bg-[#001738] transition-colors cursor-pointer shadow-md'
                  }
                >
                  {submitLabel}
                </motion.button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

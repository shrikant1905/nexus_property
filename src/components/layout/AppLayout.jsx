import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../hooks/useAuth';
import { pageTransition } from '../../utils/motionVariants';

export default function AppLayout({ role }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const activeRole = role || user?.roleKey;

  // Auto-close mobile sidebar when changing routes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock background scrolling on mobile when drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#f8fafc] overflow-x-hidden relative">
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      <Sidebar
        collapsed={collapsed}
        role={activeRole}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <Header
        collapsed={collapsed}
        onToggleSidebar={() => {
          if (window.innerWidth < 1024) {
            setMobileOpen(!mobileOpen);
          } else {
            setCollapsed(!collapsed);
          }
        }}
      />

      <main
        className={`pt-16 min-h-screen transition-all duration-300 bg-[#f8fafc] ${
          collapsed ? 'lg:ml-[72px]' : 'lg:ml-[260px]'
        }`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageTransition}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="p-4 sm:p-6 max-w-full min-w-0"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

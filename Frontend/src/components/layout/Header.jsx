import { useState, useEffect } from 'react';
import { Menu, Bell, LogOut, Shield, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { dropdownAnimation } from '../../utils/motionVariants';
import { notificationService } from '../../services/notificationService';

export default function Header({ onToggleSidebar, collapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkRead = async (id, actionUrl) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
      if (actionUrl) {
        setNotifOpen(false);
        navigate(actionUrl);
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Just Now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Just Now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getTypeStyles = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
      case 'TASK_REASSIGNED':
        return { label: 'NEW TASK', className: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'QUOTE_PHOTOS_SUBMITTED':
        return { label: 'QUOTE PHOTO', className: 'text-sky-800 bg-sky-50 border-sky-200' };
      case 'NEW_QUOTE_REQUEST':
        return { label: 'NEW REQUEST', className: 'text-cyan-800 bg-cyan-50 border-cyan-200' };
      case 'QUOTE_APPROVED':
        return { label: 'QUOTE APPROVED', className: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
      case 'BOOKING_LINK_SENT':
        return { label: 'LINK SENT', className: 'text-purple-800 bg-purple-50 border-purple-200' };
      case 'BOOKING_CONFIRMED':
        return { label: 'BOOKING CONFIRMED', className: 'text-indigo-800 bg-indigo-50 border-indigo-200' };
      case 'TASK_SCHEDULE_CHANGED':
        return { label: 'SCHEDULE UPDATED', className: 'text-rose-800 bg-rose-50 border-rose-200' };
      case 'JOB_COMPLETED':
        return { label: 'JOB COMPLETED', className: 'text-purple-800 bg-purple-50 border-purple-200' };
      default:
        return { label: 'ALERT', className: 'text-slate-800 bg-slate-50 border-slate-200' };
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isTech = user?.roleKey === 'maintenance-staff' || user?.roleKey === 'operations-staff';

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center px-4 sm:px-6 gap-3 transition-all duration-300 select-none shadow-2xs left-0 ${
        collapsed ? 'lg:left-[72px]' : 'lg:left-[260px]'
      }`}
    >
      {/* Toggle Sidebar Button */}
      <button
        type="button"
        onClick={onToggleSidebar}
        className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-600 hover:text-[#00204a] hover:bg-slate-100 transition-all flex-shrink-0 cursor-pointer border border-transparent hover:border-slate-200"
        title="Toggle Sidebar"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1 min-w-0" />

      {/* Right Controls */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-700 hover:text-[#00204a] hover:bg-slate-100 border border-slate-200/80 transition-all relative cursor-pointer shadow-2xs"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                variants={dropdownAnimation}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 top-12 w-[310px] sm:w-88 max-w-[calc(100vw-32px)] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden text-slate-800"
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                  <p className="text-xs font-black text-[#00204a] flex items-center gap-1.5">
                    <Bell size={14} className="text-amber-500" /> Notifications
                  </p>
                  {unreadCount > 0 ? (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-extrabold text-red-600 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-full border border-red-200 transition-colors"
                    >
                      {unreadCount} New (Mark Read)
                    </button>
                  ) : (
                    <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      0 New
                    </span>
                  )}
                </div>

                <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => {
                      const style = getTypeStyles(n.type);
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleMarkRead(n.id, n.actionUrl)}
                          className={`p-3.5 hover:bg-slate-50/80 transition-colors space-y-1.5 cursor-pointer ${
                            !n.isRead ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${style.className}`}>
                              {style.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{getRelativeTime(n.createdAt)}</span>
                          </div>
                          <p className={`text-xs leading-snug ${!n.isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
                            {n.title}
                          </p>
                          <p className="text-[11px] text-slate-500">{n.message}</p>
                          {!n.isRead && n.type === 'TASK_ASSIGNED' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkRead(n.id, n.actionUrl);
                              }}
                              className="mt-1 w-full py-1.5 rounded-xl text-xs font-bold text-white bg-[#00204a] hover:bg-[#001738] shadow-2xs transition-all cursor-pointer"
                            >
                              ✓ Accept & View Schedule
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* User Details & Profile Avatar */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-slate-900 leading-snug truncate max-w-[150px]">
              {user?.full_name || user?.name || (isTech ? 'Maintenance Staff' : 'Office Admin')}
            </p>
            <div className="mt-0.5">
              {isTech ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Wrench size={10} className="text-emerald-600" /> Maintenance Tech
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-sky-50 text-sky-900 border border-sky-200">
                  <Shield size={10} className="text-sky-600" /> Office Admin
                </span>
              )}
            </div>
          </div>

          {/* Avatar Box */}
          <div className="w-9 h-9 rounded-xl bg-[#00204a] text-white text-xs font-black flex items-center justify-center shadow-2xs ring-2 ring-sky-100 flex-shrink-0">
            {user?.initials || (user?.name ? user.name.split(' ').map(n=>n[0]).join('') : 'AR')}
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200/80 hover:border-red-200 transition-all cursor-pointer shadow-2xs"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

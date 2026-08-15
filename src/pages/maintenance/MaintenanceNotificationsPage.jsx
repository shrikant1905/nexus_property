import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle2, ChevronRight, Inbox, RefreshCw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notificationService';
import { staggerContainer, staggerItem, slideInBottom } from '../../utils/motionVariants';

export default function MaintenanceNotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'UNREAD', 'READ'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id, actionUrl) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
      if (actionUrl) {
        navigate(actionUrl);
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
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

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'READ') return n.isRead;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-800">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[#00204a] tracking-tight flex items-center gap-3">
            <Bell className="text-amber-500" size={32} /> Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Manage your notifications, alerts, and task updates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNotifications}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#00204a] hover:bg-[#001738] shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {['ALL', 'UNREAD', 'READ'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-2 text-xs font-extrabold border-b-2 transition-all cursor-pointer ${
              filter === t
                ? 'border-[#00204a] text-[#00204a]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {t} ({t === 'ALL' ? notifications.length : t === 'UNREAD' ? unreadCount : notifications.length - unreadCount})
          </button>
        ))}
      </div>

      {/* Notification List Container */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
            <RefreshCw className="animate-spin text-slate-300 mb-2" size={32} />
            <p className="text-xs font-bold">Loading your notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-400">
            <Inbox className="text-slate-300 mb-3" size={48} />
            <p className="text-xs font-bold">No notifications to display</p>
            <p className="text-[10px] text-slate-400 mt-1">You are all caught up!</p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const style = getTypeStyles(n.type);
            return (
              <motion.div
                key={n.id}
                variants={staggerItem}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleMarkRead(n.id, n.actionUrl)}
                className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 shadow-2xs hover:shadow-xs ${
                  !n.isRead ? 'border-blue-200 bg-blue-50/15' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-2.5 h-2.5 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${style.className}`}>
                        {style.label}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">{getRelativeTime(n.createdAt)}</span>
                    </div>
                    <p className={`text-sm leading-snug ${!n.isRead ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500">{n.message}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {n.actionUrl && (
                    <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}

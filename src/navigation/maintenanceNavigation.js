import {
  LayoutDashboard,
  Users,
  Link as LinkIcon,
  Camera,
  ShieldCheck,
  Calendar,
  Settings,
  Wrench,
  CheckCircle2,
  User,
  Boxes,
  Star,
  Sparkles,
  Bell,
} from 'lucide-react';

export const maintenanceAdminNavItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/pipeline', label: 'Workflow Pipeline', icon: Sparkles },
  { to: '/admin/tenants', label: 'Tenants / Residents', icon: Users },
  { to: '/admin/booking-links', label: 'Booking Links', icon: LinkIcon },
  { to: '/admin/quote-requests', label: 'Quote Photo Requests', icon: Camera },
  { to: '/admin/staff', label: 'Staff', icon: ShieldCheck },
  { to: '/admin/kpi-dashboard', label: 'KPI Dashboard', icon: Star },
  { to: '/admin/inventory', label: 'Warehouse Inventory', icon: Boxes },
  { to: '/admin/calendar', label: 'Calendar', icon: Calendar },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export const maintenanceStaffNavItems = [
  { to: '/maintenance/my-tasks', label: 'My Work Orders', icon: Wrench },
  { to: '/maintenance/calendar', label: 'Shift Calendar', icon: Calendar },
  { to: '/maintenance/history', label: 'Completed History', icon: CheckCircle2 },
  { to: '/maintenance/profile', label: 'My Profile', icon: User },
];

export const officeTeamNavItems = [
  { to: '/office/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/office/bookings', label: 'Bookings', icon: Calendar },
  { to: '/office/calendar', label: 'Dispatch Calendar', icon: Calendar },
  { to: '/office/notifications', label: 'Notifications', icon: Bell },
  { to: '/office/profile', label: 'My Profile', icon: User },
];

export const maintenanceNavItems = maintenanceAdminNavItems;

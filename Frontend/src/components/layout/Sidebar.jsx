import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Users, Calendar, ArrowLeftRight,
  Receipt, FileText, CreditCard, BookOpen, BarChart3,
  Zap, Plug, ShieldCheck, Settings, LayoutGrid, Link as LinkIcon, Camera, X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { sidebarAnimation } from '../../utils/motionVariants';
import { maintenanceAdminNavItems, maintenanceStaffNavItems } from '../../navigation/maintenanceNavigation';

// Old PMS Nav Items (Preserved for future restoration if needed)
const pmsNavItemsByRole = {
  'super-admin': [
    { to: '/superadmin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/superadmin/properties', label: 'Properties', icon: Building2 },
    { to: '/superadmin/owners', label: 'Owners', icon: Users },
    { to: '/superadmin/reservations', label: 'Reservations', icon: Calendar },
    { to: '/superadmin/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/superadmin/billable-expenses', label: 'Billable Expenses', icon: Receipt },
    { to: '/superadmin/invoices', label: 'Invoices', icon: FileText },
    { to: '/superadmin/payments', label: 'Payments', icon: CreditCard },
    { to: '/superadmin/accounting', label: 'Accounting', icon: BookOpen },
    { to: '/superadmin/reports', label: 'Reports', icon: BarChart3 },
    { to: '/superadmin/automation', label: 'Automation Rules', icon: Zap },
    { to: '/superadmin/integrations', label: 'Integrations', icon: Plug },
    { to: '/superadmin/users', label: 'Users & Permissions', icon: ShieldCheck },
    { to: '/superadmin/settings', label: 'Settings', icon: Settings },
    { to: '/superadmin/owner-portal', label: 'Owner Portal', icon: LayoutGrid },
  ],
};

// Desktop sidebar - static, 260px wide, large clear typography
function DesktopSidebar({ collapsed, navItems }) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full z-30 flex-col transition-all duration-300 bg-[#00204a] border-r border-[#001533] select-none hidden lg:flex ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      <SidebarContent collapsed={collapsed} navItems={navItems} />
    </aside>
  );
}

// Mobile sidebar drawer
function MobileSidebar({ mobileOpen, navItems, onCloseMobile }) {
  return (
    <AnimatePresence>
      {mobileOpen && (
        <motion.aside
          variants={sidebarAnimation}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed top-0 left-0 h-full w-[280px] z-50 flex flex-col bg-[#00204a] border-r border-[#001533] select-none lg:hidden shadow-2xl"
        >
          <SidebarContent collapsed={false} navItems={navItems} onCloseMobile={onCloseMobile} isMobile />
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

// Shared sidebar inner content
function SidebarContent({ collapsed, navItems, onCloseMobile, isMobile }) {
  return (
    <>
      {/* Brand Header */}
      <div className={`flex items-center justify-between px-5 h-20 border-b border-white/10 flex-shrink-0 ${collapsed && !isMobile ? 'lg:justify-center lg:px-0' : ''}`}>
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-[0_4px_16px_rgba(0,0,0,0.2)]">
            <span className="text-[#00204a] font-black text-xs tracking-tighter">NEXUS</span>
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <p className="text-white font-black text-base tracking-tight leading-snug truncate">Nexus FMS</p>
              <p className="text-sky-200/70 text-xs font-semibold truncate mt-0.5">Facility Management System</p>
            </div>
          )}
        </div>
        {isMobile && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onCloseMobile}
            className="text-slate-300 hover:text-white p-1.5 rounded-xl cursor-pointer bg-white/10"
          >
            <X size={20} />
          </motion.button>
        )}
      </div>

      {/* Nav Menu with Large Typography & Colored Glow Hovers */}
      <nav className="flex-1 py-5 px-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-[#001533]">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={isMobile ? onCloseMobile : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                collapsed && !isMobile ? 'lg:justify-center lg:px-0' : ''
              } ${
                isActive
                  ? 'bg-white text-[#00204a] shadow-lg font-black scale-[1.02]'
                  : 'text-sky-100/80 hover:text-white hover:bg-white/15'
              }`
            }
            title={collapsed && !isMobile ? label : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon size={21} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[#00204a]' : 'text-sky-200/70 group-hover:text-white'}`} />
                {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function Sidebar({ collapsed, role, mobileOpen, onCloseMobile }) {
  const { user } = useAuth();

  const isStaff = user?.roleKey === 'maintenance-staff';
  const navItems = isStaff ? maintenanceStaffNavItems : maintenanceAdminNavItems;

  return (
    <>
      <DesktopSidebar collapsed={collapsed} navItems={navItems} />
      <MobileSidebar mobileOpen={mobileOpen} navItems={navItems} onCloseMobile={onCloseMobile} />
    </>
  );
}

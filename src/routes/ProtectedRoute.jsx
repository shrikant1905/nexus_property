import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
    <Loader2 className="animate-spin text-[#00204a]" size={32} />
  </div>
);

export function ProtectedRoute() {
  const { isAuthenticated, authLoading } = useAuth();
  if (authLoading) return <FullScreenLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated, authLoading, user } = useAuth();
  if (authLoading) return <FullScreenLoader />;
  if (isAuthenticated) {
    if (user?.roleKey === 'maintenance-staff') {
      return <Navigate to="/maintenance/my-tasks" replace />;
    }
    if (user?.roleKey === 'office-team') {
      return <Navigate to="/office/dashboard" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
}

export function RoleRoute({ allowedRoles }) {
  const { user, authLoading } = useAuth();
  if (authLoading) return <FullScreenLoader />;
  if (!user || !allowedRoles.includes(user.roleKey)) {
    // If not authorized for this route, fallback to their default portal
    if (user?.roleKey === 'maintenance-staff') return <Navigate to="/maintenance/my-tasks" replace />;
    if (user?.roleKey === 'office-team') return <Navigate to="/office/dashboard" replace />;
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
}


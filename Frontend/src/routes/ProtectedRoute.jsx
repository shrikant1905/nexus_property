import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, authLoading } = useAuth();
  // Wait for /auth/me validation before deciding to redirect
  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PublicRoute() {
  const { isAuthenticated, authLoading, user } = useAuth();
  // Wait for session restore before redirecting an already-logged-in user
  if (authLoading) return null;
  if (isAuthenticated) {
    if (user?.roleKey === 'maintenance-staff') {
      return <Navigate to="/maintenance/my-tasks" replace />;
    }
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <Outlet />;
}


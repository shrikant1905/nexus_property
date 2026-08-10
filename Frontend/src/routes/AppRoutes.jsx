import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import MaintenanceLayout from '../layouts/MaintenanceLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';

// Common / Error Pages
import NotFoundPage from '../pages/common/NotFoundPage';

// AP Maintenance Pages
import MaintenanceDashboardPage from '../pages/maintenance/MaintenanceDashboardPage';
import MaintenancePipelinePage from '../pages/maintenance/MaintenancePipelinePage';
import MaintenanceTenantsPage from '../pages/maintenance/MaintenanceTenantsPage';
import MaintenanceStaffPage from '../pages/maintenance/MaintenanceStaffPage';
import MaintenanceCalendarPage from '../pages/maintenance/MaintenanceCalendarPage';
import MaintenanceBookingLinkPage from '../pages/maintenance/MaintenanceBookingLinkPage';
import MaintenanceQuoteRequestPage from '../pages/maintenance/MaintenanceQuoteRequestPage';
import MaintenanceSettingsPage from '../pages/maintenance/MaintenanceSettingsPage';
import MaintenanceStaffPortalPage from '../pages/maintenance/MaintenanceStaffPortalPage';
import MaintenanceStaffHistoryPage from '../pages/maintenance/MaintenanceStaffHistoryPage';
import MaintenanceStaffProfilePage from '../pages/maintenance/MaintenanceStaffProfilePage';
// Public AP Maintenance Resident Portals
import ResidentBookingPage from '../pages/public/ResidentBookingPage';
import ResidentQuoteUploadPage from '../pages/public/ResidentQuoteUploadPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root redirect to login page */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Auth & Resident Portal Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Route>

      {/* Public Resident Portals (Standalone Routes without Admin Layout) */}
      <Route path="/booking/:secureToken" element={<ResidentBookingPage />} />
      <Route path="/quote-upload/:secureToken" element={<ResidentQuoteUploadPage />} />

      {/* Protected Role-Based Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Dedicated Admin Portal Routes */}
        <Route path="/admin" element={<MaintenanceLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<MaintenanceDashboardPage />} />
          <Route path="pipeline" element={<MaintenancePipelinePage />} />
          <Route path="tenants" element={<MaintenanceTenantsPage />} />
          <Route path="booking-links" element={<MaintenanceBookingLinkPage />} />
          <Route path="quote-requests" element={<MaintenanceQuoteRequestPage />} />
          <Route path="staff" element={<MaintenanceStaffPage />} />
          <Route path="calendar" element={<MaintenanceCalendarPage />} />
          <Route path="settings" element={<MaintenanceSettingsPage />} />
        </Route>

        {/* Dedicated Technician / Staff Portal Routes */}
        <Route path="/maintenance" element={<MaintenanceLayout />}>
          <Route index element={<Navigate to="my-tasks" replace />} />
          <Route path="my-tasks" element={<MaintenanceStaffPortalPage />} />
          <Route path="history" element={<MaintenanceStaffHistoryPage />} />
          <Route path="profile" element={<MaintenanceStaffProfilePage />} />
          <Route path="calendar" element={<MaintenanceCalendarPage />} />

          {/* Legacy maintenance admin route redirects to /admin/* */}
          <Route path="dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="pipeline" element={<Navigate to="/admin/pipeline" replace />} />
          <Route path="tenants" element={<Navigate to="/admin/tenants" replace />} />
          <Route path="booking-links" element={<Navigate to="/admin/booking-links" replace />} />
          <Route path="quote-requests" element={<Navigate to="/admin/quote-requests" replace />} />
          <Route path="staff" element={<Navigate to="/admin/staff" replace />} />
          <Route path="settings" element={<Navigate to="/admin/settings" replace />} />
        </Route>

        {/* Redirect any legacy PMS routes to Admin Dashboard */}
        <Route path="/superadmin/*" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/finance-manager/*" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/operation-staff/*" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/property-owner/*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

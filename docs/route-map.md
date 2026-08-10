# Route Map — Nexus FMS (Facility & Maintenance Management System)

## Application Base URL
`http://localhost:5173`

---

## Auth & Public Routes
| Route | Page Component | Access | Description |
|-------|----------------|--------|-------------|
| `/` | Redirect | Public | Redirects root URL to `/login` |
| `/login` | `LoginPage` | Public | Email & Password authentication + Quick demo role buttons (`Office Admin`, `Maintenance Staff`) |

---

## Public Resident Portals (Standalone Link Routes — No Admin Layout)
| Route | Page Component | Access | Description |
|-------|----------------|--------|-------------|
| `/booking/:secureToken` | `ResidentBookingPage` | Public (Token) | Resident self-service slot selection portal for booking technician visits |
| `/quote-upload/:secureToken` | `ResidentQuoteUploadPage` | Public (Token) | Resident photo & work detail submission portal for quote requests |
| `/resident-rating/:secureToken` | `ResidentRatingPage` | Public (Token) | Resident 5-star service rating & review submission portal post-repair completion |

---

## Office Admin Portal Routes (`/admin/*`)
| Route | Page Component | Page Title | Key Features |
|-------|----------------|------------|--------------|
| `/admin/dashboard` | `MaintenanceDashboardPage` | Maintenance Dashboard | Active quotes, booked jobs, workload bar chart, technician availability feed, recent activity log, resident reviews, + New Work Order modal |
| `/admin/pipeline` | `MaintenancePipelinePage` | Workflow Pipeline | 5-stage Kanban board (Quotes, Quote Sent, Booking Link Sent, Booked Jobs, Completed Jobs) with drag-and-drop & + New Work Order modal |
| `/admin/tenants` | `MaintenanceTenantsPage` | Tenants & Residents | Resident directory cards, contact details, property addresses, active bookings count, + Add Resident modal |
| `/admin/booking-links` | `MaintenanceBookingLinkPage` | Active Booking Links & Statuses | Booking links directory table, status dot pills (`🟢 BOOKED`, `🟡 WAITING`), icon-only Eye inspection buttons (`👁️`), copy link actions |
| `/admin/quote-requests` | `MaintenanceQuoteRequestPage` | Quote Request Links & Submissions | Photo submission links table, photo count badges (`📷 2 Photos`), status dot pills, icon-only Eye inspection buttons (`👁️`), portal links (`↗`) |
| `/admin/staff` | `MaintenanceStaffPage` | Maintenance Staff & Technicians | Staff cards, assigned workload count, specialty tags, phone/email, shift availability |
| `/admin/calendar` | `MaintenanceCalendarPage` | Maintenance Work Order Calendar | Split-screen enterprise calendar (Left 7-day compact Month/Week/Day matrix + Right Selected Date Task Details Panel + Bottom Tasks Directory Table) |
| `/admin/settings` | `MaintenanceSettingsPage` | Maintenance System Settings | System preferences, working hours configuration, notification rules, theme options |

---

## Maintenance Staff / Technician Portal Routes (`/maintenance/*`)
| Route | Page Component | Page Title | Key Features |
|-------|----------------|------------|--------------|
| `/maintenance/my-tasks` | `MaintenanceStaffPortalPage` | Technician Task Portal | Mobile-first task list for logged-in technician, status update toggles, work log, map location, Eye inspection modal |
| `/maintenance/history` | `MaintenanceStaffHistoryPage` | Work Order History | Historical archive of completed work orders, resident ratings, time logs |
| `/maintenance/profile` | `MaintenanceStaffProfilePage` | Staff Profile & Availability | Technician contact details, specialty skills, working hours, shift availability status |
| `/maintenance/calendar` | `MaintenanceCalendarPage` | Personal Shift Calendar | Binds to active technician's personal shift schedule and assigned work orders |

---

## Route Guard & Redirect Rules
- Unauthenticated users attempting to access `/admin/*` or `/maintenance/*` are redirected to `/login`.
- Logged-in `Office Admin` users navigating to `/maintenance/*` admin shortcuts are auto-redirected to `/admin/*`.
- Logged-in `Maintenance Staff` users are scoped to their assigned tasks and shift views.

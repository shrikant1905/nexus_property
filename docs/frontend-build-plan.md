# Frontend Build Plan & Implementation Summary — Nexus FMS

This document summarizes the technical architecture, design system, completed features, and freeze roadmap for the Nexus FMS frontend application.

---

## 1. Core Stack & Architecture
- **Framework:** React 18 + Vite (SPA)
- **Routing:** `react-router-dom` (Role-based Protected & Public Token Routes)
- **State Management & Mock Service:** `maintenanceMockService.js` (LocalStorage + Storage event sync across tabs)
- **Styling:** Vanilla Tailwind CSS + Custom Design System Tokens
- **Icons & Motion:** `lucide-react` icons + `framer-motion` page transitions & dropdowns
- **Data Visualization:** `recharts` for workload bar charts and capacity distribution

---

## 2. Design System & Aesthetics
- **Primary Navy Theme:** `#00204a` (Hover `#001738`)
- **Light Input Style:** `bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:bg-white focus:border-[#00204a]`
- **Status Pills:** Standardized dot pills (`🟢 BOOKED`, `🟡 WAITING FOR BOOKING`, `🟢 COMPLETE`, `🟡 PENDING UPLOAD`)
- **Action Buttons:** Standardized Icon-Only Eye inspection button (`<Eye size={16} />`) and Portal links (`<ExternalLink size={16} />`) with no extra text labels.

---

## 3. Completed Modules Inventory

### Module 1: Auth & Layout Frame
- `LoginPage.jsx` with quick demo role buttons (`Office Admin`, `Maintenance Staff`).
- `Header.jsx` with visible dark navy user name, `🛡️ Office Admin` / `🔧 Maintenance Tech` role badges, bell notification dropdown, and sign out button.
- `Sidebar.jsx` with collapsible dark navy navigation.

### Module 2: Maintenance Dashboard (`MaintenanceDashboardPage.jsx`)
- 4 KPI Stat Cards.
- Recharts Workload bar graph & live technician availability feed.
- Recent activity log & Resident reviews feed.
- Clean Manual Resident Entry Work Order modal.

### Module 3: Workflow Pipeline (`MaintenancePipelinePage.jsx`)
- 5-stage Kanban board (Quotes Needed, Quote Sent, Booking Link Sent, Booked Jobs, Completed Jobs).
- Drag-and-drop support with real-time status update.
- Clean Manual Resident Entry Work Order modal.

### Module 4: Split-Screen Enterprise Calendar (`MaintenanceCalendarPage.jsx`)
- Top control bar: Date controls (`<` Month `>`), `Today` reset button, View Switchers (`Monthly View`, `Weekly View`, `Daily View`), and Staff filter dropdown.
- Dual Panel Layout:
  - Left Side (~60% Width): Compact 7-day calendar matrix with minimalist dot indicators (`🟢 14:00`). NO cluttering multi-line text cards!
  - Right Side (~40% Width): Selected Date Task Details Panel listing all work orders scheduled for the date clicked on the left calendar.
- Bottom Directory Table: Complete master table with search filter.

### Module 5: Resident Portals & Tables
- `MaintenanceBookingLinkPage.jsx` & Public `ResidentBookingPage.jsx`.
- `MaintenanceQuoteRequestPage.jsx` & Public `ResidentQuoteUploadPage.jsx`.
- `MaintenanceStaffPage.jsx` & Technician `MaintenanceStaffPortalPage.jsx`.
- `MaintenanceTenantsPage.jsx`, `MaintenanceSettingsPage.jsx`, and Public `ResidentRatingPage.jsx`.

---

## 4. Next Phase: Backend Freeze & Integration Roadmap
- **Frontend Freeze:** All UI components, screens, modals, and user flows are complete and verified.
- **Backend Stack Plan:** Node.js / Express / MongoDB (or FastAPI / PostgreSQL) RESTful API implementation.
- **API Endpoints to Build:**
  - `POST /api/auth/login`
  - `GET /api/jobs` & `POST /api/jobs`
  - `GET /api/staff`
  - `GET /api/tenants`
  - `GET /api/booking-links/:token` & `POST /api/booking-links`
  - `GET /api/quote-requests/:token` & `POST /api/quote-requests`

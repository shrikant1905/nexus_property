# Screen Inventory — Nexus FMS (Facility & Maintenance Management System)

This document provides a comprehensive inventory of all screens, portals, modals, and user flows in the Nexus FMS application.

---

## 1. Login Page (`/login`)
- **Route:** `/login`
- **Layout:** `AuthLayout.jsx`
- **Header / Brand:** "Nexus FMS" Logo with navy blue icon
- **Heading:** Welcome Back
- **Subheading:** Sign in to manage your facility maintenance operations
- **Fields:**
  - Email Address (Input with mail icon)
  - Password (Input with lock icon)
- **Actions:**
  - `Sign In →` (Primary navy CTA button)
- **Quick Demo Role Buttons:**
  - `OFFICE ADMIN` (Navy card with Shield icon) — Pre-fills `admin@nexusfms.com`
  - `MAINTENANCE STAFF` (Emerald card with Wrench icon) — Pre-fills `dave@nexusfms.com`

---

## 2. Admin Dashboard (`/admin/dashboard`)
- **Route:** `/admin/dashboard`
- **Role:** Office Admin
- **Layout:** `MaintenanceLayout.jsx` (Fixed Sidebar + Header + Main Content)
- **Header Actions:**
  - `+ New Maintenance Job` (Opens Create Work Order modal)
- **KPI Stat Cards (4):**
  - **Active Maintenance Quotes:** Count of quotes pending processing | `🟢 Live Quotes`
  - **Booked Jobs / Work Orders:** Count of scheduled technician bookings | `🟢 Scheduled`
  - **Active Technicians:** Technicians currently on shift | `🟢 Available`
  - **Resident Satisfaction:** Average rating (e.g. `4.9 / 5.0`) | `⭐ High Rating`
- **Interactive Widgets & Graphs:**
  - **Staff Workload Bar Graph & Availability:** Recharts bar graph displaying job distribution across technicians (`Dave Miller`, `Sarah Jenkins`, `Robert Fox`...) + Live availability status feed.
  - **Recent Activity Feed:** Real-time log of work order status transitions and booking updates.
  - **Resident Service Reviews Feed:** Star rating cards featuring resident comments post-repair.

---

## 3. Workflow Pipeline Page (`/admin/pipeline`)
- **Route:** `/admin/pipeline`
- **Role:** Office Admin
- **Header Actions:**
  - `+ New Work Order / Quote` (Opens Create Work Order modal)
  - Search filter input
- **5-Stage Kanban Pipeline Columns:**
  1. **Quotes Needed:** New incoming phone requests or quote submissions
  2. **Quote Sent:** Formally estimated quote sent to resident
  3. **Booking Link Sent:** Resident sent SMS link to pick visit date/slot
  4. **Booked Jobs:** Confirmed technician appointments with scheduled date & time slot
  5. **Completed Jobs:** Verified finished repair jobs with resident feedback
- **Card Controls & Drag-Drop:**
  - Cards display job title, resident name & address, duration badge (`1.5h`), assigned technician avatar, and Eye (`👁️`) inspection button.
  - Drag-and-drop support across columns with instant status update.

---

## 4. Tenants & Residents Directory (`/admin/tenants`)
- **Route:** `/admin/tenants`
- **Role:** Office Admin
- **Header Actions:**
  - `+ Add New Resident` (Opens Add Tenant modal)
  - Search bar input
- **Resident Grid / Table:**
  - Displays resident name, contact phone & email, unit/property address, active bookings count badge, and Eye (`👁️`) action button.

---

## 5. Active Booking Links & Statuses (`/admin/booking-links`)
- **Route:** `/admin/booking-links`
- **Role:** Office Admin
- **Header Actions:** `+ Generate Booking Link`
- **Table Columns:**
  - Status Pill (`🟢 BOOKED`, `🟡 WAITING FOR BOOKING`)
  - Resident Name & Address
  - Secure Booking Token URL
  - Scheduled Date & Time Slot (if booked)
  - Action Buttons: Copy SMS Link button, Icon-only Eye (`👁️`) inspection button.

---

## 6. Quote Request Links & Submissions (`/admin/quote-requests`)
- **Route:** `/admin/quote-requests`
- **Role:** Office Admin
- **Header Actions:** `+ Request Resident Photos`
- **Table Columns:**
  - Status Pill (`🟢 COMPLETE`, `🟡 PENDING UPLOAD`)
  - Photo Count Badge (`📷 2 Photos` with Camera icon)
  - Resident Name & Address
  - Work Description Snippet
  - Action Buttons: Icon-only Eye (`👁️`) modal button, Portal External Link (`↗`).

---

## 7. Maintenance Staff & Technicians (`/admin/staff`)
- **Route:** `/admin/staff`
- **Role:** Office Admin
- **Header Actions:** `+ Add Technician`
- **Technician Cards Grid:**
  - Specialty Badge (`Plumbing Specialist`, `Senior Electrician`...)
  - Assigned active jobs count badge
  - Contact phone & email
  - Color badge tag for calendar assignment.

---

## 8. Split-Screen Maintenance Calendar (`/admin/calendar`)
- **Route:** `/admin/calendar` (also accessible via `/maintenance/calendar` for staff)
- **Role:** Office Admin & Maintenance Staff
- **Top Control Bar:**
  - Date Controls: `<` Prev | `August 2026` | Next `>` + `Today` reset button
  - View Mode Switchers: `Monthly View` | `Weekly View` | `Daily View`
  - Technician Filter Dropdown (`All Technicians`, `Dave Miller`, `Sarah Jenkins`...)
- **Split-Screen Dual Panel Structure:**
  - **Left Side (~60% Width — Compact Grid):**
    - Monthly View: 7-day Sun-Sat grid with minimalist dot indicators (`🟢 14:00`). NO cluttering multi-line text cards inside day cells!
    - Weekly View: 7-day Mon-Sun column timeline.
    - Daily View: Hour-by-hour 08:00 AM - 05:00 PM slot list.
  - **Right Side (~40% Width — Work Order Details Panel):**
    - Displays all work order details for the date selected on the left calendar (Job Title, Status Badge, Time Slot, Resident Address, Assigned Technician, and Eye `👁️` View button).
- **Bottom Directory Table:**
  - Comprehensive "Maintenance Tasks & Work Orders Directory" table with live search input.

---

## 9. System Settings (`/admin/settings`)
- **Route:** `/admin/settings`
- **Role:** Office Admin
- **Sections:**
  - General Company Details
  - Shift Working Hours (08:00 AM - 05:00 PM)
  - SMS & Email Notification Triggers
  - Portal Theme & Branding.

---

## 10. Technician Task Portal (`/maintenance/my-tasks`)
- **Route:** `/maintenance/my-tasks`
- **Role:** Maintenance Staff / Technician
- **Mobile-First Layout:**
  - Personal task queue for logged-in technician.
  - Cards show time slot (`14:00 (1.5h)`), job title, resident address, map location link, and status toggles (`Start Job`, `Complete`).
  - Eye (`👁️`) inspection modal for complete work order details.

---

## 11. Public Resident Booking Portal (`/booking/:secureToken`)
- **Route:** `/booking/:secureToken` (Public, Token-Gated)
- **Layout:** Standalone Responsive Portal
- **Steps:**
  1. Welcome Header with property address & work description.
  2. Date Selector (Available shift dates).
  3. Time Slot Picker (`08:00 AM`, `10:00 AM`, `02:00 PM`...).
  4. Instant Booking Confirmation card.

---

## 12. Public Resident Quote Photo Upload Portal (`/quote-upload/:secureToken`)
- **Route:** `/quote-upload/:secureToken` (Public, Token-Gated)
- **Features:**
  - Drag-and-drop repair photo uploader with image previews.
  - Work scope description text box.
  - Submit Quote Request button.

---

## 13. Public Resident Rating & Feedback Portal (`/resident-rating/:secureToken`)
- **Route:** `/resident-rating/:secureToken` (Public, Token-Gated)
- **Features:**
  - 5-Star Interactive Rating input.
  - Feedback comment box.
  - Submit Service Feedback button.

---

## 14. Key Modals Summary

### A. Create New Maintenance Quote / Work Order Modal
- **Trigger:** `+ New Maintenance Job` or `+ New Work Order`
- **Flow:** Pure Manual Resident Entry (NO Auto-fill dropdown clutter!)
- **Fields:**
  - `Job Title *`
  - `Resident / Tenant Name *`
  - `Contact Phone / Email *`
  - `Property Address / Unit Number *`
  - `Hours Required for Job *`
  - `Assigned Technician`
  - `Pipeline Stage / Section`
  - `Work Description Required *`

### B. Work Order Details / Inspection Modal
- **Trigger:** Eye (`👁️`) button across tables & calendar
- **Content:** Full work order breakdown, resident contact, assigned technician badge, scheduled time slot, and submitted resident photos.

# Component Inventory — Nexus FMS (Facility & Maintenance Management System)

This inventory lists all reusable layout, UI, table, form, modal, and badge components in the Nexus FMS codebase.

---

## 1. Layout Components

### `MaintenanceLayout`
- **Location:** `src/layouts/MaintenanceLayout.jsx`
- **Used on:** All `/admin/*` and `/maintenance/*` pages
- **Description:** Primary application frame containing responsive sidebar, fixed top header, and main page outlet container.

### `Sidebar`
- **Location:** `src/components/layout/Sidebar.jsx`
- **Used on:** `MaintenanceLayout`
- **Description:** Fixed left navigation panel with dark navy background (`#00204a`). Collapsible to icon-only view.
- **Nav Links (Admin):** Dashboard, Pipeline, Tenants, Active Booking Links, Quote Requests, Staff, Calendar, Settings.
- **Nav Links (Staff):** My Tasks, Shift Calendar, History, Profile.

### `Header`
- **Location:** `src/components/layout/Header.jsx`
- **Used on:** `MaintenanceLayout`
- **Description:** Top bar containing sidebar toggle menu icon, notification bell dropdown with animated badge, dark navy user avatar, user name text (`Alex Rivera`), role pill (`🛡️ Office Admin` / `🔧 Maintenance Tech`), and sign out button.

### `AuthLayout`
- **Location:** `src/layouts/AuthLayout.jsx`
- **Used on:** `/login`
- **Description:** Centered card container layout for public login page with dark navy glow background.

---

## 2. Navigation & Common UI Components

### `FormModal`
- **Location:** `src/components/modals/FormModal.jsx`
- **Used on:** Create Work Order modal, Work Order Inspection modal, Add Resident modal, Staff details modal.
- **Description:** Reusable modal overlay with smooth Framer Motion backdrop fade, header title, close button (`X`), scrollable body, and action buttons.

### `FormField`
- **Location:** `src/components/forms/FormField.jsx`
- **Used on:** All input forms
- **Description:** Labeled input field supporting text, email, phone, and date types with rounded borders (`rounded-xl bg-slate-50 border-slate-200 text-slate-800 focus:border-[#00204a]`).

### `SelectField`
- **Location:** `src/components/forms/SelectField.jsx`
- **Used on:** All forms with dropdown choices (Hours Required, Staff Allocation, Pipeline Section).
- **Description:** Labeled select input with customized dropdown styling.

---

## 3. Status Badges & Indicators

### `StatusBadge` (Standardized Dot Pills)
- **Location:** Inline & Utility Badges across pages
- **Variants:**
  - `🟢 BOOKED`: Green pill with animated dot (`bg-emerald-50 text-emerald-800 border-emerald-200`)
  - `🟡 WAITING FOR BOOKING`: Amber pill (`bg-amber-50 text-amber-800 border-amber-200`)
  - `🟢 COMPLETE`: Green pill for finished quote uploads / jobs
  - `🟡 PENDING UPLOAD`: Yellow/amber pill for awaiting resident photos
  - `🔵 QUOTE PENDING`: Sky blue pill for initial request

### `RoleBadge`
- **Location:** `Header.jsx`
- **Variants:**
  - `🛡️ Office Admin`: Sky blue badge with Shield icon (`bg-sky-50 text-sky-900 border-sky-200`)
  - `🔧 Maintenance Tech`: Emerald green badge with Wrench icon (`bg-emerald-50 text-emerald-800 border-emerald-200`)

### `PhotoCountBadge`
- **Location:** `MaintenanceQuoteRequestPage.jsx`
- **Description:** Displays photo submission counts with Lucide Camera icon (`<Camera size={13} /> 2 Photos`).

---

## 4. Page Specific Components

### Split-Screen Enterprise Calendar (`MaintenanceCalendarPage.jsx`)
- **Left Panel (Calendar Grid):** Compact 7-day Month grid, Week columns, and Day slot breakdown. Day cells render minimalist dot indicators (`🟢 14:00`).
- **Right Panel (Work Order Details):** Active Date details panel listing all tasks scheduled for the date clicked on the left calendar.
- **Bottom Directory Table:** Master table with live search input for all work orders.

### Kanban Pipeline Board (`MaintenancePipelinePage.jsx`)
- **Columns:** 5 stage columns with task counter badges.
- **Cards:** Drag-and-drop cards with title, resident address, duration badge, technician color badge, and Eye (`👁️`) inspection button.

### Table Action Buttons (Icon-Only Pattern)
- **Eye Inspection Button:** `<button title="View Details" className="p-2 rounded-xl bg-slate-100 hover:bg-[#00204a] text-slate-700 hover:text-white transition-all shadow-2xs"><Eye size={16} /></button>`
- **Portal Link Button:** `<a title="Open Portal Page" className="p-2 rounded-xl bg-slate-100 hover:bg-[#00204a] text-slate-700 hover:text-white transition-all shadow-2xs"><ExternalLink size={16} /></a>`

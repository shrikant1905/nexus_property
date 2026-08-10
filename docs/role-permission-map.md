# Role Permission Map — Nexus FMS (Facility & Maintenance Management System)

## System Role Definitions

### 1. Office Admin (`office-admin`)
- **Portal Access:** `/admin/*`
- **Responsibilities:** Overall maintenance operations management, pipeline tracking, work order creation, staff calendar allocation, resident portal link generation, photo request inspection, and system settings.
- **Header Badge:** `🛡️ Office Admin` (Sky blue badge with Shield icon)

### 2. Maintenance Staff / Technician (`maintenance-staff`, `operations-staff`)
- **Portal Access:** `/maintenance/*`
- **Responsibilities:** Field execution of assigned maintenance work orders, status updates (Start Job, In Progress, Complete), personal shift calendar inspection, work log, and technician profile management.
- **Header Badge:** `🔧 Maintenance Tech` (Emerald green badge with Wrench icon)

### 3. Public Resident / Tenant (Unauthenticated Token Access)
- **Portal Access:** `/booking/:secureToken`, `/quote-upload/:secureToken`, `/resident-rating/:secureToken`
- **Responsibilities:** Self-service booking of technician visit time slots, uploading repair photos & description scope, and submitting post-completion 5-star service reviews.

---

## Permission Matrix by Route & Feature

| Feature / Route | Office Admin | Maintenance Staff | Public Resident |
|-----------------|:------------:|:-----------------:|:---------------:|
| **`/login` Page** | ✅ | ✅ | ✅ |
| **`/admin/dashboard`** | ✅ Full Access | ❌ (Auto-redirect) | ❌ |
| **`/admin/pipeline`** | ✅ Full CRUD & Drag-Drop | ❌ (Auto-redirect) | ❌ |
| **`/admin/tenants`** | ✅ Full Access | ❌ (Auto-redirect) | ❌ |
| **`/admin/booking-links`** | ✅ Manage & Copy Links | ❌ (Auto-redirect) | ❌ |
| **`/admin/quote-requests`** | ✅ Inspect Photos & Links | ❌ (Auto-redirect) | ❌ |
| **`/admin/staff`** | ✅ Manage Technicians | ❌ (Auto-redirect) | ❌ |
| **`/admin/calendar`** | ✅ Full Enterprise Calendar | ✅ Personal Shift Calendar | ❌ |
| **`/admin/settings`** | ✅ System Configuration | ❌ (Auto-redirect) | ❌ |
| **`/maintenance/my-tasks`** | ❌ (Auto-redirect) | ✅ Assigned Tasks Only | ❌ |
| **`/maintenance/history`** | ❌ (Auto-redirect) | ✅ History Archive | ❌ |
| **`/maintenance/profile`** | ❌ (Auto-redirect) | ✅ Profile & Skills | ❌ |
| **`/booking/:token`** | ✅ Link Generator | ❌ | ✅ Slot Selection |
| **`/quote-upload/:token`** | ✅ Request Generator | ❌ | ✅ Photo Uploader |
| **`/resident-rating/:token`** | ✅ Reviews Feed | ❌ | ✅ 5-Star Review |

---

## Action Permissions Table

| Action / Operation | Office Admin | Maintenance Staff | Public Resident |
|--------------------|:------------:|:-----------------:|:---------------:|
| **Create Work Order (Manual Entry)** | ✅ | ❌ | ❌ |
| **Move Pipeline Stage (Drag & Drop)** | ✅ | ❌ | ❌ |
| **Assign Technician to Job** | ✅ | ❌ | ❌ |
| **Generate & Send Booking Link** | ✅ | ❌ | ❌ |
| **Generate & Send Photo Request Link** | ✅ | ❌ | ❌ |
| **Select Visit Time Slot** | ❌ | ❌ | ✅ (Via Token) |
| **Upload Damage / Repair Photos** | ❌ | ❌ | ✅ (Via Token) |
| **Update Job Status (In Progress / Completed)** | ✅ | ✅ (Assigned Jobs) | ❌ |
| **Submit 5-Star Review & Rating** | ❌ | ❌ | ✅ (Via Token) |
| **View Resident Feedback Feed** | ✅ | ✅ (Own Reviews) | ❌ |
| **Filter Calendar by Technician** | ✅ | ❌ (Auto-bound) | ❌ |

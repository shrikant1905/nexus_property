# Data Model Draft — Nexus FMS (Facility & Maintenance Management System)

This document specifies the core data schemas, data types, and mock database structures used in the Nexus FMS application (`src/services/maintenanceMockService.js`).

---

## 1. Job / Work Order Schema (`Job`)

```json
{
  "id": "JOB-101",
  "title": "Main Bathroom Sink Pipe Repair",
  "tenantName": "Jenny Wilson",
  "address": "1042 Ocean Drive, Unit 12",
  "contactPhone": "0121 270 2633",
  "durationHours": 1.5,
  "assignedStaffId": "staff-1",
  "assignedStaffName": "Dave Miller",
  "section": "Booked Jobs",
  "scheduledDate": "2026-08-06",
  "scheduledTimeSlot": "10:00",
  "status": "BOOKED",
  "description": "Leaking pipe under master bathroom sink creating puddle. Needs pipe seal replacement.",
  "managerName": "Maria",
  "secureToken": "token-101-abc",
  "createdAt": "2026-08-01T10:00:00Z"
}
```

### Fields:
- `id` (String): Unique Work Order ID (e.g. `JOB-101`)
- `title` (String): Work Order summary title
- `tenantName` (String): Resident / Tenant full name
- `address` (String): Property address / Unit number
- `contactPhone` (String): Resident contact phone / email
- `durationHours` (Number): Allocated duration in hours (`0.5`, `1.0`, `1.5`, `2.0`, `4.0`, `8.0`)
- `assignedStaffId` (String): Foreign key to assigned Technician (`Staff.id`)
- `assignedStaffName` (String): Cache of assigned technician full name
- `section` (String): Pipeline Stage (`Quotes Needed`, `Quote Sent`, `Booking Link Sent`, `Booked Jobs`, `Completed Jobs`)
- `scheduledDate` (String): ISO date string `YYYY-MM-DD`
- `scheduledTimeSlot` (String): 24-hour time slot (`08:00`, `10:00`, `14:00`...)
- `status` (String): `PENDING_QUOTE` | `QUOTE_SENT` | `LINK_SENT` | `BOOKED` | `IN_PROGRESS` | `COMPLETED`
- `description` (String): Detailed work description required
- `secureToken` (String): Unique token used for resident public portal links

---

## 2. Maintenance Staff / Technician Schema (`Staff`)

```json
{
  "id": "staff-1",
  "name": "Dave Miller",
  "role": "Senior Technician",
  "email": "dave@nexusfms.com",
  "phone": "+44 7911 123456",
  "color": "#a855f7",
  "specialty": "Plumbing Specialist",
  "unavailable": []
}
```

### Fields:
- `id` (String): Staff ID (e.g. `staff-1`)
- `name` (String): Technician full name
- `role` (String): Job title / Role
- `email` (String): Login email address
- `phone` (String): Direct contact phone number
- `color` (String): Hex color code assigned for calendar pills and workload graphs
- `specialty` (String): Skill domain (Plumbing, Electrical, HVAC, Carpentry, Painting)
- `unavailable` (Array of Strings): Dates when technician is off shift

---

## 3. Tenant / Resident Schema (`Tenant`)

```json
{
  "id": "tenant-1",
  "name": "Jenny Wilson",
  "address": "1042 Ocean Drive, Unit 12",
  "phone": "+44 7911 987654",
  "email": "jenny@example.com"
}
```

---

## 4. Booking Link Request Schema (`BookingRequest`)

```json
{
  "id": "BR-201",
  "tenantName": "Cody Fisher",
  "address": "88 Palm Avenue, Suite 3",
  "description": "AC unit blowing warm air",
  "status": "WAITING_FOR_BOOKING",
  "secureToken": "br-token-201",
  "bookingDetails": {
    "date": "2026-08-08",
    "timeSlot": "14:00",
    "staffId": "staff-2"
  }
}
```

---

## 5. Quote Photo Request Schema (`QuoteRequest`)

```json
{
  "id": "QR-301",
  "tenantName": "Robert Fox",
  "address": "742 Evergreen Terrace, Apt 4B",
  "status": "COMPLETE",
  "photos": [
    { "name": "fusebox.jpg", "previewUrl": "/mock/fusebox.jpg" }
  ],
  "residentComments": "Short circuit in fuse box when turning on oven.",
  "secureToken": "qr-token-301"
}
```

---

## 6. Resident Service Rating Schema (`ResidentRating`)

```json
{
  "id": "RR-401",
  "jobId": "JOB-101",
  "residentName": "Jenny Wilson",
  "staffName": "Dave Miller",
  "stars": 5,
  "comment": "Dave Miller arrived on time and fixed the water heater leak within 45 minutes!",
  "createdAt": "2026-08-06"
}
```

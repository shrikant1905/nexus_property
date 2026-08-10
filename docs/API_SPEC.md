# REST API Specification — Nexus FMS

## 1. API Base Information
- **Base URL:** `http://localhost:5000/api/v1`
- **Content-Type:** `application/json`
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`

---

## 2. Authentication Endpoints (`/auth`)

### `POST /auth/login`
- **Access:** Public
- **Request Body:**
  ```json
  {
    "email": "admin@nexusfms.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Alex Rivera",
      "email": "admin@nexusfms.com",
      "role": "office-admin",
      "initials": "AR"
    }
  }
  ```

---

## 3. Work Orders / Jobs Endpoints (`/jobs`)

### `GET /jobs`
- **Access:** Authenticated (`office-admin`, `maintenance-staff`)
- **Query Params:** `section`, `technicianId`, `search`
- **Response (200 OK):** List of all active work orders.

### `POST /jobs` (Create Work Order — Manual Entry Flow)
- **Access:** Admin (`office-admin`)
- **Request Body:**
  ```json
  {
    "title": "Repaint Bathroom Ceiling",
    "managerName": "Robert Fox",
    "contactPhone": "0121 270 2633",
    "address": "Apt 3110 Fabrick Square, B12 0AF",
    "durationHours": 1.5,
    "assignedStaffId": 1,
    "section": "Quotes Needed",
    "description": "Water leak caused paint peeling on ceiling."
  }
  ```
- **Response (201 Created):** Returns created job record with `secure_token`.

### `PUT /jobs/:id/stage` (Move Pipeline Stage)
- **Access:** Admin (`office-admin`)
- **Request Body:** `{ "section": "Booked Jobs" }`
- **Response (200 OK):** Updated job record.

---

## 4. Public Resident Portal Endpoints (`/public`)

### `GET /public/booking/:token`
- **Access:** Public Token Access
- **Description:** Returns booking request details & available time slots for the resident.

### `POST /public/booking/:token/confirm`
- **Access:** Public Token Access
- **Request Body:**
  ```json
  {
    "scheduledDate": "2026-08-08",
    "scheduledTimeSlot": "14:00"
  }
  ```
- **Response (200 OK):** Updates job status to `BOOKED` and assigns time slot.

### `POST /public/quote-upload/:token`
- **Access:** Public Token Access (Multipart Form Data)
- **Fields:** `residentComments` (text), `photos` (Image files)
- **Response (200 OK):** Saves photos to `/uploads/photos/` and updates status to `COMPLETE`.

### `POST /public/rating/:token`
- **Access:** Public Token Access
- **Request Body:**
  ```json
  {
    "stars": 5,
    "comment": "Quick and professional service!"
  }
  ```

---

## 5. Technicians & Calendar Endpoints (`/staff`, `/calendar`)

### `GET /staff`
- **Access:** Authenticated
- **Response (200 OK):** List of all maintenance technicians with assigned workload counts.

### `GET /calendar`
- **Access:** Authenticated
- **Query Params:** `viewMode` (`monthly`|`weekly`|`daily`), `date`, `staffId`
- **Response (200 OK):** Structured day-by-day bookings for left compact calendar matrix and right task details panel.

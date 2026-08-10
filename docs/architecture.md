# Backend System Architecture — Nexus FMS

## 1. Executive Overview
Nexus FMS (Facility & Maintenance Management System) Backend is designed as a robust RESTful API service powering property maintenance pipelines, technician scheduling, resident portals, and enterprise calendars.

- **Backend Runtime:** Node.js (v18+) with Express.js / Node REST framework
- **Database Management System:** MySQL (v8.0+) managed via phpMyAdmin
- **ORM / Database Driver:** `mysql2` / `Sequelize` / `Prisma` (MySQL engine)
- **Authentication:** JWT (JSON Web Tokens) with Role-Based Access Control (`office-admin`, `maintenance-staff`)
- **Public Access Model:** Secure Random Token-Based Access for Resident Portals (No login required for residents)

---

## 2. High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Frontend)                       │
│  React 18 SPA (Vite)                                                   │
│  - Admin Portal (/admin/*)                                             │
│  - Technician Portal (/maintenance/*)                                  │
│  - Public Resident Portals (/booking/*, /quote-upload/*)               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / JSON
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        EXPRESS.JS BACKEND SERVER                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Middleware Layer                              │  │
│  │  - CORS & Helmet Security                                        │  │
│  │  - AuthMiddleware (JWT Token Validation)                         │  │
│  │  - PublicTokenMiddleware (Resident Portal Token Verification)    │  │
│  │  - Error Handler & Logger                                        │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────▼─────────────────────────────────┐  │
│  │                    Controller & Service Layer                    │  │
│  │  - AuthController (Login / Session)                              │  │
│  │  - JobController (Work Orders & Pipeline Stages)                 │  │
│  │  - StaffController (Technicians & Availability)                  │  │
│  │  - BookingController (Slot Scheduling)                           │  │
│  │  - QuoteRequestController (Photo Upload & Inspection)            │  │
│  │  - RatingController (5-Star Resident Feedback)                   │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌────────────────────────────────▼─────────────────────────────────┐  │
│  │                    Data Access Layer (ORM / DAO)                 │  │
│  │  - MySQL Connection Pool (mysql2 / Sequelize)                    │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ TCP 3306
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       DATABASE & STORAGE LAYER                         │
│                                                                        │
│  ┌─────────────────────────┐             ┌──────────────────────────┐  │
│  │   MySQL Database        │             │   phpMyAdmin             │  │
│  │   (Relational Schema)   │◄───────────►│   (Database Management)  │  │
│  └─────────────────────────┘             └──────────────────────────┘  │
│  ┌─────────────────────────┐                                           │
│  │   Media Uploads Folder  │ (Resident submitted repair photos)        │
│  │   (/uploads/photos/)    │                                           │
│  └─────────────────────────┘                                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules & Subsystems

### A. Authentication & Role-Based Security (`/api/v1/auth`)
- **Office Admin Authentication:** Issues JWT token with `role: 'office-admin'`. Access to all management endpoints.
- **Technician Authentication:** Issues JWT token with `role: 'maintenance-staff'`. Scoped strictly to assigned work orders and personal shift calendar.

### B. Work Order & Pipeline Engine (`/api/v1/jobs`)
- Manages full lifecycle of maintenance jobs across 5 stages:
  `Quotes Needed` ➔ `Quote Sent` ➔ `Booking Link Sent` ➔ `Booked Jobs` ➔ `Completed Jobs`.
- Supports manual creation for phone callers (No forced auto-fill dropdown).
- Tracks duration, assigned technician, scheduled date & time slot, and full work description.

### C. Resident Token-Based Portals (`/api/v1/public`)
- **Self-Service Booking Portal:** Generates unique `secure_token` per booking request. Resident selects visit date & 2-hour time slot without needing an account.
- **Photo Upload Portal:** Resident uploads repair photos and work description via tokenized public link.
- **Rating & Review Portal:** Resident submits 5-star rating and feedback post-repair.

### D. Technician Scheduling & Split-Screen Calendar (`/api/v1/calendar`)
- Aggregates assigned work orders by technician, date, and hourly slot (08:00 AM - 05:00 PM).
- Serves data for Monthly 7-day grid, Weekly timeline, and Daily slot breakdown.

---

## 4. Technology Stack & Database Setup
- **Database Engine:** MySQL 8.0+
- **Database GUI:** phpMyAdmin (Default Port: 80/8080 via XAMPP/WAMP/Docker)
- **Database Name:** `nexus_fms_db`
- **Environment Configuration:** `.env` file holding DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, PORT.

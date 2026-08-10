# Database Specification — Nexus FMS (MySQL & phpMyAdmin)

## 1. Database Overview
- **Database Engine:** MySQL 8.0+ / InnoDB
- **Database Name:** `nexus_fms_db`
- **Character Set / Collation:** `utf8mb4` / `utf8mb4_unicode_ci`
- **Management GUI:** phpMyAdmin

---

## 2. Entity Relationship Diagram (ERD Summary)

```
  ┌─────────────┐            ┌──────────────────┐            ┌─────────────┐
  │    users    │            │   technicians    │            │   tenants   │
  └──────┬──────┘            └────────┬─────────┘            └──────┬──────┘
         │ 1                          │ 1                           │ 1
         │                            │                             │
         │ N                          │ N                           │ N
  ┌──────▼────────────────────────────▼─────────────────────────────▼──────┐
  │                              work_orders                               │
  └──────┬────────────────────────────┬─────────────────────────────┬──────┘
         │ 1                          │ 1                           │ 1
         │                            │                             │
         │ 1                          │ 1                           │ N
  ┌──────▼───────────┐         ┌──────▼───────────┐         ┌──────▼───────┐
  │ booking_requests │         │  quote_requests  │         │quote_photos  │
  └──────────────────┘         └──────────────────┘         └──────────────┘
```

---

## 3. Table Definitions & Schemas

### Table 1: `users` (System Authentication)
Stores system accounts for Office Admins and Maintenance Staff.

```sql
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('office-admin', 'maintenance-staff') NOT NULL DEFAULT 'office-admin',
  `initials` VARCHAR(10) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### Table 2: `technicians` (Staff Directory & Availability)
Stores technician profiles, specialties, assigned calendar colors, and contact info.

```sql
CREATE TABLE `technicians` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED DEFAULT NULL,
  `name` VARCHAR(100) NOT NULL,
  `role_title` VARCHAR(100) DEFAULT 'Technician',
  `email` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `color_code` VARCHAR(20) NOT NULL DEFAULT '#a855f7',
  `specialty` VARCHAR(100) DEFAULT 'General Repair',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### Table 3: `tenants` (Residents & Contacts)
Stores resident information and property unit addresses.

```sql
CREATE TABLE `tenants` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `email` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### Table 4: `work_orders` (Jobs Master Table)
Stores all maintenance work orders and pipeline stages.

```sql
CREATE TABLE `work_orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `job_number` VARCHAR(50) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `tenant_id` INT UNSIGNED DEFAULT NULL,
  `tenant_name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `contact_phone` VARCHAR(50) DEFAULT NULL,
  `manager_name` VARCHAR(100) DEFAULT NULL,
  `duration_hours` DECIMAL(3,1) NOT NULL DEFAULT 1.5,
  `technician_id` INT UNSIGNED DEFAULT NULL,
  `section` ENUM('Quotes Needed', 'Quote Sent', 'Booking Link Sent', 'Booked Jobs', 'Completed Jobs') NOT NULL DEFAULT 'Quotes Needed',
  `scheduled_date` DATE DEFAULT NULL,
  `scheduled_time_slot` VARCHAR(20) DEFAULT NULL,
  `status` ENUM('PENDING_QUOTE', 'QUOTE_SENT', 'LINK_SENT', 'BOOKED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'PENDING_QUOTE',
  `description` TEXT NOT NULL,
  `secure_token` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`technician_id`) REFERENCES `technicians`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### Table 5: `booking_requests` (Public Slot Scheduling Links)
Stores SMS booking links generated for residents to pick visit slots.

```sql
CREATE TABLE `booking_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `work_order_id` INT UNSIGNED DEFAULT NULL,
  `tenant_name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `status` ENUM('WAITING_FOR_BOOKING', 'BOOKED', 'EXPIRED') NOT NULL DEFAULT 'WAITING_FOR_BOOKING',
  `secure_token` VARCHAR(100) NOT NULL UNIQUE,
  `booked_date` DATE DEFAULT NULL,
  `booked_time_slot` VARCHAR(20) DEFAULT NULL,
  `assigned_technician_id` INT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_technician_id`) REFERENCES `technicians`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### Table 6: `quote_requests` (Resident Photo Upload Requests)
Stores photo submission requests sent to residents.

```sql
CREATE TABLE `quote_requests` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `work_order_id` INT UNSIGNED DEFAULT NULL,
  `tenant_name` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `status` ENUM('PENDING_UPLOAD', 'COMPLETE') NOT NULL DEFAULT 'PENDING_UPLOAD',
  `resident_comments` TEXT DEFAULT NULL,
  `secure_token` VARCHAR(100) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### Table 7: `quote_photos` (Resident Uploaded Images)
Stores uploaded photo metadata for quote requests.

```sql
CREATE TABLE `quote_photos` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `quote_request_id` INT UNSIGNED NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`quote_request_id`) REFERENCES `quote_requests`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

### Table 8: `resident_ratings` (Post-Repair Reviews)
Stores 5-star ratings and comments submitted by residents.

```sql
CREATE TABLE `resident_ratings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `work_order_id` INT UNSIGNED NOT NULL,
  `resident_name` VARCHAR(100) NOT NULL,
  `technician_name` VARCHAR(100) NOT NULL,
  `stars` TINYINT UNSIGNED NOT NULL CHECK (`stars` BETWEEN 1 AND 5),
  `comment` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`work_order_id`) REFERENCES `work_orders`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 4. phpMyAdmin Import Instructions
1. phpMyAdmin kholein (`http://localhost/phpmyadmin`).
2. Naya Database create karein: `nexus_fms_db` (Collation: `utf8mb4_unicode_ci`).
3. Top menu me **SQL** tab par click karein.
4. Upar diye gaye saare `CREATE TABLE` queries ko paste karke **Go** press karein.

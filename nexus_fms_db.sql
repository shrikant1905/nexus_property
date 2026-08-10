-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 10, 2026 at 11:15 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `nexus_fms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `booking_requests`
--

CREATE TABLE `booking_requests` (
  `id` bigint(20) NOT NULL,
  `work_order_id` bigint(20) NOT NULL,
  `secure_token` varchar(100) NOT NULL,
  `assignment_preference_staff_id` bigint(20) DEFAULT NULL,
  `earliest_date` date DEFAULT NULL,
  `internal_notes` text DEFAULT NULL,
  `status` enum('WAITING_FOR_BOOKING','BOOKED','EXPIRED') NOT NULL DEFAULT 'WAITING_FOR_BOOKING',
  `expires_at` datetime NOT NULL,
  `booked_date` date DEFAULT NULL,
  `booked_time_slot` varchar(50) DEFAULT NULL,
  `booked_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_media_uploads`
--

CREATE TABLE `customer_media_uploads` (
  `id` bigint(20) NOT NULL,
  `quote_request_id` bigint(20) DEFAULT NULL,
  `work_order_id` bigint(20) NOT NULL,
  `media_type` enum('PHOTO','VIDEO') NOT NULL DEFAULT 'PHOTO',
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size_bytes` bigint(20) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quote_requests`
--

CREATE TABLE `quote_requests` (
  `id` bigint(20) NOT NULL,
  `work_order_id` bigint(20) NOT NULL,
  `secure_token` varchar(100) NOT NULL,
  `photo_instructions` text DEFAULT NULL,
  `max_photos` int(11) NOT NULL DEFAULT 5,
  `status` enum('PHOTO_REQUEST_PENDING','SUBMITTED','EXPIRED') NOT NULL DEFAULT 'PHOTO_REQUEST_PENDING',
  `expires_at` datetime NOT NULL,
  `resident_description_report` text DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `residents`
--

CREATE TABLE `residents` (
  `id` bigint(20) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `address` text NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `residents`
--

INSERT INTO `residents` (`id`, `full_name`, `phone`, `email`, `address`, `notes`, `created_at`, `updated_at`) VALUES
(18, 'Phase3H4 Resident', '+1 555 444 5555', NULL, '789 Test Pipeline Blvd', NULL, '2026-08-08 11:34:45', '2026-08-08 11:34:45'),
(19, 'John Test', '+1 555 111 2222', NULL, '101 Staff Repair Ave', NULL, '2026-08-08 11:39:40', '2026-08-08 11:39:40'),
(20, 'Calendar Resident', '+1 555 999 8888', NULL, '505 Calendar Grid Way', NULL, '2026-08-08 11:44:37', '2026-08-08 11:44:37'),
(21, 'Resident Portal Tester', '+1 555 777 6666', NULL, '707 Resident Self-Booking Blvd', NULL, '2026-08-08 11:49:06', '2026-08-08 11:49:06'),
(22, 'Master Audit Resident', '+1 555 000 1111', NULL, '1000 Master System Suite', NULL, '2026-08-08 11:51:26', '2026-08-08 11:51:26');

-- --------------------------------------------------------

--
-- Table structure for table `staff_completion_media`
--

CREATE TABLE `staff_completion_media` (
  `id` bigint(20) NOT NULL,
  `completion_id` bigint(20) NOT NULL,
  `work_order_id` bigint(20) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size_bytes` bigint(20) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_job_completions`
--

CREATE TABLE `staff_job_completions` (
  `id` bigint(20) NOT NULL,
  `work_order_id` bigint(20) NOT NULL,
  `staff_id` bigint(20) NOT NULL,
  `work_report_summary` text NOT NULL,
  `materials_used` text DEFAULT NULL,
  `completion_status` enum('COMPLETED','PARTIALLY_COMPLETED','NEED_FOLLOWUP') NOT NULL DEFAULT 'COMPLETED',
  `completed_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_profiles`
--

CREATE TABLE `staff_profiles` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `staff_code` varchar(50) NOT NULL,
  `role_title` varchar(100) NOT NULL,
  `color_hex` varchar(20) NOT NULL DEFAULT '#009bf2',
  `working_days_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`working_days_json`)),
  `work_start_time` time NOT NULL DEFAULT '08:00:00',
  `work_end_time` time NOT NULL DEFAULT '17:00:00',
  `break_start_time` time NOT NULL DEFAULT '12:00:00',
  `break_end_time` time NOT NULL DEFAULT '13:00:00',
  `unavailable_dates_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`unavailable_dates_json`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff_profiles`
--

INSERT INTO `staff_profiles` (`id`, `user_id`, `staff_code`, `role_title`, `color_hex`, `working_days_json`, `work_start_time`, `work_end_time`, `break_start_time`, `break_end_time`, `unavailable_dates_json`, `created_at`, `updated_at`) VALUES
(28, 2, 'STF-102', 'Maintenance Specialist', '#009bf2', NULL, '08:00:00', '17:00:00', '12:00:00', '13:00:00', NULL, '2026-08-08 11:41:50', '2026-08-08 11:41:50');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `role` enum('OFFICE_ADMIN','MAINTENANCE_STAFF') NOT NULL DEFAULT 'MAINTENANCE_STAFF',
  `phone` varchar(50) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `role`, `phone`, `avatar_url`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'admin@nexusfms.com', '$2a$10$qSfK49lehjyKTtQtKbNTqOx0WOFq65z8T1DJ7N2IG.RjuEs00MFtu', 'Office Admin', 'OFFICE_ADMIN', NULL, NULL, 1, '2026-08-08 09:01:42', '2026-08-08 09:06:05'),
(2, 'staff@nexusfms.com', '$2a$10$qSfK49lehjyKTtQtKbNTqOx0WOFq65z8T1DJ7N2IG.RjuEs00MFtu', 'Maintenance Staff', 'MAINTENANCE_STAFF', NULL, NULL, 1, '2026-08-08 09:01:42', '2026-08-08 09:06:05');

-- --------------------------------------------------------

--
-- Table structure for table `work_orders`
--

CREATE TABLE `work_orders` (
  `id` bigint(20) NOT NULL,
  `job_number` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `resident_id` bigint(20) DEFAULT NULL,
  `resident_name` varchar(150) NOT NULL,
  `contact_phone` varchar(50) NOT NULL,
  `contact_email` varchar(191) DEFAULT NULL,
  `property_address` text NOT NULL,
  `description` text DEFAULT NULL,
  `duration_hours` decimal(4,2) NOT NULL DEFAULT 1.50,
  `pipeline_stage` enum('Quotes','Completed Quotes','Jobs','Completed Jobs','Jobs Waiting Booking') NOT NULL DEFAULT 'Quotes',
  `assigned_staff_id` bigint(20) DEFAULT NULL,
  `manager_name` varchar(150) DEFAULT NULL,
  `quote_amount` decimal(10,2) DEFAULT NULL,
  `scheduled_date` date DEFAULT NULL,
  `scheduled_time_slot` varchar(50) DEFAULT NULL,
  `secure_token` varchar(100) NOT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `booking_requests`
--
ALTER TABLE `booking_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `work_order_id` (`work_order_id`),
  ADD UNIQUE KEY `secure_token` (`secure_token`),
  ADD KEY `idx_booking_requests_status` (`status`),
  ADD KEY `fk_booking_requests_staff_pref` (`assignment_preference_staff_id`);

--
-- Indexes for table `customer_media_uploads`
--
ALTER TABLE `customer_media_uploads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_customer_media_quote_req` (`quote_request_id`),
  ADD KEY `fk_customer_media_work_order` (`work_order_id`);

--
-- Indexes for table `quote_requests`
--
ALTER TABLE `quote_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `work_order_id` (`work_order_id`),
  ADD UNIQUE KEY `secure_token` (`secure_token`),
  ADD KEY `idx_quote_requests_status` (`status`);

--
-- Indexes for table `residents`
--
ALTER TABLE `residents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_residents_phone` (`phone`),
  ADD KEY `idx_residents_email` (`email`);

--
-- Indexes for table `staff_completion_media`
--
ALTER TABLE `staff_completion_media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_completion_media_completion` (`completion_id`),
  ADD KEY `fk_completion_media_work_order` (`work_order_id`);

--
-- Indexes for table `staff_job_completions`
--
ALTER TABLE `staff_job_completions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_staff_completions_work_order` (`work_order_id`),
  ADD KEY `fk_staff_completions_staff` (`staff_id`);

--
-- Indexes for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `staff_code` (`staff_code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role`);

--
-- Indexes for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `job_number` (`job_number`),
  ADD UNIQUE KEY `secure_token` (`secure_token`),
  ADD KEY `idx_work_orders_stage` (`pipeline_stage`),
  ADD KEY `idx_work_orders_scheduled_date` (`scheduled_date`),
  ADD KEY `fk_work_orders_resident` (`resident_id`),
  ADD KEY `fk_work_orders_staff` (`assigned_staff_id`),
  ADD KEY `fk_work_orders_creator` (`created_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `booking_requests`
--
ALTER TABLE `booking_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `customer_media_uploads`
--
ALTER TABLE `customer_media_uploads`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `quote_requests`
--
ALTER TABLE `quote_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `residents`
--
ALTER TABLE `residents`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `staff_completion_media`
--
ALTER TABLE `staff_completion_media`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `staff_job_completions`
--
ALTER TABLE `staff_job_completions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `work_orders`
--
ALTER TABLE `work_orders`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `booking_requests`
--
ALTER TABLE `booking_requests`
  ADD CONSTRAINT `fk_booking_requests_staff_pref` FOREIGN KEY (`assignment_preference_staff_id`) REFERENCES `staff_profiles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_booking_requests_work_order` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_media_uploads`
--
ALTER TABLE `customer_media_uploads`
  ADD CONSTRAINT `fk_customer_media_quote_req` FOREIGN KEY (`quote_request_id`) REFERENCES `quote_requests` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_customer_media_work_order` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quote_requests`
--
ALTER TABLE `quote_requests`
  ADD CONSTRAINT `fk_quote_requests_work_order` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff_completion_media`
--
ALTER TABLE `staff_completion_media`
  ADD CONSTRAINT `fk_completion_media_completion` FOREIGN KEY (`completion_id`) REFERENCES `staff_job_completions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_completion_media_work_order` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff_job_completions`
--
ALTER TABLE `staff_job_completions`
  ADD CONSTRAINT `fk_staff_completions_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_staff_completions_work_order` FOREIGN KEY (`work_order_id`) REFERENCES `work_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff_profiles`
--
ALTER TABLE `staff_profiles`
  ADD CONSTRAINT `fk_staff_profiles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `work_orders`
--
ALTER TABLE `work_orders`
  ADD CONSTRAINT `fk_work_orders_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_work_orders_resident` FOREIGN KEY (`resident_id`) REFERENCES `residents` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_work_orders_staff` FOREIGN KEY (`assigned_staff_id`) REFERENCES `staff_profiles` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

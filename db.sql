-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 24, 2026 at 07:07 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `invoxa`
--

-- --------------------------------------------------------

--
-- Table structure for table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `client_name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `company_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `clients`
--

INSERT INTO `clients` (`id`, `user_id`, `client_name`, `email`, `phone`, `address`, `created_at`, `company_id`) VALUES
(1, 1, 'ABC Retail Pvt Ltd', 'contact@abcretail.com', '9876543210', 'Bangalore', '2026-01-04 18:30:00', 1),
(2, 1, 'Skyline Builders', 'info@skyline.com', '9988776655', 'Mumbai', '2026-01-07 18:30:00', 1),
(3, 1, 'EduTech Academy', 'admin@edutech.com', '9123456780', 'Hyderabad', '2026-01-09 18:30:00', 1),
(4, 2, 'Fashion Hub', 'sales@fashionhub.com', '9871112233', 'Delhi', '2026-01-11 18:30:00', 2),
(5, 2, 'Green Foods', 'contact@greenfoods.com', '9811223344', 'Pune', '2026-01-14 18:30:00', 2),
(6, 3, 'Rajesh Enterprises', 'rajesh@gmail.com', '9870001111', 'Chennai', '2026-01-17 18:30:00', 3),
(7, 3, 'Sunrise School', 'office@sunrise.edu', '9898989898', 'Mysore', '2026-01-19 18:30:00', 3),
(8, 3, 'TechWorld Retail', 'sales@techworld.com', '9876543213', 'Bangalore', '2026-06-16 16:54:35', 3),
(14, 2, 'Sm Company', 'jiya24@sm.com', '07657754567', 'jayanagar, bangalore', '2026-06-19 17:02:46', 2),
(15, 2, 'TechWorld Retail', 'sales@techworld.com', '1111111111', 'Bangalore', '2026-06-19 18:20:47', 2);

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `owner_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `companies`
--

INSERT INTO `companies` (`id`, `name`, `created_at`, `owner_id`) VALUES
(1, 'NovaTech Solutions Pvt Ltd', '2026-01-01 04:30:00', 1),
(2, 'Bright Digital Media', '2026-01-02 18:30:00', 2),
(3, 'QuickFix Computers', '2026-01-03 18:30:00', 3);

-- --------------------------------------------------------

--
-- Table structure for table `company_profiles`
--

CREATE TABLE `company_profiles` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `logo_url` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `contact` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `tax_id` varchar(255) DEFAULT NULL,
  `tax_percentage` decimal(5,2) DEFAULT 0.00,
  `extra_info` text DEFAULT NULL,
  `company_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `company_profiles`
--

INSERT INTO `company_profiles` (`id`, `company_name`, `logo_url`, `address`, `country`, `contact`, `email`, `website`, `phone`, `tax_id`, `tax_percentage`, `extra_info`, `company_id`) VALUES
(9, 'NovaTech Solutions Pvt Ltd', 'https://images.unsplash.com/photo-1560179707-f14e90ef3623', '4th Floor, Business Hub Tower, SG Highway, Ahmedabad, Gujarat 380015', 'India', 'Rahul Sharma', 'contact@novatechsolutions.com', 'https://www.novatechsolutions.com', '+91 98765 43210', 'GSTIN: 24ABCDE1234F1Z5', 18.00, 'Custom software development, cloud solutions, ERP systems, and business automation services.', 1),
(11, 'Bright Digital Media', 'https://images.unsplash.com/photo-1556740749-887f6717d7e4', '12th Floor, Cyber Plaza, Connaught Place, New Delhi 110001', 'India', 'Priya Verma', 'hello@brightdigitalmedia.com', 'https://www.brightdigitalmedia.com', '+91 98123 45678', 'GSTIN: 07FGHIJ5678K1Z2', 18.00, 'Digital marketing, SEO, social media management, branding and advertising campaigns.', 2),
(12, 'QuickFix Computers', 'https://images.unsplash.com/photo-1518770660439-4636190af475', '45 MG Road, Commercial Street, Bengaluru, Karnataka 560001', 'India', 'Amit Kumar', 'support@quickfixcomputers.com', 'https://www.quickfixcomputers.com', '+91 99000 11223', 'GSTIN: 29KLMNO9876P1Z8', 18.00, 'Laptop repairs, desktop servicing, networking setup, annual maintenance contracts.', 3);

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expense_date` date NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `company_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `user_id`, `expense_date`, `category`, `description`, `amount`, `company_id`) VALUES
(1, 1, '2026-01-05', 'Software', 'Hosting Subscription', 5000.00, 1),
(2, 1, '2026-02-10', 'Internet', 'Office Internet', 2500.00, 1),
(3, 1, '2026-03-08', 'Travel', 'Client Meeting', 3500.00, 1),
(4, 2, '2026-03-15', 'Marketing', 'Google Ads', 7000.00, 2),
(5, 2, '2026-05-12', 'Salary', 'Designer Salary', 15000.00, 2),
(6, 3, '2026-04-07', 'Hardware', 'Laptop Parts', 4000.00, 3),
(7, 3, '2026-06-11', 'Rent', 'Shop Rent', 12000.00, 3),
(15, 3, '2026-01-05', 'Rent', 'Shop Rent', 12000.00, 3),
(16, 3, '2026-02-08', 'Hardware', 'SSD Purchase', 4500.00, 3),
(17, 3, '2026-03-10', 'Utilities', 'Electricity Bill', 2200.00, 3),
(18, 3, '2026-04-15', 'Salary', 'Technician Salary', 18000.00, 3),
(19, 3, '2026-05-12', 'Hardware', 'Laptop Parts', 6500.00, 3),
(20, 3, '2026-06-01', 'Internet', 'Broadband Bill', 1500.00, 3),
(22, 2, '2026-06-19', 'Internet', 'Office internet', 3500.00, 2);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `subtotal` decimal(10,2) DEFAULT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `tax_rate` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `discount_type` varchar(20) DEFAULT 'percentage',
  `currency` varchar(10) DEFAULT 'INR',
  `public_token` varchar(64) DEFAULT NULL,
  `invoice_date` date DEFAULT curdate(),
  `company_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`id`, `user_id`, `client_id`, `invoice_number`, `subtotal`, `tax`, `total`, `status`, `due_date`, `created_at`, `tax_rate`, `discount`, `discount_type`, `currency`, `public_token`, `invoice_date`, `company_id`) VALUES
(1, 1, 1, 'INV-2026-001', 25000.00, 4500.00, 29500.00, 'Paid', '2026-01-15', '2026-06-16 14:12:31', 18.00, 0.00, 'percentage', 'INR', 'a7255580c7dfd4142bd03f28df60b2cb', '2026-01-01', 1),
(2, 1, 2, 'INV-2026-002', 40000.00, 7200.00, 47200.00, 'Paid', '2026-02-18', '2026-06-16 14:12:31', 18.00, 0.00, 'percentage', 'INR', '67b2cd5c7a9b2462e8204cce645c33ce', '2026-02-03', 1),
(3, 2, 4, 'INV-2026-003', 15000.00, 2700.00, 17700.00, 'Paid', '2026-03-20', '2026-06-16 14:12:31', 18.00, 5.00, 'percentage', 'INR', '3536efca2b4702e62c070e4cb2f28e20', '2026-03-05', 2),
(4, 3, 6, 'INV-2026-004', 8000.00, 1440.00, 9440.00, 'Pending', '2026-04-25', '2026-06-16 14:12:31', 18.00, 0.00, 'percentage', 'INR', '91da6d0a64c552e10c0a7e7859762374', '2026-04-10', 3),
(5, 2, 5, 'INV-2026-005', 22000.00, 3960.00, 25960.00, 'Partially Paid', '2026-05-15', '2026-06-16 14:12:31', 18.00, 10.00, 'percentage', 'INR', '42220167a17602c2ca1af49d636db0d1', '2026-05-01', 2),
(6, 1, 3, 'INV-2026-006', 55000.00, 9900.00, 64900.00, 'Paid', '2026-06-25', '2026-06-16 14:12:31', 18.00, 0.00, 'percentage', 'INR', '7d8b0607fb23dee90280bfeae290c71e', '2026-06-10', 1),
(7, 3, 8, 'INV-1781629062-7801ddba', 24000.00, 4320.00, 28320.00, 'Paid', '2026-06-12', '2026-06-16 16:57:42', 18.00, 0.00, 'percentage', 'INR', 'c7d338574c0426d641aac435eb432866', '2026-06-16', 3),
(8, 2, 5, 'INV-1781673691-8c8e1040', 2800.00, 392.00, 3192.00, 'Paid', '2026-06-19', '2026-06-17 05:21:31', 14.00, 0.00, 'percentage', 'INR', 'c6de2d7ff337f9bec5582ec07b088d17', '2026-06-17', 2),
(9, 2, 14, 'INV-1781888615-c2df70ae', 16000.00, 2592.00, 16992.00, 'Pending', '2026-06-22', '2026-06-19 17:03:35', 18.00, 10.00, 'percentage', 'INR', 'a4553d1524e3ce44a5c2f8c2b900fc55', '2026-06-19', 2),
(10, 2, 15, 'INV-1781893300-a70d489b', 12600.00, 2041.20, 13381.20, 'Pending', '2026-06-24', '2026-06-19 18:21:40', 18.00, 10.00, 'percentage', 'INR', 'b780319f33b0b2d7c768cc9ba0626015', '2026-06-19', 2);

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

CREATE TABLE `invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `item_name` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `invoice_items`
--

INSERT INTO `invoice_items` (`id`, `invoice_id`, `item_name`, `quantity`, `price`, `total`) VALUES
(1, 1, 'Website Development', 1, 25000.00, 25000.00),
(2, 2, 'Mobile App Design', 1, 40000.00, 40000.00),
(3, 3, 'Facebook Ads Campaign', 3, 5000.00, 15000.00),
(4, 4, 'Laptop Repair', 4, 2000.00, 8000.00),
(5, 5, 'SEO Optimization', 2, 11000.00, 22000.00),
(6, 6, 'ERP Software Development', 1, 55000.00, 55000.00),
(19, 7, 'desktop services', 6, 4000.00, 24000.00),
(20, 8, 'Laptop service', 2, 1400.00, 2800.00),
(21, 9, 'Laptop Service', 8, 2000.00, 16000.00),
(22, 10, 'Laptop service', 6, 2100.00, 12600.00);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) NOT NULL,
  `amount_paid` decimal(10,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `invoice_id`, `amount_paid`, `payment_date`, `payment_method`) VALUES
(1, 1, 29500.00, '2026-01-12', 'Bank Transfer'),
(2, 2, 47200.00, '2026-02-15', 'UPI'),
(3, 3, 10000.00, '2026-03-10', 'Cash'),
(4, 6, 64900.00, '2026-06-20', 'Bank Transfer'),
(9, 7, 28320.00, '2026-06-14', 'UPI'),
(10, 3, 7700.00, '2026-06-17', 'Bank Transfer'),
(11, 8, 3192.00, '2026-06-18', 'Credit Card'),
(12, 5, 20000.00, '2026-06-19', 'Bank Transfer');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `role` varchar(50) DEFAULT 'Owner',
  `company_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `created_at`, `role`, `company_id`) VALUES
(1, 'Rahul Sharma', 'rahul@novatech.com', '$2y$10$VDILw13ppFKHJ1P0W431uOSdTNDvxx.wgDNjGonuLDwU4WgExg5Om', '2026-01-01 04:30:00', 'Owner', 1),
(2, 'Priya Verma', 'priya@brightmedia.com', '$2y$10$VDILw13ppFKHJ1P0W431uOSdTNDvxx.wgDNjGonuLDwU4WgExg5Om', '2026-01-02 18:30:00', 'Owner', 2),
(3, 'Amit Kumar', 'amit@quickfix.com', '$2y$10$VDILw13ppFKHJ1P0W431uOSdTNDvxx.wgDNjGonuLDwU4WgExg5Om', '2026-01-03 18:30:00', 'Owner', 3),
(7, 'Anjali Patel', 'anjali@novatech.com', '$2y$10$KIcs1Oonm7.vLxCNcOqQpefg0H6zzxT/E6.nsMccQBNhBcN4PN2Iq', '2026-01-14 18:30:00', 'Accountant', 1),
(8, 'Vikram Singh', 'vikram@novatech.com', '$2y$10$KIcs1Oonm7.vLxCNcOqQpefg0H6zzxT/E6.nsMccQBNhBcN4PN2Iq', '2026-01-31 18:30:00', 'Manager', 1),
(9, 'Neha Gupta', 'neha@brightmedia.com', '$2y$10$KIcs1Oonm7.vLxCNcOqQpefg0H6zzxT/E6.nsMccQBNhBcN4PN2Iq', '2026-01-19 18:30:00', 'Finance', 2),
(10, 'Arjun Mehta', 'arjun@brightmedia.com', '$2y$10$KIcs1Oonm7.vLxCNcOqQpefg0H6zzxT/E6.nsMccQBNhBcN4PN2Iq', '2026-02-09 18:30:00', 'Sales', 2),
(11, 'Pooja Nair', 'pooja@quickfix.com', '$2y$10$KIcs1Oonm7.vLxCNcOqQpefg0H6zzxT/E6.nsMccQBNhBcN4PN2Iq', '2026-02-28 18:30:00', 'HR Manager', 3),
(12, 'Rohit Das', 'rohit@quickfix.com', '$2y$10$KIcs1Oonm7.vLxCNcOqQpefg0H6zzxT/E6.nsMccQBNhBcN4PN2Iq', '2026-03-14 18:30:00', 'Accountant', 3),
(13, 'Seema k', 'seema@quickfix.com', '$2y$10$qJSKdRq8i2m9kqTs8VscEOxlbPi7Op9ZV8a4IxHl8K7xijbPFwWbe', '2026-06-19 18:25:09', 'Sales', 3);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_clients_company` (`company_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_companies_owner` (`owner_id`);

--
-- Indexes for table `company_profiles`
--
ALTER TABLE `company_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `company_id` (`company_id`),
  ADD UNIQUE KEY `company_id_2` (`company_id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_expenses_company` (`company_id`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `public_token` (`public_token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `fk_invoices_company` (`company_id`);

--
-- Indexes for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_company` (`company_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `companies`
--
ALTER TABLE `companies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `company_profiles`
--
ALTER TABLE `company_profiles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `invoice_items`
--
ALTER TABLE `invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `clients`
--
ALTER TABLE `clients`
  ADD CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_clients_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `fk_companies_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `company_profiles`
--
ALTER TABLE `company_profiles`
  ADD CONSTRAINT `fk_profiles_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_expenses_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_invoices_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `invoices_ibfk_2` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`);

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

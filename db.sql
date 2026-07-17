-- phpMyAdmin SQL
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

--
-- Database: `invoxa`
--

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
--
-- companies
--
CREATE TABLE IF NOT EXISTS `companies` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `owner_id` INT DEFAULT NULL,

    PRIMARY KEY (`id`),
    KEY `idx_companies_owner` (`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- users
--
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `role` VARCHAR(50) DEFAULT 'Owner',
    `company_id` INT DEFAULT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `email` (`email`),
    KEY `fk_users_company` (`company_id`),

    CONSTRAINT `fk_users_company`
        FOREIGN KEY (`company_id`)
        REFERENCES `companies` (`id`)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- company_profiles
--
CREATE TABLE IF NOT EXISTS `company_profiles` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `company_name` VARCHAR(255) NOT NULL,
    `logo_url` TEXT DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `country` VARCHAR(100) DEFAULT NULL,
    `contact` VARCHAR(255) DEFAULT NULL,
    `email` VARCHAR(255) DEFAULT NULL,
    `website` VARCHAR(255) DEFAULT NULL,
    `phone` VARCHAR(50) DEFAULT NULL,
    `tax_id` VARCHAR(255) DEFAULT NULL,
    `tax_percentage` DECIMAL(5,2) DEFAULT 0.00,
    `extra_info` TEXT DEFAULT NULL,
    `company_id` INT NOT NULL,

    PRIMARY KEY (`id`),
    UNIQUE KEY `company_id` (`company_id`),

    CONSTRAINT `fk_profiles_company`
        FOREIGN KEY (`company_id`)
        REFERENCES `companies` (`id`)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- clients
--
CREATE TABLE IF NOT EXISTS `clients` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `client_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) DEFAULT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `address` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `company_id` INT DEFAULT NULL,

    PRIMARY KEY (`id`),
    KEY `idx_clients_user` (`user_id`),
    KEY `idx_clients_company` (`company_id`),

    CONSTRAINT `fk_clients_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`),

    CONSTRAINT `fk_clients_company`
        FOREIGN KEY (`company_id`)
        REFERENCES `companies` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- expenses
--
CREATE TABLE IF NOT EXISTS `expenses` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `expense_date` DATE NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `company_id` INT DEFAULT NULL,

    PRIMARY KEY (`id`),
    KEY `idx_expenses_user` (`user_id`),
    KEY `idx_expenses_company` (`company_id`),

    CONSTRAINT `fk_expenses_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`)
        ON DELETE CASCADE,

    CONSTRAINT `fk_expenses_company`
        FOREIGN KEY (`company_id`)
        REFERENCES `companies` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- --------------------------------------------------------
--
-- invoices
--
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `client_id` INT NOT NULL,
    `invoice_number` VARCHAR(50) DEFAULT NULL,
    `subtotal` DECIMAL(10,2) DEFAULT NULL,
    `tax` DECIMAL(10,2) DEFAULT NULL,
    `total` DECIMAL(10,2) DEFAULT NULL,
    `status` VARCHAR(20) DEFAULT 'Pending',
    `due_date` DATE DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `tax_rate` DECIMAL(10,2) DEFAULT 0.00,
    `discount` DECIMAL(10,2) DEFAULT 0.00,
    `discount_type` VARCHAR(20) DEFAULT 'percentage',
    `currency` VARCHAR(10) DEFAULT 'INR',
    `public_token` VARCHAR(64) DEFAULT NULL,
    `invoice_date` DATE DEFAULT CURDATE(),
    `company_id` INT NOT NULL,

    PRIMARY KEY (`id`),

    UNIQUE KEY `uk_invoice_public_token` (`public_token`),

    KEY `idx_invoice_user` (`user_id`),
    KEY `idx_invoice_client` (`client_id`),
    KEY `idx_invoice_company` (`company_id`),

    CONSTRAINT `fk_invoice_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `users` (`id`),

    CONSTRAINT `fk_invoice_client`
        FOREIGN KEY (`client_id`)
        REFERENCES `clients` (`id`),

    CONSTRAINT `fk_invoice_company`
        FOREIGN KEY (`company_id`)
        REFERENCES `companies` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- invoice_items
--
CREATE TABLE IF NOT EXISTS `invoice_items` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `invoice_id` INT NOT NULL,
    `item_name` VARCHAR(100) DEFAULT NULL,
    `quantity` INT DEFAULT NULL,
    `price` DECIMAL(10,2) DEFAULT NULL,
    `total` DECIMAL(10,2) DEFAULT NULL,

    PRIMARY KEY (`id`),

    KEY `idx_invoice_items_invoice` (`invoice_id`),

    CONSTRAINT `fk_invoice_items_invoice`
        FOREIGN KEY (`invoice_id`)
        REFERENCES `invoices` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
--
-- payments
--
CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `invoice_id` INT NOT NULL,
    `amount_paid` DECIMAL(10,2) DEFAULT NULL,
    `payment_date` DATE DEFAULT NULL,
    `payment_method` VARCHAR(50) DEFAULT NULL,

    PRIMARY KEY (`id`),

    KEY `idx_payment_invoice` (`invoice_id`),

    CONSTRAINT `fk_payment_invoice`
        FOREIGN KEY (`invoice_id`)
        REFERENCES `invoices` (`id`)
        ON DELETE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------
-- --------------------------------------------------------
ALTER TABLE `companies`
ADD CONSTRAINT `fk_companies_owner`
FOREIGN KEY (`owner_id`)
REFERENCES `users`(`id`)
ON DELETE SET NULL;

-- --------------------------------------------------------

COMMIT;

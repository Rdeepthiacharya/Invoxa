<?php

header("Content-Type: application/json");

$host = "localhost";
$username = "root";
$password = "";
$dbname = "invoxa";

try {
    // 1. Connect to MySQL without specifying database first
    $conn = new PDO("mysql:host=$host", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create database if not exists
    $conn->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Verified database '$dbname' exists.\n";

    // 2. Connect to the specific database
    $conn->exec("USE `$dbname`");

    // 2.5 Create companies table
    $conn->exec("CREATE TABLE IF NOT EXISTS `companies` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'companies' table exists.\n";

    // 3. Create users table
    $conn->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) UNIQUE NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `role` VARCHAR(50) DEFAULT 'Owner',
        `company_id` INT NULL,
        FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'users' table exists.\n";

    // Ensure 'role' column exists in 'users' table for existing databases
    $checkRoleCol = $conn->query("SHOW COLUMNS FROM `users` LIKE 'role'");
    if ($checkRoleCol->rowCount() === 0) {
        $conn->exec("ALTER TABLE `users` ADD COLUMN `role` VARCHAR(50) DEFAULT 'Owner'");
        echo "Added column 'role' to users table.\n";
    }

    // Ensure 'company_id' column exists in 'users' table for existing databases
    $checkCompanyIdUsers = $conn->query("SHOW COLUMNS FROM `users` LIKE 'company_id'");
    if ($checkCompanyIdUsers->rowCount() === 0) {
        $conn->exec("ALTER TABLE `users` ADD COLUMN `company_id` INT NULL, ADD CONSTRAINT fk_users_company FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL");
        echo "Added column 'company_id' to users table.\n";
    }

    // Ensure 'owner_id' column exists in 'companies' table for existing databases
    $checkOwnerIdCol = $conn->query("SHOW COLUMNS FROM `companies` LIKE 'owner_id'");
    if ($checkOwnerIdCol->rowCount() === 0) {
        $conn->exec("ALTER TABLE `companies` ADD COLUMN `owner_id` INT NULL");
        echo "Added column 'owner_id' to companies table.\n";
    }

    // Ensure 'owner_id' foreign key constraint exists in 'companies' table
    $constraints = $conn->query("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'companies' AND COLUMN_NAME = 'owner_id' AND CONSTRAINT_NAME != 'PRIMARY'");
    if ($constraints->rowCount() === 0) {
        try {
            $conn->exec("ALTER TABLE `companies` ADD CONSTRAINT fk_companies_owner FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE SET NULL");
            echo "Added foreign key constraint for 'owner_id' to companies table.\n";
        } catch (Exception $e) {
            echo "Constraint for 'owner_id' may already exist or could not be added.\n";
        }
    }

    // 4. Create clients table
    $conn->exec("CREATE TABLE IF NOT EXISTS `clients` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `client_name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255),
        `phone` VARCHAR(50),
        `address` TEXT,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'clients' table exists.\n";

    // 5. Create invoices table
    $conn->exec("CREATE TABLE IF NOT EXISTS `invoices` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `client_id` INT NOT NULL,
        `invoice_number` VARCHAR(50) UNIQUE NOT NULL,
        `subtotal` DECIMAL(10,2) NOT NULL,
        `tax` DECIMAL(10,2) NOT NULL,
        `total` DECIMAL(10,2) NOT NULL,
        `due_date` DATE NOT NULL,
        `status` VARCHAR(20) DEFAULT 'Pending',
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
        FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'invoices' table exists.\n";

    // 6. Create invoice_items table
    $conn->exec("CREATE TABLE IF NOT EXISTS `invoice_items` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `invoice_id` INT NOT NULL,
        `item_name` VARCHAR(255) NOT NULL,
        `quantity` INT NOT NULL,
        `price` DECIMAL(10,2) NOT NULL,
        `total` DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'invoice_items' table exists.\n";

    // 7. Create payments table
    $conn->exec("CREATE TABLE IF NOT EXISTS `payments` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `invoice_id` INT NOT NULL,
        `amount_paid` DECIMAL(10,2) NOT NULL,
        `payment_date` DATE NOT NULL,
        `payment_method` VARCHAR(50) NOT NULL,
        FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'payments' table exists.\n";

    // 8. Create expenses table
    $conn->exec("CREATE TABLE IF NOT EXISTS `expenses` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `user_id` INT NOT NULL,
        `expense_date` DATE NOT NULL,
        `category` VARCHAR(100) NOT NULL,
        `description` TEXT,
        `amount` DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'expenses' table exists.\n";

    // 9. Create company profile table
    $conn->exec("CREATE TABLE IF NOT EXISTS `company_profiles` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `company_id` INT NOT NULL UNIQUE,
        `company_name` VARCHAR(255) NOT NULL,
        `logo_url` TEXT,
        `address` TEXT,
        `country` VARCHAR(100),
        `contact` VARCHAR(255),
        `email` VARCHAR(255),
        `website` VARCHAR(255),
        `phone` VARCHAR(50),
        `tax_id` VARCHAR(255),
        `tax_percentage` DECIMAL(5,2) DEFAULT 0.00,
        `extra_info` TEXT,
        FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Verified 'company_profiles' table exists.\n";

    // Fix existing databases: drop user_id FK if it exists
    try {
        $fkCheck = $conn->query("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS WHERE TABLE_NAME='company_profiles' AND COLUMN_NAME='user_id'");
        if ($fkCheck->rowCount() > 0) {
            $fk = $fkCheck->fetch(PDO::FETCH_ASSOC);
            $conn->exec("ALTER TABLE `company_profiles` DROP FOREIGN KEY `" . $fk['CONSTRAINT_NAME'] . "`");
            echo "Dropped user_id foreign key from company_profiles.\n";
        }
    } catch (Exception $e) {
        // Constraint may not exist
    }

    // Drop user_id column if it exists
    try {
        $userIdCheck = $conn->query("SHOW COLUMNS FROM `company_profiles` LIKE 'user_id'");
        if ($userIdCheck->rowCount() > 0) {
            $conn->exec("ALTER TABLE `company_profiles` DROP COLUMN `user_id`");
            echo "Dropped user_id column from company_profiles.\n";
        }
    } catch (Exception $e) {
        // Column may not exist
    }

    // Ensure 'company_id' column exists in 'company_profiles' table for existing databases
    $checkCompanyIdProfile = $conn->query("SHOW COLUMNS FROM `company_profiles` LIKE 'company_id'");
    if ($checkCompanyIdProfile->rowCount() === 0) {
        $conn->exec("ALTER TABLE `company_profiles` ADD COLUMN `company_id` INT NULL UNIQUE, ADD CONSTRAINT fk_profiles_company FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE");
        echo "Added column 'company_id' to company_profiles table.\n";
    }

    // 10. Add newer columns to invoices table if they don't exist
    $columnsToAdd = [
        "company_id" => "INT NOT NULL",
        "tax_rate" => "DECIMAL(10,2) DEFAULT 0.00",
        "discount" => "DECIMAL(10,2) DEFAULT 0.00",
        "discount_type" => "VARCHAR(20) DEFAULT 'percentage'",
        "currency" => "VARCHAR(10) DEFAULT 'INR'",
        "public_token" => "VARCHAR(64) UNIQUE NULL",
        "invoice_date" => "DATE DEFAULT CURRENT_DATE",
        "status" => "VARCHAR(20) DEFAULT 'Pending'"
    ];

    foreach ($columnsToAdd as $col => $definition) {
        $checkCol = $conn->query("SHOW COLUMNS FROM `invoices` LIKE '$col'");
        if ($checkCol->rowCount() === 0) {
            $conn->exec("ALTER TABLE `invoices` ADD COLUMN `$col` $definition");
            echo "Added column '$col' to invoices table.\n";
        } else {
            echo "Column '$col' already exists in invoices table.\n";
        }
    }

    // 9. Set default values for existing rows
    $conn->exec("UPDATE `invoices` SET `currency` = 'INR' WHERE `currency` IS NULL OR `currency` = ''");
    $conn->exec("UPDATE `invoices` SET `tax_rate` = 18.00 WHERE `tax_rate` = 0.00 OR `tax_rate` IS NULL");

    // 10. Generate public tokens for existing invoices
    $stmt = $conn->query("SELECT id FROM `invoices` WHERE `public_token` IS NULL");
    $invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($invoices) > 0) {
        $updateToken = $conn->prepare("UPDATE `invoices` SET `public_token` = ? WHERE `id` = ?");
        foreach ($invoices as $invoice) {
            $token = bin2hex(random_bytes(16));
            $updateToken->execute([$token, $invoice['id']]);
        }
        echo "Generated public tokens for " . count($invoices) . " existing invoices.\n";
    }

    // --- Data Migration for Multi-Tenant Companies ---
    $stmt = $conn->query("SELECT id, name, role, company_id FROM users WHERE company_id IS NULL");
    $unlinkedUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($unlinkedUsers) > 0) {
        $compCheck = $conn->query("SELECT id FROM companies LIMIT 1");
        $defaultCompany = $compCheck->fetch(PDO::FETCH_ASSOC);

        $defaultCompanyId = null;
        if ($defaultCompany) {
            $defaultCompanyId = (int)$defaultCompany['id'];
        } else {
            $conn->exec("INSERT INTO companies (name) VALUES ('My Default Company')");
            $defaultCompanyId = (int)$conn->lastInsertId();
            echo "Created default company 'My Default Company' for migrations.\n";
        }

        $updateUserComp = $conn->prepare("UPDATE users SET company_id = ? WHERE id = ?");
        foreach ($unlinkedUsers as $u) {
            $updateUserComp->execute([$defaultCompanyId, $u['id']]);
        }
        echo "Linked " . count($unlinkedUsers) . " unlinked users to company ID $defaultCompanyId.\n";
    }

    try {
        $stmt = $conn->query("SELECT cp.id, cp.user_id, cp.company_name, u.company_id FROM company_profiles cp JOIN users u ON cp.user_id = u.id WHERE cp.company_id IS NULL");
        $unlinkedProfiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
        if (count($unlinkedProfiles) > 0) {
            $updateProfileComp = $conn->prepare("UPDATE company_profiles SET company_id = ? WHERE id = ?");
            foreach ($unlinkedProfiles as $p) {
                try {
                    $updateProfileComp->execute([$p['company_id'], $p['id']]);
                } catch (PDOException $e) {
                    $conn->exec("DELETE FROM company_profiles WHERE id = " . $p['id']);
                }
            }
            echo "Migrated company profiles to use company_id.\n";
        }
    } catch (Exception $e) {
        echo "Note: Could not query cp.user_id (already migrated/dropped).\n";
    }


    $stmt = $conn->query("SELECT c.id, c.name FROM companies c LEFT JOIN company_profiles cp ON c.id = cp.company_id WHERE cp.company_id IS NULL");
    $companiesWithoutProfiles = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (count($companiesWithoutProfiles) > 0) {
        $insertProfile = $conn->prepare("INSERT INTO company_profiles (company_id, company_name, logo_url, address, country, contact, email, website, phone, tax_id, tax_percentage, extra_info) VALUES (?, ?, '', '', '', '', '', '', '', '', 0.00, '')");
        foreach ($companiesWithoutProfiles as $c) {
            $insertProfile->execute([$c['id'], $c['name']]);
        }
        echo "Created default empty profiles for " . count($companiesWithoutProfiles) . " companies.\n";
    }

    // --- Data Migration for Company Owners ---
    $stmt = $conn->query("SELECT id FROM companies WHERE owner_id IS NULL");
    $companiesWithoutOwner = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($companiesWithoutOwner) > 0) {
        $updateOwnerStmt = $conn->prepare("UPDATE companies SET owner_id = ? WHERE id = ?");
        foreach ($companiesWithoutOwner as $company) {
            $companyId = $company['id'];

            // Try to find an Owner in this company
            $ownerCheck = $conn->prepare("SELECT id FROM users WHERE company_id = ? AND role = 'Owner' LIMIT 1");
            $ownerCheck->execute([$companyId]);
            $owner = $ownerCheck->fetch(PDO::FETCH_ASSOC);

            if ($owner) {
                $updateOwnerStmt->execute([$owner['id'], $companyId]);
            } else {
                // If no Owner, get the first user in the company
                $firstUserCheck = $conn->prepare("SELECT id FROM users WHERE company_id = ? ORDER BY id ASC LIMIT 1");
                $firstUserCheck->execute([$companyId]);
                $firstUser = $firstUserCheck->fetch(PDO::FETCH_ASSOC);

                if ($firstUser) {
                    $updateOwnerStmt->execute([$firstUser['id'], $companyId]);
                }
            }
        }
        echo "Set owners for " . count($companiesWithoutOwner) . " companies.\n";
    }

    // --- Data Migration for Invoices with company_id ---
    try {
        // Populate company_id for invoices that don't have it (from user's company)
        $conn->exec("UPDATE invoices i 
            JOIN users u ON i.user_id = u.id 
            SET i.company_id = u.company_id 
            WHERE i.company_id = 0 OR i.company_id IS NULL");
        echo "Migrated invoices to have company_id from their creator's company.\n";
    } catch (Exception $e) {
        echo "Note: Could not migrate invoices - " . $e->getMessage() . "\n";
    }

    // Add foreign key constraint for company_id in invoices if it doesn't exist
    try {
        $fkCheck = $conn->query("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME='invoices' AND COLUMN_NAME='company_id' AND REFERENCED_TABLE_NAME='companies'");
        if ($fkCheck->rowCount() === 0) {
            $conn->exec("ALTER TABLE `invoices` ADD CONSTRAINT fk_invoices_company FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE");
            echo "Added foreign key constraint for company_id in invoices table.\n";
        }
    } catch (Exception $e) {
        echo "Note: Could not add FK - " . $e->getMessage() . "\n";
    }

    // --- Data Migration for Clients with company_id ---
    try {
        $checkCol = $conn->query("SHOW COLUMNS FROM `clients` LIKE 'company_id'");
        if ($checkCol->rowCount() === 0) {
            $conn->exec("ALTER TABLE `clients` ADD COLUMN `company_id` INT NULL");
            echo "Added column 'company_id' to clients table.\n";
        }
        $conn->exec("UPDATE clients c JOIN users u ON c.user_id = u.id SET c.company_id = u.company_id WHERE c.company_id IS NULL OR c.company_id = 0");
        echo "Migrated clients to have company_id from their creator's company.\n";

        // Add foreign key constraint for company_id in clients
        $fkCheck = $conn->query("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME='clients' AND COLUMN_NAME='company_id' AND REFERENCED_TABLE_NAME='companies'");
        if ($fkCheck->rowCount() === 0) {
            $conn->exec("ALTER TABLE `clients` ADD CONSTRAINT fk_clients_company FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE");
            echo "Added foreign key constraint for company_id in clients table.\n";
        }
    } catch (Exception $e) {
        echo "Note: Could not migrate clients - " . $e->getMessage() . "\n";
    }

    // --- Data Migration for Expenses with company_id ---
    try {
        $checkCol = $conn->query("SHOW COLUMNS FROM `expenses` LIKE 'company_id'");
        if ($checkCol->rowCount() === 0) {
            $conn->exec("ALTER TABLE `expenses` ADD COLUMN `company_id` INT NULL");
            echo "Added column 'company_id' to expenses table.\n";
        }
        $conn->exec("UPDATE expenses e JOIN users u ON e.user_id = u.id SET e.company_id = u.company_id WHERE e.company_id IS NULL OR e.company_id = 0");
        echo "Migrated expenses to have company_id from their creator's company.\n";

        // Add foreign key constraint for company_id in expenses
        $fkCheck = $conn->query("SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME='expenses' AND COLUMN_NAME='company_id' AND REFERENCED_TABLE_NAME='companies'");
        if ($fkCheck->rowCount() === 0) {
            $conn->exec("ALTER TABLE `expenses` ADD CONSTRAINT fk_expenses_company FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE");
            echo "Added foreign key constraint for company_id in expenses table.\n";
        }
    } catch (Exception $e) {
        echo "Note: Could not migrate expenses - " . $e->getMessage() . "\n";
    }


    echo json_encode([
        "success" => true,
        "message" => "Database schema setup and migrations completed successfully!"
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Migration failed: " . $e->getMessage()
    ]);
}

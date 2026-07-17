<?php

require_once "../config/bootstrap.php";

$action = $_GET["action"] ?? "";

// 1. GET USERS / TEAM MEMBERS
if ($action === "get") {
    requireRole(["Owner", "HR", "HR Manager", "Manager"]);
    $company_id = getCompanyId();
    logRequest();

    try {
        $stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE company_id = ? ORDER BY id ASC");
        $stmt->execute([$company_id]);
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        sendJson([
            "success" => true,
            "users" => $users
        ]);
    } catch (PDOException $e) {
        errorResponse("Failed to retrieve users: " . $e->getMessage(), "RETRIEVE_USERS_FAILED", 500);
    }
}

// 2. ADD USER
if ($action === "add") {
    requireRole(["Owner", "HR", "HR Manager"]);
    $company_id = getCompanyId();
    $data = readJsonBody();
    logRequest();

    $name = trim($data->name ?? "");
    $email = trim($data->email ?? "");
    $password = trim($data->password ?? "");
    $role = trim($data->role ?? "Accountant");

    if (!$name || !$email || !$password || !$role) {
        errorResponse("All fields (name, email, password, role) are required", "ADD_USER_MISSING_FIELDS");
    }

    if (!validateEmail($email)) {
        errorResponse("A valid email address is required", "ADD_USER_INVALID_EMAIL");
    }

    if (strlen($password) < 8) {
        errorResponse("Password must be at least 8 characters long", "ADD_USER_WEAK_PASSWORD");
    }

    $allowedRoles = ["Owner", "HR", "HR Manager", "Manager", "Sales", "Finance", "Accountant"];
    if (!in_array($role, $allowedRoles)) {
        errorResponse("Invalid user role specified", "ADD_USER_INVALID_ROLE");
    }

    try {
        $check = $conn->prepare("SELECT id FROM users WHERE email = ? AND company_id = ?");
        $check->execute([$email, $company_id]);
        if ($check->rowCount() > 0) {
            errorResponse("A user with this email already exists in your company", "ADD_USER_EMAIL_EXISTS", 409);
        }

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, company_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $hashedPassword, $role, $company_id]);

        sendJson([
            "success" => true,
            "message" => "User added successfully to your company"
        ]);
    } catch (PDOException $e) {
        errorResponse("Failed to add user: " . $e->getMessage(), "ADD_USER_FAILED", 500);
    }
}

// 3. UPDATE USER
if ($action === "update") {
    requireRole(["Owner", "HR", "HR Manager"]);
    $company_id = getCompanyId();
    $currentUserId = requireAuth();
    $data = readJsonBody();
    logRequest();

    $userId = (int) ($data->id ?? 0);
    $name = trim($data->name ?? "");
    $email = trim($data->email ?? "");

    if (!$userId) {
        errorResponse("User ID is required", "UPDATE_USER_MISSING_ID");
    }

    if (!$name || !$email) {
        errorResponse("Name and email are required", "UPDATE_USER_MISSING_FIELDS");
    }

    if (!validateEmail($email)) {
        errorResponse("A valid email address is required", "UPDATE_USER_INVALID_EMAIL");
    }

    try {
        $check = $conn->prepare("SELECT id, company_id, role FROM users WHERE id = ?");
        $check->execute([$userId]);
        $userToUpdate = $check->fetch(PDO::FETCH_ASSOC);

        if (!$userToUpdate) {
            errorResponse("User not found", "UPDATE_USER_NOT_FOUND", 404);
        }

        if ((int) $userToUpdate["company_id"] !== $company_id) {
            errorResponse("You can only update users in your company", "UPDATE_USER_UNAUTHORIZED", 403);
        }

        if ($userToUpdate["role"] === "Owner" && $userId !== $currentUserId) {
            errorResponse("HR cannot modify Owner information", "UPDATE_USER_OWNER_PROTECTED", 403);
        }

        $emailCheck = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ? AND company_id = ?");
        $emailCheck->execute([$email, $userId, $company_id]);
        if ($emailCheck->rowCount() > 0) {
            errorResponse("A user with this email already exists in your company", "UPDATE_USER_EMAIL_EXISTS", 409);
        }

        $stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        $stmt->execute([$name, $email, $userId]);

        $stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

        logMessage("INFO", "User updated", ["user_id" => $userId, "updated_by" => $currentUserId]);

        sendJson([
            "success" => true,
            "message" => "User updated successfully",
            "user" => $updatedUser
        ]);
    } catch (PDOException $e) {
        errorResponse("Failed to update user: " . $e->getMessage(), "UPDATE_USER_FAILED", 500);
    }
}

// 4. UPDATE USER ROLE
if ($action === "update-role") {
    $currentUserRole = requireRole(["Owner", "HR", "HR Manager"]);
    $company_id = getCompanyId();
    $currentUserId = requireAuth();
    $data = readJsonBody();
    logRequest();

    $userId = (int) ($data->id ?? 0);
    $newRole = trim($data->role ?? "");

    if (!$userId) {
        errorResponse("User ID is required", "UPDATE_ROLE_MISSING_ID");
    }

    if (!$newRole) {
        errorResponse("New role is required", "UPDATE_ROLE_MISSING_ROLE");
    }

    $allowedRoles = ["Owner", "HR", "HR Manager", "Manager", "Sales", "Finance", "Accountant"];
    if (!in_array($newRole, $allowedRoles)) {
        errorResponse("Invalid role specified", "UPDATE_ROLE_INVALID_ROLE");
    }

    try {
        $check = $conn->prepare("SELECT id, company_id, role FROM users WHERE id = ?");
        $check->execute([$userId]);
        $userToUpdate = $check->fetch(PDO::FETCH_ASSOC);

        if (!$userToUpdate) {
            errorResponse("User not found", "UPDATE_ROLE_USER_NOT_FOUND", 404);
        }

        if ((int) $userToUpdate["company_id"] !== $company_id) {
            errorResponse("You can only update roles for users in your company", "UPDATE_ROLE_UNAUTHORIZED", 403);
        }

        if ($userId === $currentUserId && $userToUpdate["role"] === "Owner" && $newRole !== "Owner") {
            errorResponse("You cannot remove your own Owner role", "UPDATE_ROLE_OWNER_SELF_REMOVE", 403);
        }

        if ($currentUserRole === "HR" || $currentUserRole === "HR Manager") {
            if ($userToUpdate["role"] === "Owner" || $newRole === "Owner") {
                errorResponse("HR managers cannot assign or remove the Owner role", "UPDATE_ROLE_FORBIDDEN", 403);
            }
        }

        if ($userToUpdate["role"] === $newRole) {
            sendJson([
                "success" => true,
                "message" => "User role is already set to " . $newRole
            ]);
        }

        $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
        $stmt->execute([$newRole, $userId]);

        $stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

        logMessage("INFO", "User role updated", [
            "user_id" => $userId,
            "old_role" => $userToUpdate["role"],
            "new_role" => $newRole,
            "updated_by" => $currentUserId
        ]);

        sendJson([
            "success" => true,
            "message" => "User role updated from " . $userToUpdate["role"] . " to " . $newRole,
            "user" => $updatedUser
        ]);
    } catch (PDOException $e) {
        errorResponse("Failed to update user role: " . $e->getMessage(), "UPDATE_ROLE_FAILED", 500);
    }
}

// 5. DELETE USER
if ($action === "delete") {
    $currentUserRole = requireRole(["Owner", "HR", "HR Manager"]);
    $currentUserId = requireAuth();
    $data = readJsonBody();
    logRequest();

    $deleteId = (int) ($data->id ?? 0);

    if (!$deleteId) {
        errorResponse("User ID is required", "DELETE_USER_MISSING_ID");
    }

    if ($deleteId === $currentUserId) {
        errorResponse("You cannot delete your own account", "DELETE_USER_SELF_DELETE", 400);
    }

    try {
        $check = $conn->prepare("SELECT role FROM users WHERE id = ?");
        $check->execute([$deleteId]);
        $userToDelete = $check->fetch(PDO::FETCH_ASSOC);

        if (!$userToDelete) {
            errorResponse("User not found", "DELETE_USER_NOT_FOUND", 404);
        }

        if (($currentUserRole === "HR" || $currentUserRole === "HR Manager") && $userToDelete["role"] === "Owner") {
            errorResponse("HR managers cannot delete Owner accounts", "DELETE_USER_FORBIDDEN", 403);
        }

        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$deleteId]);

        sendJson([
            "success" => true,
            "message" => "User deleted successfully"
        ]);
    } catch (PDOException $e) {
        errorResponse("Failed to delete user: " . $e->getMessage(), "DELETE_USER_FAILED", 500);
    }
}

// 6. GET USER PROFILE
if ($action === "get-profile") {
    $userId = requireAuth();
    logRequest();

    try {
        $stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            errorResponse("User profile not found", "USER_PROFILE_NOT_FOUND", 404);
        }

        sendJson([
            "success" => true,
            "profile" => $user
        ]);
    } catch (PDOException $e) {
        errorResponse("Failed to fetch user profile: " . $e->getMessage(), "FETCH_PROFILE_FAILED", 500);
    }
}

// 7. SAVE USER PROFILE
if ($action === "save-profile") {
    $userId = requireAuth();
    $data = readJsonBody();
    logRequest();

    $name = trim($data->name ?? "");
    $email = trim($data->email ?? "");
    $password = trim($data->password ?? "");

    if (!$name || !$email) {
        errorResponse("Name and email are required", "USER_PROFILE_MISSING_FIELDS");
    }

    if (!validateEmail($email)) {
        errorResponse("A valid email address is required", "USER_PROFILE_INVALID_EMAIL");
    }

    try {
        $check = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
        $check->execute([$email, $userId]);
        if ($check->rowCount() > 0) {
            errorResponse("A user with this email already exists", "USER_PROFILE_EMAIL_EXISTS", 409);
        }

        if ($password) {
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $conn->prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?");
            $stmt->execute([$name, $email, $hashedPassword, $userId]);
        } else {
            $stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
            $stmt->execute([$name, $email, $userId]);
        }

        $stmt = $conn->prepare("SELECT id, name, email, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $updatedUser = $stmt->fetch(PDO::FETCH_ASSOC);

        sendJson([
            "success" => true,
            "message" => "Profile updated successfully",
            "user" => $updatedUser
        ]);
    } catch (PDOException $e) {
        errorResponse("Failed to update profile: " . $e->getMessage(), "UPDATE_PROFILE_FAILED", 500);
    }
}

// 8. GET COMPANY PROFILE
if ($action === "get-company-profile") {
    $company_id = getCompanyId();
    logRequest();

    $stmt = $conn->prepare(
        "SELECT company_name, logo_url, address, country, contact, email, website, phone, tax_id, tax_percentage, extra_info
         FROM company_profiles
         WHERE company_id = ?"
    );
    $stmt->execute([$company_id]);
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$profile) {
        $compStmt = $conn->prepare("SELECT name FROM companies WHERE id = ?");
        $compStmt->execute([$company_id]);
        $company = $compStmt->fetch(PDO::FETCH_ASSOC);
        $companyName = $company ? $company["name"] : "My Company";

        $insert = $conn->prepare(
            "INSERT INTO company_profiles
             (company_id, company_name, logo_url, address, country, contact, email, website, phone, tax_id, tax_percentage, extra_info)
             VALUES (?, ?, '', '', '', '', '', '', '', '', 0.00, '')"
        );
        $insert->execute([$company_id, $companyName]);

        $profile = [
            "company_name" => $companyName,
            "logo_url" => "",
            "address" => "",
            "country" => "",
            "contact" => "",
            "email" => "",
            "website" => "",
            "phone" => "",
            "tax_id" => "",
            "tax_percentage" => "0.00",
            "extra_info" => ""
        ];
    }

    sendJson([
        "success" => true,
        "profile" => $profile
    ]);
}

// 9. SAVE COMPANY PROFILE
if ($action === "save-company-profile") {
    requireRole(["Owner"]);
    $company_id = getCompanyId();
    $data = readJsonBody();
    logRequest();

    $company_name = trim($data->company_name ?? "");
    $logo_url = trim($data->logo_url ?? "");
    $address = trim($data->address ?? "");
    $country = trim($data->country ?? "");
    $contact = trim($data->contact ?? "");
    $email = trim($data->email ?? "");
    $website = trim($data->website ?? "");
    $phone = trim($data->phone ?? "");
    $tax_id = trim($data->tax_id ?? "");
    $tax_percentage = (float) ($data->tax_percentage ?? 0);
    $extra_info = trim($data->extra_info ?? "");

    if (!$company_name) {
        errorResponse("Company name is required", "PROFILE_MISSING_NAME");
    }

    if (!$address) {
        errorResponse("Address is required", "PROFILE_MISSING_ADDRESS");
    }

    if (!$country) {
        errorResponse("Country is required", "PROFILE_MISSING_COUNTRY");
    }

    if (!$email || !validateEmail($email)) {
        errorResponse("A valid email is required", "PROFILE_INVALID_EMAIL");
    }

    if ($website && !sanitizeAndValidateWebsite($website)) {
        errorResponse("Website must be a valid URL", "PROFILE_INVALID_WEBSITE");
    }

    if ($phone && !validatePhone($phone)) {
        errorResponse("Phone number is invalid", "PROFILE_INVALID_PHONE");
    }

    if ($logo_url && !validateLogoUrl($logo_url)) {
        errorResponse("Logo URL must be a valid URL or relative path", "PROFILE_INVALID_LOGO_URL");
    }

    if ($tax_percentage < 0 || $tax_percentage > 100) {
        errorResponse("Tax percentage must be between 0 and 100", "PROFILE_INVALID_TAX_PERCENTAGE");
    }

    $check = $conn->prepare("SELECT id FROM company_profiles WHERE company_id = ?");
    $check->execute([$company_id]);
    $exists = $check->fetch(PDO::FETCH_ASSOC);

    if ($exists) {
        $stmt = $conn->prepare(
            "UPDATE company_profiles
             SET company_name = ?, logo_url = ?, address = ?, country = ?, contact = ?, email = ?, website = ?, phone = ?, tax_id = ?, tax_percentage = ?, extra_info = ?
             WHERE company_id = ?"
        );
        $stmt->execute([
            $company_name,
            $logo_url,
            $address,
            $country,
            $contact,
            $email,
            $website,
            $phone,
            $tax_id,
            $tax_percentage,
            $extra_info,
            $company_id
        ]);
    } else {
        $stmt = $conn->prepare(
            "INSERT INTO company_profiles
             (company_id, company_name, logo_url, address, country, contact, email, website, phone, tax_id, tax_percentage, extra_info)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $company_id,
            $company_name,
            $logo_url,
            $address,
            $country,
            $contact,
            $email,
            $website,
            $phone,
            $tax_id,
            $tax_percentage,
            $extra_info
        ]);
    }

    sendJson([
        "success" => true,
        "message" => "Company profile saved successfully"
    ]);
}

// 10. GET COMPANY INFO
if ($action === "get-company-info") {
    requireAuth();
    $company_id = getCompanyId();
    logRequest();

    try {
        $stmt = $conn->prepare(
            "SELECT c.id, c.name, c.created_at, u.id as owner_id, u.name as owner_name, u.email as owner_email, 
                    (SELECT COUNT(*) FROM users WHERE company_id = c.id) as member_count
             FROM companies c
             LEFT JOIN users u ON c.owner_id = u.id
             WHERE c.id = ?"
        );
        $stmt->execute([$company_id]);
        $company = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$company) {
            errorResponse("Company not found", "COMPANY_NOT_FOUND", 404);
        }

        sendJson([
            "success" => true,
            "company" => $company
        ]);
    } catch (PDOException $e) {
        errorResponse("Failed to retrieve company info: " . $e->getMessage(), "COMPANY_INFO_FAILED", 500);
    }
}

http_response_code(400);
echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);

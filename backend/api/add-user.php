<?php

require_once "../config/bootstrap.php";

// Only Owners and HR are allowed to add new users
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
    // Check if email already exists (within the company)
    $check = $conn->prepare("SELECT id FROM users WHERE email = ? AND company_id = ?");
    $check->execute([$email, $company_id]);
    if ($check->rowCount() > 0) {
        errorResponse("A user with this email already exists in your company", "ADD_USER_EMAIL_EXISTS", 409);
    }

    // Hash password and insert with company_id
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

<?php

require_once "../config/bootstrap.php";

// Only Owners and HR are allowed to update users
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
    // Check if user exists and belongs to the same company
    $check = $conn->prepare("SELECT id, company_id, role FROM users WHERE id = ?");
    $check->execute([$userId]);
    $userToUpdate = $check->fetch(PDO::FETCH_ASSOC);

    if (!$userToUpdate) {
        errorResponse("User not found", "UPDATE_USER_NOT_FOUND", 404);
    }

    if ((int) $userToUpdate["company_id"] !== $company_id) {
        errorResponse("You can only update users in your company", "UPDATE_USER_UNAUTHORIZED", 403);
    }

    // Cannot change Owner's email (in most cases should be protected)
    if ($userToUpdate["role"] === "Owner" && $userId !== $currentUserId) {
        errorResponse("HR cannot modify Owner information", "UPDATE_USER_OWNER_PROTECTED", 403);
    }

    // Check if new email is already taken by someone else in the company
    $emailCheck = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ? AND company_id = ?");
    $emailCheck->execute([$email, $userId, $company_id]);
    if ($emailCheck->rowCount() > 0) {
        errorResponse("A user with this email already exists in your company", "UPDATE_USER_EMAIL_EXISTS", 409);
    }

    // Update user information
    $stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
    $stmt->execute([$name, $email, $userId]);

    // Fetch updated user to return
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

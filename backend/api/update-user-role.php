<?php

require_once "../config/bootstrap.php";

// Only Owners and HR are allowed to update user roles
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
    errorResponse("Invalid role specified. Allowed roles: Owner, HR, HR Manager, Manager, Sales, Finance, Accountant", "UPDATE_ROLE_INVALID_ROLE");
}

try {
    // Check if user exists and belongs to the same company
    $check = $conn->prepare("SELECT id, company_id, role FROM users WHERE id = ?");
    $check->execute([$userId]);
    $userToUpdate = $check->fetch(PDO::FETCH_ASSOC);

    if (!$userToUpdate) {
        errorResponse("User not found", "UPDATE_ROLE_USER_NOT_FOUND", 404);
    }

    if ((int) $userToUpdate["company_id"] !== $company_id) {
        errorResponse("You can only update roles for users in your company", "UPDATE_ROLE_UNAUTHORIZED", 403);
    }

    // Prevent removing Owner role from current user
    if ($userId === $currentUserId && $userToUpdate["role"] === "Owner" && $newRole !== "Owner") {
        errorResponse("You cannot remove your own Owner role", "UPDATE_ROLE_OWNER_SELF_REMOVE", 403);
    }

    // Prevent HR/HR Manager from changing roles to/from Owner
    if ($currentUserRole === "HR" || $currentUserRole === "HR Manager") {
        if ($userToUpdate["role"] === "Owner" || $newRole === "Owner") {
            errorResponse("HR managers cannot assign or remove the Owner role", "UPDATE_ROLE_FORBIDDEN", 403);
        }
    }

    // Check if role is changing (to avoid unnecessary updates)
    if ($userToUpdate["role"] === $newRole) {
        sendJson([
            "success" => true,
            "message" => "User role is already set to " . $newRole
        ]);
        exit();
    }

    // Update user role
    $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->execute([$newRole, $userId]);

    // Fetch updated user to return
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

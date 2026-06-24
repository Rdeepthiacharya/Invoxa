<?php

require_once "../config/bootstrap.php";

// Only Owners and HR are allowed to delete users
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
    // Check if user to delete exists
    $check = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $check->execute([$deleteId]);
    $userToDelete = $check->fetch(PDO::FETCH_ASSOC);

    if (!$userToDelete) {
        errorResponse("User not found", "DELETE_USER_NOT_FOUND", 404);
    }

    // HR cannot delete an Owner
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

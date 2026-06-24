<?php

require_once "../config/bootstrap.php";

// Only Owners, HR, and Managers are allowed to view the user list
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

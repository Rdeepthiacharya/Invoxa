<?php

require_once "../config/bootstrap.php";

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

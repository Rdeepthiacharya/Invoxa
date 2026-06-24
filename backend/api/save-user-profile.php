<?php

require_once "../config/bootstrap.php";

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
    // Check if email is already taken by someone else
    $check = $conn->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $check->execute([$email, $userId]);
    if ($check->rowCount() > 0) {
        errorResponse("A user with this email already exists", "USER_PROFILE_EMAIL_EXISTS", 409);
    }

    if ($password) {
        // Update name, email, and password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $conn->prepare("UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?");
        $stmt->execute([$name, $email, $hashedPassword, $userId]);
    } else {
        // Update name and email only
        $stmt = $conn->prepare("UPDATE users SET name = ?, email = ? WHERE id = ?");
        $stmt->execute([$name, $email, $userId]);
    }

    // Fetch updated user to return
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

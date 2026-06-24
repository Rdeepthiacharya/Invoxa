<?php

require_once "../config/bootstrap.php";

$data = readJsonBody();

$email = trim($data->email ?? "");
$password = trim($data->password ?? "");

if (!$email || !$password) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required"
    ]);
    exit();
}

$stmt = $conn->prepare(
    "SELECT * FROM users WHERE email = ?"
);
$stmt->execute([$email]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user && password_verify($password, $user["password"])) {
    $_SESSION["user_id"] = $user["id"];
    $_SESSION["company_id"] = $user["company_id"];
    $_SESSION["role"] = $user["role"];

    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $user["id"],
            "name" => $user["name"],
            "email" => $user["email"],
            "role" => $user["role"],
            "company_id" => $user["company_id"]
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Invalid credentials"
    ]);
}

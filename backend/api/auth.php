<?php

require_once "../config/bootstrap.php";

$action = $_GET["action"] ?? "";

if ($action === "login") {
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

    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
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
    exit();
}

if ($action === "register") {
    $data = readJsonBody();
    $name = trim($data->name ?? "");
    $email = trim($data->email ?? "");
    $password = trim($data->password ?? "");
    $company_name = trim($data->company_name ?? "");

    if (!$name || !$email || !$password || !$company_name) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "All fields (name, email, password, company name) are required"
        ]);
        exit();
    }

    $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
    $check->execute([$email]);

    if ($check->rowCount() > 0) {
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "message" => "Email already exists"
        ]);
        exit();
    }

    try {
        $conn->beginTransaction();

        // 1. Create company
        $stmt = $conn->prepare("INSERT INTO companies (name) VALUES (?)");
        $stmt->execute([$company_name]);
        $companyId = (int) $conn->lastInsertId();

        // 2. Create default company profile
        $stmt = $conn->prepare("INSERT INTO company_profiles (company_id, company_name, logo_url, address, country, contact, email, website, phone, tax_id, tax_percentage, extra_info) VALUES (?, ?, '', '', '', '', '', '', '', '', 0.00, '')");
        $stmt->execute([$companyId, $company_name]);

        // 3. Create user
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $stmt = $conn->prepare("INSERT INTO users (name, email, password, role, company_id) VALUES (?, ?, ?, 'Owner', ?)");
        $stmt->execute([$name, $email, $hashedPassword, $companyId]);
        $userId = (int) $conn->lastInsertId();

        // 4. Set the new user as company owner
        $stmt = $conn->prepare("UPDATE companies SET owner_id = ? WHERE id = ?");
        $stmt->execute([$userId, $companyId]);

        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => "Registration successful"
        ]);
    } catch (PDOException $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to complete registration: " . $e->getMessage()
        ]);
    }
    exit();
}

if ($action === "logout") {
    session_destroy();
    echo json_encode([
        "success" => true,
        "message" => "Logged out"
    ]);
    exit();
}

http_response_code(400);
echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);

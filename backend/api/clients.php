<?php

require_once "../config/bootstrap.php";

$action = $_GET["action"] ?? "";

// 1. GET CLIENTS
if ($action === "get") {
    requireRole(["Owner", "Manager", "Sales", "Finance", "Accountant"]);
    $company_id = getCompanyId();

    $stmt = $conn->prepare(
        "SELECT * FROM clients
         WHERE company_id = ?
         ORDER BY client_name ASC"
    );
    $stmt->execute([$company_id]);

    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

// 2. ADD CLIENT
if ($action === "add") {
    requireRole(["Owner", "Manager", "Sales"]);
    $user_id = requireAuth();
    $company_id = getCompanyId();
    $data = readJsonBody();

    $client_name = trim($data->client_name ?? "");
    $email = trim($data->email ?? "");
    $phone = trim($data->phone ?? "");
    $address = trim($data->address ?? "");

    if (!$client_name) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Client name is required"
        ]);
        exit();
    }

    $stmt = $conn->prepare(
        "INSERT INTO clients
        (user_id, company_id, client_name, email, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $user_id,
        $company_id,
        $client_name,
        $email,
        $phone,
        $address
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Client added successfully"
    ]);
    exit();
}

// 3. UPDATE CLIENT
if ($action === "update") {
    requireRole(["Owner", "Manager", "Sales"]);
    $company_id = getCompanyId();
    $data = readJsonBody();

    $id = (int) ($data->id ?? 0);
    $client_name = trim($data->client_name ?? "");
    $email = trim($data->email ?? "");
    $phone = trim($data->phone ?? "");
    $address = trim($data->address ?? "");

    if (!$id || !$client_name) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Client ID and name are required"
        ]);
        exit();
    }

    $stmt = $conn->prepare(
        "UPDATE clients
         SET client_name = ?, email = ?, phone = ?, address = ?
         WHERE id = ? AND company_id = ?"
    );
    $stmt->execute([
        $client_name,
        $email,
        $phone,
        $address,
        $id,
        $company_id
    ]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Client not found or no changes made"
        ]);
        exit();
    }

    echo json_encode([
        "success" => true,
        "message" => "Client updated successfully"
    ]);
    exit();
}

// 4. DELETE CLIENT
if ($action === "delete") {
    requireRole(["Owner", "Manager", "Sales"]);
    $company_id = getCompanyId();
    $data = readJsonBody();

    $id = (int) ($data->id ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Client ID is required"
        ]);
        exit();
    }

    $stmt = $conn->prepare(
        "DELETE FROM clients
         WHERE id = ? AND company_id = ?"
    );
    $stmt->execute([$id, $company_id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Client not found"
        ]);
        exit();
    }

    echo json_encode([
        "success" => true,
        "message" => "Client deleted"
    ]);
    exit();
}

http_response_code(400);
echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);

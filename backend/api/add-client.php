<?php

require_once "../config/bootstrap.php";

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


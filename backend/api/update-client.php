<?php

require_once "../config/bootstrap.php";

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
        "message" => "Client not found"
    ]);
    exit();
}

echo json_encode([
    "success" => true,
    "message" => "Client updated successfully"
]);


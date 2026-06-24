<?php

require_once "../config/bootstrap.php";

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


<?php

require_once "../config/bootstrap.php";

requireRole(["Owner", "Manager", "Sales", "Finance", "Accountant"]);
$company_id = getCompanyId();

$stmt = $conn->prepare(
    "SELECT * FROM clients
     WHERE company_id = ?
     ORDER BY client_name ASC"
);
$stmt->execute([$company_id]);

echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));


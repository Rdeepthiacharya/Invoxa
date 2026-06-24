<?php

require_once "../config/bootstrap.php";

requireRole(["Owner", "Manager", "Sales", "Finance", "Accountant"]);
$company_id = getCompanyId();

$stmt = $conn->prepare(
    "SELECT
        invoices.*,
        clients.client_name,
        clients.email AS client_email,
        clients.phone AS client_phone,
        clients.address AS client_address,
        users.name AS issuer_name,
        users.email AS issuer_email
     FROM invoices
     JOIN clients ON invoices.client_id = clients.id
     JOIN users ON invoices.user_id = users.id
     WHERE invoices.company_id = ?
     ORDER BY invoices.id DESC"
);
$stmt->execute([$company_id]);

$invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($invoices as &$invoice) {
    $invoice["status"] = resolveInvoiceStatus($invoice);
}

echo json_encode($invoices);


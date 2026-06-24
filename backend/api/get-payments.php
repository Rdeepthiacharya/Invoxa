<?php

require_once "../config/bootstrap.php";

requireRole(["Owner", "Manager", "Finance", "Accountant"]);
$company_id = getCompanyId();

$stmt = $conn->prepare(
    "SELECT
        payments.id,
        payments.amount_paid,
        payments.payment_date,
        payments.payment_method,
        invoices.invoice_number,
        clients.client_name
     FROM payments
     JOIN invoices ON payments.invoice_id = invoices.id
     JOIN clients ON invoices.client_id = clients.id
     WHERE invoices.company_id = ?
     ORDER BY payments.id DESC"
);
$stmt->execute([$company_id]);

$payments = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($payments);


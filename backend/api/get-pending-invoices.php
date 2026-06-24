<?php

require_once "../config/bootstrap.php";

requireRole(["Owner", "Manager", "Sales", "Finance", "Accountant"]);
$company_id = getCompanyId();

$stmt = $conn->prepare(
    "SELECT
        invoices.*,
        clients.client_name,
        (invoices.total - IFNULL((SELECT SUM(amount_paid) FROM payments WHERE payments.invoice_id = invoices.id), 0)) AS balance_due
     FROM invoices
     JOIN clients ON invoices.client_id = clients.id
     WHERE invoices.company_id = ?
       AND invoices.status != 'Paid'
     ORDER BY invoices.id DESC"
);
$stmt->execute([$company_id]);

$invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($invoices as &$invoice) {
    $invoice["status"] = resolveInvoiceStatus($invoice);
}

echo json_encode($invoices);


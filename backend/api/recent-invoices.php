<?php

require_once "../config/bootstrap.php";

requireRole(["Owner", "Manager", "Sales", "Finance", "Accountant"]);
$company_id = getCompanyId();

$stmt = $conn->prepare(
    "SELECT id, invoice_number, total, status, due_date
     FROM invoices
     WHERE company_id = ?
     ORDER BY id DESC
     LIMIT 5"
);
$stmt->execute([$company_id]);

$invoices = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($invoices as &$invoice) {
    if (
        $invoice["status"] === "Pending" &&
        strtotime($invoice["due_date"]) < time()
    ) {
        $invoice["status"] = "Overdue";
    }
}

echo json_encode($invoices);


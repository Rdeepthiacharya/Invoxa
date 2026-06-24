<?php

require_once "../config/bootstrap.php";

$token = trim($_GET["token"] ?? "");

if (!$token) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invoice token is required"
    ]);
    exit();
}

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
     WHERE invoices.public_token = ?"
);
$stmt->execute([$token]);

$invoice = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$invoice) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "Invoice not found"
    ]);
    exit();
}

$invoice["status"] = resolveInvoiceStatus($invoice);

$invoice_id = $invoice["id"];

$itemsStmt = $conn->prepare(
    "SELECT item_name, quantity, price, total
     FROM invoice_items
     WHERE invoice_id = ?"
);
$itemsStmt->execute([$invoice_id]);
$items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

$paymentsStmt = $conn->prepare(
    "SELECT id, amount_paid, payment_date, payment_method
     FROM payments
     WHERE invoice_id = ?
     ORDER BY id DESC"
);
$paymentsStmt->execute([$invoice_id]);
$payments = $paymentsStmt->fetchAll(PDO::FETCH_ASSOC);

$totalPaid = 0.00;
foreach ($payments as $p) {
    $totalPaid += (float)$p["amount_paid"];
}
$invoice["total_paid"] = $totalPaid;
$invoice["balance_due"] = max(0.00, (float)$invoice["total"] - $totalPaid);

$profileStmt = $conn->prepare(
    "SELECT company_name, logo_url, address, contact, email, website, tax_id, extra_info
     FROM company_profiles
     WHERE company_id = ?"
);
$profileStmt->execute([$invoice["company_id"]]);
$companyProfile = $profileStmt->fetch(PDO::FETCH_ASSOC) ?: [];

echo json_encode([
    "success" => true,
    "invoice" => $invoice,
    "items" => $items,
    "payments" => $payments,
    "company_profile" => $companyProfile
]);

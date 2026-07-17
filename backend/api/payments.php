<?php

require_once "../config/bootstrap.php";

$action = $_GET["action"] ?? "";

// 1. GET PAYMENTS
if ($action === "get") {
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
    exit();
}

// 2. ADD PAYMENT
if ($action === "add") {
    requireRole(["Owner", "Finance", "Accountant"]);
    $user_id = requireAuth();
    $company_id = getCompanyId();
    $data = readJsonBody();

    $invoice_id = (int) ($data->invoice_id ?? 0);
    $amount = (float) ($data->amount ?? 0);
    $payment_method = trim($data->payment_method ?? "Cash");
    $payment_date = trim($data->payment_date ?? "");

    if (!$invoice_id || $amount <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invoice ID and a positive amount are required"
        ]);
        exit();
    }

    if (!$payment_date) {
        $payment_date = date("Y-m-d");
    }

    $check = $conn->prepare(
        "SELECT total FROM invoices WHERE id = ? AND company_id = ?"
    );
    $check->execute([$invoice_id, $company_id]);
    $invoice = $check->fetch(PDO::FETCH_ASSOC);

    if (!$invoice) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Invoice not found"
        ]);
        exit();
    }

    $invoice_total = (float)$invoice["total"];

    $stmt = $conn->prepare(
        "INSERT INTO payments
        (invoice_id, amount_paid, payment_date, payment_method)
        VALUES (?, ?, ?, ?)"
    );
    $stmt->execute([$invoice_id, $amount, $payment_date, $payment_method]);

    $paymentsSum = $conn->prepare(
        "SELECT IFNULL(SUM(amount_paid), 0) AS total_paid
         FROM payments
         WHERE invoice_id = ?"
    );
    $paymentsSum->execute([$invoice_id]);
    $total_paid = (float)$paymentsSum->fetch(PDO::FETCH_ASSOC)["total_paid"];

    $newStatus = "Pending";
    if ($total_paid >= $invoice_total) {
        $newStatus = "Paid";
    } elseif ($total_paid > 0) {
        $newStatus = "Partially Paid";
    }

    $updateStmt = $conn->prepare(
        "UPDATE invoices SET status = ? WHERE id = ? AND company_id = ?"
    );
    $updateStmt->execute([$newStatus, $invoice_id, $company_id]);

    echo json_encode([
        "success" => true,
        "message" => "Payment recorded successfully",
        "status" => $newStatus
    ]);
    exit();
}

http_response_code(400);
echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);

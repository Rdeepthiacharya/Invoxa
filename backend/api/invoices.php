<?php

require_once "../config/bootstrap.php";

$action = $_GET["action"] ?? "";

// 1. GET INVOICES
if ($action === "get") {
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
    exit();
}

// 2. GET INVOICE DETAIL
if ($action === "detail") {
    $user_id = requireAuth();
    $company_id = getCompanyId();

    $invoice_id = (int) ($_GET["id"] ?? 0);

    if (!$invoice_id) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invoice ID is required"
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
         WHERE invoices.id = ? AND invoices.company_id = ?"
    );
    $stmt->execute([$invoice_id, $company_id]);

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
    exit();
}

// 3. GET PENDING INVOICES
if ($action === "pending") {
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
    exit();
}

// 4. GET PUBLIC INVOICE
if ($action === "public") {
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
    exit();
}

// 5. CREATE INVOICE
if ($action === "create") {
    requireRole(["Owner", "Manager", "Sales"]);
    $user_id = requireAuth();
    $company_id = getCompanyId();
    $data = readJsonBody();
    logRequest();

    $client_id = (int) ($data->client_id ?? 0);
    $due_date = trim($data->due_date ?? "");
    $tax_rate = (float) ($data->tax_rate ?? 0);
    $discount = (float) ($data->discount ?? 0);
    $discount_type = trim($data->discount_type ?? "percentage");
    $currency = trim($data->currency ?? "INR");
    $items = $data->items ?? [];

    if (!$client_id) {
        errorResponse("Client is required", "INVOICE_MISSING_CLIENT");
    }

    if (!$due_date || !strtotime($due_date)) {
        errorResponse("A valid due date is required", "INVOICE_INVALID_DUE_DATE");
    }

    if (empty($items) || !is_array($items)) {
        errorResponse("At least one invoice item is required", "INVOICE_MISSING_ITEMS");
    }

    $clientCheck = $conn->prepare(
        "SELECT id FROM clients WHERE id = ? AND company_id = ?"
    );
    $clientCheck->execute([$client_id, $company_id]);

    if (!$clientCheck->fetch()) {
        errorResponse("Invalid client", "INVOICE_INVALID_CLIENT", 403);
    }

    if (!$currency || !preg_match('/^[A-Z]{3}$/', strtoupper($currency))) {
        errorResponse("A valid 3-letter currency code is required", "INVOICE_INVALID_CURRENCY");
    }

    if (!in_array($discount_type, ["percentage", "flat"], true)) {
        errorResponse("Discount type must be 'percentage' or 'flat'", "INVOICE_INVALID_DISCOUNT_TYPE");
    }

    $calculatedSubtotal = 0.0;
    $cleanItems = [];
    foreach ($items as $index => $item) {
        $name = trim($item->item_name ?? "");
        $quantity = (int) ($item->quantity ?? 0);
        $price = (float) ($item->price ?? 0);

        if (!$name) {
            errorResponse("Item description is required for line item " . ($index + 1), "INVOICE_ITEM_MISSING_NAME");
        }

        if ($quantity <= 0) {
            errorResponse("Quantity must be greater than 0 for item " . ($index + 1), "INVOICE_ITEM_INVALID_QUANTITY");
        }

        if ($price < 0) {
            errorResponse("Price cannot be negative for item " . ($index + 1), "INVOICE_ITEM_INVALID_PRICE");
        }

        $itemTotal = $quantity * $price;
        $calculatedSubtotal += $itemTotal;
        $cleanItems[] = [
            'item_name' => $name,
            'quantity' => $quantity,
            'price' => $price,
            'total' => $itemTotal
        ];
    }

    $calculatedDiscount = 0.0;
    if ($discount > 0) {
        if ($discount_type === "percentage") {
            $calculatedDiscount = ($calculatedSubtotal * $discount) / 100;
        } else {
            $calculatedDiscount = $discount;
        }
    }

    $taxableBase = max(0.0, $calculatedSubtotal - $calculatedDiscount);
    $calculatedTax = $taxableBase * ($tax_rate / 100);
    $calculatedTotal = round($taxableBase + $calculatedTax, 2);

    $invoice_number = "INV-" . time() . "-" . bin2hex(random_bytes(4));
    $public_token = bin2hex(random_bytes(16));

    $stmt = $conn->prepare(
        "INSERT INTO invoices
        (user_id, company_id, client_id, invoice_number, subtotal, tax, total, due_date, invoice_date, tax_rate, discount, discount_type, currency, public_token)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $user_id,
        $company_id,
        $client_id,
        $invoice_number,
        $calculatedSubtotal,
        $calculatedTax,
        $calculatedTotal,
        $due_date,
        date('Y-m-d'),
        $tax_rate,
        $discount,
        $discount_type,
        strtoupper($currency),
        $public_token
    ]);

    $invoice_id = $conn->lastInsertId();

    foreach ($cleanItems as $item) {
        $itemStmt = $conn->prepare(
            "INSERT INTO invoice_items
            (invoice_id, item_name, quantity, price, total)
            VALUES (?, ?, ?, ?, ?)"
        );
        $itemStmt->execute([
            $invoice_id,
            $item['item_name'],
            $item['quantity'],
            $item['price'],
            $item['total']
        ]);
    }

    sendJson([
        "success" => true,
        "invoice_id" => $invoice_id,
        "invoice_number" => $invoice_number,
        "subtotal" => $calculatedSubtotal,
        "tax" => $calculatedTax,
        "total" => $calculatedTotal
    ]);
    exit();
}

http_response_code(400);
echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);

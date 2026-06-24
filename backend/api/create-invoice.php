<?php

require_once "../config/bootstrap.php";

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

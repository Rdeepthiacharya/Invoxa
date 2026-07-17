<?php

require_once "../config/bootstrap.php";

$action = $_GET["action"] ?? "";

// 1. GET EXPENSES
if ($action === "get") {
    requireRole(["Owner", "Manager", "Finance", "Accountant"]);
    $company_id = getCompanyId();

    $stmt = $conn->prepare(
        "SELECT id, expense_date, category, description, amount
         FROM expenses
         WHERE company_id = ?
         ORDER BY expense_date DESC"
    );
    $stmt->execute([$company_id]);

    $expenses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($expenses);
    exit();
}

// 2. ADD EXPENSE
if ($action === "add") {
    requireRole(["Owner", "Finance", "Accountant"]);
    $user_id = requireAuth();
    $company_id = getCompanyId();
    $data = readJsonBody();

    $expense_date = trim($data->expense_date ?? "");
    $category = trim($data->category ?? "");
    $description = trim($data->description ?? "");
    $amount = (float) ($data->amount ?? 0);

    if (!$expense_date || !$category || $amount <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Date, category and a positive amount are required."
        ]);
        exit();
    }

    $insert = $conn->prepare(
        "INSERT INTO expenses
         (user_id, company_id, expense_date, category, description, amount)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $insert->execute([$user_id, $company_id, $expense_date, $category, $description, $amount]);

    echo json_encode([
        "success" => true,
        "message" => "Expense recorded successfully."
    ]);
    exit();
}

http_response_code(400);
echo json_encode([
    "success" => false,
    "message" => "Invalid action"
]);

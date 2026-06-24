<?php

require_once "../config/bootstrap.php";

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


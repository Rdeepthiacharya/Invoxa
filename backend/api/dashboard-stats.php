<?php

require_once "../config/bootstrap.php";

$user_id = requireAuth();
$company_id = getCompanyId();

// Retrieve current user role
$roleStmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
$roleStmt->execute([$user_id]);
$userData = $roleStmt->fetch(PDO::FETCH_ASSOC);
$userRole = $userData["role"] ?? "Owner";

// 1. HR Manager / HR Dashboard
if ($userRole === "HR" || $userRole === "HR Manager") {
    $teamCountQuery = $conn->prepare("SELECT COUNT(*) AS total_team FROM users WHERE company_id = ?");
    $teamCountQuery->execute([$company_id]);
    $teamCount = (int)$teamCountQuery->fetch(PDO::FETCH_ASSOC)["total_team"];

    sendJson([
        "revenue" => 0,
        "pending" => 0,
        "clients" => 0,
        "overdue" => 0,
        "overdue_amount" => 0,
        "total_expenses" => 0,
        "net_profit" => 0,
        "profit_margin" => 0,
        "revenue_trends" => [],
        "expense_trends" => [],
        "top_clients" => [],
        "avg_payment_days" => 0,
        "team_count" => $teamCount
    ]);
    sendJson([
        "role" => $userRole,
        "company_id" => $company_id
    ]);
}

// 2. Sales Dashboard
if ($userRole === "Sales") {
    $clients = $conn->prepare(
        "SELECT COUNT(*) AS total_clients
         FROM clients
         WHERE company_id = ?"
    );
    $clients->execute([$company_id]);
    $totalClients = $clients->fetch(PDO::FETCH_ASSOC);

    $overdue = $conn->prepare(
        "SELECT COUNT(*) AS overdue_count
         FROM invoices
         WHERE company_id = ?
         AND status != 'Paid'
         AND due_date < CURDATE()"
    );
    $overdue->execute([$company_id]);
    $overdueCount = $overdue->fetch(PDO::FETCH_ASSOC);

    sendJson([
        "revenue" => 0,
        "pending" => 0,
        "clients" => $totalClients["total_clients"],
        "overdue" => $overdueCount["overdue_count"],
        "overdue_amount" => 0,
        "total_expenses" => 0,
        "net_profit" => 0,
        "profit_margin" => 0,
        "revenue_trends" => [],
        "expense_trends" => [],
        "top_clients" => [],
        "avg_payment_days" => 0
    ]);
}

// 3. Owner, Manager, Finance, Accountant Dashboards (Full details)
$revenue = $conn->prepare(
    "SELECT IFNULL(SUM(payments.amount_paid), 0) AS total_revenue
     FROM payments
     JOIN invoices ON payments.invoice_id = invoices.id
     WHERE invoices.company_id = ?"
);
$revenue->execute([$company_id]);
$totalRevenue = $revenue->fetch(PDO::FETCH_ASSOC);

$pending = $conn->prepare(
    "SELECT IFNULL(SUM(invoices.total - (
        SELECT IFNULL(SUM(amount_paid), 0)
        FROM payments
        WHERE payments.invoice_id = invoices.id
     )), 0) AS pending_amount
     FROM invoices
     WHERE invoices.company_id = ?
     AND invoices.status != 'Paid'"
);
$pending->execute([$company_id]);
$pendingAmount = $pending->fetch(PDO::FETCH_ASSOC);

$expensesTotal = $conn->prepare(
    "SELECT IFNULL(SUM(amount), 0) AS total_expenses
     FROM expenses
     WHERE company_id = ?"
);
$expensesTotal->execute([$company_id]);
$totalExpenses = $expensesTotal->fetch(PDO::FETCH_ASSOC);

$clients = $conn->prepare(
    "SELECT COUNT(*) AS total_clients
     FROM clients
     WHERE company_id = ?"
);
$clients->execute([$company_id]);
$totalClients = $clients->fetch(PDO::FETCH_ASSOC);

$overdue = $conn->prepare(
    "SELECT COUNT(*) AS overdue_count,
            IFNULL(SUM(invoices.total - (
                SELECT IFNULL(SUM(amount_paid), 0)
                FROM payments
                WHERE payments.invoice_id = invoices.id
            )), 0) AS overdue_amount
     FROM invoices
     WHERE company_id = ?
     AND status != 'Paid'
     AND due_date < CURDATE()"
);
$overdue->execute([$company_id]);
$overdueCount = $overdue->fetch(PDO::FETCH_ASSOC);

$revenueTrendsStmt = $conn->prepare(
    "SELECT DATE_FORMAT(payments.payment_date, '%Y-%m') AS month,
            IFNULL(SUM(payments.amount_paid), 0) AS revenue
     FROM payments
     JOIN invoices ON payments.invoice_id = invoices.id
     WHERE invoices.company_id = ?
       AND payments.payment_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
     GROUP BY month
     ORDER BY month"
);
$revenueTrendsStmt->execute([$company_id]);
$revenueTrends = $revenueTrendsStmt->fetchAll(PDO::FETCH_ASSOC);

$expenseTrendsStmt = $conn->prepare(
    "SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month,
            IFNULL(SUM(amount), 0) AS expenses
     FROM expenses
     WHERE company_id = ?
       AND expense_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
     GROUP BY month
     ORDER BY month"
);
$expenseTrendsStmt->execute([$company_id]);
$expenseTrends = $expenseTrendsStmt->fetchAll(PDO::FETCH_ASSOC);

$topClientsStmt = $conn->prepare(
    "SELECT clients.client_name AS name,
            IFNULL(SUM(payments.amount_paid), 0) AS revenue
     FROM payments
     JOIN invoices ON payments.invoice_id = invoices.id
     JOIN clients ON invoices.client_id = clients.id
     WHERE invoices.company_id = ?
     GROUP BY clients.id
     ORDER BY revenue DESC
     LIMIT 5"
);
$topClientsStmt->execute([$company_id]);
$topClients = $topClientsStmt->fetchAll(PDO::FETCH_ASSOC);

$avgPaymentCycleStmt = $conn->prepare(
    "SELECT IFNULL(AVG(GREATEST(DATEDIFF(last_payment.max_date, invoices.due_date), 0)), 0) AS avg_payment_days
     FROM invoices
     JOIN (
         SELECT invoice_id, MAX(payment_date) AS max_date
         FROM payments
         GROUP BY invoice_id
     ) AS last_payment ON last_payment.invoice_id = invoices.id
     WHERE invoices.company_id = ?"
);
$avgPaymentCycleStmt->execute([$company_id]);
$avgPaymentCycle = $avgPaymentCycleStmt->fetch(PDO::FETCH_ASSOC);

$netProfit = (float) $totalRevenue["total_revenue"] - (float) $totalExpenses["total_expenses"];
$totalRevenueNum = (float) $totalRevenue["total_revenue"];
if ($totalRevenueNum > 0) {
    $profitMargin = round($netProfit / $totalRevenueNum * 100, 2);
} else {
    $profitMargin = 0;
}

sendJson([
    "revenue" => $totalRevenue["total_revenue"],
    "pending" => $pendingAmount["pending_amount"],
    "clients" => $totalClients["total_clients"],
    "overdue" => $overdueCount["overdue_count"],
    "overdue_amount" => $overdueCount["overdue_amount"],
    "total_expenses" => $totalExpenses["total_expenses"],
    "net_profit" => $netProfit,
    "profit_margin" => $profitMargin,
    "revenue_trends" => $revenueTrends,
    "expense_trends" => $expenseTrends,
    "top_clients" => $topClients,
    "avg_payment_days" => $avgPaymentCycle["avg_payment_days"]
]);

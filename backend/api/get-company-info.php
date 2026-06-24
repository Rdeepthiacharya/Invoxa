<?php

require_once "../config/bootstrap.php";

requireAuth();
$company_id = getCompanyId();
logRequest();

try {
    // Get company info with owner details
    $stmt = $conn->prepare(
        "SELECT c.id, c.name, c.created_at, u.id as owner_id, u.name as owner_name, u.email as owner_email, 
                (SELECT COUNT(*) FROM users WHERE company_id = c.id) as member_count
         FROM companies c
         LEFT JOIN users u ON c.owner_id = u.id
         WHERE c.id = ?"
    );
    $stmt->execute([$company_id]);
    $company = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$company) {
        errorResponse("Company not found", "COMPANY_NOT_FOUND", 404);
    }

    sendJson([
        "success" => true,
        "company" => $company
    ]);
} catch (PDOException $e) {
    errorResponse("Failed to retrieve company info: " . $e->getMessage(), "COMPANY_INFO_FAILED", 500);
}

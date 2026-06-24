<?php

require_once "../config/bootstrap.php";

$company_id = getCompanyId();
logRequest();

$stmt = $conn->prepare(
    "SELECT company_name, logo_url, address, country, contact, email, website, phone, tax_id, tax_percentage, extra_info
     FROM company_profiles
     WHERE company_id = ?"
);
$stmt->execute([$company_id]);
$profile = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$profile) {
    $compStmt = $conn->prepare("SELECT name FROM companies WHERE id = ?");
    $compStmt->execute([$company_id]);
    $company = $compStmt->fetch(PDO::FETCH_ASSOC);
    $companyName = $company ? $company["name"] : "My Company";

    $insert = $conn->prepare(
        "INSERT INTO company_profiles
         (company_id, company_name, logo_url, address, country, contact, email, website, phone, tax_id, tax_percentage, extra_info)
         VALUES (?, ?, '', '', '', '', '', '', '', '', 0.00, '')"
    );
    $insert->execute([$company_id, $companyName]);

    $profile = [
        "company_name" => $companyName,
        "logo_url" => "",
        "address" => "",
        "country" => "",
        "contact" => "",
        "email" => "",
        "website" => "",
        "phone" => "",
        "tax_id" => "",
        "tax_percentage" => "0.00",
        "extra_info" => ""
    ];
}

sendJson([
    "success" => true,
    "profile" => $profile
]);

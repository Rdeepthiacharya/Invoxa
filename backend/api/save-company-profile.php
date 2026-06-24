<?php

require_once "../config/bootstrap.php";

requireRole(["Owner"]);
$company_id = getCompanyId();
$data = readJsonBody();
logRequest();

$company_name = trim($data->company_name ?? "");
$logo_url = trim($data->logo_url ?? "");
$address = trim($data->address ?? "");
$country = trim($data->country ?? "");
$contact = trim($data->contact ?? "");
$email = trim($data->email ?? "");
$website = trim($data->website ?? "");
$phone = trim($data->phone ?? "");
$tax_id = trim($data->tax_id ?? "");
$tax_percentage = (float) ($data->tax_percentage ?? 0);
$extra_info = trim($data->extra_info ?? "");

if (!$company_name) {
    errorResponse("Company name is required", "PROFILE_MISSING_NAME");
}

if (!$address) {
    errorResponse("Address is required", "PROFILE_MISSING_ADDRESS");
}

if (!$country) {
    errorResponse("Country is required", "PROFILE_MISSING_COUNTRY");
}

if (!$email || !validateEmail($email)) {
    errorResponse("A valid email is required", "PROFILE_INVALID_EMAIL");
}

if ($website && !sanitizeAndValidateWebsite($website)) {
    errorResponse("Website must be a valid URL", "PROFILE_INVALID_WEBSITE");
}

if ($phone && !validatePhone($phone)) {
    errorResponse("Phone number is invalid", "PROFILE_INVALID_PHONE");
}

if ($logo_url && !validateLogoUrl($logo_url)) {
    errorResponse("Logo URL must be a valid URL or relative path", "PROFILE_INVALID_LOGO_URL");
}

if ($tax_percentage < 0 || $tax_percentage > 100) {
    errorResponse("Tax percentage must be between 0 and 100", "PROFILE_INVALID_TAX_PERCENTAGE");
}

$check = $conn->prepare(
    "SELECT id FROM company_profiles WHERE company_id = ?"
);
$check->execute([$company_id]);
$exists = $check->fetch(PDO::FETCH_ASSOC);

if ($exists) {
    $stmt = $conn->prepare(
        "UPDATE company_profiles
         SET company_name = ?, logo_url = ?, address = ?, country = ?, contact = ?, email = ?, website = ?, phone = ?, tax_id = ?, tax_percentage = ?, extra_info = ?
         WHERE company_id = ?"
    );
    $stmt->execute([
        $company_name,
        $logo_url,
        $address,
        $country,
        $contact,
        $email,
        $website,
        $phone,
        $tax_id,
        $tax_percentage,
        $extra_info,
        $company_id
    ]);
} else {
    $stmt = $conn->prepare(
        "INSERT INTO company_profiles
         (company_id, company_name, logo_url, address, country, contact, email, website, phone, tax_id, tax_percentage, extra_info)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->execute([
        $company_id,
        $company_name,
        $logo_url,
        $address,
        $country,
        $contact,
        $email,
        $website,
        $phone,
        $tax_id,
        $tax_percentage,
        $extra_info
    ]);
}

sendJson([
    "success" => true,
    "message" => "Company profile saved successfully"
]);

<?php

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        "lifetime" => 0,
        "path" => "/",
        "httponly" => true,
        "samesite" => "Lax"
    ]);
    session_start();
}

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once __DIR__ . "/db.php";

function logMessage(string $level, string $message, array $meta = []): void
{
    $logDir = __DIR__ . "/../logs";
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }

    $entry = [
        "timestamp" => date("Y-m-d H:i:s"),
        "level" => $level,
        "message" => $message,
        "path" => $_SERVER["REQUEST_URI"] ?? "",
        "method" => $_SERVER["REQUEST_METHOD"] ?? "",
        "remote_addr" => $_SERVER["REMOTE_ADDR"] ?? "",
        "meta" => $meta
    ];

    file_put_contents(
        $logDir . "/app.log",
        json_encode($entry, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function logRequest(): void
{
    $logDir = __DIR__ . "/../logs";
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }

    $payload = method_exists("file_get_contents", "json_decode") ? @file_get_contents("php://input") : "";
    $entry = sprintf(
        "%s %s %s %s %s\n",
        date("Y-m-d H:i:s"),
        $_SERVER["REMOTE_ADDR"] ?? "unknown",
        $_SERVER["REQUEST_METHOD"] ?? "GET",
        $_SERVER["REQUEST_URI"] ?? "",
        str_replace(["\n", "\r"], ["", ""], $payload)
    );

    file_put_contents($logDir . "/requests.log", $entry, FILE_APPEND | LOCK_EX);
}

function sendJson(array $payload, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header("Content-Type: application/json");
    echo json_encode($payload);
    exit();
}

function errorResponse(string $message, string $errorCode = "", int $statusCode = 400, array $extra = []): void
{
    logMessage("ERROR", $message, ["errorCode" => $errorCode, "status" => $statusCode]);
    $response = array_merge([
        "success" => false,
        "message" => $message,
        "errorCode" => $errorCode
    ], $extra);
    sendJson($response, $statusCode);
}

function validateEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validateUrl(string $url): bool
{
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

function validateLogoUrl(string $url): bool
{
    $url = trim($url);
    if (!$url) {
        return true;
    }
    // Allow relative paths starting with / or normal file names
    if (preg_match('/^\/?([a-zA-Z0-9_\-\/]+\.[a-zA-Z]{2,5})$/', $url)) {
        return true;
    }
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

function sanitizeAndValidateWebsite(string &$website): bool
{
    $website = trim($website);
    if (!$website) {
        return true;
    }
    if (!preg_match("~^(?:f|ht)tps?://~i", $website)) {
        $website = "http://" . $website;
    }
    return filter_var($website, FILTER_VALIDATE_URL) !== false;
}

function validatePhone(string $phone): bool
{
    return preg_match('/^\+?[0-9\s\-\(\)]{7,25}$/', $phone) === 1;
}

function requireAuth(): int
{
    if (!isset($_SESSION["user_id"])) {
        errorResponse("Unauthorized. Please sign in again.", "UNAUTHORIZED", 401);
    }

    return (int) $_SESSION["user_id"];
}

function requireRole(array $allowedRoles): string
{
    $userId = requireAuth();
    global $conn;
    $stmt = $conn->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !in_array($user["role"], $allowedRoles)) {
        errorResponse("Forbidden. You do not have permission to perform this action.", "FORBIDDEN", 403);
    }

    return $user["role"];
}

function getCompanyId(): int
{
    if (!isset($_SESSION["company_id"])) {
        $userId = requireAuth();
        global $conn;
        $stmt = $conn->prepare("SELECT company_id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$user || !$user["company_id"]) {
            errorResponse("User company not found. Please sign in again.", "COMPANY_NOT_FOUND", 401);
        }
        $_SESSION["company_id"] = (int) $user["company_id"];
    }
    return (int) $_SESSION["company_id"];
}


function readJsonBody(): object
{
    $data = json_decode(file_get_contents("php://input"));

    if (!$data) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid JSON data"
        ]);
        exit();
    }

    return $data;
}

function resolveInvoiceStatus(array $invoice): string
{
    if (
        $invoice["status"] === "Pending" &&
        strtotime($invoice["due_date"]) < time()
    ) {
        return "Overdue";
    }

    return $invoice["status"];
}

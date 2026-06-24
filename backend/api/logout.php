<?php

require_once "../config/bootstrap.php";

session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Logged out"
]);

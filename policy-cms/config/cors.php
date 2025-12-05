<?php



return [
    'paths' => ['*'], // Allow all paths
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:5173', 'http://127.0.0.1:5173'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => ['Set-Cookie'],
    'max_age' => 86400, // 24 hours
    'supports_credentials' => true,
];

// return [
//     'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'check-auth'],
//     'allowed_methods' => ['*'],
//     'allowed_origins' => ['http://localhost:5173','http://192.168.1.17:5173', 'http://localhost:5175'],
//     'allowed_origins_patterns' => [],
//     'allowed_headers' => ['*'],
//     'exposed_headers' => [],
//     'max_age' => 0,
//     'supports_credentials' => true,
// ];
<?php

header('Content-Type: application/json; charset=utf-8');

try {
    require_once __DIR__ . '/../config/environment.php';
} catch (Throwable $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'No se pudo cargar la configuración del servicio'], 500);
}

function jsonResponse(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function prepareRequest(array $methods): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');
    header('Vary: Origin');

    $allowedOrigins = array_filter(array_map('trim', explode(',', configValue(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173'
    ))));
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if ($origin !== '') {
        if (!in_array($origin, $allowedOrigins, true)) {
            jsonResponse(['error' => 'Origen no permitido'], 403);
        }

        header('Access-Control-Allow-Origin: ' . $origin);
    }

    $allowedMethods = implode(', ', array_merge($methods, ['OPTIONS']));
    header('Access-Control-Allow-Methods: ' . $allowedMethods);
    header('Access-Control-Allow-Headers: Content-Type');

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    if (!in_array($method, $methods, true)) {
        header('Allow: ' . $allowedMethods);
        jsonResponse(['error' => 'Método no permitido'], 405);
    }
}

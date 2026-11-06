<?php

require_once __DIR__ . '/environment.php';

$host = configValue('DB_HOST', '127.0.0.1');
$port = configValue('DB_PORT', '3306');
$dbname = configValue('DB_NAME');
$username = configValue('DB_USER');
$password = configValue('DB_PASSWORD');

if ($dbname === '' || $username === '') {
    throw new RuntimeException('Falta la configuración de la base de datos');
}

$pdo = new PDO(
    "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4",
    $username,
    $password,
    [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
);
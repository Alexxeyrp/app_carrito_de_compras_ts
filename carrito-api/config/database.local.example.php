<?php

// Copy to database.local.php for XAMPP or hosting without environment variables.
// Never commit database.local.php or place real credentials in this example.
return [
    'DB_HOST' => '127.0.0.1',
    'DB_PORT' => '3306',
    'DB_NAME' => 'carrito_db',
    'DB_USER' => 'carrito_app',
    'DB_PASSWORD' => '',
    'CORS_ALLOWED_ORIGINS' => 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173',
];

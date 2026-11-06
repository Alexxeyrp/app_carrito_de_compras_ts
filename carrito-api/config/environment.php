<?php

// Prefer a private absolute path outside the public document root in production.
$externalConfigPath = getenv('DB_CONFIG_FILE');
$localConfigPath = $externalConfigPath !== false && $externalConfigPath !== ''
    ? $externalConfigPath
    : __DIR__ . '/database.local.php';

if ($externalConfigPath !== false && $externalConfigPath !== '' && !is_file($localConfigPath)) {
    throw new RuntimeException('No se encontró el archivo de configuración privado');
}

// Server environment variables override the optional, untracked private file.
$localConfig = is_file($localConfigPath) ? require $localConfigPath : [];

if (!is_array($localConfig)) {
    throw new RuntimeException('La configuración local debe devolver un array');
}

function configValue(string $name, string $default = ''): string
{
    global $localConfig;
    $value = getenv($name);

    // An explicitly empty environment variable is valid (for example, DB_PASSWORD).
    return $value !== false ? $value : (string) ($localConfig[$name] ?? $default);
}

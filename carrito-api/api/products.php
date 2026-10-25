<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

try {
    $sql = "
        SELECT
            p.name,
            c.name AS category,
            p.price,
            p.image_thumbnail
        FROM products p
        LEFT JOIN categories c
            ON p.category_id = c.id
    ";

    $stmt = $pdo->query($sql);

    $products = [];

    while ($row = $stmt->fetch()) {
        $products[] = [
            'name' => $row['name'],
            'category' => $row['category'],
            'price' => (float) $row['price'],
            'image' => [
                'thumbnail' => $row['image_thumbnail']
            ]
        ];
    }

    echo json_encode(
        $products,
        JSON_UNESCAPED_UNICODE
    );

} catch (PDOException $e) {
    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        'error' => 'No se pudieron cargar los productos'
    ]);
}
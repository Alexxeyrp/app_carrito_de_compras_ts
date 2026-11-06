<?php

require_once __DIR__ . '/bootstrap.php';
prepareRequest(['GET']);

try {
    require __DIR__ . '/../config/database.php';
    $stmt = $pdo->query(
        'SELECT p.id, p.name, COALESCE(c.name, \'Sin categoría\') AS category, p.price,
                p.image_thumbnail, p.image_url
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ORDER BY p.id'
    );

    $products = [];
    while ($row = $stmt->fetch()) {
        $products[] = [
            'id' => (int) $row['id'],
            'name' => $row['name'],
            'category' => $row['category'],
            'price' => (float) $row['price'],
            'image' => [
                'thumbnail' => $row['image_thumbnail'],
                'desktop' => $row['image_url'],
            ],
        ];
    }

    jsonResponse($products);
} catch (Throwable $e) {
    error_log($e->getMessage());
    jsonResponse(['error' => 'No se pudieron cargar los productos'], 500);
}

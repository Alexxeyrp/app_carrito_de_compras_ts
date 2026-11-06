
<?php

require_once __DIR__ . '/bootstrap.php';
prepareRequest(['POST']);

$contentType = strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0]));
if ($contentType !== 'application/json') {
    jsonResponse(['error' => 'Se requiere Content-Type: application/json'], 415);
}

$pdo = null;

try {
    // Bound request size before decoding or opening a database connection.
    $body = file_get_contents('php://input', false, null, 0, 65537);
    if ($body === false || strlen($body) > 65536) {
        jsonResponse(['error' => 'El pedido supera el tamaño permitido'], 413);
    }

    $input = json_decode($body, true, 32, JSON_THROW_ON_ERROR);

    if (
        !is_array($input) ||
        !isset($input['items']) ||
        !is_array($input['items']) ||
        !array_is_list($input['items']) ||
        count($input['items']) === 0 ||
        count($input['items']) > 100
    ) {
        http_response_code(400);
        echo json_encode(['error' => 'El carrito está vacío o es inválido']);
        exit;
    }

    // Validar productos y cantidades
    $items = [];
    $productIds = [];

    foreach ($input['items'] as $item) {
        if (
            !is_array($item) ||
            !isset($item['id'], $item['quantity']) ||
            !is_int($item['id']) ||
            !is_int($item['quantity']) ||
            $item['id'] <= 0 ||
            $item['quantity'] < 1 ||
            $item['quantity'] > 10 ||
            in_array($item['id'], $productIds, true)
        ) {
            http_response_code(400);
            echo json_encode(['error' => 'Productos o cantidades inválidos']);
            exit;
        }

        $productIds[] = $item['id'];
        $items[] = $item;
    }

    require __DIR__ . '/../config/database.php';
    $pdo->beginTransaction();

    // Consultar los precios en MySQL, no confiar en React
    $select = $pdo->prepare(
        'SELECT id, price FROM products WHERE id = ?'
    );

    $insertOrder = $pdo->prepare(
        'INSERT INTO orders (total, status) VALUES (?, ?)'
    );

    $insertItem = $pdo->prepare(
        'INSERT INTO order_items
         (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)'
    );

    $totalCents = 0;
    $validatedItems = [];

    foreach ($items as $item) {
        $select->execute([$item['id']]);
        $product = $select->fetch();

        if (!$product) {
            throw new DomainException('Uno de los productos no existe');
        }

        $price = (string) $product['price'];
        $priceCents = (int) round((float) $price * 100);

        $totalCents += $priceCents * $item['quantity'];

        $validatedItems[] = [
            'id' => $item['id'],
            'quantity' => $item['quantity'],
            'price' => $price
        ];
    }

    $total = number_format($totalCents / 100, 2, '.', '');

    $insertOrder->execute([$total, 'pending']);
    $orderId = (int) $pdo->lastInsertId();

    foreach ($validatedItems as $item) {
        $insertItem->execute([
            $orderId,
            $item['id'],
            $item['quantity'],
            $item['price']
        ]);
    }

    $pdo->commit();

    http_response_code(201);

    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'total' => (float) $total,
        'message' => 'Pedido registrado correctamente'
    ]);

} catch (JsonException $e) {
    jsonResponse(['error' => 'El cuerpo JSON es inválido'], 400);

} catch (DomainException $e) {
    if ($pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);

} catch (Throwable $e) {
    if ($pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log($e->getMessage());

    http_response_code(500);
    echo json_encode(['error' => 'No se pudo registrar el pedido']);
}

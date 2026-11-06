# Carrito API · PHP + MySQL

API del catálogo y registro de pedidos del proyecto Dessert Cart. Requiere PHP 8.1+ con PDO MySQL y MySQL 8 o MariaDB 10.4+. Los importes se calculan en el servidor a partir de los precios de la base de datos; cada pedido y sus líneas se guardan en una transacción.

## Configuración local

1. Copia esta carpeta a `C:\xampp\htdocs\carrito-api` y arranca Apache y MySQL en XAMPP.
2. Crea una base de datos vacía con juego de caracteres `utf8mb4`.
3. Importa `database/schema.sql` y después `database/seed.sql` desde phpMyAdmin, con esa base de datos seleccionada. El esquema es una instalación mínima derivada de las consultas de la API, no un volcado de una base de datos existente. No lo importes sobre una instalación con datos.
4. Copia `config/database.local.example.php` a `config/database.local.php` y configura host, puerto, base, usuario y contraseña. Comprueba el puerto de tu MySQL; puede ser 3306 o 3307. El archivo local está excluido de Git.
5. Comprueba `http://localhost/carrito-api/api/products.php`: debe devolver un array de nueve productos. Las imágenes del catálogo se sirven desde la carpeta `public/images` del frontend.

También puedes definir `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` y `CORS_ALLOWED_ORIGINS` en el entorno del servidor; esas variables tienen prioridad sobre el archivo local. `.env.example` enumera las opciones, pero PHP no carga archivos `.env` automáticamente.

Para alojar el archivo privado fuera de la carpeta pública, define `DB_CONFIG_FILE` con su ruta absoluta. Debe devolver el mismo array que el ejemplo; sustituye al archivo local y sus valores también pueden sobrescribirse con variables de entorno.

Para un servidor de desarrollo alternativo: `php -S 127.0.0.1:8080 -t .`; los endpoints estarán bajo `/api/`. El servidor integrado de PHP solo es para desarrollo y no aplica las reglas Apache de `.htaccess`.

## Endpoints

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/api/products.php` | 200 y array de productos con `id`, `name`, `category`, `price` e `image` |
| POST | `/api/orders.php` | 201 y `success`, `order_id`, `total`, `message` |
| OPTIONS | Ambas rutas | 204 para preflight CORS |

Ejemplo de cuerpo para registrar un pedido:

```json
{"items":[{"id":1,"quantity":2},{"id":3,"quantity":1}]}
```

El POST requiere `Content-Type: application/json`. Las cantidades deben ser enteros de 1 a 10, los productos no pueden repetirse y se admiten como máximo 100 líneas y 64 KiB de JSON. Los campos de precio enviados por el cliente no se utilizan. Los errores devuelven `{"error":"…"}` con estado 400, 403, 405, 413, 415 o 500 según el caso; los detalles internos se escriben en el registro del servidor.

## Producción

- Copia `api/`, `config/` y el `.htaccess` raíz al servidor PHP. No publiques `database/`, archivos locales, archivos `.env`, registros, documentación ni carpetas de herramientas. Mantén `config/.htaccess` y verifica que tu servidor aplica `Require all denied`; con Nginx configura una denegación equivalente para `/config`.
- Configura las credenciales mediante el entorno del hosting o crea allí un `config/database.local.php` privado. Usa una cuenta MySQL limitada a `SELECT` en el catálogo y `SELECT`/`INSERT` en las tablas de pedidos. Conserva fuera de la carpeta pública los secretos siempre que el hosting lo permita.
- Si el frontend y la API usan distintos orígenes, en `CORS_ALLOWED_ORIGINS` incluye los orígenes exactos del frontend, separados por comas, por ejemplo `https://dessert-cart-api.infinityfree.io`. No añadas rutas ni una barra final. Si ambos comparten origen, permite ese origen también para las peticiones POST del navegador. Sustituye los orígenes locales del ejemplo al publicar. CORS controla acceso desde navegadores; no sustituye autenticación ni limita clientes externos.
- En PHP desactiva `display_errors`, activa `log_errors` y sirve el sitio con HTTPS. La API es una demo pública de pedidos; no procesa pagos ni incluye usuarios, inventario o protección contra abuso.
- Antes de sustituir una instalación existente, guarda una copia de los datos y compara su estructura con `schema.sql`. No ejecutes el seed sobre datos existentes.

## Comprobación

Ejecuta `php -l` sobre los archivos PHP. Verifica catálogo, preflight, rechazo de métodos/orígenes incorrectos y errores JSON. Para probar un pedido válido usa una base de datos aislada: el POST inserta datos. No envíes pedidos de prueba a la demo publicada.

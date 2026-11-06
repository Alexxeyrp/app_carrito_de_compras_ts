-- Demo catalog from src/data/db.json. Import once into the empty schema.
SET NAMES utf8mb4;
START TRANSACTION;

INSERT INTO categories (id, name) VALUES (1, 'Waffle');
INSERT INTO products (id, category_id, name, price, image_thumbnail, image_url) VALUES (1, 1, 'Waffle with Berries', 6.50, '/images/image-waffle-thumbnail.jpg', '/images/image-waffle-desktop.jpg');

INSERT INTO categories (id, name) VALUES (2, 'Crème Brûlée');
INSERT INTO products (id, category_id, name, price, image_thumbnail, image_url) VALUES (2, 2, 'Vanilla Bean Crème Brûlée', 7.00, '/images/image-creme-brulee-thumbnail.jpg', '/images/image-creme-brulee-desktop.jpg');

INSERT INTO categories (id, name) VALUES (3, 'Macaron');
INSERT INTO products (id, category_id, name, price, image_thumbnail, image_url) VALUES (3, 3, 'Macaron Mix of Five', 8.00, '/images/image-macaron-thumbnail.jpg', '/images/image-macaron-desktop.jpg');

INSERT INTO categories (id, name) VALUES (4, 'Tiramisu');
INSERT INTO products (id, category_id, name, price, image_thumbnail, image_url) VALUES (4, 4, 'Classic Tiramisu', 5.50, '/images/image-tiramisu-thumbnail.jpg', '/images/image-tiramisu-desktop.jpg');

INSERT INTO categories (id, name) VALUES (5, 'Baklava');
INSERT INTO products (id, category_id, name, price, image_thumbnail, image_url) VALUES (5, 5, 'Pistachio Baklava', 4.00, '/images/image-baklava-thumbnail.jpg', '/images/image-baklava-desktop.jpg');

INSERT INTO categories (id, name) VALUES (6, 'Pie');
INSERT INTO products (id, category_id, name, price, image_thumbnail, image_url) VALUES (6, 6, 'Lemon Meringue Pie', 5.00, '/images/image-meringue-thumbnail.jpg', '/images/image-meringue-desktop.jpg');

INSERT INTO categories (id, name) VALUES (7, 'Cake');
INSERT INTO products (id, category_id, name, price, image_thumbnail, image_url) VALUES (7, 7, 'Red Velvet Cake', 4.50, '/images/image-cake-thumbnail.jpg', '/images/image-cake-desktop.jpg');

INSERT INTO categories (id, name) VALUES (8, 'Brownie');
INSERT INTO products (id, category_id, name, price, image_thumbnail, image_url) VALUES (8, 8, 'Salted Caramel Brownie', 4.50, '/images/image-brownie-thumbnail.jpg', '/images/image-brownie-desktop.jpg');

INSERT INTO categories (id, name) VALUES (9, 'Panna Cotta');
INSERT INTO products (id, category_id, name, price, image_thumbnail, image_url) VALUES (9, 9, 'Vanilla Panna Cotta', 6.50, '/images/image-panna-cotta-thumbnail.jpg', '/images/image-panna-cotta-desktop.jpg');

COMMIT;

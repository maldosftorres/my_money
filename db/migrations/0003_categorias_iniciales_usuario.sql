-- Insertar categorías de gasto iniciales para usuarios
-- Fecha: 2025-10-27
-- Descripción: Agrega las categorías básicas de gastos para el usuario ID 1

-- Insertar categorías básicas para el usuario administrador (usuario_id = 1)
INSERT IGNORE INTO `categorias_gasto` (`usuario_id`, `nombre`, `es_fijo`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 'Alimentación', 0, 1, NOW(), NOW()),
(1, 'Transporte', 0, 1, NOW(), NOW()),
(1, 'Entretenimiento', 0, 1, NOW(), NOW()),
(1, 'Salud', 0, 1, NOW(), NOW()),
(1, 'Educación', 0, 1, NOW(), NOW()),
(1, 'Ropa', 0, 1, NOW(), NOW()),
(1, 'Tecnología', 0, 1, NOW(), NOW()),
(1, 'Hogar', 0, 1, NOW(), NOW()),
(1, 'Otros', 0, 1, NOW(), NOW()),
(1, 'Servicios', 1, 1, NOW(), NOW()),
(1, 'Seguros', 1, 1, NOW(), NOW()),
(1, 'Impuestos', 1, 1, NOW(), NOW());

-- Verificar que las categorías se insertaron correctamente
SELECT COUNT(*) as total_categorias FROM categorias_gasto WHERE usuario_id = 1;
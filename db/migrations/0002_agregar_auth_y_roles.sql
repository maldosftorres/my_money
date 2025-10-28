-- Migración simplificada: Solo agregar campo rol
-- Fecha: 2025-10-26

USE my_money;

-- Agregar solo el campo rol a la tabla usuarios existente
ALTER TABLE usuarios 
ADD COLUMN rol ENUM('ADMIN', 'USUARIO') DEFAULT 'USUARIO';

-- Establecer el primer usuario como administrador
UPDATE usuarios 
SET rol = 'ADMIN' 
WHERE id = 1;

-- Crear índice para optimizar consultas por rol
CREATE INDEX idx_usuarios_rol ON usuarios(rol);
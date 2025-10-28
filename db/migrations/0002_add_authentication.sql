-- =========================================
-- Migración: Agregar autenticación por username
-- Autor: Fernando
-- Fecha: 2025-10-26
-- =========================================

USE my_money;

-- Agregar campos de autenticación a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL AFTER id,
ADD COLUMN password_hash VARCHAR(255) NOT NULL AFTER email,
ADD COLUMN ultimo_acceso DATETIME NULL AFTER estado;

-- Crear índice para optimizar búsquedas por username
CREATE INDEX idx_usuarios_username ON usuarios(username);

-- Agregar usuario administrador por defecto (contraseña: admin123)
-- Hash generado con implementación personalizada para 'admin123'
INSERT INTO usuarios (username, nombre, email, password_hash, estado) 
VALUES ('admin', 'Administrador', 'admin@mymoney.com', '43b2ba526d8c9dd2f79872d389194c46:dc1fbf85f09d88b94c7d7a1c175136c637a5c459def8284216d7d60637f3dae08ded2ffa63c532062f2ad869c1c1f623e93fa6fb2e0c391f6729b6493d64ca1a', 'ACTIVO')
ON DUPLICATE KEY UPDATE 
username = VALUES(username),
password_hash = VALUES(password_hash);

-- Agregar usuario de prueba (contraseña: user123)
INSERT INTO usuarios (username, nombre, email, password_hash, estado) 
VALUES ('demo', 'Usuario Demo', 'demo@mymoney.com', '95591508b4ce5be2ac9ec2ebbf94b1d6:3f9b2314813934495dab10774bb7a001719273aaa8c8a8a85d7f0982bc7cd54ef0397e343fa050ff1046ea93410a6ac58bf6dec9e995a6e50d4ddccb8854ffd1', 'ACTIVO')
ON DUPLICATE KEY UPDATE 
username = VALUES(username),
password_hash = VALUES(password_hash);

-- Crear tabla de sesiones para manejo de tokens/sesiones
CREATE TABLE sesiones (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  token           VARCHAR(500) NOT NULL,
  expires_at      DATETIME NOT NULL,
  ip_address      VARCHAR(45),
  user_agent      VARCHAR(500),
  activa          TINYINT(1) NOT NULL DEFAULT 1,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sesiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sesiones_usuario ON sesiones(usuario_id);
CREATE INDEX idx_sesiones_token ON sesiones(token);
CREATE INDEX idx_sesiones_expires ON sesiones(expires_at);

-- Crear tabla de logs de acceso para auditoría
CREATE TABLE logs_acceso (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NULL,
  username        VARCHAR(50),
  accion          ENUM('LOGIN_SUCCESS','LOGIN_FAILED','LOGOUT','SESSION_EXPIRED') NOT NULL,
  ip_address      VARCHAR(45),
  user_agent      VARCHAR(500),
  detalles        TEXT,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_logs_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_logs_usuario ON logs_acceso(usuario_id);
CREATE INDEX idx_logs_fecha ON logs_acceso(creado_en);
CREATE INDEX idx_logs_accion ON logs_acceso(accion);
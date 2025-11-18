-- =========================================
-- Migración: Crear tabla transferencias
-- Autor: Fernando Maldonado
-- Fecha: 2025-11-18
-- Descripción: Crea la tabla transferencias para gestionar movimientos entre cuentas
-- =========================================

USE my_money;

-- Crear tabla transferencias
CREATE TABLE transferencias (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id        INT NOT NULL,
  cuenta_origen_id  INT NOT NULL,
  cuenta_destino_id INT NOT NULL,
  monto             DECIMAL(18,2) NOT NULL,
  concepto          VARCHAR(200) NOT NULL,
  estado            ENUM('PENDIENTE','COMPLETADA') DEFAULT 'PENDIENTE',
  notas             VARCHAR(400) DEFAULT NULL,
  fecha             DATE NOT NULL,
  creado_en         DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Restricciones de clave foránea
  CONSTRAINT transferencias_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT transferencias_ibfk_2 FOREIGN KEY (cuenta_origen_id) REFERENCES cuentas(id) ON DELETE CASCADE,
  CONSTRAINT transferencias_ibfk_3 FOREIGN KEY (cuenta_destino_id) REFERENCES cuentas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Crear índices para optimizar consultas
CREATE INDEX idx_usuario_fecha ON transferencias(usuario_id, fecha);
CREATE INDEX idx_cuenta_origen ON transferencias(cuenta_origen_id);
CREATE INDEX idx_cuenta_destino ON transferencias(cuenta_destino_id);
CREATE INDEX idx_estado ON transferencias(estado);

-- Insertar comentario sobre la migración
INSERT INTO migraciones (version, nombre) VALUES ('0008', '0008_crear_tabla_transferencias.sql')
ON DUPLICATE KEY UPDATE ejecutada_en = CURRENT_TIMESTAMP;
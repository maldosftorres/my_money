-- =========================================
-- Migración: Agregar tabla de ahorros
-- Autor: Fernando
-- Creado: 2025-10-29
-- =========================================

USE my_money;

-- Configurar UTF-8 para caracteres especiales y acentos
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;
SET character_set_results = utf8mb4;

-- ============================
-- Tabla de Ahorros
-- ============================

CREATE TABLE ahorros (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id        INT NOT NULL,
  cuenta_origen_id  INT NULL,
  concepto          VARCHAR(200) NOT NULL,
  tipo_ahorro       ENUM('META_FIJA', 'RECURRENTE') NOT NULL,
  monto_objetivo    DECIMAL(18,2) NULL, -- Solo para META_FIJA
  monto_mensual     DECIMAL(18,2) NOT NULL CHECK (monto_mensual > 0),
  plazo_meses       INT NULL, -- Solo para META_FIJA
  fecha_inicio      DATE NOT NULL,
  estado            ENUM('ACTIVO', 'COMPLETADO', 'PAUSADO', 'CANCELADO') DEFAULT 'ACTIVO',
  notas             VARCHAR(400),
  creado_en         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_ahorros_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_ahorros_cuenta  FOREIGN KEY (cuenta_origen_id) REFERENCES cuentas(id),
  
  -- Validaciones de negocio
  CHECK (
    (tipo_ahorro = 'META_FIJA' AND monto_objetivo IS NOT NULL AND monto_objetivo > 0 AND plazo_meses IS NOT NULL AND plazo_meses > 0)
    OR
    (tipo_ahorro = 'RECURRENTE' AND monto_objetivo IS NULL AND plazo_meses IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_ahorros_usuario ON ahorros(usuario_id);
CREATE INDEX idx_ahorros_estado ON ahorros(estado);
CREATE INDEX idx_ahorros_fecha_inicio ON ahorros(fecha_inicio);

-- ============================
-- Actualizar vista de totales por mes para incluir ahorros
-- ============================

DROP VIEW IF EXISTS v_totales_mes;

CREATE OR REPLACE VIEW v_totales_mes AS
SELECT
  u.id AS usuario_id,
  DATE_FORMAT(i.fecha, '%Y-%m-01') AS mes,
  COALESCE(SUM(i.monto), 0) AS ingresos_mes,
  0 AS gastos_fijos_mes,
  0 AS gastos_adic_mes,
  0 AS consumos_tc_mes,
  0 AS ahorros_mes
FROM usuarios u
LEFT JOIN ingresos i ON i.usuario_id = u.id
GROUP BY u.id, mes
UNION ALL
SELECT
  u.id,
  DATE_FORMAT(gf.fecha, '%Y-%m-01'),
  0,
  COALESCE(SUM(gf.monto), 0),
  0,
  0,
  0
FROM usuarios u
LEFT JOIN gastos_fijos gf ON gf.usuario_id = u.id
GROUP BY u.id, 2
UNION ALL
SELECT
  u.id,
  DATE_FORMAT(ga.fecha, '%Y-%m-01'),
  0,
  0,
  COALESCE(SUM(ga.monto), 0),
  0,
  0
FROM usuarios u
LEFT JOIN gastos_adicionales ga ON ga.usuario_id = u.id
GROUP BY u.id, 2
UNION ALL
SELECT
  u.id,
  DATE_FORMAT(ct.fecha_consumo, '%Y-%m-01'),
  0,
  0,
  0,
  COALESCE(SUM(ct.monto), 0),
  0
FROM usuarios u
LEFT JOIN consumos_tarjeta ct ON ct.usuario_id = u.id
GROUP BY u.id, 2;

-- ============================
-- Actualizar vista de resumen consolidado
-- ============================

DROP VIEW IF EXISTS v_resumen_mes;

CREATE OR REPLACE VIEW v_resumen_mes AS
SELECT
  usuario_id,
  mes,
  SUM(ingresos_mes)       AS ingresos_totales,
  SUM(gastos_fijos_mes)   AS gastos_fijos_totales,
  SUM(gastos_adic_mes)    AS gastos_adicionales_totales,
  SUM(consumos_tc_mes)    AS consumos_tarjeta_totales,
  SUM(ahorros_mes)        AS ahorros_totales,
  SUM(ingresos_mes) - (SUM(gastos_fijos_mes) + SUM(gastos_adic_mes) + SUM(consumos_tc_mes) + SUM(ahorros_mes)) AS saldo_restante
FROM v_totales_mes
GROUP BY usuario_id, mes;
-- =========================================
-- Migración: Revertir tabla de ahorros
-- Autor: Fernando
-- Creado: 2025-10-29
-- Descripción: Elimina la tabla ahorros y restaura las vistas al estado original
-- =========================================

USE my_money;

-- Configurar UTF-8 para caracteres especiales y acentos
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;
SET character_set_results = utf8mb4;

-- ============================
-- 1. Eliminar tabla de ahorros (con sus índices y constraints automáticamente)
-- ============================

DROP TABLE IF EXISTS ahorros;

-- ============================
-- 2. Restaurar vista v_totales_mes al estado original (sin ahorros)
-- ============================

DROP VIEW IF EXISTS v_totales_mes;

CREATE OR REPLACE VIEW v_totales_mes AS
SELECT
  u.id AS usuario_id,
  DATE_FORMAT(i.fecha, '%Y-%m-01') AS mes,
  COALESCE(SUM(i.monto), 0) AS ingresos_mes,
  0 AS gastos_fijos_mes,
  0 AS gastos_adic_mes,
  0 AS consumos_tc_mes
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
  COALESCE(SUM(ct.monto), 0)
FROM usuarios u
LEFT JOIN consumos_tarjeta ct ON ct.usuario_id = u.id
GROUP BY u.id, 2;

-- ============================
-- 3. Restaurar vista v_resumen_mes al estado original (sin ahorros)
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
  SUM(ingresos_mes) - (SUM(gastos_fijos_mes) + SUM(gastos_adic_mes) + SUM(consumos_tc_mes)) AS saldo_restante
FROM v_totales_mes
GROUP BY usuario_id, mes;

-- ============================
-- Confirmación
-- ============================

SELECT 'Migración de reversión completada: tabla ahorros eliminada y vistas restauradas' AS status;
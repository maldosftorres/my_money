-- ============================
-- Migración 0009: Completar Sistema de Tarjetas Modernizado
-- ============================
-- NOTA: Tabla tarjetas ya está actualizada, completando movimientos y consumos

-- Eliminar tabla consumos_tarjeta
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS consumos_tarjeta;
SET FOREIGN_KEY_CHECKS = 1;

-- Expandir tipos de movimiento
ALTER TABLE movimientos 
  MODIFY COLUMN tipo ENUM(
    'INGRESO',
    'GASTO', 
    'TRANSFERENCIA',
    'PAGO_TARJETA',
    'GASTO_TARJETA',
    'PAGO_DESDE_TARJETA',
    'SALDO_ACUMULADO'
  ) NOT NULL;

-- Agregar campo tarjeta_id a movimientos
ALTER TABLE movimientos 
  ADD COLUMN tarjeta_id INT NULL AFTER cuenta_destino_id;

ALTER TABLE movimientos 
  ADD CONSTRAINT fk_movimientos_tarjeta FOREIGN KEY (tarjeta_id) REFERENCES tarjetas(id);

-- Actualizar vistas
DROP VIEW IF EXISTS v_totales_mes;
DROP VIEW IF EXISTS v_resumen_mes;

CREATE OR REPLACE VIEW v_totales_mes AS
SELECT
  u.id AS usuario_id,
  DATE_FORMAT(COALESCE(x.fecha, CURDATE()), '%Y-%m-01') AS mes,
  SUM(CASE WHEN x.tipo = 'ingreso' THEN x.monto ELSE 0 END) AS ingresos_mes,
  SUM(CASE WHEN x.tipo = 'gasto_fijo' THEN x.monto ELSE 0 END) AS gastos_fijos_mes,
  SUM(CASE WHEN x.tipo = 'gasto_adicional' THEN x.monto ELSE 0 END) AS gastos_adic_mes,
  SUM(CASE WHEN x.tipo = 'gasto_tarjeta' THEN x.monto ELSE 0 END) AS gastos_tarjeta_mes
FROM usuarios u
LEFT JOIN (
  SELECT usuario_id, fecha, monto, 'ingreso' as tipo FROM ingresos WHERE estado = 'PAGADO'
  UNION ALL
  SELECT usuario_id, fecha, monto, 'gasto_fijo' as tipo FROM gastos_fijos WHERE estado = 'PAGADO'
  UNION ALL
  SELECT usuario_id, fecha, monto, 'gasto_adicional' as tipo FROM gastos_adicionales
  UNION ALL
  SELECT usuario_id, fecha, monto, 'gasto_tarjeta' as tipo FROM movimientos WHERE tipo = 'GASTO_TARJETA'
) x ON u.id = x.usuario_id
GROUP BY u.id, mes;

CREATE OR REPLACE VIEW v_resumen_mes AS
SELECT
  usuario_id,
  mes,
  COALESCE(SUM(ingresos_mes), 0) AS ingresos_totales,
  COALESCE(SUM(gastos_fijos_mes), 0) AS gastos_fijos_totales,
  COALESCE(SUM(gastos_adic_mes), 0) AS gastos_adicionales_totales,
  COALESCE(SUM(gastos_tarjeta_mes), 0) AS gastos_tarjeta_totales,
  COALESCE(SUM(ingresos_mes), 0) - 
  (COALESCE(SUM(gastos_fijos_mes), 0) + COALESCE(SUM(gastos_adic_mes), 0) + COALESCE(SUM(gastos_tarjeta_mes), 0)) AS saldo_restante
FROM v_totales_mes
GROUP BY usuario_id, mes;

-- Vista para tarjetas con información completa
CREATE OR REPLACE VIEW v_tarjetas_con_saldo AS
SELECT 
  t.*,
  c.nombre AS cuenta_asociada_nombre,
  c.tipo AS cuenta_asociada_tipo,
  CASE 
    WHEN t.tipo IN ('CREDITO', 'VIRTUAL') AND t.limite IS NOT NULL 
    THEN t.limite - t.saldo_utilizado 
    ELSE NULL 
  END AS saldo_disponible,
  CASE 
    WHEN t.tipo IN ('CREDITO', 'VIRTUAL') AND t.limite IS NOT NULL AND t.limite > 0
    THEN ROUND((t.saldo_utilizado / t.limite) * 100, 2)
    ELSE 0
  END AS porcentaje_utilizado
FROM tarjetas t
LEFT JOIN cuentas c ON t.cuenta_id = c.id;

SELECT '✅ Migración 0009 completada exitosamente' as resultado;
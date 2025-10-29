-- Migración: Agregar saldo acumulado a tabla movimientos
-- Fecha: 2025-10-29
-- Descripción: Modifica la tabla movimientos para agregar soporte de saldo acumulado mensual

-- Modificar el ENUM tipo para incluir SALDO_ACUMULADO (si no existe ya)
ALTER TABLE movimientos 
MODIFY COLUMN tipo ENUM('INGRESO','GASTO','TRANSFERENCIA_ENTRADA','TRANSFERENCIA_SALIDA','SALDO_ACUMULADO') NOT NULL;

-- Agregar columna para almacenar el saldo acumulado (solo si no existe)
SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS 
               WHERE TABLE_SCHEMA = 'my_money' 
               AND TABLE_NAME = 'movimientos' 
               AND COLUMN_NAME = 'saldo_acumulado');

SET @sql = IF(@exist = 0, 
    'ALTER TABLE movimientos ADD COLUMN saldo_acumulado DECIMAL(18,2) DEFAULT NULL COMMENT "Saldo acumulado hasta este mes (solo para tipo SALDO_ACUMULADO)";',
    'SELECT "Column saldo_acumulado already exists" as message;'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar índice para optimizar consultas de saldo acumulado (solo si no existe)
SET @exist_idx := (SELECT COUNT(*) FROM information_schema.STATISTICS 
                   WHERE TABLE_SCHEMA = 'my_money' 
                   AND TABLE_NAME = 'movimientos' 
                   AND INDEX_NAME = 'idx_movimientos_saldo_acumulado');

SET @sql_idx = IF(@exist_idx = 0, 
    'CREATE INDEX idx_movimientos_saldo_acumulado ON movimientos (usuario_id, tipo, fecha);',
    'SELECT "Index idx_movimientos_saldo_acumulado already exists" as message;'
);

PREPARE stmt_idx FROM @sql_idx;
EXECUTE stmt_idx;
DEALLOCATE PREPARE stmt_idx;
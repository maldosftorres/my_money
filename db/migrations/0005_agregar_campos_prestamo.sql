-- Migración: Agregar campos específicos para préstamos en gastos_fijos
-- Fecha: 2025-10-28
-- Descripción: Permite manejar préstamos con cuotas numeradas automáticamente

-- Agregar solo las columnas que no existen
ALTER TABLE gastos_fijos 
ADD COLUMN IF NOT EXISTS es_prestamo BOOLEAN DEFAULT FALSE COMMENT 'Indica si es un préstamo',
ADD COLUMN IF NOT EXISTS total_cuotas INT NULL COMMENT 'Número total de cuotas del préstamo',
ADD COLUMN IF NOT EXISTS cuota_actual INT NULL COMMENT 'Número de cuota actual (1, 2, 3, etc.)',
ADD COLUMN IF NOT EXISTS descripcion_prestamo TEXT NULL COMMENT 'Descripción adicional del préstamo',
ADD COLUMN IF NOT EXISTS gasto_padre_id INT NULL COMMENT 'ID del gasto original para cuotas generadas automáticamente';

-- Agregar foreign key para la relación padre-hijo (solo si no existe)
SET @fk_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
                 WHERE TABLE_SCHEMA = 'my_money' 
                 AND TABLE_NAME = 'gastos_fijos' 
                 AND CONSTRAINT_NAME = 'fk_gastos_fijos_padre');

SET @sql = IF(@fk_exists = 0, 
    'ALTER TABLE gastos_fijos ADD CONSTRAINT fk_gastos_fijos_padre FOREIGN KEY (gasto_padre_id) REFERENCES gastos_fijos(id) ON DELETE CASCADE', 
    'SELECT "Foreign key already exists" AS info');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Índices para mejorar rendimiento en consultas de préstamos (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_gastos_fijos_prestamo ON gastos_fijos(es_prestamo, total_cuotas);
CREATE INDEX IF NOT EXISTS idx_gastos_fijos_cuota ON gastos_fijos(gasto_padre_id, cuota_actual);

-- Comentario de la tabla actualizado
ALTER TABLE gastos_fijos COMMENT = 'Gastos fijos recurrentes y préstamos con soporte para cuotas numeradas automáticamente';
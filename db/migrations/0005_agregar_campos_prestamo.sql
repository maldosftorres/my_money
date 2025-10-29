-- Migración: Agregar campos específicos para préstamos en gastos_fijos
-- Fecha: 2025-10-28
-- Descripción: Permite manejar préstamos con cuotas numeradas automáticamente

ALTER TABLE gastos_fijos 
ADD COLUMN es_prestamo BOOLEAN DEFAULT FALSE COMMENT 'Indica si es un préstamo',
ADD COLUMN total_cuotas INT NULL COMMENT 'Número total de cuotas del préstamo',
ADD COLUMN cuota_actual INT NULL COMMENT 'Número de cuota actual (1, 2, 3, etc.)',
ADD COLUMN descripcion_prestamo TEXT NULL COMMENT 'Descripción adicional del préstamo';

-- Índices para mejorar rendimiento en consultas de préstamos
CREATE INDEX idx_gastos_fijos_prestamo ON gastos_fijos(es_prestamo, total_cuotas);
CREATE INDEX idx_gastos_fijos_cuota ON gastos_fijos(gasto_padre_id, cuota_actual);

-- Comentario de la tabla actualizado
ALTER TABLE gastos_fijos COMMENT = 'Gastos fijos recurrentes y préstamos con soporte para cuotas numeradas automáticamente';
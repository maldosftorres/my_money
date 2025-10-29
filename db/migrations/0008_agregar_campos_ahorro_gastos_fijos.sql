-- =========================================
-- Migración: Agregar campos de ahorro a gastos_fijos
-- Autor: Fernando
-- Creado: 2025-10-29
-- Descripción: Agrega campos para manejar ahorros como gastos fijos especiales
-- =========================================

USE my_money;

-- Configurar UTF-8 para caracteres especiales y acentos
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;
SET character_set_results = utf8mb4;

-- ============================
-- Agregar campos para ahorros en gastos_fijos
-- ============================

-- Agregar campo es_ahorro (similar a es_prestamo)
ALTER TABLE gastos_fijos 
ADD COLUMN es_ahorro BOOLEAN DEFAULT FALSE COMMENT 'Indica si es un ahorro' AFTER es_prestamo;

-- Agregar campo meses_objetivo (equivalente a total_cuotas para ahorros)
ALTER TABLE gastos_fijos 
ADD COLUMN meses_objetivo INT NULL COMMENT 'Número total de meses del plan de ahorro' AFTER total_cuotas;

-- Agregar campo mes_actual (equivalente a cuota_actual para ahorros)
ALTER TABLE gastos_fijos 
ADD COLUMN mes_actual INT DEFAULT 0 COMMENT 'Mes actual del ahorro (0 = no iniciado, 1-N = mes en curso)' AFTER cuota_actual;

-- Agregar campo monto_ya_ahorrado (para ahorros que ya empezaron)
ALTER TABLE gastos_fijos 
ADD COLUMN monto_ya_ahorrado DECIMAL(18,2) DEFAULT 0.00 COMMENT 'Monto ya ahorrado antes de registrar en el sistema' AFTER descripcion_prestamo;

-- ============================
-- Crear índices para optimizar consultas de ahorros
-- ============================

CREATE INDEX idx_gastos_fijos_es_ahorro ON gastos_fijos(es_ahorro);
CREATE INDEX idx_gastos_fijos_ahorro_usuario ON gastos_fijos(usuario_id, es_ahorro);

-- ============================
-- Agregar constraints de validación para ahorros
-- ============================

-- Constraint: Un gasto no puede ser prestamo y ahorro al mismo tiempo
ALTER TABLE gastos_fijos 
ADD CONSTRAINT chk_not_prestamo_and_ahorro 
CHECK (NOT (es_prestamo = TRUE AND es_ahorro = TRUE));

-- Constraint: Si es ahorro, meses_objetivo debe ser mayor a 0
ALTER TABLE gastos_fijos 
ADD CONSTRAINT chk_ahorro_meses_objetivo 
CHECK (es_ahorro = FALSE OR (es_ahorro = TRUE AND meses_objetivo > 0));

-- Constraint: mes_actual no puede ser mayor que meses_objetivo
ALTER TABLE gastos_fijos 
ADD CONSTRAINT chk_ahorro_mes_actual 
CHECK (es_ahorro = FALSE OR mes_actual <= meses_objetivo);

-- Constraint: monto_ya_ahorrado debe ser positivo
ALTER TABLE gastos_fijos 
ADD CONSTRAINT chk_ahorro_monto_positivo 
CHECK (monto_ya_ahorrado >= 0);

-- ============================
-- Confirmación
-- ============================

SELECT 'Migración completada: campos de ahorro agregados a gastos_fijos' AS status;
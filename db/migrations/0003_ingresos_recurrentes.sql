-- =========================================
-- Migración: Ingresos Recurrentes
-- Autor: Fernando
-- Creado: 2025-10-27
-- Descripción: Agregar funcionalidad de ingresos recurrentes (salarios, etc.)
-- =========================================

USE my_money;

-- Configurar UTF-8
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET CHARACTER SET utf8mb4;

-- Agregar columnas para ingresos recurrentes
ALTER TABLE ingresos 
ADD COLUMN dia_mes INT DEFAULT NULL COMMENT 'Día del mes para ingresos recurrentes (1-31)',
ADD COLUMN frecuencia_meses INT DEFAULT 1 COMMENT 'Cada cuántos meses se repite (1=mensual, 3=trimestral)',
ADD COLUMN es_recurrente TINYINT(1) DEFAULT 0 COMMENT 'Si es un ingreso que se repite automáticamente',
ADD COLUMN ingreso_padre_id INT DEFAULT NULL COMMENT 'ID del ingreso original para los generados automáticamente',
ADD COLUMN fecha_cobro DATE DEFAULT NULL COMMENT 'Fecha real cuando se cobró el ingreso',
ADD CONSTRAINT fk_ingresos_padre FOREIGN KEY (ingreso_padre_id) REFERENCES ingresos(id) ON DELETE CASCADE;

-- Crear índice para mejorar performance en consultas de ingresos recurrentes
CREATE INDEX idx_ingresos_recurrentes ON ingresos(es_recurrente, dia_mes, frecuencia_meses);
CREATE INDEX idx_ingresos_padre ON ingresos(ingreso_padre_id);
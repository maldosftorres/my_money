-- =========================================
-- Migración: Actualizar tipos de movimientos para transferencias
-- Autor: Fernando Maldonado
-- Fecha: 2025-11-18
-- Descripción: Actualiza los tipos de movimientos para incluir tipos específicos de transferencias
-- =========================================

USE my_money;

-- Actualizar el enum de tipos de movimientos
ALTER TABLE movimientos 
MODIFY COLUMN tipo ENUM(
    'INGRESO',
    'GASTO',
    'TRANSFERENCIA',
    'TRANSFERENCIA_SALIDA',
    'TRANSFERENCIA_ENTRADA',
    'PAGO_TARJETA',
    'GASTO_TARJETA',
    'PAGO_DESDE_TARJETA',
    'SALDO_ACUMULADO'
) NOT NULL;
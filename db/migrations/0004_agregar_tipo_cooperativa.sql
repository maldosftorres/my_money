-- =========================================
-- Migración: Agregar tipo COOPERATIVA a cuentas
-- Autor: Fernando
-- Fecha: 2025-10-28
-- =========================================

USE my_money;

-- Agregar 'COOPERATIVA' al ENUM de tipos de cuenta
ALTER TABLE cuentas 
MODIFY COLUMN tipo ENUM('EFECTIVO','BANCO','TARJETA','AHORRO','COOPERATIVA','OTRA') DEFAULT 'BANCO';

-- Verificar el cambio
DESCRIBE cuentas;
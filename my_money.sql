-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-10-2025 a las 17:45:21
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `my_money`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ahorros`
--

CREATE TABLE `ahorros` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_origen_id` int(11) DEFAULT NULL,
  `concepto` varchar(200) NOT NULL,
  `tipo_ahorro` enum('META_FIJA','RECURRENTE') NOT NULL,
  `monto_objetivo` decimal(18,2) DEFAULT NULL,
  `monto_mensual` decimal(18,2) NOT NULL CHECK (`monto_mensual` > 0),
  `plazo_meses` int(11) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `estado` enum('ACTIVO','COMPLETADO','PAUSADO','CANCELADO') DEFAULT 'ACTIVO',
  `notas` varchar(400) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `monto_ya_ahorrado` decimal(18,2) DEFAULT 0.00 COMMENT 'Monto ya ahorrado antes de registrar en el sistema',
  `meses_transcurridos` int(11) DEFAULT 0 COMMENT 'Meses ya transcurridos del ahorro'
) ;

--
-- Volcado de datos para la tabla `ahorros`
--

INSERT INTO `ahorros` (`id`, `usuario_id`, `cuenta_origen_id`, `concepto`, `tipo_ahorro`, `monto_objetivo`, `monto_mensual`, `plazo_meses`, `fecha_inicio`, `estado`, `notas`, `creado_en`, `actualizado_en`, `monto_ya_ahorrado`, `meses_transcurridos`) VALUES
(2, 1, 5, 'Ahorro Ueno', 'RECURRENTE', NULL, 1205000.00, NULL, '2025-07-20', 'ACTIVO', 'Ahorro programado de Ueno Bank', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 4820000.00, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_gasto`
--

CREATE TABLE `categorias_gasto` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `es_fijo` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias_gasto`
--

INSERT INTO `categorias_gasto` (`id`, `usuario_id`, `nombre`, `es_fijo`, `activo`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 'Alimentación', 0, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(2, 1, 'Transporte', 0, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(3, 1, 'Entretenimiento', 0, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(4, 1, 'Salud', 0, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(5, 1, 'Educación', 0, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(6, 1, 'Ropa', 0, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(7, 1, 'Tecnología', 0, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(8, 1, 'Hogar', 0, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(9, 1, 'Otros', 0, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(10, 1, 'Servicios', 1, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(11, 1, 'Seguros', 1, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(12, 1, 'Impuestos', 1, 1, '2025-10-27 16:40:39', '2025-10-27 16:40:39'),
(13, 1, 'Prestamos', 1, 1, '2025-10-28 09:55:53', '2025-10-28 09:55:53');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `consumos_tarjeta`
--

CREATE TABLE `consumos_tarjeta` (
  `id` int(11) NOT NULL,
  `tarjeta_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `concepto` varchar(200) NOT NULL,
  `monto` decimal(18,2) NOT NULL CHECK (`monto` >= 0),
  `fecha_consumo` date NOT NULL,
  `estado` enum('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
  `notas` varchar(400) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cuentas`
--

CREATE TABLE `cuentas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `tipo` enum('EFECTIVO','BANCO','TARJETA','AHORRO','COOPERATIVA','OTRA') DEFAULT 'BANCO',
  `saldo_inicial` decimal(18,2) NOT NULL DEFAULT 0.00,
  `moneda` varchar(10) NOT NULL DEFAULT 'Gs',
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cuentas`
--

INSERT INTO `cuentas` (`id`, `usuario_id`, `nombre`, `tipo`, `saldo_inicial`, `moneda`, `activa`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 'BNF', 'BANCO', 0.00, 'Gs', 1, '2025-10-28 13:56:30', '2025-10-28 14:18:07'),
(2, 1, 'Universitaria', 'COOPERATIVA', 178745.00, 'Gs', 1, '2025-10-28 13:56:49', '2025-10-28 13:58:26'),
(3, 1, 'Continental', 'BANCO', 0.00, 'Gs', 1, '2025-10-28 13:57:00', '2025-10-28 13:57:00'),
(4, 1, 'Ecko Familiar', 'BANCO', 0.00, 'Gs', 1, '2025-10-28 13:57:24', '2025-10-28 15:23:50'),
(5, 1, 'Ueno Bank', 'BANCO', 280696.00, 'Gs', 1, '2025-10-28 13:57:49', '2025-10-28 13:58:05'),
(6, 1, 'Efectivo', 'EFECTIVO', 10000.00, 'Gs', 1, '2025-10-28 13:58:51', '2025-10-29 09:02:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos_adicionales`
--

CREATE TABLE `gastos_adicionales` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_id` int(11) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `concepto` varchar(200) NOT NULL,
  `monto` decimal(18,2) NOT NULL CHECK (`monto` >= 0),
  `fecha` date NOT NULL,
  `estado` enum('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
  `notas` varchar(400) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `gastos_adicionales`
--

INSERT INTO `gastos_adicionales` (`id`, `usuario_id`, `cuenta_id`, `categoria_id`, `concepto`, `monto`, `fecha`, `estado`, `notas`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 3, 1, 'Compras Medsupar', 11000.00, '2025-10-30', 'PENDIENTE', 'Compré una coca cola para los muchachos', '2025-10-29 09:15:09', '2025-10-29 09:15:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos_fijos`
--

CREATE TABLE `gastos_fijos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_id` int(11) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `concepto` varchar(200) NOT NULL,
  `monto` decimal(18,2) NOT NULL CHECK (`monto` >= 0),
  `fecha` date NOT NULL,
  `dia_mes` int(11) DEFAULT NULL,
  `frecuencia_meses` int(11) DEFAULT 1,
  `es_recurrente` tinyint(1) DEFAULT 0,
  `duracion_meses` int(11) DEFAULT NULL,
  `gasto_padre_id` int(11) DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `estado` enum('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
  `notas` varchar(400) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `es_prestamo` tinyint(1) DEFAULT 0 COMMENT 'Indica si es un préstamo',
  `total_cuotas` int(11) DEFAULT NULL COMMENT 'Número total de cuotas del préstamo',
  `cuota_actual` int(11) DEFAULT NULL COMMENT 'Número de cuota actual (1, 2, 3, etc.)',
  `descripcion_prestamo` text DEFAULT NULL COMMENT 'Descripción adicional del préstamo'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Gastos fijos recurrentes y préstamos con soporte para cuotas numeradas automáticamente';

--
-- Volcado de datos para la tabla `gastos_fijos`
--

INSERT INTO `gastos_fijos` (`id`, `usuario_id`, `cuenta_id`, `categoria_id`, `concepto`, `monto`, `fecha`, `dia_mes`, `frecuencia_meses`, `es_recurrente`, `duracion_meses`, `gasto_padre_id`, `fecha_pago`, `estado`, `notas`, `creado_en`, `actualizado_en`, `es_prestamo`, `total_cuotas`, `cuota_actual`, `descripcion_prestamo`) VALUES
(1, 1, 1, 13, 'Prestamo BNF - Cuota 6/30', 1310000.00, '2025-11-09', 9, 1, 0, NULL, NULL, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 5, NULL),
(2, 1, 1, 13, 'Prestamo BNF - Cuota 7/30', 1310000.00, '2025-12-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 7, NULL),
(3, 1, 1, 13, 'Prestamo BNF - Cuota 8/30', 1310000.00, '2026-01-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 8, NULL),
(4, 1, 1, 13, 'Prestamo BNF - Cuota 9/30', 1310000.00, '2026-02-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 9, NULL),
(5, 1, 1, 13, 'Prestamo BNF - Cuota 10/30', 1310000.00, '2026-03-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 10, NULL),
(6, 1, 1, 13, 'Prestamo BNF - Cuota 11/30', 1310000.00, '2026-04-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 11, NULL),
(7, 1, 1, 13, 'Prestamo BNF - Cuota 12/30', 1310000.00, '2026-05-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 12, NULL),
(8, 1, 1, 13, 'Prestamo BNF - Cuota 13/30', 1310000.00, '2026-06-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 13, NULL),
(9, 1, 1, 13, 'Prestamo BNF - Cuota 14/30', 1310000.00, '2026-07-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 14, NULL),
(10, 1, 1, 13, 'Prestamo BNF - Cuota 15/30', 1310000.00, '2026-08-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 15, NULL),
(11, 1, 1, 13, 'Prestamo BNF - Cuota 16/30', 1310000.00, '2026-09-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 16, NULL),
(12, 1, 1, 13, 'Prestamo BNF - Cuota 17/30', 1310000.00, '2026-10-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 17, NULL),
(13, 1, 1, 13, 'Prestamo BNF - Cuota 18/30', 1310000.00, '2026-11-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 18, NULL),
(14, 1, 1, 13, 'Prestamo BNF - Cuota 19/30', 1310000.00, '2026-12-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 19, NULL),
(15, 1, 1, 13, 'Prestamo BNF - Cuota 20/30', 1310000.00, '2027-01-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 20, NULL),
(16, 1, 1, 13, 'Prestamo BNF - Cuota 21/30', 1310000.00, '2027-02-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 21, NULL),
(17, 1, 1, 13, 'Prestamo BNF - Cuota 22/30', 1310000.00, '2027-03-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 22, NULL),
(18, 1, 1, 13, 'Prestamo BNF - Cuota 23/30', 1310000.00, '2027-04-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 23, NULL),
(19, 1, 1, 13, 'Prestamo BNF - Cuota 24/30', 1310000.00, '2027-05-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 24, NULL),
(20, 1, 1, 13, 'Prestamo BNF - Cuota 25/30', 1310000.00, '2027-06-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 25, NULL),
(21, 1, 1, 13, 'Prestamo BNF - Cuota 26/30', 1310000.00, '2027-07-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 26, NULL),
(22, 1, 1, 13, 'Prestamo BNF - Cuota 27/30', 1310000.00, '2027-08-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 27, NULL),
(23, 1, 1, 13, 'Prestamo BNF - Cuota 28/30', 1310000.00, '2027-09-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 28, NULL),
(24, 1, 1, 13, 'Prestamo BNF - Cuota 29/30', 1310000.00, '2027-10-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 29, NULL),
(25, 1, 1, 13, 'Prestamo BNF - Cuota 30/30', 1310000.00, '2027-11-09', 9, 1, 0, NULL, 1, NULL, 'PENDIENTE', NULL, '2025-10-29 10:55:09', '2025-10-29 10:55:09', 1, 30, 30, NULL),
(26, 1, 5, 10, 'Servicios Claro', 240000.00, '2025-11-04', 4, 1, 1, 6, NULL, NULL, 'PENDIENTE', 'Pago de internet y teléfonía de claro', '2025-10-29 11:32:21', '2025-10-29 11:32:21', 0, NULL, NULL, NULL),
(27, 1, 5, 10, 'Servicios Claro', 240000.00, '2025-12-04', 4, 1, 0, NULL, 26, NULL, 'PENDIENTE', 'Pago de internet y teléfonía de claro', '2025-10-29 11:32:21', '2025-10-29 11:32:21', 0, NULL, NULL, NULL),
(28, 1, 5, 10, 'Servicios Claro', 240000.00, '2026-01-04', 4, 1, 0, NULL, 26, NULL, 'PENDIENTE', 'Pago de internet y teléfonía de claro', '2025-10-29 11:32:21', '2025-10-29 11:32:21', 0, NULL, NULL, NULL),
(29, 1, 5, 10, 'Servicios Claro', 240000.00, '2026-02-04', 4, 1, 0, NULL, 26, NULL, 'PENDIENTE', 'Pago de internet y teléfonía de claro', '2025-10-29 11:32:21', '2025-10-29 11:32:21', 0, NULL, NULL, NULL),
(30, 1, 5, 10, 'Servicios Claro', 240000.00, '2026-03-04', 4, 1, 0, NULL, 26, NULL, 'PENDIENTE', 'Pago de internet y teléfonía de claro', '2025-10-29 11:32:21', '2025-10-29 11:32:21', 0, NULL, NULL, NULL),
(31, 1, 5, 10, 'Servicios Claro', 240000.00, '2026-04-04', 4, 1, 0, NULL, 26, NULL, 'PENDIENTE', 'Pago de internet y teléfonía de claro', '2025-10-29 11:32:21', '2025-10-29 11:32:21', 0, NULL, NULL, NULL),
(32, 1, 5, 13, 'Prestamo Ueno - Cuota 5/12', 80614.00, '2025-11-28', 28, 1, 0, NULL, NULL, NULL, 'PENDIENTE', NULL, '2025-10-29 11:34:06', '2025-10-29 11:34:06', 1, 12, 4, NULL),
(33, 1, 5, 13, 'Prestamo Ueno - Cuota 6/12', 80614.00, '2025-12-28', 28, 1, 0, NULL, 32, NULL, 'PENDIENTE', NULL, '2025-10-29 11:34:06', '2025-10-29 11:34:06', 1, 12, 6, NULL),
(34, 1, 5, 13, 'Prestamo Ueno - Cuota 7/12', 80614.00, '2026-01-28', 28, 1, 0, NULL, 32, NULL, 'PENDIENTE', NULL, '2025-10-29 11:34:06', '2025-10-29 11:34:06', 1, 12, 7, NULL),
(35, 1, 5, 13, 'Prestamo Ueno - Cuota 8/12', 80614.00, '2026-02-28', 28, 1, 0, NULL, 32, NULL, 'PENDIENTE', NULL, '2025-10-29 11:34:06', '2025-10-29 11:34:06', 1, 12, 8, NULL),
(36, 1, 5, 13, 'Prestamo Ueno - Cuota 9/12', 80614.00, '2026-03-28', 28, 1, 0, NULL, 32, NULL, 'PENDIENTE', NULL, '2025-10-29 11:34:06', '2025-10-29 11:34:06', 1, 12, 9, NULL),
(37, 1, 5, 13, 'Prestamo Ueno - Cuota 10/12', 80614.00, '2026-04-28', 28, 1, 0, NULL, 32, NULL, 'PENDIENTE', NULL, '2025-10-29 11:34:06', '2025-10-29 11:34:06', 1, 12, 10, NULL),
(38, 1, 5, 13, 'Prestamo Ueno - Cuota 11/12', 80614.00, '2026-05-28', 28, 1, 0, NULL, 32, NULL, 'PENDIENTE', NULL, '2025-10-29 11:34:06', '2025-10-29 11:34:06', 1, 12, 11, NULL),
(39, 1, 5, 13, 'Prestamo Ueno - Cuota 12/12', 80614.00, '2026-06-28', 28, 1, 0, NULL, 32, NULL, 'PENDIENTE', NULL, '2025-10-29 11:34:06', '2025-10-29 11:34:06', 1, 12, 12, NULL),
(52, 1, 5, NULL, 'Ahorro Ueno - noviembre 2025', 1205000.00, '2025-11-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(53, 1, 5, NULL, 'Ahorro Ueno - diciembre 2025', 1205000.00, '2025-12-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(54, 1, 5, NULL, 'Ahorro Ueno - enero 2026', 1205000.00, '2026-01-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(55, 1, 5, NULL, 'Ahorro Ueno - febrero 2026', 1205000.00, '2026-02-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(56, 1, 5, NULL, 'Ahorro Ueno - marzo 2026', 1205000.00, '2026-03-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(57, 1, 5, NULL, 'Ahorro Ueno - abril 2026', 1205000.00, '2026-04-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(58, 1, 5, NULL, 'Ahorro Ueno - mayo 2026', 1205000.00, '2026-05-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(59, 1, 5, NULL, 'Ahorro Ueno - junio 2026', 1205000.00, '2026-06-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(60, 1, 5, NULL, 'Ahorro Ueno - julio 2026', 1205000.00, '2026-07-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(61, 1, 5, NULL, 'Ahorro Ueno - agosto 2026', 1205000.00, '2026-08-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(62, 1, 5, NULL, 'Ahorro Ueno - septiembre 2026', 1205000.00, '2026-09-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL),
(63, 1, 5, NULL, 'Ahorro Ueno - octubre 2026', 1205000.00, '2026-10-20', NULL, 1, 0, NULL, NULL, NULL, 'PENDIENTE', 'Débito automático para ahorro: Ahorro Ueno', '2025-10-29 13:01:21', '2025-10-29 13:01:21', 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ingresos`
--

CREATE TABLE `ingresos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_id` int(11) DEFAULT NULL,
  `concepto` varchar(200) NOT NULL,
  `monto` decimal(18,2) NOT NULL CHECK (`monto` >= 0),
  `fecha` date NOT NULL,
  `estado` enum('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
  `notas` varchar(400) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `dia_mes` int(11) DEFAULT NULL COMMENT 'Día del mes para ingresos recurrentes (1-31)',
  `frecuencia_meses` int(11) DEFAULT 1 COMMENT 'Cada cuántos meses se repite (1=mensual, 3=trimestral)',
  `es_recurrente` tinyint(1) DEFAULT 0 COMMENT 'Si es un ingreso que se repite automáticamente',
  `ingreso_padre_id` int(11) DEFAULT NULL COMMENT 'ID del ingreso original para los generados automáticamente',
  `fecha_cobro` date DEFAULT NULL COMMENT 'Fecha real cuando se cobró el ingreso'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ingresos`
--

INSERT INTO `ingresos` (`id`, `usuario_id`, `cuenta_id`, `concepto`, `monto`, `fecha`, `estado`, `notas`, `creado_en`, `actualizado_en`, `dia_mes`, `frecuencia_meses`, `es_recurrente`, `ingreso_padre_id`, `fecha_cobro`) VALUES
(1, 1, 3, 'Salario restante', 3965000.00, '2025-10-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, NULL, NULL),
(2, 1, 3, 'Salario restante', 3965000.00, '2025-11-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(3, 1, 3, 'Salario restante', 3965000.00, '2025-12-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(4, 1, 3, 'Salario restante', 3965000.00, '2026-01-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(5, 1, 3, 'Salario restante', 3965000.00, '2026-02-28', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(6, 1, 3, 'Salario restante', 3965000.00, '2026-03-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(7, 1, 3, 'Salario restante', 3965000.00, '2026-04-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(8, 1, 3, 'Salario restante', 3965000.00, '2026-05-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(9, 1, 3, 'Salario restante', 3965000.00, '2026-06-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(10, 1, 3, 'Salario restante', 3965000.00, '2026-07-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(11, 1, 3, 'Salario restante', 3965000.00, '2026-08-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(12, 1, 3, 'Salario restante', 3965000.00, '2026-09-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(13, 1, 3, 'Salario restante', 3965000.00, '2026-10-30', 'PENDIENTE', NULL, '2025-10-29 09:10:07', '2025-10-29 09:10:07', 30, 1, 1, 1, NULL),
(27, 1, 3, 'Anticipo salario', 1950000.00, '2025-11-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, NULL, NULL),
(28, 1, 3, 'Anticipo salario', 1950000.00, '2025-12-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(29, 1, 3, 'Anticipo salario', 1950000.00, '2026-01-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(30, 1, 3, 'Anticipo salario', 1950000.00, '2026-02-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(31, 1, 3, 'Anticipo salario', 1950000.00, '2026-03-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(32, 1, 3, 'Anticipo salario', 1950000.00, '2026-04-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(33, 1, 3, 'Anticipo salario', 1950000.00, '2026-05-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(34, 1, 3, 'Anticipo salario', 1950000.00, '2026-06-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(35, 1, 3, 'Anticipo salario', 1950000.00, '2026-07-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(36, 1, 3, 'Anticipo salario', 1950000.00, '2026-08-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(37, 1, 3, 'Anticipo salario', 1950000.00, '2026-09-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(38, 1, 3, 'Anticipo salario', 1950000.00, '2026-10-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(39, 1, 3, 'Anticipo salario', 1950000.00, '2026-11-15', 'PENDIENTE', NULL, '2025-10-29 11:23:31', '2025-10-29 11:23:31', 15, 1, 1, 27, NULL),
(40, 1, 3, 'Aporte Lina', 300000.00, '2025-11-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, NULL, NULL),
(41, 1, 3, 'Aporte Lina', 300000.00, '2025-12-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(42, 1, 3, 'Aporte Lina', 300000.00, '2026-01-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(43, 1, 3, 'Aporte Lina', 300000.00, '2026-02-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(44, 1, 3, 'Aporte Lina', 300000.00, '2026-03-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(45, 1, 3, 'Aporte Lina', 300000.00, '2026-04-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(46, 1, 3, 'Aporte Lina', 300000.00, '2026-05-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(47, 1, 3, 'Aporte Lina', 300000.00, '2026-06-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(48, 1, 3, 'Aporte Lina', 300000.00, '2026-07-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(49, 1, 3, 'Aporte Lina', 300000.00, '2026-08-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(50, 1, 3, 'Aporte Lina', 300000.00, '2026-09-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(51, 1, 3, 'Aporte Lina', 300000.00, '2026-10-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(52, 1, 3, 'Aporte Lina', 300000.00, '2026-11-10', 'PENDIENTE', 'Aporte de Lina para el préstamo de BNF', '2025-10-29 11:24:16', '2025-10-29 11:24:16', 10, 1, 1, 40, NULL),
(53, 1, 2, 'Rueda Universitaria', 3080000.00, '2025-11-01', 'PENDIENTE', 'Plata retirada de la cancelación de la rueda universitaria de 100 millones con previa penalización', '2025-10-29 11:27:43', '2025-10-29 11:27:43', NULL, 1, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs_acceso`
--

CREATE TABLE `logs_acceso` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `accion` enum('LOGIN_SUCCESS','LOGIN_FAILED','LOGOUT','SESSION_EXPIRED') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `detalles` text DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `logs_acceso`
--

INSERT INTO `logs_acceso` (`id`, `usuario_id`, `username`, `accion`, `ip_address`, `user_agent`, `detalles`, `creado_en`) VALUES
(1, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-27 21:47:07'),
(2, NULL, 'fmaldonado', 'LOGIN_FAILED', NULL, NULL, 'Invalid credentials', '2025-10-27 21:47:35'),
(3, NULL, 'fmaldonado', 'LOGIN_FAILED', NULL, NULL, 'Invalid credentials', '2025-10-27 21:47:42'),
(4, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-28 07:58:44'),
(5, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-28 11:33:59'),
(6, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-28 13:14:26'),
(7, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-28 14:30:53'),
(8, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-28 14:34:44'),
(9, NULL, 'admin', 'LOGIN_FAILED', NULL, NULL, 'Invalid credentials', '2025-10-29 08:56:43'),
(10, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-29 08:56:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `migraciones`
--

CREATE TABLE `migraciones` (
  `id` int(11) NOT NULL,
  `version` varchar(50) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `ejecutada_en` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `migraciones`
--

INSERT INTO `migraciones` (`id`, `version`, `nombre`, `ejecutada_en`) VALUES
(1, '0001', '0001_esquema_inicial.sql', '2025-10-28 13:54:09'),
(2, '0002', '0002_add_authentication.sql', '2025-10-28 13:54:09'),
(4, '0003', '0003_categorias_iniciales_usuario.sql', '2025-10-28 13:54:09'),
(6, '0004', '0004_agregar_tipo_cooperativa.sql', '2025-10-28 13:54:16'),
(7, '0005', '0005_agregar_campos_prestamo.sql', '2025-10-29 09:18:09'),
(8, '0002_ahorros', 'Agregar tabla ahorros y funcionalidades', '2025-10-29 12:38:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos`
--

CREATE TABLE `movimientos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_origen_id` int(11) DEFAULT NULL,
  `cuenta_destino_id` int(11) DEFAULT NULL,
  `tipo` enum('INGRESO','GASTO','TRANSFERENCIA_ENTRADA','TRANSFERENCIA_SALIDA') NOT NULL,
  `monto` decimal(18,2) NOT NULL CHECK (`monto` >= 0),
  `fecha` date NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sesiones`
--

CREATE TABLE `sesiones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(500) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sesiones`
--

INSERT INTO `sesiones` (`id`, `usuario_id`, `token`, `expires_at`, `ip_address`, `user_agent`, `activa`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 'token_1_1761612427847_eyk20t5wn', '2025-10-29 00:47:07', NULL, NULL, 0, '2025-10-27 21:47:07', '2025-10-27 21:47:31'),
(2, 1, 'token_1_1761649124734_njnnj2xdt', '2025-10-29 10:58:44', NULL, NULL, 0, '2025-10-28 07:58:44', '2025-10-28 11:33:48'),
(3, 1, 'token_1_1761662039022_chnq2lk81', '2025-10-29 14:33:59', NULL, NULL, 0, '2025-10-28 11:33:59', '2025-10-28 12:00:44'),
(4, 1, 'token_1_1761668066456_stwwfxchs', '2025-10-29 16:14:26', NULL, NULL, 1, '2025-10-28 13:14:26', '2025-10-28 13:14:26'),
(5, 1, 'token_1_1761672652998_9d0ysdg5c', '2025-10-29 17:30:52', NULL, NULL, 0, '2025-10-28 14:30:52', '2025-10-28 17:30:33'),
(6, 1, 'token_1_1761672884915_dti94kojz', '2025-10-29 17:34:44', NULL, NULL, 1, '2025-10-28 14:34:44', '2025-10-28 14:34:44'),
(7, 1, 'token_1_1761739006891_keyqiutmf', '2025-10-30 11:56:46', NULL, NULL, 1, '2025-10-29 08:56:46', '2025-10-29 08:56:46');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarjetas`
--

CREATE TABLE `tarjetas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_id` int(11) DEFAULT NULL,
  `nombre` varchar(120) NOT NULL,
  `dia_corte` tinyint(4) NOT NULL,
  `dia_vencimiento` tinyint(4) NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transferencias`
--

CREATE TABLE `transferencias` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_origen_id` int(11) NOT NULL,
  `cuenta_destino_id` int(11) NOT NULL,
  `monto` decimal(18,2) NOT NULL,
  `concepto` varchar(200) NOT NULL,
  `estado` enum('PENDIENTE','COMPLETADA') DEFAULT 'PENDIENTE',
  `notas` varchar(400) DEFAULT NULL,
  `fecha` date NOT NULL,
  `creado_en` datetime DEFAULT current_timestamp(),
  `actualizado_en` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `email` varchar(160) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `estado` enum('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  `ultimo_acceso` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `rol` enum('ADMIN','USUARIO') DEFAULT 'USUARIO'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `username`, `nombre`, `email`, `password_hash`, `estado`, `ultimo_acceso`, `creado_en`, `actualizado_en`, `rol`) VALUES
(1, 'admin', 'Administrador', 'admin@mymoney.com', '43b2ba526d8c9dd2f79872d389194c46:dc1fbf85f09d88b94c7d7a1c175136c637a5c459def8284216d7d60637f3dae08ded2ffa63c532062f2ad869c1c1f623e93fa6fb2e0c391f6729b6493d64ca1a', 'ACTIVO', '2025-10-29 08:56:46', '2025-10-26 20:03:51', '2025-10-29 08:56:46', 'ADMIN'),
(2, 'jpavon', 'Jorgelina Pavón', 'linapavon@gmail.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'ACTIVO', NULL, '2025-10-26 20:03:51', '2025-10-26 22:00:58', 'USUARIO'),
(3, 'fmaldonado', 'Fernando Maldonado', 'maldos1121@gmail.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'ACTIVO', NULL, '2025-10-26 22:01:33', '2025-10-26 22:01:33', 'USUARIO');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_distribucion_gastos`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_distribucion_gastos` (
`usuario_id` int(11)
,`mes` varchar(10)
,`categoria` varchar(100)
,`total_categoria` decimal(40,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_resumen_mes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_resumen_mes` (
`usuario_id` int(11)
,`mes` varchar(10)
,`ingresos_totales` decimal(62,2)
,`gastos_fijos_totales` decimal(62,2)
,`gastos_adicionales_totales` decimal(62,2)
,`consumos_tarjeta_totales` decimal(62,2)
,`saldo_restante` decimal(65,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_totales_mes`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_totales_mes` (
`usuario_id` int(11)
,`mes` varchar(10)
,`ingresos_mes` decimal(40,2)
,`gastos_fijos_mes` decimal(40,2)
,`gastos_adic_mes` decimal(40,2)
,`consumos_tc_mes` decimal(40,2)
);

-- --------------------------------------------------------

--
-- Estructura para la vista `v_distribucion_gastos`
--
DROP TABLE IF EXISTS `v_distribucion_gastos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_distribucion_gastos`  AS SELECT `u`.`id` AS `usuario_id`, date_format(`x`.`fecha`,'%Y-%m-01') AS `mes`, coalesce(`c`.`nombre`,'Sin Categoría') AS `categoria`, sum(`x`.`monto`) AS `total_categoria` FROM (((select `gastos_fijos`.`usuario_id` AS `usuario_id`,`gastos_fijos`.`fecha` AS `fecha`,`gastos_fijos`.`categoria_id` AS `categoria_id`,`gastos_fijos`.`monto` AS `monto` from `gastos_fijos` union all select `gastos_adicionales`.`usuario_id` AS `usuario_id`,`gastos_adicionales`.`fecha` AS `fecha`,`gastos_adicionales`.`categoria_id` AS `categoria_id`,`gastos_adicionales`.`monto` AS `monto` from `gastos_adicionales`) `x` join `usuarios` `u` on(`u`.`id` = `x`.`usuario_id`)) left join `categorias_gasto` `c` on(`c`.`id` = `x`.`categoria_id`)) GROUP BY `u`.`id`, date_format(`x`.`fecha`,'%Y-%m-01'), coalesce(`c`.`nombre`,'Sin Categoría') ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_resumen_mes`
--
DROP TABLE IF EXISTS `v_resumen_mes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_resumen_mes`  AS SELECT `v_totales_mes`.`usuario_id` AS `usuario_id`, `v_totales_mes`.`mes` AS `mes`, sum(`v_totales_mes`.`ingresos_mes`) AS `ingresos_totales`, sum(`v_totales_mes`.`gastos_fijos_mes`) AS `gastos_fijos_totales`, sum(`v_totales_mes`.`gastos_adic_mes`) AS `gastos_adicionales_totales`, sum(`v_totales_mes`.`consumos_tc_mes`) AS `consumos_tarjeta_totales`, sum(`v_totales_mes`.`ingresos_mes`) - (sum(`v_totales_mes`.`gastos_fijos_mes`) + sum(`v_totales_mes`.`gastos_adic_mes`) + sum(`v_totales_mes`.`consumos_tc_mes`)) AS `saldo_restante` FROM `v_totales_mes` GROUP BY `v_totales_mes`.`usuario_id`, `v_totales_mes`.`mes` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_totales_mes`
--
DROP TABLE IF EXISTS `v_totales_mes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_totales_mes`  AS SELECT `u`.`id` AS `usuario_id`, date_format(`i`.`fecha`,'%Y-%m-01') AS `mes`, coalesce(sum(`i`.`monto`),0) AS `ingresos_mes`, 0 AS `gastos_fijos_mes`, 0 AS `gastos_adic_mes`, 0 AS `consumos_tc_mes` FROM (`usuarios` `u` left join `ingresos` `i` on(`i`.`usuario_id` = `u`.`id`)) GROUP BY `u`.`id`, date_format(`i`.`fecha`,'%Y-%m-01')union all select `u`.`id` AS `id`,date_format(`gf`.`fecha`,'%Y-%m-01') AS `DATE_FORMAT(gf.fecha, '%Y-%m-01')`,0 AS `0`,coalesce(sum(`gf`.`monto`),0) AS `COALESCE(SUM(gf.monto), 0)`,0 AS `0`,0 AS `0` from (`usuarios` `u` left join `gastos_fijos` `gf` on(`gf`.`usuario_id` = `u`.`id`)) group by `u`.`id`,2 union all select `u`.`id` AS `id`,date_format(`ga`.`fecha`,'%Y-%m-01') AS `DATE_FORMAT(ga.fecha, '%Y-%m-01')`,0 AS `0`,0 AS `0`,coalesce(sum(`ga`.`monto`),0) AS `COALESCE(SUM(ga.monto), 0)`,0 AS `0` from (`usuarios` `u` left join `gastos_adicionales` `ga` on(`ga`.`usuario_id` = `u`.`id`)) group by `u`.`id`,2 union all select `u`.`id` AS `id`,date_format(`ct`.`fecha_consumo`,'%Y-%m-01') AS `DATE_FORMAT(ct.fecha_consumo, '%Y-%m-01')`,0 AS `0`,0 AS `0`,0 AS `0`,coalesce(sum(`ct`.`monto`),0) AS `COALESCE(SUM(ct.monto), 0)` from (`usuarios` `u` left join `consumos_tarjeta` `ct` on(`ct`.`usuario_id` = `u`.`id`)) group by `u`.`id`,2  ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ahorros`
--
ALTER TABLE `ahorros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ahorros_cuenta` (`cuenta_origen_id`),
  ADD KEY `idx_ahorros_usuario` (`usuario_id`),
  ADD KEY `idx_ahorros_estado` (`estado`),
  ADD KEY `idx_ahorros_fecha_inicio` (`fecha_inicio`);

--
-- Indices de la tabla `categorias_gasto`
--
ALTER TABLE `categorias_gasto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categorias_usuario` (`usuario_id`);

--
-- Indices de la tabla `consumos_tarjeta`
--
ALTER TABLE `consumos_tarjeta`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ct_tarjeta` (`tarjeta_id`),
  ADD KEY `idx_ct_usuario_fecha` (`usuario_id`,`fecha_consumo`);

--
-- Indices de la tabla `cuentas`
--
ALTER TABLE `cuentas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_cuentas_usuario` (`usuario_id`);

--
-- Indices de la tabla `gastos_adicionales`
--
ALTER TABLE `gastos_adicionales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ga_cuenta` (`cuenta_id`),
  ADD KEY `fk_ga_categoria` (`categoria_id`),
  ADD KEY `idx_ga_usuario_fecha` (`usuario_id`,`fecha`);

--
-- Indices de la tabla `gastos_fijos`
--
ALTER TABLE `gastos_fijos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_gf_cuenta` (`cuenta_id`),
  ADD KEY `fk_gf_categoria` (`categoria_id`),
  ADD KEY `idx_gf_usuario_fecha` (`usuario_id`,`fecha`),
  ADD KEY `idx_gasto_padre_id` (`gasto_padre_id`),
  ADD KEY `idx_gastos_fijos_prestamo` (`es_prestamo`,`total_cuotas`),
  ADD KEY `idx_gastos_fijos_cuota` (`gasto_padre_id`,`cuota_actual`);

--
-- Indices de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ingresos_cuenta` (`cuenta_id`),
  ADD KEY `idx_ingresos_usuario_fecha` (`usuario_id`,`fecha`),
  ADD KEY `idx_ingresos_recurrentes` (`es_recurrente`,`dia_mes`,`frecuencia_meses`),
  ADD KEY `idx_ingresos_padre` (`ingreso_padre_id`);

--
-- Indices de la tabla `logs_acceso`
--
ALTER TABLE `logs_acceso`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_logs_usuario` (`usuario_id`),
  ADD KEY `idx_logs_fecha` (`creado_en`),
  ADD KEY `idx_logs_accion` (`accion`);

--
-- Indices de la tabla `migraciones`
--
ALTER TABLE `migraciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `version` (`version`);

--
-- Indices de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_mov_origen` (`cuenta_origen_id`),
  ADD KEY `fk_mov_destino` (`cuenta_destino_id`),
  ADD KEY `idx_mov_usuario_fecha` (`usuario_id`,`fecha`);

--
-- Indices de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sesiones_usuario` (`usuario_id`),
  ADD KEY `idx_sesiones_token` (`token`),
  ADD KEY `idx_sesiones_expires` (`expires_at`);

--
-- Indices de la tabla `tarjetas`
--
ALTER TABLE `tarjetas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tarjetas_cuenta` (`cuenta_id`),
  ADD KEY `idx_tarjetas_usuario` (`usuario_id`);

--
-- Indices de la tabla `transferencias`
--
ALTER TABLE `transferencias`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_usuario_fecha` (`usuario_id`,`fecha`),
  ADD KEY `idx_cuenta_origen` (`cuenta_origen_id`),
  ADD KEY `idx_cuenta_destino` (`cuenta_destino_id`),
  ADD KEY `idx_estado` (`estado`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_usuarios_username` (`username`),
  ADD KEY `idx_usuarios_rol` (`rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ahorros`
--
ALTER TABLE `ahorros`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias_gasto`
--
ALTER TABLE `categorias_gasto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `consumos_tarjeta`
--
ALTER TABLE `consumos_tarjeta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cuentas`
--
ALTER TABLE `cuentas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `gastos_adicionales`
--
ALTER TABLE `gastos_adicionales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `gastos_fijos`
--
ALTER TABLE `gastos_fijos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT de la tabla `logs_acceso`
--
ALTER TABLE `logs_acceso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `migraciones`
--
ALTER TABLE `migraciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `tarjetas`
--
ALTER TABLE `tarjetas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `transferencias`
--
ALTER TABLE `transferencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ahorros`
--
ALTER TABLE `ahorros`
  ADD CONSTRAINT `fk_ahorros_cuenta` FOREIGN KEY (`cuenta_origen_id`) REFERENCES `cuentas` (`id`),
  ADD CONSTRAINT `fk_ahorros_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `categorias_gasto`
--
ALTER TABLE `categorias_gasto`
  ADD CONSTRAINT `fk_catgasto_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `consumos_tarjeta`
--
ALTER TABLE `consumos_tarjeta`
  ADD CONSTRAINT `fk_ct_tarjeta` FOREIGN KEY (`tarjeta_id`) REFERENCES `tarjetas` (`id`),
  ADD CONSTRAINT `fk_ct_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `cuentas`
--
ALTER TABLE `cuentas`
  ADD CONSTRAINT `fk_cuentas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `gastos_adicionales`
--
ALTER TABLE `gastos_adicionales`
  ADD CONSTRAINT `fk_ga_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_gasto` (`id`),
  ADD CONSTRAINT `fk_ga_cuenta` FOREIGN KEY (`cuenta_id`) REFERENCES `cuentas` (`id`),
  ADD CONSTRAINT `fk_ga_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `gastos_fijos`
--
ALTER TABLE `gastos_fijos`
  ADD CONSTRAINT `fk_gasto_padre` FOREIGN KEY (`gasto_padre_id`) REFERENCES `gastos_fijos` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_gf_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_gasto` (`id`),
  ADD CONSTRAINT `fk_gf_cuenta` FOREIGN KEY (`cuenta_id`) REFERENCES `cuentas` (`id`),
  ADD CONSTRAINT `fk_gf_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD CONSTRAINT `fk_ingresos_cuenta` FOREIGN KEY (`cuenta_id`) REFERENCES `cuentas` (`id`),
  ADD CONSTRAINT `fk_ingresos_padre` FOREIGN KEY (`ingreso_padre_id`) REFERENCES `ingresos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ingresos_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `logs_acceso`
--
ALTER TABLE `logs_acceso`
  ADD CONSTRAINT `fk_logs_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `movimientos`
--
ALTER TABLE `movimientos`
  ADD CONSTRAINT `fk_mov_destino` FOREIGN KEY (`cuenta_destino_id`) REFERENCES `cuentas` (`id`),
  ADD CONSTRAINT `fk_mov_origen` FOREIGN KEY (`cuenta_origen_id`) REFERENCES `cuentas` (`id`),
  ADD CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `sesiones`
--
ALTER TABLE `sesiones`
  ADD CONSTRAINT `fk_sesiones_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tarjetas`
--
ALTER TABLE `tarjetas`
  ADD CONSTRAINT `fk_tarjetas_cuenta` FOREIGN KEY (`cuenta_id`) REFERENCES `cuentas` (`id`),
  ADD CONSTRAINT `fk_tarjetas_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `transferencias`
--
ALTER TABLE `transferencias`
  ADD CONSTRAINT `transferencias_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transferencias_ibfk_2` FOREIGN KEY (`cuenta_origen_id`) REFERENCES `cuentas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transferencias_ibfk_3` FOREIGN KEY (`cuenta_destino_id`) REFERENCES `cuentas` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

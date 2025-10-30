-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-10-2025 a las 16:37:06
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
-- Estructura de tabla para la tabla `backup_consumos_tarjeta_old`
--

CREATE TABLE `backup_consumos_tarjeta_old` (
  `id` int(11) NOT NULL DEFAULT 0,
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
-- Estructura de tabla para la tabla `backup_tarjetas_old`
--

CREATE TABLE `backup_tarjetas_old` (
  `id` int(11) NOT NULL DEFAULT 0,
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
(13, 1, 'Prestamos', 1, 1, '2025-10-28 09:55:53', '2025-10-28 09:55:53'),
(14, 1, 'Ahorros', 1, 1, '2025-10-29 16:02:06', '2025-10-29 16:02:06');

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
(5, 1, 'Ueno Bank', 'BANCO', 196696.00, 'Gs', 1, '2025-10-28 13:57:49', '2025-10-30 07:46:11'),
(6, 1, 'Efectivo', 'EFECTIVO', 6000.00, 'Gs', 1, '2025-10-28 13:58:51', '2025-10-30 08:48:05');

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
  `es_ahorro` tinyint(1) DEFAULT 0 COMMENT 'Indica si es un ahorro',
  `total_cuotas` int(11) DEFAULT NULL COMMENT 'Número total de cuotas del préstamo',
  `meses_objetivo` int(11) DEFAULT NULL COMMENT 'Número total de meses del plan de ahorro',
  `cuota_actual` int(11) DEFAULT NULL COMMENT 'Número de cuota actual (1, 2, 3, etc.)',
  `mes_actual` int(11) DEFAULT 0 COMMENT 'Mes actual del ahorro (0 = no iniciado, 1-N = mes en curso)',
  `descripcion_prestamo` text DEFAULT NULL COMMENT 'Descripción adicional del préstamo',
  `monto_ya_ahorrado` decimal(18,2) DEFAULT 0.00 COMMENT 'Monto ya ahorrado antes de registrar en el sistema'
) ;

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
(1, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-30 12:33:23');

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
(8, '0002_ahorros', 'Agregar tabla ahorros y funcionalidades', '2025-10-29 12:38:03'),
(9, '0006', '0006_agregar_saldo_acumulado_movimientos.sql', '2025-10-29 14:03:38'),
(10, '0007', '0007_revertir_tabla_ahorros.sql', '2025-10-30 09:19:16'),
(11, '0009', '0009_reestructurar_sistema_tarjetas.sql', '2025-10-30 09:34:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos`
--

CREATE TABLE `movimientos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_origen_id` int(11) DEFAULT NULL,
  `cuenta_destino_id` int(11) DEFAULT NULL,
  `tarjeta_id` int(11) DEFAULT NULL,
  `tipo` enum('INGRESO','GASTO','TRANSFERENCIA','PAGO_TARJETA','GASTO_TARJETA','PAGO_DESDE_TARJETA','SALDO_ACUMULADO') NOT NULL,
  `monto` decimal(18,2) NOT NULL CHECK (`monto` >= 0),
  `fecha` date NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `saldo_acumulado` decimal(18,2) DEFAULT NULL COMMENT 'Saldo acumulado hasta este mes (solo para tipo SALDO_ACUMULADO)'
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
(7, 1, 'token_1_1761739006891_keyqiutmf', '2025-10-30 11:56:46', NULL, NULL, 1, '2025-10-29 08:56:46', '2025-10-29 08:56:46'),
(8, 1, 'token_1_1761762235899_0dnapghpd', '2025-10-30 18:23:55', NULL, NULL, 1, '2025-10-29 15:23:55', '2025-10-29 15:23:55'),
(9, 1, 'token_1_1761762897453_xvfp6uw73', '2025-10-30 18:34:57', NULL, NULL, 0, '2025-10-29 15:34:57', '2025-10-29 17:27:17'),
(10, 1, 'token_1_1761769947846_58ml54cdo', '2025-10-30 20:32:27', NULL, NULL, 0, '2025-10-29 17:32:27', '2025-10-29 17:40:15'),
(11, 1, 'token_1_1761770477722_booo3fhl8', '2025-10-30 20:41:17', NULL, NULL, 0, '2025-10-29 17:41:17', '2025-10-29 18:00:17'),
(12, 1, 'token_1_1761821005576_acctnbawh', '2025-10-31 10:43:25', NULL, NULL, 0, '2025-10-30 07:43:25', '2025-10-30 07:59:34'),
(13, 1, 'token_1_1761821992791_65g41uwen', '2025-10-31 10:59:52', NULL, NULL, 0, '2025-10-30 07:59:52', '2025-10-30 07:59:58'),
(14, 1, 'token_1_1761822006889_1t05258yg', '2025-10-31 11:00:06', NULL, NULL, 1, '2025-10-30 08:00:06', '2025-10-30 08:00:06'),
(15, 1, 'token_1_1761829064559_owon3lw3u', '2025-10-31 12:57:44', NULL, NULL, 1, '2025-10-30 09:57:44', '2025-10-30 09:57:44'),
(16, 1, 'token_1_1761838403232_9unub4mln', '2025-10-31 15:33:23', NULL, NULL, 1, '2025-10-30 12:33:23', '2025-10-30 12:33:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tarjetas`
--

CREATE TABLE `tarjetas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_id` int(11) DEFAULT NULL,
  `nombre` varchar(120) NOT NULL,
  `tipo` enum('CREDITO','DEBITO','VIRTUAL','PREPAGA') NOT NULL DEFAULT 'CREDITO',
  `limite` decimal(18,2) DEFAULT NULL COMMENT 'Límite de crédito (solo para CREDITO y VIRTUAL)',
  `saldo_utilizado` decimal(18,2) NOT NULL DEFAULT 0.00 COMMENT 'Monto utilizado actualmente',
  `moneda` varchar(3) NOT NULL DEFAULT 'PYG' COMMENT 'Moneda de la tarjeta',
  `numero_tarjeta` varchar(20) DEFAULT NULL COMMENT 'Últimos 4 dígitos para identificación',
  `banco_emisor` varchar(100) DEFAULT NULL COMMENT 'Banco o institución emisora',
  `dia_vencimiento` tinyint(4) DEFAULT NULL,
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
(1, 'admin', 'Administrador', 'admin@mymoney.com', '43b2ba526d8c9dd2f79872d389194c46:dc1fbf85f09d88b94c7d7a1c175136c637a5c459def8284216d7d60637f3dae08ded2ffa63c532062f2ad869c1c1f623e93fa6fb2e0c391f6729b6493d64ca1a', 'ACTIVO', '2025-10-30 12:33:23', '2025-10-26 20:03:51', '2025-10-30 12:33:23', 'ADMIN'),
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
,`gastos_tarjeta_totales` decimal(62,2)
,`saldo_restante` decimal(65,2)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `v_tarjetas_con_saldo`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `v_tarjetas_con_saldo` (
`id` int(11)
,`usuario_id` int(11)
,`cuenta_id` int(11)
,`nombre` varchar(120)
,`tipo` enum('CREDITO','DEBITO','VIRTUAL','PREPAGA')
,`limite` decimal(18,2)
,`saldo_utilizado` decimal(18,2)
,`moneda` varchar(3)
,`numero_tarjeta` varchar(20)
,`banco_emisor` varchar(100)
,`dia_vencimiento` tinyint(4)
,`activa` tinyint(1)
,`creado_en` datetime
,`actualizado_en` datetime
,`cuenta_asociada_nombre` varchar(120)
,`cuenta_asociada_tipo` enum('EFECTIVO','BANCO','TARJETA','AHORRO','COOPERATIVA','OTRA')
,`saldo_disponible` decimal(19,2)
,`porcentaje_utilizado` decimal(24,2)
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
,`gastos_tarjeta_mes` decimal(40,2)
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

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_resumen_mes`  AS SELECT `v_totales_mes`.`usuario_id` AS `usuario_id`, `v_totales_mes`.`mes` AS `mes`, coalesce(sum(`v_totales_mes`.`ingresos_mes`),0) AS `ingresos_totales`, coalesce(sum(`v_totales_mes`.`gastos_fijos_mes`),0) AS `gastos_fijos_totales`, coalesce(sum(`v_totales_mes`.`gastos_adic_mes`),0) AS `gastos_adicionales_totales`, coalesce(sum(`v_totales_mes`.`gastos_tarjeta_mes`),0) AS `gastos_tarjeta_totales`, coalesce(sum(`v_totales_mes`.`ingresos_mes`),0) - (coalesce(sum(`v_totales_mes`.`gastos_fijos_mes`),0) + coalesce(sum(`v_totales_mes`.`gastos_adic_mes`),0) + coalesce(sum(`v_totales_mes`.`gastos_tarjeta_mes`),0)) AS `saldo_restante` FROM `v_totales_mes` GROUP BY `v_totales_mes`.`usuario_id`, `v_totales_mes`.`mes` ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_tarjetas_con_saldo`
--
DROP TABLE IF EXISTS `v_tarjetas_con_saldo`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_tarjetas_con_saldo`  AS SELECT `t`.`id` AS `id`, `t`.`usuario_id` AS `usuario_id`, `t`.`cuenta_id` AS `cuenta_id`, `t`.`nombre` AS `nombre`, `t`.`tipo` AS `tipo`, `t`.`limite` AS `limite`, `t`.`saldo_utilizado` AS `saldo_utilizado`, `t`.`moneda` AS `moneda`, `t`.`numero_tarjeta` AS `numero_tarjeta`, `t`.`banco_emisor` AS `banco_emisor`, `t`.`dia_vencimiento` AS `dia_vencimiento`, `t`.`activa` AS `activa`, `t`.`creado_en` AS `creado_en`, `t`.`actualizado_en` AS `actualizado_en`, `c`.`nombre` AS `cuenta_asociada_nombre`, `c`.`tipo` AS `cuenta_asociada_tipo`, CASE WHEN `t`.`tipo` in ('CREDITO','VIRTUAL') AND `t`.`limite` is not null THEN `t`.`limite`- `t`.`saldo_utilizado` ELSE NULL END AS `saldo_disponible`, CASE WHEN `t`.`tipo` in ('CREDITO','VIRTUAL') AND `t`.`limite` is not null AND `t`.`limite` > 0 THEN round(`t`.`saldo_utilizado` / `t`.`limite` * 100,2) ELSE 0 END AS `porcentaje_utilizado` FROM (`tarjetas` `t` left join `cuentas` `c` on(`t`.`cuenta_id` = `c`.`id`)) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `v_totales_mes`
--
DROP TABLE IF EXISTS `v_totales_mes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_totales_mes`  AS SELECT `u`.`id` AS `usuario_id`, date_format(coalesce(`x`.`fecha`,curdate()),'%Y-%m-01') AS `mes`, sum(case when `x`.`tipo` = 'ingreso' then `x`.`monto` else 0 end) AS `ingresos_mes`, sum(case when `x`.`tipo` = 'gasto_fijo' then `x`.`monto` else 0 end) AS `gastos_fijos_mes`, sum(case when `x`.`tipo` = 'gasto_adicional' then `x`.`monto` else 0 end) AS `gastos_adic_mes`, sum(case when `x`.`tipo` = 'gasto_tarjeta' then `x`.`monto` else 0 end) AS `gastos_tarjeta_mes` FROM (`usuarios` `u` left join (select `ingresos`.`usuario_id` AS `usuario_id`,`ingresos`.`fecha` AS `fecha`,`ingresos`.`monto` AS `monto`,'ingreso' AS `tipo` from `ingresos` where `ingresos`.`estado` = 'PAGADO' union all select `gastos_fijos`.`usuario_id` AS `usuario_id`,`gastos_fijos`.`fecha` AS `fecha`,`gastos_fijos`.`monto` AS `monto`,'gasto_fijo' AS `tipo` from `gastos_fijos` where `gastos_fijos`.`estado` = 'PAGADO' union all select `gastos_adicionales`.`usuario_id` AS `usuario_id`,`gastos_adicionales`.`fecha` AS `fecha`,`gastos_adicionales`.`monto` AS `monto`,'gasto_adicional' AS `tipo` from `gastos_adicionales` union all select `movimientos`.`usuario_id` AS `usuario_id`,`movimientos`.`fecha` AS `fecha`,`movimientos`.`monto` AS `monto`,'gasto_tarjeta' AS `tipo` from `movimientos` where `movimientos`.`tipo` = 'GASTO_TARJETA') `x` on(`u`.`id` = `x`.`usuario_id`)) GROUP BY `u`.`id`, date_format(coalesce(`x`.`fecha`,curdate()),'%Y-%m-01') ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias_gasto`
--
ALTER TABLE `categorias_gasto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_categorias_usuario` (`usuario_id`);

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
  ADD KEY `idx_gastos_fijos_cuota` (`gasto_padre_id`,`cuota_actual`),
  ADD KEY `idx_gastos_fijos_es_ahorro` (`es_ahorro`),
  ADD KEY `idx_gastos_fijos_ahorro_usuario` (`usuario_id`,`es_ahorro`);

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
  ADD KEY `idx_mov_usuario_fecha` (`usuario_id`,`fecha`),
  ADD KEY `idx_movimientos_saldo_acumulado` (`usuario_id`,`tipo`,`fecha`),
  ADD KEY `fk_movimientos_tarjeta` (`tarjeta_id`);

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
  ADD KEY `idx_tarjetas_usuario` (`usuario_id`),
  ADD KEY `idx_tarjetas_tipo` (`tipo`),
  ADD KEY `idx_tarjetas_usuario_activa` (`usuario_id`,`activa`);

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
-- AUTO_INCREMENT de la tabla `categorias_gasto`
--
ALTER TABLE `categorias_gasto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `cuentas`
--
ALTER TABLE `cuentas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `gastos_adicionales`
--
ALTER TABLE `gastos_adicionales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `gastos_fijos`
--
ALTER TABLE `gastos_fijos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `logs_acceso`
--
ALTER TABLE `logs_acceso`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `migraciones`
--
ALTER TABLE `migraciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

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
-- Filtros para la tabla `categorias_gasto`
--
ALTER TABLE `categorias_gasto`
  ADD CONSTRAINT `fk_catgasto_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

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
  ADD CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `fk_movimientos_tarjeta` FOREIGN KEY (`tarjeta_id`) REFERENCES `tarjetas` (`id`);

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

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 27-10-2025 a las 18:41:37
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
CREATE DATABASE IF NOT EXISTS `my_money` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `my_money`;

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
  `tipo` enum('EFECTIVO','BANCO','TARJETA','AHORRO','OTRA') DEFAULT 'BANCO',
  `saldo_inicial` decimal(18,2) NOT NULL DEFAULT 0.00,
  `moneda` varchar(10) NOT NULL DEFAULT 'Gs',
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `estado` enum('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
  `notas` varchar(400) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
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
(1, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 20:18:31'),
(2, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 20:20:23'),
(3, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 20:38:13'),
(4, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 20:40:03'),
(5, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 20:50:09'),
(6, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 20:50:57'),
(7, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 21:00:11'),
(8, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 21:23:17'),
(9, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 21:31:14'),
(10, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 21:33:44'),
(11, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 21:36:31'),
(12, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 21:38:13'),
(13, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 21:40:11'),
(14, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 21:41:07'),
(15, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 21:44:11'),
(16, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 22:00:30'),
(17, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-26 22:19:06'),
(18, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-27 08:07:45'),
(19, 1, 'admin', 'LOGIN_SUCCESS', NULL, NULL, 'User logged in successfully', '2025-10-27 14:39:12');

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
(1, '0001', '0001_esquema_inicial.sql', '2025-10-23 16:42:22'),
(2, '0002', '0002_add_authentication.sql', '2025-10-26 20:03:51');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `movimientos`
--

CREATE TABLE `movimientos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cuenta_origen_id` int(11) DEFAULT NULL,
  `cuenta_destino_id` int(11) DEFAULT NULL,
  `tipo` enum('INGRESO','GASTO','TRANSFERENCIA','PAGO_TARJETA') NOT NULL,
  `monto` decimal(18,2) NOT NULL CHECK (`monto` >= 0),
  `fecha` date NOT NULL,
  `descripcion` varchar(300) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

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
(1, 1, 'token_1_1761520711369_vucq7qtoz', '2025-10-27 23:18:31', NULL, NULL, 0, '2025-10-26 20:18:31', '2025-10-26 20:20:13'),
(2, 1, 'token_1_1761520823633_m1j1ffe4d', '2025-10-27 23:20:23', NULL, NULL, 0, '2025-10-26 20:20:23', '2025-10-26 20:36:33'),
(3, 1, 'token_1_1761521892994_6qpku92uo', '2025-10-27 23:38:12', NULL, NULL, 0, '2025-10-26 20:38:12', '2025-10-26 20:39:59'),
(4, 1, 'token_1_1761522003584_ggc3sfe6q', '2025-10-27 23:40:03', NULL, NULL, 1, '2025-10-26 20:40:03', '2025-10-26 20:40:03'),
(5, 1, 'token_1_1761522609913_1aopwr2io', '2025-10-27 23:50:09', NULL, NULL, 0, '2025-10-26 20:50:09', '2025-10-26 20:50:24'),
(6, 1, 'token_1_1761522657539_1wqekny61', '2025-10-27 23:50:57', NULL, NULL, 0, '2025-10-26 20:50:57', '2025-10-26 21:00:03'),
(7, 1, 'token_1_1761523211990_6qptr5htb', '2025-10-28 00:00:11', NULL, NULL, 0, '2025-10-26 21:00:11', '2025-10-26 21:23:09'),
(8, 1, 'token_1_1761524597726_9lnhpcvvp', '2025-10-28 00:23:17', NULL, NULL, 0, '2025-10-26 21:23:17', '2025-10-26 21:30:23'),
(9, 1, 'token_1_1761525074059_a921j54sn', '2025-10-28 00:31:14', NULL, NULL, 1, '2025-10-26 21:31:14', '2025-10-26 21:31:14'),
(10, 1, 'token_1_1761525224133_y2f9cwfyw', '2025-10-28 00:33:44', NULL, NULL, 0, '2025-10-26 21:33:44', '2025-10-26 21:36:06'),
(11, 1, 'token_1_1761525391652_akniktme6', '2025-10-28 00:36:31', NULL, NULL, 1, '2025-10-26 21:36:31', '2025-10-26 21:36:31'),
(12, 1, 'token_1_1761525493872_nyn93c4h3', '2025-10-28 00:38:13', NULL, NULL, 0, '2025-10-26 21:38:13', '2025-10-26 21:39:06'),
(13, 1, 'token_1_1761525611681_u22856a55', '2025-10-28 00:40:11', NULL, NULL, 1, '2025-10-26 21:40:11', '2025-10-26 21:40:11'),
(14, 1, 'token_1_1761525667057_vzbog7mwd', '2025-10-28 00:41:07', NULL, NULL, 0, '2025-10-26 21:41:07', '2025-10-26 21:42:39'),
(15, 1, 'token_1_1761525851193_lhfa2bu9n', '2025-10-28 00:44:11', NULL, NULL, 0, '2025-10-26 21:44:11', '2025-10-26 22:00:22'),
(16, 1, 'token_1_1761526830807_exzsps6eo', '2025-10-28 01:00:30', NULL, NULL, 1, '2025-10-26 22:00:30', '2025-10-26 22:00:30'),
(17, 1, 'token_1_1761527946057_1l36ufau5', '2025-10-28 01:19:06', NULL, NULL, 0, '2025-10-26 22:19:06', '2025-10-26 22:19:30'),
(18, 1, 'token_1_1761563265299_s87bvl7ap', '2025-10-28 11:07:45', NULL, NULL, 0, '2025-10-27 08:07:45', '2025-10-27 11:46:38'),
(19, 1, 'token_1_1761586752302_g4n4ug6i2', '2025-10-28 17:39:12', NULL, NULL, 1, '2025-10-27 14:39:12', '2025-10-27 14:39:12');

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
(1, 'admin', 'Administrador', 'admin@mymoney.com', '43b2ba526d8c9dd2f79872d389194c46:dc1fbf85f09d88b94c7d7a1c175136c637a5c459def8284216d7d60637f3dae08ded2ffa63c532062f2ad869c1c1f623e93fa6fb2e0c391f6729b6493d64ca1a', 'ACTIVO', '2025-10-27 14:39:12', '2025-10-26 20:03:51', '2025-10-27 14:39:12', 'ADMIN'),
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
  ADD KEY `idx_gf_usuario_fecha` (`usuario_id`,`fecha`);

--
-- Indices de la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_ingresos_cuenta` (`cuenta_id`),
  ADD KEY `idx_ingresos_usuario_fecha` (`usuario_id`,`fecha`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `consumos_tarjeta`
--
ALTER TABLE `consumos_tarjeta`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cuentas`
--
ALTER TABLE `cuentas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `migraciones`
--
ALTER TABLE `migraciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `movimientos`
--
ALTER TABLE `movimientos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `sesiones`
--
ALTER TABLE `sesiones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `tarjetas`
--
ALTER TABLE `tarjetas`
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
  ADD CONSTRAINT `fk_gf_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `categorias_gasto` (`id`),
  ADD CONSTRAINT `fk_gf_cuenta` FOREIGN KEY (`cuenta_id`) REFERENCES `cuentas` (`id`),
  ADD CONSTRAINT `fk_gf_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `ingresos`
--
ALTER TABLE `ingresos`
  ADD CONSTRAINT `fk_ingresos_cuenta` FOREIGN KEY (`cuenta_id`) REFERENCES `cuentas` (`id`),
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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

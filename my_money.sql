-- =========================================
-- Esquema: finanzas_personales
-- Autor: Fernando
-- =========================================

CREATE DATABASE IF NOT EXISTS finanzas_personales
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE finanzas_personales;

-- ============================
-- 1) Tablas maestras
-- ============================

CREATE TABLE usuarios (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(120) NOT NULL,
  email           VARCHAR(160) UNIQUE,
  estado          ENUM('ACTIVO','INACTIVO') DEFAULT 'ACTIVO',
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE cuentas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  nombre          VARCHAR(120) NOT NULL,             -- Ej: Efectivo, Ecko, BNF, Universitaria, Cadem, Ahorro Ueno
  tipo            ENUM('EFECTIVO','BANCO','TARJETA','AHORRO','OTRA') DEFAULT 'BANCO',
  saldo_inicial   DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  moneda          VARCHAR(10) NOT NULL DEFAULT 'Gs',
  activa          TINYINT(1) NOT NULL DEFAULT 1,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cuentas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE INDEX idx_cuentas_usuario ON cuentas(usuario_id);

CREATE TABLE categorias_gasto (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  nombre          VARCHAR(100) NOT NULL,     -- Ej: Universidad, Internet, Gimnasio, Transporte, Alimentación
  es_fijo         TINYINT(1) NOT NULL DEFAULT 0,  -- marca si normalmente es gasto fijo
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_catgasto_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE INDEX idx_categorias_usuario ON categorias_gasto(usuario_id);

-- ============================
-- 2) Ingresos y Gastos
-- ============================

CREATE TABLE ingresos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  cuenta_id       INT NULL,                  -- opcional: a qué cuenta ingresa
  concepto        VARCHAR(200) NOT NULL,     -- Ej: Salario Octubre, Amorcito BNF, Anticipo
  monto           DECIMAL(18,2) NOT NULL CHECK (monto >= 0),
  fecha           DATE NOT NULL,
  estado          ENUM('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE', -- 'PAGADO' = recibido
  notas           VARCHAR(400),
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ingresos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_ingresos_cuenta  FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
) ENGINE=InnoDB;

CREATE INDEX idx_ingresos_usuario_fecha ON ingresos(usuario_id, fecha);

CREATE TABLE gastos_fijos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  cuenta_id       INT NULL,                  -- desde qué cuenta se paga
  categoria_id    INT NULL,                  -- vínculo a categoría
  concepto        VARCHAR(200) NOT NULL,     -- Ej: Pago Prestamo BNF, Ahorro Ueno, Internet Hogar
  monto           DECIMAL(18,2) NOT NULL CHECK (monto >= 0),
  fecha           DATE NOT NULL,             -- fecha de pago correspondiente (del mes)
  estado          ENUM('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
  notas           VARCHAR(400),
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_gf_usuario    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_gf_cuenta     FOREIGN KEY (cuenta_id) REFERENCES cuentas(id),
  CONSTRAINT fk_gf_categoria  FOREIGN KEY (categoria_id) REFERENCES categorias_gasto(id)
) ENGINE=InnoDB;

CREATE INDEX idx_gf_usuario_fecha ON gastos_fijos(usuario_id, fecha);

CREATE TABLE gastos_adicionales (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  cuenta_id       INT NULL,
  categoria_id    INT NULL,
  concepto        VARCHAR(200) NOT NULL,     -- Ej: Cuota Gonzalito 9|15, Gimnasio Personalizado
  monto           DECIMAL(18,2) NOT NULL CHECK (monto >= 0),
  fecha           DATE NOT NULL,
  estado          ENUM('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
  notas           VARCHAR(400),
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ga_usuario    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_ga_cuenta     FOREIGN KEY (cuenta_id) REFERENCES cuentas(id),
  CONSTRAINT fk_ga_categoria  FOREIGN KEY (categoria_id) REFERENCES categorias_gasto(id)
) ENGINE=InnoDB;

CREATE INDEX idx_ga_usuario_fecha ON gastos_adicionales(usuario_id, fecha);

-- ============================
-- 3) Tarjetas de crédito
-- ============================

CREATE TABLE tarjetas (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  cuenta_id       INT NULL,              -- cuenta asociada donde se paga el resumen
  nombre          VARCHAR(120) NOT NULL, -- Ej: Universitaria | Chat GPT
  dia_corte       TINYINT NOT NULL,      -- 1..31
  dia_vencimiento TINYINT NOT NULL,      -- 1..31
  activa          TINYINT(1) NOT NULL DEFAULT 1,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tarjetas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_tarjetas_cuenta  FOREIGN KEY (cuenta_id) REFERENCES cuentas(id)
) ENGINE=InnoDB;

CREATE INDEX idx_tarjetas_usuario ON tarjetas(usuario_id);

CREATE TABLE consumos_tarjeta (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  tarjeta_id      INT NOT NULL,
  usuario_id      INT NOT NULL,
  concepto        VARCHAR(200) NOT NULL,
  monto           DECIMAL(18,2) NOT NULL CHECK (monto >= 0),
  fecha_consumo   DATE NOT NULL,
  estado          ENUM('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',  -- pagado cuando se abona el resumen
  notas           VARCHAR(400),
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ct_tarjeta FOREIGN KEY (tarjeta_id) REFERENCES tarjetas(id),
  CONSTRAINT fk_ct_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
) ENGINE=InnoDB;

CREATE INDEX idx_ct_usuario_fecha ON consumos_tarjeta(usuario_id, fecha_consumo);

-- ============================
-- 4) Movimientos (asientos entre cuentas)
-- ============================

CREATE TABLE movimientos (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id      INT NOT NULL,
  cuenta_origen_id  INT NULL,    -- puede ser NULL si es ingreso externo
  cuenta_destino_id INT NULL,    -- puede ser NULL si es gasto hacia afuera
  tipo            ENUM('INGRESO','GASTO','TRANSFERENCIA','PAGO_TARJETA') NOT NULL,
  monto           DECIMAL(18,2) NOT NULL CHECK (monto >= 0),
  fecha           DATE NOT NULL,
  descripcion     VARCHAR(300),
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_mov_usuario       FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  CONSTRAINT fk_mov_origen        FOREIGN KEY (cuenta_origen_id)  REFERENCES cuentas(id),
  CONSTRAINT fk_mov_destino       FOREIGN KEY (cuenta_destino_id) REFERENCES cuentas(id),
  CHECK (
    (tipo IN ('TRANSFERENCIA','PAGO_TARJETA') AND cuenta_origen_id IS NOT NULL AND cuenta_destino_id IS NOT NULL)
    OR
    (tipo = 'INGRESO' AND cuenta_destino_id IS NOT NULL)
    OR
    (tipo = 'GASTO' AND cuenta_origen_id IS NOT NULL)
  )
) ENGINE=InnoDB;

CREATE INDEX idx_mov_usuario_fecha ON movimientos(usuario_id, fecha);

-- ============================
-- 5) Vistas para Dashboard
-- ============================

-- Totales por mes (ingresos/gastos/consumos tarjeta) y saldo restante
CREATE OR REPLACE VIEW v_totales_mes AS
SELECT
  u.id AS usuario_id,
  DATE_FORMAT(i.fecha, '%Y-%m-01') AS mes,
  COALESCE(SUM(i.monto), 0) AS ingresos_mes,
  0 AS gastos_fijos_mes,
  0 AS gastos_adic_mes,
  0 AS consumos_tc_mes
FROM usuarios u
LEFT JOIN ingresos i ON i.usuario_id = u.id
GROUP BY u.id, mes
UNION ALL
SELECT
  u.id,
  DATE_FORMAT(gf.fecha, '%Y-%m-01'),
  0,
  COALESCE(SUM(gf.monto), 0),
  0,
  0
FROM usuarios u
LEFT JOIN gastos_fijos gf ON gf.usuario_id = u.id
GROUP BY u.id, 2
UNION ALL
SELECT
  u.id,
  DATE_FORMAT(ga.fecha, '%Y-%m-01'),
  0,
  0,
  COALESCE(SUM(ga.monto), 0),
  0
FROM usuarios u
LEFT JOIN gastos_adicionales ga ON ga.usuario_id = u.id
GROUP BY u.id, 2
UNION ALL
SELECT
  u.id,
  DATE_FORMAT(ct.fecha_consumo, '%Y-%m-01'),
  0,
  0,
  0,
  COALESCE(SUM(ct.monto), 0)
FROM usuarios u
LEFT JOIN consumos_tarjeta ct ON ct.usuario_id = u.id
GROUP BY u.id, 2;

-- Vista de resumen consolidado por mes
CREATE OR REPLACE VIEW v_resumen_mes AS
SELECT
  usuario_id,
  mes,
  SUM(ingresos_mes)       AS ingresos_totales,
  SUM(gastos_fijos_mes)   AS gastos_fijos_totales,
  SUM(gastos_adic_mes)    AS gastos_adicionales_totales,
  SUM(consumos_tc_mes)    AS consumos_tarjeta_totales,
  SUM(ingresos_mes) - (SUM(gastos_fijos_mes) + SUM(gastos_adic_mes) + SUM(consumos_tc_mes)) AS saldo_restante
FROM v_totales_mes
GROUP BY usuario_id, mes;

-- Distribución de gastos (fijos+adicionales) por categoría y mes
CREATE OR REPLACE VIEW v_distribucion_gastos AS
SELECT
  u.id AS usuario_id,
  DATE_FORMAT(x.fecha, '%Y-%m-01') AS mes,
  c.nombre AS categoria,
  SUM(x.monto) AS total_categoria
FROM (
  SELECT usuario_id, fecha, categoria_id, monto FROM gastos_fijos
  UNION ALL
  SELECT usuario_id, fecha, categoria_id, monto FROM gastos_adicionales
) x
JOIN usuarios u ON u.id = x.usuario_id
LEFT JOIN categorias_gasto c ON c.id = x.categoria_id
GROUP BY u.id, mes, categoria;

-- ============================
-- 6) Datos semilla (opcionales)
-- ============================

INSERT INTO usuarios (nombre, email) VALUES ('Fernando', 'fernando@example.com');

-- Cuentas (ajusta nombres a tus bancos reales)
INSERT INTO cuentas (usuario_id, nombre, tipo, saldo_inicial) VALUES
(1, 'Efectivo', 'EFECTIVO', 0),
(1, 'Ecko', 'BANCO', 0),
(1, 'BNF', 'BANCO', 0),
(1, 'Universitaria', 'TARJETA', 0),
(1, 'Cadem', 'BANCO', 0),
(1, 'Ahorro Ueno', 'AHORRO', 0);

-- Categorías de ejemplo
INSERT INTO categorias_gasto (usuario_id, nombre, es_fijo) VALUES
(1, 'Universidad', 1),
(1, 'Internet Hogar', 1),
(1, 'Gimnasio', 0),
(1, 'Prestamos', 1),
(1, 'Transporte', 0);

-- Ejemplos de filas (puedes borrar)
INSERT INTO ingresos (usuario_id, cuenta_id, concepto, monto, fecha, estado)
VALUES
(1, 1, 'Saldo Restante', 397833, '2025-10-01', 'PAGADO'),
(1, 2, 'Salario Octubre', 3954000, '2025-10-05', 'PENDIENTE'),
(1, 3, 'Amorcito | Prestamo BNF 6', 300000, '2025-10-07', 'PENDIENTE'),
(1, 2, 'Anticipo Salario Noviembre', 1950000, '2025-10-10', 'PENDIENTE');

INSERT INTO gastos_fijos (usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, estado)
VALUES
(1, 3, (SELECT id FROM categorias_gasto WHERE nombre='Prestamos' AND usuario_id=1 LIMIT 1), 'Pago Prestamo BNF 6 | 30', 1312829, '2025-10-08', 'PENDIENTE'),
(1, 6, (SELECT id FROM categorias_gasto WHERE nombre='Ahorro' LIMIT 1), 'Ahorro Ueno', 1205000, '2025-10-08', 'PENDIENTE');

INSERT INTO gastos_adicionales (usuario_id, cuenta_id, categoria_id, concepto, monto, fecha, estado)
VALUES
(1, 2, (SELECT id FROM categorias_gasto WHERE nombre='Universidad' AND usuario_id=1 LIMIT 1), 'Cuota Gonzalito 9 | 15', 391000, '2025-10-09', 'PENDIENTE'),
(1, 2, (SELECT id FROM categorias_gasto WHERE nombre='Gimnasio' AND usuario_id=1 LIMIT 1), 'Gimnasio | Personalizado', 330000, '2025-10-10', 'PENDIENTE');

INSERT INTO tarjetas (usuario_id, cuenta_id, nombre, dia_corte, dia_vencimiento)
VALUES (1, 2, 'Universitaria | Chat GPT', 10, 20);

INSERT INTO consumos_tarjeta (tarjeta_id, usuario_id, concepto, monto, fecha_consumo, estado)
VALUES (1, 1, 'Suscripción ChatGPT', 150000, '2025-10-12', 'PENDIENTE');

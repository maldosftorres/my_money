-- =========================================
-- Esquema: my_money
-- Autor: Fernando
-- Creado: 2025-10-23
-- =========================================

USE my_money;

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
  nombre          VARCHAR(120) NOT NULL,
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
  nombre          VARCHAR(100) NOT NULL,
  es_fijo         TINYINT(1) NOT NULL DEFAULT 0,
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
  cuenta_id       INT NULL,
  concepto        VARCHAR(200) NOT NULL,
  monto           DECIMAL(18,2) NOT NULL CHECK (monto >= 0),
  fecha           DATE NOT NULL,
  estado          ENUM('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
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
  cuenta_id       INT NULL,
  categoria_id    INT NULL,
  concepto        VARCHAR(200) NOT NULL,
  monto           DECIMAL(18,2) NOT NULL CHECK (monto >= 0),
  fecha           DATE NOT NULL,
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
  concepto        VARCHAR(200) NOT NULL,
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
  cuenta_id       INT NULL,
  nombre          VARCHAR(120) NOT NULL,
  dia_corte       TINYINT NOT NULL,
  dia_vencimiento TINYINT NOT NULL,
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
  estado          ENUM('PENDIENTE','PAGADO') DEFAULT 'PENDIENTE',
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
  cuenta_origen_id  INT NULL,
  cuenta_destino_id INT NULL,
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
  COALESCE(c.nombre, 'Sin Categoría') AS categoria,
  SUM(x.monto) AS total_categoria
FROM (
  SELECT usuario_id, fecha, categoria_id, monto FROM gastos_fijos
  UNION ALL
  SELECT usuario_id, fecha, categoria_id, monto FROM gastos_adicionales
) x
JOIN usuarios u ON u.id = x.usuario_id
LEFT JOIN categorias_gasto c ON c.id = x.categoria_id
GROUP BY u.id, mes, categoria;
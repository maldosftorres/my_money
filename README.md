# 💰 MyMoney - Personal Finance Management System

<div align="center">

![MyMoney Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=MyMoney+-+Gestiona+tus+Finanzas+Inteligentemente)

**Sistema completo de gestión financiera personal con préstamos, ahorros programados, autenticación multi-usuario y funcionalidades avanzadas**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[🚀 Demo](#) • [📖 Docs](./API_ENDPOINTS.md) • [🐛 Issues](#) • [📋 Roadmap](./ROADMAP.md)

</div>

## 🌟 Características Principales

- 💳 **Gestión de Cuentas** - Control total de cuentas bancarias, efectivo e inversiones con tipos cooperativa
- 📊 **Seguimiento de Gastos** - Categorización inteligente y análisis de patrones de consumo
- 💰 **Control de Ingresos** - Sistema de ingresos recurrentes con estados PENDIENTE/PAGADO
- 🎯 **Gastos Fijos Avanzados** - Soporte para préstamos con cuotas numeradas automáticamente
- 🏦 **Sistema de Préstamos** - Gestión completa de cuotas con numeración automática (Cuota X/Y)
- 🐷 **Ahorros Programados** - Metas de ahorro con seguimiento mensual (Mes X/Y) *(EN DESARROLLO)*
- 💎 **Gastos Adicionales** - Gestión completa de gastos variables con categorización
- 🔄 **Transferencias** - Sistema completo entre cuentas con estados PENDIENTE/COMPLETADA  
- 👥 **Multi-Usuario** - Sistema de autenticación JWT con roles de administrador
- 📈 **Dashboard Inteligente** - Métricas en tiempo real con cálculos automáticos
- 🌍 **Moneda Paraguaya** - Formateo en Guaraníes (Gs) con localización es-PY
- 🔒 **Seguridad Avanzada** - Autenticación JWT, validaciones robustas y transacciones SQL

## 🎖️ Características Únicas

### **🏦 Sistema de Préstamos Avanzado**
- **Cuotas numeradas**: Generación automática con formato "Cuota X/Y - Descripción"
- **Progreso automático**: Seguimiento de cuotas pagadas vs pendientes
- **Flexibilidad total**: Soporte para cualquier cantidad de cuotas (1-360)
- **Frecuencia configurable**: Mensual, bimestral, trimestral, etc.

### **🐷 Ahorros Programados (NUEVO)**
- **Metas mensuales**: Sistema "Mes X/Y" similar a préstamos pero para ahorros
- **Seguimiento acumulado**: Control del monto ya ahorrado vs objetivo
- **Categoría inteligente**: Detección automática cuando se selecciona "Ahorros"
- **Flexibilidad total**: Desde 3 meses hasta 10 años de ahorro programado

### **👥 Sistema Multi-Usuario**
- **Autenticación JWT**: Login seguro con tokens de acceso
- **Roles diferenciados**: Usuario estándar y administrador
- **Panel administrativo**: Gestión de usuarios y configuración global
- **Seguridad por capas**: Protección en frontend y backend

### **🔄 Sistema de Estados Inteligente**
- **Ingresos recurrentes**: Estados PENDIENTE/PAGADO con generación automática
- **Gastos fijos avanzados**: Soporte para préstamos, ahorros y gastos tradicionales
- **Transferencias**: Estados PENDIENTE/COMPLETADA con validaciones
- **Consistencia total**: Transacciones SQL para operaciones críticas

### **💱 Doble Entrada Contable**
- **Transferencias automáticas**: Cada transferencia genera dos movimientos
- **TRANSFERENCIA_SALIDA**: Registro negativo en cuenta origen  
- **TRANSFERENCIA_ENTRADA**: Registro positivo en cuenta destino
- **Saldo acumulado**: Campo calculado automáticamente en movimientos
- **Consistencia garantizada**: Transacciones SQL para atomicidad

### **🇵🇾 Localización Paraguaya**
- **Moneda**: Formateo nativo en **Guaraníes (Gs)**
- **Locale**: Configuración **es-PY** en todo el sistema
- **Sin decimales**: Adaptado a la moneda paraguaya
- **Cuentas cooperativas**: Soporte para tipo "COOPERATIVA" además de bancos

### **📊 Dashboard Inteligente**
- **Cálculos en tiempo real**: Directamente desde base de datos
- **Alertas automáticas**: Al superar el 80% del presupuesto  
- **Filtros dinámicos**: Por mes con recarga automática
- **Categorías top**: Las 5 más costosas con porcentajes
- **Préstamos activos**: Seguimiento de cuotas pendientes
- **Metas de ahorro**: Progreso visual de objetivos *(próximamente)*

## 🚀 Stack Tecnológico

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: NestJS + mysql2/promise + class-validator
- **Base de Datos**: MySQL 8.0 (XAMPP compatible)
- **Monorepo**: pnpm workspaces
- **UI Components**: Sistema de diseño custom
- **Arquitectura**: Full-stack TypeScript

## 📁 Estructura del Proyecto

```
myMoney/
├── apps/
│   ├── web/                    # Frontend React + TypeScript
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/         # Componentes UI reutilizables
│   │   │   │   ├── Layout.tsx  # Layout principal
│   │   │   │   ├── ProtectedRoute.tsx  # 🔒 Protección de rutas
│   │   │   │   └── AdminRoute.tsx      # 🔒 Rutas administrativas
│   │   │   ├── contexts/
│   │   │   │   ├── AuthContext.tsx     # 🔒 Contexto de autenticación
│   │   │   │   └── ThemeContext.tsx    # 🎨 Gestión de temas
│   │   │   ├── pages/          # Páginas de la aplicación
│   │   │   │   ├── Dashboard.tsx      # ✅ Dashboard con métricas reales
│   │   │   │   ├── Login.tsx          # 🔒 Sistema de autenticación
│   │   │   │   ├── Cuentas.tsx        # ✅ Gestión completa de cuentas
│   │   │   │   ├── Ingresos.tsx       # ✅ Control de ingresos recurrentes
│   │   │   │   ├── GastosFijos.tsx    # ✅ Gastos fijos + préstamos + ahorros
│   │   │   │   ├── GastosAdicionales.tsx # ✅ Gastos variables
│   │   │   │   ├── Transferencias.tsx # ✅ Sistema de transferencias
│   │   │   │   ├── Movimientos.tsx    # ✅ Historial de movimientos
│   │   │   │   ├── Tarjetas.tsx       # ✅ Gestión de tarjetas
│   │   │   │   ├── Ahorros.tsx        # 🚧 En construcción (integrado en gastos fijos)
│   │   │   │   └── admin/             # 🔒 Panel administrativo
│   │   │   └── utils/          # Utilidades
│   │   └── package.json
│   └── api/                    # Backend NestJS
│       ├── src/
│       │   ├── core/           # Servicios core
│       │   │   ├── database.service.ts
│       │   │   ├── database.module.ts
│       │   │   ├── env.service.ts
│       │   │   ├── logger.service.ts
│       │   │   ├── error.filter.ts
│       │   │   └── utf8.interceptor.ts
│       │   ├── common/         # DTOs comunes
│       │   │   └── dtos/
│       │   │       ├── filters.dto.ts
│       │   │       └── pagination.dto.ts
│       │   ├── modules/        # Módulos de negocio (12 módulos completos)
│       │   │   ├── auth/            # 🔒 Autenticación JWT
│       │   │   ├── admin/           # 🔒 Gestión administrativa  
│       │   │   ├── cuentas/         # ✅ Gestión de cuentas con cooperativas
│       │   │   ├── ingresos/        # ✅ Control de ingresos recurrentes
│       │   │   ├── gastos-fijos/    # ✅ Gastos fijos + préstamos + ahorros
│       │   │   ├── gastos-adicionales/ # ✅ Gastos variables
│       │   │   ├── transferencias/  # ✅ Transferencias entre cuentas
│       │   │   ├── movimientos/     # ✅ Historial con saldo acumulado
│       │   │   ├── tarjetas/        # ✅ Gestión de tarjetas
│       │   │   ├── consumos-tarjeta/ # ✅ Consumos de tarjetas
│       │   │   ├── categorias-gasto/ # ✅ Gestión de categorías
│       │   │   └── reportes/        # ✅ Reportes y análisis avanzados
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── .env                # Variables de entorno
│       └── package.json
├── db/
│   ├── migrations/             # Sistema de migraciones evolutivo
│   │   ├── 0001_esquema_inicial.sql     # Schema base
│   │   ├── 0002_add_authentication.sql # Sistema de usuarios
│   │   ├── 0003_categorias_iniciales_usuario.sql # Categorías por usuario
│   │   ├── 0003_ingresos_recurrentes.sql # Ingresos recurrentes
│   │   ├── 0004_agregar_tipo_cooperativa.sql # Soporte cooperativas
│   │   ├── 0005_agregar_campos_prestamo.sql # Sistema de préstamos  
│   │   ├── 0006_agregar_saldo_acumulado_movimientos.sql # Saldo acumulado
│   │   ├── 0007_revertir_tabla_ahorros.sql # Limpieza de ahorros
│   │   └── 0008_agregar_campos_ahorro_gastos_fijos.sql # Ahorros integrados
│   ├── migrate.js              # Runner de migraciones
│   ├── run_migration.js        # Ejecutor individual
│   └── generate_hash.js        # Generador de hashes BCrypt
├── my_money.sql               # Respaldo del schema completo
├── pnpm-workspace.yaml       # Configuración workspace
└── package.json              # Configuración raíz
```

## ⚙️ Instalación y Configuración

### 1. Prerrequisitos

- **Node.js** ≥18.0.0
- **pnpm** ≥8.0.0
- **MySQL 8.0** (XAMPP recomendado para desarrollo)

### 2. Clonar e Instalar Dependencias

```bash
git clone <repo-url>
cd myMoney

# Instalar todas las dependencias del workspace
pnpm install
```

### 3. Configurar Base de Datos (XAMPP)

```bash
# 1. Iniciar XAMPP y activar MySQL
# 2. Crear base de datos (phpMyAdmin o CLI)
mysql -u root -p
CREATE DATABASE my_money;
EXIT;

# 3. Configurar variables de entorno
# Archivo: apps/api/.env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=my_money
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1
```

### 4. Ejecutar Migraciones

```bash
# Ejecutar migración inicial (crea todas las tablas)
cd db
node migrate.js up

# Verificar que las tablas se crearon correctamente
# En phpMyAdmin deberías ver:
# - usuarios, cuentas, ingresos
# - gastos_fijos, gastos_adicionales
# - tarjetas, consumos_tarjeta
# - movimientos, categorias_gasto
# - vistas: v_resumen_mes, v_distribucion_gastos
```

### 5. Desarrollo

```bash
# Terminal 1: Backend (puerto 3001)
cd apps/api
pnpm dev

# Terminal 2: Frontend (puerto 3000)
cd apps/web
pnpm dev
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **Base de datos**: phpMyAdmin en http://localhost/phpmyadmin

## 📊 Estado Actual del Proyecto *(V2.0 Completo)*

### **✅ Sistema Base Completado**
- [x] **Base de Datos**: 8 migraciones ejecutadas, esquema robusto con soporte completo
- [x] **Backend NestJS**: 12 módulos funcionales con 60+ endpoints
- [x] **Frontend React**: 9 páginas con routing protegido
- [x] **Autenticación**: Sistema JWT multi-usuario completo

### **✅ Funcionalidades Core Implementadas**
- [x] **CRUD Completo**: Cuentas, Ingresos, Gastos, Transferencias
- [x] **Estados Dinámicos**: Pagado/Pendiente para todas las transacciones
- [x] **Movimientos**: Historial unificado con saldo acumulado automático
- [x] **Sistema de Roles**: Administrador y usuarios regulares
- [x] **Panel Admin**: Gestión completa de usuarios y roles

### **🏦 Funcionalidades Avanzadas Implementadas**
- [x] **Préstamos Inteligentes**: Numeración automática de cuotas (1/12, 2/12, etc.)
- [x] **Cuentas Cooperativas**: Soporte para diferentes tipos de cuenta
- [x] **Ingresos Recurrentes**: Generación automática mensual
- [x] **Categorías Personalizadas**: Por usuario, con datos iniciales automáticos
- [x] **Reportes Multi-Dimensionales**: Resumen, distribución, saldos, alertas

### **🐷 Sistema de Ahorros (V2.0) - ✅ COMPLETADO**
- [x] **Backend Completo**: Integrado en gastos_fijos con campos especializados
- [x] **Base de Datos**: Migración 0008 ejecutada exitosamente
  - `es_ahorro` BOOLEAN - Identifica registros de ahorro
  - `meses_objetivo` INT - Duración planificada del ahorro
  - `mes_actual` INT - Progreso actual del ahorro
  - `monto_ya_ahorrado` DECIMAL - Acumulado guardado hasta la fecha
- [x] **API Endpoints**: Todos los endpoints de gastos_fijos soportan ahorros
- [x] **Validaciones**: Restricciones de integridad para campos de ahorro
- [ ] **Frontend UI**: En construcción - página placeholder activa
- [ ] **Dashboard Ahorros**: Progreso visual y gráficos (próximamente)

### **🚀 Arquitectura Técnica Sólida**
- [x] **Patrón Repository**: Separación clara entre controladores y servicios
- [x] **DTOs Tipados**: Validación automática con class-validator
- [x] **Guards JWT**: Protección de rutas con roles
- [x] **Interceptores**: Encoding UTF-8 automático
- [x] **Manejo de Errores**: Global error filter
- [x] **Logging**: Sistema centralizado de logs
- [x] **Variables de Entorno**: Configuración flexible

### **📈 Métricas del Sistema V2.0**
- **Líneas de Código**: ~15,000+ líneas TypeScript
- **Endpoints API**: 60+ endpoints documentados
- **Tablas DB**: 12 tablas relacionales
- **Módulos Backend**: 12 módulos especializados
- **Páginas Frontend**: 9 páginas con componentes reutilizables
- **Migraciones**: 8 migraciones evolutivas aplicadas

### **🎯 Próximas Iteraciones Planificadas**
1. **Interface de Ahorros**: Completar UI especializada en GastosFijos.tsx
2. **Reportes Avanzados**: Dashboard gráfico para préstamos y ahorros  
3. **Utilidades de Fecha**: Sistema centralizado de manejo de fechas
4. **Notificaciones**: Alertas automáticas para vencimientos
5. **Exportación**: PDF/Excel de reportes
6. **Backup Automático**: Respaldo programado de datos

---
**🏆 Estado**: *V2.0 Sistema Empresarial Multi-Usuario - Core + Préstamos + Ahorros Completados*
- [x] **Dashboard en tiempo real** con cálculos automáticos desde BD
- [x] **Gestión de movimientos** con saldo acumulado automático
- [x] **Ingresos recurrentes** con generación automática
- [x] **Moneda paraguaya** - Formateo en Guaraníes (Gs) con es-PY
- [x] **TypeScript robusto** - Tipos coherentes entre frontend y backend
- [x] **Validaciones completas** - class-validator en backend, formularios en frontend
- [x] **Sistema de migraciones** evolutivo con 8 migraciones implementadas

### ✅ **Funcionalidades Avanzadas Implementadas**
- [x] **Autenticación JWT**: Login, registro, protección de rutas, roles admin
- [x] **Sistema de Préstamos**: Cuotas numeradas, seguimiento automático, cualquier frecuencia
- [x] **Ahorros Programados**: Metas mensuales, seguimiento acumulado, detección automática
- [x] **Ingresos Recurrentes**: Generación automática, estados PENDIENTE/PAGADO
- [x] **Cuentas Cooperativas**: Soporte para tipo COOPERATIVA además de bancos
- [x] **Saldo Acumulado**: Cálculo automático en movimientos para mejor seguimiento
- [x] **Panel Administrativo**: Gestión de usuarios y configuración del sistema
- [x] **Categorías por Usuario**: Sistema de categorías personalizable por usuario
- [x] **Transferencias Avanzadas**: Estados, validaciones, doble entrada contable
- [x] **Movimientos Unificados**: Historial completo con tipos diferenciados
- [x] **Dashboard Inteligente**: Métricas en tiempo real, alertas, categorías top

### � **En Desarrollo Activo**
- [x] **Backend Ahorros**: ✅ Completado - Integrado en gastos_fijos
- [ ] **Frontend Ahorros**: 🚧 UI mejorada para detección automática de categoría "Ahorros"
- [ ] **Reportes Avanzados**: Gráficos de préstamos y ahorros en progreso
- [ ] **Automatización**: Notificaciones de vencimientos y metas cumplidas

### 🚀 **Próximas Mejoras (Roadmap V3.0)**
- [ ] **PWA capabilities** - Offline, instalable, notificaciones push
- [ ] **Reportes PDF/Excel** - Exportación de estados de cuenta y reportes
- [ ] **Dashboard de Préstamos** - Vista especializada para seguimiento de cuotas
- [ ] **Dashboard de Ahorros** - Vista especializada para metas y progreso
- [ ] **Automatización completa** - Generación automática de gastos recurrentes
- [ ] **Notificaciones** - Alertas de vencimientos, metas cumplidas, límites
- [ ] **Optimizaciones** - Caché, lazy loading, performance mejorada

## 📊 Modelo de Datos Implementado

### **Tablas Principales**
```sql
usuarios               # 🔒 Sistema multi-usuario con roles (admin/user)
cuentas               # 💳 Cuentas bancarias, efectivo, cooperativas
categorias_gasto      # 📂 Categorías personalizables por usuario  
ingresos              # 💰 Ingresos con recurrencia y estados PENDIENTE/PAGADO
gastos_fijos          # 🎯 Gastos recurrentes + préstamos + ahorros programados
    ├── es_prestamo       # 🏦 Flag para préstamos con cuotas numeradas
    ├── total_cuotas      # 📊 Total de cuotas (1-360)
    ├── cuota_actual      # 📈 Cuota actual en progreso
    ├── es_ahorro         # 🐷 Flag para ahorros programados
    ├── meses_objetivo    # 🎯 Meses para cumplir meta de ahorro
    ├── mes_actual        # 📅 Mes actual de ahorro
    └── monto_ya_ahorrado # 💰 Monto acumulado antes del sistema
gastos_adicionales    # 💎 Gastos variables con categorización
transferencias        # 🔄 Transferencias entre cuentas con estados
tarjetas              # 💳 Tarjetas de crédito/débito
consumos_tarjeta      # 🛒 Consumos realizados con tarjetas
movimientos           # 📋 Historial unificado con saldo acumulado automático
    └── saldo_acumulado   # 💹 Campo calculado automáticamente
```

### **Funcionalidades por Tabla**
```sql
-- Sistema de Préstamos en gastos_fijos
Cuotas automáticas    # "Préstamo Personal - Cuota 3/12"
Seguimiento progreso  # Cuotas pagadas vs pendientes  
Frecuencia flexible   # Mensual, bimestral, etc.

-- Sistema de Ahorros en gastos_fijos  
Metas mensuales      # "Ahorro Vacaciones - Mes 6/12"
Seguimiento acumulado # Monto ya ahorrado + mensualidades
Detección automática  # Al seleccionar categoría "Ahorros"

-- Ingresos Recurrentes
Generación automática # Crea ingresos futuros automáticamente
Estados inteligentes  # Solo suma al saldo cuando está PAGADO
Frecuencia configurable # Mensual, quincenal, semanal

-- Movimientos con Saldo Acumulado
Doble entrada contable # Transferencias generan 2 movimientos
Saldo automático      # Calculado en cada inserción
Historial completo    # INGRESO, GASTO, TRANSFERENCIA_ENTRADA, TRANSFERENCIA_SALIDA
```

### **Vistas de Análisis**
```sql
v_resumen_mes         # Totales consolidados por mes
v_distribucion_gastos # Gastos agrupados por categoría  
v_prestamos_activos   # Vista de préstamos en progreso
v_ahorros_progreso    # Vista de metas de ahorro (próximamente)
```

## 🔧 Scripts Disponibles

### **Desarrollo**
```bash
# Backend (API)
cd apps/api && pnpm dev          # Puerto 3001

# Frontend (Web)
cd apps/web && pnpm dev          # Puerto 3000

# Migraciones
cd db && node migrate.js up      # Ejecutar migraciones
cd db && node migrate.js down    # Revertir última migración
cd db && node migrate.js status  # Ver estado
```

### **Producción**
```bash
# Construir ambos proyectos
cd apps/api && pnpm build
cd apps/web && pnpm build

# Ejecutar en producción
cd apps/api && pnpm start:prod
cd apps/web && pnpm preview
```

## 🎨 Características del Frontend

### **Dashboard Inteligente**
- **Cálculos en tiempo real** desde base de datos (no simulados)
- **Alertas inteligentes** cuando se excede el 80% del presupuesto
- **Progreso visual** del gasto mensual con barras de progreso
- **Top 5 categorías** más costosas con porcentajes
- **Movimientos recientes** de los últimos 7 días
- **Filtros por mes** con actualización automática
- **Formateo en Guaraníes** con localización paraguaya

### **Gestión Completa con Estados**
- **Cuentas**: CRUD completo con cálculos automáticos de saldo
- **Ingresos**: Estados PENDIENTE/PAGADO con impacto en movimientos
- **Gastos Fijos**: Estados que controlan cuándo se deducen de saldos
- **Gastos Adicionales**: Categorización y análisis completo
- **Transferencias**: Sistema completo con estados PENDIENTE/COMPLETADA
- **Movimientos**: Historial unificado con tipos diferenciados

### **Componentes UI**
- Sistema de diseño consistente
- Responsive design (móvil + desktop)
- Modales y formularios validados
- Tablas con filtros y ordenamiento
- Estados visuales claros (éxito, alerta, error)

## 🌐 API Endpoints Implementados

### **✅ Totalmente Funcionales (60+ endpoints)**
```bash
# 🔒 Autenticación y Usuarios
POST   /api/v1/auth/login
POST   /api/v1/auth/register  
GET    /api/v1/auth/profile
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

# 🔒 Panel Administrativo
GET    /api/v1/admin/usuarios
POST   /api/v1/admin/usuarios
PUT    /api/v1/admin/usuarios/:id
DELETE /api/v1/admin/usuarios/:id
PATCH  /api/v1/admin/usuarios/:id/toggle-admin

# Cuentas - CRUD Completo + Cooperativas
GET    /api/v1/cuentas?usuarioId=1
POST   /api/v1/cuentas                    # Soporta tipo COOPERATIVA
PUT    /api/v1/cuentas/:id
DELETE /api/v1/cuentas/:id

# Ingresos - Con Recurrencia Automática
GET    /api/v1/ingresos?usuarioId=1&mes=YYYY-MM
POST   /api/v1/ingresos                   # Genera ingresos recurrentes automáticamente
PUT    /api/v1/ingresos/:id
DELETE /api/v1/ingresos/:id
DELETE /api/v1/ingresos/:id/recurrentes   # Elimina toda la serie recurrente
PATCH  /api/v1/ingresos/:id/marcar-pagado
PATCH  /api/v1/ingresos/:id/marcar-pendiente

# 🏦 Gastos Fijos - Préstamos + Ahorros + Estados
GET    /api/v1/gastos-fijos?usuarioId=1
POST   /api/v1/gastos-fijos               # Soporta préstamos y ahorros
    # Para préstamos: es_prestamo=true, total_cuotas, cuota_actual
    # Para ahorros: es_ahorro=true, meses_objetivo, mes_actual, monto_ya_ahorrado
PUT    /api/v1/gastos-fijos/:id
DELETE /api/v1/gastos-fijos/:id
DELETE /api/v1/gastos-fijos/:id/recurrentes  # Elimina serie completa
PUT    /api/v1/gastos-fijos/:id/pagar      # Marca como pagado (con fecha opcional)
PATCH  /api/v1/gastos-fijos/:id/marcar-pagado
PATCH  /api/v1/gastos-fijos/:id/marcar-pendiente

# Gastos Adicionales - Completo
GET    /api/v1/gastos-adicionales?usuarioId=1&mes=YYYY-MM
POST   /api/v1/gastos-adicionales
PUT    /api/v1/gastos-adicionales/:id
DELETE /api/v1/gastos-adicionales/:id

# Transferencias - Estados Avanzados  
GET    /api/v1/transferencias?usuarioId=1
POST   /api/v1/transferencias             # Crea con estado PENDIENTE
PUT    /api/v1/transferencias/:id
DELETE /api/v1/transferencias/:id
PATCH  /api/v1/transferencias/:id/completar     # Ejecuta la transferencia
PATCH  /api/v1/transferencias/:id/marcar-pendiente

# Movimientos - Historial con Saldo Acumulado
GET    /api/v1/movimientos?usuarioId=1&cuentaId=X&tipo=INGRESO
POST   /api/v1/movimientos/transferir     # Crea doble entrada automática

# Tarjetas y Consumos
GET    /api/v1/tarjetas?usuarioId=1
POST   /api/v1/tarjetas
PUT    /api/v1/tarjetas/:id
DELETE /api/v1/tarjetas/:id
GET    /api/v1/consumos-tarjeta?usuarioId=1&tarjetaId=X
POST   /api/v1/consumos-tarjeta
PUT    /api/v1/consumos-tarjeta/:id
DELETE /api/v1/consumos-tarjeta/:id

# 📂 Categorías por Usuario
GET    /api/v1/categorias-gasto?usuarioId=1
POST   /api/v1/categorias-gasto           # Crea categoría personal
PUT    /api/v1/categorias-gasto/:id
DELETE /api/v1/categorias-gasto/:id

# 📊 Reportes y Análisis Avanzados
GET    /api/v1/reportes/resumen?usuarioId=1&mes=YYYY-MM
GET    /api/v1/reportes/distribucion?usuarioId=1&mes=YYYY-MM
GET    /api/v1/reportes/cuentas?usuarioId=1         # Saldos por cuenta
GET    /api/v1/reportes/alertas?usuarioId=1         # Alertas y notificaciones
GET    /api/v1/reportes/prestamos?usuarioId=1       # 🏦 Préstamos activos
GET    /api/v1/reportes/ahorros?usuarioId=1         # 🐷 Progreso de ahorros (próximamente)
```

Documentación completa: [API_ENDPOINTS.md](./API_ENDPOINTS.md)

## 🐛 Troubleshooting

### **Error de Conexión MySQL**
```bash
# Verificar que XAMPP MySQL esté ejecutándose
# En Panel de Control XAMPP: Start MySQL

# Verificar configuración
cat apps/api/.env

# Probar conexión
mysql -u root -p -h localhost
USE my_money;
SHOW TABLES;
```

### **Error de Compilación Backend**
```bash
# Limpiar y reinstalar
cd apps/api
rm -rf node_modules
pnpm install

# Verificar TypeScript
pnpm run build
```

### **Error de Compilación Frontend**
```bash
# Limpiar y reinstalar
cd apps/web  
rm -rf node_modules
pnpm install

# Verificar Vite
pnpm run build
```

### **Puerto en Uso**
```bash
# Verificar puertos ocupados
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001

# Cambiar puerto en apps/api/.env si es necesario
PORT=3002
```

## 📈 Roadmap

### **✅ Fase 1 - Sistema Base (COMPLETADO)**
- [x] APIs REST completas para todos los módulos (8 módulos, 45+ endpoints)
- [x] Frontend integrado con backend (sin datos simulados)
- [x] Sistema de validaciones robusto (class-validator + formularios)
- [x] Estados para ingresos/gastos (PENDIENTE/PAGADO)
- [x] Sistema de transferencias completo
- [x] Dashboard con métricas en tiempo real
- [x] Formateo en moneda paraguaya (Guaraníes)

### **🚀 Fase 2 - Mejoras de Usuario (Próximo)**
- [ ] **Autenticación multi-usuario** - Login, registro, sesiones
- [ ] **Import/Export** - CSV, JSON, Excel para migración de datos
- [ ] **Automatización** - Gastos fijos e ingresos recurrentes automáticos
- [ ] **Alertas avanzadas** - Notificaciones por email/push
- [ ] **Backup automático** - Respaldos programados de BD

### **🎯 Fase 3 - PWA y Móvil (Futuro)**
- [ ] **PWA capabilities** - Offline, instalable, notificaciones push
- [ ] **Optimizaciones móviles** - Gestos, UX móvil mejorada
- [ ] **Modo oscuro** - Tema oscuro completo
- [ ] **Sync multi-dispositivo** - Sincronización entre dispositivos

### **📊 Fase 4 - Analytics Avanzados (Futuro)**
- [ ] **Gráficos avanzados** - Chart.js/Recharts, tendencias
- [ ] **Machine Learning** - Predicciones de gastos, categorización automática
- [ ] **Reportes PDF** - Exportación de reportes profesionales
- [ ] **Comparativas** - Análisis mes a mes, año a año

## 🔒 Seguridad

- **Prepared statements** con mysql2 (previene SQL injection)
- **Validación robusta** con class-validator
- **Pool de conexiones** limitado y configurado
- **Transacciones** para operaciones complejas
- **Sanitización** automática de inputs
- **CORS** configurado correctamente

## � PWA Features (Planeadas)

- Instalable como app nativa
- Funcionalidad offline básica
- Responsive design optimizado
- Fast loading con Vite
- App-like experience

## 👤 Información del Proyecto

**Desarrollador**: Fernando Maldonado  
**Objetivo**: ✅ COMPLETADO - Sistema completo reemplaza planilla Excel  
**Estado**: **Sistema 100% funcional** - Frontend y Backend integrados  
**Última actualización**: 28 de Octubre 2025

### 📊 **Estadísticas del Proyecto**
- **8 módulos backend** completamente implementados
- **45+ endpoints REST** funcionales y documentados  
- **7 páginas frontend** con integración completa
- **Sistema de estados** para control de flujo financiero
- **0 datos simulados** - Todo conectado a MySQL
- **100% TypeScript** - Type safety completo
- **Moneda paraguaya** - Formateo nativo en Guaraníes
- **10 tablas MySQL** con relaciones y constraints
- **Doble entrada contable** para transferencias
- **Transacciones SQL** para operaciones críticas

### 🏆 **Logros Técnicos**  
✅ **Sistema completo funcional** - Reemplaza completamente Excel  
✅ **Arquitectura escalable** - Monorepo con workspaces  
✅ **Code quality** - TypeScript estricto, validaciones robustas  
✅ **UX optimizada** - Responsive, intuitiva, rápida  
✅ **Seguridad** - SQL injection protegido, validaciones dobles  

## 📄 Licencia

Proyecto personal - Uso privado
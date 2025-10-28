# 💰 MyMoney - Personal Finance Management System

<div align="center">

![MyMoney Banner](https://via.placeholder.com/800x200/4F46E5/FFFFFF?text=MyMoney+-+Gestiona+tus+Finanzas+Inteligentemente)

**PWA completa para gestión de finanzas personales con control de ingresos, gastos fijos/adicionales, tarjetas y cuentas, totales y saldo restante.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

[🚀 Demo](#) • [📖 Docs](./API_ENDPOINTS.md) • [🐛 Issues](#) • [📋 Roadmap](./ROADMAP.md)

</div>

## 🌟 Características Principales

- 💳 **Gestión de Cuentas** - Control total de cuentas bancarias, efectivo e inversiones
- 📊 **Seguimiento de Gastos** - Categorización inteligente y análisis de patrones
- 💰 **Control de Ingresos** - Registro con estados PENDIENTE/PAGADO y gestión automática de saldos
- 🎯 **Gastos Fijos** - Control de estados, vencimientos y gestión automática de movimientos
- 💎 **Gastos Adicionales** - Gestión completa de gastos variables con categorización
- � **Transferencias** - Sistema completo entre cuentas con estados PENDIENTE/COMPLETADA
- 📈 **Dashboard Inteligente** - Métricas en tiempo real con cálculos automáticos
- 🌍 **Moneda Paraguaya** - Formateo en Guaraníes (Gs) con localización es-PY
- 🔒 **Seguridad** - Validaciones robustas y transacciones SQL seguras

## 🎖️ Características Únicas

### **🔄 Sistema de Estados Inteligente**
- **Ingresos**: Solo se suman al saldo cuando están **PAGADOS**
- **Gastos Fijos**: Solo se deducen cuando están **PAGADOS** 
- **Transferencias**: Estados **PENDIENTE/COMPLETADA** con validaciones

### **💱 Doble Entrada Contable**
- **Transferencias automáticas**: Cada transferencia genera dos movimientos
- **TRANSFERENCIA_SALIDA**: Registro negativo en cuenta origen
- **TRANSFERENCIA_ENTRADA**: Registro positivo en cuenta destino
- **Consistencia garantizada**: Transacciones SQL para atomicidad

### **🇵🇾 Localización Paraguaya**
- **Moneda**: Formateo nativo en **Guaraníes (Gs)**
- **Locale**: Configuración **es-PY** en todo el sistema
- **Sin decimales**: Adaptado a la moneda paraguaya

### **📊 Dashboard Inteligente**
- **Cálculos en tiempo real**: Directamente desde base de datos
- **Alertas automáticas**: Al superar el 80% del presupuesto
- **Filtros dinámicos**: Por mes con recarga automática
- **Categorías top**: Las 5 más costosas con porcentajes

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
│   │   │   │   └── Layout.tsx  # Layout principal
│   │   │   ├── pages/          # Páginas de la aplicación
│   │   │   │   ├── Dashboard.tsx      # ✅ Dashboard con métricas reales
│   │   │   │   ├── Cuentas.tsx        # ✅ Gestión completa de cuentas
│   │   │   │   ├── Ingresos.tsx       # ✅ Control de ingresos con estados
│   │   │   │   ├── GastosFijos.tsx    # ✅ Gastos fijos con estados
│   │   │   │   ├── GastosAdicionales.tsx # ✅ Gastos variables
│   │   │   │   ├── Transferencias.tsx # ✅ Sistema de transferencias
│   │   │   │   └── Movimientos.tsx    # ✅ Historial de movimientos
│   │   │   └── utils/          # Utilidades
│   │   └── package.json
│   └── api/                    # Backend NestJS
│       ├── src/
│       │   ├── core/           # Servicios core
│       │   │   ├── database.service.ts
│       │   │   ├── database.module.ts
│       │   │   └── env.service.ts
│       │   ├── modules/        # Módulos de negocio (8 módulos completos)
│       │   │   ├── cuentas/         # ✅ Gestión de cuentas
│       │   │   ├── ingresos/        # ✅ Control de ingresos
│       │   │   ├── gastos-fijos/    # ✅ Gastos fijos recurrentes
│       │   │   ├── gastos-adicionales/ # ✅ Gastos variables
│       │   │   ├── transferencias/  # ✅ Transferencias entre cuentas
│       │   │   ├── movimientos/     # ✅ Historial de movimientos
│       │   │   ├── tarjetas/        # ✅ Gestión de tarjetas
│       │   │   └── reportes/        # ✅ Reportes y análisis
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── .env                # Variables de entorno
│       └── package.json
├── db/
│   ├── migrations/
│   │   └── 0001_esquema_inicial.sql  # Schema completo
│   └── migrate.js              # Runner de migraciones
├── my_money.sql               # Respaldo del schema
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

## 🎯 Estado Actual del Proyecto

### ✅ **Sistema Completo y Funcional (COMPLETADO)**
- [x] **8 módulos backend** implementados con CRUD completo y 45+ endpoints
- [x] **Frontend integrado** con backend - sin datos simulados
- [x] **Sistema de estados** PENDIENTE/PAGADO para ingresos y gastos fijos
- [x] **Transferencias completas** con estados PENDIENTE/COMPLETADA
- [x] **Dashboard en tiempo real** con cálculos automáticos desde BD
- [x] **Gestión de movimientos** con tipos diferenciados y historial
- [x] **Moneda paraguaya** - Formateo en Guaraníes (Gs) con es-PY
- [x] **TypeScript robusto** - Tipos coherentes entre frontend y backend
- [x] **Validaciones completas** - class-validator en backend, formularios en frontend

### ✅ **Funcionalidades Core Implementadas**
- [x] **Cuentas**: CRUD completo con cálculos de saldo automáticos
- [x] **Ingresos**: Control de estados con impacto automático en movimientos
- [x] **Gastos Fijos**: Estados PENDIENTE/PAGADO con gestión de movimientos
- [x] **Gastos Adicionales**: Sistema completo con categorización
- [x] **Transferencias**: Flujo completo entre cuentas con doble entrada contable
- [x] **Movimientos**: Historial unificado con tipos diferenciados
- [x] **Dashboard**: Métricas calculadas en tiempo real desde base de datos

### 🚀 **Próximas Mejoras (Planificadas)**
- [ ] **Autenticación de usuarios** - Sistema multi-usuario
- [ ] **PWA capabilities** - Offline, instalable, notificaciones
- [ ] **Reportes avanzados** - Gráficos, exportación PDF/Excel
- [ ] **Automatización** - Ingresos/gastos recurrentes automáticos
- [ ] **Optimizaciones** - Caché, lazy loading, performance

## 📊 Modelo de Datos Implementado

### **Tablas Principales**
```sql
usuarios                # Usuarios del sistema
cuentas                # Cuentas bancarias, efectivo, etc.
categorias_gasto       # Categorías para organizar gastos
ingresos              # Ingresos con estados PENDIENTE/PAGADO
gastos_fijos          # Gastos recurrentes con estados
gastos_adicionales    # Gastos variables
transferencias        # ✅ NUEVO: Transferencias entre cuentas
tarjetas              # Tarjetas de crédito/débito
consumos_tarjeta      # Consumos realizados con tarjetas
movimientos           # Historial unificado de movimientos
```

### **Vistas de Análisis**
```sql
v_resumen_mes         # Totales consolidados por mes
v_distribucion_gastos # Gastos agrupados por categoría
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

### **✅ Totalmente Funcionales (45+ endpoints)**
```bash
# Cuentas - CRUD Completo
GET    /api/v1/cuentas?usuarioId=1
POST   /api/v1/cuentas
PUT    /api/v1/cuentas/:id
DELETE /api/v1/cuentas/:id

# Ingresos - Con Estados
GET    /api/v1/ingresos?usuarioId=1&mes=YYYY-MM
POST   /api/v1/ingresos
PUT    /api/v1/ingresos/:id
DELETE /api/v1/ingresos/:id
PATCH  /api/v1/ingresos/:id/marcar-pagado
PATCH  /api/v1/ingresos/:id/marcar-pendiente

# Gastos Fijos - Con Estados  
GET    /api/v1/gastos-fijos?usuarioId=1
POST   /api/v1/gastos-fijos
PUT    /api/v1/gastos-fijos/:id
DELETE /api/v1/gastos-fijos/:id
PATCH  /api/v1/gastos-fijos/:id/marcar-pagado
PATCH  /api/v1/gastos-fijos/:id/marcar-pendiente

# Gastos Adicionales - Completo
GET    /api/v1/gastos-adicionales?usuarioId=1&mes=YYYY-MM
POST   /api/v1/gastos-adicionales
PUT    /api/v1/gastos-adicionales/:id
DELETE /api/v1/gastos-adicionales/:id

# ✅ NUEVO: Transferencias
GET    /api/v1/transferencias?usuarioId=1
POST   /api/v1/transferencias
PUT    /api/v1/transferencias/:id
DELETE /api/v1/transferencias/:id
PATCH  /api/v1/transferencias/:id/completar
PATCH  /api/v1/transferencias/:id/marcar-pendiente

# Movimientos - Historial Unificado
GET    /api/v1/movimientos?usuarioId=1&cuentaId=X&tipo=INGRESO
POST   /api/v1/movimientos/transferir

# Tarjetas y Consumos
GET    /api/v1/tarjetas?usuarioId=1
POST   /api/v1/tarjetas
GET    /api/v1/consumos-tarjeta?usuarioId=1&tarjetaId=X

# Reportes y Análisis
GET    /api/v1/reportes/resumen?usuarioId=1&mes=YYYY-MM
GET    /api/v1/reportes/distribucion?usuarioId=1&mes=YYYY-MM
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
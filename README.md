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
- 💰 **Control de Ingresos** - Registro y organización de fuentes de ingresos
- 🎯 **Gastos Fijos** - Planificación y gestión de gastos recurrentes con alertas
- 💳 **Tarjetas de Crédito** - Control completo de consumos, límites y cuotas
- 📈 **Reportes Inteligentes** - Dashboard con métricas y análisis financiero
- 🔄 **Transferencias** - Movimientos entre cuentas con historial completo
- 🔒 **Seguridad** - Validaciones robustas y transacciones SQL seguras

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
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── Cuentas.tsx
│   │   │   │   ├── Ingresos.tsx
│   │   │   │   ├── GastosFijos.tsx
│   │   │   │   ├── GastosAdicionales.tsx
│   │   │   │   └── Tarjetas.tsx
│   │   │   └── utils/          # Utilidades
│   │   └── package.json
│   └── api/                    # Backend NestJS
│       ├── src/
│       │   ├── core/           # Servicios core
│       │   │   ├── database.service.ts
│       │   │   ├── database.module.ts
│       │   │   └── env.service.ts
│       │   ├── modules/        # Módulos de negocio
│       │   │   └── cuentas/    # Módulo de cuentas
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

### ✅ **Sprint 1 - Backend API (COMPLETADO)**
- [x] **8 módulos backend** implementados con CRUD completo
- [x] **45+ endpoints REST** funcionales y documentados
- [x] **Sistema de validaciones** robusto con class-validator
- [x] **Transacciones SQL** para operaciones críticas
- [x] **Logging inteligente** para consultas lentas y debugging
- [x] **Backend corriendo** exitosamente en puerto 3001
- [x] **Pool de conexiones MySQL** optimizado y funcional
- [x] **Documentación completa** en [API_ENDPOINTS.md](./API_ENDPOINTS.md)

### ✅ **Milestone 1 - Frontend Completo (COMPLETADO)**
- [x] **Sistema de Componentes UI** - Button, Card, Input, Table, Modal
- [x] **Dashboard Financiero** - Resumen, alertas, top categorías, movimientos
- [x] **Gestión de Cuentas** - CRUD con tipos y saldos calculados
- [x] **Gestión de Ingresos** - Categorización y análisis estadístico
- [x] **Gestión de Gastos Fijos** - Control de vencimientos y alertas
- [x] **Gestión de Gastos Variables** - Filtros y distribución por categorías
- [x] **Gestión de Tarjetas** - Límites, utilización y sistema de cuotas

### 🚧 **Sprint 2 - Frontend-Backend Integration (PRÓXIMO)**
- [ ] Integración completa con APIs reales
- [ ] Reemplazo de datos simulados por llamadas HTTP
- [ ] Sistema de autenticación y manejo de sesiones
- [ ] Manejo de estados global optimizado
- [ ] Validaciones sincronizadas frontend-backend

### � **Sprint 3 - Features Avanzadas (PLANIFICADO)**
- [ ] PWA capabilities (offline, instalable)
- [ ] Gráficos avanzados y visualizaciones
- [ ] Exportación de reportes (PDF/Excel)
- [ ] Notificaciones push inteligentes
- [ ] Import/Export de datos
- [ ] Tests E2E y optimizaciones

## 📊 Modelo de Datos Implementado

### **Tablas Principales**
```sql
usuarios                # Usuarios del sistema
cuentas                # Cuentas bancarias, efectivo, etc.
categorias_gasto       # Categorías para organizar gastos
ingresos              # Ingresos mensuales
gastos_fijos          # Gastos recurrentes mensuales
gastos_adicionales    # Gastos variables
tarjetas              # Tarjetas de crédito/débito
consumos_tarjeta      # Consumos realizados con tarjetas
movimientos           # Transferencias entre cuentas
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
- Resumen financiero en tiempo real
- Alertas cuando se excede el 80% del presupuesto
- Progreso visual del gasto mensual
- Top 5 categorías más costosas
- Movimientos de los últimos 7 días

### **Gestión Completa**
- **Cuentas**: Múltiples tipos con saldos calculados
- **Ingresos**: Categorizados con soporte recurrente
- **Gastos Fijos**: Control de vencimientos y alertas
- **Gastos Variables**: Análisis por categorías
- **Tarjetas**: Límites, utilización y sistema de cuotas

### **Componentes UI**
- Sistema de diseño consistente
- Responsive design (móvil + desktop)
- Modales y formularios validados
- Tablas con filtros y ordenamiento
- Estados visuales claros (éxito, alerta, error)

## 🌐 API Endpoints (Planificados)

### **Implementados**
```
GET  /api/v1/cuentas?usuarioId=1    # Listar cuentas
POST /api/v1/cuentas                # Crear cuenta
```

### **Por Implementar**
```
# Cuentas
PUT    /api/v1/cuentas/:id
DELETE /api/v1/cuentas/:id
GET    /api/v1/cuentas/:id/saldo

# Ingresos
GET    /api/v1/ingresos
POST   /api/v1/ingresos
PUT    /api/v1/ingresos/:id
DELETE /api/v1/ingresos/:id

# Gastos Fijos
GET    /api/v1/gastos-fijos
POST   /api/v1/gastos-fijos
PUT    /api/v1/gastos-fijos/:id
DELETE /api/v1/gastos-fijos/:id

# Gastos Adicionales  
GET    /api/v1/gastos-adicionales
POST   /api/v1/gastos-adicionales
PUT    /api/v1/gastos-adicionales/:id
DELETE /api/v1/gastos-adicionales/:id

# Tarjetas
GET    /api/v1/tarjetas
POST   /api/v1/tarjetas
PUT    /api/v1/tarjetas/:id
DELETE /api/v1/tarjetas/:id

# Consumos
GET    /api/v1/consumos-tarjeta
POST   /api/v1/consumos-tarjeta
PUT    /api/v1/consumos-tarjeta/:id
DELETE /api/v1/consumos-tarjeta/:id

# Reportes
GET    /api/v1/reportes/resumen?mes=YYYY-MM
GET    /api/v1/reportes/distribucion?mes=YYYY-MM
```

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

### **P0 (Crítico - En Curso)**
- [ ] Completar APIs REST para todos los módulos
- [ ] Conectar frontend con backend
- [ ] Sistema de validaciones robusto

### **P1 (Alto)**
- [ ] Autenticación y manejo de usuarios
- [ ] Import/Export (JSON/CSV) 
- [ ] Recurrentes automáticos
- [ ] Sistema de alertas mejorado

### **P2 (Medio)**
- [ ] PWA features (offline, instalable)
- [ ] Optimizaciones de rendimiento
- [ ] Backup automático
- [ ] Modo oscuro

### **P3 (Bajo)**
- [ ] Gráficos avanzados (Chart.js/Recharts)
- [ ] Notificaciones push
- [ ] Sync multi-dispositivo
- [ ] Atajos de teclado

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

**Desarrollador**: Fernando  
**Objetivo**: Reemplazar planilla Excel por PWA completa  
**Estado**: Frontend completo, Backend en desarrollo  
**Última actualización**: Octubre 2025

## 📄 Licencia

Proyecto personal - Uso privado
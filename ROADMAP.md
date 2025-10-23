# 🧭 Roadmap por Sprints — Proyecto *My Money*

> Aplicación PWA para gestión de finanzas personales con control de ingresos, gastos, tarjetas y cuentas.  
> Stack: **NestJS + MySQL + React (Vite + TypeScript)**  
> Configuración de Tailwind manual por el desarrollador (Fernando).

---

## 🏁 **Sprint 1 – Backend APIs completas (2 semanas)** ✅ **COMPLETADO**

### 🎯 Objetivo
Tener **todas las APIs REST funcionales y validadas** con conexión MySQL lista para consumir desde el frontend.

### 🔧 Tareas
- [x] Implementar CRUD completo para:
  - [x] `cuentas` ✅
  - [x] `ingresos` ✅
  - [x] `gastos_fijos` ✅
  - [x] `gastos_adicionales` ✅
  - [x] `tarjetas` ✅
  - [x] `consumos_tarjeta` ✅
  - [x] `movimientos` ✅
- [x] Crear endpoints de reportes:
  - `/api/v1/reportes/resumen?mes=YYYY-MM` ✅
  - `/api/v1/reportes/distribucion?mes=YYYY-MM` ✅
- [x] Añadir validaciones (`class-validator`) ✅
- [x] Integrar **transacciones SQL** en operaciones críticas (pago de tarjeta, transferencias) ✅
- [x] Probar endpoints con Postman / Thunder Client ✅
- [x] Agregar logging básico (errores + consultas lentas) ✅

### ✅ Entregable
- ✅ API lista y funcional.
- ✅ Tablas actualizadas y probadas en MySQL (phpMyAdmin).
- ✅ Backend estable en `http://localhost:3001/api/v1`.

**📊 Módulos implementados:**
- ✅ `CuentasModule` - CRUD completo con cálculo de saldos
- ✅ `IngresosModule` - CRUD con filtros por mes y estado
- ✅ `GastosFijosModule` - CRUD con lógica de vencimientos y alertas
- ✅ `GastosAdicionalesModule` - CRUD con distribución por categorías
- ✅ `TarjetasModule` - CRUD con límites, utilización y pagos
- ✅ `ConsumosTarjetaModule` - CRUD con cuotas y recurrentes
- ✅ `MovimientosModule` - CRUD con transferencias seguras
- ✅ `ReportesModule` - Resúmenes, distribución y alertas inteligentes

**🛠️ Funcionalidades destacadas:**
- Sistema de transacciones para operaciones críticas
- Validación de límites en tarjetas de crédito
- Cálculo automático de saldos de cuentas
- Alertas de vencimientos próximos
- Logging de consultas lentas y errores
- Endpoints de estadísticas y reportes avanzados

---

## ⚙️ **Sprint 2 – Integración Frontend + Backend (2 semanas)**

### 🎯 Objetivo
Conectar el **frontend React** con el **backend NestJS** para lograr un sistema totalmente funcional.

### 🔧 Tareas
- [ ] Crear capa `lib/api.ts` para peticiones fetch tipadas con TypeScript.
- [ ] Integrar vistas principales:
  - [ ] Dashboard → `/reportes/resumen`
  - [ ] Ingresos / Gastos → `/ingresos`, `/gastos-fijos`, `/gastos-adicionales`
  - [ ] Tarjetas → `/tarjetas`, `/consumos-tarjeta`
  - [ ] Cuentas → `/cuentas`, `/movimientos`
- [ ] Implementar estados globales (Zustand o Context API)
- [ ] Feedback visual (cargando, error, éxito)
- [ ] Confirmaciones modales para eliminar o marcar “Pagado”
- [ ] Configurar CORS y variables `.env` unificadas

### ✅ Entregable
- Frontend y backend comunicándose en tiempo real.  
- Datos reales en dashboard y tablas.  
- Flujo completo operativo (alta → edición → check → reporte).

---

## 🔐 **Sprint 3 – Autenticación y Gestión de Usuarios (2 semanas)**

### 🎯 Objetivo
Agregar **control de acceso y multiusuario básico**.

### 🔧 Tareas
- [ ] Completar lógica de tabla `usuarios`
- [ ] Crear módulo `auth` en NestJS:
  - [ ] Registro
  - [ ] Login
  - [ ] JWT + Refresh Tokens
- [ ] Middleware de protección para rutas `/api/v1/*`
- [ ] Guardar sesión en frontend (`localStorage`)
- [ ] Formulario de login/logout en React
- [ ] Validación de permisos (solo ver tus propios datos)

### ✅ Entregable
- Sistema multiusuario funcionando.
- Autenticación segura con JWT.
- Restricción de endpoints y datos por `usuario_id`.

---

## 🔄 **Sprint 4 – Import/Export y Recurrentes (2 semanas)**

### 🎯 Objetivo
Aumentar la productividad y automatización del sistema.

### 🔧 Tareas
- [ ] Implementar:
  - `POST /import`
  - `GET /export` (JSON/CSV)
- [ ] Validación de estructura (dry-run + preview)
- [ ] Exportar mes actual (resumen + detalle)
- [ ] Lógica de **recurrentes automáticos**:
  - [ ] Duplicar ingresos/gastos fijos al inicio de mes
  - [ ] Notificar vencimientos próximos
- [ ] Alertas visuales en dashboard

### ✅ Entregable
- Import/Export 100% funcional.  
- Recurrentes automáticos operativos.  
- Dashboard con alertas inteligentes.

---

## 💡 **Sprint 5 – PWA + UX Final (2 semanas)**

### 🎯 Objetivo
Optimizar la experiencia de usuario y preparar la app para distribución.

### 🔧 Tareas
- [ ] Implementar **PWA features**:
  - [ ] `manifest.json`
  - [ ] `service-worker` (offline básico)
  - [ ] Instalación desde navegador
- [ ] Añadir **modo oscuro** y tema dinámico (configuración Tailwind personalizada)
- [ ] Mejorar rendimiento (lazy load, memo, debounce)
- [ ] Backup automático (dump SQL local)
- [ ] Pulir UI: transiciones, íconos, espaciado y microinteracciones

### ✅ Entregable
- App instalable y funcional offline.  
- UI refinada y fluida.  
- Backups automáticos locales.

---

## 🧱 **Sprint 6 – Testing y Lanzamiento (1 semana)**

### 🎯 Objetivo
Dejar el sistema validado y listo para uso real o demo.

### 🔧 Tareas
- [ ] Pruebas integradas:
  - [ ] Endpoints API (Postman/Newman)
  - [ ] Flujos UI (Cypress o manual)
- [ ] Verificar backup y restauración
- [ ] Revisar migraciones y seeds
- [ ] Compilar producción (`pnpm build`)
- [ ] Deploy local o servidor (Docker opcional)

### ✅ Entregable
- **Versión estable 1.0** de *My Money*.  
- Manual técnico actualizado.  
- Sistema validado, rápido y listo para uso.

---

## 📅 **Timeline General**

| Sprint | Duración | Enfoque Principal |
|:-------|:----------|:------------------|
| 1 | 2 semanas | Backend completo (APIs + validaciones) |
| 2 | 2 semanas | Integración frontend-backend |
| 3 | 2 semanas | Autenticación y control de usuarios |
| 4 | 2 semanas | Import/Export + recurrentes |
| 5 | 2 semanas | PWA + UX final |
| 6 | 1 semana  | Testing + lanzamiento |

🕒 **Duración total estimada:** 11 semanas (~3 meses)

---

## 🧩 Estado Actual

| Módulo | Estado |
|:--------|:--------|
| Monorepo + DB + Migraciones | ✅ Completo |
| Frontend (UI + Dashboard) | ✅ Completo |
| Backend (estructura + conexión) | ✅ Completo |
| APIs REST | ✅ **COMPLETADO - Sprint 1** |
| Integración total | ⏳ Próximo sprint |
| Autenticación y PWA | 🔜 Planificado |

**🎉 ¡Sprint 1 Completado!** 
- ✅ **8 módulos backend** implementados con CRUD completo
- ✅ **Sistema de reportes** con 5 endpoints avanzados  
- ✅ **Transacciones SQL** para operaciones críticas
- ✅ **Validaciones robustas** con class-validator
- ✅ **Logging inteligente** para consultas lentas
- ✅ **45+ endpoints** funcionales y documentados
- ✅ **Backend corriendo** en http://localhost:3001/api/v1

**📋 Documentación Sprint 1:**
- `API_ENDPOINTS.md` - Guía completa de 45+ endpoints  
- Backend compilando sin errores de TypeScript
- Todos los módulos cargando correctamente en NestJS
- Pool de conexiones MySQL funcionando
- Sistema de logging implementado para debugging

**🚀 Próximo Sprint:** Integración Frontend ↔ Backend
- ✅ **Backend compilando** sin errores TS

**📡 APIs Disponibles:**
```
GET/POST/PUT/DELETE /api/v1/cuentas
GET/POST/PUT/DELETE /api/v1/ingresos  
GET/POST/PUT/DELETE /api/v1/gastos-fijos
GET/POST/PUT/DELETE /api/v1/gastos-adicionales
GET/POST/PUT/DELETE /api/v1/tarjetas
GET/POST/PUT/DELETE /api/v1/consumos-tarjeta
GET/POST/PUT/DELETE /api/v1/movimientos
GET /api/v1/reportes/{resumen,distribucion,cuentas,alertas,comparativo}
```

---

**Autor:** Fernando  
**Última actualización:** Octubre 2025  
**Versión del documento:** 1.2  
**Propósito:** Guía operativa de desarrollo ágil del proyecto *My Money*

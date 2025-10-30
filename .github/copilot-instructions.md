# 🤖 Copilot Context — **Git Workflow & Automation** (MyMoney)

## 🧩 Overview
Este contexto define **flujo Git estandarizado + automatizaciones (CI/CD, plantillas y guardrails)** para el monorepo **MyMoney** (React/Vite + NestJS + MySQL, pnpm workspaces). La meta: que **Copilot** genere y mantenga archivos, pipelines y convenciones sin romper módulos ni endpoints ya productivizados. Formato y secciones alineadas al _Copilot Context_ original.

## 🧱 Arquitectura (del repo y apps)
Monorepo con dos apps: **/apps/web** (React + Vite + Tailwind) y **/apps/api** (NestJS). Base de datos **MySQL 8 (XAMPP compatible)**. Estructura de carpetas y páginas/ módulos ya definidas (Dashboard, Cuentas, Ingresos, Gastos Fijos/Adicionales, Transferencias, Movimientos, Tarjetas/Consumos, Admin).

**Endpoints clave existentes (API prefix `/api/v1`)** y módulos implementados: cuentas, ingresos, gastos fijos/adicionales, tarjetas, consumos de tarjeta, movimientos y reportes. Mantener compatibilidad.

## 🧠 Objetivo General
1) **Estandarizar ramas, commits, PRs** y protección de `main`.  
2) **Automatizar** build/test/smoke de DB + versionado SemVer por Conventional Commits.  
3) **Asegurar** que cambios en DB vayan con migraciones numeradas y que cambios en endpoints respeten el contrato actual.  
4) **Conectar** PRs con Sprints/Entregables del Roadmap para trazabilidad.

## ⚙️ Lineamientos Técnicos
- **Stack** (no variar salvo decisión explícita): React + TypeScript + Vite + Tailwind; NestJS + mysql2/promise + class-validator; **pnpm workspaces**; MySQL 8.  
- **API base**: `http://localhost:3001/api/v1` (no romper prefijo).  
- **Dominio**: mantener reglas de negocio (p. ej., doble entrada en transferencias, estados PENDIENTE/PAGADO, transacciones SQL).

## 🧩 Objetivo de Copilot
Cuando generes/edites archivos de Git/CI:
- Respeta **estructura del monorepo**, puertos y `.env`.  
- No inventes tablas: **toda alteración de DB va en `db/migrations`** con numeración `000X_*.sql`.  
- No rompas contratos de endpoints existentes ni vistas de reportes.  
- Referencia tareas a **Sprints** del Roadmap cuando corresponda.

## 🧭 Guideline for Code Generation (Git/CI/Templates)
> Al sugerir o completar archivos de Git:
> - Usa **Conventional Commits** (`feat:`, `fix:`, `chore:`…).  
> - Enforce PR hacia `develop`/`main` con **CI verde + 1 review**.  
> - Crea/actualiza **workflows** en `.github/workflows/`.  
> - Añade **plantillas** en `.github/ISSUE_TEMPLATE/` y `.github/pull_request_template.md`.  
> - Genera `CONTRIBUTING.md`, `CODEOWNERS`, `CHANGELOG.md`.  
> - Mantén scripts `pnpm -w build` y smoke DB (migrate up).

## 🧾 Convenciones de Ramas y Versionado
- Ramas: `main` (estable), `develop` (integración), `feat/*`, `fix/*`, `chore/*`.  
- PRs: de feature → `develop`; release → `main`.  
- **SemVer** autogenerado al merge a `main` según Conv. Commits.  
- Protecciones: **no push directo** a `main`, **revisión mínima** + CI OK.

## 🗂️ Estructura Base que Copilot debe asegurar
```
.github/
  CODEOWNERS
  pull_request_template.md
  ISSUE_TEMPLATE/
    bug_report.md
    feature_request.md
  workflows/
    ci.yml
    release.yml
    preview-web.yml   # opcional (frontend)
CHANGELOG.md
CONTRIBUTING.md
```
Alinear contenido de templates con módulos/páginas/endpoints actualmente presentes.

## 🧪 CI/CD — Workflows que Copilot debe generar

### `ci.yml` (build + smoke DB + health)
- Triggers: `pull_request`, `push` a `develop` y `main`.  
- Steps:
  1) Setup Node 18 + pnpm cache.  
  2) `pnpm install`.  
  3) `pnpm -w build` (API+Web).  
  4) **DB Smoke**: levantar MySQL/servicio y ejecutar migraciones `db/migrate.js up`.  
  5) **API health**: ping `GET /api/v1/reportes/resumen?mes=YYYY-MM` (200 OK).

### `release.yml` (versionado automático)
- Trigger: merge a `main`.  
- Generar tag SemVer + Release notes desde Conventional Commits.

### `preview-web.yml` (opcional)
- Build `apps/web` y subir artifact/Pages para QA previa.  
- Útil en **Sprint 2** (integración Front↔Back).

## 🧩 Plantillas (Copilot: crear/actualizar)

**Pull Request Template** (`.github/pull_request_template.md`)  
Checklist:
- [ ] ¿Afecta endpoints? (listar rutas cambiadas)  
- [ ] ¿Incluye migraciones nuevas/actualizadas? (IDs `000X_*`)  
- [ ] ¿Impacta páginas críticas? (Dashboard, Cuentas, Ingresos, Gastos Fijos/Adicionales, Transferencias, Movimientos, Tarjetas/Consumos, Admin)  
- [ ] ¿Toca reportes/estadísticas? (resumen, distribución, etc.).

**Issue Templates** (`.github/ISSUE_TEMPLATE/`)  
- `bug_report.md`: pasos, entorno, módulo/página afectada.  
- `feature_request.md`: user story, endpoints, métricas Dashboard/Reportes.

**CONTRIBUTING.md**  
Setup local (Node ≥18, pnpm ≥8, MySQL 8, `.env`, puertos), cómo correr `pnpm -w build`, migraciones y estilo de commit.

**CODEOWNERS**  
Asignar owners para `/apps/api` y `/apps/web`.

**CHANGELOG.md**  
Autogestionado por releases.

## 🧷 Guardrails funcionales
- **No romper API prefix** `/api/v1`.  
- **Doble entrada contable** en transferencias (salida/entrada) se mantiene atómica.  
- Estados **PENDIENTE/PAGADO** y transacciones SQL siguen vigentes.  
- No borrar/alterar vistas o endpoints de **Reportes**.

## 🔗 Roadmap & Sprints (trazabilidad)
- Vincular PRs y Issues a Sprints activos (2–6).  
- Entregables de Sprint 2 (Integración) y Sprint 3 (Auth) como criterios de aceptación.

## ✅ Definition of Done (Git/CI)
Un PR está **Done** si:
- CI verde + **smoke DB** (`migrate up`) OK.  
- Plantilla de PR completa.  
- Sin regresiones en endpoints/módulos/páginas críticas.  
- Issue/Historia vinculada a Sprint cuando aplique.

**End of Copilot Context**

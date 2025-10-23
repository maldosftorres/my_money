# 📋 API Endpoints - My Money Backend

> **Base URL**: `http://localhost:3001/api/v1`  
> **Status**: ✅ **Operativo** - Sprint 1 Completado  
> **Fecha**: Octubre 2025

---

## 🏦 **Cuentas** `/cuentas`

| Método | Endpoint | Descripción |
|:-------|:---------|:------------|
| `POST` | `/cuentas` | Crear cuenta nueva |
| `GET` | `/cuentas?usuarioId=1` | Listar cuentas del usuario |
| `GET` | `/cuentas/:id` | Obtener cuenta específica |
| `GET` | `/cuentas/:id/saldo` | Calcular saldo actual |
| `PUT` | `/cuentas/:id` | Actualizar cuenta |
| `DELETE` | `/cuentas/:id` | Eliminar cuenta |

**Ejemplo POST `/cuentas`:**
```json
{
  "usuario_id": 1,
  "nombre": "Cuenta Corriente Banco",
  "tipo": "corriente",
  "saldo_inicial": "1500000.00",
  "activa": true
}
```

---

## 💰 **Ingresos** `/ingresos`

| Método | Endpoint | Descripción |
|:-------|:---------|:------------|
| `POST` | `/ingresos` | Registrar nuevo ingreso |
| `GET` | `/ingresos?usuarioId=1&mes=2025-10` | Listar ingresos (con filtros) |
| `GET` | `/ingresos/total/:usuarioId?mes=2025-10` | Total ingresos del mes |
| `GET` | `/ingresos/:id` | Obtener ingreso específico |
| `PUT` | `/ingresos/:id` | Actualizar ingreso |
| `PUT` | `/ingresos/:id/pagar` | Marcar como pagado |
| `DELETE` | `/ingresos/:id` | Eliminar ingreso |

**Ejemplo POST `/ingresos`:**
```json
{
  "usuario_id": 1,
  "cuenta_id": 1,
  "concepto": "Salario Octubre",
  "monto": "2800000.00",
  "fecha": "2025-10-01",
  "estado": "PAGADO"
}
```

---

## 🔒 **Gastos Fijos** `/gastos-fijos`

| Método | Endpoint | Descripción |
|:-------|:---------|:------------|
| `POST` | `/gastos-fijos` | Crear gasto fijo |
| `GET` | `/gastos-fijos?usuarioId=1&soloActivos=true` | Listar gastos fijos |
| `GET` | `/gastos-fijos/vencimientos/:usuarioId?dias=7` | Próximos vencimientos |
| `GET` | `/gastos-fijos/total/:usuarioId?mes=2025-10` | Total gastos fijos |
| `PUT` | `/gastos-fijos/actualizar-vencidos/:usuarioId` | Actualizar estados vencidos |
| `GET` | `/gastos-fijos/:id` | Obtener gasto específico |
| `PUT` | `/gastos-fijos/:id` | Actualizar gasto |
| `PUT` | `/gastos-fijos/:id/pagar` | Marcar como pagado |
| `DELETE` | `/gastos-fijos/:id` | Eliminar gasto |

**Ejemplo POST `/gastos-fijos`:**
```json
{
  "usuario_id": 1,
  "cuenta_id": 1,
  "categoria_id": 2,
  "concepto": "Arriendo",
  "monto": "800000.00",
  "dia_vencimiento": 5,
  "activo": true
}
```

---

## 🛒 **Gastos Adicionales** `/gastos-adicionales`

| Método | Endpoint | Descripción |
|:-------|:---------|:------------|
| `POST` | `/gastos-adicionales` | Registrar gasto |
| `GET` | `/gastos-adicionales?usuarioId=1&mes=2025-10` | Listar gastos |
| `GET` | `/gastos-adicionales/distribucion/:usuarioId?mes=2025-10` | Distribución por categoría |
| `GET` | `/gastos-adicionales/top5/:usuarioId?mes=2025-10` | Top 5 categorías |
| `GET` | `/gastos-adicionales/estadisticas/:usuarioId/:categoriaId` | Estadísticas categoría |
| `GET` | `/gastos-adicionales/total/:usuarioId?mes=2025-10` | Total gastos mes |
| `GET` | `/gastos-adicionales/:id` | Obtener gasto específico |
| `PUT` | `/gastos-adicionales/:id` | Actualizar gasto |
| `DELETE` | `/gastos-adicionales/:id` | Eliminar gasto |

**Ejemplo POST `/gastos-adicionales`:**
```json
{
  "usuario_id": 1,
  "cuenta_id": 1,
  "categoria_id": 3,
  "concepto": "Supermercado",
  "monto": "150000.00",
  "fecha": "2025-10-15"
}
```

---

## 💳 **Tarjetas** `/tarjetas`

| Método | Endpoint | Descripción |
|:-------|:---------|:------------|
| `POST` | `/tarjetas` | Crear tarjeta |
| `GET` | `/tarjetas?usuarioId=1&soloActivas=true` | Listar tarjetas |
| `GET` | `/tarjetas/vencimientos/:usuarioId?dias=7` | Vencimientos próximos |
| `GET` | `/tarjetas/estadisticas/:usuarioId?meses=6` | Estadísticas de uso |
| `GET` | `/tarjetas/:id` | Obtener tarjeta específica |
| `POST` | `/tarjetas/:id/pagar` | Pagar resumen |
| `PUT` | `/tarjetas/:id` | Actualizar tarjeta |
| `DELETE` | `/tarjetas/:id` | Eliminar tarjeta |

**Ejemplo POST `/tarjetas`:**
```json
{
  "usuario_id": 1,
  "cuenta_id": 1,
  "nombre": "Visa Banco Principal",
  "tipo": "CREDITO",
  "limite": "2000000.00",
  "dia_corte": 15,
  "dia_vencimiento": 5,
  "activa": true
}
```

**Ejemplo POST `/tarjetas/:id/pagar`:**
```json
{
  "monto": "350000.00",
  "fecha_pago": "2025-10-23",
  "concepto": "Pago total tarjeta"
}
```

---

## 🛍️ **Consumos Tarjeta** `/consumos-tarjeta`

| Método | Endpoint | Descripción |
|:-------|:---------|:------------|
| `POST` | `/consumos-tarjeta` | Registrar consumo |
| `GET` | `/consumos-tarjeta?usuarioId=1&tarjetaId=1&mes=2025-10` | Listar consumos |
| `GET` | `/consumos-tarjeta/resumen/:usuarioId?mes=2025-10` | Resumen por tarjeta |
| `GET` | `/consumos-tarjeta/recurrentes/:usuarioId` | Consumos recurrentes |
| `POST` | `/consumos-tarjeta/duplicar-recurrentes/:usuarioId` | Duplicar recurrentes |
| `GET` | `/consumos-tarjeta/total-mes/:tarjetaId` | Total mes actual |
| `GET` | `/consumos-tarjeta/:id` | Obtener consumo específico |
| `PUT` | `/consumos-tarjeta/:id` | Actualizar consumo |
| `DELETE` | `/consumos-tarjeta/:id` | Eliminar consumo |

**Ejemplo POST `/consumos-tarjeta`:**
```json
{
  "tarjeta_id": 1,
  "categoria_id": 4,
  "concepto": "Netflix Mensual",
  "monto": "35000.00",
  "fecha": "2025-10-15",
  "cuotas": 1,
  "es_recurrente": true
}
```

---

## 🔄 **Movimientos** `/movimientos`

| Método | Endpoint | Descripción |
|:-------|:---------|:------------|
| `POST` | `/movimientos` | Crear movimiento |
| `POST` | `/movimientos/transferir` | Transferir entre cuentas |
| `GET` | `/movimientos?usuarioId=1&cuentaId=1&mes=2025-10` | Listar movimientos |
| `GET` | `/movimientos/ultimos/:usuarioId?limite=10` | Últimos movimientos |
| `GET` | `/movimientos/historial/:cuentaId?mes=2025-10` | Historial de cuenta |
| `GET` | `/movimientos/saldo/:cuentaId?mes=2025-10` | Calcular saldo |
| `GET` | `/movimientos/:id` | Obtener movimiento específico |
| `PUT` | `/movimientos/:id` | Actualizar movimiento |
| `DELETE` | `/movimientos/:id` | Eliminar movimiento |

**Ejemplo POST `/movimientos/transferir`:**
```json
{
  "usuario_id": 1,
  "cuenta_origen_id": 1,
  "cuenta_destino_id": 2,
  "monto": "200000.00",
  "concepto": "Transferencia ahorros",
  "fecha": "2025-10-23"
}
```

---

## 📊 **Reportes** `/reportes`

| Método | Endpoint | Descripción |
|:-------|:---------|:------------|
| `GET` | `/reportes/resumen/:usuarioId?mes=2025-10` | Resumen financiero mes |
| `GET` | `/reportes/distribucion/:usuarioId?mes=2025-10` | Distribución gastos |
| `GET` | `/reportes/cuentas/:usuarioId?mes=2025-10` | Resumen de cuentas |
| `GET` | `/reportes/alertas/:usuarioId` | Alertas y notificaciones |
| `GET` | `/reportes/comparativo/:usuarioId?mes=2025-10` | Comparativo meses |

**Respuesta ejemplo `/reportes/resumen/1?mes=2025-10`:**
```json
{
  "mes": "2025-10",
  "total_ingresos": 2800000.00,
  "total_gastos_fijos": 1200000.00,
  "total_gastos_adicionales": 800000.00,
  "total_gastos": 2000000.00,
  "saldo_neto": 800000.00,
  "porcentaje_ahorro": 28.57,
  "alertas": [
    {
      "tipo": "info",
      "mensaje": "¡Excelente! Estás ahorrando 28.6% de tus ingresos"
    }
  ]
}
```

---

## 🧪 **Testing con cURL**

### Crear una cuenta:
```bash
curl -X POST http://localhost:3001/api/v1/cuentas \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "nombre": "Cuenta Principal",
    "tipo": "corriente",
    "saldo_inicial": "1000000.00"
  }'
```

### Obtener resumen del mes:
```bash
curl "http://localhost:3001/api/v1/reportes/resumen/1?mes=2025-10"
```

### Transferir dinero:
```bash
curl -X POST http://localhost:3001/api/v1/movimientos/transferir \
  -H "Content-Type: application/json" \
  -d '{
    "usuario_id": 1,
    "cuenta_origen_id": 1,
    "cuenta_destino_id": 2,
    "monto": "100000.00",
    "concepto": "Transferencia",
    "fecha": "2025-10-23"
  }'
```

---

## ✅ **Status Sprint 1**

**✅ Completado:**
- [x] 8 módulos principales implementados
- [x] 45+ endpoints funcionales
- [x] Validaciones con class-validator
- [x] Transacciones SQL para operaciones críticas
- [x] Logging de consultas lentas
- [x] Sistema de reportes avanzado
- [x] Manejo de errores robusto

**🎯 Listo para Sprint 2:** Integración Frontend + Backend

---

**💡 Notas:**
- Todos los endpoints requieren `usuarioId` para filtrar por usuario
- Los montos se manejan como strings decimales (ej: "1500000.00")
- Las fechas siguen formato ISO (YYYY-MM-DD)
- Respuestas incluyen timestamps automáticos
- Sistema de logs implementado para debugging
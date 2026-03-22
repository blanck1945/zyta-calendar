# BE: Pago después de confirmación del profesional

## Contexto

Cuando el calendario tiene `confirmCaseBeforePayment: true`, el flujo es:

1. Cliente crea la consulta → status `pending`
2. Profesional la revisa desde el dashboard → la confirma
3. **Si el calendario tiene métodos de pago habilitados:** status pasa a `confirmed_pending_payment`
4. Cliente paga desde `/zyta/:id/estado` → backend (webhook o llamada directa) pasa status a `confirmed`
5. **Si no hay pago requerido (coordinar/cash u otros sin gateway):** status pasa directo a `confirmed`

---

## 1. Nuevo status: `confirmed_pending_payment`

Agregar a la enumeración de statuses de appointments:

| Status | Descripción |
|---|---|
| `pending` | Creada, esperando evaluación del profesional |
| `confirmed_pending_payment` | **NUEVO** — Confirmada por el profesional, pendiente de pago del cliente |
| `confirmed` | Confirmada y pagada (o sin pago requerido) |
| `completed` | Realizada |
| `cancelled` | Cancelada |

### Cuándo setearlo

En la acción de confirmar del dashboard (`PUT /appointments/:id` o el endpoint que use el dashboard para confirmar), agregar lógica:

```
si calendar.payments.enabled tiene ["mercadopago"] o ["galiopay"]
  → nuevo status = "confirmed_pending_payment"
sino (coordinar, cash, transfer sin gateway, o payments vacío)
  → nuevo status = "confirmed"
```

> `transfer` puede ir a `confirmed_pending_payment` también si querés esperar comprobante. A definir con el equipo.

---

## 2. Endpoint público de status — respuesta enriquecida

**Ruta actual:** `GET /appointments/public/:appointmentId/status`

**Respuesta actual:**
```json
{ "id": "...", "status": "pending" }
```

**Respuesta requerida (ampliar):**
```json
{
  "id": "abc123",
  "status": "confirmed_pending_payment",
  "clientName": "Juan Pérez",
  "clientEmail": "juan@example.com",
  "startTime": "2026-03-15T14:00:00.000Z",
  "endTime": "2026-03-15T14:30:00.000Z",
  "calendarSlug": "kairo"
}
```

El frontend usa estos datos en la pantalla de pago para construir el `lastBooking` sin depender de localStorage entre sesiones.

> Esta es una ruta pública — no exponer datos sensibles más allá de lo listado arriba.

---

## 3. Notificaciones del dashboard

Con el nuevo status, el dashboard puede distinguir:

| Status | Notificación sugerida |
|---|---|
| `pending` | "Nueva consulta — pendiente de evaluación" |
| `confirmed_pending_payment` | "Consulta confirmada — esperando pago del cliente" |
| `confirmed` | "Consulta confirmada y pagada" |
| `cancelled` | "Consulta cancelada" |

---

## 3b. Emails al cliente (evitar mensaje de “pago recibido” sin cobro)

Si al aprobar la consulta el calendario **sí** cobra (MP / GalioPay / transferencia con comprobante, etc.), el cliente **no** debe recibir el texto de “pago fue recibido” hasta que el pago esté registrado.

- **Incorrecto** para “aprobada, falta pagar”: título o cuerpo tipo *“Confirmada — tu consulta está confirmada y el pago fue recibido”*. Eso corresponde solo a **`confirmed`** cuando el cobro ya está OK.
- **Correcto** cuando el status es `confirmed_pending_payment`:
  - Asunto (ej.): *Tu consulta fue confirmada — completá el pago*
  - Cuerpo: indicar que el profesional aceptó la consulta y que debe **pagar** para reservar el turno.
  - CTA: link a `{BASE_URL_CALENDAR}/zyta/{appointmentId}/estado?calendarSlug={calendarSlug}` (misma URL que en [CAMBIOS-BE-LINK-ESTADO-ZYTA.md](./CAMBIOS-BE-LINK-ESTADO-ZYTA.md)).

Las plantillas de email viven en **zyta-be** (o el servicio que envíe el correo): revisar el trigger que dispara al pasar a “confirmada” y separar plantillas por `confirmed_pending_payment` vs `confirmed`.

### Campos opcionales en `GET /appointments/public/:id/status` (compatibilidad)

Si por datos legacy el `status` llega como `confirmed` pero **aún falta cobrar**, el FE puede mostrar “pagar ahora” si el BE envía **cualquiera** de:

| Campo | Si es `true` / `false` |
|-------|-------------------------|
| `awaitingClientPayment` | `true` → UI pendiente de pago |
| `paymentPending` | `true` → idem |
| `requiresClientPayment` | `true` → idem |
| `paymentReceived` | `false` con `status: "confirmed"` → UI pendiente de pago |

---

## 4. Webhook de pago → marcar como `confirmed`

Cuando el webhook de Mercado Pago o GalioPay confirma el pago:

- Si el appointment tiene status `confirmed_pending_payment` → actualizarlo a `confirmed`
- Para GalioPay: el `referenceId` enviado en la creación del link es el `appointmentId`
- Para Mercado Pago: vincular por `calendarSlug` + rango de tiempo del appointment (o agregar `appointmentId` como metadata en la preferencia — **recomendado**)

### Recomendación para Mercado Pago

En `POST /payments/mercadopago/preference`, recibir y guardar el `appointmentId` para que el webhook pueda asociar el pago. El frontend puede enviarlo como parámetro adicional.

---

## 5. Qué NO debe cancelar el frontend

Si el pago falla y el appointment está en `confirmed_pending_payment`, el frontend **no debe cancelar el appointment** — el profesional ya lo aprobó y el cliente puede reintentar el pago. La lógica de `skipCancellation: true` en `lastBooking` (localStorage transitorio durante el flujo de pago activo) maneja esto en el frontend actual.

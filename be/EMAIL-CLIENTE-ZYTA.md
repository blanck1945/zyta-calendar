# Emails al cliente — Zyta (referencia para zyta-be)

## Problema frecuente

El cliente recibe un correo con el mismo tono que **“ya pagaste”** cuando en realidad el profesional **solo aprobó** la consulta y **falta el pago**.

Ese texto en el front de estado (`/zyta/:id/estado`) solo aplica cuando el appointment está realmente **pagado/registrado** como `confirmed` con cobro OK.

## Regla

| Status del appointment | Mensaje al cliente |
|------------------------|-------------------|
| `confirmed_pending_payment` | Aprobada por el profesional — **debe pagar** (link a pantalla de pago). |
| `confirmed` (cobro OK o sin pago online) | Puede usar mensaje de **confirmación final** / pago recibido según negocio. |
| `pending` | En evaluación — no prometer pago recibido. |

## Ejemplo de copy seguro (pendiente de pago)

**Asunto:** Tu consulta fue confirmada — completá el pago

**Cuerpo (resumen):**

- El profesional aceptó tu consulta.
- Para reservar el turno, completá el pago desde el siguiente enlace.
- [Ver estado y pagar](`{BASE_URL_CALENDAR}/zyta/{appointmentId}/estado?calendarSlug={calendarSlug}`)

**No usar** en este caso frases como “el pago fue recibido” o “tu pago se procesó correctamente”.

## Implementación

- Ajustar el **workflow de email** en el backend para que el evento “profesional confirmó” dispare **plantilla A** (`confirmed_pending_payment`) o **plantilla B** (`confirmed` sin requerir pago / ya cobrado).
- Asegurar que al confirmar con cobro pendiente el status persistido sea **`confirmed_pending_payment`** (ver [PAGO-POST-CONFIRMACION.md](./PAGO-POST-CONFIRMACION.md)).

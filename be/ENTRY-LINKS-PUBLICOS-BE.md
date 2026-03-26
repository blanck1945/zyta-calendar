# Enlaces de reserva por token — SPA (Zyta-calendar) y contrato BE

Este documento es la **vista calendario**: cómo debe comportarse el front de reservas frente a la API, y cómo encaja la **URL pública** que genera el dashboard (`/{calendarSlug}?entryLinkToken=`).

La **fuente canónica** del backend (rutas, payloads y errores) está en el repo **Zyta-be**:

- [docs/calendar/entry-links-dashboard.md](https://github.com/blanck1945/zyta-be/blob/main/docs/calendar/entry-links-dashboard.md)

---

## 1. URL pública (dashboard → usuario final)

El **Zyta-dashboard** arma enlaces del modo (un solo segmento de ruta; el token va en query para compatibilidad con el router del SPA):

```text
{BASE_CALENDAR_SPA}/{calendarSlug}?entryLinkToken={token}
```

Ejemplo: `https://calendar.zyta.app/mi-estudio?entryLinkToken=abc123...`

| Parte | Rol |
|-------|-----|
| `calendarSlug` (path) | Mismo slug que `GET /calendars/public/:slug` (la ruta `/:idCalendario` del calendario sigue siendo de un segmento). |
| `entryLinkToken` (query) | Token opaco del enlace; **es lo que la API usa** en rutas `/public/e/:token`. |

**Importante:** en la API los endpoints públicos por token usan **solo** el token en paths del estilo `/public/e/:token` (ver §2). El nombre del query param en dashboard y calendario es **`entryLinkToken`** (constante `ENTRY_LINK_TOKEN_QUERY` en ambos repos).

En el SPA, al cargar `/:calendarSlug?entryLinkToken=...`:

1. Leer **`entryLinkToken`** con `useSearchParams` y llamar a `GET /calendars/public/e/:token` (y el resto de endpoints §2 con ese `token`).
2. Opcionalmente validar que el `calendarSlug` del path coincide con el calendario devuelto por el BE.

---

## 2. Endpoints públicos (sin JWT)

Base: misma que el resto de la API (p. ej. `VITE_API_URL`). Sin header `Authorization`.

| Uso | Método | Ruta |
|-----|--------|------|
| Calendario fusionado (form, settings, `entryLink` en respuesta, etc.) | `GET` | `/calendars/public/e/:token` |
| Schedule (UI de horarios) | `GET` | `/calendars/public/e/:token/schedule` |
| Disponibilidad (slots) | `GET` | `/appointments/public/e/:token/availability?startDate=...&endDate=...` |
| Crear reserva | `POST` | `/appointments/public/e/:token` |

**Body de creación:** mismo `CreateAppointmentDto` que `POST /appointments/public/:calendarSlug`.

**Pago:** si tras fusionar reglas el modo exige pago antes de confirmar (`requirePaymentBeforeConfirmation === true`), el BE exige **`amount` numérico > 0**; si falta → **400** (mensaje explícito).

---

## 3. Parte autenticada (solo dashboard / profesional)

Con `Authorization: Bearer <JWT>`:

| Acción | Método | Ruta |
|--------|--------|------|
| Listar enlaces | `GET` | `/calendars/me/:calendarId/entry-links` |
| Inicializar presets si la lista está vacía | `POST` | `/calendars/me/:calendarId/entry-links/bootstrap` |
| Regenerar token (invalida el anterior) | `POST` | `/calendars/me/:calendarId/entry-links/:linkId/regenerate` |

Respuesta típica de listado/bootstrap: objetos con `id`, `label`, `active`, `sortOrder`, `token`, `createdAt`.  
Regenerar: `{ "id", "token" }`.

---

## 4. Convivencia con el slug clásico

| Aspecto | Por `calendarSlug` | Por token `public/e/:token` |
|--------|---------------------|-------------------------------|
| Agenda / schedule | Misma | Misma |
| Reglas | Solo calendario base | Base + override del enlace |
| URL pública | `/…/{slug}` | `/…/{slug}?entryLinkToken=` (SPA) + API solo `token` en `/public/e/:token` |

Podéis seguir ofreciendo el link por slug y enlaces “modo” por token en paralelo.

---

## 5. Errores frecuentes

- **404** en `public/e/...`: token inexistente, enlace desactivado (`active: false`) o token regenerado.
- **400** al crear cita: falta `amount` cuando el modo fusionado exige pago.

---

## 6. Despliegue / migraciones (BE)

Debe existir la migración que crea `calendar_entry_links` y la columna `entryLinkId` en `appointments`. Hasta entonces los endpoints no aplican. Detalle: `docs/MIGRATIONS.md` en Zyta-be.

---

## 7. Referencia de código (BE)

- Entidad: `src/calendars/entities/calendar-entry-link.entity.ts`
- Lógica: `src/calendars/calendars.service.ts`
- Controladores: `src/calendars/calendars.controller.ts`, `src/appointments/appointments.controller.ts`

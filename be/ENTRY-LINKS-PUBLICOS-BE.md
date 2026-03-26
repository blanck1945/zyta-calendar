# Enlaces de reserva por token — SPA (Zyta-calendar) y contrato BE

Este documento es la **vista calendario**: cómo debe comportarse el front de reservas frente a la API, y cómo encaja la **URL pública** que genera el dashboard (`/{calendarSlug}/{token}`).

La **fuente canónica** del backend (rutas, payloads y errores) está en el repo **Zyta-be**:

- [docs/calendar/entry-links-dashboard.md](https://github.com/blanck1945/zyta-be/blob/main/docs/calendar/entry-links-dashboard.md)

---

## 1. URL pública (dashboard → usuario final)

El **Zyta-dashboard** arma enlaces del modo:

```text
{BASE_CALENDAR_SPA}/{calendarSlug}/{token}
```

Ejemplo: `https://calendar.zyta.app/mi-estudio/abc123...`

| Segmento | Rol |
|----------|-----|
| `calendarSlug` | Mismo slug que `GET /calendars/public/:slug` (identificación humana, SEO, coherencia con el link “clásico” por slug). |
| `token` | Token opaco del enlace; **es lo único que la API necesita** para el modo por token. |

**Importante:** en la API **no** existe `/{slug}/{token}` en el path. Los endpoints públicos por token usan **solo** el token en rutas del estilo `/public/e/:token` (ver §2).

En el SPA, al cargar `/:calendarSlug/:token`:

1. Tomar **`token`** de la URL y usarlo en todas las llamadas `.../public/e/:token/...`.
2. Opcionalmente validar que el `calendarSlug` coincide con el calendario devuelto por el BE (el payload público incluye datos del calendario; si el usuario cambió un segmento a mano, conviene redirigir o mostrar error).

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
| URL pública | `/…/{slug}` | `/…/{slug}/{token}` (SPA) + API solo `token` |

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

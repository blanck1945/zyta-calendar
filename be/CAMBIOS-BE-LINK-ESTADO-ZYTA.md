# Cambios BE: link "Estado de tu Zyta" con calendarSlug

> **Docs en repo BE (zyta-be):**
> - Implementación FR: [FR/ESTADO-ZYTA-VOLVER-AL-INICIO-IMPLEMENTACION-FRONT.md](https://github.com/blanck1945/zyta-be/blob/main/FR/ESTADO-ZYTA-VOLVER-AL-INICIO-IMPLEMENTACION-FRONT.md)
> - Contexto + endpoint (sección 6): [FR/CAMBIOS-BE-LINK-ESTADO-ZYTA.md](https://github.com/blanck1945/zyta-be/blob/main/FR/CAMBIOS-BE-LINK-ESTADO-ZYTA.md)

## Objetivo

Que todos los links a la pantalla **Estado de tu Zyta** incluyan el **slug del calendario** en la URL. Así, el botón "Volver al inicio" lleva al usuario al calendario del profesional (`/{calendarSlug}`) y no a la landing de Zyta.

---

## 1. Formato de URL que debe generar el BE

Cualquier link que apunte a la pantalla de estado de una Zyta debe tener esta forma:

```
{BASE_URL_CALENDAR}/zyta/{appointmentId}/estado?calendarSlug={calendarSlug}
```

| Parte | Descripción | Ejemplo |
|-------|-------------|--------|
| `BASE_URL_CALENDAR` | URL base del front de calendario (donde corre esta app) | `https://cal.zyta.com` o la que usen |
| `appointmentId` | ID del appointment/cita | `8bc5adb3-5ae4-4b4e-b05a-b8ff8b73f130` |
| `calendarSlug` | Slug del calendario (mismo que se usa en `/calendars/public/{calendarSlug}`) | `kairo` |

**Ejemplo de URL completa:**

```
https://cal.zyta.com/zyta/8bc5adb3-5ae4-4b4e-b05a-b8ff8b73f130/estado?calendarSlug=kairo
```

---

## 2. Dónde aplicar el cambio

- **Emails** que envíen un link a "Ver estado de mi Zyta" o "Estado de tu Zyta" (ej. después de crear la consulta en evaluación, o recordatorios).
- Cualquier **redirect** del BE que mande al usuario a `/zyta/{id}/estado`.
- **Notificaciones** o links externos que apunten a esa pantalla.

En todos esos casos, el link debe ser la URL de arriba **con** el query param `calendarSlug`.

---

## 3. De dónde sacar `calendarSlug` en el BE

- El **appointment** suele estar asociado a un **calendar** (p. ej. `calendarId`).
- A partir del calendar, usar el campo que en el FE se usa como slug en la ruta del calendario (ej. `slug`, `calendarSlug`, o el identificador que devuelve `GET /calendars/public/:slug`).
- Si el appointment ya devuelve o tiene `calendarSlug` en la respuesta, usar ese valor directamente.

Ejemplo lógico (pseudocódigo):

```
appointment = getAppointment(appointmentId)
calendarSlug = appointment.calendar.slug   // o appointment.calendarSlug, según el modelo
url = "{BASE_URL_CALENDAR}/zyta/{appointmentId}/estado?calendarSlug={calendarSlug}"
```

---

## 4. Query param obligatorio

| Param | Obligatorio | Descripción |
|-------|-------------|-------------|
| `calendarSlug` | **Sí** | Slug del calendario. Sin él, "Volver al inicio" en el FE redirige a la landing de Zyta en lugar del calendario. |

El valor debe ir **codificado** en la URL (URL-encode) si tuviera caracteres especiales.

---

## 5. Resumen para el equipo BE

1. En todos los links a **Estado de tu Zyta** usar:
   - Ruta: `/zyta/{appointmentId}/estado`
   - Query: `?calendarSlug={calendarSlug}`
2. Obtener `calendarSlug` del calendario asociado al appointment (o del appointment si ya lo tiene).
3. Usar la misma `BASE_URL` del front de calendario que ya usen para otros links (ej. case-under-review, payment success).

Con esto, "Volver al inicio" en la pantalla Estado de tu Zyta llevará siempre al calendario correcto (`/{calendarSlug}`).

---

## 6. (Opcional) Endpoint para obtener calendarSlug por appointmentId

Si el usuario entra a Estado de tu Zyta con una URL **sin** `calendarSlug` (ej. link viejo o compartido), el front intenta obtener el slug llamando a:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| **GET** | `/appointments/public/:appointmentId/calendar-slug` | Público | Devuelve el `calendarSlug` del calendario asociado a ese appointment. |

**Respuesta 200:**

```json
{
  "calendarSlug": "kairo"
}
```

- **404:** Appointment no encontrado.

Así "Volver al inicio" puede llevar al calendario aunque el link no traiga `?calendarSlug=`. Si el BE no expone este endpoint, el front redirige a la landing cuando no tiene `calendarSlug` en URL ni en localStorage.

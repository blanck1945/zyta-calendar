# Changelog - Cambios en JSON de Calendarios

Este documento lista los cambios en la estructura JSON de la API de Calendarios para que el Frontend pueda actualizarse.

## Cambio: `scheduling.slotMinutes` - De `number` a `number[]`

### Fecha: 2024-01-XX

### Cambio en el Tipo

**Antes:**

```json
{
  "scheduling": {
    "slotMinutes": 30
  }
}
```

**Después:**

```json
{
  "scheduling": {
    "slotMinutes": [30, 45, 60]
  }
}
```

### Detalles

- **Campo:** `scheduling.slotMinutes`
- **Tipo anterior:** `number`
- **Tipo nuevo:** `number[]` (array de números)
- **Valor mínimo:** Array con al menos 1 elemento
- **Valor máximo:** Array con máximo 10 elementos
- **Rango por elemento:** 5 a 480 minutos

### Endpoints Afectados

#### Request (PUT /calendars/me)

```json
{
  "scheduling": {
    "slotMinutes": [30, 45, 60] // ✅ Ahora es array
  }
}
```

#### Response (GET /calendars/me, GET /calendars/public/:slug)

```json
{
  "scheduling": {
    "slotMinutes": [30, 45, 60] // ✅ Ahora es array
  }
}
```

### Cambios Adicionales en Appointments

#### Request (POST /appointments)

Ahora se puede especificar la duración del turno:

```json
{
  "startTime": "2024-01-15T10:00:00.000Z",
  "duration": 45, // ✅ Nuevo campo opcional
  "clientName": "Juan Pérez",
  "clientEmail": "juan@example.com"
}
```

#### Response (GET /appointments/availability)

Los slots ahora incluyen la duración:

```json
{
  "slots": [
    {
      "startTime": "2024-01-15T09:00:00.000Z",
      "endTime": "2024-01-15T09:30:00.000Z",
      "duration": 30, // ✅ Nuevo campo
      "available": true
    },
    {
      "startTime": "2024-01-15T09:00:00.000Z",
      "endTime": "2024-01-15T09:45:00.000Z",
      "duration": 45, // ✅ Nuevo campo
      "available": true
    }
  ]
}
```

### Acciones Requeridas en Frontend

1. **Actualizar tipos TypeScript:**

   ```typescript
   // Antes
   scheduling: {
     slotMinutes: number;
   }

   // Después
   scheduling: {
     slotMinutes: number[];
   }
   ```

2. **Actualizar formularios de edición:**
   - Cambiar input de número único a array de números
   - Permitir agregar/eliminar duraciones
   - Validar: mínimo 1, máximo 10 duraciones

3. **Actualizar visualización de slots:**
   - Mostrar la duración de cada slot
   - Filtrar/buscar por duración
   - Mostrar todas las duraciones disponibles

4. **Actualizar creación de appointments:**
   - Agregar selector de duración
   - Validar que la duración esté en la lista permitida

5. **Eliminar conversiones temporales:**
   - Remover código que convierte `number` → `[number]`
   - Remover código que convierte `[number]` → `number`

### Compatibilidad

- El backend acepta ambos formatos temporalmente (compatibilidad hacia atrás)
- Los datos existentes se migran automáticamente: `30` → `[30]`
- Se recomienda actualizar el frontend lo antes posible

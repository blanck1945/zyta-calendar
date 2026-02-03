# ZYTA - CALENDAR & SCHEDULER (Core Rules)

## 1. ESENCIA DEL PRODUCTO

- **No es SaaS genérico:** Es profesional y ordenado. Sin sorpresas.
- **Sin Auto-confirmación:** El usuario debe saber que el profesional evalúa antes de cobrar (si está activo).
- **Naming:** Siempre "Zyta", nunca "cita".

## 2. UI TOKENS (CALENDAR)

- **Colores:** - Naranja Base: `#FF6A00` | Soft: `rgba(255,106,0,0.08)`
  - Background: `#0F0F0F` (Dark) | Sheet: `#FFFFFF` (Fondo calendario)
  - Bordes/Muted: `#E5E7EB` / `#9CA3AF`
- **Tipografía:** - Títulos: Inter/Montserrat 700 (Bold).
  - UI/Botones: Inter/Open Sans 600 (SemiBold).

## 3. COMPONENTES CLAVE

- **Valor de Consulta:** Siempre visible. Formato: `$ XX.XXX (30 min - Videollamada)`.
- **Días:** Usar chips/círculos. Seleccionado: Fondo naranja, texto blanco.
- **Horarios (Pills):** 44-48px altura, radius pill completo. Hover naranja suave.
- **Metadata:** Mostrar siempre Zona Horaria (GMT-3) y Duración.

## 4. LÓGICA DE BOTONES (DINÁMICO)

- **Evaluación OFF:** Texto botón -> "Continuar al pago".
- **Evaluación ON:** Texto botón -> "Enviar consulta".
- **Microcopy (Solo Evaluación ON):** "El profesional evalúa antes de confirmar. El pago se realiza solo si se acepta."

## 5. REGLAS DE ORO

- Naranja solo para acciones/acentos.
- No usar verde (evitar confusión con confirmación automática).
- Layout: Sheet blanca con 20px de radius sobre fondo oscuro de la marca.

# ZYTA — FLUJO CLIENTE SEGÚN "REVISIÓN / EVALUACIÓN PREVIA"

Definición funcional del journey cuando el profesional tiene:

- Evaluación previa ON (requiere aprobación antes de pagar)
- Evaluación previa OFF (pago directo)

---

## 0) Config flag (source of truth)

En el perfil del profesional existe un flag:

- `review_before_payment = true/false` (nombre a gusto)

Regla:

- Este flag define el flujo completo del cliente.
- El precio NO cambia por el flag. Solo cambia el momento en que se habilita el pago.

---

## 1) FLUJO A — Evaluación previa ON (con revisión)

### Objetivo

El cliente envía la Zyta -> el profesional evalúa -> recién si confirma se habilita el pago.

### Paso 1 — Calendario

Acciones:

- Cliente elige fecha y horario.

Siempre visible:

- Valor de la consulta (precio fijo del profesional) antes de avanzar.
- Duración, modalidad, timezone.

CTA principal:

- **"Enviar consulta"**

Microcopy obligatorio (solo en ON, antes de avanzar):

- “Este profesional evalúa cada consulta antes de confirmarla. El pago se realiza únicamente si la consulta es aceptada.”

### Paso 2 — Tus datos

Campos mínimos:

- WhatsApp (obligatorio)
- Motivo de la consulta (textarea con placeholder definido)

CTA:

- **"Enviar consulta"** (o el mismo label elegido para consistencia)

Microcopy legal único bajo CTA (siempre):

- “Zyta es una plataforma de agenda y cobros. La consulta es brindada exclusivamente por el profesional.”

### Paso 3 — Confirmación previa al pago (sin pago)

Pantalla (reemplaza “A coordinar”):

- Box: **"Zyta en evaluación"**
- Texto: “El profesional revisará tu consulta antes de confirmarla.”
- Opcional: “Recibirás un email cuando esté lista para pagar.”

Resumen visible:

- Fecha y horario + GMT-3
- Duración
- Zona horaria
- Valor de la consulta

CTA:

- **"Enviar Zyta"** o **"Enviar consulta"** (usar UNO en todo el flujo)

Microcopy debajo:

- “El pago se realizará únicamente si el profesional confirma la consulta.”

Regla:

- NO mostrar pago acá.

### Post envío (cliente)

Estado:

- `PENDING_REVIEW`

Copy:

- Título: “Zyta enviada”
- Sub: “Quedó pendiente de confirmación por el profesional.”
- Texto: “Te avisaremos por email cuando esté confirmada y puedas realizar el pago.”

Bloque “Pago” (informativo):

- “El pago se habilita únicamente si el profesional confirma la consulta. El cobro se realiza a través de Mercado Pago.”
- NO efectivo / NO “abonar en la cita” / NO “a coordinar”.

CTAs:

- Primario: **"Ver estado de mi Zyta"**
- Secundario: “Volver al inicio”

### Pantalla de estado (ruta)

Ruta:

- `/zyta/:id/estado`

Estados:

- En evaluación (PENDING_REVIEW)
- Confirmada — pagar ahora (APPROVED)
- Rechazada (REJECTED)

Acciones:

- En evaluación: informativo (sin CTA de pago)
- Confirmada: CTA **"Pagar ahora"**
- Rechazada: “Volver al inicio” / “Elegir otro horario”

### Transición a pago

Condición:

- Solo si estado pasa a `APPROVED`, habilitar paso de pago (Mercado Pago en MVP).

---

## 2) FLUJO B — Evaluación previa OFF (sin revisión)

### Objetivo

El cliente completa datos y pasa directo a pagar. El pago confirma la Zyta.

### Paso 1 — Calendario

Acciones:

- Cliente elige fecha y horario.

Siempre visible:

- Valor de la consulta antes de avanzar (igual que ON)
- Duración, modalidad, timezone.

CTA principal:

- **"Continuar al pago"**

Regla:

- No mostrar microcopy de evaluación.

### Paso 2 — Tus datos

Campos mínimos:

- WhatsApp (obligatorio)
- Motivo de la consulta (mismo placeholder)

CTA:

- **"Continuar al pago"**

Microcopy legal único (siempre):

- “Zyta es una plataforma de agenda y cobros. La consulta es brindada exclusivamente por el profesional.”

### Paso 3 — Pago

- Mercado Pago (MVP: único medio)
- Al pagar exitosamente:
  - estado final: `CONFIRMED` (o el que usen)
  - mostrar confirmación al cliente

Regla:

- No existe `PENDING_REVIEW`.
- No existe pantalla “Zyta en evaluación”.

---

## 3) Reglas globales (para ambos flujos)

- Mostrar **precio siempre antes de avanzar** (paso calendario).
- “Zyta” siempre (no “cita agendada”).
- En MVP: pagos por **Mercado Pago** (no efectivo / no a coordinar).
- El CTA del calendario y de “Tus datos” debe reflejar el flujo:
  - ON: Enviar consulta
  - OFF: Continuar al pago

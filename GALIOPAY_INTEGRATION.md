# GalioPay — Integración en Zyta Calendar

Este documento describe qué está implementado, qué falta, y exactamente qué hay que hacer en el calendario para que GalioPay funcione de punta a punta.

---

## Estado actual

### ✅ Ya implementado en App.tsx

El flujo de GalioPay en `App.tsx` está **completo**:

```ts
// src/hooks/useCreateGalioPayLink.ts → ya existe
import { useCreateGalioPayLink } from "./hooks/useCreateGalioPayLink";

// En handleConfirmReservation:
} else if (effectiveMethod === "galiopay") {
  const successUrl = `${baseUrl}/payment/success?calendarSlug=${calendarSlug}&method=galiopay&name=...`;
  const failureUrl  = `${baseUrl}/payment/failure?calendarSlug=${calendarSlug}`;

  const data = await createGalioPayLinkMutation.mutateAsync({
    calendarSlug,
    amount:    schedule?.amount ?? 0,
    currency:  schedule?.currency ?? "ARS",
    successUrl,
    failureUrl,
    referenceId: appointment.id,
  });

  localStorage.setItem("lastBooking", JSON.stringify({ ..., paymentMethod: "galiopay" }));
  resetBooking();
  window.location.href = data.checkoutUrl; // ← redirige al checkout de GalioPay
}
```

El hook `useCreateGalioPayLink` llama a:
```
POST {VITE_BACKEND_URL}/payments/galiopay/link?calendar={calendarSlug}
Body: { amount, currency, successUrl, failureUrl, referenceId }
Response: { checkoutUrl }
```

---

## ❌ Lo que falta — KairoStepPayment

El componente `KairoStepPayment.tsx` **no muestra la opción GalioPay** al usuario.

### Problema 1 — `PaymentMethod` no incluye `"galiopay"`

```ts
// src/components/steps/KairoStepPayment.tsx  ← LÍNEA 7
export type PaymentMethod = "cash" | "transfer" | "mercadopago" | "coordinar";
//                                                                            ↑ falta "galiopay"
```

**Fix:**
```ts
export type PaymentMethod = "cash" | "transfer" | "mercadopago" | "coordinar" | "galiopay";
```

---

### Problema 2 — `hasAnyMethod` no detecta GalioPay

```ts
// LÍNEA 114-118  — ACTUAL
const hasAnyMethod =
  isMethodEnabled("mercadopago") ||
  isMethodEnabled("transfer")    ||
  isMethodEnabled("cash")        ||
  isMethodEnabled("coordinar");
```

**Fix:**
```ts
const hasAnyMethod =
  isMethodEnabled("mercadopago") ||
  isMethodEnabled("transfer")    ||
  isMethodEnabled("cash")        ||
  isMethodEnabled("coordinar")   ||
  isMethodEnabled("galiopay");
```

---

### Problema 3 — no hay card visual para GalioPay

Mercado Pago tiene su card. GalioPay no tiene ninguna. Hay que agregar la siguiente card en el flex de métodos de pago (después del bloque de `mercadopago`, antes o después de `transfer`):

```tsx
{/* GalioPay */}
{isMethodEnabled("galiopay") && (
  <Card
    className={`flex flex-col p-5 border-2 flex-1 min-w-[280px] cursor-pointer transition-colors hover:border-indigo-300 ${
      paymentMethod === "galiopay" ? "border-indigo-500" : "border-gray-100"
    }`}
    style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
    onClick={() => onChangePaymentMethod("galiopay")}
  >
    <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold text-white bg-indigo-500 mb-3">
      RECOMENDADO
    </span>
    <h3 className="text-lg font-bold text-gray-900 mb-2">GalioPay</h3>
    <p className="text-sm text-gray-600 flex-1">
      Pagá online de forma segura. Confirmación automática al completar el pago.
    </p>
  </Card>
)}
```

---

### Problema 4 — lógica del botón "Pagar" no incluye GalioPay

```ts
// LÍNEA 121 — ACTUAL
const isRealPayment = paymentMethod === "mercadopago" || paymentMethod === "transfer";
```

**Fix:**
```ts
const isRealPayment =
  paymentMethod === "mercadopago" ||
  paymentMethod === "transfer"    ||
  paymentMethod === "galiopay";
```

---

### Problema 5 — `CalendarPayments` no tiene `galiopay`

```ts
// src/hooks/useCalendarSchedule.ts — LÍNEA 128
export interface CalendarPayments {
  enabled: string[];
  cash?:        { note: string };
  transfer?:    { alias: string; cbu: string; note: string };
  mercadopago?: { link: string; note: string };
  coordinar?:   { note: string };
  noPaymentRequired?: boolean;
}
```

GalioPay no requiere configuración extra por el momento (el backend resuelve todo), pero agregar el tipo es buena práctica:

```ts
export interface CalendarPayments {
  enabled: string[];
  cash?:        { note: string };
  transfer?:    { alias: string; cbu: string; note: string };
  mercadopago?: { link: string; note: string };
  galiopay?:    { note?: string };   // ← agregar
  coordinar?:   { note: string };
  noPaymentRequired?: boolean;
}
```

---

## Resumen de cambios necesarios

| Archivo | Cambio |
|---|---|
| `src/components/steps/KairoStepPayment.tsx` | Agregar `"galiopay"` al type `PaymentMethod` |
| `src/components/steps/KairoStepPayment.tsx` | Agregar `"galiopay"` a `hasAnyMethod` |
| `src/components/steps/KairoStepPayment.tsx` | Agregar card visual de GalioPay en el flex |
| `src/components/steps/KairoStepPayment.tsx` | Agregar `"galiopay"` a `isRealPayment` |
| `src/hooks/useCalendarSchedule.ts` | Agregar `galiopay?` a `CalendarPayments` |

**`App.tsx` y `useCreateGalioPayLink.ts` NO necesitan cambios** — ya están listos.

---

## Flujo completo (para referencia)

```
1. Backend devuelve payments.enabled = ["galiopay", ...]
2. KairoStepPayment muestra la card de GalioPay  ← FALTA
3. Usuario selecciona GalioPay
4. Usuario hace click en "Pagar"
5. App.tsx llama a createGalioPayLinkMutation     ← YA FUNCIONA
6. Backend crea el link en GalioPay API
7. Backend retorna { checkoutUrl }
8. App.tsx hace window.location.href = checkoutUrl
9. Usuario completa el pago en GalioPay
10. GalioPay redirige a /payment/success?method=galiopay
```

---

## Credenciales / env vars necesarias (backend)

Las credenciales son **por usuario** (guardadas en la tabla `integrations`).
El admin del calendario las configura en el dashboard de Zyta.
No hace falta ningún env var adicional en el frontend del calendar.

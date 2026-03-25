# Pagos en el calendar — Alineación con Backend

Documento para alinear el **calendar frontend** (este repo) con la API. **No solo GalioPay:** el profesional puede ofrecer **varios métodos a la vez**; el usuario elige uno en el paso de pago.

Podés copiar secciones a Slack/Notion o enviar el documento tal cual.

---

## 1. Métodos que el frontend puede mostrar

El UI arma las opciones según **`payments.enabled`** y la configuración que venga en el calendario público (alias/CBU para transferencia, notas, etc.).

| Método (`enabled`) | Comportamiento típico en el FE |
|--------------------|--------------------------------|
| `mercadopago` | Redirección a checkout MP vía preferencia creada por el **BE** (`initPoint`). |
| `galiopay` | Redirección a checkout GalioPay vía link creado por el **BE** (`checkoutUrl`). |
| `transfer` | Datos de cuenta en pantalla + comprobante (subida en el FE; el BE puede o no recibirlo según implementación). |
| `cash` | Confirmación sin pasarela; depende de notas/config. |
| `coordinar` | Mismo espíritu que efectivo: coordinación según notas. |

**Importante:** GalioPay **no reemplaza** al resto: convive con Mercado Pago, transferencia, etc. Lo que define qué se muestra es **`payments.enabled`** + datos mínimos por método (ej. `mercadopago`, `transfer`, … en el objeto `payments`).

---

## 2. Integraciones que pasan por el backend (checkout externo)

El frontend **no** habla con Mercado Pago ni GalioPay directamente: solo llama a **nuestro** backend y redirige al usuario.

### 2.1 Mercado Pago

- **Referencia:** `src/hooks/useCreateMercadoPagoPreference.ts`
- **Llamada:** `POST {BACKEND}/payments/mercadopago/preference?calendar={calendarSlug}`
- **Body:** `amount`, `currency`, `successUrl`, `failureUrl`, `pendingUrl`
- **Respuesta esperada:** `initPoint` (URL de redirección), `preferenceId`

### 2.2 GalioPay (solo si está en `enabled`)

- **Referencia:** `src/hooks/useCreateGalioPayLink.ts`
- **Llamada:** `POST {BACKEND}/payments/galiopay/link?calendar={calendarSlug}`
- **Body (JSON):**

| Campo | Tipo | Uso |
|-------|------|-----|
| `amount` | number | Monto |
| `currency` | string | Ej. `ARS` |
| `successUrl` | string | URL absoluta post-pago OK |
| `failureUrl` | string | URL absoluta si falla / cancela |
| `referenceId` | string | ID de reserva (ej. `appointmentId`) para conciliar |

- **Respuesta exitosa:** `{ "checkoutUrl": "..." }` (obligatorio para el FE).
- **Errores:** respuesta no-OK; el FE intenta leer `{ "message": "..." }`.

Si `"galiopay"` **no** está en `payments.enabled`, el frontend **no** muestra la tarjeta GalioPay, aunque el BE tenga el endpoint.

---

## 3. Configuración del calendario (público)

El endpoint público del calendario debe seguir entregando, entre otras cosas:

- `payments.enabled`: array de strings, p. ej. `["mercadopago", "galiopay", "transfer"]`
- Objeto `payments` con los bloques que correspondan (`mercadopago`, `transfer`, `cash`, `coordinar`, etc.)

Así el profesional puede tener **solo transferencia**, **solo MP**, **MP + GalioPay + transferencia**, etc.

---

## 4. Preguntas útiles para el equipo BE (GalioPay y pagos en general)

1. **¿`payments.enabled` puede combinar varios métodos** (p. ej. MP + GalioPay + transfer) sin conflictos de reglas de negocio?
2. **Mercado Pago:** ¿el endpoint de preferencia está alineado con el contrato del FE (`initPoint`, URLs de retorno)?
3. **GalioPay:** ¿`POST /payments/galiopay/link?calendar=...` está implementado y el contrato coincide (body + `checkoutUrl`)?
4. **Credenciales GalioPay / MP:** ¿por calendario, por usuario, integraciones? ¿Error claro si falta configuración?
5. **Conciliación:** ¿se guarda `referenceId` / preferencia contra el `appointment`? ¿Webhooks actualizan el estado de pago?
6. **Transferencia / comprobante:** ¿el BE ya recibe o recibirá el comprobante? (hoy el FE puede adjuntar en UI según flujo.)

---

## 5. Flujo resumido (solo rama GalioPay, para QA)

1. Calendario con `payments.enabled` que **incluya** `"galiopay"` (puede incluir también otros).
2. Usuario elige GalioPay → FE crea appointment → `POST .../galiopay/link` con `referenceId = appointment.id`.
3. Redirección a `checkoutUrl` → retorno a `/payment/success` o `/payment/failure`.

---

## 6. Archivos relevantes en este repo

- `src/components/payment/PaymentMethodPicker.tsx` — tarjetas según `enabled`
- `src/hooks/useCreateMercadoPagoPreference.ts` — MP
- `src/hooks/useCreateGalioPayLink.ts` — GalioPay
- `src/App.tsx` — flujo principal de reserva y redirecciones
- `src/pages/ZytaStatus.tsx` — “pagar ahora” con los mismos métodos

---

*Alineado con el código del calendar frontend.*

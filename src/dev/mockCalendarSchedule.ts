/**
 * Calendario ficticio en desarrollo (`npm run dev`) si no hay `VITE_BACKEND_URL`,
 * o si `VITE_USE_MOCK_CALENDAR=true`. No crea datos en ningún backend.
 */
export function buildMockCalendarSchedule(slug: string) {
  const s = slug.trim() || "local-demo";
  return {
    calendarSlug: s,
    amount: 15000,
    currency: "ARS",
    enabledDays: ["mon", "tue", "wed", "thu", "fri"],
    byDay: {
      mon: [{ start: "09:00", end: "13:00" }],
      tue: [{ start: "09:00", end: "13:00" }],
      wed: [{ start: "09:00", end: "13:00" }],
      thu: [{ start: "09:00", end: "13:00" }],
      fri: [{ start: "09:00", end: "13:00" }],
    },
    slotMinutes: 30,
    bufferMinutes: 0,
    timezone: "America/Argentina/Buenos_Aires",
    calendarTitle: "Zyta local (mock)",
    calendarSubtitle: "Calendario de prueba — sin API",
    theme: "calido",
    links: [
      { name: "Web", value: "https://zyta.app", isPublic: true },
    ],
    dateOverrides: {},
    maxAdvanceBookingMonths: 3,
    payments: {
      enabled: ["mercadopago", "transfer"],
      noPaymentRequired: false,
      cash: { note: "Mock" },
      transfer: { alias: "mock.alias", cbu: "0000000000000000000000", note: "Mock" },
      mercadopago: { link: "https://example.com", note: "Mock" },
    },
    bookingForm: {
      fields: {
        name: { enabled: true, required: true },
        email: { enabled: true, required: true },
        notes: { enabled: true, required: false },
        phone: { enabled: false, required: false },
      },
    },
    bookingSettings: {
      allowCancellation: true,
      requirePaymentBeforeConfirmation: false,
      confirmCaseBeforePayment: false,
      confirmationMaxHours: 24,
      maxAdvanceBookingMonths: 3,
    },
    appointments: [],
    bookingQuota: {
      canBook: true,
      limit: 100,
      used: 0,
      remaining: 100,
    },
  };
}

/** Sin API en .env o mock explícito: evita "Failed to fetch" en local. */
export function isDevMockCalendarEnabled(): boolean {
  if (import.meta.env.DEV !== true) return false;
  const explicit =
    import.meta.env.VITE_USE_MOCK_CALENDAR === "true" ||
    import.meta.env.VITE_USE_MOCK_CALENDAR === "1";
  const noBackendUrl = !import.meta.env.VITE_BACKEND_URL?.trim();
  return explicit || noBackendUrl;
}

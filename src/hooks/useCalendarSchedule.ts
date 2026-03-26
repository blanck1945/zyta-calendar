import { useQuery } from "@tanstack/react-query";
import { useCalendarSlug } from "../utils/useCalendarSlug";
import { useEntryLinkToken } from "../utils/entryLink";
import {
  buildMockCalendarSchedule,
  isDevMockCalendarEnabled,
} from "../dev/mockCalendarSchedule";

const MSG_CALENDAR_NOT_FOUND = "Calendario no encontrado";
const MSG_ENTRY_LINK_NOT_FOUND =
  "Este enlace no es válido o fue desactivado.";
const MSG_SLUG_MISMATCH =
  "La dirección del calendario no coincide con este enlace. Comprobá el enlace o el nombre en la URL.";

function normalizeCalendarSlugSegment(raw: string): string {
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

const SCHEDULE_QUERY_NO_RETRY_MESSAGES = new Set([
  MSG_CALENDAR_NOT_FOUND,
  MSG_ENTRY_LINK_NOT_FOUND,
  MSG_SLUG_MISMATCH,
]);

/**
 * Día de la semana en formato corto (en inglés)
 */
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

/**
 * Rango de horario en formato HH:mm
 */
export interface TimeRange {
  start: string; // Formato: "HH:mm" (ej: "09:00")
  end: string; // Formato: "HH:mm" (ej: "17:00")
}

/**
 * Horarios por día de la semana
 */
export interface DaySchedule {
  mon?: TimeRange[];
  tue?: TimeRange[];
  wed?: TimeRange[];
  thu?: TimeRange[];
  fri?: TimeRange[];
  sat?: TimeRange[];
  sun?: TimeRange[];
}

/**
 * Respuesta del endpoint /calendars/public/:slug (estructura real del backend)
 */
interface CalendarResponse {
  id: string;
  clientId: string;
  calendarSlug: string;
  /** Presente en GET /calendars/public/e/:token (metadatos del enlace fusionado). */
  entryLink?: {
    id?: string;
    label?: string;
    active?: boolean;
    sortOrder?: number;
    token?: string;
    createdAt?: string;
  };
  amount?: number | string;
  currency?: string | null;
  scheduling: {
    timezone: string;
    slotMinutes: number | number[];
    bufferMinutes: number;
  };
  availability: {
    enabledDays: DayOfWeek[];
    byDay: DaySchedule;
    dateOverrides?: {
      [date: string]: {
        disabled?: boolean;
        timeRanges?: TimeRange[];
      };
    };
    maxAdvanceBookingMonths?: number;
  };
  payments: {
    enabled: string[];
    cash: { note: string };
    transfer: { alias: string; cbu: string; note: string };
    mercadopago: { link: string; note: string };
  };
  styles: {
    theme: string;
    calendarTitle: string;
    calendarSubtitle: string;
  };
  links?: Array<{
    name: string;
    value: string;
    isPublic: boolean;
  }>;
  bookingForm?: {
    fields: {
      name?: { enabled: boolean; required: boolean };
      email?: { enabled: boolean; required: boolean };
      notes?: { enabled: boolean; required: boolean };
      phone?: { enabled: boolean; required: boolean };
    };
    customFields?: Array<{
      id: string;
      label: string;
      type: string;
      required: boolean;
      enabled: boolean;
    }>;
  };
  bookingSettings?: {
    allowCancellation: boolean;
    requirePaymentBeforeConfirmation: boolean;
    confirmCaseBeforePayment: boolean;
    confirmationMinHours?: number;
    confirmationMaxHours?: number;
    maxAdvanceBookingMonths?: number;
  };
  appointments?: Array<{
    id: string;
    calendarId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    startTime: string; // ISO 8601
    endTime: string; // ISO 8601
    status: string;
    paymentMethod: string;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
  }>;
  /** Cupo mensual del plan del profesional (GET /calendars/public/:slug) */
  bookingQuota?: {
    canBook: boolean;
    limit: number;
    used: number;
    remaining: number;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Estructura plana del calendario para uso interno
 * Contiene la configuración completa del calendario: días habilitados, horarios,
 * duración de slots, buffer, zona horaria, textos personalizados y tema de colores.
 */
export interface CalendarLink {
  name: string;
  value: string;
  isPublic: boolean;
}

export interface DateOverride {
  disabled?: boolean;
  timeRanges?: TimeRange[];
}

export interface CalendarPayments {
  enabled: string[];
  cash?: { note: string };
  transfer?: { alias: string; cbu: string; note: string };
  mercadopago?: { link: string; note: string };
  galiopay?: { note?: string };
  coordinar?: { note: string };
  noPaymentRequired?: boolean; // Si es true, deshabilita todos los métodos de pago
}

export interface BookingFormField {
  enabled: boolean;
  required: boolean;
}

export interface BookingForm {
  fields: {
    name?: BookingFormField;
    email?: BookingFormField;
    notes?: BookingFormField;
    phone?: BookingFormField;
  };
  customFields?: Array<{
    id: string;
    label: string;
    type: string;
    required: boolean;
    enabled: boolean;
    options?: string[];
  }>;
}

export interface BookingSettings {
  allowCancellation: boolean;
  requirePaymentBeforeConfirmation: boolean;
  confirmCaseBeforePayment: boolean;
  confirmationMinHours?: number;
  confirmationMaxHours?: number;
  maxAdvanceBookingMonths?: number;
}

export interface Appointment {
  id: string;
  calendarId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  status: string;
  paymentMethod: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarSchedule {
  calendarSlug: string;
  amount?: number;
  currency?: string;
  enabledDays: DayOfWeek[];
  byDay: DaySchedule;
  slotMinutes: number | number[];
  bufferMinutes: number;
  timezone: string;
  calendarTitle: string;
  calendarSubtitle: string;
  theme: string; // Tema de colores: "violeta", "calido", "metalico", "verde", "rosa"
  links?: CalendarLink[];
  dateOverrides?: Record<string, DateOverride>;
  maxAdvanceBookingMonths?: number;
  payments?: CalendarPayments;
  bookingForm?: BookingForm;
  bookingSettings?: BookingSettings;
  appointments?: Appointment[];
  bookingQuota?: {
    canBook: boolean;
    limit: number;
    used: number;
    remaining: number;
  };
}

/**
 * Transforma la respuesta anidada del backend a la estructura plana esperada
 */
function transformCalendarResponse(
  response: CalendarResponse
): CalendarSchedule {
  // Normalizar slotMinutes: si viene como number, convertirlo a array
  const slotMinutes = Array.isArray(response.scheduling.slotMinutes)
    ? response.scheduling.slotMinutes
    : [response.scheduling.slotMinutes];

  // Convertir amount a number si viene como string
  const amount = response.amount != null
    ? typeof response.amount === 'string'
      ? parseFloat(response.amount)
      : response.amount
    : undefined;

  return {
    calendarSlug: response.calendarSlug,
    amount: Number.isFinite(amount) ? amount : undefined,
    currency: response.currency ?? undefined,
    enabledDays: response.availability.enabledDays,
    byDay: response.availability.byDay,
    slotMinutes: slotMinutes,
    bufferMinutes: response.scheduling.bufferMinutes,
    timezone: response.scheduling.timezone,
    calendarTitle: response.styles.calendarTitle,
    calendarSubtitle: response.styles.calendarSubtitle,
    theme: response.styles.theme,
    links: response.links?.filter((link) => link.isPublic) || [],
    dateOverrides: response.availability.dateOverrides || {},
    // Meses máximos para agendar: solo bookingSettings.maxAdvanceBookingMonths
    maxAdvanceBookingMonths: (() => {
      const raw = response.bookingSettings?.maxAdvanceBookingMonths;
      const n = Number(raw);
      return Number.isFinite(n) && n >= 1 ? n : 3;
    })(),
    payments: response.payments,
    bookingForm: response.bookingForm,
    bookingSettings: response.bookingSettings,
    appointments: response.appointments || [],
    bookingQuota: response.bookingQuota,
  };
}

interface UseCalendarScheduleResult {
  schedule: CalendarSchedule | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para obtener la configuración del calendario (días y horarios disponibles)
 * desde /calendars/public/:slug o, con ?entryLinkToken=, desde /calendars/public/e/:token
 */
export function useCalendarSchedule(): UseCalendarScheduleResult {
  const calendarSlug = useCalendarSlug();
  const entryLinkToken = useEntryLinkToken();

  const {
    data: schedule,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["calendarSchedule", calendarSlug, entryLinkToken ?? null],
    queryFn: async (): Promise<CalendarSchedule> => {
      if (!calendarSlug) {
        throw new Error("No se especificó el calendario");
      }

      if (isDevMockCalendarEnabled() && !entryLinkToken) {
        return buildMockCalendarSchedule(
          calendarSlug
        ) as CalendarSchedule;
      }

      // Verificar que la URL del backend esté configurada
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";
      if (!backendUrl) {
        throw new Error(
          "Error de configuración: VITE_BACKEND_URL no está definida"
        );
      }

      const scheduleUrl = entryLinkToken
        ? `${backendUrl}/calendars/public/e/${encodeURIComponent(entryLinkToken)}`
        : `${backendUrl}/calendars/public/${encodeURIComponent(calendarSlug)}`;

      console.log("🔍 useCalendarSchedule - Haciendo request:", {
        calendarSlug,
        entryLinkMode: !!entryLinkToken,
        backendUrl,
        scheduleUrl,
      });

      const res = await fetch(scheduleUrl);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error(
            entryLinkToken ? MSG_ENTRY_LINK_NOT_FOUND : MSG_CALENDAR_NOT_FOUND
          );
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            "Error al obtener la configuración del calendario"
        );
      }

      const data: CalendarResponse = await res.json();

      if (entryLinkToken) {
        const pathSlug = normalizeCalendarSlugSegment(calendarSlug);
        const apiSlug = normalizeCalendarSlugSegment(data.calendarSlug);
        if (pathSlug !== apiSlug) {
          throw new Error(MSG_SLUG_MISMATCH);
        }
      }

      // Transformar la respuesta anidada a estructura plana
      return transformCalendarResponse(data);
    },
    enabled: !!calendarSlug,
    retry: (failureCount, error) => {
      if (
        error instanceof Error &&
        SCHEDULE_QUERY_NO_RETRY_MESSAGES.has(error.message)
      ) {
        return false;
      }
      return failureCount < 1;
    },
  });

  return {
    schedule: schedule ?? null,
    loading,
    error: queryError
      ? queryError instanceof Error
        ? queryError.message
        : "Error desconocido"
      : null,
  };
}

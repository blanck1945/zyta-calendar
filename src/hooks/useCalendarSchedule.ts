import { useQuery } from "@tanstack/react-query";
import { useCalendarSlug } from "../utils/useCalendarSlug";

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
  };
}

interface UseCalendarScheduleResult {
  schedule: CalendarSchedule | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para obtener la configuración del calendario (días y horarios disponibles)
 * desde el endpoint /calendars/public/:slug usando react-query
 */
export function useCalendarSchedule(): UseCalendarScheduleResult {
  const calendarSlug = useCalendarSlug();

  const {
    data: schedule,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["calendarSchedule", calendarSlug],
    queryFn: async (): Promise<CalendarSchedule> => {
      if (!calendarSlug) {
        throw new Error("No se especificó el calendario");
      }

      // Verificar que la URL del backend esté configurada
      const backendUrl =
        import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";
      if (!backendUrl) {
        throw new Error(
          "Error de configuración: VITE_BACKEND_URL no está definida"
        );
      }

      const scheduleUrl = `${backendUrl}/calendars/public/${calendarSlug}`;

      console.log("🔍 useCalendarSchedule - Haciendo request:", {
        calendarSlug,
        backendUrl,
        scheduleUrl,
      });

      const res = await fetch(scheduleUrl);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Calendario no encontrado");
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            "Error al obtener la configuración del calendario"
        );
      }

      const data: CalendarResponse = await res.json();
      // Transformar la respuesta anidada a estructura plana
      return transformCalendarResponse(data);
    },
    enabled: !!calendarSlug,
    retry: (failureCount, error) => {
      // No reintentar si es un error 404
      if (
        error instanceof Error &&
        error.message === "Calendario no encontrado"
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

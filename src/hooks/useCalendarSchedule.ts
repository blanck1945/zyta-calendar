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
  end: string;   // Formato: "HH:mm" (ej: "17:00")
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
  scheduling: {
    timezone: string;
    slotMinutes: number;
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
  enabledDays: DayOfWeek[];
  byDay: DaySchedule;
  slotMinutes: number;
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
function transformCalendarResponse(response: CalendarResponse): CalendarSchedule {
  return {
    calendarSlug: response.calendarSlug,
    enabledDays: response.availability.enabledDays,
    byDay: response.availability.byDay,
    slotMinutes: response.scheduling.slotMinutes,
    bufferMinutes: response.scheduling.bufferMinutes,
    timezone: response.scheduling.timezone,
    calendarTitle: response.styles.calendarTitle,
    calendarSubtitle: response.styles.calendarSubtitle,
    theme: response.styles.theme,
    links: response.links?.filter(link => link.isPublic) || [],
    dateOverrides: response.availability.dateOverrides || {},
    maxAdvanceBookingMonths: response.availability.maxAdvanceBookingMonths,
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
      const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";
      if (!backendUrl) {
        throw new Error("Error de configuración: VITE_BACKEND_URL no está definida");
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
          errorData.message || "Error al obtener la configuración del calendario"
        );
      }

      const data: CalendarResponse = await res.json();
      // Transformar la respuesta anidada a estructura plana
      return transformCalendarResponse(data);
    },
    enabled: !!calendarSlug,
    retry: (failureCount, error) => {
      // No reintentar si es un error 404
      if (error instanceof Error && error.message === "Calendario no encontrado") {
        return false;
      }
      return failureCount < 1;
    },
  });

  return {
    schedule: schedule ?? null,
    loading,
    error: queryError ? (queryError instanceof Error ? queryError.message : "Error desconocido") : null,
  };
}


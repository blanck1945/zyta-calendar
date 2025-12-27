import { useState, useEffect } from "react";
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
  createdAt: string;
  updatedAt: string;
}

/**
 * Estructura plana del calendario para uso interno
 * Contiene la configuración completa del calendario: días habilitados, horarios,
 * duración de slots, buffer, zona horaria, textos personalizados y tema de colores.
 */
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
  };
}

interface UseCalendarScheduleResult {
  schedule: CalendarSchedule | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para obtener la configuración del calendario (días y horarios disponibles)
 * desde el endpoint /calendars/public/:slug
 */
export function useCalendarSchedule(): UseCalendarScheduleResult {
  const calendarSlug = useCalendarSlug();
  const [schedule, setSchedule] = useState<CalendarSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!calendarSlug) {
      console.warn("⚠️ useCalendarSchedule: No se encontró calendarSlug");
      setLoading(false);
      setError("No se especificó el calendario");
      return;
    }

    // Verificar que la URL del backend esté configurada
    const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";
    if (!backendUrl) {
      console.error("❌ useCalendarSchedule: VITE_BACKEND_URL no está configurada en .env");
      setLoading(false);
      setError("Error de configuración: VITE_BACKEND_URL no está definida");
      return;
    }

    setLoading(true);
    setError(null);

    const scheduleUrl = `${backendUrl}/calendars/public/${calendarSlug}`;

    console.log("🔍 useCalendarSchedule - Haciendo request:", {
      calendarSlug,
      backendUrl,
      scheduleUrl,
    });

    fetch(scheduleUrl)
      .then(async (res) => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("Calendario no encontrado");
          }
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            errorData.message || "Error al obtener la configuración del calendario"
          );
        }
        return res.json();
      })
      .then((data: CalendarResponse) => {
        // Transformar la respuesta anidada a estructura plana
        const transformed = transformCalendarResponse(data);
        setSchedule(transformed);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [calendarSlug]);

  return { schedule, loading, error };
}


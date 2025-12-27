import { useParams, useSearchParams } from "react-router";

/**
 * Hook para obtener el calendarSlug desde múltiples fuentes:
 * 1. Parámetro de ruta: /:idCalendario (principal)
 * 2. Query parameter: ?calendarSlug=xxx o ?idCalendario=xxx
 * 3. Variable de entorno: VITE_CALENDAR_SLUG
 * 
 * @returns El calendarSlug o null si no se encuentra
 */
export function useCalendarSlug(): string | null {
  // 1. Intentar obtener de parámetro de ruta principal (/:idCalendario)
  const params = useParams<{ idCalendario?: string }>();
  if (params.idCalendario) {
    console.log("✅ useCalendarSlug: Obtenido de ruta:", params.idCalendario);
    return params.idCalendario;
  }

  // 2. Intentar obtener de query parameter
  const [searchParams] = useSearchParams();
  const queryCalendarSlug = searchParams.get("calendarSlug");
  if (queryCalendarSlug) {
    return queryCalendarSlug;
  }
  const queryIdCalendario = searchParams.get("idCalendario");
  if (queryIdCalendario) {
    return queryIdCalendario;
  }

  // 3. Intentar obtener de variable de entorno
  const envCalendarSlug = import.meta.env.VITE_CALENDAR_SLUG;
  if (envCalendarSlug) {
    return envCalendarSlug;
  }

  return null;
}


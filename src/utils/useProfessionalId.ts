import { useParams, useSearchParams } from "react-router";

/**
 * Hook para obtener el ID del calendario/profesional desde múltiples fuentes:
 * 1. Parámetro de ruta: /:idCalendario (principal)
 * 2. Query parameter: ?idCalendario=xxx o ?professionalId=xxx (compatibilidad)
 * 3. Variable de entorno: VITE_PROFESSIONAL_ID
 * 
 * @returns El ID del calendario/profesional o null si no se encuentra
 */
export function useProfessionalId(): string | null {
  // 1. Intentar obtener de parámetro de ruta principal (/:idCalendario)
  const params = useParams<{ idCalendario?: string; professionalId?: string }>();
  if (params.idCalendario) {
    return params.idCalendario;
  }
  if (params.professionalId) {
    return params.professionalId;
  }

  // 2. Intentar obtener de query parameter
  const [searchParams] = useSearchParams();
  const queryIdCalendario = searchParams.get("idCalendario");
  if (queryIdCalendario) {
    return queryIdCalendario;
  }
  const queryProfessionalId = searchParams.get("professionalId");
  if (queryProfessionalId) {
    return queryProfessionalId;
  }

  // 3. Intentar obtener de variable de entorno
  const envProfessionalId = import.meta.env.VITE_PROFESSIONAL_ID;
  if (envProfessionalId) {
    return envProfessionalId;
  }

  return null;
}

/**
 * Función helper para obtener el idCalendario sin hooks (para uso fuera de componentes)
 * Útil para llamadas API directas
 */
export function getProfessionalId(): string | null {
  // 1. Intentar obtener de la ruta actual (/:idCalendario)
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts.length > 0 && pathParts[0] !== "que-es-kairo" && pathParts[0] !== "para-que-se-usa") {
    return pathParts[0];
  }

  // 2. Intentar obtener de query parameter en la URL actual
  const urlParams = new URLSearchParams(window.location.search);
  const queryIdCalendario = urlParams.get("idCalendario");
  if (queryIdCalendario) {
    return queryIdCalendario;
  }
  const queryProfessionalId = urlParams.get("professionalId");
  if (queryProfessionalId) {
    return queryProfessionalId;
  }

  // 3. Intentar obtener de variable de entorno
  const envProfessionalId = import.meta.env.VITE_PROFESSIONAL_ID;
  if (envProfessionalId) {
    return envProfessionalId;
  }

  return null;
}


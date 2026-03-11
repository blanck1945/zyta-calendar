import { useMutation } from "@tanstack/react-query";

/**
 * Hook para cancelar un appointment público (ej. cuando el pago falla o es abandonado)
 */
export function useCancelAppointment() {
  return useMutation({
    mutationFn: async (appointmentId: string): Promise<void> => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";

      if (!backendUrl || !appointmentId) return;

      const response = await fetch(
        `${backendUrl}/appointments/public/${encodeURIComponent(appointmentId)}/cancel`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      // Si el endpoint no existe o el appointment ya fue cancelado, ignorar el error
      if (!response.ok && response.status !== 404 && response.status !== 409) {
        console.warn("No se pudo cancelar el appointment:", appointmentId, response.status);
      }
    },
  });
}

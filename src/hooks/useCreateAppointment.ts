import { useMutation } from "@tanstack/react-query";

export interface CreateAppointmentRequest {
  calendarSlug: string;
  /** Si viene del flujo ?entryLinkToken=, el POST va a /appointments/public/e/:token */
  entryLinkToken?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  startTime: string; // ISO 8601 format
  paymentMethod: "mercadopago" | "transfer" | "cash" | "coordinar" | "galiopay";
  notes?: string;
  duration?: number; // Duración en minutos (opcional)
  /** Obligatorio en BE cuando requirePaymentBeforeConfirmation (modo fusionado). */
  amount?: number;
}

export interface CreateAppointmentResponse {
  id: string;
  calendarId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  startTime: string;
  endTime: string;
  status: string;
  paymentMethod: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Hook para crear un appointment (cita) de forma pública
 */
export function useCreateAppointment() {
  return useMutation({
    mutationFn: async (
      data: CreateAppointmentRequest
    ): Promise<CreateAppointmentResponse> => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";

      if (!backendUrl) {
        throw new Error("VITE_BACKEND_URL no está configurada");
      }

      if (!data.calendarSlug) {
        throw new Error("calendarSlug es requerido");
      }

      const path = data.entryLinkToken
        ? `appointments/public/e/${encodeURIComponent(data.entryLinkToken)}`
        : `appointments/public/${encodeURIComponent(data.calendarSlug)}`;

      const payload: Record<string, unknown> = {
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone || undefined,
        startTime: data.startTime,
        paymentMethod: data.paymentMethod,
        notes: data.notes || undefined,
        duration: data.duration || undefined,
      };
      if (
        data.amount != null &&
        Number.isFinite(data.amount) &&
        data.amount > 0
      ) {
        payload.amount = data.amount;
      }

      const response = await fetch(`${backendUrl}/${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Error al crear la cita"
        );
      }

      return await response.json();
    },
  });
}


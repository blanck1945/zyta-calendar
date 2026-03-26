import { useMutation } from "@tanstack/react-query";
import { isDevMockCalendarEnabled } from "../dev/mockCalendarSchedule";

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
      if (!data.calendarSlug) {
        throw new Error("calendarSlug es requerido");
      }

      if (isDevMockCalendarEnabled() && !data.entryLinkToken) {
        await new Promise((r) => setTimeout(r, 350));
        const id = `mock-${Date.now()}`;
        const start = new Date(data.startTime);
        const end = new Date(start);
        end.setMinutes(
          end.getMinutes() + (data.duration && data.duration > 0 ? data.duration : 30)
        );
        return {
          id,
          calendarId: "mock-calendar-id",
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          status: "confirmed",
          paymentMethod: data.paymentMethod,
          notes: data.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";

      if (!backendUrl) {
        throw new Error("VITE_BACKEND_URL no está configurada");
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


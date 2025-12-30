import { useMutation } from "@tanstack/react-query";

export interface CreatePreferenceRequest {
  calendarSlug: string;
  amount: number;
  currency: string;
  successUrl: string;
  failureUrl: string;
  pendingUrl: string;
}

export interface CreatePreferenceResponse {
  preferenceId: string;
  initPoint: string;
}

/**
 * Hook para crear una preferencia de pago de Mercado Pago
 */
export function useCreateMercadoPagoPreference() {
  return useMutation({
    mutationFn: async (data: CreatePreferenceRequest): Promise<CreatePreferenceResponse> => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";
      
      if (!backendUrl) {
        throw new Error("VITE_BACKEND_URL no está configurada");
      }

      const response = await fetch(
        `${backendUrl}/payments/mercadopago/preference?calendar=${encodeURIComponent(data.calendarSlug)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: data.amount,
            currency: data.currency,
            successUrl: data.successUrl,
            failureUrl: data.failureUrl,
            pendingUrl: data.pendingUrl,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Error al crear la preferencia de Mercado Pago"
        );
      }

      const result = await response.json();

      if (!result.initPoint) {
        throw new Error("Backend no devolvió initPoint");
      }

      return result;
    },
  });
}


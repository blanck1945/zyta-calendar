import { useMutation } from "@tanstack/react-query";

export interface CreateGalioPayLinkRequest {
  calendarSlug: string;
  amount: number;
  currency: string;
  successUrl: string;
  failureUrl: string;
  referenceId: string;
}

export interface CreateGalioPayLinkResponse {
  checkoutUrl: string;
}

export function useCreateGalioPayLink() {
  return useMutation({
    mutationFn: async (data: CreateGalioPayLinkRequest): Promise<CreateGalioPayLinkResponse> => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/+$/, "") || "";

      if (!backendUrl) {
        throw new Error("VITE_BACKEND_URL no está configurada");
      }

      const response = await fetch(
        `${backendUrl}/payments/galiopay/link?calendar=${encodeURIComponent(data.calendarSlug)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: data.amount,
            currency: data.currency,
            successUrl: data.successUrl,
            failureUrl: data.failureUrl,
            referenceId: data.referenceId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as any).message || "Error al crear el link de pago con GalioPay");
      }

      const result = await response.json() as CreateGalioPayLinkResponse;

      if (!result.checkoutUrl) {
        throw new Error("Backend no devolvió checkoutUrl");
      }

      return result;
    },
  });
}

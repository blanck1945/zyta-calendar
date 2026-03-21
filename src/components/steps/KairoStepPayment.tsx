// src/components/steps/KairoStepPayment.tsx
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { CalendarPayments } from "../../hooks/useCalendarSchedule";
import PaymentMethodPicker from "../payment/PaymentMethodPicker";
import type { PaymentMethod } from "../payment/paymentMethodUtils";

export type { PaymentMethod } from "../payment/paymentMethodUtils";

interface KairoStepPaymentProps {
  meetingStart: Date | null;
  meetingEnd: Date | null;

  name: string;
  email: string;

  amount?: number;
  currency?: string;

  paymentMethod: PaymentMethod | null;
  onChangePaymentMethod: (method: PaymentMethod) => void;

  payments?: CalendarPayments;

  onBack: () => void;
  onConfirm: (method?: PaymentMethod, transferProofFile?: File | null) => void;

  isLoading?: boolean;
  error?: string | null;
}

const KairoStepPayment: React.FC<KairoStepPaymentProps> = ({
  meetingStart,
  meetingEnd,
  amount,
  currency,
  paymentMethod,
  onChangePaymentMethod,
  payments,
  onBack,
  onConfirm,
  isLoading = false,
  error = null,
}) => {
  const [transferProofFile, setTransferProofFile] = useState<File | null>(null);

  const handlePaymentMethodChange = (m: PaymentMethod) => {
    if (m !== "transfer") setTransferProofFile(null);
    onChangePaymentMethod(m);
  };

  const durationMinutes = useMemo(() => {
    if (!meetingStart || !meetingEnd) return null;
    return Math.round((meetingEnd.getTime() - meetingStart.getTime()) / 60000);
  }, [meetingStart, meetingEnd]);

  const formattedResumenDate = useMemo(() => {
    if (!meetingStart || !meetingEnd) return null;
    const dateStr = meetingStart.toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const timeStr = meetingStart
      .toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(" ", "");
    return `${dateStr} • ${timeStr} (GMT-3) • ${durationMinutes} min`;
  }, [meetingStart, meetingEnd, durationMinutes]);

  // Mostrar error de pago como toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const isRealPayment =
    paymentMethod === "mercadopago" ||
    paymentMethod === "galiopay" ||
    paymentMethod === "transfer";
  const confirmButtonLabel = isLoading
    ? "Procesando..."
    : isRealPayment
      ? "Pagar"
      : "Confirmar reserva";

  const isTransferWithoutProof = paymentMethod === "transfer" && !transferProofFile;
  const isConfirmDisabled =
    !paymentMethod || isLoading || isTransferWithoutProof;

  return (
    <>
      <div
        className="w-full"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <PaymentMethodPicker
          payments={payments}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={handlePaymentMethodChange}
          transferProofFile={transferProofFile}
          onTransferProofChange={setTransferProofFile}
        />

        {/* Resumen */}
        {meetingStart && meetingEnd && (
          <Card
            className="p-5 border border-gray-100 mb-6"
            style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
          >
            <h3 className="text-base font-bold text-gray-900 mb-2">Resumen</h3>
            <p className="text-sm text-gray-700 mb-1">
              {formattedResumenDate}
            </p>
            <p className="text-sm text-gray-600">
              Monto:{" "}
              {amount != null
                ? `${currency ?? "$"} ${amount.toLocaleString("es-AR")}`
                : "$ — (lo define el profesional al confirmar)"}
            </p>
          </Card>
        )}

        {isTransferWithoutProof && (
          <p className="mb-3 text-sm text-gray-500">
            Subí el comprobante de transferencia para poder continuar.
          </p>
        )}

        <div className="flex flex-row justify-center pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBack}
            disabled={isLoading}
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="default"
            size="md"
            disabled={isConfirmDisabled}
            onClick={() =>
              paymentMethod &&
              onConfirm(
                paymentMethod,
                paymentMethod === "transfer" ? transferProofFile : null
              )
            }
            className="font-semibold text-white bg-[#FF6600] hover:bg-[#E55F00] disabled:opacity-60"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {confirmButtonLabel}
          </Button>
        </div>
      </div>
    </>
  );
};

export default KairoStepPayment;

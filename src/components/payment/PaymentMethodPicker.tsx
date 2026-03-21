import { useMemo, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { CalendarPayments } from "../../hooks/useCalendarSchedule";
import type { PaymentMethod } from "./paymentMethodUtils";

const formatCbuMasked = (cbu: string): string => {
  const digits = cbu.replace(/\D/g, "");
  if (digits.length < 4) return cbu;
  return `**** **** **** ${digits.slice(-4)}`;
};

interface PaymentMethodPickerProps {
  payments?: CalendarPayments;
  paymentMethod: PaymentMethod | null;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  transferProofFile: File | null;
  onTransferProofChange: (file: File | null) => void;
  compact?: boolean;
}

/**
 * Tarjetas de selección de método de pago + comprobante de transferencia (misma UX que el paso Pago del calendario).
 */
export default function PaymentMethodPicker({
  payments,
  paymentMethod,
  onPaymentMethodChange,
  transferProofFile,
  onTransferProofChange,
  compact = false,
}: PaymentMethodPickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transferProofPreviewUrl = useMemo(() => {
    if (!transferProofFile) return null;
    return URL.createObjectURL(transferProofFile);
  }, [transferProofFile]);

  useEffect(() => {
    return () => {
      if (transferProofPreviewUrl) URL.revokeObjectURL(transferProofPreviewUrl);
    };
  }, [transferProofPreviewUrl]);

  const enabledPaymentMethods = useMemo(() => {
    if (payments?.noPaymentRequired) return [];
    if (!payments?.enabled || payments.enabled.length === 0) return [];
    return payments.enabled;
  }, [payments]);

  const isMethodEnabled = (method: string): boolean =>
    enabledPaymentMethods.includes(method);

  const hasAnyMethod =
    (isMethodEnabled("mercadopago") && !!payments?.mercadopago) ||
    isMethodEnabled("galiopay") ||
    (isMethodEnabled("transfer") && !!payments?.transfer) ||
    (isMethodEnabled("coordinar") && !!payments?.coordinar) ||
    (isMethodEnabled("cash") && !!payments?.cash);

  const handleSubirComprobanteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleTransferProofInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onTransferProofChange(file);
    }
    e.target.value = "";
  };

  const handleRemoveTransferProof = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = "";
    onTransferProofChange(null);
  };

  const cardMin = compact ? "min-w-0 w-full" : "min-w-[280px]";

  return (
    <>
      {hasAnyMethod && (
        <div
          className={
            compact
              ? "flex flex-col gap-4 mb-4"
              : "flex flex-wrap gap-6 mb-6"
          }
        >
          {isMethodEnabled("mercadopago") && payments?.mercadopago && (
            <Card
              className={`flex flex-col p-5 border-2 flex-1 ${cardMin} cursor-pointer transition-colors hover:border-orange-300 ${paymentMethod === "mercadopago" ? "border-[#FF6600]" : "border-gray-100"}`}
              style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
              onClick={() => onPaymentMethodChange("mercadopago")}
            >
              <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#FF6600] mb-3">
                RECOMENDADO
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Mercado Pago</h3>
              <p className="text-sm text-gray-600 flex-1">
                {payments.mercadopago.note ||
                  "Pagás con tarjeta, saldo o transferencia. Confirmación automática en segundos."}
              </p>
            </Card>
          )}

          {isMethodEnabled("galiopay") && (
            <Card
              className={`flex flex-col p-5 border-2 flex-1 ${cardMin} cursor-pointer transition-colors hover:border-indigo-300 ${paymentMethod === "galiopay" ? "border-indigo-500" : "border-gray-100"}`}
              style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
              onClick={() => onPaymentMethodChange("galiopay")}
            >
              <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold text-white bg-indigo-500 mb-3">
                RECOMENDADO
              </span>
              <h3 className="text-lg font-bold text-gray-900 mb-2">GalioPay</h3>
              <p className="text-sm text-gray-600 flex-1">
                Pagá online de forma segura. Confirmación automática al completar el pago.
              </p>
            </Card>
          )}

          {isMethodEnabled("transfer") && payments?.transfer && (
            <Card
              className={`flex flex-col p-5 border-2 flex-1 ${cardMin} cursor-pointer transition-colors hover:border-orange-300 ${paymentMethod === "transfer" ? "border-[#FF6600]" : "border-gray-100"}`}
              style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
              onClick={() => onPaymentMethodChange("transfer")}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Transferencia</h3>
              <p className="text-sm text-gray-600 mb-4">
                {payments.transfer.note ||
                  "Transferí a la cuenta indicada y subí el comprobante para confirmar el turno."}
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 space-y-2">
                <div>
                  <span className="text-gray-500 text-sm">Alias: </span>
                  <span className="text-gray-900 font-medium">{payments.transfer.alias}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">CBU: </span>
                  <span className="text-gray-900 font-mono text-sm">
                    {formatCbuMasked(payments.transfer.cbu)}
                  </span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleTransferProofInputChange}
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleSubirComprobanteClick}
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 font-medium"
              >
                Subir comprobante
              </Button>
              {transferProofFile && (
                <div
                  className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {transferProofPreviewUrl && (
                    <img
                      src={transferProofPreviewUrl}
                      alt="Comprobante"
                      className="w-14 h-14 object-cover rounded border border-gray-200"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transferProofFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(transferProofFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveTransferProof}
                    className="shrink-0 border-gray-200 text-gray-600 hover:bg-gray-100"
                  >
                    Eliminar
                  </Button>
                </div>
              )}
            </Card>
          )}

          {isMethodEnabled("coordinar") && payments?.coordinar && (
            <Card
              className={`flex flex-col p-5 border-2 flex-1 ${cardMin} cursor-pointer transition-colors hover:border-orange-300 ${paymentMethod === "coordinar" ? "border-[#FF6600]" : "border-gray-100"}`}
              style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
              onClick={() => onPaymentMethodChange("coordinar")}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Coordinar</h3>
              <p className="text-sm text-gray-600 mb-4">{payments.coordinar.note}</p>
            </Card>
          )}

          {isMethodEnabled("cash") && payments?.cash && (
            <Card
              className={`flex flex-col p-5 border-2 flex-1 ${cardMin} cursor-pointer transition-colors hover:border-orange-300 ${paymentMethod === "cash" ? "border-[#FF6600]" : "border-gray-100"}`}
              style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
              onClick={() => onPaymentMethodChange("cash")}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">Efectivo</h3>
              <p className="text-sm text-gray-600 flex-1">
                {payments.cash.note || "Acordá el pago en efectivo con el profesional según lo indicado."}
              </p>
            </Card>
          )}
        </div>
      )}

      {payments?.noPaymentRequired && (
        <div className="mb-6 text-center py-6 text-gray-500">
          No se requiere método de pago para esta reserva.
        </div>
      )}
      {!hasAnyMethod && !payments?.noPaymentRequired && (
        <div className="mb-6 text-center py-6 text-gray-500">
          No hay métodos de pago configurados.
        </div>
      )}
    </>
  );
}

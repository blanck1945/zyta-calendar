// src/components/steps/KairoStepPayment.tsx
import { useMemo, useRef, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { CalendarPayments } from "../../hooks/useCalendarSchedule";

export type PaymentMethod = "cash" | "transfer" | "mercadopago" | "coordinar";

interface KairoStepPaymentProps {
  meetingStart: Date | null;
  meetingEnd: Date | null;

  name: string;
  email: string;

  paymentMethod: PaymentMethod | null;
  onChangePaymentMethod: (method: PaymentMethod) => void;

  payments?: CalendarPayments;

  onBack: () => void;
  onConfirm: (method?: PaymentMethod, transferProofFile?: File | null) => void;
}

const formatCbuMasked = (cbu: string): string => {
  const digits = cbu.replace(/\D/g, "");
  if (digits.length < 4) return cbu;
  return `**** **** **** ${digits.slice(-4)}`;
};

const KairoStepPayment: React.FC<KairoStepPaymentProps> = ({
  meetingStart,
  meetingEnd,
  paymentMethod,
  onChangePaymentMethod,
  payments,
  onBack,
  onConfirm,
}) => {
  // Duración en minutos para el resumen
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
    const timeStr = meetingStart.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(" ", "");
    const tz = "GMT-3";
    return `${dateStr} • ${timeStr} (${tz}) • ${durationMinutes} min`;
  }, [meetingStart, meetingEnd, durationMinutes]);

  const enabledPaymentMethods = useMemo(() => {
    if (payments?.noPaymentRequired) return [];
    if (!payments?.enabled || payments.enabled.length === 0) return [];
    return payments.enabled;
  }, [payments]);

  const isMethodEnabled = (method: string): boolean =>
    enabledPaymentMethods.includes(method);

  // Subida de comprobante (transferencia)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transferProofFile, setTransferProofFile] = useState<File | null>(null);
  const [transferProofPreviewUrl, setTransferProofPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (transferProofPreviewUrl) URL.revokeObjectURL(transferProofPreviewUrl);
    };
  }, [transferProofPreviewUrl]);

  const handleSubirComprobanteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleTransferProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (transferProofPreviewUrl) URL.revokeObjectURL(transferProofPreviewUrl);
      setTransferProofFile(file);
      setTransferProofPreviewUrl(URL.createObjectURL(file));
    }
    e.target.value = "";
  };

  const handleRemoveTransferProof = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (transferProofPreviewUrl) URL.revokeObjectURL(transferProofPreviewUrl);
    setTransferProofFile(null);
    setTransferProofPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleMercadoPagoConfirm = () => {
    onChangePaymentMethod("mercadopago");
    onConfirm("mercadopago");
  };

  const hasAnyMethod = isMethodEnabled("mercadopago") || isMethodEnabled("transfer") || isMethodEnabled("cash") || isMethodEnabled("coordinar");

  return (
    <>
      <div
        className="max-w-4xl mx-auto"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* Métodos de pago en fila (flex) */}
        {hasAnyMethod && (
          <div className="flex flex-wrap gap-6 mb-6">
            {/* Mercado Pago */}
            {isMethodEnabled("mercadopago") && payments?.mercadopago && (
              <Card
                className={`flex flex-col p-5 border-2 flex-1 min-w-[280px] cursor-pointer transition-colors hover:border-orange-300 ${paymentMethod === "mercadopago" ? "border-[#FF6600]" : "border-gray-100"}`}
                style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
                onClick={() => onChangePaymentMethod("mercadopago")}
              >
                <span className="inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#FF6600] mb-3">
                  RECOMENDADO
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Mercado Pago
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  {payments.mercadopago.note ||
                    "Pagás con tarjeta, saldo o transferencia. Confirmación automática en segundos."}
                </p>
                <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    QR
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="md"
                    onClick={handleMercadoPagoConfirm}
                    className="font-semibold text-white bg-[#FF6600] hover:bg-[#E55F00]"
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "16px",
                      fontWeight: 600,
                    }}
                  >
                    Pagar ahora
                  </Button>
                </div>
              </Card>
            )}

            {/* Transferencia */}
            {isMethodEnabled("transfer") && payments?.transfer && (
              <Card
                className={`flex flex-col p-5 border-2 flex-1 min-w-[280px] cursor-pointer transition-colors hover:border-orange-300 ${paymentMethod === "transfer" ? "border-[#FF6600]" : "border-gray-100"}`}
                style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
                onClick={() => onChangePaymentMethod("transfer")}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Transferencia
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {payments.transfer.note ||
                    "Transferí a la cuenta indicada y subí el comprobante para confirmar el turno."}
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 space-y-2">
                  <div>
                    <span className="text-gray-500 text-sm">Alias: </span>
                    <span className="text-gray-900 font-medium">
                      {payments.transfer.alias}
                    </span>
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
                  onChange={handleTransferProofChange}
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

            {/* Efectivo y Coordinar: solo seleccionan método; confirmar con el botón de abajo */}
            {isMethodEnabled("cash") && payments?.cash && (
              <Card
                className={`flex flex-col p-5 border-2 flex-1 min-w-[280px] cursor-pointer transition-colors hover:border-orange-300 ${paymentMethod === "cash" ? "border-[#FF6600]" : "border-gray-100"}`}
                style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
                onClick={() => onChangePaymentMethod("cash")}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Efectivo
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {payments.cash.note}
                </p>
              </Card>
            )}
            {isMethodEnabled("coordinar") && payments?.coordinar && (
              <Card
                className={`flex flex-col p-5 border-2 flex-1 min-w-[280px] cursor-pointer transition-colors hover:border-orange-300 ${paymentMethod === "coordinar" ? "border-[#FF6600]" : "border-gray-100"}`}
                style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
                onClick={() => onChangePaymentMethod("coordinar")}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Coordinar
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {payments.coordinar.note}
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
              Monto: $ — (lo define el abogado al confirmar)
            </p>
          </Card>
        )}

        {/* Volver y Confirmar reserva */}
        <div className="flex flex-row pt-2 gap-2">
          <Button type="button" variant="outline" size="md" onClick={onBack}>
            Volver
          </Button>
          <Button
            type="button"
            variant="default"
            size="md"
            disabled={!paymentMethod}
            onClick={() => paymentMethod && onConfirm(paymentMethod, paymentMethod === "transfer" ? transferProofFile : null)}
            className="font-semibold text-white bg-[#FF6600] hover:bg-[#E55F00]"
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Confirmar reserva
          </Button>
        </div>
      </div>
    </>
  );
};

export default KairoStepPayment;

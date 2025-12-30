// src/components/steps/KairoStepPayment.tsx
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import type { CalendarPayments } from "../../hooks/useCalendarSchedule";

export type PaymentMethod = "cash" | "transfer" | "mercadopago";

interface KairoStepPaymentProps {
  meetingStart: Date | null;
  meetingEnd: Date | null;

  name: string;
  email: string;

  paymentMethod: PaymentMethod | null;
  onChangePaymentMethod: (method: PaymentMethod) => void;

  payments?: CalendarPayments;

  onBack: () => void;
  onConfirm: () => void;
}

const KairoStepPayment: React.FC<KairoStepPaymentProps> = ({
  meetingStart,
  meetingEnd,
  name,
  email,
  paymentMethod,
  onChangePaymentMethod,
  payments,
  onBack,
  onConfirm,
}) => {
  const canConfirm = paymentMethod !== null;

  // Obtener métodos de pago habilitados
  const enabledPaymentMethods = useMemo(() => {
    if (!payments?.enabled || payments.enabled.length === 0) {
      return [];
    }
    return payments.enabled;
  }, [payments?.enabled]);

  // Verificar si un método está habilitado
  const isMethodEnabled = (method: string): boolean => {
    return enabledPaymentMethods.includes(method);
  };

  return (
    <>
      {/* Resumen rápido arriba */}
      <div 
        className="mb-6 bg-accent border border-border shadow-sm"
        style={{
          borderRadius: "var(--style-border-radius, 0.75rem)",
          padding: "var(--style-card-padding, 0.75rem)",
          display: "flex",
          flexDirection: "column",
          gap: "0.25rem",
        }}
      >
        <p 
          className="font-semibold text-foreground"
          style={{
            fontSize: "var(--style-body-size, 0.875rem)",
            fontWeight: "var(--style-body-weight, 400)",
          }}
        >
          Resumen de tu reserva
        </p>
        {meetingStart && meetingEnd && (
          <p 
            className="text-muted-foreground"
            style={{
              fontSize: "var(--style-body-size, 0.875rem)",
              fontWeight: "var(--style-body-weight, 400)",
            }}
          >
            {meetingStart.toLocaleDateString()} ·{" "}
            {meetingStart
              .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace(" ", "")}{" "}
            -{" "}
            {meetingEnd
              .toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
              .replace(" ", "")}
          </p>
        )}
        <p 
          className="text-muted-foreground"
          style={{
            fontSize: "var(--style-body-size, 0.875rem)",
            fontWeight: "var(--style-body-weight, 400)",
          }}
        >
          {name} · {email}
        </p>
      </div>

      {/* Métodos de pago disponibles */}
      {enabledPaymentMethods.length > 0 ? (
        <div 
          className="grid md:grid-cols-2 mb-6"
          style={{
            gap: "var(--style-component-gap, 1rem)",
          }}
        >
          {/* Opción Efectivo */}
          {isMethodEnabled("cash") && payments?.cash && (
            <button
              type="button"
              onClick={() => onChangePaymentMethod("cash")}
              className={`
                text-left border-2 transition-all duration-200 flex flex-col shadow-sm
                ${
                  paymentMethod === "cash"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:bg-accent hover:border-primary/50 hover:shadow-md"
                }
              `}
              style={{
                borderRadius: "var(--style-border-radius, 0.75rem)",
                padding: "var(--style-card-padding, 1.25rem)",
                gap: "var(--style-component-gap, 0.5rem)",
              }}
            >
              <span 
                className="font-semibold text-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                Efectivo
              </span>
              <span 
                className="text-muted-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.75rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                {payments.cash.note}
              </span>
            </button>
          )}

          {/* Opción Transferencia */}
          {isMethodEnabled("transfer") && payments?.transfer && (
            <button
              type="button"
              onClick={() => onChangePaymentMethod("transfer")}
              className={`
                text-left border-2 transition-all duration-200 flex flex-col shadow-sm
                ${
                  paymentMethod === "transfer"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:bg-accent hover:border-primary/50 hover:shadow-md"
                }
              `}
              style={{
                borderRadius: "var(--style-border-radius, 0.75rem)",
                padding: "var(--style-card-padding, 1.25rem)",
                gap: "var(--style-component-gap, 0.5rem)",
              }}
            >
              <span 
                className="font-semibold text-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                Transferencia bancaria
              </span>
              <span 
                className="text-muted-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.75rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                {payments.transfer.note}
              </span>
            </button>
          )}

          {/* Opción Mercado Pago */}
          {isMethodEnabled("mercadopago") && payments?.mercadopago && (
            <button
              type="button"
              onClick={() => onChangePaymentMethod("mercadopago")}
              className={`
                text-left border-2 transition-all duration-200 flex flex-col shadow-sm
                ${
                  paymentMethod === "mercadopago"
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border bg-card hover:bg-accent hover:border-primary/50 hover:shadow-md"
                }
              `}
              style={{
                borderRadius: "var(--style-border-radius, 0.75rem)",
                padding: "var(--style-card-padding, 1.25rem)",
                gap: "var(--style-component-gap, 0.5rem)",
              }}
            >
              <span 
                className="font-semibold text-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                Mercado Pago
              </span>
              <span 
                className="text-muted-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.75rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                {payments.mercadopago.note}
              </span>
            </button>
          )}
        </div>
      ) : (
        <div className="mb-6 text-center py-8">
          <p className="text-muted-foreground">
            No hay métodos de pago configurados.
          </p>
        </div>
      )}

      {/* Información del método seleccionado (solo para cash y transfer) */}
      {paymentMethod && payments && paymentMethod !== "mercadopago" && (
        <Card
          className="mb-6"
          style={{
            padding: "var(--style-card-padding, 1.5rem)",
          }}
        >
          {paymentMethod === "cash" && payments.cash && (
            <div className="flex flex-col gap-2">
              <p
                className="font-semibold text-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 500)",
                }}
              >
                Pago en efectivo
              </p>
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                {payments.cash.note}
              </p>
            </div>
          )}

          {paymentMethod === "transfer" && payments.transfer && (
            <div className="flex flex-col gap-3">
              <p
                className="font-semibold text-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 500)",
                }}
              >
                Datos para transferencia bancaria
              </p>
              <div className="flex flex-col gap-2">
                <div>
                  <p
                    className="text-muted-foreground mb-1"
                    style={{
                      fontSize: "var(--style-body-size, 0.75rem)",
                      fontWeight: "var(--style-body-weight, 400)",
                    }}
                  >
                    Alias:
                  </p>
                  <p
                    className="font-mono font-semibold text-foreground"
                    style={{
                      fontSize: "var(--style-body-size, 0.875rem)",
                      fontWeight: "var(--style-body-weight, 600)",
                    }}
                  >
                    {payments.transfer.alias}
                  </p>
                </div>
                <div>
                  <p
                    className="text-muted-foreground mb-1"
                    style={{
                      fontSize: "var(--style-body-size, 0.75rem)",
                      fontWeight: "var(--style-body-weight, 400)",
                    }}
                  >
                    CBU:
                  </p>
                  <p
                    className="font-mono font-semibold text-foreground"
                    style={{
                      fontSize: "var(--style-body-size, 0.875rem)",
                      fontWeight: "var(--style-body-weight, 600)",
                    }}
                  >
                    {payments.transfer.cbu}
                  </p>
                </div>
                {payments.transfer.note && (
                  <p
                    className="text-muted-foreground mt-2"
                    style={{
                      fontSize: "var(--style-body-size, 0.75rem)",
                      fontWeight: "var(--style-body-weight, 400)",
                    }}
                  >
                    {payments.transfer.note}
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      )}

      <div 
        className="flex flex-col-reverse sm:flex-row pt-2"
        style={{
          gap: "var(--style-component-gap, 0.75rem)",
        }}
      >
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onBack}
        >
          Volver
        </Button>
        {paymentMethod === "mercadopago" ? (
          <Button
            type="button"
            variant="default"
            size="md"
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            Pagar con Mercado Pago
          </Button>
        ) : (
          <Button
            type="button"
            variant="default"
            size="md"
            onClick={onConfirm}
            disabled={!canConfirm}
          >
            Confirmar reserva
          </Button>
        )}
      </div>
    </>
  );
};

export default KairoStepPayment;

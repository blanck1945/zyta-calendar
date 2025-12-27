// src/components/steps/KairoStepPayment.tsx
import { Button } from "../ui/button";

export type PaymentMethod = "transferencia" | "mercado_pago";

interface KairoStepPaymentProps {
  meetingStart: Date | null;
  meetingEnd: Date | null;

  name: string;
  email: string;

  paymentMethod: PaymentMethod | null;
  onChangePaymentMethod: (method: PaymentMethod) => void;

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
  onBack,
  onConfirm,
}) => {
  const canConfirm = paymentMethod !== null;

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

      <div 
        className="grid md:grid-cols-2 mb-6"
        style={{
          gap: "var(--style-component-gap, 1rem)",
        }}
      >
        {/* Opción Transferencia */}
        <button
          type="button"
          onClick={() => onChangePaymentMethod("transferencia")}
          className={`
            text-left border-2 transition-all duration-200 flex flex-col shadow-sm
            ${
              paymentMethod === "transferencia"
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
            Recibí los datos de la cuenta y enviá el comprobante.
          </span>
        </button>

        {/* Opción Mercado Pago */}
        <button
          type="button"
          onClick={() => onChangePaymentMethod("mercado_pago")}
          className={`
            text-left border-2 transition-all duration-200 flex flex-col shadow-sm
            ${
              paymentMethod === "mercado_pago"
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
            Pagá online con tarjeta, débito o saldo en cuenta.
          </span>
        </button>
      </div>

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
        <Button
          type="button"
          variant="default"
          size="md"
          onClick={onConfirm}
          disabled={!canConfirm}
        >
          Confirmar reserva
        </Button>
      </div>
    </>
  );
};

export default KairoStepPayment;

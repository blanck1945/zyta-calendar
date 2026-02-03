// src/components/steps/KairoStepReviewConfirmation.tsx
import { useMemo } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface KairoStepReviewConfirmationProps {
  meetingStart: Date | null;
  meetingEnd: Date | null;
  timezone: string;
  amount?: number;
  currency?: string;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
  isLoading?: boolean;
}

function formatTimezoneShort(tz: string): string {
  if (tz.includes("Argentina") || tz === "America/Argentina/Buenos_Aires") return "GMT-3";
  return tz;
}

const KairoStepReviewConfirmation: React.FC<KairoStepReviewConfirmationProps> = ({
  meetingStart,
  meetingEnd,
  timezone,
  amount,
  currency,
  onBack,
  onSubmit,
  isLoading = false,
}) => {
  const durationMinutes = useMemo(() => {
    if (!meetingStart || !meetingEnd) return null;
    return Math.round((meetingEnd.getTime() - meetingStart.getTime()) / 60000);
  }, [meetingStart, meetingEnd]);

  const formattedResumen = useMemo(() => {
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
    const tzLabel = formatTimezoneShort(timezone);
    return {
      dateTime: `${dateStr} • ${timeStr} (${tzLabel})`,
      duration: durationMinutes,
      timezone: tzLabel,
    };
  }, [meetingStart, meetingEnd, durationMinutes, timezone]);

  const amountFormatted = useMemo(() => {
    if (amount == null || !Number.isFinite(amount)) return null;
    const code = currency || "ARS";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: code,
    }).format(amount);
  }, [amount, currency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onSubmit();
  };

  return (
    <div
      className="flex flex-col w-full max-w-4xl lg:max-w-none mx-auto gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="space-y-6">
        {/* Box: Zyta en evaluación — naranja suave como en la app */}
        <div
          className="rounded-xl border border-orange-200 p-4"
          style={{ backgroundColor: "rgba(255, 106, 0, 0.08)" }}
        >
          <h3 className="font-semibold text-gray-900 text-lg mb-2">
            Zyta en evaluación
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            El profesional revisará tu consulta antes de confirmarla.
          </p>
          <p className="text-sm text-gray-600">
            Recibirás un email cuando esté lista para pagar.
          </p>
        </div>

        {/* Resumen */}
        {formattedResumen && (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-gray-900">
              {formattedResumen.dateTime}
            </p>
            <p className="text-gray-600">
              Duración: {formattedResumen.duration} min
            </p>
            <p className="text-gray-600">
              Zona horaria: {formattedResumen.timezone}
            </p>
            {amountFormatted != null && (
              <p className="font-medium text-gray-900">
                Valor de la consulta: {amountFormatted}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onBack}
              disabled={isLoading}
              className="border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-200"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Volver
            </Button>
            <Button
              type="submit"
              variant="default"
              size="md"
              disabled={isLoading}
              className="font-semibold text-white bg-[#FF6600] hover:bg-[#E55F00]"
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Zyta"
              )}
            </Button>
          </div>
          <p className="text-sm text-gray-600" style={{ fontFamily: "Inter, sans-serif" }}>
            El pago se realizará únicamente si el profesional confirma la consulta.
          </p>
        </form>
      </div>
    </div>
  );
};

export default KairoStepReviewConfirmation;

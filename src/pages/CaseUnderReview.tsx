import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { User, Mail, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/button";

interface FormData {
  name?: string;
  email?: string;
  phone?: string;
  query?: string;
  customFields?: Record<string, string>;
}

interface BookingResumen {
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  timezone: string;
  confirmationMaxHours?: number;
}

function formatTimezoneShort(tz: string): string {
  if (tz.includes("Argentina") || tz === "America/Argentina/Buenos_Aires") return "GMT-3";
  return tz;
}

export default function CaseUnderReview() {
  const [searchParams] = useSearchParams();
  const calendarSlugFromUrl = searchParams.get("calendarSlug");
  const calendarSlug = calendarSlugFromUrl || localStorage.getItem("bookingCalendarSlug");
  const appointmentId = searchParams.get("appointmentId");
  const [formData, setFormData] = useState<FormData | null>(null);
  const [resumen, setResumen] = useState<BookingResumen | null>(null);

  useEffect(() => {
    const savedFormData = localStorage.getItem("bookingFormData");
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
        localStorage.removeItem("bookingFormData");
      } catch (e) {
        console.error("Error al leer datos del formulario:", e);
      }
    }
    const savedResumen = localStorage.getItem("bookingResumen");
    if (savedResumen) {
      try {
        setResumen(JSON.parse(savedResumen));
        localStorage.removeItem("bookingResumen");
      } catch (e) {
        console.error("Error al leer resumen:", e);
      }
    }
    // bookingCalendarSlug se mantiene para "Volver al inicio" (se limpia al ir al calendario si se desea)
  }, []);

  const handleGoBack = () => {
    if (calendarSlug) {
      window.location.href = `${window.location.origin}/${calendarSlug}`;
    } else {
      const landingUrl = import.meta.env.VITE_LANDING_URL || "https://zyta-landing.vercel.app/";
      window.location.href = landingUrl;
    }
  };

  const dateTimeFormatted = resumen
    ? (() => {
        const start = new Date(resumen.startTime);
        const dateStr = start.toLocaleDateString("es-AR", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const timeStr = start.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).replace(" ", "");
        const tz = formatTimezoneShort(resumen.timezone);
        return { dateStr, timeStr: `${timeStr} (${tz})`, duration: resumen.durationMinutes };
      })()
    : null;

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundColor: "#0a0a0a",
        backgroundImage: "url(/muestras/banner.jpeg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 w-full max-w-lg">
        {/* Card blanco / off-white — borde suave, sombra tenue, radius 16–20px */}
        <div
          className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-xl"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {/* Ícono check verde — menos saturación para no competir con naranja Zyta */}
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100/90 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Zyta enviada
          </h1>
          <p className="text-base text-gray-600 text-center mt-2">
            Quedó pendiente de confirmación por el profesional.
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            El profesional revisará tu consulta. Te avisaremos por email cuando esté confirmada y puedas realizar el pago.
          </p>

          {/* Datos mostrados: Cliente, Email, Fecha, Horario (GMT-3), Duración */}
          <div className="mt-6 space-y-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            {formData?.name && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Cliente</p>
                  <p className="text-sm font-medium text-gray-900">{formData.name}</p>
                </div>
              </div>
            )}
            {formData?.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500">Email</p>
                  <p className="text-sm font-medium text-gray-900">{formData.email}</p>
                </div>
              </div>
            )}
            {dateTimeFormatted && (
              <>
                <div>
                  <p className="text-xs font-medium text-gray-500">Fecha</p>
                  <p className="text-sm font-medium text-gray-900">{dateTimeFormatted.dateStr}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Horario</p>
                  <p className="text-sm font-medium text-gray-900">{dateTimeFormatted.timeStr}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Duración</p>
                  <p className="text-sm font-medium text-gray-900">{dateTimeFormatted.duration} min</p>
                </div>
              </>
            )}
          </div>

          {/* Plazo estimado (si el abogado lo configuró) */}
          {resumen?.confirmationMaxHours != null && resumen.confirmationMaxHours > 0 && (
            <p className="text-sm text-gray-600 mt-4 text-center">
              Plazo de respuesta estimado: hasta {resumen.confirmationMaxHours} horas.
            </p>
          )}

          {/* Bloque Pago — sin Efectivo ni abonar al momento */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-1">Pago</p>
            <p className="text-sm text-gray-600">
              El pago se habilita únicamente si el profesional confirma la consulta. El cobro se realiza a través de Mercado Pago.
            </p>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {appointmentId && (
              <Button
                size="lg"
                className="w-full sm:w-auto font-semibold text-white bg-[#FF6600] hover:bg-[#E55F00]"
                style={{ fontFamily: "Inter, sans-serif" }}
                onClick={() => {
                  const base = `${window.location.origin}/zyta/${appointmentId}/estado`;
                  const url = calendarSlug ? `${base}?calendarSlug=${encodeURIComponent(calendarSlug)}` : base;
                  window.location.href = url;
                }}
              >
                Ver estado de mi Zyta
              </Button>
            )}
            <Button
              variant={appointmentId ? "outline" : "default"}
              size="lg"
              className="w-full sm:w-auto"
              style={
                !appointmentId
                  ? { fontFamily: "Inter, sans-serif", backgroundColor: "#FF6600" }
                  : { fontFamily: "Inter, sans-serif" }
              }
              onClick={handleGoBack}
            >
              Volver al inicio
            </Button>
          </div>

          {/* Soporte Zyta — reemplaza "Si tenés alguna consulta..." */}
          <p className="text-xs text-gray-500 text-center mt-6">
            Soporte Zyta: ayuda con turnos, acceso y pagos.
          </p>
        </div>
      </div>
    </div>
  );
}

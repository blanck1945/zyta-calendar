import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

/**
 * Página de estado de una Zyta (ruta /zyta/:id/estado).
 * "Volver al inicio" → siempre al calendario de esa Zyta (/{calendarSlug}), no a la landing.
 */
type ZytaEstado = "en_evaluacion" | "confirmada" | "rechazada";

const LANDING_URL = import.meta.env.VITE_LANDING_URL || "https://zyta-landing.vercel.app/";

function getBackendUrl(): string {
  return (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
}

function beStatusToEstado(status: string): ZytaEstado {
  if (status === "confirmed" || status === "completed") return "confirmada";
  if (status === "cancelled") return "rechazada";
  return "en_evaluacion";
}

export default function ZytaStatus() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const calendarSlugFromUrl = searchParams.get("calendarSlug");
  const calendarSlugFromStorage =
    typeof localStorage !== "undefined" ? localStorage.getItem("bookingCalendarSlug") : null;
  const calendarSlug = calendarSlugFromUrl || calendarSlugFromStorage;

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [estado, setEstado] = useState<ZytaEstado>("en_evaluacion");
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Fetchear el estado real del appointment
  useEffect(() => {
    if (!id) {
      setIsLoadingStatus(false);
      return;
    }
    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      setIsLoadingStatus(false);
      return;
    }
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${backendUrl}/appointments/public/${encodeURIComponent(id)}/status`);
        if (!cancelled && res.ok) {
          const data = await res.json() as { id: string; status: string };
          setEstado(beStatusToEstado(data.status));
        }
      } catch {
        // ignore, keep default "en_evaluacion"
      } finally {
        if (!cancelled) setIsLoadingStatus(false);
      }
    };

    void fetchStatus();

    // Polling cada 30 segundos para detectar confirmación en tiempo real
    const interval = setInterval(() => { void fetchStatus(); }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  const goToCalendar = (slug: string) => {
    window.location.href = `${window.location.origin}/${slug}`;
  };

  const handleGoBack = async () => {
    if (calendarSlug) {
      goToCalendar(calendarSlug);
      return;
    }
    if (!id) {
      window.location.href = LANDING_URL;
      return;
    }
    setIsRedirecting(true);
    try {
      const backendUrl = getBackendUrl();
      if (backendUrl) {
        const res = await fetch(
          `${backendUrl}/appointments/public/${encodeURIComponent(id)}/calendar-slug`
        );
        if (res.ok) {
          const data = (await res.json()) as { calendarSlug?: string };
          if (data.calendarSlug) {
            goToCalendar(data.calendarSlug);
            return;
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setIsRedirecting(false);
    }
    window.location.href = LANDING_URL;
  };

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
        <div
          className="rounded-[18px] border border-gray-200 bg-white p-6 shadow-xl"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {isLoadingStatus ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {estado === "en_evaluacion" && (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-amber-100/90 p-4">
                      <Clock className="h-12 w-12 text-amber-600" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 text-center">
                    Estado de tu Zyta
                  </h1>
                  <p className="text-base text-gray-600 text-center mt-2">
                    En evaluación
                  </p>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    El profesional está revisando tu consulta. Te avisaremos por email cuando esté confirmada y puedas realizar el pago.
                  </p>
                  {id && (
                    <p className="text-xs text-gray-400 text-center mt-4">
                      Referencia: {id}
                    </p>
                  )}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                      style={{ fontFamily: "Inter, sans-serif" }}
                      onClick={() => void handleGoBack()}
                      disabled={isRedirecting}
                    >
                      {isRedirecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Redirigiendo...
                        </>
                      ) : (
                        "Volver al inicio"
                      )}
                    </Button>
                  </div>
                </>
              )}

              {estado === "confirmada" && (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100/90 p-4">
                      <CheckCircle className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 text-center">
                    Confirmada – pagar ahora
                  </h1>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Tu consulta fue confirmada. Completá el pago para reservar tu turno.
                  </p>
                  {id && (
                    <p className="text-xs text-gray-400 text-center mt-4">
                      Referencia: {id}
                    </p>
                  )}
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                      style={{ fontFamily: "Inter, sans-serif" }}
                      onClick={() => void handleGoBack()}
                      disabled={isRedirecting}
                    >
                      {isRedirecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Redirigiendo...
                        </>
                      ) : (
                        "Volver al inicio"
                      )}
                    </Button>
                  </div>
                </>
              )}

              {estado === "rechazada" && (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-red-100/90 p-4">
                      <XCircle className="h-12 w-12 text-red-600" />
                    </div>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 text-center">
                    Rechazada
                  </h1>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    El profesional no pudo aceptar esta consulta. Podés volver al inicio o elegir otro horario.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto font-semibold text-white bg-[#FF6600] hover:bg-[#E55F00]"
                      style={{ fontFamily: "Inter, sans-serif" }}
                      onClick={() => void handleGoBack()}
                      disabled={isRedirecting}
                    >
                      {isRedirecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Redirigiendo...
                        </>
                      ) : (
                        "Volver al inicio"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </>
          )}

          <p className="text-xs text-gray-500 text-center mt-6">
            Soporte Zyta: ayuda con turnos, acceso y pagos.
          </p>
        </div>
      </div>
    </div>
  );
}

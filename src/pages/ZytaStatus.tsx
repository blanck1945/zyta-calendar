import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCreateMercadoPagoPreference } from "../hooks/useCreateMercadoPagoPreference";
import { useCreateGalioPayLink } from "../hooks/useCreateGalioPayLink";
import type { CalendarPayments } from "../hooks/useCalendarSchedule";
import PaymentMethodPicker from "../components/payment/PaymentMethodPicker";
import {
  pickDefaultPaymentMethod,
  hasSelectablePaymentMethods,
  type PaymentMethod,
} from "../components/payment/paymentMethodUtils";

/**
 * Página de estado de una Zyta (ruta /zyta/:id/estado).
 * "Volver al inicio" → siempre al calendario de esa Zyta (/{calendarSlug}), no a la landing.
 */
type ZytaEstado = "en_evaluacion" | "confirmada_pendiente_pago" | "confirmada" | "rechazada";

const LANDING_URL = import.meta.env.VITE_LANDING_URL || "https://zyta-landing.vercel.app/";

function getBackendUrl(): string {
  return (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
}

function normalizeStatus(status: string | undefined): string {
  if (status == null || status === "") return "";
  return String(status).trim().toLowerCase().replace(/[\s-]+/g, "_");
}

/** El BE indica explícitamente que el cobro ya se registró. */
function isPaidSignal(data: AppointmentPublicData): boolean {
  if (data.paymentReceived === true) return true;
  if (data.paidAt != null && String(data.paidAt).length > 0) return true;
  const ps = normalizeStatus(data.paymentStatus);
  if (ps === "paid" || ps === "completed" || ps === "succeeded" || ps === "received") {
    return true;
  }
  return false;
}

/**
 * Estados que suelen significar: profesional aceptó / turno listo, falta que pague el cliente.
 * (Nombres distintos a `confirmed_pending_payment` según BE.)
 */
const STATUS_AWAITING_CLIENT_PAYMENT = new Set([
  "confirmed_pending_payment",
  "confirmed_pending",
  "pending_payment",
  "awaiting_payment",
  "awaiting_client_payment",
  "payment_pending",
  "approved",
  "accepted",
  "ready_for_payment",
  "scheduled_pending_payment",
  "waiting_payment",
  "payment_required",
]);

const STATUS_IN_EVALUATION = new Set([
  "pending",
  "in_review",
  "under_review",
  "evaluation",
  "awaiting_review",
  "submitted",
  "new",
]);

/**
 * Combina respuesta del appointment y config pública del calendario.
 * Si el BE marca `confirmed` antes de registrar el pago, usamos `confirmCaseBeforePayment`
 * + métodos de pago del calendario para seguir mostrando la pantalla de cobro.
 */
function deriveEstado(
  data: AppointmentPublicData | null,
  calendarConfig: CalendarConfigState | null
): ZytaEstado {
  if (!data?.status) return "en_evaluacion";

  const s = normalizeStatus(data.status);

  if (
    s === "cancelled" ||
    s === "canceled" ||
    s === "rejected" ||
    s === "declined"
  ) {
    return "rechazada";
  }

  if (data.needsPayment === true) return "confirmada_pendiente_pago";

  const mustPayFlags =
    data.awaitingClientPayment === true ||
    data.paymentPending === true ||
    data.requiresClientPayment === true ||
    (s === "confirmed" && data.paymentReceived === false);

  if (mustPayFlags) return "confirmada_pendiente_pago";

  if (STATUS_AWAITING_CLIENT_PAYMENT.has(s)) return "confirmada_pendiente_pago";

  if (s === "confirmed" || s === "completed") {
    if (isPaidSignal(data)) return "confirmada";

    const pm = normalizeStatus(data.paymentMethod ?? "");
    const methodSaysUnpaid = ["pending", "unpaid", "none", "awaiting_payment", ""].includes(
      pm
    );

    if (
      calendarConfig != null &&
      hasSelectablePaymentMethods(calendarConfig.payments) &&
      !isPaidSignal(data)
    ) {
      if (calendarConfig.confirmCaseBeforePayment === true) {
        return "confirmada_pendiente_pago";
      }
      if (data.paymentMethod !== undefined && methodSaysUnpaid) {
        return "confirmada_pendiente_pago";
      }
    }

    return "confirmada";
  }

  if (STATUS_IN_EVALUATION.has(s)) return "en_evaluacion";

  return "en_evaluacion";
}

// Datos del appointment que vienen del endpoint público enriquecido
interface AppointmentPublicData {
  id: string;
  status: string;
  clientName: string;
  clientEmail: string;
  startTime: string;
  endTime?: string;
  calendarSlug?: string;
  /** Título público del calendario (GET /appointments/public/:id/status). */
  calendarTitle?: string | null;
  /** Enlace de reserva usado al agendar (modo con/sin pago previo). */
  entryLink?: {
    id: string;
    label: string | null;
    requiresPaymentBeforeConfirmation?: boolean | null;
  } | null;
  /** true = falta que el cliente pague (mostrar flujo de pago aunque status sea legacy). */
  awaitingClientPayment?: boolean;
  paymentPending?: boolean;
  requiresClientPayment?: boolean;
  /** false explícito: aún no se registró pago (útil si status viene como confirmed por error). */
  paymentReceived?: boolean;
  /** Si el BE lo envía, prioriza UI de pago. */
  needsPayment?: boolean;
  /** ISO u otro; si existe, asumimos cobro registrado junto con `confirmed`. */
  paidAt?: string;
  paymentStatus?: string;
  /** Ej. "mercadopago" tras cobrar; "pending" si el BE indica que falta pagar. */
  paymentMethod?: string;
}

function formatEntryLinkModeLine(data: AppointmentPublicData): string {
  if (data.entryLink == null) {
    return "Modo: reserva general (sin enlace por token)";
  }
  const { label, requiresPaymentBeforeConfirmation } = data.entryLink;
  const base = label?.trim() || "Enlace de reserva";
  if (requiresPaymentBeforeConfirmation === true) {
    return `Modo: ${base} · pago previo requerido`;
  }
  if (requiresPaymentBeforeConfirmation === false) {
    return `Modo: ${base} · sin pago previo obligatorio`;
  }
  return `Modo: ${base}`;
}

interface CalendarConfigState {
  amount: number;
  currency: string;
  payments: CalendarPayments;
  /** Viene de bookingSettings del calendario público. */
  confirmCaseBeforePayment?: boolean;
}

export default function ZytaStatus() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const calendarSlugFromUrl = searchParams.get("calendarSlug");
  /** Link desde email de confirmación (BE añade ?pay=1) para enfocar la sección de cobro en el calendario público. */
  const payFromEmail = searchParams.get("pay") === "1";
  const paymentSectionRef = useRef<HTMLDivElement>(null);
  const calendarSlugFromStorage =
    typeof localStorage !== "undefined" ? localStorage.getItem("bookingCalendarSlug") : null;

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [appointmentData, setAppointmentData] = useState<AppointmentPublicData | null>(null);
  const [calendarConfig, setCalendarConfig] = useState<CalendarConfigState | null>(null);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [transferProofFile, setTransferProofFile] = useState<File | null>(null);

  const createPreferenceMutation = useCreateMercadoPagoPreference();
  const createGalioPayLinkMutation = useCreateGalioPayLink();

  // calendarSlug: URL param > localStorage > campo del appointment
  const calendarSlug =
    calendarSlugFromUrl ||
    calendarSlugFromStorage ||
    appointmentData?.calendarSlug ||
    null;

  // Fetchear estado y datos del appointment
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
          const data = await res.json() as AppointmentPublicData;
          setAppointmentData(data);
        }
      } catch {
        // ignore, keep default "en_evaluacion"
      } finally {
        if (!cancelled) setIsLoadingStatus(false);
      }
    };

    void fetchStatus();

    const interval = setInterval(() => { void fetchStatus(); }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id]);

  const effectiveSlug =
    calendarSlugFromUrl ||
    calendarSlugFromStorage ||
    appointmentData?.calendarSlug ||
    null;

  // Sin slug: dejar de cargar solo cuando el status ya respondió (puede venir calendarSlug en el body)
  useEffect(() => {
    if (!effectiveSlug && !isLoadingStatus) {
      setIsLoadingCalendar(false);
    }
  }, [effectiveSlug, isLoadingStatus]);

  // Fetchear config del calendario (monto + métodos de pago completos)
  useEffect(() => {
    if (!effectiveSlug) {
      return;
    }

    const backendUrl = getBackendUrl();
    if (!backendUrl) {
      setIsLoadingCalendar(false);
      return;
    }

    let cancelled = false;
    setIsLoadingCalendar(true);

    const fetchCalendar = async () => {
      try {
        const res = await fetch(`${backendUrl}/calendars/public/${encodeURIComponent(effectiveSlug)}`);
        if (!cancelled && res.ok) {
          const data = await res.json();
          const rawAmount = data.amount;
          const amount =
            typeof rawAmount === "string" ? parseFloat(rawAmount)
            : typeof rawAmount === "number" ? rawAmount
            : 0;
          setCalendarConfig({
            amount: Number.isFinite(amount) ? amount : 0,
            currency: data.currency ?? "ARS",
            payments: data.payments ?? { enabled: [] },
            confirmCaseBeforePayment:
              data.bookingSettings?.confirmCaseBeforePayment === true,
          });
        } else if (!cancelled) {
          setCalendarConfig(null);
        }
      } catch {
        if (!cancelled) setCalendarConfig(null);
      } finally {
        if (!cancelled) setIsLoadingCalendar(false);
      }
    };

    void fetchCalendar();
    return () => {
      cancelled = true;
    };
  }, [effectiveSlug]);

  useEffect(() => {
    if (!calendarConfig) {
      setSelectedPaymentMethod(null);
      return;
    }
    setSelectedPaymentMethod(pickDefaultPaymentMethod(calendarConfig.payments));
    setTransferProofFile(null);
  }, [calendarConfig]);

  const estado: ZytaEstado = useMemo(
    () => deriveEstado(appointmentData, calendarConfig),
    [appointmentData, calendarConfig]
  );

  useEffect(() => {
    if (!payFromEmail) return;
    if (estado !== "confirmada_pendiente_pago") return;
    if (isLoadingCalendar || !calendarConfig) return;
    const t = window.setTimeout(() => {
      paymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 200);
    return () => window.clearTimeout(t);
  }, [payFromEmail, estado, isLoadingCalendar, calendarConfig]);

  const goToCalendar = (slug: string) => {
    window.location.href = `${window.location.origin}/${slug}`;
  };

  const handlePaymentMethodChange = (m: PaymentMethod) => {
    if (m !== "transfer") setTransferProofFile(null);
    setSelectedPaymentMethod(m);
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

  const handlePagarAhora = async () => {
    if (!calendarConfig || !calendarSlug || !id) {
      toast.error("No se pudo iniciar el pago. Recargá la página.");
      return;
    }
    const method = selectedPaymentMethod;
    if (!method) {
      toast.error("Elegí un método de pago.");
      return;
    }
    if (method === "transfer" && !transferProofFile) {
      toast.error("Subí el comprobante de transferencia para continuar.");
      return;
    }
    if (!hasSelectablePaymentMethods(calendarConfig.payments)) {
      toast.error("Este calendario no tiene métodos de pago configurados.");
      return;
    }

    setIsPaymentLoading(true);

    const baseUrl = window.location.origin;
    const lastBooking = {
      appointmentId: id,
      calendarSlug,
      clientName: appointmentData?.clientName ?? "",
      clientEmail: appointmentData?.clientEmail ?? "",
      startTime: appointmentData?.startTime ?? new Date().toISOString(),
      endTime: appointmentData?.endTime,
      paymentMethod: method,
      confirmedAt: new Date().toISOString(),
      skipCancellation: true,
    };

    try {
      if (method === "mercadopago") {
        const successParams = new URLSearchParams({
          calendarSlug,
          method: "mercadopago",
          ...(appointmentData?.clientName
            ? { name: encodeURIComponent(appointmentData.clientName) }
            : {}),
        });
        const successUrl = `${baseUrl}/payment/success?${successParams.toString()}`;
        const failureUrl = `${baseUrl}/payment/failure?calendarSlug=${encodeURIComponent(calendarSlug)}&appointmentId=${encodeURIComponent(id)}`;
        const pendingUrl = `${baseUrl}/payment/pending?calendarSlug=${encodeURIComponent(calendarSlug)}`;

        const data = await createPreferenceMutation.mutateAsync({
          calendarSlug,
          amount: calendarConfig.amount,
          currency: calendarConfig.currency,
          successUrl,
          failureUrl,
          pendingUrl,
        });
        localStorage.setItem("lastBooking", JSON.stringify(lastBooking));
        window.location.href = data.initPoint;

      } else if (method === "galiopay") {
        const successParams = new URLSearchParams({
          calendarSlug,
          method: "galiopay",
          ...(appointmentData?.clientName
            ? { name: encodeURIComponent(appointmentData.clientName) }
            : {}),
        });
        const successUrl = `${baseUrl}/payment/success?${successParams.toString()}`;
        const failureUrl = `${baseUrl}/payment/failure?calendarSlug=${encodeURIComponent(calendarSlug)}&appointmentId=${encodeURIComponent(id)}`;

        const data = await createGalioPayLinkMutation.mutateAsync({
          calendarSlug,
          amount: calendarConfig.amount,
          currency: calendarConfig.currency,
          successUrl,
          failureUrl,
          referenceId: id,
        });
        localStorage.setItem("lastBooking", JSON.stringify(lastBooking));
        window.location.href = data.checkoutUrl;

      } else {
        localStorage.setItem("lastBooking", JSON.stringify(lastBooking));
        const params = new URLSearchParams({
          calendarSlug,
          method,
          ...(appointmentData?.clientName
            ? { name: encodeURIComponent(appointmentData.clientName) }
            : {}),
        });
        window.location.href = `/payment/success?${params.toString()}`;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al procesar el pago.");
      setIsPaymentLoading(false);
    }
  };

  const hasMethods = calendarConfig
    ? hasSelectablePaymentMethods(calendarConfig.payments)
    : false;
  const needsTransferProof =
    selectedPaymentMethod === "transfer" && !transferProofFile;
  const isRealPayment =
    selectedPaymentMethod === "mercadopago" ||
    selectedPaymentMethod === "galiopay" ||
    selectedPaymentMethod === "transfer";
  const primaryLabel = isPaymentLoading
    ? "Procesando..."
    : isRealPayment
      ? "Pagar"
      : "Confirmar reserva";
  const canSubmitPayment =
    !!calendarConfig &&
    hasMethods &&
    !!selectedPaymentMethod &&
    !needsTransferProof &&
    !isLoadingCalendar;

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
      <div className="relative z-10 w-full max-w-xl">
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
              {appointmentData && (
                <div className="mb-4 space-y-1 text-center border-b border-gray-100 pb-4">
                  {(appointmentData.calendarTitle || appointmentData.calendarSlug) && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-900">Calendario: </span>
                      {appointmentData.calendarTitle?.trim() ||
                        appointmentData.calendarSlug}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">{formatEntryLinkModeLine(appointmentData)}</p>
                </div>
              )}
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
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirigiendo...</>
                      ) : "Volver al inicio"}
                    </Button>
                  </div>
                </>
              )}

              {estado === "confirmada_pendiente_pago" && (
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

                  {isLoadingCalendar && (
                    <div className="flex justify-center items-center gap-2 py-6 text-sm text-gray-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Cargando métodos de pago…
                    </div>
                  )}

                  {!isLoadingCalendar && calendarConfig && (
                    <div ref={paymentSectionRef} className="scroll-mt-6">
                      <Card
                        className="p-4 border border-gray-100 mb-4 mt-4"
                        style={{ borderRadius: "var(--style-border-radius, 0.75rem)" }}
                      >
                        <p className="text-sm font-semibold text-gray-900 mb-1">Valor a abonar</p>
                        <p className="text-base text-gray-700">
                          {calendarConfig.currency ?? "$"}{" "}
                          {calendarConfig.amount.toLocaleString("es-AR")}
                        </p>
                      </Card>

                      <PaymentMethodPicker
                        compact
                        payments={calendarConfig.payments}
                        paymentMethod={selectedPaymentMethod}
                        onPaymentMethodChange={handlePaymentMethodChange}
                        transferProofFile={transferProofFile}
                        onTransferProofChange={setTransferProofFile}
                      />

                      {needsTransferProof && (
                        <p className="mb-3 text-sm text-gray-500">
                          Subí el comprobante de transferencia para poder continuar.
                        </p>
                      )}
                    </div>
                  )}

                  {!isLoadingCalendar && !calendarConfig && effectiveSlug && (
                    <p className="text-sm text-center text-gray-600 mt-4">
                      No pudimos cargar los métodos de pago. Recargá la página o volvé al inicio e intentá de nuevo.
                    </p>
                  )}

                  {!isLoadingCalendar && !calendarConfig && !effectiveSlug && (
                    <p className="text-sm text-center text-gray-600 mt-4">
                      Falta el enlace al calendario. Abrí el link del email o contactá al profesional.
                    </p>
                  )}

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto font-semibold text-white"
                      style={{ backgroundColor: "#FF6600", fontFamily: "Inter, sans-serif" }}
                      onClick={() => void handlePagarAhora()}
                      disabled={isPaymentLoading || !canSubmitPayment}
                    >
                      {isPaymentLoading ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Procesando...</>
                      ) : primaryLabel}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto"
                      style={{ fontFamily: "Inter, sans-serif" }}
                      onClick={() => void handleGoBack()}
                      disabled={isRedirecting || isPaymentLoading}
                    >
                      {isRedirecting ? (
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirigiendo...</>
                      ) : "Volver al inicio"}
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
                    Confirmada
                  </h1>
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Tu consulta está confirmada y el pago fue recibido.
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
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirigiendo...</>
                      ) : "Volver al inicio"}
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
                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Redirigiendo...</>
                      ) : "Volver al inicio"}
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

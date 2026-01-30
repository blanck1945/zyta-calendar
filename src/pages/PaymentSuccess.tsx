import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { CheckCircle, Calendar, Clock, User, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

interface BookingData {
  appointmentId: string;
  calendarSlug: string;
  clientName: string;
  clientEmail: string;
  startTime: string;
  endTime?: string;
  paymentMethod: string;
  confirmedAt: string;
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const calendarSlug = searchParams.get("calendarSlug");
  const paymentMethod = searchParams.get("method");
  const clientName = searchParams.get("name");
  
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    // Cargar datos de la reserva desde localStorage
    const savedBooking = localStorage.getItem("lastBooking");
    if (savedBooking) {
      try {
        const data = JSON.parse(savedBooking);
        setBookingData(data);
        // Limpiar después de cargar
        localStorage.removeItem("lastBooking");
      } catch (err) {
        console.error("Error al parsear booking data:", err);
      }
    }
  }, []);

  const handleGoBack = () => {
    // Redirigir al calendario o a la landing
    if (calendarSlug) {
      window.location.href = `/${calendarSlug}`;
    } else {
      const landingUrl = import.meta.env.VITE_LANDING_URL || "https://zyta-landing.vercel.app/";
      window.location.href = landingUrl;
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      mercadopago: "Mercado Pago",
      transfer: "Transferencia bancaria",
      cash: "Efectivo",
      coordinar: "A coordinar",
    };
    return labels[method] || method;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {paymentMethod === "mercadopago" ? "¡Pago Exitoso!" : "¡Reserva Confirmada!"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {paymentMethod === "mercadopago"
              ? "Tu pago se ha procesado correctamente"
              : "Tu reserva ha sido registrada exitosamente"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bookingData && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Cliente</p>
                  <p className="text-sm text-muted-foreground">{bookingData.clientName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">{bookingData.clientEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Fecha</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {formatDate(bookingData.startTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-accent/50 rounded-lg">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Horario</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(bookingData.startTime)}
                    {bookingData.endTime && ` - ${formatTime(bookingData.endTime)}`}
                  </p>
                </div>
              </div>

              {paymentMethod && paymentMethod !== "mercadopago" && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Método de pago: {getPaymentMethodLabel(paymentMethod)}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {paymentMethod === "coordinar" &&
                      "El profesional se pondrá en contacto contigo para coordinar los detalles del pago."}
                    {paymentMethod === "transfer" &&
                      "Recibirás un email con los datos bancarios para realizar la transferencia."}
                    {paymentMethod === "cash" &&
                      "Podrás abonar en efectivo al momento de la cita."}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="bg-accent rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              {clientName ? `¡Gracias ${decodeURIComponent(clientName)}!` : "¡Gracias!"}{" "}
              Recibirás un email de confirmación en breve.
            </p>
            <p className="text-sm text-muted-foreground">
              Si tienes alguna consulta, no dudes en contactarnos.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleGoBack} size="lg" className="w-full sm:w-auto">
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


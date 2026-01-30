import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function PaymentFailure() {
  const [searchParams] = useSearchParams();
  const calendarSlug = searchParams.get("calendarSlug");
  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  useEffect(() => {
    // Opcional: Aquí podrías registrar el error o enviar información al backend
    if (paymentId || status) {
      console.log("Payment failure details:", { paymentId, status });
    }
  }, [paymentId, status]);

  const handleRetry = () => {
    // Redirigir al calendario o a la landing
    if (calendarSlug) {
      window.location.href = `/${calendarSlug}`;
    } else {
      const landingUrl = import.meta.env.VITE_LANDING_URL || "https://zyta-landing.vercel.app/";
      window.location.href = landingUrl;
    }
  };

  const handleGoHome = () => {
    const landingUrl = import.meta.env.VITE_LANDING_URL || "https://zyta-landing.vercel.app/";
    window.location.href = landingUrl;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 p-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Pago Fallido
          </CardTitle>
          <CardDescription className="text-base mt-2">
            No pudimos procesar tu pago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Hubo un problema al procesar tu pago. Por favor, verifica los datos de tu tarjeta o intenta con otro método de pago.
            </p>
            <p className="text-sm text-muted-foreground">
              Si el problema persiste, contacta con el soporte.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={handleRetry} size="lg" className="w-full sm:w-auto">
            Intentar nuevamente
          </Button>
          <Button 
            onClick={handleGoHome} 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto"
          >
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


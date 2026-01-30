import { useEffect } from "react";
import { useSearchParams } from "react-router";
import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function PaymentPending() {
  const [searchParams] = useSearchParams();
  const calendarSlug = searchParams.get("calendarSlug");

  useEffect(() => {
    // Opcional: Aquí podrías configurar un polling para verificar el estado del pago
    // o esperar a que el webhook actualice el estado
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-yellow-100 p-4">
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Pago Pendiente
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Estamos procesando tu pago
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Tu pago está siendo procesado. Esto puede tardar unos minutos.
            </p>
            <p className="text-sm text-muted-foreground">
              Te notificaremos por email una vez que el pago sea confirmado.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleGoBack} size="lg" variant="outline" className="w-full sm:w-auto">
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


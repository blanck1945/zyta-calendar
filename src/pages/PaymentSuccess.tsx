import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const calendarSlug = searchParams.get("calendarSlug");

  useEffect(() => {
    // Opcional: Aquí podrías hacer una llamada al backend para verificar el estado del pago
    // o actualizar el estado de la reserva
  }, []);

  const handleGoBack = () => {
    if (calendarSlug) {
      navigate(`/${calendarSlug}`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            ¡Pago Exitoso!
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Tu pago se ha procesado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent rounded-lg p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Tu reserva ha sido confirmada y recibirás un email de confirmación en breve.
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


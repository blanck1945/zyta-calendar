import { useParams } from "react-router";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Clock } from "lucide-react";

/**
 * Página de estado de una Zyta (ruta /zyta/:id/estado).
 * Estados según spec: PENDING_REVIEW, APPROVED, REJECTED.
 * MVP: muestra "En evaluación" con enlace Volver al inicio.
 * Más adelante: GET appointment por id y mostrar estado + CTA según corresponda.
 */
export default function ZytaStatus() {
  const { id } = useParams<{ id: string }>();

  const handleGoBack = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Clock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Estado de tu Zyta
          </CardTitle>
          <CardDescription className="text-base mt-2">
            En evaluación
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            El profesional está revisando tu consulta. Te avisaremos por email cuando esté confirmada y puedas realizar el pago.
          </p>
          {id && (
            <p className="text-xs text-muted-foreground text-center">
              Referencia: {id}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <Button onClick={handleGoBack} size="lg" className="w-full sm:w-auto">
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

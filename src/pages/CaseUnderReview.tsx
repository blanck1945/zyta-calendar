import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Clock, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCalendarSchedule } from "../hooks/useCalendarSchedule";

export default function CaseUnderReview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const calendarSlug = searchParams.get("calendarSlug");
  const userNameParam = searchParams.get("userName");
  const userName = userNameParam ? decodeURIComponent(userNameParam) : null;
  const { schedule } = useCalendarSchedule();
  
  // Obtener slug del calendario para mostrar como profesional/estudio
  const professionalSlug = schedule?.calendarSlug || calendarSlug || null;

  useEffect(() => {
    // Opcional: Aquí podrías hacer una llamada al backend para verificar el estado del caso
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
            <div className="rounded-full bg-primary/10 p-4">
              <Clock className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Caso en Análisis
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Estamos revisando tu solicitud
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent rounded-lg p-4 border border-border">
            {userName && (
              <p className="text-base font-medium text-foreground mb-3">
                {userName}, ya casi está reservada tu{" "}
                <span className="text-primary font-semibold">Zyta</span>
              </p>
            )}
            {professionalSlug && (
              <div className="mb-3 pb-3 border-b border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                  Profesional/Estudio
                </p>
                <p className="text-sm font-medium text-foreground">{professionalSlug}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground mb-2">
              El profesional/estudio está analizando tu caso y te avisará cuando termine.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Recibirás una notificación por email cuando tu solicitud sea revisada y confirmada.
            </p>
            {schedule?.bookingSettings?.confirmationMinHours && schedule?.bookingSettings?.confirmationMaxHours && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-foreground leading-relaxed">
                      El tiempo de confirmación puede tardar entre{" "}
                      <span className="font-bold text-primary text-base">
                        {schedule.bookingSettings.confirmationMinHours}
                      </span>
                      {" y "}
                      <span className="font-bold text-primary text-base">
                        {schedule.bookingSettings.confirmationMaxHours}
                      </span>
                      {" horas"}
                    </p>
                  </div>
                </div>
              </div>
            )}
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


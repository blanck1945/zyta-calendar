import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { Info, User, Mail, Phone, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCalendarSchedule } from "../hooks/useCalendarSchedule";

interface FormData {
  name?: string;
  email?: string;
  phone?: string;
  query?: string;
  customFields?: Record<string, string>;
}

export default function CaseUnderReview() {
  const [searchParams] = useSearchParams();
  const calendarSlug = searchParams.get("calendarSlug");
  const userNameParam = searchParams.get("userName");
  const userName = userNameParam ? decodeURIComponent(userNameParam) : null;
  const appointmentId = searchParams.get("appointmentId");
  const navigate = useNavigate();
  const { schedule } = useCalendarSchedule();
  const [formData, setFormData] = useState<FormData | null>(null);
  
  // Obtener slug del calendario para mostrar como profesional/estudio
  const professionalSlug = schedule?.calendarSlug || calendarSlug || null;

  useEffect(() => {
    // Leer valores del formulario desde localStorage
    const savedFormData = localStorage.getItem("bookingFormData");
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData));
        // Limpiar localStorage después de leer
        localStorage.removeItem("bookingFormData");
      } catch (e) {
        console.error("Error al leer datos del formulario:", e);
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <CheckCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Zyta enviada
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Quedó pendiente de confirmación por el profesional.
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-2">
            Te avisaremos por email cuando esté confirmada y puedas realizar el pago.
          </p>
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
              El profesional revisará tu consulta y te avisará cuando la confirme.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Recibirás un email cuando esté lista para pagar.
            </p>
            {/* Bloque Pago (informativo) */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Pago
              </p>
              <p className="text-sm text-muted-foreground">
                El pago se habilita únicamente si el profesional confirma la consulta. El cobro se realiza a través de Mercado Pago.
              </p>
            </div>
            
            {/* Mostrar campos del formulario */}
            {schedule?.bookingForm && formData && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Información de tu solicitud
                </p>
                <div className="space-y-3">
                  {/* Campo Nombre */}
                  {schedule.bookingForm.fields?.name?.enabled && formData.name && (
                    <div className="flex items-start gap-2">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Nombre</p>
                        <p className="text-sm text-foreground">{formData.name}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Campo Email */}
                  {schedule.bookingForm.fields?.email?.enabled && formData.email && (
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Email</p>
                        <p className="text-sm text-foreground">{formData.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Campo Teléfono */}
                  {schedule.bookingForm.fields?.phone?.enabled && formData.phone && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Teléfono</p>
                        <p className="text-sm text-foreground">{formData.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Campo Notas/Consulta */}
                  {schedule.bookingForm.fields?.notes?.enabled && formData.query && (
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">Consulta</p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">{formData.query}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Custom Fields */}
                  {schedule.bookingForm.customFields && schedule.bookingForm.customFields.length > 0 && (
                    <>
                      {schedule.bookingForm.customFields
                        .filter(field => field.enabled)
                        .map((field) => {
                          const fieldValue = formData.customFields?.[field.id];
                          if (!fieldValue) return null;
                          
                          return (
                            <div key={field.id} className="flex items-start gap-2">
                              <div className="h-4 w-4 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-muted-foreground mb-0.5">{field.label}</p>
                                <p className="text-sm text-foreground">{fieldValue}</p>
                              </div>
                            </div>
                          );
                        })}
                    </>
                  )}
                </div>
              </div>
            )}
            {schedule?.bookingSettings?.confirmationMinHours && schedule?.bookingSettings?.confirmationMaxHours && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
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
        <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center">
          {appointmentId && (
            <Button
              size="lg"
              className="w-full sm:w-auto font-semibold"
              onClick={() => navigate(`/zyta/${appointmentId}/estado`)}
            >
              Ver estado de mi Zyta
            </Button>
          )}
          <Button variant={appointmentId ? "outline" : "default"} onClick={handleGoBack} size="lg" className="w-full sm:w-auto">
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}


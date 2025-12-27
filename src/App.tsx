// src/App.tsx
import { useMemo, useState, useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { useYourIdAuth } from "./sdk/useYourIDAuth";
import KairoStepPayment, {
  type PaymentMethod,
} from "./components/steps/KairoStepPayment";
import KairoStepForm from "./components/steps/KairoStepForm";
import KairoStepSchedule, {
  type TimeSlot,
  type TimeSlotVariant,
} from "./components/steps/KairoStepSchedule";
import type { CalendarValue } from "./components/KairoCalendar";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { useTheme } from "./contexts/ThemeContext";
import { useProfessionalId } from "./utils/useProfessionalId";
import { useCalendarSchedule, type DayOfWeek, type TimeRange } from "./hooks/useCalendarSchedule";
import type { ThemeName, ExtraThemeName } from "./themes";
import { styleVariants, type StyleVariantName, STYLE_VARIANT_NAMES } from "./utils/styleVariants";

function App() {
  const { setThemeFromCalendar } = useTheme();
  const professionalId = useProfessionalId();
  const { schedule, loading: scheduleLoading, error: scheduleError } = useCalendarSchedule();
  
  // Inicializar variante de estilo al cargar la app
  useEffect(() => {
    const saved = localStorage.getItem("kairo-style-variant") as StyleVariantName;
    const variantName = saved && STYLE_VARIANT_NAMES.includes(saved) ? saved : "default";
    const variant = styleVariants[variantName];
    const root = document.documentElement;
    
    // Aplicar estilos de texto como variables CSS
    root.style.setProperty("--style-title-size", variant.textStyles.titleSize);
    root.style.setProperty("--style-title-weight", variant.textStyles.titleWeight);
    root.style.setProperty("--style-subtitle-size", variant.textStyles.subtitleSize);
    root.style.setProperty("--style-subtitle-weight", variant.textStyles.subtitleWeight);
    root.style.setProperty("--style-body-size", variant.textStyles.bodySize);
    root.style.setProperty("--style-body-weight", variant.textStyles.bodyWeight);
    root.style.setProperty("--style-button-size", variant.textStyles.buttonSize);
    root.style.setProperty("--style-button-weight", variant.textStyles.buttonWeight);
    root.style.setProperty("--style-letter-spacing", variant.textStyles.letterSpacing);
    root.style.setProperty("--style-line-height", variant.textStyles.lineHeight);
    
    // Aplicar estilos de números
    root.style.setProperty("--style-number-variant", variant.numberStyles.fontVariant);
    root.style.setProperty("--style-number-size", variant.numberStyles.size);
    root.style.setProperty("--style-number-weight", variant.numberStyles.weight);
    
    // Aplicar estilos de layout
    root.style.setProperty("--style-container-padding", variant.layout.containerPadding);
    root.style.setProperty("--style-component-gap", variant.layout.componentGap);
    root.style.setProperty("--style-border-radius", variant.layout.borderRadius);
    root.style.setProperty("--style-card-padding", variant.layout.cardPadding);
    root.style.setProperty("--style-spacing", variant.layout.spacing);
    
    root.setAttribute("data-style-variant", variantName);
  }, []); // Solo al montar
  
  // Escuchar cambios en las variables CSS desde el ThemeSwitcher
  useEffect(() => {
    const handleStyleVariantChange = (e: Event) => {
      const customEvent = e as CustomEvent<StyleVariantName>;
      if (customEvent.detail) {
        const variant = styleVariants[customEvent.detail];
        const root = document.documentElement;
        
        // Aplicar todas las variables CSS
        root.style.setProperty("--style-title-size", variant.textStyles.titleSize);
        root.style.setProperty("--style-title-weight", variant.textStyles.titleWeight);
        root.style.setProperty("--style-subtitle-size", variant.textStyles.subtitleSize);
        root.style.setProperty("--style-subtitle-weight", variant.textStyles.subtitleWeight);
        root.style.setProperty("--style-body-size", variant.textStyles.bodySize);
        root.style.setProperty("--style-body-weight", variant.textStyles.bodyWeight);
        root.style.setProperty("--style-button-size", variant.textStyles.buttonSize);
        root.style.setProperty("--style-button-weight", variant.textStyles.buttonWeight);
        root.style.setProperty("--style-letter-spacing", variant.textStyles.letterSpacing);
        root.style.setProperty("--style-line-height", variant.textStyles.lineHeight);
        root.style.setProperty("--style-number-variant", variant.numberStyles.fontVariant);
        root.style.setProperty("--style-number-size", variant.numberStyles.size);
        root.style.setProperty("--style-number-weight", variant.numberStyles.weight);
        root.style.setProperty("--style-container-padding", variant.layout.containerPadding);
        root.style.setProperty("--style-component-gap", variant.layout.componentGap);
        root.style.setProperty("--style-border-radius", variant.layout.borderRadius);
        root.style.setProperty("--style-card-padding", variant.layout.cardPadding);
        root.style.setProperty("--style-spacing", variant.layout.spacing);
        root.setAttribute("data-style-variant", customEvent.detail);
      }
    };
    
    window.addEventListener("styleVariantChanged", handleStyleVariantChange);
    return () => {
      window.removeEventListener("styleVariantChanged", handleStyleVariantChange);
    };
  }, []);
  
  // Estado para la variante de visualización de horarios
  const [timeSlotVariant, setTimeSlotVariant] = useState<TimeSlotVariant>(() => {
    const saved = localStorage.getItem("kairo-time-slot-variant") as TimeSlotVariant;
    return saved && ["grid", "list", "timeline"].includes(saved) ? saved : "grid";
  });

  // Escuchar cambios desde el ThemeSwitcher y cambios en localStorage
  useEffect(() => {
    const handleVariantChange = (e: Event) => {
      const customEvent = e as CustomEvent<TimeSlotVariant>;
      if (customEvent.detail) {
        setTimeSlotVariant(customEvent.detail);
      }
    };
    
    // Escuchar evento personalizado
    window.addEventListener("timeSlotVariantChanged", handleVariantChange);
    
    // También escuchar cambios en localStorage (por si se cambia desde otra pestaña)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "kairo-time-slot-variant" && e.newValue) {
        const variant = e.newValue as TimeSlotVariant;
        if (["grid", "list", "timeline"].includes(variant)) {
          setTimeSlotVariant(variant);
        }
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("timeSlotVariantChanged", handleVariantChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  // También verificar localStorage periódicamente (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      const saved = localStorage.getItem("kairo-time-slot-variant") as TimeSlotVariant;
      if (saved && ["grid", "list", "timeline"].includes(saved) && saved !== timeSlotVariant) {
        setTimeSlotVariant(saved);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, [timeSlotVariant]);
  
  useYourIdAuth({
    applicationBaseUrl: import.meta.env.VITE_APPLICATION_URL,
    yourIdLoginUrl: import.meta.env.VITE_YOUR_ID_LOGIN_URL,
    env: import.meta.env.VITE_ENV, // "dev" | "prod"
  });

  // Aplicar el tema del calendario cuando se carga el schedule (solo la primera vez)
  const hasAppliedCalendarTheme = useRef(false);
  useEffect(() => {
    if (schedule?.theme && !hasAppliedCalendarTheme.current) {
      // Validar que el tema sea uno de los temas válidos (originales o extra)
      const validThemes: readonly (ThemeName | ExtraThemeName)[] = [
        "violeta", "calido", "metalico", "verde", "rosa",
        "violeta-rosa", "verde-calido", "metalico-violeta", "rosa-verde",
        "calido-metalico", "violeta-verde", "rosa-metalico", "verde-rosa"
      ];
      const calendarTheme = schedule.theme as ThemeName | ExtraThemeName;
      if (validThemes.includes(calendarTheme)) {
        // Aplicar el tema del calendario sin marcar el flag de usuario
        setThemeFromCalendar(calendarTheme);
        hasAppliedCalendarTheme.current = true;
      }
    }
  }, [schedule?.theme]);

  // Mostrar warning en consola si no hay professionalId (solo en dev)
  useEffect(() => {
    if (import.meta.env.VITE_ENV === "dev" && !professionalId) {
      console.warn(
        "⚠️ No se encontró professionalId. Opciones:\n" +
        "1. URL: /calendar/:professionalId\n" +
        "2. Query: ?professionalId=xxx\n" +
        "3. Env: VITE_PROFESSIONAL_ID=xxx"
      );
    }
  }, [professionalId]);

  // 🔹 1 = fecha/horario, 2 = formulario, 3 = pago
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: fecha + horario
  const [value, setValue] = useState<CalendarValue>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ hour: number; minute: number } | null>(null);
  const hasAutoSelectedRef = useRef(false);
  
  // Seleccionar automáticamente el primer día disponible cuando se carga el schedule
  useEffect(() => {
    if (!schedule || scheduleLoading || hasAutoSelectedRef.current) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Buscar el primer día disponible que tenga horarios
    let firstAvailableDate: Date | null = null;
    
    // Mapeo de días de la semana: 0 = domingo, 1 = lunes, etc.
    const dayMap: Record<number, DayOfWeek> = {
      0: "sun",
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thu",
      5: "fri",
      6: "sat",
    };
    
    // Buscar en los próximos 30 días
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      
      const dayOfWeek = checkDate.getDay();
      const dayKey = dayMap[dayOfWeek];
      
      if (!dayKey) continue;
      
      // Verificar si el día está habilitado y tiene horarios
      if (
        schedule.enabledDays.includes(dayKey) &&
        schedule.byDay[dayKey] &&
        schedule.byDay[dayKey].length > 0
      ) {
        firstAvailableDate = checkDate;
        break;
      }
    }
    
    // Si encontramos un día disponible, seleccionarlo
    if (firstAvailableDate) {
      setValue(firstAvailableDate);
      hasAutoSelectedRef.current = true;
    }
  }, [schedule, scheduleLoading]);

  const selectedDate = useMemo(() => {
    if (!value) return null;
    if (Array.isArray(value)) return null;
    return value;
  }, [value]);

  // Generar timeSlots basados en el schedule del calendario
  const timeSlots: TimeSlot[] = useMemo(() => {
    if (!selectedDate || !schedule) return [];
    
    // Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
    const dayOfWeek = selectedDate.getDay();
    const dayMap: Record<number, DayOfWeek> = {
      0: "sun",
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thu",
      5: "fri",
      6: "sat",
    };
    const dayKey = dayMap[dayOfWeek];
    if (!dayKey) return [];
    
    // Verificar si el día está habilitado
    if (!schedule.enabledDays.includes(dayKey)) {
      return [];
    }
    
    // Obtener horarios del día desde byDay
    const dayRanges = schedule.byDay[dayKey] || [];
    if (dayRanges.length === 0) {
      return [];
    }
    
    // Generar slots basados en los rangos horarios y slotMinutes
    const slots: TimeSlot[] = [];
    
    dayRanges.forEach((range: TimeRange) => {
      const [startHour, startMinute] = range.start.split(":").map(Number);
      const [endHour, endMinute] = range.end.split(":").map(Number);
      
      const startTime = startHour * 60 + startMinute; // minutos desde medianoche
      const endTime = endHour * 60 + endMinute;
      const slotDuration = schedule.slotMinutes;
      
      // Generar slots cada slotMinutes minutos
      for (let time = startTime; time < endTime; time += slotDuration) {
        const slotHour = Math.floor(time / 60);
        const slotMinute = time % 60;
        const nextTime = time + slotDuration;
        const nextHour = Math.floor(nextTime / 60);
        const nextMinute = nextTime % 60;
        
        // No crear slot si excede el rango
        if (nextTime > endTime) break;
        
        slots.push({
          hour: slotHour,
          minute: slotMinute,
          label: `${slotHour.toString().padStart(2, "0")}:${slotMinute.toString().padStart(2, "0")} - ${nextHour.toString().padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}`,
        });
      }
    });
    
    return slots;
  }, [selectedDate, schedule]);

  const formattedSelection = useMemo(() => {
    if (!selectedDate) return "Ninguna fecha seleccionada";
    return selectedDate.toLocaleDateString();
  }, [selectedDate]);

  const canContinue = selectedDate !== null && selectedSlot !== null;

  const meetingStart = useMemo(() => {
    if (!selectedDate || !selectedSlot) return null;
    const start = new Date(selectedDate);
    start.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0);
    return start;
  }, [selectedDate, selectedSlot]);

  const meetingEnd = useMemo(() => {
    if (!meetingStart || !schedule) return null;
    const end = new Date(meetingStart);
    end.setMinutes(end.getMinutes() + schedule.slotMinutes);
    return end;
  }, [meetingStart, schedule]);

  // Step 2: formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [wantsFile, setWantsFile] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Step 3: pago
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(
    null
  );

  const handleContinueToForm = () => {
    if (!canContinue) return;
    setStep(2);
  };

  const handleBackToCalendar = () => {
    setStep(1);
  };

  const handleContinueToPayment = () => {
    setStep(3);
  };

  const handleBackToForm = () => {
    setStep(2);
  };

  const handleConfirmReservation = async () => {
    if (!meetingStart || !meetingEnd || !paymentMethod) return;

    if (paymentMethod === "mercado_pago") {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/mercadopago/create-preference`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: "Meet 1 hora",
              price: 5000,
              quantity: 1,
              reservationId: "temp-123", // esto luego será real
            }),
          }
        );

        const data = await response.json();

        if (!data.initPoint) {
          console.error("Backend no devolvió initPoint", data);
          return;
        }

        // 🚀 REDIRECCIÓN A MERCADO PAGO
        window.location.href = data.initPoint;
      } catch (err) {
        console.error("Error al crear preferencia MP", err);
      }
    }

    if (paymentMethod === "transferencia") {
      alert("Acá mostrarías los datos bancarios.");
    }
  };

  // Frase personalizada para el step 1 (con default)
  // Prioridad: schedule.calendarTitle > VITE_STEP1_TITLE > "Agenda Kairo"
  const step1Title = useMemo(() => {
    if (schedule?.calendarTitle) return schedule.calendarTitle;
    return import.meta.env.VITE_STEP1_TITLE || "Agenda Kairo";
  }, [schedule?.calendarTitle]);

  const step1Subtitle = useMemo(() => {
    if (schedule?.calendarSubtitle) return schedule.calendarSubtitle;
    return import.meta.env.VITE_STEP1_SUBTITLE || "Elegí una fecha desde hoy en adelante para programar tu meet luego del pago.";
  }, [schedule?.calendarSubtitle]);

  // Títulos y subtítulos dinámicos
  const stepTitles = useMemo(() => {
    switch (step) {
      case 1:
        return {
          title: step1Title,
          subtitle: step1Subtitle,
        };
      case 2:
        return {
          title: name
            ? `Hola, ${name}!`
            : "Datos del meet",
          subtitle: name
            ? "Completá los datos restantes para continuar"
            : "Completá tus datos para continuar con el modo de pago.",
        };
      case 3:
        return {
          title: paymentMethod
            ? paymentMethod === "mercado_pago"
              ? "Pago con Mercado Pago"
              : "Transferencia bancaria"
            : "Modo de pago",
          subtitle: paymentMethod
            ? "Confirmá tu reserva para finalizar"
            : "Elegí cómo querés completar el pago para confirmar tu meet.",
        };
      default:
        return {
          title: step1Title,
          subtitle: step1Subtitle,
        };
    }
  }, [step, name, paymentMethod, step1Title, step1Subtitle]);

  return (
    <div className="min-h-screen bg-background">
      {/* Stepper mejorado - posición fixed fuera del flujo principal */}
      {/* Comentado temporalmente - componente no eliminado */}
      {false && (
      <div 
        className="fixed top-4 right-4 z-50"
        style={{
          maxWidth: "calc(100vw - 2rem)",
        }}
      >
        <div 
          className="flex items-center flex-wrap gap-2"
          style={{
            gap: "var(--style-component-gap, 0.5rem)",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            borderRadius: "9999px",
            padding: "0.5rem",
            backgroundColor: "var(--background)",
          }}
        >
          <div
            className={`flex items-center font-medium transition-all ${
              step === 1
                ? "bg-primary text-primary-foreground"
                : step > 1
                ? ""
                : "bg-muted text-muted-foreground"
            }`}
            style={{
              gap: "var(--style-component-gap, 0.5rem)",
              padding: "var(--style-card-padding, 0.5rem 0.75rem)",
              borderRadius: "9999px",
              ...(step > 1 && {
                backgroundColor: "var(--color-primary-100)",
                color: "var(--color-primary-700)",
              }),
            }}
          >
            <span
              className={`rounded-full flex items-center justify-center font-bold ${
                step === 1
                  ? "bg-primary-foreground text-primary"
                  : step > 1
                  ? ""
                  : "bg-background text-foreground"
              }`}
              style={{
                width: "1.5rem",
                height: "1.5rem",
                fontSize: "var(--style-body-size, 0.75rem)",
                ...(step > 1 && {
                  backgroundColor: "var(--color-primary-600)",
                  color: "white",
                }),
              }}
            >
              {step > 1 ? (
                <Check size={14} strokeWidth={3} />
              ) : (
                "1"
              )}
            </span>
            <span
              className="hidden md:inline"
              style={{
                fontSize: "var(--style-body-size, 0.75rem)",
                fontWeight: "var(--style-body-weight, 500)",
              }}
            >
              Fecha y horario
            </span>
          </div>
          <div
            className={`flex items-center font-medium transition-all ${
              step === 2
                ? "bg-primary text-primary-foreground"
                : step > 2
                ? ""
                : "bg-muted text-muted-foreground"
            }`}
            style={{
              gap: "var(--style-component-gap, 0.5rem)",
              padding: "var(--style-card-padding, 0.5rem 0.75rem)",
              borderRadius: "9999px",
              ...(step > 2 && {
                backgroundColor: "var(--color-primary-100)",
                color: "var(--color-primary-700)",
              }),
            }}
          >
            <span
              className={`rounded-full flex items-center justify-center font-bold ${
                step === 2
                  ? "bg-primary-foreground text-primary"
                  : step > 2
                  ? ""
                  : "bg-background text-foreground"
              }`}
              style={{
                width: "1.5rem",
                height: "1.5rem",
                fontSize: "var(--style-body-size, 0.75rem)",
                ...(step > 2 && {
                  backgroundColor: "var(--color-primary-600)",
                  color: "white",
                }),
              }}
            >
              {step > 2 ? (
                <Check size={14} strokeWidth={3} />
              ) : (
                "2"
              )}
            </span>
            <span
              className="hidden md:inline"
              style={{
                fontSize: "var(--style-body-size, 0.75rem)",
                fontWeight: "var(--style-body-weight, 500)",
              }}
            >
              Datos del meet
            </span>
          </div>
          <div
            className={`flex items-center font-medium transition-all ${
              step === 3
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
            style={{
              gap: "var(--style-component-gap, 0.5rem)",
              padding: "var(--style-card-padding, 0.5rem 0.75rem)",
              borderRadius: "9999px",
            }}
          >
            <span
              className={`rounded-full flex items-center justify-center font-bold ${
                step === 3
                  ? "bg-primary-foreground text-primary"
                  : "bg-background text-foreground"
              }`}
              style={{
                width: "1.5rem",
                height: "1.5rem",
                fontSize: "var(--style-body-size, 0.75rem)",
              }}
            >
              3
            </span>
            <span
              className="hidden md:inline"
              style={{
                fontSize: "var(--style-body-size, 0.75rem)",
                fontWeight: "var(--style-body-weight, 500)",
              }}
            >
              Modo de pago
            </span>
          </div>
        </div>
      </div>
      )}

      <main 
        className="max-w-7xl mx-auto"
        style={{
          padding: "var(--style-container-padding, 2rem 1rem)",
        }}
      >
        {/* Header con mejor jerarquía */}
        <div 
          style={{
            marginBottom: "var(--style-component-gap, 3rem)",
          }}
        >
          <h1 
            className="text-foreground mb-3 tracking-tight"
            style={{
              fontSize: "var(--style-title-size, 2.25rem)",
              fontWeight: "var(--style-title-weight, 700)",
              letterSpacing: "var(--style-letter-spacing, -0.025em)",
              lineHeight: "var(--style-line-height, 1.2)",
            }}
          >
            {stepTitles.title}
          </h1>
          <p 
            className="text-muted-foreground"
            style={{
              fontSize: "var(--style-subtitle-size, 1.125rem)",
              fontWeight: "var(--style-subtitle-weight, 400)",
              letterSpacing: "var(--style-letter-spacing, -0.025em)",
              lineHeight: "var(--style-line-height, 1.2)",
            }}
          >
            {stepTitles.subtitle}
          </p>
        </div>

        <section>

          {step === 1 && (
            <>
              {scheduleLoading && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cargando configuración del calendario...</p>
                </div>
              )}
              {scheduleError && (
                <div className="text-center py-8">
                  <p className="text-red-600">Error: {scheduleError}</p>
                </div>
              )}
              {!scheduleLoading && !scheduleError && schedule && (
                <KairoStepSchedule
                  value={value}
                  onChangeDate={setValue}
                  selectedSlotHour={selectedSlot?.hour ?? null}
                  selectedSlotMinute={selectedSlot?.minute ?? null}
                  onSelectSlotHour={(hour, minute = 0) => setSelectedSlot({ hour, minute })}
                  timeSlots={timeSlots}
                  formattedSelection={formattedSelection}
                  canContinue={canContinue}
                  onContinue={handleContinueToForm}
                  enabledDays={schedule.enabledDays}
                  timeSlotVariant={timeSlotVariant}
                />
              )}
            </>
          )}

          {step === 2 && (
            <KairoStepForm
              meetingStart={meetingStart}
              meetingEnd={meetingEnd}
              name={name}
              email={email}
              query={query}
              wantsFile={wantsFile}
              file={file}
              onChangeName={setName}
              onChangeEmail={setEmail}
              onChangeQuery={setQuery}
              onChangeWantsFile={setWantsFile}
              onChangeFile={setFile}
              onBack={handleBackToCalendar}
              onContinue={handleContinueToPayment}
            />
          )}

          {step === 3 && (
            <KairoStepPayment
              meetingStart={meetingStart}
              meetingEnd={meetingEnd}
              name={name}
              email={email}
              paymentMethod={paymentMethod}
              onChangePaymentMethod={setPaymentMethod}
              onBack={handleBackToForm}
              onConfirm={handleConfirmReservation}
            />
          )}
        </section>
      </main>

      {/* Barra inferior para cambiar tema (debug/testing) */}
      <ThemeSwitcher />
    </div>
  );
}

export default App;

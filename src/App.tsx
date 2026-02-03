// src/App.tsx
import { useMemo, useEffect, useRef, useState, lazy, Suspense } from "react";
import { Loader2, Check } from "lucide-react";
import { useYourIdAuth } from "./sdk/useYourIDAuth";
import KairoStepSchedule, {
  type TimeSlot,
  type TimeSlotVariant,
} from "./components/steps/KairoStepSchedule";
import type { CalendarValue } from "./components/KairoCalendar";

// Lazy: cargar Form, Payment y ReviewConfirmation solo cuando el usuario llega a ese paso
const KairoStepForm = lazy(() => import("./components/steps/KairoStepForm"));
const KairoStepPayment = lazy(() => import("./components/steps/KairoStepPayment"));
const KairoStepReviewConfirmation = lazy(() =>
  import("./components/steps/KairoStepReviewConfirmation").then((m) => ({ default: m.default }))
);
const ThemeSwitcher = lazy(() =>
  import("./components/ThemeSwitcher").then((m) => ({ default: m.ThemeSwitcher }))
);
import { useTheme } from "./contexts/ThemeContext";
import { useProfessionalId } from "./utils/useProfessionalId";
import {
  useCalendarSchedule,
  type DayOfWeek,
  type TimeRange,
} from "./hooks/useCalendarSchedule";
import { useCreateMercadoPagoPreference } from "./hooks/useCreateMercadoPagoPreference";
import { useCreateAppointment } from "./hooks/useCreateAppointment";
import SocialLinks from "./components/SocialLinks/SocialLinks";
import type { ThemeName, ExtraThemeName } from "./themes";
import {
  styleVariants,
  type StyleVariantName,
  STYLE_VARIANT_NAMES,
} from "./utils/styleVariants";
import { useBookingStore } from "./stores/bookingStore";

// Fallback ligero para Suspense: evita layout shift y da feedback inmediato al cambiar de paso
const StepFallback = () => (
  <div
    className="animate-pulse rounded-lg bg-muted/50"
    style={{
      minHeight: "280px",
      padding: "var(--style-card-padding, 1.5rem)",
    }}
    aria-hidden
  >
    <div className="h-6 w-3/4 rounded bg-muted mb-4" />
    <div className="h-4 w-full rounded bg-muted mb-2" />
    <div className="h-4 w-5/6 rounded bg-muted" />
  </div>
);

function App() {
  const { setThemeFromCalendar } = useTheme();
  const professionalId = useProfessionalId();
  const {
    schedule,
    loading: scheduleLoading,
    error: scheduleError,
  } = useCalendarSchedule();

  // Inicializar variante de estilo al cargar la app
  useEffect(() => {
    const saved = localStorage.getItem(
      "kairo-style-variant"
    ) as StyleVariantName;
    const variantName =
      saved && STYLE_VARIANT_NAMES.includes(saved) ? saved : "default";
    const variant = styleVariants[variantName];
    const root = document.documentElement;

    // Aplicar estilos de texto como variables CSS
    root.style.setProperty("--style-title-size", variant.textStyles.titleSize);
    root.style.setProperty(
      "--style-title-weight",
      variant.textStyles.titleWeight
    );
    root.style.setProperty(
      "--style-subtitle-size",
      variant.textStyles.subtitleSize
    );
    root.style.setProperty(
      "--style-subtitle-weight",
      variant.textStyles.subtitleWeight
    );
    root.style.setProperty("--style-body-size", variant.textStyles.bodySize);
    root.style.setProperty(
      "--style-body-weight",
      variant.textStyles.bodyWeight
    );
    root.style.setProperty(
      "--style-button-size",
      variant.textStyles.buttonSize
    );
    root.style.setProperty(
      "--style-button-weight",
      variant.textStyles.buttonWeight
    );
    root.style.setProperty(
      "--style-letter-spacing",
      variant.textStyles.letterSpacing
    );
    root.style.setProperty(
      "--style-line-height",
      variant.textStyles.lineHeight
    );

    // Aplicar estilos de números
    root.style.setProperty(
      "--style-number-variant",
      variant.numberStyles.fontVariant
    );
    root.style.setProperty("--style-number-size", variant.numberStyles.size);
    root.style.setProperty(
      "--style-number-weight",
      variant.numberStyles.weight
    );

    // Aplicar estilos de layout
    root.style.setProperty(
      "--style-container-padding",
      variant.layout.containerPadding
    );
    root.style.setProperty(
      "--style-component-gap",
      variant.layout.componentGap
    );
    root.style.setProperty(
      "--style-border-radius",
      variant.layout.borderRadius
    );
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
        root.style.setProperty(
          "--style-title-size",
          variant.textStyles.titleSize
        );
        root.style.setProperty(
          "--style-title-weight",
          variant.textStyles.titleWeight
        );
        root.style.setProperty(
          "--style-subtitle-size",
          variant.textStyles.subtitleSize
        );
        root.style.setProperty(
          "--style-subtitle-weight",
          variant.textStyles.subtitleWeight
        );
        root.style.setProperty(
          "--style-body-size",
          variant.textStyles.bodySize
        );
        root.style.setProperty(
          "--style-body-weight",
          variant.textStyles.bodyWeight
        );
        root.style.setProperty(
          "--style-button-size",
          variant.textStyles.buttonSize
        );
        root.style.setProperty(
          "--style-button-weight",
          variant.textStyles.buttonWeight
        );
        root.style.setProperty(
          "--style-letter-spacing",
          variant.textStyles.letterSpacing
        );
        root.style.setProperty(
          "--style-line-height",
          variant.textStyles.lineHeight
        );
        root.style.setProperty(
          "--style-number-variant",
          variant.numberStyles.fontVariant
        );
        root.style.setProperty(
          "--style-number-size",
          variant.numberStyles.size
        );
        root.style.setProperty(
          "--style-number-weight",
          variant.numberStyles.weight
        );
        root.style.setProperty(
          "--style-container-padding",
          variant.layout.containerPadding
        );
        root.style.setProperty(
          "--style-component-gap",
          variant.layout.componentGap
        );
        root.style.setProperty(
          "--style-border-radius",
          variant.layout.borderRadius
        );
        root.style.setProperty(
          "--style-card-padding",
          variant.layout.cardPadding
        );
        root.style.setProperty("--style-spacing", variant.layout.spacing);
        root.setAttribute("data-style-variant", customEvent.detail);
      }
    };

    window.addEventListener("styleVariantChanged", handleStyleVariantChange);
    return () => {
      window.removeEventListener(
        "styleVariantChanged",
        handleStyleVariantChange
      );
    };
  }, []);

  // Estado para la variante de visualización de horarios (mantener en localStorage)
  const [timeSlotVariant, setTimeSlotVariant] = useState<TimeSlotVariant>(
    () => {
      const saved = localStorage.getItem(
        "kairo-time-slot-variant"
      ) as TimeSlotVariant;
      return saved && ["grid", "list", "timeline"].includes(saved)
        ? saved
        : "grid";
    }
  );

  // Store de Zustand para el estado del formulario
  const {
    step,
    selectedDate: storeSelectedDate,
    selectedSlot,
    selectedDuration,
    name,
    email,
    query,
    phone,
    wantsFile,
    file,
    customFields,
    paymentMethod,
    setStep,
    setSelectedDate,
    setSelectedSlot: setStoreSelectedSlot,
    setSelectedDuration: setStoreSelectedDuration,
    setTimeSlotVariant: setStoreTimeSlotVariant,
    setName,
    setEmail,
    setQuery,
    setPhone,
    setWantsFile,
    setFile,
    setCustomFields,
    setPaymentMethod,
    reset: resetBooking,
  } = useBookingStore();

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
      const saved = localStorage.getItem(
        "kairo-time-slot-variant"
      ) as TimeSlotVariant;
      if (
        saved &&
        ["grid", "list", "timeline"].includes(saved) &&
        saved !== timeSlotVariant
      ) {
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

  // Preload de step 2 y 3 al montar: los chunks se descargan en segundo plano para que al cambiar de paso no haya carga visible
  useEffect(() => {
    void import("./components/steps/KairoStepForm");
    void import("./components/steps/KairoStepPayment");
    void import("./components/steps/KairoStepReviewConfirmation");
  }, []);

  // Aplicar el tema del calendario cuando se carga el schedule (solo la primera vez)
  const hasAppliedCalendarTheme = useRef(false);
  useEffect(() => {
    if (schedule?.theme && !hasAppliedCalendarTheme.current) {
      // Validar que el tema sea uno de los temas válidos (originales o extra)
      const validThemes: readonly (ThemeName | ExtraThemeName)[] = [
        "violeta",
        "calido",
        "metalico",
        "verde",
        "rosa",
        "violeta-rosa",
        "verde-calido",
        "metalico-violeta",
        "rosa-verde",
        "calido-metalico",
        "violeta-verde",
        "rosa-metalico",
        "verde-rosa",
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
    if (import.meta.env.DEV && !professionalId) {
      console.warn(
        "⚠️ No se encontró professionalId. Opciones:\n" +
          "1. URL: /calendar/:professionalId\n" +
          "2. Query: ?professionalId=xxx\n" +
          "3. Env: VITE_PROFESSIONAL_ID=xxx"
      );
    }
  }, [professionalId]);

  // Step 1: fecha + horario
  const [value, setValue] = useState<CalendarValue>(new Date());
  const hasAutoSelectedRef = useRef(false);

  // Sincronizar value con store cuando cambia
  useEffect(() => {
    if (value && !Array.isArray(value)) {
      setSelectedDate(value);
    }
  }, [value, setSelectedDate]);

  // Función helper para formatear fecha a YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Calcular bloqueos basándose en confirmationMaxHours (bloquea las próximas N horas desde ahora)
  const blockedDates = useMemo(() => {
    const blocked: Record<string, { disabled?: boolean }> = {};

    const confirmationMaxHours =
      schedule?.bookingSettings?.confirmationMaxHours;

    // Si confirmationMaxHours es null o undefined, no bloquear nada
    if (!confirmationMaxHours || confirmationMaxHours <= 0) {
      return blocked;
    }

    const now = new Date();
    const blockUntil = new Date(
      now.getTime() + confirmationMaxHours * 60 * 60 * 1000
    );

    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const blockUntilStart = new Date(blockUntil);
    blockUntilStart.setHours(0, 0, 0, 0);

    // Siempre bloquear el día de hoy si hay un bloqueo activo
    // (el bloqueo siempre se extiende al menos hasta más tarde hoy o mañana)
    const todayString = formatDateToString(todayStart);
    blocked[todayString] = { disabled: true };

    // Bloquear días completos intermedios (si los hay)
    const currentDate = new Date(todayStart);
    currentDate.setDate(currentDate.getDate() + 1); // Empezar desde mañana

    while (currentDate < blockUntilStart) {
      const dateString = formatDateToString(new Date(currentDate));
      blocked[dateString] = { disabled: true };
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Si el bloqueo termina en un día futuro, también bloquear ese día
    if (blockUntilStart > todayStart) {
      const lastDayString = formatDateToString(blockUntilStart);
      blocked[lastDayString] = { disabled: true };
    }

    return blocked;
  }, [schedule?.bookingSettings?.confirmationMaxHours]);

  // Combinar dateOverrides existentes con los días bloqueados por confirmationMaxHours
  const combinedDateOverrides = useMemo(() => {
    const existing = schedule?.dateOverrides || {};
    // Los bloqueos por confirmationMaxHours tienen prioridad (sobrescriben si hay conflicto)
    return { ...existing, ...blockedDates };
  }, [schedule?.dateOverrides, blockedDates]);

  // Función helper para verificar si un día tiene slots disponibles (considerando bloqueos)
  const hasAvailableSlots = useMemo(() => {
    return (checkDate: Date): boolean => {
      if (!schedule) return false;

      const dateString = formatDateToString(checkDate);
      const dateOverride = combinedDateOverrides?.[dateString];

      // Si el día está deshabilitado explícitamente, no tiene slots
      if (dateOverride?.disabled) {
        return false;
      }

      // Obtener timeRanges para este día
      let dayRanges: TimeRange[] = [];
      if (
        dateOverride &&
        "timeRanges" in dateOverride &&
        dateOverride.timeRanges &&
        dateOverride.timeRanges.length > 0
      ) {
        dayRanges = dateOverride.timeRanges;
      } else {
        const dayOfWeek = checkDate.getDay();
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
        if (!dayKey || !schedule.enabledDays.includes(dayKey)) {
          return false;
        }
        dayRanges = schedule.byDay[dayKey] || [];
      }

      if (dayRanges.length === 0) {
        return false;
      }

      // Verificar bloqueo por confirmationMaxHours
      const confirmationMaxHours =
        schedule?.bookingSettings?.confirmationMaxHours;
      const now = new Date();
      const blockUntil =
        confirmationMaxHours && confirmationMaxHours > 0
          ? new Date(now.getTime() + confirmationMaxHours * 60 * 60 * 1000)
          : null;

      // Verificar si hay al menos un slot disponible después del bloqueo
      // slotMinutes ahora puede ser un array de duraciones
      const slotDurations = Array.isArray(schedule.slotMinutes)
        ? schedule.slotMinutes
        : [schedule.slotMinutes];
      const bufferMinutes = schedule.bufferMinutes || 0;

      for (const range of dayRanges) {
        const [startHour, startMinute] = range.start.split(":").map(Number);
        const [endHour, endMinute] = range.end.split(":").map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        // Verificar para cada duración disponible
        for (const slotDuration of slotDurations) {
          // El intervalo entre turnos es slotDuration + bufferMinutes
          const intervalBetweenSlots = slotDuration + bufferMinutes;

          for (
            let time = startTime;
            time < endTime;
            time += intervalBetweenSlots
          ) {
            const slotHour = Math.floor(time / 60);
            const slotMinute = time % 60;
            const nextTime = time + slotDuration;

            if (nextTime > endTime) break;

            // Crear fecha/hora del slot
            const slotDateTime = new Date(checkDate);
            slotDateTime.setHours(slotHour, slotMinute, 0, 0);
            const slotEndDateTime = new Date(checkDate);
            slotEndDateTime.setHours(
              Math.floor(nextTime / 60),
              nextTime % 60,
              0,
              0
            );

            // Verificar si este slot está disponible (después del bloqueo)
            if (blockUntil && slotDateTime < blockUntil) {
              continue;
            }

            // Verificar si este slot está ocupado por un appointment existente
            const isSlotOccupied = schedule.appointments?.some((appointment) => {
              // Los appointments vienen en UTC (ISO 8601), convertirlos a fecha local
              const appointmentStart = new Date(appointment.startTime);
              const appointmentEnd = new Date(appointment.endTime);

              // Aplicar bufferMinutes al final del appointment
              // El buffer se agrega después del appointment para dejar tiempo entre citas
              const appointmentEndWithBuffer = new Date(
                appointmentEnd.getTime() +
                  (schedule.bufferMinutes || 0) * 60 * 1000
              );

              // Normalizar las fechas a la misma zona horaria para comparar
              // Comparar solo la fecha (año, mes, día) y hora (hora, minuto)
              const slotDateStr = formatDateToString(slotDateTime);
              const appointmentDateStr = formatDateToString(appointmentStart);

              // Solo comparar si es el mismo día
              if (slotDateStr !== appointmentDateStr) {
                return false;
              }

              // Si es el mismo día, comparar las horas
              const slotStartMinutes =
                slotDateTime.getHours() * 60 + slotDateTime.getMinutes();
              const slotEndMinutes =
                slotEndDateTime.getHours() * 60 + slotEndDateTime.getMinutes();
              const appointmentStartMinutes =
                appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
              const appointmentEndWithBufferMinutes =
                appointmentEndWithBuffer.getHours() * 60 +
                appointmentEndWithBuffer.getMinutes();

              // Verificar si hay solapamiento entre el slot y el appointment (incluyendo buffer)
              // Fórmula simple y correcta: dos intervalos se solapan si
              // slotStart < appointmentEndWithBuffer && slotEnd > appointmentStart
              const hasOverlap =
                slotStartMinutes < appointmentEndWithBufferMinutes &&
                slotEndMinutes > appointmentStartMinutes;

              return hasOverlap;
            });

            // Si el slot está disponible (no bloqueado y no ocupado), retornar true
            if (!isSlotOccupied) {
              return true;
            }
          }
        }
      }

      return false; // No hay slots disponibles
    };
  }, [schedule, combinedDateOverrides]);

  // Seleccionar automáticamente el primer día disponible cuando se carga el schedule
  useEffect(() => {
    if (!schedule || scheduleLoading || hasAutoSelectedRef.current) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Buscar el primer día disponible que tenga slots disponibles
    let firstAvailableDate: Date | null = null;

    // Buscar en los próximos 60 días (aumentado para asegurar encontrar uno)
    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);

      // Verificar si este día tiene slots disponibles
      if (hasAvailableSlots(checkDate)) {
        firstAvailableDate = checkDate;
        break;
      }
    }

    // Si encontramos un día disponible, seleccionarlo
    if (firstAvailableDate) {
      setValue(firstAvailableDate);
      setSelectedDate(firstAvailableDate);
      hasAutoSelectedRef.current = true;
    }
  }, [schedule, scheduleLoading, setSelectedDate, hasAvailableSlots]);

  // Usar selectedDate del store, pero mantener value para el componente Calendar
  const selectedDate: Date | null = storeSelectedDate
    ? Array.isArray(storeSelectedDate)
      ? null
      : storeSelectedDate
    : value && !Array.isArray(value)
    ? value
    : null;

  // Generar timeSlots basados en el schedule del calendario
  const timeSlots: TimeSlot[] = useMemo(() => {
    if (!selectedDate || !schedule) return [];

    // Formatear fecha seleccionada para verificar dateOverrides
    const dateString = formatDateToString(selectedDate);

    // Verificar si hay un dateOverride para esta fecha
    // Usar combinedDateOverrides que incluye los días bloqueados por confirmationMaxHours
    const dateOverride = combinedDateOverrides?.[dateString];

    // Si el día está deshabilitado explícitamente, no mostrar slots
    if (dateOverride?.disabled) {
      return [];
    }

    // Si hay timeRanges en el override, usar esos en lugar de byDay
    let dayRanges: TimeRange[] = [];
    if (
      dateOverride &&
      "timeRanges" in dateOverride &&
      dateOverride.timeRanges &&
      dateOverride.timeRanges.length > 0
    ) {
      dayRanges = dateOverride.timeRanges;
    } else {
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
      dayRanges = schedule.byDay[dayKey] || [];
    }

    if (dayRanges.length === 0) {
      return [];
    }

    // Obtener el bloqueo por confirmationMaxHours
    const confirmationMaxHours =
      schedule?.bookingSettings?.confirmationMaxHours;
    const now = new Date();
    const blockUntil =
      confirmationMaxHours && confirmationMaxHours > 0
        ? new Date(now.getTime() + confirmationMaxHours * 60 * 60 * 1000)
        : null;

    // Debug: mostrar appointments para el día seleccionado
    if (import.meta.env.DEV && schedule.appointments) {
      const dateStr = formatDateToString(selectedDate);
      const dayAppointments = schedule.appointments.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        return formatDateToString(aptDate) === dateStr;
      });
      if (dayAppointments.length > 0) {
        console.log(
          `📅 Appointments para ${dateStr}:`,
          dayAppointments.map((apt) => ({
            start: apt.startTime,
            end: apt.endTime,
            localStart: new Date(apt.startTime).toLocaleString(),
            localEnd: new Date(apt.endTime).toLocaleString(),
          }))
        );
      }
    }

    // Generar slots basados en los rangos horarios y slotMinutes
    // slotMinutes ahora puede ser un array de duraciones
    const slotDurations = Array.isArray(schedule.slotMinutes)
      ? schedule.slotMinutes
      : [schedule.slotMinutes];
    const slots: TimeSlot[] = [];

    dayRanges.forEach((range: TimeRange) => {
      const [startHour, startMinute] = range.start.split(":").map(Number);
      const [endHour, endMinute] = range.end.split(":").map(Number);

      const startTime = startHour * 60 + startMinute; // minutos desde medianoche
      const endTime = endHour * 60 + endMinute;
      const bufferMinutes = schedule.bufferMinutes || 0;

      // Generar slots para cada duración disponible
      slotDurations.forEach((slotDuration) => {
        // El intervalo mínimo entre turnos es slotDuration + bufferMinutes
        const intervalBetweenSlots = slotDuration + bufferMinutes;

        // Generar slots con intervalo de slotDuration + bufferMinutes entre turnos
        for (let time = startTime; time < endTime; time += intervalBetweenSlots) {
          const slotHour = Math.floor(time / 60);
          const slotMinute = time % 60;
          const nextTime = time + slotDuration;
          const nextHour = Math.floor(nextTime / 60);
          const nextMinute = nextTime % 60;

          // No crear slot si excede el rango
          if (nextTime > endTime) break;

          // Crear fecha/hora del slot
          const slotDateTime = new Date(selectedDate);
          slotDateTime.setHours(slotHour, slotMinute, 0, 0);
          const slotEndDateTime = new Date(selectedDate);
          slotEndDateTime.setHours(nextHour, nextMinute, 0, 0);

          // Verificar si este slot está bloqueado por confirmationMaxHours
          if (blockUntil && slotDateTime < blockUntil) {
            continue;
          }

          // Verificar si este slot está ocupado por un appointment existente
          const isSlotOccupied = schedule.appointments?.some((appointment) => {
            // Los appointments vienen en UTC (ISO 8601), convertirlos a fecha local
            const appointmentStart = new Date(appointment.startTime);
            const appointmentEnd = new Date(appointment.endTime);

            // Aplicar bufferMinutes al final del appointment
            // El buffer se agrega después del appointment para dejar tiempo entre citas
            const appointmentEndWithBuffer = new Date(
              appointmentEnd.getTime() + (schedule.bufferMinutes || 0) * 60 * 1000
            );

            // Normalizar las fechas a la misma zona horaria para comparar
            // Comparar solo la fecha (año, mes, día) y hora (hora, minuto)
            const slotDateStr = formatDateToString(slotDateTime);
            const appointmentDateStr = formatDateToString(appointmentStart);

            // Solo comparar si es el mismo día
            if (slotDateStr !== appointmentDateStr) {
              return false;
            }

            // Si es el mismo día, comparar las horas
            const slotStartMinutes =
              slotDateTime.getHours() * 60 + slotDateTime.getMinutes();
            const slotEndMinutes =
              slotEndDateTime.getHours() * 60 + slotEndDateTime.getMinutes();
            const appointmentStartMinutes =
              appointmentStart.getHours() * 60 + appointmentStart.getMinutes();
            const appointmentEndWithBufferMinutes =
              appointmentEndWithBuffer.getHours() * 60 +
              appointmentEndWithBuffer.getMinutes();

            // Verificar si hay solapamiento entre el slot y el appointment (incluyendo buffer)
            // El buffer se aplica después del appointment, así que bloqueamos hasta appointmentEnd + buffer
            // Un slot está bloqueado si empieza antes de que termine el buffer
            // Fórmula: slotStart < appointmentEndWithBuffer && slotEnd > appointmentStart
            const hasOverlap =
              slotStartMinutes < appointmentEndWithBufferMinutes &&
              slotEndMinutes > appointmentStartMinutes;

            // Debug: solo en desarrollo
            if (import.meta.env.DEV && hasOverlap) {
              console.log("🔴 Slot ocupado detectado:", {
                slot: `${slotHour}:${slotMinute
                  .toString()
                  .padStart(2, "0")} - ${nextHour}:${nextMinute
                  .toString()
                  .padStart(2, "0")}`,
                slotMinutes: `${slotStartMinutes} - ${slotEndMinutes}`,
                appointment: `${appointmentStart.getHours()}:${appointmentStart
                  .getMinutes()
                  .toString()
                  .padStart(
                    2,
                    "0"
                  )} - ${appointmentEnd.getHours()}:${appointmentEnd
                  .getMinutes()
                  .toString()
                  .padStart(2, "0")}`,
                appointmentMinutes: `${appointmentStartMinutes} - ${appointmentEndWithBufferMinutes}`,
                bufferMinutes: schedule.bufferMinutes,
                date: slotDateStr,
                appointmentRaw: appointment.startTime,
              });
            }

            return hasOverlap;
          });

          // Incluir el slot, pero marcarlo como deshabilitado si está ocupado
          slots.push({
            hour: slotHour,
            minute: slotMinute,
            label: `${slotHour.toString().padStart(2, "0")}:${slotMinute
              .toString()
              .padStart(2, "0")} - ${nextHour
              .toString()
              .padStart(2, "0")}:${nextMinute.toString().padStart(2, "0")}`,
            disabled: isSlotOccupied || false,
            duration: slotDuration,
          });
        }
      });
    });

    return slots;
  }, [selectedDate, schedule]);

  const formattedSelection = useMemo(() => {
    if (!selectedDate || Array.isArray(selectedDate))
      return "Ninguna fecha seleccionada";
    return selectedDate.toLocaleDateString();
  }, [selectedDate]);

  // Verificar si se puede continuar: necesita fecha, slot y duración (si hay múltiples duraciones)
  const availableDurations = useMemo(() => {
    return schedule 
      ? (Array.isArray(schedule.slotMinutes) ? schedule.slotMinutes : [schedule.slotMinutes])
      : [];
  }, [schedule?.slotMinutes]);
  const needsDurationSelection = availableDurations.length > 1;
  const canContinue = selectedDate !== null && selectedSlot !== null && (!needsDurationSelection || selectedDuration !== null);

  // Seleccionar automáticamente la primera duración si solo hay una disponible
  useEffect(() => {
    if (availableDurations.length === 1 && selectedDuration === null) {
      setStoreSelectedDuration(availableDurations[0]);
    }
  }, [availableDurations, selectedDuration, setStoreSelectedDuration]);

  // Al ingresar al calendario, si hay varios horarios, seleccionar el menor (más temprano)
  useEffect(() => {
    if (step !== 1 || !selectedDate || timeSlots.length === 0) return;
    let slots = timeSlots.filter((s) => !s.disabled);
    if (selectedDuration != null) {
      slots = slots.filter((s) => s.duration === selectedDuration);
    }
    if (slots.length === 0) return;
    const sorted = [...slots].sort((a, b) => {
      const aMin = a.hour * 60 + (a.minute ?? 0);
      const bMin = b.hour * 60 + (b.minute ?? 0);
      return aMin - bMin;
    });
    const earliest = sorted[0];
    const currentInList = sorted.some(
      (s) =>
        s.hour === selectedSlot?.hour &&
        (s.minute ?? 0) === (selectedSlot?.minute ?? 0)
    );
    if (!currentInList) {
      setStoreSelectedSlot({
        hour: earliest.hour,
        minute: earliest.minute ?? 0,
      });
      if (earliest.duration != null) {
        setStoreSelectedDuration(earliest.duration);
      }
    }
  }, [
    step,
    selectedDate,
    timeSlots,
    selectedDuration,
    selectedSlot?.hour,
    selectedSlot?.minute,
    setStoreSelectedSlot,
    setStoreSelectedDuration,
  ]);

  const meetingStart = useMemo(() => {
    if (!selectedDate || !selectedSlot) return null;
    const start = new Date(selectedDate);
    start.setHours(selectedSlot.hour, selectedSlot.minute, 0, 0);
    return start;
  }, [selectedDate, selectedSlot]);

  const meetingEnd = useMemo(() => {
    if (!meetingStart) return null;
    // Usar la duración seleccionada si está disponible, sino usar la primera duración del schedule
    const duration = selectedDuration || (Array.isArray(schedule?.slotMinutes) 
      ? schedule.slotMinutes[0] 
      : schedule?.slotMinutes || 30);
    const end = new Date(meetingStart);
    end.setMinutes(end.getMinutes() + duration);
    return end;
  }, [meetingStart, selectedDuration, schedule]);

  // Los estados del formulario y pago ahora vienen del store de Zustand

  const handleContinueToForm = () => {
    if (!canContinue) return;
    setStep(2);
  };

  const handleBackToCalendar = () => {
    setStep(1);
  };

  // Sincronizar timeSlotVariant con el store
  useEffect(() => {
    setStoreTimeSlotVariant(timeSlotVariant);
  }, [timeSlotVariant, setStoreTimeSlotVariant]);

  const reviewBeforePayment = schedule?.bookingSettings?.confirmCaseBeforePayment === true;

  // Loading de confirmación (para flujo con revisión: paso 3 Enviar Zyta)
  const [isConfirmingReservation, setIsConfirmingReservation] = useState(false);

  const handleSubmitReviewConfirmation = async () => {
    if (!meetingStart || !name || !email || !schedule?.calendarSlug) return;
    setIsConfirmingReservation(true);
    try {
      const appointment = await createAppointmentMutation.mutateAsync({
        calendarSlug: schedule.calendarSlug,
        clientName: name,
        clientEmail: email,
        clientPhone: phone || undefined,
        startTime: meetingStart.toISOString(),
        paymentMethod: "cash",
        notes: query || undefined,
        duration: selectedDuration || undefined,
      });

      const formData = {
        name,
        email,
        phone,
        query,
        customFields: customFields || {},
      };
      localStorage.setItem("bookingFormData", JSON.stringify(formData));

      const params = new URLSearchParams();
      params.set("calendarSlug", schedule.calendarSlug);
      if (name) params.set("userName", encodeURIComponent(name));
      if (appointment?.id) params.set("appointmentId", appointment.id);
      const url = `/case-under-review?${params.toString()}`;

      resetBooking();
      window.location.href = url;
    } catch (err) {
      console.error("Error al crear la cita:", err);
      setIsConfirmingReservation(false);
    }
  };

  const handleContinueToPayment = async () => {
    if (reviewBeforePayment) {
      setStep(3);
      return;
    }
    // Continuar al paso de pago
    // Auto-seleccionar método de pago si hay solo uno habilitado
    const enabledMethods = schedule?.payments?.enabled || [];
    if (enabledMethods.length === 1) {
      // Si hay un solo método, seleccionarlo automáticamente
      setPaymentMethod(enabledMethods[0] as "cash" | "transfer" | "mercadopago" | "coordinar");
    } else if (enabledMethods.length > 1) {
      // Si hay múltiples métodos, no seleccionar ninguno
      setPaymentMethod(null);
    }
    setStep(3);
  };

  const handleBackToForm = () => {
    setStep(2);
  };

  // Hook para crear preferencia de Mercado Pago
  const createPreferenceMutation = useCreateMercadoPagoPreference();
  // Hook para crear appointment
  const createAppointmentMutation = useCreateAppointment();

  const isConfirming =
    isConfirmingReservation ||
    createAppointmentMutation.isPending ||
    createPreferenceMutation.isPending;

  const handleConfirmReservation = async (method?: typeof paymentMethod, transferProofFile?: File | null) => {
    const effectiveMethod = method ?? paymentMethod;
    if (!meetingStart || !meetingEnd || !effectiveMethod || !name || !email)
      return;
    if (method) setPaymentMethod(method);
    void transferProofFile; // disponible para cuando el backend soporte subida de comprobante

    const calendarSlug = schedule?.calendarSlug;

    if (!calendarSlug) {
      console.error("No se encontró calendarSlug");
      return;
    }

    // Mostrar loading de inmediato (antes de cualquier async)
    setIsConfirmingReservation(true);

    try {
      const appointment = await createAppointmentMutation.mutateAsync({
        calendarSlug,
        clientName: name,
        clientEmail: email,
        clientPhone: phone || undefined,
        startTime: meetingStart.toISOString(),
        paymentMethod: effectiveMethod,
        notes: query || undefined,
        duration: selectedDuration || undefined,
      });

      console.log("Cita creada exitosamente:", appointment);

      // Según el método de pago, proceder con el flujo correspondiente
      if (effectiveMethod === "mercadopago") {
        // Construir las URLs de redirección basadas en el origen actual
        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/payment/success`;
        const failureUrl = `${baseUrl}/payment/failure`;
        const pendingUrl = `${baseUrl}/payment/pending`;

        try {
          const data = await createPreferenceMutation.mutateAsync({
            calendarSlug,
            amount: schedule?.amount ?? 0,
            currency: schedule?.currency ?? "ARS",
            successUrl,
            failureUrl,
            pendingUrl,
          });

          // Redirigir a Mercado Pago (reset después de preparar la redirección)
          resetBooking();
          window.location.href = data.initPoint;
        } catch (err) {
          console.error("Error al crear preferencia MP", err);
          setIsConfirmingReservation(false);
        }
      } else if (effectiveMethod === "transfer" || effectiveMethod === "cash" || effectiveMethod === "coordinar") {
        // Guardar datos para la página de confirmación y redirigir
        const bookingData = {
          appointmentId: appointment.id,
          calendarSlug,
          clientName: name,
          clientEmail: email,
          startTime: meetingStart.toISOString(),
          endTime: meetingEnd?.toISOString(),
          paymentMethod: effectiveMethod,
          confirmedAt: new Date().toISOString(),
        };
        localStorage.setItem("lastBooking", JSON.stringify(bookingData));

        const params = new URLSearchParams({
          calendarSlug,
          method: effectiveMethod,
          name: encodeURIComponent(name),
        });
        resetBooking();
        window.location.href = `/payment/success?${params.toString()}`;
      }
    } catch (err) {
      console.error("Error al crear la cita:", err);
      setIsConfirmingReservation(false);
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
    return (
      import.meta.env.VITE_STEP1_SUBTITLE ||
      "Elegí una fecha desde hoy en adelante para programar tu meet luego del pago."
    );
  }, [schedule?.calendarSubtitle]);

  // Títulos y subtítulos dinámicos (guía: Inter Extra Bold 800, 32–36px, #FFFFFF)
  const stepTitles = useMemo(() => {
    switch (step) {
      case 1:
        return {
          title: step1Title,
          subtitle: step1Subtitle,
        };
      case 2:
        return {
          title: "Completá tus datos",
          subtitle: name
            ? "Completá los datos restantes para continuar"
            : "Completá tus datos para continuar con el modo de pago.",
        };
      case 3:
        return reviewBeforePayment
          ? {
              title: "Evaluación",
              subtitle:
                "Revisá los datos de tu consulta y enviá para que el profesional la evalúe.",
            }
          : {
              title: "Pago y confirmación",
              subtitle: paymentMethod
                ? "Confirmá tu reserva para finalizar"
                : "Elegí cómo querés completar el pago para confirmar tu turno.",
            };
      default:
        return {
          title: step1Title,
          subtitle: step1Subtitle,
        };
    }
  }, [step, name, paymentMethod, step1Title, step1Subtitle, reviewBeforePayment]);

  // Stepper config: 4 pasos cuando hay revisión antes del pago (confirmCaseBeforePayment)
  const stepperItems = useMemo(
    () =>
      reviewBeforePayment
        ? [
            { num: 1, label: "Elegí turno" },
            { num: 2, label: "Tus datos" },
            { num: 3, label: "Evaluación" },
            { num: 4, label: "Pago" },
          ]
        : [
            { num: 1, label: "Elegí turno" },
            { num: 2, label: "Tus datos" },
            { num: 3, label: "Pago" },
          ],
    [reviewBeforePayment]
  );

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundColor: '#0a0a0a',
        backgroundImage: 'url(/muestras/banner.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Overlay de carga al confirmar reserva */}
      {isConfirming && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black/90 backdrop-blur-sm"
          aria-live="polite"
          aria-busy="true"
        >
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" aria-hidden />
          <p className="text-lg font-medium text-white">
            {createPreferenceMutation.isPending ? "Redirigiendo a Mercado Pago..." : "Confirmando tu reserva..."}
          </p>
          <p className="text-sm text-gray-400">No cierres esta ventana</p>
        </div>
      )}

      <div className="relative z-10 min-h-screen">
        {/* Header superior */}
        <header className="px-4 md:px-8 pt-8 pb-6">
          <div className="max-w-[90%] mx-auto">
            {/* Título principal - Inter Extra Bold 800, 32–36px, #FFFFFF */}
            <h1 
              className="text-white font-extrabold mb-3 tracking-tight text-[32px] md:text-[34px] lg:text-[36px]"
              style={{ fontFamily: 'Inter, sans-serif', color: '#FFFFFF' }}
            >
              {stepTitles.title}
            </h1>
            <p 
              className="text-gray-400 text-base md:text-lg max-w-2xl"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {stepTitles.subtitle}
            </p>
          </div>
        </header>

        {/* Sheet blanco flotante */}
        <main className="px-4 md:px-8 pb-8">
          <div 
            className="w-[90%] mx-auto bg-white rounded-2xl shadow-2xl overflow-x-hidden overflow-y-auto max-h-[85vh]"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
          >
            {/* Stepper + links: en mobile/tablet columna centrada (stepper arriba, links abajo); en desktop fila con links a la derecha */}
            <div className="px-3 sm:px-4 md:px-8 py-4 md:py-5 border-b border-gray-100 flex flex-col items-center gap-4 lg:flex-row lg:justify-between lg:items-center" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-4 gap-y-3 lg:gap-x-6 lg:gap-y-0">
                {stepperItems.map((item, idx) => (
                  <div key={item.num} className="flex items-center shrink-0">
                    <div className="flex items-center gap-2 md:gap-3 whitespace-nowrap">
                      <span 
                        className={`w-9 h-9 md:w-9 md:h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                          step === item.num 
                            ? 'text-white' 
                            : step > item.num 
                              ? 'bg-green-100 text-green-600'
                              : 'bg-[#E5E5E5] text-[#999999]'
                        }`}
                        style={step === item.num ? { backgroundColor: '#FF6600' } : undefined}
                      >
                        {step > item.num ? <Check className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2.5} /> : item.num}
                      </span>
                      <span 
                        className="hidden min-[601px]:inline font-medium text-[14px]"
                        style={{
                          fontWeight: 500,
                          color: step === item.num ? '#333333' : step > item.num ? 'var(--color-green-600, #16a34a)' : '#999999',
                        }}
                      >
                        {item.label}
                      </span>
                    </div>
                    {idx < stepperItems.length - 1 && (
                      <div 
                        className={`w-8 lg:w-16 mx-0 lg:mx-4 border-t ${step > item.num ? 'border-orange-300' : 'border-gray-200'} border-dashed shrink-0 self-center hidden lg:block`}
                        style={{ borderColor: step > item.num ? undefined : '#999999', minWidth: 0 }}
                      />
                    )}
                  </div>
                ))}
              </div>
              {/* Links: en mobile/tablet debajo del stepper y centrados; en desktop a la derecha */}
              {schedule?.links && schedule.links.length > 0 && (
                <div className="flex shrink-0 justify-center lg:justify-end">
                  <SocialLinks links={schedule.links} />
                </div>
              )}
            </div>

            {/* Contenido principal */}
            <div className="p-6 md:p-8">
              <section>
          {step === 1 && (
            <>
              {scheduleLoading && (
                <div className="grid lg:grid-cols-[40%_1fr] gap-10 animate-pulse">
                  {/* Skeleton del calendario */}
                  <div className="w-full flex justify-center items-start">
                    <div className="w-[90%] aspect-square bg-muted rounded-xl" />
                  </div>
                  {/* Skeleton de horarios */}
                  <div>
                    <div className="h-7 w-48 bg-muted rounded mb-2" />
                    <div className="h-4 w-64 bg-muted/70 rounded mb-6" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-10 bg-muted rounded-lg" />
                      ))}
                    </div>
                  </div>
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
                  onSelectSlotHour={(hour, minute = 0) => {
                    setStoreSelectedSlot({ hour, minute });
                    const selectedSlot = timeSlots.find(
                      (slot) => slot.hour === hour && (slot.minute ?? 0) === minute
                    );
                    if (selectedSlot?.duration) {
                      setStoreSelectedDuration(selectedSlot.duration);
                    }
                  }}
                  timeSlots={timeSlots}
                  formattedSelection={formattedSelection}
                  canContinue={canContinue}
                  onContinue={handleContinueToForm}
                  enabledDays={schedule.enabledDays}
                  timeSlotVariant={timeSlotVariant}
                  dateOverrides={combinedDateOverrides}
                  maxAdvanceBookingMonths={schedule.maxAdvanceBookingMonths}
                  availableDurations={Array.isArray(schedule.slotMinutes) ? schedule.slotMinutes : [schedule.slotMinutes]}
                  selectedDuration={selectedDuration}
                  onSelectDuration={setStoreSelectedDuration}
                  reviewBeforePayment={reviewBeforePayment}
                />
              )}
            </>
          )}

          {step === 2 && (
            <Suspense fallback={<StepFallback />}>
              <KairoStepForm
                meetingStart={meetingStart}
                meetingEnd={meetingEnd}
                name={name}
                email={email}
                query={query}
                phone={phone}
                wantsFile={wantsFile}
                file={file}
                customFields={customFields}
                bookingForm={schedule?.bookingForm}
                confirmCaseBeforePayment={schedule?.bookingSettings?.confirmCaseBeforePayment}
                isLoading={createAppointmentMutation.isPending}
                onChangeName={setName}
                onChangeEmail={setEmail}
                onChangeQuery={setQuery}
                onChangePhone={setPhone}
                onChangeWantsFile={setWantsFile}
                onChangeFile={setFile}
                onChangeCustomFields={setCustomFields}
                onBack={handleBackToCalendar}
                onContinue={handleContinueToPayment}
              />
            </Suspense>
          )}

          {step === 3 && reviewBeforePayment && (
            <Suspense fallback={<StepFallback />}>
              <KairoStepReviewConfirmation
                meetingStart={meetingStart}
                meetingEnd={meetingEnd}
                timezone={schedule?.timezone ?? "America/Argentina/Buenos_Aires"}
                amount={schedule?.amount}
                currency={schedule?.currency}
                onBack={handleBackToForm}
                onSubmit={handleSubmitReviewConfirmation}
                isLoading={
                  isConfirmingReservation || createAppointmentMutation.isPending
                }
              />
            </Suspense>
          )}
          {step === 3 && !reviewBeforePayment && (
            <Suspense fallback={<StepFallback />}>
              <KairoStepPayment
                meetingStart={meetingStart}
                meetingEnd={meetingEnd}
                name={name}
                email={email}
                amount={schedule?.amount}
                currency={schedule?.currency}
                paymentMethod={paymentMethod}
                onChangePaymentMethod={setPaymentMethod}
                payments={schedule?.payments}
                onBack={handleBackToForm}
                onConfirm={handleConfirmReservation}
              />
            </Suspense>
          )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* Menú de desarrollo: solo en dev (no se monta en producción) */}
      {import.meta.env.DEV && (
        <Suspense fallback={null}>
          <ThemeSwitcher />
        </Suspense>
      )}
    </div>
  );
}

export default App;

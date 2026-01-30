// src/components/steps/KairoStepSchedule.tsx
import { useMemo, useEffect, useState } from "react";
import KairoCalendar, { type CalendarValue } from "../KairoCalendar";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";
import type { NumberFontVariant } from "../../utils/numberFontVariants";
import { getNumberFontVariantClass } from "../../utils/numberFontVariants";
import type { DayOfWeek } from "../../hooks/useCalendarSchedule";

export type TimeSlot = {
  hour: number;
  minute?: number; // Minutos (0-59), opcional para compatibilidad
  label: string;
  disabled?: boolean; // Si está ocupado o no disponible
  duration?: number; // Duración del slot en minutos
};

export type TimeSlotVariant = "grid" | "list" | "timeline";

interface KairoStepScheduleProps {
  value: CalendarValue;
  onChangeDate: (value: CalendarValue) => void;

  selectedSlotHour: number | null;
  selectedSlotMinute?: number | null;
  onSelectSlotHour: (hour: number, minute?: number) => void;

  timeSlots: TimeSlot[];
  formattedSelection: string;

  canContinue: boolean;
  onContinue: () => void;
  enabledDays?: DayOfWeek[]; // Días habilitados para pasar al calendario
  timeSlotVariant?: TimeSlotVariant; // Variante de visualización de horarios
  dateOverrides?: Record<string, { disabled?: boolean; timeRanges?: Array<{ start: string; end: string }> }>;
  maxAdvanceBookingMonths?: number;
  
  // Nuevas props para duración
  availableDurations?: number[]; // Duraciones disponibles en minutos
  selectedDuration?: number | null; // Duración seleccionada
  onSelectDuration?: (duration: number | null) => void; // Callback al seleccionar duración
}

// Función helper para formatear hora a AM/PM
const formatHourToAMPM = (hour: number, minute: number = 0): string => {
  const displayHour = hour % 12 || 12;
  const ampm = hour < 12 ? "AM" : "PM";
  const minuteStr = minute.toString().padStart(2, "0");
  return `${displayHour}:${minuteStr} ${ampm}`;
};

// Función para convertir hora:minuto string a formato AM/PM
const formatTimeStringToAMPM = (timeStr: string): string => {
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr || "0", 10);
  return formatHourToAMPM(hour, minute);
};

const KairoStepSchedule: React.FC<KairoStepScheduleProps> = ({
  value,
  onChangeDate,
  selectedSlotHour,
  selectedSlotMinute,
  onSelectSlotHour,
  timeSlots,
  formattedSelection,
  canContinue,
  onContinue,
  enabledDays,
  dateOverrides,
  maxAdvanceBookingMonths,
  availableDurations = [],
  selectedDuration,
  onSelectDuration,
}) => {
  const hasDateSelected = useMemo(
    () => formattedSelection !== "Ninguna fecha seleccionada",
    [formattedSelection]
  );

  // Ordenar duraciones disponibles de menor a mayor
  const sortedAvailableDurations = useMemo(() => {
    return [...availableDurations].sort((a, b) => a - b);
  }, [availableDurations]);

  // Filtrar slots por duración seleccionada si hay duraciones disponibles
  const filteredTimeSlots = useMemo(() => {
    if (availableDurations.length > 0 && selectedDuration !== null && selectedDuration !== undefined) {
      return timeSlots.filter((slot) => slot.duration === selectedDuration);
    }
    return timeSlots;
  }, [timeSlots, availableDurations, selectedDuration]);

  // Formatear horarios con AM/PM y ordenarlos de menor a mayor
  const formattedTimeSlots = useMemo(() => {
    // Ordenar slots por hora y minuto (de menor a mayor), y si hay empate, por duración
    const sortedSlots = [...filteredTimeSlots].sort((a, b) => {
      const aMinutes = a.hour * 60 + (a.minute ?? 0);
      const bMinutes = b.hour * 60 + (b.minute ?? 0);
      
      // Si tienen la misma hora de inicio, ordenar por duración (menor a mayor)
      if (aMinutes === bMinutes) {
        const aDuration = a.duration ?? 0;
        const bDuration = b.duration ?? 0;
        return aDuration - bDuration;
      }
      
      return aMinutes - bMinutes;
    });

    return sortedSlots.map((slot) => {
      // Si el slot ya tiene un label formateado (HH:mm - HH:mm), convertirlo a AM/PM
      // Si no, generar uno desde hour y minute
      let labelAMPM = slot.label;

      // Si el label está en formato 24h (HH:mm - HH:mm), convertirlo a AM/PM
      if (slot.label.match(/^\d{2}:\d{2} - \d{2}:\d{2}$/)) {
        const [startTime, endTime] = slot.label.split(" - ");
        labelAMPM = `${formatTimeStringToAMPM(
          startTime
        )} - ${formatTimeStringToAMPM(endTime)}`;
      } else {
        // Fallback: usar hour y minute directamente
        const slotMinute = slot.minute ?? 0;
        const endHour = slot.hour;
        const endMinute = slotMinute;
        labelAMPM = `${formatHourToAMPM(
          slot.hour,
          slotMinute
        )} - ${formatHourToAMPM(endHour, endMinute)}`;
      }

      return {
        ...slot,
        labelAMPM,
      };
    });
  }, [filteredTimeSlots]);

  // Obtener variante tipográfica actual
  const [numberFontVariant, setNumberFontVariant] = useState<NumberFontVariant>(
    () => {
      const saved = localStorage.getItem(
        "kairo-number-font-variant"
      ) as NumberFontVariant;
      return saved || "tabular";
    }
  );

  useEffect(() => {
    // Escuchar cambios en el atributo del documento
    const observer = new MutationObserver(() => {
      const variant = document.documentElement.getAttribute(
        "data-number-font-variant"
      ) as NumberFontVariant;
      if (variant && variant !== numberFontVariant) {
        setNumberFontVariant(variant);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-number-font-variant"],
    });

    return () => observer.disconnect();
  }, [numberFontVariant]);

  return (
    <>
      {/* Layout principal - calendario a la izquierda, horarios a la derecha */}
      <div
        className="grid lg:grid-cols-[40%_1fr]"
        style={{
          gap: "var(--style-component-gap, 2.5rem)",
        }}
      >
        {/* Calendario */}
        <div className="w-full flex justify-center items-start">
          <div className="w-[90%] aspect-square">
            <KairoCalendar
              value={value}
              onChange={onChangeDate}
              enabledDays={enabledDays}
              dateOverrides={dateOverrides}
              maxAdvanceBookingMonths={maxAdvanceBookingMonths}
            />
          </div>
        </div>

        {/* Tiempo de reunión y horarios disponibles */}
        <div>
          {/* Selector de duración */}
          {availableDurations.length > 1 && onSelectDuration && (
            <div
              className="mb-6"
              style={{
                marginBottom: "var(--style-component-gap, 2rem)",
              }}
            >
              <p
                className="font-medium text-muted-foreground mb-3 uppercase tracking-wide"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                  letterSpacing: "var(--style-letter-spacing, -0.025em)",
                  marginBottom: "0.75rem",
                }}
              >
                Duración de la reunión
              </p>
              <div
                className="flex flex-wrap gap-2"
                style={{
                  gap: "0.5rem",
                }}
              >
                {sortedAvailableDurations.map((duration) => {
                  const isSelected = selectedDuration === duration;
                  return (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => {
                        // Si ya está seleccionada, deseleccionar; sino, seleccionar
                        onSelectDuration(isSelected ? null : duration);
                        // Si se cambia la duración, limpiar el slot seleccionado
                        if (!isSelected) {
                          onSelectSlotHour(null as any);
                        }
                      }}
                      className={cn(
                        "border-2 transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 hover:border-primary hover:bg-primary/5"
                          : "border-border hover:border-primary hover:bg-primary/5"
                      )}
                      style={{
                        padding: "var(--style-card-padding, 0.75rem 1rem)",
                        borderRadius: "var(--style-border-radius, 0.75rem)",
                        fontSize: "var(--style-body-size, 0.875rem)",
                        fontWeight: "var(--style-body-weight, 500)",
                      }}
                    >
                      {duration} min
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <h3
            className="font-bold mb-2 text-foreground"
            style={{
              fontSize: "var(--style-title-size, 1.5rem)",
              fontWeight: "var(--style-title-weight, 700)",
            }}
          >
            Horarios disponibles
          </h3>
          <p
            className="text-muted-foreground"
            style={{
              fontSize: "var(--style-body-size, 0.875rem)",
              fontWeight: "var(--style-body-weight, 400)",
              marginBottom: "var(--style-component-gap, 1.5rem)",
            }}
          >
            Selecciona el horario que mejor te convenga
          </p>

          {!hasDateSelected ? (
            <div className="flex flex-col justify-center items-center py-12">
              <p
                className="text-muted-foreground"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                }}
              >
                Seleccioná una fecha en el calendario para ver los horarios.
              </p>
            </div>
          ) : (
            <>
              <div
                className="mb-8 custom-scrollbar"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "0.75rem",
                  maxHeight: "60vh",
                  overflowY: "auto",
                }}
              >
                {formattedTimeSlots.map((slot, index) => {
                  const isSelected =
                    selectedSlotHour === slot.hour &&
                    (selectedSlotMinute === undefined ||
                      selectedSlotMinute === (slot.minute ?? 0));
                  const isDisabled = slot.disabled || false;

                  return (
                    <button
                      key={`${slot.hour}-${slot.minute ?? 0}-${index}`}
                      type="button"
                      onClick={() => !isDisabled && onSelectSlotHour(slot.hour, slot.minute)}
                      disabled={isDisabled}
                      className={cn(
                        "w-full border-2 text-left font-mono transition-all",
                        getNumberFontVariantClass(numberFontVariant),
                        isDisabled
                          ? "border-border/50 bg-muted/30 text-muted-foreground/50 cursor-not-allowed opacity-50"
                          : isSelected
                          ? "border-primary bg-primary/5 hover:border-primary hover:bg-primary/5 cursor-pointer"
                          : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer"
                      )}
                      style={{
                        padding: "var(--style-card-padding, 1.25rem)",
                        borderRadius: "var(--style-border-radius, 0.75rem)",
                        fontSize: "var(--style-body-size, 1rem)",
                        fontWeight: "var(--style-body-weight, 400)",
                      }}
                    >
                      {slot.labelAMPM}
                    </button>
                  );
                })}
              </div>

              <Button
                size="lg"
                className="w-full font-semibold"
                onClick={onContinue}
                disabled={!canContinue}
                style={{
                  height: "3.5rem",
                  fontSize: "var(--style-button-size, 1rem)",
                  fontWeight: "var(--style-button-weight, 600)",
                }}
              >
                Continuar
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default KairoStepSchedule;

// src/components/steps/KairoStepSchedule.tsx
import { useMemo, useEffect, useState } from "react";
import KairoCalendar, { type CalendarValue } from "../KairoCalendar";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { cn } from "../../utils/cn";
import type { NumberFontVariant } from "../../utils/numberFontVariants";
import { getNumberFontVariantClass } from "../../utils/numberFontVariants";
import type { DayOfWeek } from "../../hooks/useCalendarSchedule";

export type TimeSlot = {
  hour: number;
  minute?: number; // Minutos (0-59), opcional para compatibilidad
  label: string;
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
}) => {
  const hasDateSelected = useMemo(
    () => formattedSelection !== "Ninguna fecha seleccionada",
    [formattedSelection]
  );

  // Formatear horarios con AM/PM
  const formattedTimeSlots = useMemo(() => {
    return timeSlots.map((slot) => {
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
  }, [timeSlots]);

  // Obtener el horario seleccionado formateado
  const selectedTimeLabel = useMemo(() => {
    if (selectedSlotHour === null) return null;
    const selectedSlot = formattedTimeSlots.find(
      (slot) =>
        slot.hour === selectedSlotHour &&
        (selectedSlotMinute === undefined ||
          selectedSlotMinute === (slot.minute ?? 0))
    );
    return selectedSlot?.labelAMPM || null;
  }, [selectedSlotHour, selectedSlotMinute, formattedTimeSlots]);

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
      {/* Layout principal con proporciones mejoradas - diseño moderno minimalista */}
      <div
        className="grid lg:grid-cols-[480px_1fr]"
        style={{
          gap: "var(--style-component-gap, 2.5rem)",
        }}
      >
        {/* Calendario */}
        <Card
          style={{
            padding: "var(--style-card-padding, 2rem)",
          }}
        >
          <KairoCalendar
            value={value}
            onChange={onChangeDate}
            enabledDays={enabledDays}
          />

          {/* Fecha seleccionada */}
          {hasDateSelected && (
            <div
              className="border-t"
              style={{
                marginTop: "var(--style-component-gap, 2rem)",
                paddingTop: "var(--style-component-gap, 2rem)",
              }}
            >
              <p
                className="font-medium text-muted-foreground mb-2 uppercase tracking-wide"
                style={{
                  fontSize: "var(--style-body-size, 0.875rem)",
                  fontWeight: "var(--style-body-weight, 400)",
                  letterSpacing: "var(--style-letter-spacing, -0.025em)",
                }}
              >
                Fecha seleccionada
              </p>
              <p
                className="font-bold text-primary"
                style={{
                  fontSize: "var(--style-title-size, 1.875rem)",
                  fontWeight: "var(--style-title-weight, 700)",
                }}
              >
                {formattedSelection}
                {selectedTimeLabel && (
                  <span
                    className="block mt-1"
                    style={{
                      fontSize: "var(--style-body-size, 1rem)",
                      fontWeight: "var(--style-body-weight, 500)",
                    }}
                  >
                    {selectedTimeLabel}
                  </span>
                )}
              </p>
            </div>
          )}
        </Card>

        {/* Horarios disponibles */}
        <div>
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
              marginBottom: "var(--style-component-gap, 2rem)",
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

                  return (
                    <button
                      key={`${slot.hour}-${slot.minute ?? 0}-${index}`}
                      type="button"
                      onClick={() => onSelectSlotHour(slot.hour, slot.minute)}
                      className={cn(
                        "w-full border-2 text-left font-mono transition-all hover:border-primary hover:bg-primary/5",
                        getNumberFontVariantClass(numberFontVariant),
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border"
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

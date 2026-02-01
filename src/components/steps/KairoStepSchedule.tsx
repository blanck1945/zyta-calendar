// src/components/steps/KairoStepSchedule.tsx
import { useMemo } from "react";
import KairoCalendar, { type CalendarValue } from "../KairoCalendar";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";
import type { DayOfWeek } from "../../hooks/useCalendarSchedule";

export type TimeSlot = {
  hour: number;
  minute?: number;
  label: string;
  disabled?: boolean;
  duration?: number;
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
  enabledDays?: DayOfWeek[];
  timeSlotVariant?: TimeSlotVariant;
  dateOverrides?: Record<string, { disabled?: boolean; timeRanges?: Array<{ start: string; end: string }> }>;
  maxAdvanceBookingMonths?: number;
  availableDurations?: number[];
  selectedDuration?: number | null;
  onSelectDuration?: (duration: number | null) => void;
}

const formatHour24h = (hour: number, minute: number = 0): string => {
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
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

  // Ordenar duraciones de menor a mayor
  const sortedDurations = useMemo(() => {
    return [...availableDurations].sort((a, b) => a - b);
  }, [availableDurations]);

  // Filtrar slots por duración seleccionada
  const filteredTimeSlots = useMemo(() => {
    let slots = timeSlots;
    
    if (availableDurations.length > 0 && selectedDuration !== null && selectedDuration !== undefined) {
      slots = slots.filter((slot) => slot.duration === selectedDuration);
    }
    
    // Ordenar por hora
    return [...slots].sort((a, b) => {
      const aMinutes = a.hour * 60 + (a.minute ?? 0);
      const bMinutes = b.hour * 60 + (b.minute ?? 0);
      return aMinutes - bMinutes;
    });
  }, [timeSlots, availableDurations, selectedDuration]);

  // Formatear slots
  const formattedTimeSlots = useMemo(() => {
    return filteredTimeSlots.map((slot) => ({
      ...slot,
      labelAMPM: formatHour24h(slot.hour, slot.minute ?? 0),
    }));
  }, [filteredTimeSlots]);

  return (
    <div className="flex flex-col w-full max-w-4xl lg:max-w-none mx-auto gap-6">
      {/* Contenedor Calendario + Horarios: altura dinámica (6 filas). El botón Continuar va debajo. */}
      <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch w-full">
        {/* Calendario: altura intrínseca (aspect-ratio 6 filas) — define el alto del row */}
        <div className="w-full flex justify-center lg:justify-start self-start">
          <div className="w-full max-w-[260px] lg:max-w-none lg:w-full">
            <KairoCalendar
              value={value}
              onChange={onChangeDate}
              enabledDays={enabledDays}
              dateOverrides={dateOverrides}
              maxAdvanceBookingMonths={maxAdvanceBookingMonths}
            />
          </div>
        </div>

        {/* Horarios: en desktop mismo alto que calendario (absolute); en móvil en flujo; scroll en la lista */}
        <div className="relative w-full min-h-0">
          <div
            className="lg:absolute lg:inset-0 lg:border-l lg:border-gray-100 lg:pl-8 pt-2 lg:pt-0 flex flex-col min-h-0 overflow-hidden"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
          {/* Selector de duración */}
          {sortedDurations.length > 1 && onSelectDuration && (
            <div className="mb-4 shrink-0">
              <p className="text-sm font-medium text-gray-700 mb-2">Duración de la reunión</p>
              <div className="flex flex-wrap gap-2">
                {sortedDurations.map((duration) => {
                  const isSelected = selectedDuration === duration;
                  return (
                    <button
                      key={duration}
                      type="button"
                      onClick={() => {
                        onSelectDuration(isSelected ? null : duration);
                        if (!isSelected) {
                          onSelectSlotHour(null as any);
                        }
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm border transition-all duration-150 cursor-pointer",
                        isSelected
                          ? "bg-orange-50 border-orange-500 text-gray-900 font-medium"
                          : "bg-white border-gray-200 text-gray-700 hover:border-orange-300"
                      )}
                    >
                      {duration} min
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {!hasDateSelected ? (
            <div className="flex-1 flex flex-col justify-center items-center py-4 text-center min-h-0">
              <p className="text-gray-500 text-sm">
                Seleccioná una fecha en el calendario para ver los horarios disponibles.
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3 shrink-0">Elegí un horario:</p>
              <div className="grid grid-cols-2 gap-3 flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-2 content-start">
                {formattedTimeSlots.map((slot, index) => {
                  const isSelected =
                    selectedSlotHour === slot.hour &&
                    (selectedSlotMinute === undefined || selectedSlotMinute === (slot.minute ?? 0));
                  const isDisabled = slot.disabled ?? false;

                  return (
                    <button
                      key={`${slot.hour}-${slot.minute ?? 0}-${index}`}
                      type="button"
                      onClick={() => !isDisabled && onSelectSlotHour(slot.hour, slot.minute)}
                      disabled={isDisabled}
                      className={cn(
                        "relative py-3 px-4 rounded-full text-center transition-all duration-150 tracking-wide shrink-0",
                        isDisabled
                          ? "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100"
                          : "cursor-pointer",
                        !isDisabled && isSelected
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 font-medium"
                          : !isDisabled &&
                            "bg-white border border-gray-200 text-gray-900 hover:border-orange-400 hover:bg-orange-50"
                      )}
                    >
                      {slot.labelAMPM}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      </div>

      {/* Botón Continuar siempre debajo del contenedor Calendario + Horarios */}
      <div className="flex-shrink-0 flex justify-start w-full mt-2">
        <Button
          type="button"
          variant="default"
          size="md"
          onClick={onContinue}
          disabled={!canContinue}
          className="font-semibold text-white bg-[#FF6600] hover:bg-[#E55F00]"
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: 600,
          }}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
};

export default KairoStepSchedule;

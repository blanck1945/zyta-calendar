// src/components/KairoCalendar.tsx
import { useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/calendar.css";
import type { DayOfWeek } from "../../hooks/useCalendarSchedule";

export type CalendarValue = Date | [Date, Date] | null;

interface KairoCalendarProps {
  value: CalendarValue;
  onChange: (value: CalendarValue) => void;
  enabledDays?: DayOfWeek[]; // Array de días habilitados: ["mon", "tue", "wed", etc.]
  dateOverrides?: Record<string, { disabled?: boolean; timeRanges?: Array<{ start: string; end: string }> }>;
  maxAdvanceBookingMonths?: number;
}

const KairoCalendar: React.FC<KairoCalendarProps> = ({ 
  value, 
  onChange, 
  enabledDays,
  dateOverrides,
  maxAdvanceBookingMonths
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Calcular fecha máxima basada en maxAdvanceBookingMonths
  const maxDate = useMemo(() => {
    if (!maxAdvanceBookingMonths) return undefined;
    const max = new Date(today);
    max.setMonth(max.getMonth() + maxAdvanceBookingMonths);
    return max;
  }, [today, maxAdvanceBookingMonths]);

  // Función helper para formatear fecha a YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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

  // Función para deshabilitar días
  const tileDisabled = useMemo(() => {
    return ({ date }: { date: Date }) => {
      // Deshabilitar fechas pasadas
      if (date < today) return true;

      // Deshabilitar fechas después de maxAdvanceBookingMonths
      if (maxDate && date > maxDate) return true;

      // Verificar dateOverrides - si está deshabilitado explícitamente
      const dateString = formatDateToString(date);
      if (dateOverrides?.[dateString]?.disabled) {
        return true;
      }

      // Verificar enabledDays (solo si no hay override con timeRanges)
      // Si hay timeRanges en el override, el día está habilitado aunque no esté en enabledDays
      if (dateOverrides?.[dateString]?.timeRanges) {
        return false; // El día está habilitado porque tiene timeRanges en el override
      }

      // Si no hay enabledDays, no deshabilitar nada (excepto lo ya verificado arriba)
      if (!enabledDays || enabledDays.length === 0) {
        return false;
      }

      // Verificar si el día de la semana está habilitado
      const dayOfWeek = date.getDay();
      const dayKey = dayMap[dayOfWeek];
      if (!dayKey) return true;
      return !enabledDays.includes(dayKey);
    };
  }, [enabledDays, dateOverrides, today, maxDate]);

  const handleChange = (
    nextValue: Date | [Date | null, Date | null] | null
  ) => {
    // Convertir el tipo de react-calendar a CalendarValue
    if (nextValue === null) {
      onChange(null);
    } else if (nextValue instanceof Date) {
      onChange(nextValue);
    } else if (Array.isArray(nextValue) && nextValue.length === 2) {
      const [start, end] = nextValue;
      if (start instanceof Date && end instanceof Date) {
        onChange([start, end]);
      }
    }
  };

  return (
    <div className="flex justify-center items-center w-full h-full">
      <Calendar
        onChange={handleChange}
        value={value}
        minDate={today}
        maxDate={maxDate}
        prev2Label={null}
        next2Label={null}
        locale="es-AR"
        tileDisabled={tileDisabled}
        className="w-full h-full rounded-2xl border-2 border-primary shadow-sm bg-white"
      />
    </div>
  );
};

export default KairoCalendar;

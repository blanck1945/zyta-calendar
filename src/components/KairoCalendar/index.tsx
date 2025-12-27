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
}

const KairoCalendar: React.FC<KairoCalendarProps> = ({ 
  value, 
  onChange, 
  enabledDays 
}) => {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Mapeo de días de la semana: 0 = domingo, 1 = lunes, etc.
  const dayMap: Record<number, string> = {
    0: "sun",
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat",
  };

  // Función para deshabilitar días que no están en enabledDays
  const tileDisabled = useMemo(() => {
    if (!enabledDays || enabledDays.length === 0) {
      return undefined; // Si no hay enabledDays, no deshabilitar nada
    }

    return ({ date }: { date: Date }) => {
      const dayOfWeek = date.getDay();
      const dayKey = dayMap[dayOfWeek];
      return !enabledDays.includes(dayKey);
    };
  }, [enabledDays]);

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
    <Calendar
      onChange={handleChange}
      value={value}
      minDate={today}
      prev2Label={null}
      next2Label={null}
      locale="es-AR"
      tileDisabled={tileDisabled}
      className="w-full rounded-2xl border border-gray-200 shadow-sm bg-white"
    />
  );
};

export default KairoCalendar;

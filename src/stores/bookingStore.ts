import { create } from "zustand";
import type { CalendarValue } from "../components/KairoCalendar";
import type { TimeSlotVariant } from "../components/steps/KairoStepSchedule";
import type { PaymentMethod } from "../components/steps/KairoStepPayment";

interface BookingState {
  // Step 1: Calendario (4 cuando hay evaluación previa: Elegí turno → Contanos tu consulta → Evaluación → Pago)
  step: 1 | 2 | 3 | 4;
  selectedDate: CalendarValue | null;
  selectedSlot: { hour: number; minute: number } | null;
  selectedDuration: number | null; // Duración seleccionada en minutos
  timeSlotVariant: TimeSlotVariant;

  // Step 2: Formulario
  name: string;
  email: string;
  query: string;
  phone: string;
  wantsFile: boolean;
  file: File | null;
  customFields: Record<string, string>;

  // Step 3: Pago
  paymentMethod: PaymentMethod | null;

  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setSelectedDate: (date: CalendarValue | null) => void;
  setSelectedSlot: (slot: { hour: number; minute: number } | null) => void;
  setSelectedDuration: (duration: number | null) => void;
  setTimeSlotVariant: (variant: TimeSlotVariant) => void;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setQuery: (query: string) => void;
  setPhone: (phone: string) => void;
  setWantsFile: (wantsFile: boolean) => void;
  setFile: (file: File | null) => void;
  setCustomFields: (fields: Record<string, string>) => void;
  setPaymentMethod: (method: PaymentMethod | null) => void;
  reset: () => void;
}

const initialState = {
  step: 1 as const,
  selectedDate: null as CalendarValue | null,
  selectedSlot: null as { hour: number; minute: number } | null,
  selectedDuration: null as number | null,
  timeSlotVariant: "default" as TimeSlotVariant,
  name: "",
  email: "",
  query: "",
  phone: "",
  wantsFile: false,
  file: null as File | null,
  customFields: {} as Record<string, string>,
  paymentMethod: null as PaymentMethod | null,
};

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setSelectedDuration: (duration) => set({ selectedDuration: duration }),
  setTimeSlotVariant: (variant) => set({ timeSlotVariant: variant }),
  setName: (name) => set({ name }),
  setEmail: (email) => set({ email }),
  setQuery: (query) => set({ query }),
  setPhone: (phone) => set({ phone }),
  setWantsFile: (wantsFile) => set({ wantsFile }),
  setFile: (file) => set({ file }),
  setCustomFields: (customFields) => set({ customFields }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  reset: () => set(initialState),
}));


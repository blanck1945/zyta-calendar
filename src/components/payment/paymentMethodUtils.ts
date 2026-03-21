import type { CalendarPayments } from "../../hooks/useCalendarSchedule";

export type PaymentMethod =
  | "cash"
  | "transfer"
  | "mercadopago"
  | "coordinar"
  | "galiopay";

export function pickDefaultPaymentMethod(
  payments: CalendarPayments | null | undefined
): PaymentMethod | null {
  if (!payments?.enabled?.length || payments.noPaymentRequired) return null;
  const e = payments.enabled;
  if (e.includes("mercadopago") && payments.mercadopago) return "mercadopago";
  if (e.includes("galiopay")) return "galiopay";
  if (e.includes("transfer") && payments.transfer) return "transfer";
  if (e.includes("coordinar") && payments.coordinar) return "coordinar";
  if (e.includes("cash") && payments.cash) return "cash";
  for (const m of e) {
    if (m === "mercadopago" && payments.mercadopago) return "mercadopago";
    if (m === "galiopay") return "galiopay";
    if (m === "transfer" && payments.transfer) return "transfer";
    if (m === "coordinar" && payments.coordinar) return "coordinar";
    if (m === "cash" && payments.cash) return "cash";
  }
  return null;
}

export function hasSelectablePaymentMethods(
  payments?: CalendarPayments
): boolean {
  if (!payments || payments.noPaymentRequired) return false;
  if (!payments.enabled?.length) return false;
  return (
    (payments.enabled.includes("mercadopago") && !!payments.mercadopago) ||
    payments.enabled.includes("galiopay") ||
    (payments.enabled.includes("transfer") && !!payments.transfer) ||
    (payments.enabled.includes("coordinar") && !!payments.coordinar) ||
    (payments.enabled.includes("cash") && !!payments.cash)
  );
}

/**
 * Sistema de variantes de estilos para el debugger
 * Basado en las tres versiones de docs/v0/firstStep/page.tsx
 */

export type StyleVariantName = 
  | "default"  // Moderna Minimalista
  | "compact"  // Compacta Profesional
  | "premium"; // Premium

export interface StyleVariant {
  name: StyleVariantName;
  label: string;
  description: string;
  textStyles: {
    titleSize: string;
    titleWeight: string;
    subtitleSize: string;
    subtitleWeight: string;
    bodySize: string;
    bodyWeight: string;
    buttonSize: string;
    buttonWeight: string;
    letterSpacing: string;
    lineHeight: string;
  };
  numberStyles: {
    fontVariant: "tabular" | "proportional" | "oldstyle";
    size: string;
    weight: string;
  };
  layout: {
    containerPadding: string;
    componentGap: string;
    borderRadius: string;
    cardPadding: string;
    spacing: "tight" | "normal" | "loose";
  };
}

// Variante 1: Moderna Minimalista (default)
export const defaultStyleVariant: StyleVariant = {
  name: "default",
  label: "Moderna Minimalista",
  description: "Diseño moderno y limpio con proporciones equilibradas",
  textStyles: {
    titleSize: "2.25rem", // text-4xl
    titleWeight: "700", // font-bold
    subtitleSize: "1.125rem", // text-lg
    subtitleWeight: "400", // font-normal
    bodySize: "0.875rem", // text-sm
    bodyWeight: "400", // font-normal
    buttonSize: "1rem", // text-base (h-14 text-lg)
    buttonWeight: "600", // font-semibold
    letterSpacing: "-0.025em", // tracking-tight
    lineHeight: "1.2", // leading-tight
  },
  numberStyles: {
    fontVariant: "tabular",
    size: "1rem", // text-base
    weight: "500", // font-medium
  },
  layout: {
    containerPadding: "2rem 1rem", // px-4 py-8
    componentGap: "2.5rem", // gap-10
    borderRadius: "0.75rem", // rounded-xl
    cardPadding: "2rem", // p-8
    spacing: "normal",
  },
};

// Variante 2: Compacta Profesional
export const compactStyleVariant: StyleVariant = {
  name: "compact",
  label: "Compacta Profesional",
  description: "Diseño compacto y eficiente, ideal para espacios reducidos",
  textStyles: {
    titleSize: "1.875rem", // text-3xl
    titleWeight: "700", // font-bold
    subtitleSize: "1rem", // text-base (muted-foreground)
    subtitleWeight: "400", // font-normal
    bodySize: "0.875rem", // text-sm
    bodyWeight: "400", // font-normal
    buttonSize: "0.875rem", // text-sm
    buttonWeight: "500", // font-medium
    letterSpacing: "0", // normal
    lineHeight: "1.5", // leading-normal
  },
  numberStyles: {
    fontVariant: "tabular",
    size: "0.875rem", // text-sm
    weight: "500", // font-medium
  },
  layout: {
    containerPadding: "1.5rem 1rem", // px-4 py-6
    componentGap: "1.5rem", // gap-6
    borderRadius: "0.5rem", // rounded-lg
    cardPadding: "1.5rem", // p-6
    spacing: "tight",
  },
};

// Variante 3: Premium
export const premiumStyleVariant: StyleVariant = {
  name: "premium",
  label: "Premium",
  description: "Diseño premium con sombras, gradientes y elevación",
  textStyles: {
    titleSize: "3rem", // text-5xl
    titleWeight: "700", // font-bold
    subtitleSize: "1.25rem", // text-xl
    subtitleWeight: "400", // font-normal
    bodySize: "1rem", // text-base
    bodyWeight: "400", // font-normal
    buttonSize: "1.25rem", // text-xl (h-16 text-xl)
    buttonWeight: "700", // font-bold
    letterSpacing: "-0.025em", // tracking-tight
    lineHeight: "1.2", // leading-tight
  },
  numberStyles: {
    fontVariant: "tabular",
    size: "1rem", // text-base
    weight: "600", // font-semibold
  },
  layout: {
    containerPadding: "2rem 1rem", // px-4 py-8
    componentGap: "3rem", // gap-12
    borderRadius: "1rem", // rounded-2xl
    cardPadding: "2.5rem", // p-10
    spacing: "loose",
  },
};

export const styleVariants: Record<StyleVariantName, StyleVariant> = {
  default: defaultStyleVariant,
  compact: compactStyleVariant,
  premium: premiumStyleVariant,
};

export const STYLE_VARIANT_NAMES: readonly StyleVariantName[] = [
  "default",
  "compact",
  "premium",
] as const;


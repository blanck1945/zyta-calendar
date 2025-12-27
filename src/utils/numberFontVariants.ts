export type NumberFontVariant = 
  | "default"
  | "tabular"
  | "mono"
  | "rounded"
  | "condensed"
  | "elegant";

export const NUMBER_FONT_VARIANTS: NumberFontVariant[] = [
  "default",
  "tabular",
  "mono",
  "rounded",
  "condensed",
  "elegant",
];

export const getNumberFontVariantClass = (variant: NumberFontVariant): string => {
  switch (variant) {
    case "default":
      return "time-slot-number-default";
    case "tabular":
      return "time-slot-number-tabular";
    case "mono":
      return "time-slot-number-mono";
    case "rounded":
      return "time-slot-number-rounded";
    case "condensed":
      return "time-slot-number-condensed";
    case "elegant":
      return "time-slot-number-elegant";
    default:
      return "time-slot-number-default";
  }
};

export const getNumberFontVariantName = (variant: NumberFontVariant): string => {
  switch (variant) {
    case "default":
      return "Default";
    case "tabular":
      return "Tabular";
    case "mono":
      return "Monospace";
    case "rounded":
      return "Rounded";
    case "condensed":
      return "Condensed";
    case "elegant":
      return "Elegant";
    default:
      return "Default";
  }
};


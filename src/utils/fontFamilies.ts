export type FontFamilyVariant =
  | "system"
  | "serif"
  | "mono"
  | "sans-serif"
  | "display"
  | "handwriting";

export const FONT_FAMILY_VARIANTS: FontFamilyVariant[] = [
  "system",
  "serif",
  "mono",
  "sans-serif",
  "display",
  "handwriting",
];

export const FONT_FAMILY_CONFIG: Record<
  FontFamilyVariant,
  { name: string; families: string[] }
> = {
  system: {
    name: "Sistema",
    families: [
      "system-ui",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ],
  },
  serif: {
    name: "Serif",
    families: [
      '"Times New Roman"',
      "Times",
      "Georgia",
      '"Palatino Linotype"',
      "serif",
    ],
  },
  mono: {
    name: "Monospace",
    families: [
      '"Courier New"',
      "Courier",
      '"Lucida Console"',
      "Monaco",
      "monospace",
    ],
  },
  "sans-serif": {
    name: "Sans Serif",
    families: [
      "Arial",
      '"Helvetica Neue"',
      "Helvetica",
      "Verdana",
      "sans-serif",
    ],
  },
  display: {
    name: "Display",
    families: [
      '"Arial Black"',
      '"Impact"',
      '"Trebuchet MS"',
      "Arial",
      "sans-serif",
    ],
  },
  handwriting: {
    name: "Handwriting",
    families: [
      '"Comic Sans MS"',
      '"Brush Script MT"',
      "cursive",
    ],
  },
};

export const getFontFamilyVariantName = (
  variant: FontFamilyVariant
): string => {
  return FONT_FAMILY_CONFIG[variant].name;
};

export const getFontFamilyCSS = (variant: FontFamilyVariant): string => {
  return FONT_FAMILY_CONFIG[variant].families.join(", ");
};


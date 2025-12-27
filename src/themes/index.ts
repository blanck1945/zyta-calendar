/**
 * Sistema de temas para Kairo Calendar
 * Define múltiples paletas de colores que pueden ser intercambiadas
 */

export type ThemeName = "violeta" | "calido" | "metalico" | "verde" | "rosa";

// Constante con los valores del tipo para uso en runtime
export const THEME_NAMES = [
  "violeta",
  "calido",
  "metalico",
  "verde",
  "rosa",
] as const;

export interface Theme {
  name: ThemeName;
  colors: {
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    secondary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
  };
}

// Tema Violeta (indigo/violeta)
export const violetaTheme: Theme = {
  name: "violeta",
  colors: {
    primary: {
      50: "#f0f4ff",
      100: "#e0e9ff",
      200: "#c7d7fe",
      300: "#a4b8fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
    secondary: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f9fafb",
      tertiary: "#f3f4f6",
    },
  },
};

// Tema Cálido (naranjas/rojos cálidos)
export const calidoTheme: Theme = {
  name: "calido",
  colors: {
    primary: {
      50: "#fff7ed",
      100: "#ffedd5",
      200: "#fed7aa",
      300: "#fdba74",
      400: "#fb923c",
      500: "#f97316",
      600: "#ea580c",
      700: "#c2410c",
      800: "#9a3412",
      900: "#7c2d12",
    },
    secondary: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
    background: {
      primary: "#ffffff",
      secondary: "#fff7ed",
      tertiary: "#ffedd5",
    },
  },
};

// Tema Metálico (negro/azul oscuro)
export const metalicoTheme: Theme = {
  name: "metalico",
  colors: {
    primary: {
      50: "#0f172a",
      100: "#1e293b",
      200: "#334155",
      300: "#475569",
      400: "#64748b",
      500: "#475569",
      600: "#334155",
      700: "#1e293b",
      800: "#0f172a",
      900: "#020617",
    },
    secondary: {
      50: "#dbeafe",
      100: "#bfdbfe",
      200: "#93c5fd",
      300: "#60a5fa",
      400: "#3b82f6",
      500: "#2563eb",
      600: "#1d4ed8",
      700: "#1e40af",
      800: "#1e3a8a",
      900: "#1e3a8a",
    },
    background: {
      primary: "#0f172a",
      secondary: "#1e293b",
      tertiary: "#334155",
    },
  },
};

// Tema Verde (verdes naturales)
export const verdeTheme: Theme = {
  name: "verde",
  colors: {
    primary: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
    secondary: {
      50: "#ecfdf5",
      100: "#d1fae5",
      200: "#a7f3d0",
      300: "#6ee7b7",
      400: "#34d399",
      500: "#10b981",
      600: "#059669",
      700: "#047857",
      800: "#065f46",
      900: "#064e3b",
    },
    background: {
      primary: "#ffffff",
      secondary: "#f0fdf4",
      tertiary: "#dcfce7",
    },
  },
};

// Tema Rosa (rosas/magenta)
export const rosaTheme: Theme = {
  name: "rosa",
  colors: {
    primary: {
      50: "#fdf2f8",
      100: "#fce7f3",
      200: "#fbcfe8",
      300: "#f9a8d4",
      400: "#f472b6",
      500: "#ec4899",
      600: "#db2777",
      700: "#be185d",
      800: "#9f1239",
      900: "#831843",
    },
    secondary: {
      50: "#faf5ff",
      100: "#f3e8ff",
      200: "#e9d5ff",
      300: "#d8b4fe",
      400: "#c084fc",
      500: "#a855f7",
      600: "#9333ea",
      700: "#7e22ce",
      800: "#6b21a8",
      900: "#581c87",
    },
    background: {
      primary: "#ffffff",
      secondary: "#fdf2f8",
      tertiary: "#fce7f3",
    },
  },
};

export const themes: Record<ThemeName, Theme> = {
  violeta: violetaTheme,
  calido: calidoTheme,
  metalico: metalicoTheme,
  verde: verdeTheme,
  rosa: rosaTheme,
};

// ============================================
// TEMAS EXTRA - Combinaciones creativas
// Solo para uso en el debugger, no afectan el código existente
// ============================================

export type ExtraThemeName = 
  | "violeta-rosa" 
  | "verde-calido" 
  | "metalico-violeta" 
  | "rosa-verde" 
  | "calido-metalico"
  | "violeta-verde"
  | "rosa-metalico"
  | "verde-rosa";

export interface ExtraTheme extends Omit<Theme, "name"> {
  name: ExtraThemeName;
}

// Tema Violeta-Rosa (violeta primary + rosa secondary)
export const violetaRosaTheme: ExtraTheme = {
  name: "violeta-rosa",
  colors: {
    primary: violetaTheme.colors.primary,
    secondary: rosaTheme.colors.secondary,
    background: {
      primary: "#ffffff",
      secondary: "#faf5ff",
      tertiary: "#f3e8ff",
    },
  },
};

// Tema Verde-Cálido (verde primary + cálido secondary)
export const verdeCalidoTheme: ExtraTheme = {
  name: "verde-calido",
  colors: {
    primary: verdeTheme.colors.primary,
    secondary: calidoTheme.colors.secondary,
    background: {
      primary: "#ffffff",
      secondary: "#f0fdf4",
      tertiary: "#dcfce7",
    },
  },
};

// Tema Metálico-Violeta (metálico primary + violeta secondary)
export const metalicoVioletaTheme: ExtraTheme = {
  name: "metalico-violeta",
  colors: {
    primary: metalicoTheme.colors.primary,
    secondary: violetaTheme.colors.secondary,
    background: {
      primary: "#0f172a",
      secondary: "#1e293b",
      tertiary: "#334155",
    },
  },
};

// Tema Rosa-Verde (rosa primary + verde secondary)
export const rosaVerdeTheme: ExtraTheme = {
  name: "rosa-verde",
  colors: {
    primary: rosaTheme.colors.primary,
    secondary: verdeTheme.colors.secondary,
    background: {
      primary: "#ffffff",
      secondary: "#fdf2f8",
      tertiary: "#fce7f3",
    },
  },
};

// Tema Cálido-Metálico (cálido primary + metálico secondary)
export const calidoMetalicoTheme: ExtraTheme = {
  name: "calido-metalico",
  colors: {
    primary: calidoTheme.colors.primary,
    secondary: metalicoTheme.colors.secondary,
    background: {
      primary: "#ffffff",
      secondary: "#fff7ed",
      tertiary: "#ffedd5",
    },
  },
};

// Tema Violeta-Verde (violeta primary + verde secondary)
export const violetaVerdeTheme: ExtraTheme = {
  name: "violeta-verde",
  colors: {
    primary: violetaTheme.colors.primary,
    secondary: verdeTheme.colors.secondary,
    background: {
      primary: "#ffffff",
      secondary: "#f0f4ff",
      tertiary: "#e0e9ff",
    },
  },
};

// Tema Rosa-Metálico (rosa primary + metálico secondary)
export const rosaMetalicoTheme: ExtraTheme = {
  name: "rosa-metalico",
  colors: {
    primary: rosaTheme.colors.primary,
    secondary: metalicoTheme.colors.secondary,
    background: {
      primary: "#ffffff",
      secondary: "#fdf2f8",
      tertiary: "#fce7f3",
    },
  },
};

// Tema Verde-Rosa (verde primary + rosa secondary)
export const verdeRosaTheme: ExtraTheme = {
  name: "verde-rosa",
  colors: {
    primary: verdeTheme.colors.primary,
    secondary: rosaTheme.colors.secondary,
    background: {
      primary: "#ffffff",
      secondary: "#f0fdf4",
      tertiary: "#dcfce7",
    },
  },
};

export const extraThemes: Record<ExtraThemeName, ExtraTheme> = {
  "violeta-rosa": violetaRosaTheme,
  "verde-calido": verdeCalidoTheme,
  "metalico-violeta": metalicoVioletaTheme,
  "rosa-verde": rosaVerdeTheme,
  "calido-metalico": calidoMetalicoTheme,
  "violeta-verde": violetaVerdeTheme,
  "rosa-metalico": rosaMetalicoTheme,
  "verde-rosa": verdeRosaTheme,
};

export const EXTRA_THEME_NAMES: readonly ExtraThemeName[] = [
  "violeta-rosa",
  "verde-calido",
  "metalico-violeta",
  "rosa-verde",
  "calido-metalico",
  "violeta-verde",
  "rosa-metalico",
  "verde-rosa",
] as const;
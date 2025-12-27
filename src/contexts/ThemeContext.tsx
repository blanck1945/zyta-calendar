import React, { createContext, useContext, useState, useEffect } from "react";
import type { ThemeName, ExtraThemeName } from "../themes";
import { themes, extraThemes } from "../themes";

interface ThemeContextType {
  theme: ThemeName | ExtraThemeName;
  setTheme: (theme: ThemeName | ExtraThemeName) => void;
  setThemeFromCalendar: (theme: ThemeName | ExtraThemeName) => void; // Aplicar tema sin marcar flag de usuario
  currentTheme: typeof themes.calido;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeName | ExtraThemeName>(() => {
    // Cargar tema del localStorage o usar "calido" por defecto
    const savedTheme = localStorage.getItem("kairo-theme") as ThemeName | ExtraThemeName;
    if (savedTheme && (themes[savedTheme as ThemeName] || extraThemes[savedTheme as ExtraThemeName])) {
      return savedTheme;
    }
    return "calido";
  });

  const setTheme = (newTheme: ThemeName | ExtraThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem("kairo-theme", newTheme);
    localStorage.setItem("kairo-theme-user-changed", "true"); // Marcar que el usuario cambió el tema
    applyThemeToDocument(newTheme);
  };

  const setThemeFromCalendar = (newTheme: ThemeName | ExtraThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem("kairo-theme", newTheme);
    // NO marcar kairo-theme-user-changed para que el tema del calendario tenga prioridad
    applyThemeToDocument(newTheme);
  };

  const applyThemeToDocument = (themeName: ThemeName | ExtraThemeName) => {
    const theme = themes[themeName as ThemeName] || extraThemes[themeName as ExtraThemeName];
    if (!theme) return;
    const root = document.documentElement;

    // Aplicar colores primary (50-900)
    Object.entries(theme.colors.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });

    // Aplicar colores secondary (50-900)
    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });

    // Aplicar colores de fondo
    Object.entries(theme.colors.background).forEach(([key, value]) => {
      root.style.setProperty(`--color-background-${key}`, value);
    });

    // Actualizar variables principales de Tailwind (--primary y --secondary)
    // Usar el color principal (600) para --primary y el secundario (500) para --secondary
    root.style.setProperty("--primary", theme.colors.primary[600]);
    root.style.setProperty("--secondary", theme.colors.secondary[500]);
    
    // Actualizar también --ring para que coincida con el primary
    root.style.setProperty("--ring", theme.colors.primary[600]);
    
    // Actualizar --accent con un color más claro del primary
    root.style.setProperty("--accent", theme.colors.primary[100]);
    
    // Actualizar --background con el fondo primario
    root.style.setProperty("--background", theme.colors.background.primary);
  };

  // Aplicar tema al cargar
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        setThemeFromCalendar,
        currentTheme: (themes[theme as ThemeName] || extraThemes[theme as ExtraThemeName] || themes.calido) as typeof themes.calido,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};


import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import type { ThemeName } from "../../themes";
import { THEME_NAMES, EXTRA_THEME_NAMES } from "../../themes";
import { cn } from "../../utils/cn";
import type { NumberFontVariant } from "../../utils/numberFontVariants";
import {
  NUMBER_FONT_VARIANTS,
  getNumberFontVariantName,
} from "../../utils/numberFontVariants";
import type { FontFamilyVariant } from "../../utils/fontFamilies";
import {
  FONT_FAMILY_VARIANTS,
  getFontFamilyVariantName,
  getFontFamilyCSS,
} from "../../utils/fontFamilies";
import type { TimeSlotVariant } from "../steps/KairoStepSchedule";
import type { StyleVariantName } from "../../utils/styleVariants";
import { STYLE_VARIANT_NAMES, styleVariants } from "../../utils/styleVariants";

export const DevMenu: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const themes = THEME_NAMES as readonly ThemeName[];
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("theme");
  const [numberFontVariant, setNumberFontVariant] = useState<NumberFontVariant>(
    () => {
      const saved = localStorage.getItem(
        "kairo-number-font-variant"
      ) as NumberFontVariant;
      return saved && NUMBER_FONT_VARIANTS.includes(saved) ? saved : "tabular";
    }
  );

  // Estados para diferentes tipos de fuente
  const [titleFont, setTitleFont] = useState<FontFamilyVariant>(() => {
    const saved = localStorage.getItem("kairo-title-font") as FontFamilyVariant;
    return saved && FONT_FAMILY_VARIANTS.includes(saved) ? saved : "system";
  });

  const [subtitleFont, setSubtitleFont] = useState<FontFamilyVariant>(() => {
    const saved = localStorage.getItem(
      "kairo-subtitle-font"
    ) as FontFamilyVariant;
    return saved && FONT_FAMILY_VARIANTS.includes(saved) ? saved : "system";
  });

  const [buttonFont, setButtonFont] = useState<FontFamilyVariant>(() => {
    const saved = localStorage.getItem(
      "kairo-button-font"
    ) as FontFamilyVariant;
    return saved && FONT_FAMILY_VARIANTS.includes(saved) ? saved : "system";
  });

  const [bodyFont, setBodyFont] = useState<FontFamilyVariant>(() => {
    const saved = localStorage.getItem("kairo-body-font") as FontFamilyVariant;
    return saved && FONT_FAMILY_VARIANTS.includes(saved) ? saved : "system";
  });

  const [timeSlotVariant, setTimeSlotVariant] = useState<TimeSlotVariant>(() => {
    const saved = localStorage.getItem("kairo-time-slot-variant") as TimeSlotVariant;
    return saved && ["grid", "list", "timeline"].includes(saved) ? saved : "grid";
  });

  const [styleVariant, setStyleVariant] = useState<StyleVariantName>(() => {
    const saved = localStorage.getItem("kairo-style-variant") as StyleVariantName;
    return saved && STYLE_VARIANT_NAMES.includes(saved) ? saved : "default";
  });

  // Guardar variante de horarios en localStorage y notificar cambios
  useEffect(() => {
    localStorage.setItem("kairo-time-slot-variant", timeSlotVariant);
    // Disparar evento personalizado para que App.tsx se actualice
    const event = new CustomEvent("timeSlotVariantChanged", { 
      detail: timeSlotVariant,
      bubbles: true 
    });
    window.dispatchEvent(event);
    
    // También disparar evento de storage para compatibilidad
    window.dispatchEvent(new StorageEvent("storage", {
      key: "kairo-time-slot-variant",
      newValue: timeSlotVariant,
      storageArea: localStorage
    }));
  }, [timeSlotVariant]);

  // Aplicar variante de estilos al documento
  useEffect(() => {
    if (!styleVariant) return;
    
    const variant = styleVariants[styleVariant];
    if (!variant) return;
    
    const root = document.documentElement;
    
    // Aplicar estilos de texto como variables CSS
    root.style.setProperty("--style-title-size", variant.textStyles.titleSize);
    root.style.setProperty("--style-title-weight", variant.textStyles.titleWeight);
    root.style.setProperty("--style-subtitle-size", variant.textStyles.subtitleSize);
    root.style.setProperty("--style-subtitle-weight", variant.textStyles.subtitleWeight);
    root.style.setProperty("--style-body-size", variant.textStyles.bodySize);
    root.style.setProperty("--style-body-weight", variant.textStyles.bodyWeight);
    root.style.setProperty("--style-button-size", variant.textStyles.buttonSize);
    root.style.setProperty("--style-button-weight", variant.textStyles.buttonWeight);
    root.style.setProperty("--style-letter-spacing", variant.textStyles.letterSpacing);
    root.style.setProperty("--style-line-height", variant.textStyles.lineHeight);
    
    // Aplicar estilos de números
    root.style.setProperty("--style-number-variant", variant.numberStyles.fontVariant);
    root.style.setProperty("--style-number-size", variant.numberStyles.size);
    root.style.setProperty("--style-number-weight", variant.numberStyles.weight);
    
    // Aplicar estilos de layout
    root.style.setProperty("--style-container-padding", variant.layout.containerPadding);
    root.style.setProperty("--style-component-gap", variant.layout.componentGap);
    root.style.setProperty("--style-border-radius", variant.layout.borderRadius);
    root.style.setProperty("--style-card-padding", variant.layout.cardPadding);
    root.style.setProperty("--style-spacing", variant.layout.spacing);
    
    // Aplicar atributo de data para facilitar selección CSS
    root.setAttribute("data-style-variant", styleVariant);
    
    localStorage.setItem("kairo-style-variant", styleVariant);
    
    // Notificar cambio
    const event = new CustomEvent("styleVariantChanged", { 
      detail: styleVariant,
      bubbles: true 
    });
    window.dispatchEvent(event);
    
    // Debug en modo dev
    if (import.meta.env.VITE_ENV === "dev") {
      console.log(`🎨 Variante de estilo aplicada: ${styleVariant}`, {
        titleSize: variant.textStyles.titleSize,
        componentGap: variant.layout.componentGap,
        borderRadius: variant.layout.borderRadius,
      });
    }
  }, [styleVariant]);

  // Aplicar variante de números al documento
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-number-font-variant",
      numberFontVariant
    );
    localStorage.setItem("kairo-number-font-variant", numberFontVariant);
  }, [numberFontVariant]);

  // Aplicar fuentes al documento usando CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--font-title", getFontFamilyCSS(titleFont));
    root.style.setProperty("--font-subtitle", getFontFamilyCSS(subtitleFont));
    root.style.setProperty("--font-button", getFontFamilyCSS(buttonFont));
    root.style.setProperty("--font-body", getFontFamilyCSS(bodyFont));

    localStorage.setItem("kairo-title-font", titleFont);
    localStorage.setItem("kairo-subtitle-font", subtitleFont);
    localStorage.setItem("kairo-button-font", buttonFont);
    localStorage.setItem("kairo-body-font", bodyFont);
  }, [titleFont, subtitleFont, buttonFont, bodyFont]);

  // Solo mostrar en modo desarrollo
  const isDev = import.meta.env.VITE_ENV === "dev";

  if (!isDev) {
    return null;
  }

  const sections = [
    {
      id: "theme",
      label: "Tema",
      icon: "🎨",
    },
    {
      id: "texts",
      label: "Textos",
      icon: "📝",
    },
    {
      id: "numbers",
      label: "Números",
      icon: "🔢",
    },
    {
      id: "timeslots",
      label: "Horarios",
      icon: "⏰",
    },
    {
      id: "styles",
      label: "Estilos",
      icon: "✨",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Botón toggle para abrir/cerrar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "absolute bottom-4 right-4 w-12 h-12 rounded-full shadow-lg",
          "bg-primary-600 text-white flex items-center justify-center",
          "hover:bg-primary-700 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        )}
        aria-label="Menú de desarrollo"
      >
        <span className="text-xl">{isOpen ? "✕" : "⚙️"}</span>
      </button>

      {/* Panel del menú */}
      {isOpen && (
        <div className="bg-white border-t border-gray-200 shadow-2xl">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">
                  🛠️ Menú de Desarrollo
                </span>
                <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                  DEV ONLY
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Cerrar menú"
              >
                ✕
              </button>
            </div>

            {/* Contenido del menú */}
            <div className="px-4 py-4">
              {/* Navegación de secciones */}
              <div className="flex gap-2 mb-4 pb-4 border-b border-gray-200">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                      activeSection === section.id
                        ? "bg-primary-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}
                  >
                    <span className="mr-1.5">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </div>

              {/* Contenido de secciones */}
              <div className="min-h-[100px]">
                {activeSection === "theme" && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Seleccionar Tema
                    </h3>
                    
                    {/* Temas Originales */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Temas Originales</p>
                      <div className="flex flex-wrap gap-2">
                        {themes.map((themeName) => (
                          <button
                            key={themeName}
                            onClick={() => setTheme(themeName)}
                            className={cn(
                              "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                              "border-2",
                              theme === themeName
                                ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                            )}
                          >
                            {themeName.charAt(0).toUpperCase() +
                              themeName.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Temas Extra - Combinaciones */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 font-medium">✨ Temas Extra (Combinaciones)</p>
                      <div className="flex flex-wrap gap-2">
                        {EXTRA_THEME_NAMES.map((themeName) => (
                          <button
                            key={themeName}
                            onClick={() => setTheme(themeName)}
                            className={cn(
                              "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                              "border-2",
                              theme === themeName
                                ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                            )}
                          >
                            {themeName.split("-").map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(" + ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                      Tema actual: <strong>{theme}</strong>
                    </p>
                  </div>
                )}

                {activeSection === "texts" && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      Fuentes para Textos
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Selecciona diferentes fuentes para diferentes elementos
                      del texto. Haz clic en cada elemento para ver las
                      opciones.
                    </p>

                    {/* Título - Acordeón */}
                    <details className="group border border-gray-200 rounded-lg overflow-hidden">
                      <summary className="px-4 py-3 bg-gray-50 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Título (h1)
                          </span>
                          <span className="text-xs text-gray-500">
                            {getFontFamilyVariantName(titleFont)}
                          </span>
                        </div>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {FONT_FAMILY_VARIANTS.map((variant) => (
                            <button
                              key={`title-${variant}`}
                              onClick={() => setTitleFont(variant)}
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                                "border-2",
                                titleFont === variant
                                  ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                              )}
                              style={{
                                fontFamily: getFontFamilyCSS(variant),
                              }}
                            >
                              {getFontFamilyVariantName(variant)}
                            </button>
                          ))}
                        </div>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                          <h4
                            style={{
                              fontFamily: `var(--font-title, ${getFontFamilyCSS(
                                titleFont
                              )})`,
                            }}
                            className="text-lg font-semibold text-gray-800"
                          >
                            Ejemplo de Título
                          </h4>
                        </div>
                      </div>
                    </details>

                    {/* Subtítulo - Acordeón */}
                    <details className="group border border-gray-200 rounded-lg overflow-hidden">
                      <summary className="px-4 py-3 bg-gray-50 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Subtítulo (p)
                          </span>
                          <span className="text-xs text-gray-500">
                            {getFontFamilyVariantName(subtitleFont)}
                          </span>
                        </div>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {FONT_FAMILY_VARIANTS.map((variant) => (
                            <button
                              key={`subtitle-${variant}`}
                              onClick={() => setSubtitleFont(variant)}
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                                "border-2",
                                subtitleFont === variant
                                  ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                              )}
                              style={{
                                fontFamily: getFontFamilyCSS(variant),
                              }}
                            >
                              {getFontFamilyVariantName(variant)}
                            </button>
                          ))}
                        </div>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                          <p
                            style={{
                              fontFamily: `var(--font-subtitle, ${getFontFamilyCSS(
                                subtitleFont
                              )})`,
                            }}
                            className="text-sm text-gray-600"
                          >
                            Ejemplo de subtítulo o descripción
                          </p>
                        </div>
                      </div>
                    </details>

                    {/* Botones - Acordeón */}
                    <details className="group border border-gray-200 rounded-lg overflow-hidden">
                      <summary className="px-4 py-3 bg-gray-50 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Botones
                          </span>
                          <span className="text-xs text-gray-500">
                            {getFontFamilyVariantName(buttonFont)}
                          </span>
                        </div>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {FONT_FAMILY_VARIANTS.map((variant) => (
                            <button
                              key={`button-${variant}`}
                              onClick={() => setButtonFont(variant)}
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                                "border-2",
                                buttonFont === variant
                                  ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                              )}
                              style={{
                                fontFamily: getFontFamilyCSS(variant),
                              }}
                            >
                              {getFontFamilyVariantName(variant)}
                            </button>
                          ))}
                        </div>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                          <button
                            style={{
                              fontFamily: `var(--font-button, ${getFontFamilyCSS(
                                buttonFont
                              )})`,
                            }}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium"
                          >
                            Ejemplo de Botón
                          </button>
                        </div>
                      </div>
                    </details>

                    {/* Texto del cuerpo - Acordeón */}
                    <details className="group border border-gray-200 rounded-lg overflow-hidden">
                      <summary className="px-4 py-3 bg-gray-50 cursor-pointer flex items-center justify-between hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
                            Texto del cuerpo
                          </span>
                          <span className="text-xs text-gray-500">
                            {getFontFamilyVariantName(bodyFont)}
                          </span>
                        </div>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform">
                          ▼
                        </span>
                      </summary>
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {FONT_FAMILY_VARIANTS.map((variant) => (
                            <button
                              key={`body-${variant}`}
                              onClick={() => setBodyFont(variant)}
                              className={cn(
                                "px-3 py-1.5 text-xs font-medium rounded-lg transition-all",
                                "border-2",
                                bodyFont === variant
                                  ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                              )}
                              style={{
                                fontFamily: getFontFamilyCSS(variant),
                              }}
                            >
                              {getFontFamilyVariantName(variant)}
                            </button>
                          ))}
                        </div>
                        <div className="p-3 bg-gray-50 rounded border border-gray-200">
                          <p
                            style={{
                              fontFamily: `var(--font-body, ${getFontFamilyCSS(
                                bodyFont
                              )})`,
                            }}
                            className="text-sm text-gray-700"
                          >
                            Este es un ejemplo de texto del cuerpo. Aquí puedes
                            ver cómo se ve el texto normal con esta fuente.
                          </p>
                        </div>
                      </div>
                    </details>
                  </div>
                )}

                {activeSection === "numbers" && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Variante Tipográfica para Números
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Selecciona una variante para ver cómo se ven los números
                      en los horarios (no afecta al calendario).
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {NUMBER_FONT_VARIANTS.map((variant) => (
                        <button
                          key={variant}
                          onClick={() => setNumberFontVariant(variant)}
                          className={cn(
                            "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                            "border-2",
                            numberFontVariant === variant
                              ? "bg-primary-600 text-white border-primary-600 shadow-md"
                              : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                          )}
                        >
                          {getNumberFontVariantName(variant)}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Vista previa:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={cn(
                            "px-3 py-2 bg-white border border-gray-300 rounded text-sm",
                            `time-slot-number-${numberFontVariant}`
                          )}
                        >
                          9:00 AM - 10:00 AM
                        </span>
                        <span
                          className={cn(
                            "px-3 py-2 bg-white border border-gray-300 rounded text-sm",
                            `time-slot-number-${numberFontVariant}`
                          )}
                        >
                          2:30 PM - 3:30 PM
                        </span>
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Variante actual:{" "}
                      <strong>
                        {getNumberFontVariantName(numberFontVariant)}
                      </strong>
                    </p>
                  </div>
                )}

                {activeSection === "timeslots" && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Variante de Visualización de Horarios
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Selecciona cómo se muestran los horarios disponibles. De menos creativo a más creativo.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setTimeSlotVariant("grid")}
                        className={cn(
                          "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                          "border-2",
                          timeSlotVariant === "grid"
                            ? "bg-primary-600 text-white border-primary-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                        )}
                      >
                        📋 Grid (Simple)
                      </button>
                      <button
                        onClick={() => setTimeSlotVariant("list")}
                        className={cn(
                          "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                          "border-2",
                          timeSlotVariant === "list"
                            ? "bg-primary-600 text-white border-primary-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                        )}
                      >
                        📝 Lista (Medio)
                      </button>
                      <button
                        onClick={() => setTimeSlotVariant("timeline")}
                        className={cn(
                          "px-4 py-2 text-xs font-medium rounded-lg transition-all",
                          "border-2",
                          timeSlotVariant === "timeline"
                            ? "bg-primary-600 text-white border-primary-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                        )}
                      >
                        ✨ Timeline (Creativo)
                      </button>
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">
                        Descripción:
                      </p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>
                          <strong>Grid:</strong> Grid de 2 columnas con botones simples (menos creativo)
                        </li>
                        <li>
                          <strong>Lista:</strong> Lista vertical con iconos y borde izquierdo destacado
                        </li>
                        <li>
                          <strong>Timeline:</strong> Línea de tiempo visual con puntos y gradientes (más creativo)
                        </li>
                      </ul>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Variante actual: <strong>{timeSlotVariant}</strong>
                    </p>
                  </div>
                )}

                {activeSection === "styles" && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">
                      Variantes de Estilos
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Selecciona una variante de estilos que incluye estilos de texto, números y layout.
                    </p>
                    <div className="space-y-3">
                      {STYLE_VARIANT_NAMES.map((variantName) => {
                        const variant = styleVariants[variantName];
                        return (
                          <button
                            key={variantName}
                            onClick={() => {
                              setStyleVariant(variantName);
                              // Aplicar inmediatamente las variables CSS
                              const root = document.documentElement;
                              root.style.setProperty("--style-title-size", variant.textStyles.titleSize);
                              root.style.setProperty("--style-title-weight", variant.textStyles.titleWeight);
                              root.style.setProperty("--style-subtitle-size", variant.textStyles.subtitleSize);
                              root.style.setProperty("--style-subtitle-weight", variant.textStyles.subtitleWeight);
                              root.style.setProperty("--style-body-size", variant.textStyles.bodySize);
                              root.style.setProperty("--style-body-weight", variant.textStyles.bodyWeight);
                              root.style.setProperty("--style-button-size", variant.textStyles.buttonSize);
                              root.style.setProperty("--style-button-weight", variant.textStyles.buttonWeight);
                              root.style.setProperty("--style-letter-spacing", variant.textStyles.letterSpacing);
                              root.style.setProperty("--style-line-height", variant.textStyles.lineHeight);
                              root.style.setProperty("--style-number-variant", variant.numberStyles.fontVariant);
                              root.style.setProperty("--style-number-size", variant.numberStyles.size);
                              root.style.setProperty("--style-number-weight", variant.numberStyles.weight);
                              root.style.setProperty("--style-container-padding", variant.layout.containerPadding);
                              root.style.setProperty("--style-component-gap", variant.layout.componentGap);
                              root.style.setProperty("--style-border-radius", variant.layout.borderRadius);
                              root.style.setProperty("--style-card-padding", variant.layout.cardPadding);
                              root.style.setProperty("--style-spacing", variant.layout.spacing);
                              root.setAttribute("data-style-variant", variantName);
                            }}
                            className={cn(
                              "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
                              styleVariant === variantName
                                ? "bg-primary-600 text-white border-primary-600 shadow-md"
                                : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm">
                                {variant.label}
                              </span>
                              {styleVariant === variantName && (
                                <span className="text-white">✓</span>
                              )}
                            </div>
                            <p className="text-xs opacity-80">
                              {variant.description}
                            </p>
                            <div className="mt-2 text-xs opacity-70 space-y-0.5">
                              <div>
                                <strong>Texto:</strong> {variant.textStyles.titleSize} / {variant.textStyles.titleWeight}
                              </div>
                              <div>
                                <strong>Números:</strong> {variant.numberStyles.fontVariant} / {variant.numberStyles.size}
                              </div>
                              <div>
                                <strong>Layout:</strong> {variant.layout.spacing} spacing / {variant.layout.borderRadius}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-4 text-xs text-gray-500">
                      Variante actual: <strong>{styleVariant}</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mantener compatibilidad con el nombre anterior
export const ThemeSwitcher = DevMenu;

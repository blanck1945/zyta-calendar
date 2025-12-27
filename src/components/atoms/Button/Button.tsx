import React from "react";
import { cn } from "../../../utils/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "disabled";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Variante del botón que define el estilo principal
   */
  variant?: ButtonVariant;
  /**
   * Tamaño del botón
   */
  size?: ButtonSize;
  /**
   * Si es true, el botón ocupa todo el ancho disponible
   */
  fullWidth?: boolean;
  /**
   * Clases CSS adicionales para personalización
   */
  className?: string;
  /**
   * Contenido del botón
   */
  children: React.ReactNode;
}

/**
 * Componente Button base y extensible
 *
 * Diseñado para trabajar con diferentes themes mediante variantes.
 * Los estilos base están definidos aquí y pueden extenderse con className.
 */
export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}) => {
  // Estilos base comunes para todos los botones
  const baseStyles = [
    "inline-flex items-center justify-center",
    "font-medium",
    "rounded-lg",
    "cursor-pointer",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    "active:scale-[0.98]",
  ];

  // Variantes de estilo
  const variantStyles: Record<ButtonVariant, string[]> = {
    primary: [
      "bg-primary-600",
      "text-white",
      "hover:bg-primary-700",
      "shadow-sm hover:shadow-md",
      "focus:ring-primary-500",
    ],
    secondary: [
      "bg-secondary-100",
      "text-secondary-800",
      "hover:bg-secondary-200",
      "shadow-sm hover:shadow-md",
      "focus:ring-secondary-500",
    ],
    outline: [
      "border-2",
      "border-primary-600",
      "text-primary-600",
      "bg-transparent",
      "hover:bg-primary-50",
      "focus:ring-primary-500",
    ],
    ghost: [
      "bg-transparent",
      "text-gray-700",
      "hover:bg-gray-100",
      "focus:ring-gray-500",
    ],
    disabled: [
      "bg-gray-300",
      "text-gray-500",
      "cursor-not-allowed",
      "hover:bg-gray-300",
    ],
  };

  // Tamaños
  const sizeStyles: Record<ButtonSize, string[]> = {
    sm: ["px-3", "py-1.5", "text-sm"],
    md: ["px-5", "py-2.5", "text-sm"],
    lg: ["px-6", "py-3", "text-base"],
  };

  // Determinar la variante final (si está disabled, usar variante disabled)
  const finalVariant = disabled ? "disabled" : variant;

  // Combinar todos los estilos
  const combinedStyles = cn(
    baseStyles,
    variantStyles[finalVariant],
    sizeStyles[size],
    fullWidth && "w-full",
    className
  );

  return (
    <button
      className={combinedStyles}
      disabled={disabled || finalVariant === "disabled"}
      style={{ fontFamily: "var(--font-button, system-ui, sans-serif)" }}
      {...props}
    >
      {children}
    </button>
  );
};

import * as React from "react"
import { cn } from "../../utils/cn"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive"
  size?: "sm" | "md" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", style, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
            "border-2 border-border bg-transparent hover:bg-accent hover:text-accent-foreground": variant === "outline",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
            "h-9 px-4": size === "sm",
            "h-10 px-5": size === "md",
            "h-14 px-8": size === "lg",
          },
          className
        )}
        style={{
          borderRadius: "var(--style-border-radius, 0.5rem)",
          fontSize: size === "lg" 
            ? "var(--style-button-size, 1rem)" 
            : size === "sm" 
            ? "var(--style-body-size, 0.875rem)"
            : "var(--style-body-size, 0.875rem)",
          fontWeight: "var(--style-button-weight, 600)",
          ...style,
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }


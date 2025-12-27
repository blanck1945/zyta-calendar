# Button Component

Componente Button base y extensible diseñado para trabajar con diferentes themes.

## Uso básico

```tsx
import { Button } from "@/components/atoms/Button";

// Botón primario (default)
<Button>Click me</Button>

// Con variantes
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Con tamaños
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>

// Ancho completo
<Button fullWidth>Full Width</Button>

// Disabled
<Button disabled>Disabled</Button>

// Con className personalizado para extender estilos
<Button className="custom-class">Custom</Button>
```

## Props

- `variant`: "primary" | "secondary" | "outline" | "ghost" | "disabled" (default: "primary")
- `size`: "sm" | "md" | "lg" (default: "md")
- `fullWidth`: boolean (default: false)
- `disabled`: boolean
- `className`: string - Para estilos personalizados adicionales
- Todas las props estándar de HTML button

## Extensión con Themes

El componente está diseñado para trabajar con diferentes themes. Los colores se basan en las clases de Tailwind del theme actual (primary-600, secondary-100, etc.).

Para cambiar el theme, simplemente actualiza las variables CSS en `src/index.css` o las clases de Tailwind configuradas.


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    target: "esnext",
    minify: "esbuild",
    cssCodeSplit: true,
    modulePreload: { polyfill: true },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // Separar React y bibliotecas grandes
            if (id.includes("react-dom") || id.includes("react/")) return "react";
            if (id.includes("@tanstack/react-query")) return "react-query";
            if (id.includes("zustand")) return "zustand";
            if (id.includes("framer-motion")) return "framer-motion";
            if (id.includes("react-router")) return "react-router";
            if (id.includes("react-calendar")) return "react-calendar";
            if (id.includes("lucide-react")) return "lucide";
            if (
              id.includes("axios") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("zod")
            ) {
              return "vendor";
            }
            return "vendor-misc";
          }
        },
      },
    },
  },
});

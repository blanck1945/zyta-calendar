import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import federation from "@originjs/vite-plugin-federation";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: "remote-seed",
      filename: "remoteEntry.js",
      exposes: {
        "./App": "./src/App.tsx",
      },
      shared: ["react", "react-dom", "react-router"],
    }),
  ],
  build: {
    target: "esnext",
    minify: "esbuild",
    cssCodeSplit: false,
    modulePreload: { polyfill: true },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            // No separar react, react-dom, react-router → module federation los gestiona como shared
            if (id.includes("@tanstack/react-query")) return "react-query";
            if (id.includes("zustand")) return "zustand";
            if (id.includes("framer-motion")) return "framer-motion";
            if (id.includes("react-calendar")) return "react-calendar";
            if (id.includes("lucide-react")) return "lucide";
            // axios, clsx, etc. van a vendor
            if (
              id.includes("axios") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge") ||
              id.includes("zod")
            ) {
              return "vendor";
            }
          }
        },
      },
    },
  },
});

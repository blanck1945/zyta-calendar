import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RedirectToLanding } from "./components/RedirectToLanding";

const router = createBrowserRouter([
  {
    path: "/:idCalendario",
    element: <App />,
  },
  {
    path: "/",
    element: <RedirectToLanding />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
);

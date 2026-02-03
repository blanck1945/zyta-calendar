import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import { RedirectToLanding } from "./components/RedirectToLanding";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from "./pages/PaymentPending";
import PaymentFailure from "./pages/PaymentFailure";
import CaseUnderReview from "./pages/CaseUnderReview";
import ZytaStatus from "./pages/ZytaStatus";

// Configurar QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/payment/success",
    element: <PaymentSuccess />,
  },
  {
    path: "/payment/pending",
    element: <PaymentPending />,
  },
  {
    path: "/payment/failure",
    element: <PaymentFailure />,
  },
  {
    path: "/case-under-review",
    element: <CaseUnderReview />,
  },
  {
    path: "/zyta/:id/estado",
    element: <ZytaStatus />,
  },
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);

import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";

// Lazy load de rutas para reducir el bundle inicial y mejorar FCP
const App = lazy(() => import("./App.tsx"));
const RedirectToLanding = lazy(() =>
  import("./components/RedirectToLanding").then((m) => ({ default: m.RedirectToLanding }))
);
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentPending = lazy(() => import("./pages/PaymentPending"));
const PaymentFailure = lazy(() => import("./pages/PaymentFailure"));
const CaseUnderReview = lazy(() => import("./pages/CaseUnderReview"));

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
    path: "/:idCalendario",
    element: <App />,
  },
  {
    path: "/",
    element: <RedirectToLanding />,
  },
]);

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background" aria-hidden="true">
    <div className="animate-pulse text-muted-foreground">Cargando…</div>
  </div>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Suspense fallback={<RouteFallback />}>
          <RouterProvider router={router} />
        </Suspense>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);

import { StrictMode, lazy, Suspense, Component, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";

// Error Boundary para capturar errores de lazy loading
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error("Error boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
          <h1 style={{ color: "red" }}>Error al cargar la aplicación</h1>
          <pre style={{ background: "#f5f5f5", padding: "1rem", overflow: "auto" }}>
            {this.state.error?.message || "Error desconocido"}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1rem",
              marginTop: "1rem",
              cursor: "pointer",
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "48px",
          height: "48px",
          border: "4px solid #e5e7eb",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "0 auto 1rem",
        }}
      />
      <p style={{ color: "#6b7280", fontSize: "1rem" }}>Cargando aplicación...</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = '<div style="padding: 2rem; color: red;">Error: No se encontró el elemento #root</div>';
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Suspense fallback={<RouteFallback />}>
              <RouterProvider router={router} />
            </Suspense>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}

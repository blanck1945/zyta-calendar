import { useEffect } from "react";

// Componente para redirigir a la landing page
export const RedirectToLanding = () => {
  useEffect(() => {
    const landingUrl = import.meta.env.VITE_LANDING_URL || "https://zyta-landing.vercel.app/";
    window.location.href = landingUrl;
  }, []);
  
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Redirigiendo...</p>
    </div>
  );
};


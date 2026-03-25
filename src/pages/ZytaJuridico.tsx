import { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";

/* ─── icons (inline SVG para no depender de versión de lucide) ─── */
const IconCalendar = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
);
const IconCard = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
);
const IconScale = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 3v18M3 6l9 4 9-4M5 17H3m18 0h-2M7 17a5 5 0 0 0 10 0"/></svg>
);
const IconGavel = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="m14 13-8.5 8.5a2.12 2.12 0 0 1-3-3L11 10"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/></svg>
);
const IconUsers = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconFile = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);
const IconArrow = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
);
const IconCheck = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
);

/* ─── data ─── */
const FEATURES = [
  { icon: <IconCalendar />, title: "Turnos con clientes", desc: "Agendá consultas en línea con confirmación manual o automática. El cliente elige el horario, vos controlás cada aceptación." },
  { icon: <IconCard />, title: "Cobros antes de atender", desc: "Mercado Pago, GalioPay, transferencia. El pago se procesa antes de la consulta — sin perseguir a nadie por honorarios." },
  { icon: <IconScale />, title: "Integración PJN", desc: "Conectá tu acceso al Poder Judicial de la Nación. Expedientes, actuaciones y plazos disponibles sin entrar al portal." },
  { icon: <IconGavel />, title: "Integración SCBA", desc: "Vinculá el MEV y portal SCBA. Causas bonaerenses sincronizadas y seguimiento de novedades en tiempo real." },
  { icon: <IconUsers />, title: "Portal del cliente", desc: "Cada cliente recibe un link único. Ve el estado de su consulta, recibe notificaciones y paga — todo sin intermediarios." },
  { icon: <IconFile />, title: "Evaluación de consultas", desc: "Revisá el motivo de consulta antes de confirmar. Aceptá, rechazá o pedí más información — con el historial visible." },
];

const STEPS = [
  { num: "01", title: "Conectás tus portales", desc: "Vinculás PJN y SCBA una sola vez. Zyta accede a tus causas y las organiza para que estén disponibles en cada consulta." },
  { num: "02", title: "Configurás tu agenda", desc: "Definís días, horarios y duración de consultas. Activás cobro previo si querés — vos decidís el flujo de cada tipo de caso." },
  { num: "03", title: "El cliente reserva y paga", desc: "Cada cliente recibe tu link de booking. Elige horario, paga y espera tu confirmación — todo sin un solo WhatsApp." },
  { num: "04", title: "Gestionás todo desde un panel", desc: "Consultas, pagos, expedientes y novedades judiciales en un solo lugar. Tu estudio, finalmente ordenado." },
];

const PORTALS = [
  {
    code: "PJN",
    full: "Poder Judicial de la Nación",
    desc: "Accedé a tus expedientes federales y nacionales. Causas, actuaciones y plazos sin copiar y pegar entre pestañas.",
    items: ["Consulta de causas por CUIT / carátula", "Seguimiento de actuaciones procesales", "Detección automática de movimientos nuevos", "Cálculo de plazos procesales"],
  },
  {
    code: "SCBA",
    full: "Suprema Corte Pcia. Buenos Aires",
    desc: "Integrá tu acceso MEV/JUBA. Expedientes bonaerenses sincronizados con tu calendario de consultas en Zyta.",
    items: ["Consulta MEV y JUBA integrada", "Seguimiento de causas bonaerenses", "Estado de actuaciones en tiempo real", "Notificaciones electrónicas centralizadas"],
  },
];

/* ─── styles ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,600&family=Outfit:wght@300;400;500;600&display=swap');

.zj-root { font-family: 'Outfit', sans-serif; background: #0F0F0F; color: #fff; overflow-x: hidden; }

/* entrance */
@keyframes zjUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
.zj-up { animation: zjUp 0.9s cubic-bezier(.22,.68,0,1.2) forwards; opacity:0; }
.zj-d1 { animation-delay:.08s } .zj-d2 { animation-delay:.22s }
.zj-d3 { animation-delay:.38s } .zj-d4 { animation-delay:.52s } .zj-d5 { animation-delay:.68s }

/* nav */
.zj-nav { position:sticky; top:0; z-index:50; border-bottom:1px solid #1c1c1c;
  background:rgba(15,15,15,0.88); backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); }

/* portal pill */
.zj-pill { display:inline-flex; align-items:center; gap:8px; background:#141414;
  border:1px solid #252525; border-radius:8px; padding:7px 14px;
  transition:border-color .25s, background .25s; }
.zj-pill:hover { border-color:rgba(255,106,0,.35); background:rgba(255,106,0,.04); }
.zj-pill-dot { width:7px; height:7px; border-radius:50%; background:#FF6A00; flex-shrink:0; }

/* badge */
.zj-badge { display:inline-flex; align-items:center; gap:6px;
  background:rgba(255,106,0,.08); border:1px solid rgba(255,106,0,.22);
  border-radius:100px; padding:4px 13px;
  font-size:12px; font-weight:500; color:#FF6A00; letter-spacing:.06em; }

/* feature cards grid */
.zj-features-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:1px;
  background:#1c1c1c; border-radius:18px; overflow:hidden; }
.zj-fcard { background:#101010; padding:36px 32px;
  border-top:2px solid transparent;
  transition:border-top-color .3s, background .3s, transform .3s; }
.zj-fcard:hover { border-top-color:#FF6A00; background:#141414; transform:translateY(-3px); }

/* icon box */
.zj-icon-box { width:42px; height:42px; border-radius:11px;
  background:rgba(255,106,0,.1); display:flex; align-items:center;
  justify-content:center; color:#FF6A00; margin-bottom:20px; }

/* steps */
.zj-steps-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; }
@media(max-width:680px) { .zj-steps-grid { grid-template-columns:1fr; } }
.zj-step { position:relative; padding:48px 40px; background:#0d0d0d; overflow:hidden; }
.zj-step:nth-child(1) { border-radius:16px 0 0 0; }
.zj-step:nth-child(2) { border-radius:0 16px 0 0; }
.zj-step:nth-child(3) { border-radius:0 0 0 16px; }
.zj-step:nth-child(4) { border-radius:0 0 16px 0; }
@media(max-width:680px) {
  .zj-step:nth-child(1) { border-radius:16px 16px 0 0; }
  .zj-step:nth-child(4) { border-radius:0 0 16px 16px; }
  .zj-step:nth-child(2), .zj-step:nth-child(3) { border-radius:0; }
}
.zj-step-ghost { position:absolute; bottom:-24px; right:8px;
  font-family:'Cormorant Garamond',serif; font-size:clamp(80px,11vw,144px);
  font-weight:700; color:transparent;
  -webkit-text-stroke:1px rgba(255,106,0,.12); line-height:1;
  pointer-events:none; user-select:none; }

/* portal cards */
.zj-portal-card { background:#0d0d0d; border:1px solid #1c1c1c; border-radius:18px;
  padding:40px; position:relative; overflow:hidden;
  transition:border-color .3s; }
.zj-portal-card:hover { border-color:rgba(255,106,0,.25); }
.zj-portal-ghost { position:absolute; top:16px; right:20px;
  font-family:'Cormorant Garamond',serif; font-size:80px; font-weight:700;
  color:transparent; -webkit-text-stroke:1px rgba(255,106,0,.07);
  line-height:1; pointer-events:none; }
.zj-check-row { display:flex; align-items:center; gap:12px; }
.zj-check-icon { width:22px; height:22px; border-radius:50%;
  background:rgba(255,106,0,.12); display:flex; align-items:center;
  justify-content:center; color:#FF6A00; flex-shrink:0; }

/* CTA */
.zj-cta { background:linear-gradient(135deg,#FF6A00 0%,#e55a00 100%);
  border-radius:20px; padding:80px 48px; text-align:center; position:relative; overflow:hidden; }
.zj-cta::before { content:''; position:absolute; inset:0;
  background-image:radial-gradient(circle at 20% 50%, rgba(255,255,255,.07) 0%, transparent 55%),
    radial-gradient(circle at 80% 20%, rgba(255,255,255,.05) 0%, transparent 45%); }
@media(max-width:600px) { .zj-cta { padding:56px 28px; } }

/* stat */
.zj-stat { text-align:center; }
.zj-stat-val { font-family:'Cormorant Garamond',serif; font-size:clamp(36px,5vw,56px);
  font-weight:600; color:#fff; line-height:1; }
.zj-stat-label { font-size:11px; color:#444; letter-spacing:.1em; text-transform:uppercase; margin-top:6px; }

/* dividers */
.zj-hr { border:none; border-top:1px solid #1c1c1c; }

/* responsive helpers */
.zj-container { max-width:1200px; margin:0 auto; padding:0 24px; }
.zj-section { padding:104px 24px; }
.zj-section-sm { padding:64px 24px; }
@media(max-width:600px) { .zj-section { padding:72px 20px; } .zj-section-sm { padding:48px 20px; } }
`;

/* ─── animated counter ─── */
function useCount(target: number, duration: number, delay = 600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = Date.now();
      const tick = () => {
        const p = Math.min((Date.now() - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(t);
  }, [target, duration, delay]);
  return val;
}

/* ─── component ─── */
export default function ZytaJuridico() {
  const n1 = useCount(500, 1800);
  const n2 = useCount(10000, 2400);
  const heroRef = useRef<HTMLElement>(null);

  return (
    <>
      <style>{CSS}</style>
      <div className="zj-root">

        {/* NAV */}
        <nav className="zj-nav">
          <div className="zj-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 26, letterSpacing: "-0.02em", lineHeight: 1 }}>
                Zyta
              </span>
              <span style={{ width: 1, height: 22, background: "#2a2a2a", display: "block" }} />
              <span style={{ fontSize: 12, color: "#666", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 500 }}>
                Jurídico
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span className="zj-badge">Nuevo</span>
              <Button
                size="sm"
                style={{ background: "#FF6A00", color: "#fff", fontFamily: "'Outfit', sans-serif", fontWeight: 600, borderRadius: 9, fontSize: 14, padding: "0 20px", height: 38 }}
              >
                Empezar
              </Button>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section ref={heroRef} style={{ minHeight: "91vh", display: "flex", alignItems: "center", position: "relative", padding: "88px 24px 72px" }}>
          {/* bg ghosted word */}
          <div aria-hidden style={{
            position: "absolute", right: "-2vw", top: "50%",
            transform: "translateY(-52%) rotate(-6deg)",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(100px, 20vw, 300px)",
            fontWeight: 700, color: "transparent",
            WebkitTextStroke: "1px rgba(255,106,0,0.055)",
            lineHeight: 1, pointerEvents: "none", userSelect: "none", whiteSpace: "nowrap",
          }}>
            JURÍDICO
          </div>

          {/* thin orange horizontal rule */}
          <div aria-hidden style={{
            position: "absolute", left: 0, bottom: "18%", width: "28%",
            height: 1, background: "linear-gradient(90deg, transparent, rgba(255,106,0,.3))",
          }} />

          <div className="zj-container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ maxWidth: 740 }}>

              {/* portal badges */}
              <div className="zj-up zj-d1" style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
                {[
                  ["PJN", "Poder Judicial de la Nación"],
                  ["SCBA", "Suprema Corte Buenos Aires"],
                ].map(([code, label]) => (
                  <div key={code} className="zj-pill">
                    <span className="zj-pill-dot" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#d0d0d0", letterSpacing: "0.04em" }}>{code}</span>
                    <span style={{ fontSize: 12, color: "#484848" }}>{label}</span>
                  </div>
                ))}
              </div>

              {/* headline */}
              <h1 className="zj-up zj-d2" style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(46px, 7.5vw, 100px)",
                fontWeight: 300, lineHeight: 1.04, letterSpacing: "-0.025em", margin: 0,
              }}>
                Tu estudio jurídico,
              </h1>
              <h1 className="zj-up zj-d3" style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(46px, 7.5vw, 100px)",
                fontWeight: 700, lineHeight: 1.04, letterSpacing: "-0.025em",
                color: "#FF6A00", marginBottom: 28,
              }}>
                finalmente ordenado.
              </h1>

              <p className="zj-up zj-d4" style={{
                fontSize: "clamp(15px, 1.8vw, 19px)", color: "#707070",
                lineHeight: 1.75, fontWeight: 300, maxWidth: 520, marginBottom: 44,
              }}>
                Gestioná consultas, cobrá antes de atender y conectá con PJN y SCBA — todo desde un solo panel. Sin planillas, sin WhatsApp, sin caos.
              </p>

              {/* CTAs */}
              <div className="zj-up zj-d5" style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
                <Button
                  size="lg"
                  style={{
                    background: "#FF6A00", color: "#fff",
                    fontFamily: "'Outfit', sans-serif", fontWeight: 600,
                    borderRadius: 11, padding: "0 34px", height: 54, fontSize: 16,
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                >
                  Empezar gratis
                  <IconArrow />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  style={{
                    borderColor: "#252525", color: "#888", background: "transparent",
                    fontFamily: "'Outfit', sans-serif", fontWeight: 400,
                    borderRadius: 11, padding: "0 34px", height: 54, fontSize: 16,
                  }}
                >
                  Ver cómo funciona
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <hr className="zj-hr" />
        <div className="zj-section-sm">
          <div className="zj-container">
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px 64px" }}>
              {[
                { val: `+${n1}`, label: "abogados activos" },
                { val: `+${n2.toLocaleString("es-AR")}`, label: "turnos gestionados" },
                { val: "2", label: "portales judiciales" },
                { val: "3", label: "métodos de pago" },
              ].map((s) => (
                <div key={s.label} className="zj-stat">
                  <div className="zj-stat-val">{s.val}</div>
                  <div className="zj-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <hr className="zj-hr" />

        {/* FEATURES */}
        <section className="zj-section">
          <div className="zj-container">
            <div style={{ marginBottom: 56 }}>
              <span className="zj-badge" style={{ marginBottom: 16, display: "inline-flex" }}>Funcionalidades</span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(32px, 5vw, 66px)",
                fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em",
                maxWidth: 500, margin: 0,
              }}>
                Todo lo que necesita{" "}
                <em style={{ fontStyle: "italic", fontWeight: 600, color: "#FF6A00" }}>un estudio moderno</em>
              </h2>
            </div>
            <div className="zj-features-grid">
              {FEATURES.map((f) => (
                <div key={f.title} className="zj-fcard">
                  <div className="zj-icon-box">{f.icon}</div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 17, color: "#efefef", marginBottom: 10, marginTop: 0 }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "#585858", lineHeight: 1.75, fontWeight: 300, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <hr className="zj-hr" />
        <section className="zj-section">
          <div className="zj-container">
            <div style={{ marginBottom: 56 }}>
              <span className="zj-badge" style={{ marginBottom: 16, display: "inline-flex" }}>Cómo funciona</span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(32px, 5vw, 66px)",
                fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0,
              }}>
                En cuatro pasos,{" "}
                <em style={{ fontStyle: "italic", fontWeight: 600, color: "#FF6A00" }}>sin fricción</em>
              </h2>
            </div>
            <div className="zj-steps-grid">
              {STEPS.map((step, i) => (
                <div key={step.num} className="zj-step">
                  <div className="zj-step-ghost">{step.num}</div>
                  <div style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 11, fontWeight: 600,
                    color: "#FF6A00", letterSpacing: "0.18em", textTransform: "uppercase",
                    marginBottom: 18,
                  }}>
                    Paso {step.num}
                  </div>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(22px, 2.8vw, 34px)",
                    fontWeight: 600, lineHeight: 1.2, marginBottom: 16, marginTop: 0, color: "#efefef",
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 14, color: "#585858", lineHeight: 1.75, fontWeight: 300, margin: 0, maxWidth: 360 }}>
                    {step.desc}
                  </p>
                  {/* connector dot */}
                  {i < 3 && (
                    <div aria-hidden style={{
                      position: "absolute", bottom: -1, left: "50%",
                      transform: "translateX(-50%)",
                      width: 8, height: 8, borderRadius: "50%",
                      background: "#FF6A00", zIndex: 2,
                      display: i % 2 === 0 ? "block" : "none",
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PORTALS DETAIL */}
        <hr className="zj-hr" />
        <section className="zj-section">
          <div className="zj-container">
            <div style={{ marginBottom: 56 }}>
              <span className="zj-badge" style={{ marginBottom: 16, display: "inline-flex" }}>Portales integrados</span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(32px, 5vw, 66px)",
                fontWeight: 300, lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0,
              }}>
                Conectás una vez,{" "}
                <em style={{ fontStyle: "italic", fontWeight: 600 }}>accedés siempre</em>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              {PORTALS.map((portal) => (
                <div key={portal.code} className="zj-portal-card">
                  <div className="zj-portal-ghost">{portal.code}</div>
                  <span className="zj-badge" style={{ marginBottom: 20, display: "inline-flex" }}>{portal.code}</span>
                  <h3 style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "clamp(22px, 2.5vw, 32px)",
                    fontWeight: 600, lineHeight: 1.2, color: "#efefef",
                    marginBottom: 14, marginTop: 0,
                  }}>
                    {portal.full}
                  </h3>
                  <p style={{ fontSize: 14, color: "#585858", lineHeight: 1.75, fontWeight: 300, marginBottom: 28 }}>
                    {portal.desc}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                    {portal.items.map((item) => (
                      <li key={item} className="zj-check-row">
                        <div className="zj-check-icon"><IconCheck /></div>
                        <span style={{ fontSize: 14, color: "#787878", fontWeight: 300 }}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="zj-section">
          <div className="zj-container">
            <div className="zj-cta">
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(36px, 5.5vw, 76px)",
                  fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.025em",
                  color: "#fff", marginBottom: 18, marginTop: 0,
                }}>
                  Tu estudio, listo para el futuro
                </h2>
                <p style={{
                  fontSize: "clamp(15px, 1.8vw, 19px)",
                  color: "rgba(255,255,255,.7)",
                  fontWeight: 300, lineHeight: 1.7, maxWidth: 480,
                  margin: "0 auto 40px",
                }}>
                  Empezá a gestionar consultas y causas en minutos. Sin contrato largo, sin setup complejo.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
                  <Button
                    size="lg"
                    style={{
                      background: "#fff", color: "#FF6A00",
                      fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                      borderRadius: 11, padding: "0 40px", height: 56, fontSize: 17,
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                  >
                    Empezar gratis
                    <IconArrow />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    style={{
                      borderColor: "rgba(255,255,255,.3)", color: "#fff", background: "transparent",
                      fontFamily: "'Outfit', sans-serif", fontWeight: 400,
                      borderRadius: 11, padding: "0 40px", height: 56, fontSize: 17,
                    }}
                  >
                    Hablar con el equipo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <hr className="zj-hr" />
        <footer className="zj-section-sm">
          <div className="zj-container" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, color: "#383838" }}>Zyta</span>
              <span style={{ fontSize: 11, color: "#383838", letterSpacing: "0.12em", textTransform: "uppercase" }}>Jurídico</span>
            </div>
            <span style={{ fontSize: 12, color: "#383838" }}>
              © {new Date().getFullYear()} Zyta. Todos los derechos reservados.
            </span>
          </div>
        </footer>

      </div>
    </>
  );
}

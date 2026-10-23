import { useCallback, useEffect, useState } from "react";
import { faltaConfiguracion, repo } from "./lib/repo";
import { reiniciarDemo } from "./lib/localRepo";
import type { Oportunidad, Usuario } from "./lib/types";
import Login from "./components/Login";
import EstablecerClave from "./components/EstablecerClave";
import Pipeline from "./components/Pipeline";
import Detalle from "./components/Detalle";
import Nueva from "./components/Nueva";
import Auditoria from "./components/Auditoria";
import Tarifario from "./components/Tarifario";
import { TARIFA_EJEMPLO, tarifaVigente, type VersionTarifa } from "./caso/tarifario";

function useRuta() {
  if (window.location.hash.includes("access_token=") || window.location.hash.includes("error=")) {
    if (!repo.necesitaClave()) window.history.replaceState(null, "", window.location.pathname + "#/");
  }
  const [ruta, setRuta] = useState(window.location.hash.slice(1) || "/");
  useEffect(() => {
    const f = () => setRuta(window.location.hash.slice(1) || "/");
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  return ruta;
}

export const ir = (r: string) => { window.location.hash = r; };

export default function App() {
  const ruta = useRuta();
  const [usuario, setUsuario] = useState<Usuario | null | undefined>(undefined);
  const [ops, setOps] = useState<Oportunidad[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [error, setError] = useState("");
  const [tarifas, setTarifas] = useState<VersionTarifa[]>([]);
  const [pideClave, setPideClave] = useState(() => repo.necesitaClave());

  const cargar = useCallback(async () => {
    try {
      const [o, u, t] = await Promise.all([repo.oportunidades(), repo.usuarios(), repo.tarifas()]);
      setOps(o); setUsuarios(u); setTarifas(t); setError("");
    } catch (e) { setError((e as Error).message); }
  }, []);

  useEffect(() => { repo.sesion().then(setUsuario).catch(() => setUsuario(null)); }, []);
  useEffect(() => { if (usuario) cargar(); }, [usuario, cargar]);

  if (faltaConfiguracion) {
    return (
      <div className="login"><div className="caja">
        <img src="/logo-tinta.svg" alt="iterative." />
        <h1>Configuración pendiente</h1>
        <p className="sub" style={{ marginTop: 10 }}>Faltan las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en Vercel. Agréguelas y vuelva a publicar.</p>
      </div></div>
    );
  }
  if (pideClave) {
    return <EstablecerClave onListo={async () => {
      window.history.replaceState(null, "", window.location.pathname + "#/");
      setPideClave(false);
      setUsuario(await repo.sesion().catch(() => null));
    }} />;
  }
  if (usuario === undefined) return null;
  if (!usuario) return <Login onEntrar={setUsuario} />;

  const esSup = usuario.rol === "supervisor";
  const opId = ruta.startsWith("/op/") ? ruta.slice(4) : null;
  const op = opId ? ops.find((o) => o.id === opId) : undefined;
  const tarifa = tarifaVigente(tarifas)?.datos ?? TARIFA_EJEMPLO;
  const pendientesTarifa = tarifas.filter((t) => t.estado === "pendiente").length;
  const link = (r: string, t: string) => <a href={"#" + r} className={ruta === r ? "activo" : ""}>{t}</a>;

  return (
    <>
      <header className="barra">
        <a href="#/"><img src="/logo-blanco.svg" alt="iterative." /></a>
        <nav>
          {link("/", "Pipeline")}
          {esSup && link("/auditoria", "Auditoría diaria")}
          {link("/tarifario", "Tarifario" + (esSup && pendientesTarifa ? ` (${pendientesTarifa})` : ""))}
          {link("/nueva", "+ Nueva oportunidad")}
        </nav>
        <div className="yo">
          <span>{usuario.nombre} · {esSup ? "Supervisor" : "Comercial"}</span>
          {repo.modo === "supabase" && <a className="btn chico" href="#/clave">Contraseña</a>}
          <button className="btn chico" onClick={async () => { await repo.logout(); setUsuario(null); ir("/"); }}>Salir</button>
        </div>
      </header>
      {repo.modo === "demo" && (
        <div className="aviso-demo">
          <b>Modo demo:</b> datos de ejemplo guardados solo en este navegador. Conecte Supabase para usarlo con el equipo.
          <button className="btn chico" onClick={() => { reiniciarDemo(); cargar(); }}>Reiniciar datos de ejemplo</button>
        </div>
      )}
      <main className="contenido">
        {error && <p className="error">{error}</p>}
        {ruta === "/clave" ? (
          <EstablecerClave dentro onListo={() => { alert("Contraseña actualizada."); ir("/"); }} />
        ) : ruta === "/nueva" ? (
          <Nueva usuario={usuario} usuarios={usuarios} onCreada={async (o) => { await cargar(); ir("/op/" + o.id); }} />
        ) : ruta === "/tarifario" ? (
          <Tarifario usuario={usuario} versiones={tarifas} onCambio={cargar} />
        ) : ruta === "/auditoria" && esSup ? (
          <Auditoria usuario={usuario} ops={ops} usuarios={usuarios} onCambio={cargar} />
        ) : opId ? (
          op ? <Detalle key={op.id} usuario={usuario} op={op} usuarios={usuarios} tarifa={tarifa} onCambio={cargar} /> : <p className="sub">Cargando oportunidad…</p>
        ) : (
          <Pipeline usuario={usuario} ops={ops} usuarios={usuarios} />
        )}
      </main>
    </>
  );
}

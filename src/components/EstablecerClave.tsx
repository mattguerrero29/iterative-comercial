import { useState } from "react";
import { repo } from "../lib/repo";

/** Pantalla a la que llega un usuario desde el correo de invitación o de recuperación de contraseña. */
export default function EstablecerClave({ onListo }: { onListo: () => void }) {
  const [clave, setClave] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clave.length < 10) { setError("Use al menos 10 caracteres."); return; }
    if (clave !== repetir) { setError("Las contraseñas no coinciden."); return; }
    setOcupado(true); setError("");
    try { await repo.establecerClave(clave); onListo(); }
    catch (err) { setError((err as Error).message); }
    finally { setOcupado(false); }
  };

  return (
    <div className="login">
      <div className="caja">
        <img src="/logo-tinta.svg" alt="iterative." />
        <div className="etiqueta">Control comercial</div>
        <h1 style={{ marginBottom: 8 }}>Cree su contraseña</h1>
        <p className="sub" style={{ marginBottom: 18 }}>Es la que usará cada vez que ingrese con su correo @iterativeco.com.</p>
        <form onSubmit={guardar} style={{ display: "grid", gap: 14 }}>
          <label className="campo">Contraseña nueva<input type="password" required value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="new-password" /></label>
          <label className="campo">Repita la contraseña<input type="password" required value={repetir} onChange={(e) => setRepetir(e.target.value)} autoComplete="new-password" /></label>
          <button className="btn primario" type="submit" disabled={ocupado}>{ocupado ? "Guardando…" : "Guardar y entrar"}</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

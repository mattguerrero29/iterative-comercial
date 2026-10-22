import { useEffect, useState } from "react";
import { repo } from "../lib/repo";
import type { Usuario } from "../lib/types";

export default function Login({ onEntrar }: { onEntrar: (u: Usuario) => void }) {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [demo, setDemo] = useState<Usuario[]>([]);

  useEffect(() => { if (repo.modo === "demo") repo.usuarios().then(setDemo); }, []);

  const entrar = async (correo: string, pass: string) => {
    try { onEntrar(await repo.login(correo, pass)); } catch (e) { setError((e as Error).message); }
  };

  return (
    <div className="login">
      <div className="caja">
        <img src="/logo-tinta.svg" alt="iterative." />
        <div className="etiqueta">Control comercial</div>
        <h1 style={{ marginBottom: 20 }}>Ingresar</h1>
        {repo.modo === "demo" ? (
          <>
            <p className="sub">Modo demo. Elija un perfil para probar:</p>
            <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
              {demo.map((u) => (
                <button key={u.id} className={"btn " + (u.rol === "supervisor" ? "oscuro" : "")} onClick={() => entrar(u.email, "")}>
                  {u.nombre} · {u.rol === "supervisor" ? "Supervisor" : "Comercial"}
                </button>
              ))}
            </div>
          </>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); entrar(email, clave); }} style={{ display: "grid", gap: 14 }}>
            <label className="campo">Correo<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
            <label className="campo">Contraseña<input type="password" required value={clave} onChange={(e) => setClave(e.target.value)} autoComplete="current-password" /></label>
            <button className="btn primario" type="submit">Entrar</button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

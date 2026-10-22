import { useState } from "react";
import { repo } from "../lib/repo";
import { fechaHora } from "../lib/reglas";
import type { Usuario } from "../lib/types";
import { GRUPOS_TARIFA, TARIFA_EJEMPLO, tarifaVigente, type Formato, type Tarifa, type VersionTarifa } from "../caso/tarifario";
import { fx, pct, pesos } from "../caso/calculo";
import { Num } from "./Campos";

const fmt = (f: Formato, v: number) =>
  f === "pct" ? pct(v) : f === "cop" ? pesos(v) : f === "usd" ? "US$ " + fx(v, 2) : f === "mult" ? "×" + fx(v, 2) : v.toLocaleString("es-CO");
const etiqueta = (k: keyof Tarifa) => GRUPOS_TARIFA.flatMap((g) => g.campos).find((c) => c.k === k)!;

function Cambios({ antes, despues }: { antes: Tarifa; despues: Tarifa }) {
  const difs = (Object.keys(despues) as (keyof Tarifa)[]).filter((k) => antes[k] !== despues[k]);
  if (!difs.length) return <p className="sub">Sin cambios de valores.</p>;
  return (
    <ul className="cambios">
      {difs.map((k) => {
        const c = etiqueta(k);
        return <li key={k}><b>{c.t}:</b> {fmt(c.f, antes[k])} → <b>{fmt(c.f, despues[k])}</b></li>;
      })}
    </ul>
  );
}

export default function Tarifario({ usuario, versiones, onCambio }: { usuario: Usuario; versiones: VersionTarifa[]; onCambio: () => Promise<void> }) {
  const esSup = usuario.rol === "supervisor";
  const vig = tarifaVigente(versiones);
  const base = vig?.datos ?? TARIFA_EJEMPLO;
  const [borrador, setBorrador] = useState<Tarifa | null>(null);
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const pendientes = versiones.filter((v) => v.estado === "pendiente");

  const enviar = async () => {
    if (!borrador) return;
    if (!motivo.trim()) { setError("Escriba el motivo del cambio."); return; }
    if (esSup && !confirm("Va a publicar una nueva versión del tarifario. Los precios sugeridos de todos los casos se recalcularán con estos valores. ¿Continuar?")) return;
    setOcupado(true); setError("");
    try { await repo.proponerTarifa(borrador, motivo.trim(), usuario); setBorrador(null); setMotivo(""); await onCambio(); }
    catch (e) { setError((e as Error).message); }
    finally { setOcupado(false); }
  };
  const revisar = async (v: VersionTarifa, aprobar: boolean) => {
    if (aprobar && !confirm(`¿Aprobar la propuesta v${v.version} de ${v.autorNombre}? Pasará a ser el tarifario vigente.`)) return;
    setOcupado(true); setError("");
    try { await repo.revisarTarifa(v.id, aprobar, usuario); await onCambio(); }
    catch (e) { setError((e as Error).message); }
    finally { setOcupado(false); }
  };

  return (
    <>
      <div className="cabecera">
        <div>
          <div className="etiqueta">Rúbrica de precios</div>
          <h1>Tarifario</h1>
          <p className="sub" style={{ marginTop: 6 }}>
            {vig ? `Versión vigente v${vig.version} · aprobada por ${vig.revisorNombre ?? vig.autorNombre} el ${fechaHora(vig.revisado ?? vig.creado)}` : "Sin versión aprobada: se usan valores de ejemplo."}
          </p>
        </div>
        {!borrador && (
          <button className={"btn " + (esSup ? "oscuro" : "primario")} onClick={() => { setBorrador({ ...base }); setMotivo(""); }}>
            {esSup ? "Editar tarifario" : "Proponer un cambio"}
          </button>
        )}
      </div>

      {!vig && <div className="aviso">Los costos actuales son de ejemplo. El supervisor debe cargar los costos reales de Iterative y guardar la versión 1.</div>}
      {error && <p className="error">{error}</p>}

      {esSup && pendientes.length > 0 && (
        <section className="tarjeta" style={{ borderColor: "var(--coral)" }}>
          <h2>Propuestas pendientes de aprobación ({pendientes.length})</h2>
          {pendientes.map((v) => (
            <div key={v.id} className="propuesta">
              <p><b>v{v.version}</b> · {v.autorNombre} · {fechaHora(v.creado)} · Motivo: <i>{v.motivo}</i></p>
              <Cambios antes={base} despues={v.datos} />
              <div className="fila">
                <button className="btn primario" disabled={ocupado} onClick={() => revisar(v, true)}>Aprobar</button>
                <button className="btn peligro" disabled={ocupado} onClick={() => revisar(v, false)}>Rechazar</button>
              </div>
            </div>
          ))}
        </section>
      )}
      {!esSup && pendientes.some((v) => v.autorId === usuario.id) && (
        <div className="aviso">Tiene propuestas esperando aprobación del supervisor.</div>
      )}

      {borrador && (
        <div className={"barra-guardar sucio"}>
          <span>{esSup ? "Editando: al guardar se publica una nueva versión vigente." : "Su propuesta quedará pendiente hasta que el supervisor la apruebe."}</span>
          <div className="fila" style={{ flex: 1, justifyContent: "flex-end" }}>
            <input className="motivo" placeholder="Motivo del cambio (obligatorio)" value={motivo} onChange={(e) => setMotivo(e.target.value)} />
            <button className="btn chico" onClick={() => setBorrador(null)}>Cancelar</button>
            <button className="btn primario" disabled={ocupado} onClick={enviar}>{esSup ? "Publicar versión" : "Enviar propuesta"}</button>
          </div>
        </div>
      )}

      {GRUPOS_TARIFA.map((g) => (
        <section key={g.grupo} className="tarjeta">
          <h2 style={{ marginBottom: 12 }}>{g.grupo}</h2>
          {borrador ? (
            <div className="rejilla">
              {g.campos.map((c) => (
                <Num key={c.k} label={c.t} f={c.f} value={borrador[c.k]} nota={c.nota}
                  onChange={(v) => setBorrador({ ...borrador, [c.k]: v })} />
              ))}
            </div>
          ) : (
            <table className="tabla">
              <tbody>
                {g.campos.map((c) => (
                  <tr key={c.k}><td>{c.t}{c.nota && <div className="sub" style={{ fontSize: 12 }}>{c.nota}</div>}</td><td className="num"><b>{fmt(c.f, base[c.k])}</b></td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      ))}

      <section className="tarjeta">
        <h2>Historial de versiones</h2>
        <div className="envoltura-tabla">
          <table className="tabla" style={{ marginTop: 8 }}>
            <thead><tr><th>Versión</th><th>Estado</th><th>Propuso</th><th>Revisó</th><th>Fecha</th><th>Motivo</th></tr></thead>
            <tbody>
              {versiones.map((v) => (
                <tr key={v.id}>
                  <td>v{v.version}{v.id === vig?.id && <span className="pastilla violeta" style={{ marginLeft: 6 }}>vigente</span>}</td>
                  <td><span className={"pastilla " + (v.estado === "aprobada" ? "verde" : v.estado === "pendiente" ? "amarillo" : "rojo")}>{v.estado}</span></td>
                  <td>{v.autorNombre}</td><td>{v.revisorNombre ?? "—"}</td><td>{fechaHora(v.creado)}</td><td>{v.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { FLUJO_PRINCIPAL, etapa, type EtapaId } from "../config/etapas";
import { repo } from "../lib/repo";
import { abierta, alertas, cop, diasEnEtapa, fechaCorta, fechaHora, hoyISO, semaforo, valorPonderado } from "../lib/reglas";
import type { Evento, Oportunidad, Usuario } from "../lib/types";

interface Props { usuario: Usuario; ops: Oportunidad[]; usuarios: Usuario[]; onCambio: () => Promise<void> }

/** Índice más alto del flujo principal que alcanzó la oportunidad (etapa actual o bitácora). */
function alcance(o: Oportunidad, ev: Evento[]): number {
  const idx = (id: EtapaId) => (id === "PIL" ? FLUJO_PRINCIPAL.indexOf("E3") : FLUJO_PRINCIPAL.indexOf(id));
  let max = idx(o.etapa);
  for (const e of ev) {
    if (e.oportunidadId !== o.id || (e.tipo !== "etapa" && e.tipo !== "perdida" && e.tipo !== "creacion")) continue;
    for (const m of e.detalle.matchAll(/(E\d|PIL)/g)) max = Math.max(max, idx(m[1] as EtapaId));
  }
  return max;
}

export default function Auditoria({ usuario, ops, usuarios, onCambio }: Props) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [ocupado, setOcupado] = useState("");
  useEffect(() => { repo.eventos().then(setEventos); }, [ops]);

  const hoy = hoyISO();
  const abiertas = ops.filter(abierta);
  const auditadas = new Set(eventos.filter((e) => e.tipo === "auditoria" && e.creado.slice(0, 10) === hoy).map((e) => e.oportunidadId));
  const rojas = abiertas.filter((o) => semaforo(o) === "rojo").sort((a, b) => alertas(b).length - alertas(a).length || diasEnEtapa(b) - diasEnEtapa(a));
  const conPaso = abiertas.filter((o) => o.siguienteFecha && o.siguienteFecha >= hoy && o.siguientePaso.trim()).length;
  const actividadHoy = eventos.filter((e) => e.creado.slice(0, 10) === hoy && e.tipo !== "auditoria");
  const nombre = (id: string) => usuarios.find((u) => u.id === id)?.nombre ?? "—";

  const embudo = useMemo(() => {
    const alc = ops.map((o) => alcance(o, eventos));
    return FLUJO_PRINCIPAL.map((id, i) => ({ id, n: alc.filter((a) => a >= i).length }));
  }, [ops, eventos]);
  const maxEmbudo = Math.max(1, ...embudo.map((e) => e.n));

  const auditar = async (o: Oportunidad) => {
    setOcupado(o.id);
    try { await repo.registrar(o.id, usuario, "auditoria", "Auditoría diaria: revisada"); setEventos(await repo.eventos()); await onCambio(); }
    finally { setOcupado(""); }
  };

  const comerciales = usuarios.filter((u) => u.rol === "comercial");

  return (
    <>
      <div className="cabecera">
        <div>
          <div className="etiqueta">Ritual diario del supervisor</div>
          <h1>Auditoría del {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}</h1>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="valor">{auditadas.size} / {abiertas.length}</div><div className="nombre">Oportunidades auditadas hoy</div></div>
        <div className="kpi"><div className={"valor" + (rojas.length ? " malo" : "")}>{rojas.length}</div><div className="nombre">En rojo</div></div>
        <div className="kpi"><div className={"valor" + (conPaso < abiertas.length ? " malo" : "")}>{abiertas.length ? Math.round((conPaso / abiertas.length) * 100) : 100} %</div><div className="nombre">Con siguiente paso (meta 100 %)</div></div>
        <div className="kpi"><div className="valor">{cop(abiertas.reduce((s, o) => s + valorPonderado(o), 0))}</div><div className="nombre">Pipeline ponderado</div></div>
        <div className="kpi"><div className="valor">{actividadHoy.length}</div><div className="nombre">Movimientos del equipo hoy</div></div>
      </div>

      <div className="tarjeta">
        <h2>Requieren acción hoy</h2>
        <p className="sub" style={{ margin: "4px 0 10px" }}>Cada una sale de la revisión con fecha y responsable, o se mueve a Perdida.</p>
        <div className="envoltura-tabla">
          <table className="tabla">
            <thead><tr><th>Empresa</th><th>Etapa</th><th>Comercial</th><th>Alertas</th><th className="num">Valor</th><th></th></tr></thead>
            <tbody>
              {rojas.map((o) => (
                <tr key={o.id}>
                  <td><a href={"#/op/" + o.id}><b>{o.empresa}</b></a></td>
                  <td>{o.etapa === "PIL" ? "Piloto" : o.etapa} · {etapa(o.etapa).corto}</td>
                  <td>{nombre(o.ownerId)}</td>
                  <td style={{ color: "#b0263a" }}>{alertas(o).join(" · ")}</td>
                  <td className="num">{cop(o.valor)}</td>
                  <td>
                    <button className="btn chico" disabled={auditadas.has(o.id) || ocupado === o.id} onClick={() => auditar(o)}>
                      {auditadas.has(o.id) ? "Auditada ✓" : "Auditar"}
                    </button>
                  </td>
                </tr>
              ))}
              {!rojas.length && <tr><td colSpan={6}>Todo al día. Ninguna oportunidad en rojo.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="detalle" style={{ marginTop: 16 }}>
        <div>
          <div className="tarjeta">
            <h2>Resumen por comercial</h2>
            <div className="envoltura-tabla">
              <table className="tabla" style={{ marginTop: 8 }}>
                <thead><tr><th>Comercial</th><th className="num">Abiertas</th><th className="num">En rojo</th><th className="num">Con paso</th><th className="num">Ponderado</th><th className="num">Movimientos hoy</th></tr></thead>
                <tbody>
                  {comerciales.map((u) => {
                    const mias = abiertas.filter((o) => o.ownerId === u.id);
                    const paso = mias.filter((o) => o.siguienteFecha && o.siguienteFecha >= hoy && o.siguientePaso.trim()).length;
                    return (
                      <tr key={u.id}>
                        <td><b>{u.nombre}</b></td>
                        <td className="num">{mias.length}</td>
                        <td className="num" style={{ color: mias.some((o) => semaforo(o) === "rojo") ? "#b0263a" : undefined }}>{mias.filter((o) => semaforo(o) === "rojo").length}</td>
                        <td className="num">{mias.length ? Math.round((paso / mias.length) * 100) : 100} %</td>
                        <td className="num">{cop(mias.reduce((s, o) => s + valorPonderado(o), 0))}</td>
                        <td className="num">{actividadHoy.filter((e) => e.autorId === u.id).length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="tarjeta">
            <h2>Embudo: oportunidades que alcanzaron cada etapa</h2>
            <div className="embudo" style={{ marginTop: 12 }}>
              {embudo.map((e, i) => (
                <div key={e.id} className="barra-e">
                  <span>{e.id} · {etapa(e.id).corto}</span>
                  <div className="pista"><div className="relleno" style={{ width: `${(e.n / maxEmbudo) * 100}%` }} /></div>
                  <span className="num">{e.n}{i > 0 && embudo[i - 1].n ? ` · ${Math.round((e.n / embudo[i - 1].n) * 100)} %` : ""}</span>
                </div>
              ))}
            </div>
            <p className="sub" style={{ marginTop: 10 }}>Metas del playbook: E1→E2 ≥ 40 % · E2→E3 ≥ 60 % · E3→E4 ≥ 75 % · E4→E7 ≥ 30 %.</p>
          </div>
        </div>

        <div className="tarjeta">
          <h2>Actividad reciente del equipo</h2>
          <ul className="linea-tiempo" style={{ marginTop: 10 }}>
            {eventos.slice(0, 25).map((e) => {
              const o = ops.find((x) => x.id === e.oportunidadId);
              return (
                <li key={e.id} className={e.tipo}>
                  <div><a href={"#/op/" + e.oportunidadId}><b>{o?.empresa ?? "—"}</b></a>: {e.detalle}</div>
                  <div className="quien">{e.autorNombre} · {fechaHora(e.creado)}</div>
                </li>
              );
            })}
          </ul>
          <p className="sub" style={{ marginTop: 8 }}>Próximos pasos de esta semana: {abiertas.filter((o) => o.siguienteFecha && o.siguienteFecha >= hoy && o.siguienteFecha <= new Date(Date.now() + 6 * 86_400_000).toISOString().slice(0, 10)).map((o) => `${o.empresa} (${fechaCorta(o.siguienteFecha)})`).join(", ") || "ninguno"}.</p>
        </div>
      </div>
    </>
  );
}

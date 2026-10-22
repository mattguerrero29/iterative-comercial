import { useMemo, useState } from "react";
import { ETAPAS, etapa, type EtapaId } from "../config/etapas";
import { alertas, cop, diasEnEtapa, fechaCorta, hoyISO, semaforo, valorPonderado, abierta } from "../lib/reglas";
import type { Oportunidad, Usuario } from "../lib/types";

const COLUMNAS: EtapaId[] = ["E0", "E1", "E2", "E3", "PIL", "E4", "E5", "E6", "E7"];

export default function Pipeline({ usuario, ops, usuarios }: { usuario: Usuario; ops: Oportunidad[]; usuarios: Usuario[] }) {
  const esSup = usuario.rol === "supervisor";
  const [filtro, setFiltro] = useState(esSup ? "todos" : usuario.id);
  const [verPerdidas, setVerPerdidas] = useState(false);

  const visibles = useMemo(
    () => ops.filter((o) => (filtro === "todos" || o.ownerId === filtro)),
    [ops, filtro],
  );
  const abiertas = visibles.filter(abierta);
  const rojas = abiertas.filter((o) => semaforo(o) === "rojo").length;
  const conPaso = abiertas.filter((o) => o.siguienteFecha && o.siguienteFecha >= hoyISO() && o.siguientePaso.trim()).length;
  const nombre = (id: string) => usuarios.find((u) => u.id === id)?.nombre ?? "";

  return (
    <>
      <div className="cabecera">
        <div>
          <div className="etiqueta">Pipeline comercial</div>
          <h1>{esSup ? "Oportunidades del equipo" : "Mis oportunidades"}</h1>
        </div>
        <div className="fila">
          {esSup && (
            <select className="filtro" value={filtro} onChange={(e) => setFiltro(e.target.value)} aria-label="Filtrar por comercial">
              <option value="todos">Todo el equipo</option>
              {usuarios.filter((u) => u.rol === "comercial").map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          )}
          <a className="btn primario" href="#/nueva">+ Nueva oportunidad</a>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi"><div className="valor">{abiertas.length}</div><div className="nombre">Oportunidades abiertas</div></div>
        <div className="kpi"><div className="valor">{cop(abiertas.reduce((s, o) => s + o.valor, 0))}</div><div className="nombre">Valor del pipeline</div></div>
        <div className="kpi"><div className="valor">{cop(abiertas.reduce((s, o) => s + valorPonderado(o), 0))}</div><div className="nombre">Valor ponderado</div></div>
        <div className="kpi"><div className={"valor" + (conPaso < abiertas.length ? " malo" : "")}>{abiertas.length ? Math.round((conPaso / abiertas.length) * 100) : 100} %</div><div className="nombre">Con siguiente paso agendado (meta 100 %)</div></div>
        <div className="kpi"><div className={"valor" + (rojas ? " malo" : "")}>{rojas}</div><div className="nombre">En rojo: requieren acción</div></div>
      </div>

      <div className="tablero">
        {COLUMNAS.map((id) => {
          const col = visibles.filter((o) => o.etapa === id);
          return (
            <section key={id} className={"columna" + (id === "PIL" ? " piloto" : "")}>
              <h3>
                <span>{id === "PIL" ? "Piloto" : `${id} · ${etapa(id).corto}`}</span>
                <small>{col.length}</small>
              </h3>
              {col.map((o) => <Tarjeta key={o.id} o={o} owner={esSup ? nombre(o.ownerId) : ""} />)}
            </section>
          );
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <button className="btn chico" onClick={() => setVerPerdidas(!verPerdidas)}>
          {verPerdidas ? "Ocultar" : "Ver"} perdidas ({visibles.filter((o) => o.etapa === "X").length})
        </button>
        {verPerdidas && (
          <div className="tarjeta" style={{ marginTop: 12 }}>
            <table className="tabla">
              <thead><tr><th>Empresa</th><th>Motivo</th><th className="num">Valor</th>{esSup && <th>Comercial</th>}</tr></thead>
              <tbody>
                {visibles.filter((o) => o.etapa === "X").map((o) => (
                  <tr key={o.id}><td><a href={"#/op/" + o.id}>{o.empresa}</a></td><td>{o.motivoPerdida}</td><td className="num">{cop(o.valor)}</td>{esSup && <td>{nombre(o.ownerId)}</td>}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <p className="sub" style={{ marginTop: 16 }}>
        Semáforo: <span className="punto verde" /> al día · <span className="punto amarillo" /> cerca del tiempo máximo de la etapa · <span className="punto rojo" /> sin siguiente paso, vencido o estancado.
        {" "}Etapas: {ETAPAS.filter((e) => e.maxDias).map((e) => `${e.id === "PIL" ? "Piloto" : e.id} ${e.maxDias} d`).join(" · ")}
      </p>
    </>
  );
}

function Tarjeta({ o, owner }: { o: Oportunidad; owner: string }) {
  const s = semaforo(o);
  const a = alertas(o);
  const vencido = !!o.siguienteFecha && o.siguienteFecha < hoyISO();
  return (
    <a className="op" href={"#/op/" + o.id} title={a.join(" · ")}>
      <div className="nombre"><span className={"punto " + s} />{o.empresa}</div>
      <div className="meta"><span>{o.valor ? cop(o.valor) : "Sin valor"}</span><span>{diasEnEtapa(o)} d en etapa</span></div>
      <div className={"paso" + (vencido || !o.siguienteFecha ? " vencido" : "")}>
        {o.siguienteFecha ? `${fechaCorta(o.siguienteFecha)} · ${o.siguientePaso || "sin descripción"}` : "Sin siguiente paso"}
      </div>
      {owner && <div className="meta"><span>{owner}</span><span>{o.ciudad}</span></div>}
    </a>
  );
}

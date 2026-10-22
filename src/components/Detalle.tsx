import { useCallback, useEffect, useMemo, useState } from "react";
import { etapa, MOTIVOS_PERDIDA, OPCIONES, type EtapaId } from "../config/etapas";
import { repo } from "../lib/repo";
import { abierta, alertas, bloqueosAvance, cop, diasEnEtapa, fechaCorta, fechaHora, hoyISO, semaforo } from "../lib/reglas";
import type { Evento, Oportunidad, TipoEvento, Usuario } from "../lib/types";
import Flujo from "./Flujo";
import CasoDimension from "./CasoDimension";
import CasoPropuesta from "./CasoPropuesta";
import Documentos from "./Documentos";
import Correos from "./Correos";
import { normalizarCaso, type Caso } from "../caso/tipos";
import { calcular, mm, variables } from "../caso/calculo";
import type { Tarifa } from "../caso/tarifario";

const PESTANAS = [
  ["seguimiento", "Seguimiento"], ["dimension", "Dimensionamiento"], ["propuesta", "Datos de la propuesta"],
  ["documentos", "Documentos"], ["correos", "Correos y WhatsApp"],
] as const;
type Pestana = (typeof PESTANAS)[number][0];

const ETIQUETA_SEM = { verde: "Al día", amarillo: "Cerca del límite", rojo: "Requiere acción", cerrada: "Cerrada" };

interface Props { usuario: Usuario; op: Oportunidad; usuarios: Usuario[]; tarifa: Tarifa; onCambio: () => Promise<void> }

export default function Detalle({ usuario, op, usuarios, tarifa, onCambio }: Props) {
  const esSup = usuario.rol === "supervisor";
  const puedeEditar = esSup || op.ownerId === usuario.id;
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [paso, setPaso] = useState(op.siguientePaso);
  const [fecha, setFecha] = useState(op.siguienteFecha ?? "");
  const [nota, setNota] = useState("");
  const [motivo, setMotivo] = useState("");
  const [editando, setEditando] = useState(false);
  const [datos, setDatos] = useState({ valor: op.valor, opcion: op.opcion, contacto: op.contacto, erp: op.erp, ciudad: op.ciudad });
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [tab, setTab] = useState<Pestana>("seguimiento");
  const owner0 = usuarios.find((u) => u.id === op.ownerId);
  const casoInicial = useCallback((): Caso => {
    const c = normalizarCaso(op.caso);
    if (!c.prop.NOMBRE_COMERCIAL && owner0) c.prop.NOMBRE_COMERCIAL = owner0.nombre;
    if (!c.prop.EMAIL && owner0) c.prop.EMAIL = owner0.email;
    return c;
  }, [op.caso, owner0]);
  const [caso, setCasoState] = useState<Caso>(casoInicial);
  const [sucio, setSucio] = useState(false);
  useEffect(() => { if (!sucio) setCasoState(casoInicial()); }, [casoInicial]); // eslint-disable-line react-hooks/exhaustive-deps
  const setCaso = (c: Caso) => { setCasoState(c); setSucio(true); };
  const k = useMemo(() => calcular(caso, tarifa), [caso, tarifa]);
  const vars = useMemo(() => variables(caso, k, op, tarifa), [caso, k, op, tarifa]);
  // Precios por debajo del multiplicador mínimo del tarifario: requieren visto bueno del supervisor
  const pr = caso.precios, cb1 = k.costeo.bodega1, ctot = k.costeo.total;
  const firmaPrecios = [pr.bodega1, pr.total, pr.etiqB1, pr.etiqTotal, caso.trm].join("|");
  const bajoMinimo = ([
    ["E2 · Bodega", pr.bodega1, cb1.precioMinimo, cb1.costo], ["E3 · Multisede", pr.total, ctot.precioMinimo, ctot.costo],
    ["Etiquetas Bodega", pr.etiqB1, cb1.precioEtiquetasMinimo, cb1.etiquetas], ["Etiquetas Multisede", pr.etiqTotal, ctot.precioEtiquetasMinimo, ctot.etiquetas],
  ] as const).filter(([, p, min, costo]) => p > 0 && costo > 0 && p < min).map(([n]) => n);
  const preciosAprobados = !bajoMinimo.length || caso.prop.APROB_MARGEN_PRECIOS === firmaPrecios;

  const cargarEventos = useCallback(() => repo.eventos(op.id).then(setEventos), [op.id]);
  useEffect(() => { cargarEventos(); }, [cargarEventos]);
  useEffect(() => { setPaso(op.siguientePaso); setFecha(op.siguienteFecha ?? ""); }, [op.siguientePaso, op.siguienteFecha]);

  const accion = async (cambios: Partial<Oportunidad>, tipo: TipoEvento, detalle: string) => {
    setOcupado(true); setError("");
    try { await repo.actualizar(op.id, cambios, usuario, { tipo, detalle }); await onCambio(); await cargarEventos(); }
    catch (e) { setError((e as Error).message); }
    finally { setOcupado(false); }
  };
  const registrar = async (tipo: TipoEvento, detalle: string) => {
    setOcupado(true); setError("");
    try { await repo.registrar(op.id, usuario, tipo, detalle); await cargarEventos(); }
    catch (e) { setError((e as Error).message); }
    finally { setOcupado(false); }
  };

  const et = etapa(op.etapa);
  const s = semaforo(op);
  const bloqueos = bloqueosAvance(op);
  const ahora = () => new Date().toISOString();
  const mover = (destino: EtapaId) =>
    accion({ etapa: destino, etapaDesde: ahora() }, "etapa", `${op.etapa} → ${destino} (${etapa(destino).nombre})`);
  const owner = usuarios.find((u) => u.id === op.ownerId);
  const auditadaHoy = eventos.some((e) => e.tipo === "auditoria" && e.creado.slice(0, 10) === hoyISO());

  return (
    <>
      <div className="cabecera">
        <div>
          <a href="#/" className="sub">← Pipeline</a>
          <h1 style={{ marginTop: 6 }}>{op.empresa}</h1>
          <div className="fila" style={{ marginTop: 8 }}>
            <span className={"pastilla " + s}><span className={"punto " + s} />{ETIQUETA_SEM[s]}</span>
            <span className="pastilla violeta">{op.etapa === "PIL" ? "Piloto" : op.etapa} · {et.nombre}</span>
            {abierta(op) && <span className="sub">{diasEnEtapa(op)} días en la etapa</span>}
          </div>
        </div>
        {esSup && abierta(op) && (
          <button className="btn oscuro" disabled={ocupado || auditadaHoy} onClick={() => registrar("auditoria", "Auditoría diaria: revisada" + (nota ? ` · ${nota}` : ""))}>
            {auditadaHoy ? "Auditada hoy ✓" : "Marcar auditada hoy"}
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}
      {alertas(op).length > 0 && (
        <div className="bloqueos" style={{ marginTop: 0, marginBottom: 16 }}><b>Alertas:</b> {alertas(op).join(" · ")}</div>
      )}

      <nav className="pestanas" role="tablist">
        {PESTANAS.map(([id, t]) => (
          <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? "activa" : ""} onClick={() => setTab(id)}>{t}</button>
        ))}
      </nav>

      {(tab === "dimension" || tab === "propuesta") && (
        <div className={"barra-guardar" + (sucio ? " sucio" : "")}>
          <span>{sucio ? "Cambios sin guardar" : "Caso guardado"} · Inversión recomendada {mm(k.invFase)} · CMD {mm(k.cmd)}</span>
          {puedeEditar && (
            <div className="fila">
              {sucio && <button className="btn chico" onClick={() => { setCasoState(casoInicial()); setSucio(false); }}>Descartar</button>}
              <button className="btn primario" disabled={!sucio || ocupado} onClick={async () => {
                await accion({ caso, valor: k.invFase || op.valor, opcion: caso.prop.OPCION_RECOMENDADA || op.opcion }, "edicion",
                  `Caso actualizado · ${caso.prop.OPCION_RECOMENDADA} · ${mm(k.invFase)} · CMD ${mm(k.cmd)}`);
                setSucio(false);
              }}>Guardar caso</button>
            </div>
          )}
        </div>
      )}
      {tab === "dimension" && <CasoDimension caso={caso} set={setCaso} k={k} editable={puedeEditar} tarifa={tarifa}
        bajoMinimo={bajoMinimo} preciosAprobados={preciosAprobados} esSup={esSup}
        aprobar={() => setCaso({ ...caso, prop: { ...caso.prop, APROB_MARGEN_PRECIOS: firmaPrecios, APROB_MARGEN_POR: `${usuario.nombre} · ${new Date().toLocaleDateString("es-CO")}` } })} />}
      {tab === "propuesta" && <CasoPropuesta caso={caso} set={setCaso} editable={puedeEditar} />}
      {tab === "documentos" && <Documentos usuario={usuario} op={op} vars={vars} k={k} caso={caso} sinGuardar={sucio} puedeEditar={puedeEditar} bloqueoPrecios={preciosAprobados ? "" : `Precios por debajo del margen mínimo (${bajoMinimo.join(", ")}): requieren visto bueno del supervisor en Dimensionamiento.`} onCambio={async () => { await onCambio(); await cargarEventos(); }} />}
      {tab === "correos" && <Correos vars={vars} />}

      {tab === "seguimiento" && <>
      <div className="tarjeta" style={{ marginBottom: 16 }}>
        <h2 style={{ marginBottom: 12 }}>Diagrama de flujo de la oportunidad</h2>
        <Flujo op={op} eventos={eventos} />
      </div>

      <div className="detalle">
        <div>
          {abierta(op) && (
            <div className="tarjeta">
              <h2>Salida de la etapa: {et.nombre}</h2>
              <p className="sub" style={{ margin: "4px 0 8px" }}>Marque lo cumplido. Para avanzar todo debe estar completo y con el siguiente paso agendado.</p>
              {et.salida.map((c) => (
                <label key={c.id} className="check">
                  <input type="checkbox" checked={!!op.checklist[c.id]} disabled={!puedeEditar || ocupado}
                    onChange={(e) => accion({ checklist: { ...op.checklist, [c.id]: e.target.checked } }, "checklist", `${e.target.checked ? "✓" : "✗"} ${c.texto}`)} />
                  <span>{c.texto}</span>
                </label>
              ))}
              {puedeEditar && (
                <>
                  {bloqueos.length > 0 && et.siguiente && (
                    <div className="bloqueos"><b>Para avanzar falta:</b><ul>{bloqueos.map((b) => <li key={b}>{b}</li>)}</ul></div>
                  )}
                  <div className="fila" style={{ marginTop: 14 }}>
                    {et.siguiente && (
                      <button className="btn primario" disabled={ocupado || bloqueos.length > 0} onClick={() => mover(et.siguiente!)}>
                        Avanzar a {et.siguiente === "E6" && op.etapa === "PIL" ? "E6 · Negociación" : `${et.siguiente} · ${etapa(et.siguiente).corto}`}
                      </button>
                    )}
                    {(op.etapa === "E3" || op.etapa === "E4") && (
                      <button className="btn" disabled={ocupado || !op.siguienteFecha || op.siguienteFecha < hoyISO()} onClick={() => mover("PIL")}>
                        Iniciar piloto pago
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {abierta(op) && puedeEditar && (
            <div className="tarjeta">
              <h2>Siguiente paso (obligatorio)</h2>
              <p className="sub" style={{ margin: "4px 0 12px" }}>Ninguna reunión termina sin el siguiente paso en calendario.</p>
              <div className="rejilla">
                <label className="campo">Qué se hará<input value={paso} onChange={(e) => setPaso(e.target.value)} placeholder="Ej. Reunión de decisión con CFO" /></label>
                <label className="campo">Fecha<input type="date" value={fecha} min={hoyISO()} onChange={(e) => setFecha(e.target.value)} /></label>
              </div>
              <button className="btn primario" style={{ marginTop: 12 }}
                disabled={ocupado || !paso.trim() || !fecha || fecha < hoyISO() || (paso === op.siguientePaso && fecha === op.siguienteFecha)}
                onClick={() => accion({ siguientePaso: paso.trim(), siguienteFecha: fecha }, "siguiente_paso", `Siguiente paso: ${paso.trim()} · ${fechaCorta(fecha)}`)}>
                Guardar siguiente paso
              </button>
            </div>
          )}

          <div className="tarjeta">
            <h2>Bitácora</h2>
            {puedeEditar && (
              <div style={{ margin: "12px 0" }}>
                <label className="campo">{esSup ? "Nota o comentario de auditoría" : "Nota de seguimiento"}
                  <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Qué pasó, qué dijo el cliente, qué fuerza está frenando la decisión…" />
                </label>
                <button className="btn chico" style={{ marginTop: 8 }} disabled={ocupado || !nota.trim()} onClick={async () => { await registrar("nota", nota.trim()); setNota(""); }}>Agregar nota</button>
              </div>
            )}
            <ul className="linea-tiempo">
              {eventos.map((e) => (
                <li key={e.id} className={e.tipo}>
                  <div>{e.detalle}</div>
                  <div className="quien">{e.autorNombre} · {fechaHora(e.creado)}</div>
                </li>
              ))}
              {!eventos.length && <li>Sin eventos todavía.</li>}
            </ul>
          </div>
        </div>

        <div>
          <div className="tarjeta">
            <div className="fila" style={{ justifyContent: "space-between" }}>
              <h2>Datos</h2>
              {puedeEditar && !editando && <button className="btn chico" onClick={() => setEditando(true)}>Editar</button>}
            </div>
            {!editando ? (
              <div className="datos">
                <div>Valor<b>{op.valor ? cop(op.valor) : "Sin definir"}</b></div>
                <div>Opción<b>{op.opcion}</b></div>
                <div>Ciudad<b>{op.ciudad || "—"}</b></div>
                <div>ERP<b>{op.erp || "—"}</b></div>
                <div>CIIU<b>{op.ciiu || "—"}</b></div>
                <div>Contacto<b>{op.contacto || "—"}</b></div>
                <div>Comercial<b>{owner?.nombre ?? "—"}</b></div>
                <div>Siguiente paso<b>{op.siguienteFecha ? `${fechaCorta(op.siguienteFecha)} · ${op.siguientePaso}` : "Sin agendar"}</b></div>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
                <label className="campo">Valor (COP)<input type="number" min={0} step={1000000} value={datos.valor} onChange={(e) => setDatos({ ...datos, valor: Number(e.target.value) })} /></label>
                <label className="campo">Opción<select value={datos.opcion} onChange={(e) => setDatos({ ...datos, opcion: e.target.value })}>{OPCIONES.map((o) => <option key={o}>{o}</option>)}</select></label>
                <label className="campo">Ciudad<input value={datos.ciudad} onChange={(e) => setDatos({ ...datos, ciudad: e.target.value })} /></label>
                <label className="campo">ERP<input value={datos.erp} onChange={(e) => setDatos({ ...datos, erp: e.target.value })} /></label>
                <label className="campo">Contacto<input value={datos.contacto} onChange={(e) => setDatos({ ...datos, contacto: e.target.value })} /></label>
                <div className="fila">
                  <button className="btn primario" disabled={ocupado} onClick={async () => { await accion(datos, "edicion", `Datos actualizados (valor ${cop(datos.valor)}, ${datos.opcion})`); setEditando(false); }}>Guardar</button>
                  <button className="btn" onClick={() => setEditando(false)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>

          {esSup && (
            <div className="tarjeta">
              <h2>Asignación</h2>
              <label className="campo" style={{ marginTop: 10 }}>Comercial responsable
                <select value={op.ownerId} disabled={ocupado} onChange={(e) => {
                  const n = usuarios.find((u) => u.id === e.target.value);
                  accion({ ownerId: e.target.value }, "edicion", `Reasignada a ${n?.nombre ?? ""}`);
                }}>
                  {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                </select>
              </label>
            </div>
          )}

          {abierta(op) && puedeEditar && (
            <div className="tarjeta">
              <h2>Cerrar como perdida</h2>
              <label className="campo" style={{ marginTop: 10 }}>Motivo
                <select value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                  <option value="">Seleccione…</option>
                  {MOTIVOS_PERDIDA.map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <button className="btn peligro" style={{ marginTop: 10 }} disabled={ocupado || !motivo}
                onClick={() => { if (confirm(`¿Marcar ${op.empresa} como perdida por "${motivo}"?`)) accion({ etapa: "X", etapaDesde: ahora(), motivoPerdida: motivo }, "perdida", `Perdida en ${op.etapa}: ${motivo}`); }}>
                Marcar como perdida
              </button>
            </div>
          )}

          {op.etapa === "X" && esSup && (
            <div className="tarjeta">
              <h2>Reabrir</h2>
              <p className="sub">Vuelve a Pre-exploración para reactivar la oportunidad.</p>
              <button className="btn" style={{ marginTop: 10 }} disabled={ocupado} onClick={() => accion({ etapa: "E1", etapaDesde: ahora(), motivoPerdida: null }, "etapa", "X → E1 (reabierta)")}>Reabrir en E1</button>
            </div>
          )}
        </div>
      </div>
      </>}
    </>
  );
}

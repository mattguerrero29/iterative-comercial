import { useState } from "react";
import type { Caso, Sede } from "../caso/tipos";
import { sedeVacia } from "../caso/tipos";
import { fx, mm, pct, pesos, type Calculo } from "../caso/calculo";
import { Num, Resultado } from "./Campos";
import { controlTributario, etiquetadoSede, gastosMensuales, preciosEntrada, type Tarifa } from "../caso/tarifario";
import { consultarTrmHoy } from "../caso/trm";

interface Props {
  caso: Caso; set: (c: Caso) => void; k: Calculo; editable: boolean; tarifa: Tarifa;
  bajoMinimo: string[]; preciosAprobados: boolean; esSup: boolean; aprobar: () => void;
}

export default function CasoDimension({ caso, set, k, editable, tarifa, bajoMinimo, preciosAprobados, esSup, aprobar }: Props) {
  const d = !editable;
  const up = <S extends keyof Caso>(sec: S, campo: keyof Caso[S]) => (v: unknown) =>
    set({ ...caso, [sec]: { ...(caso[sec] as object), [campo]: v } });
  const f = caso.fin, p = caso.precios, r = caso.ret, v = caso.ven, pl = caso.pil, dm = caso.dim;
  const setSede = (i: number, cambios: Partial<Sede>) =>
    set({ ...caso, dim: { ...dm, sedes: dm.sedes.map((s, j) => (j === i ? { ...s, ...cambios } : s)) } });
  const calc = (nombre: string) => k.sedes.find((s) => s.nombre === nombre);
  const sumaMix = caso.mix.normal + caso.mix.metalica + caso.mix.lavado + caso.mix.nfc;
  const hoy = new Date().toISOString().slice(0, 10);
  const [consultando, setConsultando] = useState(false);
  const [trmMsg, setTrmMsg] = useState("");
  const consultarTrm = async () => {
    setConsultando(true); setTrmMsg("");
    try {
      const r = await consultarTrmHoy();
      set({ ...caso, trm: r.valor, trmFecha: hoy });
      setTrmMsg(`TRM oficial vigente: $${fx(r.valor, 2)} (Superfinanciera, vigente desde ${r.desde}).`);
    } catch {
      setTrmMsg("No se pudo consultar la TRM en línea. Escríbala a mano desde www.banrep.gov.co.");
    } finally { setConsultando(false); }
  };
  const ctrlB1 = p.bodega1 > 0 && k.costeo.bodega1.costo > 0 ? controlTributario(p.bodega1, p.etiqB1, k.costeo.bodega1, tarifa) : null;
  const ctrlTot = p.total > 0 && k.costeo.total.costo > 0 ? controlTributario(p.total, p.etiqTotal, k.costeo.total, tarifa) : null;
  const entrada = preciosEntrada(caso, k.piloto.cTot, !!k.sedes[0]?.viaje, tarifa);
  const redM = (x: number) => Math.round(x / 1e6) * 1e6;
  const redK = (x: number) => Math.round(x / 1e5) * 1e5;
  const hwTotal = k.costeo.total.hardware;
  const mantComp = (hwTotal * tarifa.mantCompartido) / 12, mantFull = (hwTotal * tarifa.mantCompleto) / 12;
  const cuotaEtiq = caso.trm ? (dm.ubic * (tarifa.etiquetaNormalCop / ((1 + tarifa.arancel) * (1 + tarifa.ivaImportacion))) * (1 + tarifa.arancel) * tarifa.multEtiquetas) / 24 : 0;

  return (
    <>
      {/* ---------------- Finanzas */}
      <section className="tarjeta">
        <div className="etiqueta">1 · Finanzas · Fase 0</div>
        <h2>Estados financieros y sector</h2>
        <p className="sub">Fuente: Supersociedades y promedio del sector por CIIU. Porcentajes en %.</p>
        <div className="caso-grid">
          <div className="rejilla">
            <Num disabled={d} label="Ventas último ejercicio" f="cop" value={f.ventas} onChange={up("fin", "ventas")} />
            <Num disabled={d} label="Ventas ejercicio anterior" f="cop" value={f.ventasAnt} onChange={up("fin", "ventasAnt")} />
            <Num disabled={d} label="Margen bruto" f="pct" value={f.margen} onChange={up("fin", "margen")} />
            <Num disabled={d} label="Inventario en balance" f="cop" value={f.inventario} onChange={up("fin", "inventario")} />
            <Num disabled={d} label="Activo corriente" f="cop" value={f.ac} onChange={up("fin", "ac")} />
            <Num disabled={d} label="Pasivo corriente" f="cop" value={f.pc} onChange={up("fin", "pc")} />
            <Num disabled={d} label="Activo total" f="cop" value={f.at} onChange={up("fin", "at")} />
            <Num disabled={d} label="Pasivo total" f="cop" value={f.pt} onChange={up("fin", "pt")} />
            <Num disabled={d} label="Utilidad neta" f="cop" value={f.un} onChange={up("fin", "un")} />
            <Num disabled={d} label="Patrimonio" f="cop" value={f.pat} onChange={up("fin", "pat")} />
            <Num disabled={d} label="Crecimiento del sector" f="pct" value={f.crecSector} onChange={up("fin", "crecSector")} />
            <Num disabled={d} label="Razón corriente del sector" f="dec" value={f.rcSector} onChange={up("fin", "rcSector")} />
            <Num disabled={d} label="Endeudamiento del sector" f="pct" value={f.endSector} onChange={up("fin", "endSector")} />
            <Num disabled={d} label="ROE del sector" f="pct" value={f.roeSector} onChange={up("fin", "roeSector")} />
            <Num disabled={d} label="Empresas en la muestra" value={f.nEmpresas} onChange={up("fin", "nEmpresas")} />
          </div>
          <div className="panel-resultados">
            <Resultado label="Costo de mercancía por día (CMD)" valor={mm(k.cmd)} bueno />
            <Resultado label="Crecimiento del cliente" valor={pct(k.crec)} nota={`Brecha vs. sector: ${pct(k.brechas.crec)}`} />
            <Resultado label="Días de inventario (balance)" valor={fx(k.dioBal, 1) + " días"} />
            <Resultado label="Razón corriente" valor={fx(k.rc, 2)} nota={`Sector ${fx(f.rcSector, 2)}`} malo={k.rc < f.rcSector} />
            <Resultado label="Endeudamiento" valor={pct(k.end)} nota={`Sector ${pct(f.endSector)}`} malo={k.end > f.endSector} />
            <Resultado label="ROE" valor={pct(k.roe)} nota={`Sector ${pct(f.roeSector)}`} />
            <Resultado label="Argumento principal" valor={k.argumento} />
            <Resultado label="Escalón de entrada sugerido" valor={k.escalon} />
          </div>
        </div>
      </section>

      {/* ---------------- Sedes */}
      <section className="tarjeta">
        <div className="etiqueta">2 · Dimensionamiento</div>
        <h2>Sedes y hardware</h2>
        <p className="sub">Reglas del tarifario: 1 antena cada {fx(tarifa.m2PorAntena)} m² · {fx(tarifa.antenasPorLector)} antenas por lector de 4 puertos. Los arcos de puerta y los puntos para piezas pequeñas ya están dentro de las antenas y la obra civil.</p>
        <div className="envoltura-tabla" style={{ marginTop: 12 }}>
          <table className="tabla tabla-edit">
            <thead>
              <tr>
                <th>Sede</th><th>Ciudad</th><th>Otra ciudad (viáticos)</th><th>m² por piso</th><th>Pisos</th><th>Pistolas</th><th>Unidades a rastrear</th>
                <th className="calc">m² total</th><th className="calc">Antenas</th><th className="calc">Lectores</th><th className="calc">Cable (m)</th><th className="calc">Días etiquetado</th><th></th>
              </tr>
            </thead>
            <tbody>
              {dm.sedes.map((s, i) => {
                const c = calc(s.nombre);
                const n = (campo: "m2Piso" | "pisos" | "pistolas" | "unidades") => (
                  <input disabled={d} inputMode="decimal" value={String(s[campo] ?? 0)}
                    onChange={(e) => setSede(i, { [campo]: Number(e.target.value.replace(/\./g, "").replace(",", ".")) || 0 })} />
                );
                return (
                  <tr key={i}>
                    <td><input disabled={d} value={s.nombre} placeholder="Nombre" onChange={(e) => setSede(i, { nombre: e.target.value })} /></td>
                    <td><input disabled={d} value={s.ciudad} onChange={(e) => setSede(i, { ciudad: e.target.value })} /></td>
                    <td style={{ textAlign: "center" }}><input type="checkbox" disabled={d} checked={!!s.viaje} style={{ width: 18, minWidth: 18 }} onChange={(e) => setSede(i, { viaje: e.target.checked })} /></td>
                    <td>{n("m2Piso")}</td><td>{n("pisos")}</td><td>{n("pistolas")}</td><td>{n("unidades")}</td>
                    <td className="calc">{c ? fx(c.m2) : "—"}</td><td className="calc">{c?.antenas ?? "—"}</td>
                    <td className="calc">{c?.lectores ?? "—"}</td><td className="calc">{c ? fx(c.cable) : "—"}</td>
                    <td className="calc">{c ? etiquetadoSede(c, tarifa, caso.campo).diasSitio : "—"}</td>
                    <td>{editable && dm.sedes.length > 1 && <button className="btn chico" onClick={() => set({ ...caso, dim: { ...dm, sedes: dm.sedes.filter((_, j) => j !== i) } })}>✕</button>}</td>
                  </tr>
                );
              })}
              <tr className="total">
                <td>Total</td><td>{k.sedes.length} sedes</td><td colSpan={3}></td><td>{k.tot.pistolas}</td><td>{fx(k.tot.unidades)}</td>
                <td className="calc">{fx(k.tot.m2)}</td><td className="calc">{k.tot.antenas}</td><td className="calc">{k.tot.lectores}</td><td className="calc">{fx(k.tot.cable)}</td>
                <td className="calc">{k.sedes.reduce((a, s) => a + etiquetadoSede(s, tarifa, caso.campo).diasSitio, 0)}</td><td></td>
              </tr>
            </tbody>
          </table>
        </div>
        {editable && dm.sedes.length < 8 && (
          <button className="btn chico" style={{ marginTop: 10 }} onClick={() => set({ ...caso, dim: { ...dm, sedes: [...dm.sedes, sedeVacia()] } })}>+ Agregar sede</button>
        )}
        <h3 style={{ margin: "18px 0 8px" }}>Tipos de etiqueta (porcentaje de las unidades)</h3>
        <div className="rejilla">
          <Num disabled={d} label="Etiqueta normal" f="pct" value={caso.mix.normal} onChange={(x) => set({ ...caso, mix: { ...caso.mix, normal: x } })} />
          <Num disabled={d} label="Etiqueta metálica" f="pct" value={caso.mix.metalica} onChange={(x) => set({ ...caso, mix: { ...caso.mix, metalica: x } })} />
          <Num disabled={d} label="Lavado industrial" f="pct" value={caso.mix.lavado} onChange={(x) => set({ ...caso, mix: { ...caso.mix, lavado: x } })} />
          <Num disabled={d} label="NFC" f="pct" value={caso.mix.nfc} onChange={(x) => set({ ...caso, mix: { ...caso.mix, nfc: x } })} />
          <Num disabled={d} label="Ubicaciones / activos fijos" value={dm.ubic} onChange={(x) => set({ ...caso, dim: { ...dm, ubic: x } })} nota="Etiquetas fijas en consignación (P2)" />
        </div>
        {Math.abs(sumaMix - 1) > 0.001 && <p className="aviso" style={{ marginTop: 10 }}>La mezcla de etiquetas suma {pct(sumaMix)}: debe sumar 100 %.</p>}

        <h3 style={{ margin: "18px 0 8px" }}>Etiquetado y viáticos de este caso</h3>
        <div className="rejilla">
          <Num disabled={d} label="Ítems que etiqueta una persona al día" value={caso.campo.itemsDia || null}
            onChange={(x) => set({ ...caso, campo: { ...caso.campo, itemsDia: x } })}
            nota={`Vacío = ${fx(tarifa.etiquetadoItemsDia)} del tarifario. Menos para piezas difíciles (motores), más para cajas o calzado`} />
          <Num disabled={d} label="Hotel por noche, por persona" f="cop" value={caso.campo.hotel} onChange={(x) => set({ ...caso, campo: { ...caso.campo, hotel: x } })} nota="Solo sedes en otra ciudad · noches = días − 1" />
          <Num disabled={d} label="Alimentación por día, por persona" f="cop" value={caso.campo.alimentacion} onChange={(x) => set({ ...caso, campo: { ...caso.campo, alimentacion: x } })} />
          <Num disabled={d} label="Tiquete ida y vuelta, por persona" f="cop" value={caso.campo.tiquete} onChange={(x) => set({ ...caso, campo: { ...caso.campo, tiquete: x } })} />
        </div>
      </section>

      {/* ---------------- Escalera y precios */}
      <section className="tarjeta">
        <div className="etiqueta">Land &amp; Expand · costeo con el tarifario</div>
        <h2>Escalera de inversión</h2>
        <div className="fila trm" style={{ margin: "12px 0" }}>
          <Num disabled={d} label="TRM de la operación" f="dec" value={caso.trm} onChange={(x) => set({ ...caso, trm: x, trmFecha: caso.trmFecha || hoy })} />
          <label className="campo">Fecha de la TRM<input type="date" disabled={d} value={caso.trmFecha} onChange={(e) => set({ ...caso, trmFecha: e.target.value })} /></label>
          {editable && <button className="btn" disabled={consultando} onClick={consultarTrm}>{consultando ? "Consultando…" : "Consultar TRM de hoy"}</button>}
          {trmMsg && <span className="sub">{trmMsg}</span>}
        </div>
        {!caso.trm && <p className="bloqueos" style={{ marginTop: 0 }}>Sin TRM no se puede costear: consulte o escriba la TRM del día.</p>}
        {caso.trm > 0 && caso.trmFecha && caso.trmFecha !== hoy && (
          <p className="aviso">La TRM del caso es del {caso.trmFecha}. Si hoy se hace la operación, actualícela.</p>
        )}

        <div className="envoltura-tabla">
          <table className="tabla margen-tabla">
            <thead><tr><th>Concepto</th><th className="num">Hardware</th><th className="num">Software</th><th className="num">Obra civil</th><th className="num">Costo</th><th className="num">Precio sugerido</th><th className="num">Mínimo sin aprobación</th><th className="num">Precio actual</th><th className="num">Multiplicador</th><th></th></tr></thead>
            <tbody>
              {([["E0 · Diagnóstico", "diag", entrada.diag.costo, entrada.diag.precio, 0, null, redK],
                 ["E1 · Piloto 1 mes", "piloto", entrada.piloto.costo, entrada.piloto.precio, 0, null, redK],
                 ["E2 · Bodega individual", "bodega1", k.costeo.bodega1.costo - k.costeo.bodega1.etiquetas, k.costeo.bodega1.precio, k.costeo.bodega1.precioMinimo, k.costeo.bodega1, redM],
                 ["E3 · Multisede", "total", k.costeo.total.costo - k.costeo.total.etiquetas, k.costeo.total.precio, k.costeo.total.precioMinimo, k.costeo.total, redM],
                 ["Etiquetas · Bodega (aparte)", "etiqB1", k.costeo.bodega1.etiquetas, k.costeo.bodega1.precioEtiquetas, k.costeo.bodega1.precioEtiquetasMinimo, null, redK],
                 ["Etiquetas · Multisede (aparte)", "etiqTotal", k.costeo.total.etiquetas, k.costeo.total.precioEtiquetas, k.costeo.total.precioEtiquetasMinimo, null, redK],
              ] as const).map(([n, key, costo, sugerido, minimo, b, red]) => {
                const actual = p[key]; const bajo = minimo > 0 && actual > 0 && actual < minimo;
                return (
                  <tr key={key}>
                    <td>{n}</td>
                    <td className="num">{b ? mm(b.hardware) : ""}</td><td className="num">{b ? mm(b.software) : ""}</td><td className="num">{b ? mm(b.obra) : ""}</td>
                    <td className="num">{mm(costo)}</td><td className="num"><b>{mm(sugerido)}</b></td><td className="num">{minimo ? mm(minimo) : "—"}</td>
                    <td className="num">{mm(actual)}</td>
                    <td className={"num " + (actual && costo ? (bajo ? "malo" : "ok") : "")}>{actual && costo ? fx(actual / costo, 2) + "x" : "—"}</td>
                    <td>{editable && costo > 0 && <button className="btn chico" onClick={() => set({ ...caso, precios: { ...p, [key]: red(sugerido) } })}>Usar</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="sub" style={{ marginTop: 6 }}>Multiplicadores: hardware ×{fx(tarifa.multHardware, 2)} (mínimo ×{fx(tarifa.multMinimo, 2)}) · software ×{fx(tarifa.multSoftware, 2)} · obra civil ×{fx(tarifa.multObra, 2)} · etiquetas aparte ×{fx(tarifa.multEtiquetas, 2)} (mínimo ×{fx(tarifa.multEtiquetasMinimo, 2)}) · diagnóstico y piloto: costo directo ×{fx(tarifa.multEntrada, 2)}. Precios antes de IVA.</p>
        {k.sedes.some((s) => s.viaje) && !(caso.campo.hotel || caso.campo.alimentacion || caso.campo.tiquete) && (
          <p className="aviso">Hay sedes en otra ciudad, pero este caso aún no tiene valores de hotel, alimentación ni tiquete (sección Sedes): los viáticos se están costeando en $0.</p>
        )}

        <div className="rejilla" style={{ marginTop: 14 }}>
          <Num disabled={d} label="E0 · Diagnóstico" f="cop" value={p.diag} onChange={up("precios", "diag")} nota={`${fx(k.dias.diag, 1)} días de inventario lo pagan`} />
          <Num disabled={d} label="E1 · Piloto 1 mes" f="cop" value={p.piloto} onChange={up("precios", "piloto")} nota="Costo directo en la sección Piloto" />
          <Num disabled={d} label="E2 · Bodega individual" f="cop" value={p.bodega1} onChange={up("precios", "bodega1")} nota={`${fx(k.dias.bodega1, 1)} días lo pagan`} />
          <Num disabled={d} label="E3 · Multisede" f="cop" value={p.total} onChange={up("precios", "total")} nota={`${fx(k.dias.total, 1)} días lo pagan`} />
          <Num disabled={d} label="Etiquetas · Bodega (aparte)" f="cop" value={p.etiqB1} onChange={up("precios", "etiqB1")} />
          <Num disabled={d} label="Etiquetas · Multisede (aparte)" f="cop" value={p.etiqTotal} onChange={up("precios", "etiqTotal")} />
          <Num disabled={d} label="Umbral de junta" f="cop" value={p.umbral} onChange={up("precios", "umbral")}
            nota={k.ofrecerEntrada ? "Supera el umbral: ofrecer también Bodega 1 o Piloto" : "Bajo el umbral: proyecto completo por fases"} />
        </div>
        <div className="fila" style={{ marginTop: 10 }}>
          {editable && k.costeo.total.costo > 0 && (
            <button className="btn chico" onClick={() => set({ ...caso, precios: { ...p,
              diag: redK(entrada.diag.precio), piloto: redK(entrada.piloto.precio),
              bodega1: redM(k.costeo.bodega1.precio), total: redM(k.costeo.total.precio),
              etiqB1: redK(k.costeo.bodega1.precioEtiquetas), etiqTotal: redK(k.costeo.total.precioEtiquetas) } })}>
              Aplicar todos los precios sugeridos
            </button>
          )}
          {editable && k.costeo.total.hardware > 0 && (
            <button className="btn chico" onClick={() => set({ ...caso, prop: { ...caso.prop,
              MENS_COMP: pesos(Math.round(mantComp / 1e4) * 1e4), MENS_FULL: pesos(Math.round(mantFull / 1e4) * 1e4),
              CUOTA_ETIQUETAS: pesos(Math.round(cuotaEtiq / 1e3) * 1e3) } })}>
              Usar mantenimiento de referencia ({pesos(Math.round(mantComp / 1e4) * 1e4)} / {pesos(Math.round(mantFull / 1e4) * 1e4)} al mes)
            </button>
          )}
        </div>

        {bajoMinimo.length > 0 && (
          <div className={preciosAprobados ? "aviso" : "bloqueos"} style={{ marginTop: 12 }}>
            {preciosAprobados ? (
              <>Precios por debajo del mínimo ({bajoMinimo.join(", ")}) <b>aprobados por {caso.prop.APROB_MARGEN_POR}</b>. Si cambia un precio, la aprobación se pierde.</>
            ) : (
              <>
                <b>Requiere visto bueno del supervisor:</b> {bajoMinimo.join(", ")} queda por debajo del mínimo del tarifario. Hasta aprobarlo no se pueden generar P1, P2 ni A4.
                {esSup && editable && <div style={{ marginTop: 8 }}><button className="btn oscuro chico" onClick={aprobar}>Aprobar estos precios</button> <span className="sub">(luego guarde el caso)</span></div>}
              </>
            )}
          </div>
        )}

        <details style={{ marginTop: 14 }}>
          <summary className="sub">Detalle de costos del proyecto multisede (COP, sin IVA)</summary>
          <table className="tabla" style={{ marginTop: 8 }}>
            <thead><tr><th>Ítem</th><th className="num">Cantidad</th><th className="num">Costo</th></tr></thead>
            <tbody>
              {k.costeo.total.detalle.map((x) => <tr key={x.item}><td>{x.item}</td><td className="num">{fx(x.cantidad)}</td><td className="num">{pesos(Math.round(x.costo))}</td></tr>)}
            </tbody>
          </table>
        </details>

        <h3 style={{ margin: "18px 0 8px" }}>Control interno: impuestos y utilidad</h3>
        <div className="envoltura-tabla">
          <table className="tabla">
            <thead><tr><th>Concepto</th><th className="num">E2 · Bodega</th><th className="num">E3 · Multisede</th></tr></thead>
            <tbody>
              {([
                ["Precio de venta con etiquetas (antes de IVA)", "precio"], ["IVA generado", "ivaGenerado"], ["Total factura", "totalFactura"],
                ["IVA descontable (importación)", "ivaDescontable"], ["IVA a pagar a la DIAN", "ivaAPagar"],
                ["Retención en la fuente (la descuenta el cliente)", "retencion"], ["El cliente paga", "clientePaga"],
                ["ICA a pagar", "ica"], ["Utilidad bruta", "utilidad"], ["Utilidad después de ICA", "utilidadTrasIca"],
              ] as const).map(([t, key]) => (
                <tr key={key}><td>{t}</td>
                  {[ctrlB1, ctrlTot].map((c, i) => <td key={i} className="num">{c ? mm(c[key]) : "—"}</td>)}
                </tr>
              ))}
              <tr><td>Margen sobre el precio</td>{[ctrlB1, ctrlTot].map((c, i) => <td key={i} className="num">{c ? pct(c.margen) : "—"}</td>)}</tr>
              <tr><td>Meses de gastos operativos cubiertos</td>{[ctrlB1, ctrlTot].map((c, i) => <td key={i} className="num"><b>{c ? fx(c.mesesCubiertos, 1) : "—"}</b></td>)}</tr>
            </tbody>
          </table>
        </div>
        <p className="sub" style={{ marginTop: 6 }}>Gastos operativos mensuales del tarifario: {mm(gastosMensuales(tarifa))}. La retención en la fuente es un anticipo del impuesto de renta.</p>
      </section>

      {/* ---------------- Retorno + Ventas */}
      <section className="tarjeta">
        <div className="etiqueta">3 · Retorno · 4 · Ventas</div>
        <h2>Proceso actual y retorno</h2>
        <div className="rejilla" style={{ marginTop: 12 }}>
          <Num disabled={d} label="Días de inventario medidos (visita)" value={r.dioMedido} onChange={(x) => set({ ...caso, ret: { ...r, dioMedido: x || null } })} nota="Vacío = usa el de balance" />
          <Num disabled={d} label="Conteos completos al año" value={r.conteos} onChange={up("ret", "conteos")} />
          <Num disabled={d} label="Personas por conteo" value={r.pers} onChange={up("ret", "pers")} />
          <Num disabled={d} label="Días por conteo" value={r.diasC} onChange={up("ret", "diasC")} />
          <Num disabled={d} label="Exactitud del último conteo" f="pct" value={r.exact} onChange={up("ret", "exact")} />
          <Num disabled={d} label="Compras duplicadas al año" value={r.dupN} onChange={up("ret", "dupN")} />
          <Num disabled={d} label="Valor por compra duplicada" f="cop" value={r.dupV} onChange={up("ret", "dupV")} />
          <Num disabled={d} label="Consultas de disponibilidad/día" value={v.cons} onChange={up("ven", "cons")} />
          <Num disabled={d} label="Minutos para confirmar hoy" value={v.tAct} onChange={up("ven", "tAct")} />
          <Num disabled={d} label="% que termina en venta perdida" f="pct" value={v.noconf} onChange={up("ven", "noconf")} />
          <Num disabled={d} label="Ticket promedio" f="cop" value={v.ticket} onChange={up("ven", "ticket")} />
          <Num disabled={d} label="% recuperable con RFID" f="pct" value={v.recup} onChange={up("ven", "recup")} />
        </div>
        <div className="kpis" style={{ marginTop: 16 }}>
          <div className="kpi"><div className="valor">{mm(k.retorno.caja)}</div><div className="nombre">Caja inmovilizada ({fx(k.retorno.dio, 0)} días)</div></div>
          <div className="kpi"><div className="valor">{mm(k.ventas.vperd)}</div><div className="nombre">Ventas perdidas al año</div></div>
          <div className="kpi"><div className="valor">{mm(k.ventas.ubRec)}</div><div className="nombre">Utilidad bruta recuperable/año</div></div>
          <div className="kpi"><div className="valor">{fx(k.retorno.hAct - k.retorno.hNew)} h</div><div className="nombre">Horas de conteo liberadas/año</div></div>
        </div>
        <div className="envoltura-tabla">
          <table className="tabla">
            <thead><tr><th>Escenario (inversión {mm(k.invFase)})</th><th className="num">Conservador</th><th className="num">Base</th><th className="num">Optimista</th></tr></thead>
            <tbody>
              <tr><td>Días de inventario reducidos</td>{k.retorno.escenarios.map((e, i) => (
                <td key={i} className="num"><input disabled={d} className="mini" value={e.dias} onChange={(ev) => {
                  const es = [...r.escenarios] as [number, number, number]; es[i] = Number(ev.target.value) || 0; set({ ...caso, ret: { ...r, escenarios: es } });
                }} /></td>))}</tr>
              <tr><td>Caja liberada</td>{k.retorno.escenarios.map((e, i) => <td key={i} className="num">{mm(e.caja)}</td>)}</tr>
              <tr><td>Cobertura de la inversión</td>{k.retorno.escenarios.map((e, i) => <td key={i} className="num"><b>{fx(e.cobertura, 1)}x</b></td>)}</tr>
              <tr><td>Meses para recuperar lo restante</td>{k.retorno.escenarios.map((e, i) => <td key={i} className="num">{e.neta ? fx(e.meses, 1) : "Inmediato"}</td>)}</tr>
              <tr><td>Valor a 3 años</td>{k.retorno.escenarios.map((e, i) => <td key={i} className="num">{mm(e.v3)}</td>)}</tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------- Piloto */}
      <section className="tarjeta">
        <div className="etiqueta">5 · Piloto</div>
        <div className="fila" style={{ justifyContent: "space-between" }}>
          <h2>Viabilidad del piloto pago</h2>
          <span className={"pastilla " + (k.piloto.semaforo === "VERDE" ? "verde" : k.piloto.semaforo === "AMARILLO" ? "amarillo" : "rojo")}>{k.piloto.semaforo}</span>
        </div>
        <p className="sub" style={{ margin: "4px 0 12px" }}>{k.piloto.accion}</p>
        <div className="rejilla">
          <Num disabled={d} label="Equipos (uso 1 mes)" f="cop" value={pl.eq} onChange={up("pil", "eq")} />
          <Num disabled={d} label="Unidades a etiquetar" value={pl.und} onChange={up("pil", "und")} />
          <Num disabled={d} label="Costo por etiqueta" f="cop" value={pl.cEt} onChange={up("pil", "cEt")} />
          <Num disabled={d} label="Horas de ingeniería" value={pl.hIng} onChange={up("pil", "hIng")} />
          <Num disabled={d} label="Viajes" value={pl.viajes} onChange={up("pil", "viajes")} />
          <Num disabled={d} label="Tiquetes por viaje" f="cop" value={pl.tiq} onChange={up("pil", "tiq")} />
          <Num disabled={d} label="Viáticos por día" f="cop" value={pl.viat} onChange={up("pil", "viat")} />
          <Num disabled={d} label="Probabilidad de cierre" f="pct" value={pl.prob} onChange={up("pil", "prob")} />
        </div>
        <div className="fila" style={{ margin: "12px 0" }}>
          {([["patro", "CFO o Gerente firmó la orden"], ["exito", "Criterios de éxito escritos"], ["agenda", "Reunión de resultados agendada"]] as const).map(([c, t]) => (
            <label key={c} className="check" style={{ border: 0, padding: 0 }}>
              <input type="checkbox" disabled={d} checked={pl[c]} onChange={(e) => set({ ...caso, pil: { ...pl, [c]: e.target.checked } })} /> {t}
            </label>
          ))}
        </div>
        <div className="panel-resultados horizontal">
          <Resultado label="Costo total" valor={mm(k.piloto.cTot)} />
          <Resultado label="Precio mínimo" valor={mm(k.piloto.pMin)} malo={p.piloto < k.piloto.pMin} nota={`Precio actual ${mm(p.piloto)}`} />
          <Resultado label="Índice de viabilidad" valor={fx(k.piloto.iv, 1) + "x"} malo={!k.piloto.c1} nota="Mínimo 5x" />
          <Resultado label="Desplazamiento" valor={pct(k.piloto.pctDesp)} malo={!k.piloto.c3} nota="Máximo 30 %" />
        </div>
      </section>
    </>
  );
}

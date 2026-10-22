// Motor de cálculo: las mismas fórmulas de la matriz Excel (hojas Finanzas, Dimension, Retorno, Ventas y Piloto).
import type { Oportunidad } from "../lib/types";
import type { Caso } from "./tipos";
import { cantidadesSede, costear, TARIFA_EJEMPLO, type Tarifa } from "./tarifario";

const div = (a: number, b: number) => (b ? a / b : 0);

export function calcular(c: Caso, t: Tarifa = TARIFA_EJEMPLO) {
  const f = c.fin, p = c.precios, d = c.dim, r = c.ret, v = c.ven, pl = c.pil;

  // ---- Finanzas
  const crec = div(f.ventas, f.ventasAnt) ? div(f.ventas, f.ventasAnt) - 1 : 0;
  const vdia = f.ventas / 365;
  const cmd = (f.ventas * (1 - f.margen)) / 365;
  const dioBal = div(f.inventario, cmd);
  const rc = div(f.ac, f.pc), end = div(f.pt, f.at), roe = div(f.un, f.pat);
  const brechas = { crec: crec - f.crecSector, liq: f.rcSector - rc, end: end - f.endSector, roe: roe - f.roeSector };
  const dias = { diag: div(p.diag, cmd), piloto: div(p.piloto, cmd), bodega1: div(p.bodega1, cmd), total: div(p.total, cmd) };
  const creceMas = brechas.crec > 0, liqMenor = rc < f.rcSector, endMayor = end > f.endSector;
  const argumento = creceMas && liqMenor ? "Caja liberada del inventario para financiar el crecimiento"
    : creceMas ? "Capacidad para escalar sin perder control ni ventas"
    : endMayor ? "Reducir capital inmovilizado y compras duplicadas" : "Productividad y exactitud contable";
  const escalon = creceMas && liqMenor ? "E2 · Bodega individual (Opción B)"
    : creceMas ? "E3 · Proyecto completo por fases"
    : endMayor ? "E1 · Piloto pago (Opción A)" : "E0 · Diagnóstico + E1 Piloto";

  // ---- Dimensionamiento (reglas del tarifario: 1 antena cada N m², lectores = antenas ÷ antenas por lector)
  const sedes = d.sedes.filter((s) => s.nombre.trim()).map((s) => {
    const q = cantidadesSede(s.m2Piso * s.pisos, s.pistolas, s.unidades, t, !!s.viaje);
    return { ...s, ...q };
  });
  const sum = (k: "m2" | "antenas" | "lectores" | "pistolas" | "cable" | "rj45" | "unidades") => sedes.reduce((a, s) => a + s[k], 0);
  const tot = { m2: sum("m2"), antenas: sum("antenas"), lectores: sum("lectores"), pistolas: sum("pistolas"),
    cable: sum("cable"), rj45: sum("rj45"), unidades: sum("unidades"), sedes: sedes.length };
  const etiq = { prod: tot.unidades, fijas: d.ubic };

  // ---- Costeo con el tarifario (Bodega 1 = primera sede; Multisede = todas, con software, flete y seguro una sola vez)
  const trm = c.trm || 0;
  const costeo = {
    bodega1: costear(sedes.slice(0, 1), c.mix, trm, t, c.campo),
    total: costear(sedes, c.mix, trm, t, c.campo),
  };

  // ---- Ventas
  const vperd = v.cons * v.noconf * v.ticket * v.dias;
  const ubperd = vperd * f.margen;
  const ubRec = ubperd * v.recup;
  const hAhorro = Math.max(0, v.tAct - v.tRfid) * v.cons * v.dias / 60;
  const ventas = { vperd, ubperd, ubRec, hAhorro, cAhorro: hAhorro * v.costoH };

  // ---- Inversión recomendada
  const op = c.prop.OPCION_RECOMENDADA ?? "";
  const invFase = op.startsWith("E1") ? p.piloto : op.startsWith("E3") ? p.total : op.startsWith("E0") ? p.diag : p.bodega1;

  // ---- Retorno
  const dio = r.dioMedido ?? dioBal;
  const hAct = r.conteos * r.pers * r.diasC * r.hDia, hNew = r.conteosRfid * r.persRfid * r.hRfid;
  const ahConteo = Math.max(0, hAct - hNew) * r.costoHH;
  const dup = r.dupN * r.dupV;
  const escenarios = r.escenarios.map((dd, i) => {
    const caja = dd * cmd, rec = ahConteo + ubRec, dupv = dup * [0.5, 0.75, 1][i];
    const neta = Math.max(0, invFase - caja);
    return { dias: dd, pct: div(dd, dio), caja, rec, dupv, cobertura: div(caja, invFase), neta,
      meses: rec + dupv ? neta / ((rec + dupv) / 12) : 0, v3: caja + 3 * (rec + dupv) };
  });
  const retorno = { dio, caja: dio * cmd, hAct, hNew, ahConteo, dup, gap: Math.max(0, r.exactObj - r.exact), escenarios };

  // ---- Piloto
  const cEtq = pl.und * pl.cEt, cIng = pl.hIng * pl.tarifa, cDesp = pl.viajes * (pl.tiq + pl.viat * pl.dViaje);
  const cTot = pl.eq + cEtq + cIng + cDesp;
  const ve = p.bodega1 * pl.prob, iv = div(ve, cTot), pctDesp = div(cDesp, cTot);
  const c1 = iv >= 5, c2 = p.bodega1 >= 150_000_000, c3 = pctDesp <= 0.3;
  const semaforo = !c1 || !c2 || !pl.patro || !pl.exito ? "ROJO" : !c3 || !pl.agenda ? "AMARILLO" : "VERDE";
  const accion = semaforo === "VERDE" ? "Aprobar piloto"
    : semaforo === "AMARILLO" ? (!c3 ? "Proponer Diagnóstico de 1 día + instalación guiada remota, o agrupar viaje con otro cliente" : "Agendar la reunión de resultados antes de instalar")
    : "No ofrecer piloto: ofrecer Diagnóstico (E0) o Bodega 1 (E2)";
  const abono = pl.dFirma <= pl.dCred ? p.piloto : pl.dFirma <= pl.dLim ? p.piloto * pl.pTard : 0;
  const piloto = { cEtq, cIng, cDesp, cTot, pMin: cTot * (1 + pl.mMin), mReal: div(p.piloto - cTot, p.piloto), pctDesp, ve, iv,
    c1, c2, c3, semaforo, accion, abono, saldo: p.bodega1 - abono };

  return { crec, vdia, cmd, dioBal, rc, end, roe, brechas, dias, argumento, escalon, ofrecerEntrada: p.total > p.umbral,
    sedes, tot, etiq, costeo, ventas, invFase, retorno, piloto };
}

export type Calculo = ReturnType<typeof calcular>;

// ---------------------------------------------------------------- formato
export const fx = (n: number, dec = 0) => (Number.isFinite(n) ? n : 0).toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const mm = (n: number) => "$" + fx(n / 1_000_000, 0) + " M";
export const pct = (n: number) => fx(n * 100, 1) + " %";
export const pesos = (n: number) => "$" + fx(n, 0);

/** Variables [TOKEN] → texto, equivalentes a la hoja "Propuesta" de la matriz. */
export function variables(c: Caso, k: Calculo, op: Oportunidad, t: Tarifa = TARIFA_EJEMPLO): Record<string, string> {
  const v: Record<string, string> = {
    EMPRESA: op.empresa, ERP: op.erp || "su ERP", CIIU: op.ciiu, N_EMPRESAS: fx(c.fin.nEmpresas),
    "CRECIMIENTO_CLIENTE_%": pct(k.crec), "CRECIMIENTO_SECTOR_%": pct(c.fin.crecSector),
    VENTAS_ANUALES: mm(c.fin.ventas), VENTAS_DIA: mm(k.vdia), "MARGEN_BRUTO_%": pct(c.fin.margen),
    CMD: mm(k.cmd), CMD_M: fx(k.cmd / 1e6), INVERSION_FASE: mm(k.invFase), DIAS_PAGAN_FASE: k.cmd ? fx(k.invFase / k.cmd, 1) : "-",
    PRECIO_PILOTO: mm(c.precios.piloto), PRECIO_BODEGA1: mm(c.precios.bodega1), PRECIO_TOTAL: mm(c.precios.total),
    PRECIO_ETIQ_B1: c.precios.etiqB1 ? mm(c.precios.etiqB1) : "por cotizar", PRECIO_ETIQ_TOT: c.precios.etiqTotal ? mm(c.precios.etiqTotal) : "por cotizar",
    D_PIL: fx(k.dias.piloto, 1), D_B1: fx(k.dias.bodega1, 1), D_TOT: fx(k.dias.total, 1),
    SEDE_1: k.sedes[0]?.nombre ?? "principal", N_SEDES: fx(k.sedes.length), M2_TOTAL: fx(k.tot.m2),
    TRM: "$" + fx(c.trm, 2), FECHA_TRM: c.trmFecha ? new Date(c.trmFecha + "T12:00:00").toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" }) : "",
    DIAS_CONTEO_ACTUAL: fx(c.ret.diasC), EXACTITUD_ACTUAL: pct(c.ret.exact),
    PAGO_50: mm(k.invFase * 0.5), PAGO_40: mm(k.invFase * 0.4), PAGO_10: mm(k.invFase * 0.1),
    DIAS_CREDITO: fx(c.pil.dCred), "%_ABONO_TARDIO": pct(c.pil.pTard), DIAS_LIMITE: fx(c.pil.dLim),
    ETIQ_FIJAS: fx(k.etiq.fijas), ETIQ_PRODUCTO: fx(k.etiq.prod),
    T_LECT: fx(k.tot.lectores), T_ANT: fx(k.tot.antenas), T_HH: fx(k.tot.pistolas), T_CABLE: fx(k.tot.cable), T_SERV: fx(k.tot.sedes),
    T_PUNTOS: fx(k.tot.antenas), T_UNIDADES: fx(k.tot.unidades), M2_POR_ANTENA: fx(t.m2PorAntena),
    // usados por correos
    DIO_REAL: fx(k.retorno.dio, 0), CAJA_INMOVILIZADA: mm(k.retorno.caja), "%_REDUCCION": k.retorno.dio ? fx((k.invFase / (k.cmd || 1)) / k.retorno.dio * 100, 1) : "-",
    VENTAS_PERDIDAS_EST: mm(k.ventas.vperd), CONSULTAS_DIA: fx(c.ven.cons), "%_NO_CONFIRMADAS": pct(c.ven.noconf),
    CRECIMIENTO_CLIENTE: pct(k.crec), CRECIMIENTO_SECTOR: pct(c.fin.crecSector),
  };
  for (const [key, val] of Object.entries(c.prop)) if (key !== "FECHA_TRM" || !v.FECHA_TRM) v[key] = val;
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(v)) out["[" + key + "]"] = val;
  return out;
}

/** Reemplaza [TOKENS] en un texto. Los que no tienen valor quedan visibles para completarlos. */
export const llenar = (texto: string, vars: Record<string, string>) =>
  texto.replace(/\[[A-Z0-9_%]+\]/g, (t) => (vars[t] !== undefined && vars[t] !== "" ? vars[t] : t));

/** Tokens sin valor dentro de un conjunto de textos. */
export const faltantes = (textos: string[], vars: Record<string, string>) =>
  [...new Set(textos.flatMap((t) => t.match(/\[[A-Z0-9_%]+\]/g) ?? []).filter((t) => !vars[t]))];

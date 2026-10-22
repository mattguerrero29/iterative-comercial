// Tarifario FLEX: réplica de la matriz "Costos Iterative SAS" (hoja FLEX ESTRUCTURA COSTOS Y COT),
// con los ajustes acordados: el IVA de importación se descuenta (no es costo), el agente aduanero se calcula
// sobre el valor CIF (incluye flete y seguro) y se cobra dentro del hardware, y la obra civil se vende ×1,5.
// Es global, versionado, y solo el supervisor aprueba cambios.
import type { Caso } from "./tipos";

export interface Tarifa {
  // Dimensionamiento
  m2PorAntena: number; antenasPorLector: number; cableMPorAntena: number; rj45PorAntena: number;
  // Hardware (USD = importado o en dólares; COP = compra local)
  antenaUsd: number; lectorUsd: number; lectorNacionalizacionCop: number; pistolaUsd: number;
  cableUsdMetro: number; backupUsd: number; pcCop: number; upsCop: number; rj45Cop: number; switchCop: number; zebraCop: number; ivaCompraLocal: number;
  // Importación (por proyecto)
  fleteUsd: number; seguroUsd: number; arancel: number; ivaImportacion: number; agenteAduanero: number;
  // Etiquetas
  etiquetaNormalCop: number; etiquetaNfcCop: number; etiquetaMetalicaUsd: number; etiquetaLavadoUsd: number;
  // Etiquetado inicial (mano de obra): días-persona por sede = ítems ÷ ítems por día (hacia arriba), con un mínimo
  etiquetadoDiasBase: number; etiquetadoItemsDia: number; etiquetadoPersonas: number;
  // Costo de una persona en campo (etiquetado y diagnóstico)
  sueldoTecnico: number; factorPrestacional: number; diasLaboralesMes: number;
  // Obra civil (por sede)
  puntoCop: number; soporteCop: number; soporteFijoCop: number; andamioCop: number; imprevistos: number;
  // Software (por proyecto)
  horaDesarrolloUsd: number; horasDesarrollo: number; proyectosObjetivo: number;
  // Multiplicadores de venta
  multHardware: number; multEtiquetas: number; multSoftware: number; multObra: number; multMinimo: number; multEtiquetasMinimo: number;
  // Escalones de entrada (diagnóstico y piloto): costo directo × multiplicador
  multEntrada: number; horasDia: number; diagDias: number; diagTecnicos: number; diagHorasInforme: number;
  // Impuestos (control interno)
  ivaVenta: number; retefuente: number; icaPorMil: number;
  // Gastos operativos mensuales de Iterative
  arriendo: number; nomina: number; servicios: number; contabilidad: number; otros: number;
  // Mantenimiento: % anual sobre el hardware (valores de referencia del playbook, no vienen de la matriz)
  mantCompartido: number; mantCompleto: number;
}

export type Formato = "cop" | "usd" | "pct" | "num" | "mult";
type Campo = { k: keyof Tarifa; t: string; f: Formato; nota?: string };
export const GRUPOS_TARIFA: { grupo: string; campos: Campo[] }[] = [
  { grupo: "Reglas de dimensionamiento", campos: [
    { k: "m2PorAntena", t: "m² cubiertos por antena", f: "num", nota: "Antenas = metraje total ÷ este valor, hacia arriba" },
    { k: "antenasPorLector", t: "Antenas por lector (4 puertos)", f: "num", nota: "Se dejan puertos libres para asegurar la lectura" },
    { k: "cableMPorAntena", t: "Metros de cable coaxial por antena", f: "num" },
    { k: "rj45PorAntena", t: "Conectores RJ45 por antena", f: "num" },
  ] },
  { grupo: "Hardware importado (por unidad)", campos: [
    { k: "antenaUsd", t: "Antena (FOB)", f: "usd" },
    { k: "lectorUsd", t: "Lector 4 puertos (FOB)", f: "usd" },
    { k: "lectorNacionalizacionCop", t: "Nacionalización por lector (con IVA)", f: "cop", nota: "Costo real de traerlo; el IVA incluido se descuenta" },
    { k: "pistolaUsd", t: "Pistola lectora (FOB)", f: "usd" },
  ] },
  { grupo: "Hardware local (por sede)", campos: [
    { k: "pcCop", t: "PC Tinny", f: "cop" }, { k: "backupUsd", t: "Almacenamiento de respaldo", f: "usd" },
    { k: "upsCop", t: "UPS regulada", f: "cop" }, { k: "switchCop", t: "Switch", f: "cop" }, { k: "zebraCop", t: "Impresora Zebra de etiquetas", f: "cop" },
    { k: "cableUsdMetro", t: "Cable coaxial, por metro", f: "usd" }, { k: "rj45Cop", t: "Conector RJ45", f: "cop" },
    { k: "ivaCompraLocal", t: "IVA incluido en PC, UPS, switch y Zebra", f: "pct", nota: "Se descuenta: el costo queda sin IVA" },
  ] },
  { grupo: "Importación (por proyecto)", campos: [
    { k: "fleteUsd", t: "Flete internacional", f: "usd" }, { k: "seguroUsd", t: "Seguro de carga", f: "usd" },
    { k: "arancel", t: "Arancel", f: "pct", nota: "Sobre FOB + flete + seguro" },
    { k: "agenteAduanero", t: "Agente aduanero", f: "pct", nota: "Sobre el valor CIF importado; se cobra dentro del hardware" },
    { k: "ivaImportacion", t: "IVA de importación", f: "pct", nota: "Descontable: no suma al costo" },
  ] },
  { grupo: "Etiquetas", campos: [
    { k: "etiquetaNormalCop", t: "Etiqueta normal (puesta en Colombia, con arancel e IVA)", f: "cop" },
    { k: "etiquetaNfcCop", t: "Etiqueta NFC (puesta en Colombia, con arancel e IVA)", f: "cop" },
    { k: "etiquetaMetalicaUsd", t: "Etiqueta metálica (FOB)", f: "usd" },
    { k: "etiquetaLavadoUsd", t: "Etiqueta lavado industrial (FOB)", f: "usd" },
  ] },
  { grupo: "Etiquetado inicial (mano de obra, se cotiza con las etiquetas)", campos: [
    { k: "etiquetadoItemsDia", t: "Ítems que etiqueta una persona en un día", f: "num", nota: "Promedio 1.000–2.000 según el producto. Cada caso puede cambiarlo" },
    { k: "etiquetadoDiasBase", t: "Días mínimos por sede", f: "num" },
    { k: "etiquetadoPersonas", t: "Personas por sede", f: "num", nota: "Más personas terminan antes; el costo de mano de obra es el mismo" },
  ] },
  { grupo: "Personal en campo", campos: [
    { k: "sueldoTecnico", t: "Sueldo mensual promedio", f: "cop" },
    { k: "factorPrestacional", t: "Factor prestacional", f: "mult", nota: "Mismo factor de la nómina en la matriz" },
    { k: "diasLaboralesMes", t: "Días hábiles al mes", f: "num", nota: "Costo día = sueldo × factor ÷ días hábiles" },
  ] },
  { grupo: "Obra civil (por sede)", campos: [
    { k: "puntoCop", t: "Punto por antena", f: "cop" }, { k: "soporteCop", t: "Soporte por antena", f: "cop" },
    { k: "soporteFijoCop", t: "Soportes, costo fijo", f: "cop" }, { k: "andamioCop", t: "Andamio", f: "cop" },
    { k: "imprevistos", t: "Imprevistos", f: "pct" },
  ] },
  { grupo: "Software (por proyecto)", campos: [
    { k: "horaDesarrolloUsd", t: "Hora de desarrollo", f: "usd" }, { k: "horasDesarrollo", t: "Horas de desarrollo", f: "num" },
    { k: "proyectosObjetivo", t: "Proyectos entre los que se reparte", f: "num" },
  ] },
  { grupo: "Multiplicadores de venta", campos: [
    { k: "multHardware", t: "Hardware (incluye flete, seguro y agente)", f: "mult" },
    { k: "multSoftware", t: "Software", f: "mult" }, { k: "multObra", t: "Obra civil", f: "mult" },
    { k: "multMinimo", t: "Mínimo sin aprobación en hardware", f: "mult", nota: "Por debajo, el precio requiere visto bueno del supervisor" },
    { k: "multEtiquetas", t: "Etiquetas y etiquetado (se cotizan aparte)", f: "mult" },
    { k: "multEtiquetasMinimo", t: "Mínimo sin aprobación en etiquetas", f: "mult" },
  ] },
  { grupo: "Diagnóstico y piloto (propuesta de método, ajustable)", campos: [
    { k: "multEntrada", t: "Multiplicador sobre el costo directo", f: "mult", nota: "Se abona 100 % al proyecto si el cliente firma" },
    { k: "diagDias", t: "Diagnóstico: días en sitio", f: "num" }, { k: "diagTecnicos", t: "Diagnóstico: personas en sitio", f: "num" },
    { k: "diagHorasInforme", t: "Diagnóstico: horas del informe", f: "num" },
    { k: "horasDia", t: "Horas por día (para valorar las horas del informe)", f: "num" },
  ] },
  { grupo: "Impuestos (control interno)", campos: [
    { k: "ivaVenta", t: "IVA en la venta", f: "pct" }, { k: "retefuente", t: "Retención en la fuente", f: "pct" },
    { k: "icaPorMil", t: "ICA (por mil)", f: "num" },
  ] },
  { grupo: "Gastos operativos mensuales", campos: [
    { k: "arriendo", t: "Arriendo", f: "cop" }, { k: "nomina", t: "Nómina", f: "cop" }, { k: "servicios", t: "Servicios", f: "cop" },
    { k: "contabilidad", t: "Contabilidad", f: "cop" }, { k: "otros", t: "Otros", f: "cop" },
  ] },
  { grupo: "Mantenimiento (referencia del playbook)", campos: [
    { k: "mantCompartido", t: "Plan Compartido (% anual del hardware)", f: "pct", nota: "Valor de referencia: no viene de la matriz de costos" },
    { k: "mantCompleto", t: "Plan Completo (% anual del hardware)", f: "pct", nota: "Valor de referencia: no viene de la matriz de costos" },
  ] },
];

/** Valores de la matriz "Costos Iterative SAS" (hoja FLEX), con los ajustes acordados. */
export const TARIFA_EJEMPLO: Tarifa = {
  m2PorAntena: 48, antenasPorLector: 2, cableMPorAntena: 5, rj45PorAntena: 15,
  antenaUsd: 75, lectorUsd: 626, lectorNacionalizacionCop: 867_885, pistolaUsd: 420,
  cableUsdMetro: 3, backupUsd: 400, pcCop: 2_700_000, upsCop: 7_000_000, rj45Cop: 1_900, switchCop: 700_000, zebraCop: 3_600_000, ivaCompraLocal: 0.19,
  fleteUsd: 2_500, seguroUsd: 150, arancel: 0.05, ivaImportacion: 0.19, agenteAduanero: 0.02,
  etiquetaNormalCop: 1_113.6, etiquetaNfcCop: 700, etiquetaMetalicaUsd: 0.23, etiquetaLavadoUsd: 0.04,
  etiquetadoDiasBase: 1, etiquetadoItemsDia: 1_500, etiquetadoPersonas: 1,
  sueldoTecnico: 3_000_000, factorPrestacional: 1.37, diasLaboralesMes: 22,
  puntoCop: 600_000, soporteCop: 190_000, soporteFijoCop: 2_500_000, andamioCop: 3_000_000, imprevistos: 0.10,
  horaDesarrolloUsd: 30, horasDesarrollo: 780, proyectosObjetivo: 10,
  multHardware: 2.75, multEtiquetas: 1.75, multSoftware: 2.1, multObra: 1.5, multMinimo: 2.35, multEtiquetasMinimo: 1.75,
  multEntrada: 1.5, horasDia: 8, diagDias: 1, diagTecnicos: 2, diagHorasInforme: 8,
  ivaVenta: 0.19, retefuente: 0.025, icaPorMil: 11.04,
  arriendo: 1_500_000, nomina: 18_000_000, servicios: 350_000, contabilidad: 1_750_000, otros: 950_000,
  mantCompartido: 0.12, mantCompleto: 0.20,
};

export type EstadoTarifa = "aprobada" | "pendiente" | "rechazada";
export interface VersionTarifa {
  id: string; version: number; datos: Tarifa; motivo: string; estado: EstadoTarifa;
  autorId: string; autorNombre: string; revisorNombre: string | null; creado: string; revisado: string | null;
}

export const tarifaVigente = (vs: VersionTarifa[]): VersionTarifa | null =>
  vs.filter((v) => v.estado === "aprobada").sort((a, b) => b.version - a.version)[0] ?? null;

export const gastosMensuales = (t: Tarifa) => t.arriendo + t.nomina + t.servicios + t.contabilidad + t.otros;

// ---------------------------------------------------------------- costeo (todo en COP)
export interface Cantidades { m2: number; antenas: number; lectores: number; pistolas: number; cable: number; rj45: number; unidades: number; viaje: boolean }

export function cantidadesSede(m2: number, pistolas: number, unidades: number, t: Tarifa, viaje = false): Cantidades {
  const antenas = m2 > 0 ? Math.ceil(m2 / t.m2PorAntena - 1e-9) : 0;
  return { m2, antenas, lectores: antenas ? Math.ceil(antenas / t.antenasPorLector - 1e-9) : 0, pistolas,
    cable: antenas * t.cableMPorAntena, rj45: antenas * t.rj45PorAntena, unidades, viaje };
}

export interface Bloques {
  hardware: number;    // costo hardware + flete + seguro + agente (sin IVA de importación)
  etiquetas: number;   // etiquetas + mano de obra del etiquetado (se cotiza aparte)
  software: number;
  obra: number;        // con imprevistos
  costo: number;       // suma de bloques
  ivaDescontable: number;
  precio: number;      // proyecto (hardware + software + obra) con multiplicadores objetivo
  precioMinimo: number; // proyecto con el mínimo en hardware
  precioEtiquetas: number; precioEtiquetasMinimo: number;
  detalle: { item: string; cantidad: number; costo: number }[];
}

/** Costea un conjunto de sedes como un proyecto (software, flete y seguro una sola vez). */
export function costear(sedes: Cantidades[], mix: Caso["mix"], trm: number, t: Tarifa, campo: Caso["campo"] = CAMPO_VACIO): Bloques {
  const usd = (v: number) => v * trm;
  const sum = (k: Exclude<keyof Cantidades, "viaje">) => sedes.reduce((a, s) => a + s[k], 0);
  const n = sedes.length;
  const ant = sum("antenas"), lect = sum("lectores"), pis = sum("pistolas"), cab = sum("cable"), rj = sum("rj45"), und = sum("unidades");
  const detalle: Bloques["detalle"] = [];
  const add = (item: string, cantidad: number, costo: number) => { if (cantidad) detalle.push({ item, cantidad, costo }); return costo; };

  // FOB importado (base para arancel, agente e IVA descontable)
  const fobAnt = ant * usd(t.antenaUsd), fobPis = pis * usd(t.pistolaUsd), fobLect = lect * usd(t.lectorUsd);
  const flete = n ? usd(t.fleteUsd) : 0, seguro = n ? usd(t.seguroUsd) : 0;
  const cifConArancel = (fobAnt + fobPis + flete + seguro) * (1 + t.arancel);
  let hw = 0;
  hw += add("Antenas", ant, fobAnt * (1 + t.arancel));
  const nacSinIva = t.lectorNacionalizacionCop / (1 + t.ivaImportacion);
  hw += add("Lectores 4 puertos", lect, fobLect + lect * nacSinIva);
  hw += add("Pistolas lectoras", pis, fobPis * (1 + t.arancel));
  hw += add("Cable coaxial (m)", cab, cab * usd(t.cableUsdMetro));
  hw += add("Conectores RJ45", rj, rj * t.rj45Cop);
  const local = (v: number) => v / (1 + t.ivaCompraLocal);
  const localConIva = n * (t.pcCop + t.upsCop + t.switchCop + t.zebraCop);
  hw += add("PC Tinny", n, n * local(t.pcCop));
  hw += add("Almacenamiento de respaldo", n, n * usd(t.backupUsd));
  hw += add("UPS regulada", n, n * local(t.upsCop));
  hw += add("Switch", n, n * local(t.switchCop));
  hw += add("Impresora Zebra", n, n * local(t.zebraCop));
  hw += add("Flete internacional", n ? 1 : 0, flete * (1 + t.arancel));
  hw += add("Seguro de carga", n ? 1 : 0, seguro * (1 + t.arancel));
  hw += add("Agente aduanero", n ? 1 : 0, (fobAnt + fobPis + fobLect + flete + seguro) * t.agenteAduanero);

  // Etiquetas: precios puestos en Colombia se llevan a FOB (÷ (1+arancel)(1+IVA)) y se les suma solo el arancel
  const factorPuesto = (1 + t.arancel) * (1 + t.ivaImportacion);
  const fobEtiq = und * (mix.normal * t.etiquetaNormalCop / factorPuesto + mix.nfc * t.etiquetaNfcCop / factorPuesto
    + mix.metalica * usd(t.etiquetaMetalicaUsd) + mix.lavado * usd(t.etiquetaLavadoUsd));
  let etiquetas = add("Etiquetas", und, fobEtiq * (1 + t.arancel));
  const et = sedes.reduce((a, s) => {
    const r = etiquetadoSede(s, t, campo);
    return { dias: a.dias + r.diasPersona, mano: a.mano + r.manoObra, viat: a.viat + r.viaticos };
  }, { dias: 0, mano: 0, viat: 0 });
  etiquetas += add("Etiquetado: mano de obra (días-persona)", et.dias, et.mano);
  etiquetas += add("Etiquetado: viáticos", et.viat ? 1 : 0, et.viat);

  const software = add("Software (cuota del desarrollo)", n ? 1 : 0, n ? usd((t.horaDesarrolloUsd * t.horasDesarrollo) / (t.proyectosObjetivo || 1)) : 0);
  const obraBase = ant * t.puntoCop + ant * t.soporteCop + n * t.soporteFijoCop + n * t.andamioCop;
  const obra = add("Obra civil (con imprevistos)", n, obraBase * (1 + t.imprevistos));

  const ivaDescontable = (cifConArancel + fobEtiq * (1 + t.arancel)) * t.ivaImportacion
    + lect * (t.lectorNacionalizacionCop - nacSinIva) + (localConIva - localConIva / (1 + t.ivaCompraLocal));
  const costo = hw + etiquetas + software + obra;
  return {
    hardware: hw, etiquetas, software, obra, costo, ivaDescontable, detalle,
    precio: hw * t.multHardware + software * t.multSoftware + obra * t.multObra,
    precioMinimo: hw * t.multMinimo + software * t.multSoftware + obra * t.multObra,
    precioEtiquetas: etiquetas * t.multEtiquetas, precioEtiquetasMinimo: etiquetas * t.multEtiquetasMinimo,
  };
}

/** Control interno de impuestos y utilidad para un precio de venta (antes de IVA). */
export function controlTributario(precioProyecto: number, precioEtiquetas: number, b: Bloques, t: Tarifa) {
  const precio = precioProyecto + precioEtiquetas;
  const ivaGenerado = precio * t.ivaVenta;
  const retencion = precio * t.retefuente;
  const ica = precio * (t.icaPorMil / 1000);
  const utilidad = precio - b.costo;
  const utilidadTrasIca = utilidad - ica;
  const gastos = gastosMensuales(t);
  return {
    precio, totalFactura: precio + ivaGenerado, ivaGenerado, ivaDescontable: b.ivaDescontable,
    ivaAPagar: Math.max(0, ivaGenerado - b.ivaDescontable), retencion, ica,
    clientePaga: precio + ivaGenerado - retencion, utilidad, utilidadTrasIca,
    margen: precio ? utilidad / precio : 0, multiplicador: b.costo ? precio / b.costo : 0,
    mesesCubiertos: gastos ? utilidadTrasIca / gastos : 0,
  };
}

/** Normaliza una tarifa guardada con una estructura anterior. */
export const normalizarTarifa = (d: Partial<Tarifa> | null | undefined): Tarifa => {
  const t = { ...TARIFA_EJEMPLO };
  for (const k of Object.keys(t) as (keyof Tarifa)[]) if (d && typeof d[k] === "number") t[k] = d[k] as number;
  return t;
};

/** Diagnóstico y piloto: costo directo × multiplicador de entrada (método propuesto, ajustable en el tarifario). */
export function preciosEntrada(c: Caso, costoPiloto: number, viajeSedePrincipal: boolean, t: Tarifa) {
  const dia = costoDia(t);
  const viaje = viajeSedePrincipal ? viaticos(t.diagDias, t.diagTecnicos, c.campo ?? CAMPO_VACIO) : 0;
  const diagCosto = t.diagDias * t.diagTecnicos * dia + (t.diagHorasInforme / (t.horasDia || 8)) * dia + viaje;
  return {
    diag: { costo: diagCosto, precio: diagCosto * t.multEntrada },
    piloto: { costo: costoPiloto, precio: costoPiloto * t.multEntrada },
  };
}

/** Costo de un día de una persona en campo: sueldo × factor prestacional ÷ días hábiles. */
export const costoDia = (t: Tarifa) => (t.sueldoTecnico * t.factorPrestacional) / (t.diasLaboralesMes || 22);

/** Viáticos de un viaje: noches = días − 1, alimentación todos los días y un tiquete por persona. */
export const viaticos = (dias: number, personas: number, v: Caso["campo"]) =>
  personas * (Math.max(0, dias - 1) * v.hotel + dias * v.alimentacion + v.tiquete);

/** Valores de campo vacíos (ítems por día del tarifario y viáticos en cero). */
export const CAMPO_VACIO: Caso["campo"] = { itemsDia: 0, hotel: 0, alimentacion: 0, tiquete: 0 };

/**
 * Etiquetado de una sede: días-persona = ítems ÷ ítems por día (hacia arriba, nunca menos que el mínimo).
 * Los días en sitio se reparten entre las personas; los viáticos se calculan sobre esos días en sitio.
 */
export function etiquetadoSede(s: Cantidades, t: Tarifa, campo: Caso["campo"] = CAMPO_VACIO) {
  const porDia = campo.itemsDia || t.etiquetadoItemsDia || 1500;
  const personas = Math.max(1, t.etiquetadoPersonas);
  const diasPersona = s.unidades > 0 ? Math.max(t.etiquetadoDiasBase, Math.ceil(s.unidades / porDia - 1e-9)) : 0;
  const diasSitio = Math.ceil(diasPersona / personas);
  return { diasPersona, diasSitio, porDia, manoObra: diasPersona * costoDia(t),
    viaticos: s.viaje && diasSitio ? viaticos(diasSitio, personas, campo) : 0 };
}

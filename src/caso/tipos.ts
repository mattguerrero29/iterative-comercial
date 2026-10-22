// Datos de dimensionamiento de un caso: reemplazan las hojas de entrada de la matriz Excel.

/** Una sede (recinto). Metraje total = metraje por piso × pisos. */
export interface Sede {
  nombre: string; ciudad: string; m2Piso: number; pisos: number; pistolas: number; unidades: number;
  /** La sede queda en otra ciudad: se cobran viáticos. */
  viaje: boolean;
}

export interface Caso {
  fin: {
    ventas: number; ventasAnt: number; crecSector: number; margen: number; inventario: number;
    ac: number; pc: number; pt: number; at: number; un: number; pat: number;
    rcSector: number; endSector: number; roeSector: number; nEmpresas: number;
  };
  precios: { diag: number; piloto: number; bodega1: number; total: number; umbral: number; etiqB1: number; etiqTotal: number };
  /** TRM usada para costear (la del día en que se hace la operación). */
  trm: number; trmFecha: string;
  /** Mezcla de etiquetas por tipo (fracciones que suman 1). */
  mix: { normal: number; metalica: number; lavado: number; nfc: number };
  /** Datos de campo del caso: ritmo de etiquetado (0 = el del tarifario) y viáticos por persona, llenados a mano. */
  campo: { itemsDia: number; hotel: number; alimentacion: number; tiquete: number };
  dim: { sedes: Sede[]; ubic: number };
  ret: {
    dioMedido: number | null; conteos: number; pers: number; diasC: number; hDia: number; costoHH: number;
    hRfid: number; persRfid: number; conteosRfid: number; exact: number; exactObj: number; dupN: number; dupV: number;
    escenarios: [number, number, number];
  };
  ven: { cons: number; tAct: number; tRfid: number; noconf: number; ticket: number; dias: number; recup: number; costoH: number };
  pil: {
    eq: number; und: number; cEt: number; hIng: number; tarifa: number; viajes: number; tiq: number; viat: number; dViaje: number;
    mMin: number; prob: number; patro: boolean; exito: boolean; agenda: boolean; dCred: number; pTard: number; dLim: number; dFirma: number;
  };
  prop: Record<string, string>;
}

/** Textos de la propuesta: clave = variable de las plantillas sin corchetes. */
export const CAMPOS_PROPUESTA: { grupo: string; campos: [string, string, string?][] }[] = [
  { grupo: "Presentación", campos: [
    ["MES_AAAA", "Mes de la presentación"], ["OPCION_RECOMENDADA", "Opción recomendada", "opcion"], ["FUENTE_MARGEN", "Fuente del margen bruto"],
    ["FECHA_REUNION_DECISION", "Fecha de la reunión de decisión"], ["FECHA_PROPUESTA", "Fecha propuesta para la visita técnica"], ["DIAS_ENTREGA", "Días para entregar resultados de la visita"],
  ] },
  { grupo: "Dolores confirmados (palabras del cliente)", campos: [
    ["DOLOR_1_TITULO", "Dolor 1 · título"], ["DOLOR_1_CIFRA", "Dolor 1 · cifra", "largo"],
    ["DOLOR_2_TITULO", "Dolor 2 · título"], ["DOLOR_2_CIFRA", "Dolor 2 · cifra", "largo"],
    ["DOLOR_3_TITULO", "Dolor 3 · título"], ["DOLOR_3_CIFRA", "Dolor 3 · cifra", "largo"],
    ["CITA_LITERAL_CHAMPION", "Frase literal del Champion", "largo"],
  ] },
  { grupo: "Comité de decisión", campos: [
    ["NOMBRE_CEO", "CEO / Gerente"], ["NOMBRE_CFO", "Gerente financiero"], ["NOMBRE_CHAMPION", "Champion (Operaciones)"], ["NOMBRE_TI", "Director de TI"],
  ] },
  { grupo: "Iterative", campos: [
    ["NOMBRE_COMERCIAL", "Comercial"], ["CARGO", "Cargo"], ["CELULAR", "Celular"], ["EMAIL", "Correo"], ["NOMBRE_INGENIERO", "Responsable técnico"],
  ] },
  { grupo: "Alcance y tiempos", campos: [
    ["ZONA_PILOTO", "Alcance del piloto"], ["SEM_PIL", "Semanas piloto"], ["SEM_B1", "Semanas Bodega 1"], ["SEM_TOT", "Semanas multisede"],
    ["SEMANAS_ACOMPANAMIENTO", "Semanas de acompañamiento"], ["SEM_OBRA", "Semanas obra civil"], ["SEM_INSTAL", "Semanas instalación"],
    ["SEM_ETIQ", "Semanas etiquetado"], ["SEM_INTEG", "Semanas integración"], ["SEM_VALID", "Semana validación"], ["SEM_ACOMP", "Semanas acompañamiento (plan)"],
  ] },
  { grupo: "Condiciones comerciales (P2)", campos: [
    ["N_CUOTAS", "Cuotas de etiquetas fijas"], ["CUOTA_ETIQUETAS", "Valor cuota etiquetas"], ["PRECIO_ETIQUETA_UNIT", "Precio etiqueta de producto"],
    ["PLAN_RECOMENDADO", "Plan recomendado", "plan"], ["MENS_COMP", "Mensualidad Compartido"], ["MENS_FULL", "Mensualidad Completo"],
    ["SLA_COMP_H", "Respuesta Compartido (h)"], ["SLA_FULL_H", "Respuesta Completo (h)"], ["VISITAS_COMP", "Visitas/año Compartido"], ["VISITAS_FULL", "Visitas/año Completo"],
    ["DIAS_VIGENCIA", "Vigencia (días)"], ["BANDA_TRM_%", "Banda TRM"], ["EXCLUSIONES", "No incluye", "largo"],
  ] },
  { grupo: "Ingeniería (P3)", campos: [
    ["METODO_INTEGRACION", "Método de integración"], ["FRECUENCIA_SYNC", "Frecuencia de sincronización"], ["HORAS_TI_ESTIMADAS", "Horas de TI del cliente"],
    ["HORARIO_OBRA", "Horario de obra"],
    ["ALOJAMIENTO_DATOS", "Alojamiento de datos", "largo"], ["VALOR_RESPALDO_EXT", "Respaldo extendido"],
  ] },
  { grupo: "Enlaces para correos", campos: [
    ["ENLACE_P2", "URL Anexo Económico"], ["ENLACE_P3", "URL Anexo Técnico"], ["ENLACE_CALCULADORA", "URL de la calculadora (A1)"],
    ["ENLACE_GUIA", "URL de la guía de conciliación (A3)"], ["ENLACE_VIDEO", "URL del video del piloto (A2)"],
  ] },
  { grupo: "Caso de éxito para el activo A2 (requiere autorización escrita del cliente referenciado)", campos: [
    ["CASO_CLIENTE", "Cliente referenciado (o descripción anónima)"], ["CASO_SECTOR", "Sector y tamaño"],
    ["CASO_RETO", "Reto", "largo"], ["CASO_SOLUCION", "Qué se implementó", "largo"],
    ["CASO_M1_VALOR", "Resultado 1 · cifra"], ["CASO_M1_TEXTO", "Resultado 1 · descripción"],
    ["CASO_M2_VALOR", "Resultado 2 · cifra"], ["CASO_M2_TEXTO", "Resultado 2 · descripción"],
    ["CASO_M3_VALOR", "Resultado 3 · cifra"], ["CASO_M3_TEXTO", "Resultado 3 · descripción"],
    ["CASO_CITA", "Cita del cliente", "largo"], ["CASO_AUTOR_CITA", "Quién la dice (nombre y cargo)"], ["CASO_AUTORIZACION", "Autorización escrita (fecha y quién firmó)"],
  ] },
];

export const PROP_DEFECTO: Record<string, string> = {
  MES_AAAA: new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" }).replace(/^./, (c) => c.toUpperCase()),
  OPCION_RECOMENDADA: "E2 · Bodega individual", FUENTE_MARGEN: "promedio del sector",
  FECHA_REUNION_DECISION: "", FECHA_PROPUESTA: "", DIAS_ENTREGA: "10",
  DOLOR_1_TITULO: "", DOLOR_1_CIFRA: "", DOLOR_2_TITULO: "", DOLOR_2_CIFRA: "", DOLOR_3_TITULO: "", DOLOR_3_CIFRA: "", CITA_LITERAL_CHAMPION: "",
  NOMBRE_CEO: "", NOMBRE_CFO: "", NOMBRE_CHAMPION: "", NOMBRE_TI: "",
  NOMBRE_COMERCIAL: "", CARGO: "Comercial", CELULAR: "", EMAIL: "", NOMBRE_INGENIERO: "",
  ZONA_PILOTO: "Zona de despacho de la sede principal", SEM_PIL: "4", SEM_B1: "8", SEM_TOT: "20", SEMANAS_ACOMPANAMIENTO: "4",
  SEM_OBRA: "1–2", SEM_INSTAL: "2–3", SEM_ETIQ: "3–5", SEM_INTEG: "3–6", SEM_VALID: "7", SEM_ACOMP: "8–11",
  N_CUOTAS: "24", CUOTA_ETIQUETAS: "$250.000", PRECIO_ETIQUETA_UNIT: "$350", PLAN_RECOMENDADO: "Completo",
  MENS_COMP: "$1.800.000", MENS_FULL: "$3.200.000", SLA_COMP_H: "24", SLA_FULL_H: "8", VISITAS_COMP: "2", VISITAS_FULL: "4",
  DIAS_VIGENCIA: "30", FECHA_TRM: "", "BANDA_TRM_%": "3 %",
  EXCLUSIONES: "adecuaciones locativas distintas a la obra civil descrita, licencias del ERP y equipos de cómputo de usuario",
  METODO_INTEGRACION: "servicio web (API) del ERP", FRECUENCIA_SYNC: "en línea para consultas y cada 5 minutos para movimientos",
  HORAS_TI_ESTIMADAS: "16", PUNTOS_RED: "", PUNTOS_ELEC: "", HORARIO_OBRA: "sábados y después de las 6:00 p. m.",
  ALOJAMIENTO_DATOS: "servidor local en cada sede, con copia de respaldo diaria en la nube", VALOR_RESPALDO_EXT: "se cotiza según las horas requeridas",
  ENLACE_P2: "", ENLACE_P3: "", ENLACE_CALCULADORA: "", ENLACE_GUIA: "", ENLACE_VIDEO: "",
  CASO_CLIENTE: "", CASO_SECTOR: "", CASO_RETO: "", CASO_SOLUCION: "", CASO_M1_VALOR: "", CASO_M1_TEXTO: "",
  CASO_M2_VALOR: "", CASO_M2_TEXTO: "", CASO_M3_VALOR: "", CASO_M3_TEXTO: "", CASO_CITA: "", CASO_AUTOR_CITA: "", CASO_AUTORIZACION: "",
};

export const sedeVacia = (): Sede => ({ nombre: "", ciudad: "", m2Piso: 0, pisos: 1, pistolas: 2, unidades: 0, viaje: false });

export function casoVacio(): Caso {
  return {
    fin: { ventas: 0, ventasAnt: 0, crecSector: 0, margen: 0.3, inventario: 0, ac: 0, pc: 0, pt: 0, at: 0, un: 0, pat: 0, rcSector: 0, endSector: 0, roeSector: 0, nEmpresas: 0 },
    precios: { diag: 0, piloto: 0, bodega1: 0, total: 0, umbral: 400_000_000, etiqB1: 0, etiqTotal: 0 },
    trm: 0, trmFecha: "",
    mix: { normal: 0.95, metalica: 0, lavado: 0, nfc: 0.05 },
    campo: { itemsDia: 0, hotel: 0, alimentacion: 0, tiquete: 0 },
    dim: { sedes: [sedeVacia()], ubic: 0 },
    ret: { dioMedido: null, conteos: 2, pers: 0, diasC: 0, hDia: 9, costoHH: 12_000, hRfid: 6, persRfid: 2, conteosRfid: 12,
      exact: 0, exactObj: 0.95, dupN: 0, dupV: 0, escenarios: [3, 8, 15] },
    ven: { cons: 0, tAct: 0, tRfid: 1, noconf: 0, ticket: 0, dias: 288, recup: 0.5, costoH: 18_000 },
    pil: { eq: 3_500_000, und: 0, cEt: 350, hIng: 60, tarifa: 60_000, viajes: 2, tiq: 700_000, viat: 350_000, dViaje: 3,
      mMin: 0.25, prob: 0.6, patro: false, exito: false, agenda: false, dCred: 45, pTard: 0.5, dLim: 90, dFirma: 30 },
    prop: { ...PROP_DEFECTO },
  };
}

/** Une un caso guardado con los valores por defecto (para casos creados con versiones anteriores). */
export function normalizarCaso(c: Partial<Caso> | null | undefined): Caso {
  const v = casoVacio();
  if (!c || !c.fin) return v;
  return {
    fin: { ...v.fin, ...c.fin }, precios: { ...v.precios, ...c.precios },
    trm: c.trm ?? v.trm, trmFecha: c.trmFecha ?? v.trmFecha, mix: { ...v.mix, ...c.mix }, campo: { ...v.campo, ...c.campo },
    // Sedes guardadas con la estructura anterior (m2, m2Est…) se convierten a metraje por piso
    dim: { ubic: c.dim?.ubic ?? v.dim.ubic, sedes: c.dim?.sedes?.length ? c.dim.sedes.map((s) => {
      const o = s as Sede & { m2?: number };
      return { ...sedeVacia(), ...o, m2Piso: o.m2Piso ?? o.m2 ?? 0, pisos: o.pisos ?? 1, pistolas: o.pistolas ?? 2, unidades: o.unidades ?? 0, viaje: o.viaje ?? false };
    }) : v.dim.sedes },
    ret: { ...v.ret, ...c.ret }, ven: { ...v.ven, ...c.ven }, pil: { ...v.pil, ...c.pil }, prop: { ...v.prop, ...c.prop },
  };
}

/** Caso de ejemplo (mismos datos ilustrativos de la matriz Excel). */
export function casoEjemplo(): Caso {
  const c = casoVacio();
  c.fin = { ventas: 40e9, ventasAnt: 32e9, crecSector: 0.083, margen: 0.3, inventario: 9.5e9, ac: 18e9, pc: 12e9, pt: 17e9, at: 29e9,
    un: 1.8e9, pat: 12e9, rcSector: 2.44, endSector: 0.454, roeSector: 0.088, nEmpresas: 431 };
  c.precios = { diag: 12e6, piloto: 18e6, bodega1: 190e6, total: 650e6, umbral: 400e6, etiqB1: 0, etiqTotal: 0 };
  c.trm = 3232.22; c.trmFecha = "2026-10-22";
  c.mix = { normal: 0.7, metalica: 0.25, lavado: 0, nfc: 0.05 };
  c.dim.sedes = [
    { nombre: "Sede Principal", ciudad: "Bucaramanga", m2Piso: 1600, pisos: 1, pistolas: 2, unidades: 170000, viaje: false },
    { nombre: "Sede Satélite", ciudad: "Bucaramanga", m2Piso: 350, pisos: 1, pistolas: 1, unidades: 40000, viaje: false },
    { nombre: "Sede Bogotá", ciudad: "Bogotá", m2Piso: 400, pisos: 1, pistolas: 1, unidades: 40000, viaje: true },
  ];
  c.dim.ubic = 1500;
  Object.assign(c.ret, { pers: 8, diasC: 4, exact: 0.82, dupN: 24, dupV: 4_000_000 });
  Object.assign(c.ven, { cons: 120, tAct: 8, noconf: 0.06, ticket: 350_000 });
  Object.assign(c.pil, { und: 8000, patro: true, exito: true });
  Object.assign(c.prop, {
    FECHA_REUNION_DECISION: "jueves 29 de octubre", FECHA_PROPUESTA: "martes 3 de noviembre",
    DOLOR_1_TITULO: "Disponibilidad lenta", DOLOR_1_CIFRA: "Confirmar una referencia toma 8 minutos; el cliente compra a quien responde primero.",
    DOLOR_2_TITULO: "Conteos que paran la bodega", DOLOR_2_CIFRA: "El conteo completo toma 4 días y 8 personas, dos veces al año.",
    DOLOR_3_TITULO: "Compras duplicadas", DOLOR_3_CIFRA: "Se compran referencias que ya existen en otra sede, unas 2 veces al mes.",
    CITA_LITERAL_CHAMPION: "Cada conteo nos para la bodega cuatro días y al final igual no cuadra.",
    NOMBRE_CEO: "Nombre Apellido (Gerente)", NOMBRE_CFO: "Nombre Apellido (Finanzas)", NOMBRE_CHAMPION: "Nombre Apellido (Operaciones)", NOMBRE_TI: "Nombre Apellido (TI)",
    NOMBRE_COMERCIAL: "Laura Comercial", CELULAR: "+57 300 000 0000", EMAIL: "laura@iterativeco.com", NOMBRE_INGENIERO: "Nombre Apellido (Ingeniería)",
    FECHA_TRM: "22 de octubre de 2026", PUNTOS_RED: "12", PUNTOS_ELEC: "12",
    ENLACE_P2: "https://enlace-al-anexo-economico", ENLACE_P3: "https://enlace-al-anexo-tecnico",
  });
  return c;
}

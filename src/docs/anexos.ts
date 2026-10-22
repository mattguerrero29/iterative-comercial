// @ts-nocheck  -- código portado de las plantillas P2 y P3 originales (pptxgenjs)
// P2 · Anexo Económico y P3 · Anexo de Ingeniería · documentos A4 generados en el navegador.
import { C, LOGO_RATIO, conVariables, logo, nuevaPresentacion } from "./base";

const PW = 8.27, PH = 11.69, M = 0.7, CW = PW - 2 * M;

export function newDoc(label, title, LOGO_T) {
  const pres = nuevaPresentacion(title);
  pres.defineLayout({ name: "A4V", width: PW, height: PH });
  pres.layout = "A4V";
  pres.defineSlideMaster({
    title: "Pagina",
    background: { color: C.background1 },
    objects: [
      { image: { x: M, y: 0.45, w: 1.1, h: 1.1 * LOGO_RATIO, data: LOGO_T } },
      { text: { text: "Iterative S.A.S.  ·  iterativeco.com", options: { x: M, y: PH - 0.6, w: 4, h: 0.25, fontSize: 8, color: C.accent3, margin: 0 } } },
    ],
    slideNumber: { x: PW - M - 0.5, y: PH - 0.6, w: 0.5, h: 0.25, fontSize: 8, color: C.accent3, align: "right" },
  });
  pres._docLabel = label;
  return { pres, C };
}

export function kit(pres, C, V) {
  const T = (s, text, o) => s.addText(text, Object.assign({ margin: 0, isTextBox: true, valign: "top", color: C.text1, fontSize: 11 }, o));
  return {
    T,
    page: () => {
      const sl = V(pres.addSlide({ masterName: "Pagina" }));
      T(sl, pres._docLabel, { x: PW - M - 5.4, y: 0.42, w: 5.4, h: 0.3, fontSize: 9, color: C.accent3, align: "right", objectName: "Encabezado" });
      return sl;
    },
    eyebrow: (s, t, y) => T(s, t, { x: M, y, w: CW, h: 0.25, fontSize: 9, bold: true, color: C.accent2, charSpacing: 2 }),
    h1: (s, t, y, h = 0.9) => T(s, t, { x: M, y, w: CW, h, fontSize: 24, bold: true }),
    h2: (s, t, y) => T(s, t, { x: M, y, w: CW, h: 0.35, fontSize: 15, bold: true, color: C.accent1 }),
    p: (s, t, y, h, o = {}) => T(s, t, Object.assign({ x: M, y, w: CW, h, fontSize: 11, color: C.accent3, paraSpaceAfter: 4 }, o)),
    box: (s, x, y, w, h, fill, name) => s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: name }),
    table: (s, rows, o) => s.addTable(rows, Object.assign({ x: M, w: CW, fontSize: 10, color: C.text1, valign: "middle",
      border: { type: "solid", pt: 0.5, color: "DDDCDA" }, margin: [0.04, 0.08, 0.04, 0.08] }, o)),
    head: (t, extra = {}) => ({ text: t, options: Object.assign({ bold: true, color: C.background1, fill: { color: C.text1 }, fontSize: 9.5 }, extra) }),
    cell: (t, extra = {}) => ({ text: t, options: Object.assign({}, extra) }),
    bullets: (s, items, y, h, o = {}) => T(s, items.map((t, i) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: i < items.length - 1 } })),
      Object.assign({ x: M, y, w: CW, h, fontSize: 11, color: C.accent3, paraSpaceAfter: 5 }, o)),
    stat: (s, x, y, w, big, small, fill) => {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 1.0, rectRadius: 0.08, fill: { color: fill }, line: { color: fill, width: 0 } });
      T(s, big, { x: x + 0.18, y: y + 0.12, w: w - 0.36, h: 0.45, fontSize: 20, bold: true, color: C.accent1 });
      T(s, small, { x: x + 0.18, y: y + 0.58, w: w - 0.36, h: 0.35, fontSize: 9, color: C.accent3 });
    },
  };
}

// =================================================================== P2
export async function generarP2(vars: Record<string, string>, fileName: string) {
  const V = conVariables(vars);
  const LOGO_T = await logo("logo-tinta");
  const { pres, C } = newDoc("Anexo Económico y Condiciones  ·  [EMPRESA]  ·  [MES_AAAA]", "Anexo Económico y Condiciones Comerciales - Iterative", LOGO_T);
  const k = kit(pres, C, V);
  const TINT = "EFEBFE", CORAL_T = "FDE7EA";

  // Página 1 · Opciones de inversión
  let s = k.page();
  k.eyebrow(s, "PIEZA 2 DE 3  ·  ANEXO ECONÓMICO Y CONDICIONES COMERCIALES", 1.0);
  k.h1(s, "Opciones de inversión para [EMPRESA]", 1.32);
  k.p(s, "Valores en pesos colombianos, antes de IVA. Este anexo acompaña el Deck Ejecutivo presentado en [MES_AAAA] y detalla cómo se invierte, cómo se paga y qué incluye cada opción. Las etiquetas de producto se cotizan aparte.", 2.3, 0.6);
  k.h2(s, "2.1  Opciones de inversión", 3.1);
  const H = (t) => k.head(t, { align: "center" });
  k.table(s, [
    [k.head(""), H("Piloto de 1 mes"), H("Bodega [SEDE_1]"), H("Proyecto completo")],
    [k.cell("Alcance", { bold: true }), k.cell("[ZONA_PILOTO] e informe de conciliación de inventario"), k.cell("Antenas, lectores, pistolas lectoras, PC de procesamiento, UPS, obra civil e integración a [ERP]"), k.cell("[N_SEDES] sedes ([M2_TOTAL] m²) y tablero consolidado")],
    [k.cell("Inversión", { bold: true }), k.cell("[PRECIO_PILOTO]", { bold: true, fontSize: 13, color: C.accent1 }), k.cell("[PRECIO_BODEGA1]", { bold: true, fontSize: 13, color: C.accent1 }), k.cell("[PRECIO_TOTAL]", { bold: true, fontSize: 13, color: C.accent1 })],
    [k.cell("Etiquetas (se cotizan aparte)", { bold: true }), k.cell("Incluidas en el piloto"), k.cell("[PRECIO_ETIQ_B1]", { bold: true }), k.cell("[PRECIO_ETIQ_TOT]", { bold: true })],
    [k.cell("Días de inventario que la pagan", { bold: true }), k.cell("[D_PIL] días"), k.cell("[D_B1] días"), k.cell("[D_TOT] días")],
    [k.cell("Puesta en marcha", { bold: true }), k.cell("[SEM_PIL] semanas"), k.cell("[SEM_B1] semanas"), k.cell("[SEM_TOT] semanas por fases")],
    [k.cell("Abono al proyecto definitivo", { bold: true }), k.cell("100 % si firma en [DIAS_CREDITO] días"), k.cell("Se descuenta del proyecto completo"), k.cell("–")],
  ], { y: 3.55, colW: [1.6, 1.62, 1.83, 1.82], rowH: [0.38, 0.95, 0.5, 0.42, 0.42, 0.42, 0.55], fontSize: 10 });
  k.box(s, M, 7.5, CW, 1.15, TINT, "Recomendacion");
  k.T(s, [{ text: "Opción recomendada: [OPCION_RECOMENDADA]", options: { bold: true, color: C.accent1, breakLine: true } },
          { text: "Inversión de [INVERSION_FASE]. Con un costo de mercancía por día de $[CMD_M] millones, [DIAS_PAGAN_FASE] días menos de inventario liberan una caja equivalente a la inversión.", options: { color: C.text1 } }],
      { x: M + 0.25, y: 7.65, w: CW - 0.5, h: 0.9, fontSize: 11 });
  k.p(s, "Los días que pagan cada opción se calculan como inversión ÷ costo de mercancía por día (ventas × (1 − margen bruto) ÷ 365), sin incluir etiquetas. La línea base de días de inventario se mide en la visita técnica antes de firmar.", 8.9, 0.7, { fontSize: 9, italic: true });

  // Página 2 · Pagos y crédito del piloto
  s = k.page();
  k.h2(s, "2.2  Esquema de pagos por hitos", 1.0);
  k.p(s, "Valores calculados sobre la opción recomendada ([OPCION_RECOMENDADA], [INVERSION_FASE]).", 1.4, 0.3);
  k.table(s, [
    [k.head("Hito"), k.head("%", { align: "center" }), k.head("Valor", { align: "right" }), k.head("Se factura cuando"), k.head("Evidencia")],
    [k.cell("Firma", { bold: true }), k.cell("50 %", { align: "center" }), k.cell("[PAGO_50]", { align: "right", bold: true }), k.cell("Firma del contrato u orden de servicio"), k.cell("Contrato firmado")],
    [k.cell("Obra certificada", { bold: true }), k.cell("40 %", { align: "center" }), k.cell("[PAGO_40]", { align: "right", bold: true }), k.cell("Hardware instalado, obra civil terminada e integración a [ERP] en prueba"), k.cell("Acta de entrega firmada por [NOMBRE_CHAMPION]")],
    [k.cell("Exactitud", { bold: true }), k.cell("10 %", { align: "center" }), k.cell("[PAGO_10]", { align: "right", bold: true }), k.cell("Conteo RFID con exactitud superior al 95 % frente al conteo de control"), k.cell("Informe de conciliación por sede")],
  ], { y: 1.8, colW: [1.25, 0.6, 1.1, 2.2, 1.72], rowH: [0.36, 0.5, 0.7, 0.7] });
  k.box(s, M, 4.25, CW, 0.85, CORAL_T, "Garantia exactitud");
  k.T(s, "El último 10 % depende de que el sistema cumpla. Si el conteo no supera 95 % de exactitud, ese pago no se causa.", { x: M + 0.25, y: 4.38, w: CW - 0.5, h: 0.6, fontSize: 12, bold: true, valign: "middle" });

  k.h2(s, "2.3  Crédito del piloto", 5.45);
  k.p(s, [
    { text: "El 100 % del valor pagado por el piloto ([PRECIO_PILOTO]) se abona a la Fase 1 o al proyecto completo si [EMPRESA] firma dentro de los [DIAS_CREDITO] días calendario siguientes a la entrega del informe de conciliación. Pasado ese plazo, el abono es del [%_ABONO_TARDIO] hasta el día [DIAS_LIMITE].", options: { breakLine: true } },
    { text: "Los equipos del piloto se reutilizan en la instalación definitiva. El diagnóstico en sitio, si se contrata, se abona de la misma forma sobre el piloto o la Fase 1.", options: {} },
  ], 5.85, 1.5);
  const steps = [["Piloto", "[PRECIO_PILOTO]"], ["Informe de conciliación", "día 30"], ["Abono 100 %", "si firma hasta el día [DIAS_CREDITO]"], ["Abono [%_ABONO_TARDIO]", "si firma hasta el día [DIAS_LIMITE]"]];
  steps.forEach(([a, b], i) => {
    const w = (CW - 0.45) / 4, x = M + i * (w + 0.15);
    k.box(s, x, 7.55, w, 0.9, i === 2 ? "7C5DFA" : "F8F7F5", "Linea credito " + (i + 1));
    k.T(s, a, { x: x + 0.12, y: 7.65, w: w - 0.24, h: 0.4, fontSize: 9.5, bold: true, color: i === 2 ? C.background1 : C.text1 });
    k.T(s, b, { x: x + 0.12, y: 8.07, w: w - 0.24, h: 0.3, fontSize: 9, color: i === 2 ? C.background1 : C.accent3 });
  });

  // Página 3 · Etiquetas y mantenimiento
  s = k.page();
  k.h2(s, "2.4  Modelo de etiquetas", 1.0);
  k.p(s, "Las etiquetas para ubicaciones y activos fijos quedan en consignación durante 24 meses: [EMPRESA] las usa desde el primer día y las paga en cuotas mensuales incluidas en el plan de mantenimiento. Las etiquetas de producto para mercancía nueva se compran por demanda.", 1.4, 0.95);
  const sw = (CW - 0.3) / 3;
  k.stat(s, M, 2.45, sw, "[ETIQ_FIJAS]", "etiquetas fijas en consignación", "F8F7F5");
  k.stat(s, M + sw + 0.15, 2.45, sw, "[N_CUOTAS] × [CUOTA_ETIQUETAS]", "cuotas mensuales de etiquetas fijas", "F8F7F5");
  k.stat(s, M + 2 * (sw + 0.15), 2.45, sw, "[PRECIO_ETIQUETA_UNIT]", "por etiqueta de producto nueva", "F8F7F5");
  k.p(s, "Etiquetado inicial: [ETIQ_PRODUCTO] unidades, ejecutado por personal de Iterative e incluido en la inversión.", 3.6, 0.35, { fontSize: 10, italic: true });

  k.h2(s, "2.5  Planes de mantenimiento", 4.2);
  k.table(s, [
    [k.head(""), k.head("Compartido"), k.head("Completo")],
    [k.cell("Primer diagnóstico", { bold: true }), k.cell("Equipo interno de [EMPRESA], capacitado por Iterative"), k.cell("Iterative")],
    [k.cell("Soporte remoto", { bold: true }), k.cell("Horario hábil, respuesta en [SLA_COMP_H] h"), k.cell("Horario extendido, respuesta en [SLA_FULL_H] h")],
    [k.cell("Visitas preventivas", { bold: true }), k.cell("[VISITAS_COMP] al año"), k.cell("[VISITAS_FULL] al año")],
    [k.cell("Reposición de equipos", { bold: true }), k.cell("Repuestos con costo adicional"), k.cell("Incluida, excepto daño por mal uso")],
    [k.cell("Mensualidad", { bold: true }), k.cell("[MENS_COMP]", { bold: true, color: C.accent1, fontSize: 12 }), k.cell("[MENS_FULL]", { bold: true, color: C.accent1, fontSize: 12 })],
    [k.cell("Recomendado para", { bold: true }), k.cell("Empresas con equipo de TI interno"), k.cell("Empresas sin TI dedicado o con varias sedes")],
  ], { y: 4.6, colW: [1.9, 2.49, 2.48], rowH: [0.36, 0.55, 0.5, 0.42, 0.5, 0.45, 0.5] });
  k.box(s, M, 8.15, CW, 0.65, TINT, "Plan recomendado");
  k.T(s, [{ text: "Plan recomendado para [EMPRESA]: ", options: { bold: true, color: C.accent1 } }, { text: "[PLAN_RECOMENDADO]", options: { bold: true } }],
      { x: M + 0.25, y: 8.15, w: CW - 0.5, h: 0.65, fontSize: 12, valign: "middle" });

  // Página 4 · Condiciones y aceptación
  s = k.page();
  k.h2(s, "2.6  Vigencia y condiciones", 1.0);
  k.bullets(s, [
    "Vigencia de la oferta: [DIAS_VIGENCIA] días calendario desde su presentación.",
    "Precios en pesos colombianos, antes de IVA.",
    "El hardware importado se liquida con la TRM del [FECHA_TRM], con una banda de ± [BANDA_TRM_%]. Si la TRM sale de la banda, se ajusta solo el componente de hardware.",
    "Incluye: hardware, obra civil descrita en el Anexo de Ingeniería, etiquetado inicial, integración a [ERP], capacitación y [SEMANAS_ACOMPANAMIENTO] semanas de acompañamiento en sitio.",
    "No incluye: [EXCLUSIONES].",
    "Cronograma sujeto a la firma del contrato y al pago del primer hito.",
  ], 1.45, 3.2);
  k.h2(s, "Aceptación", 5.0);
  k.p(s, "Con la firma de este anexo, [EMPRESA] selecciona la opción indicada y autoriza el inicio del proceso contractual.", 5.4, 0.5);
  k.T(s, "Opción seleccionada:  ☐ Piloto     ☐ Bodega [SEDE_1]     ☐ Proyecto completo", { x: M, y: 6.05, w: CW, h: 0.35, fontSize: 11 });
  k.T(s, "Plan de mantenimiento:  ☐ Compartido     ☐ Completo", { x: M, y: 6.45, w: CW, h: 0.35, fontSize: 11 });
  [["Por [EMPRESA]", "Nombre, cargo y fecha"], ["Por Iterative S.A.S.", "[NOMBRE_COMERCIAL]  ·  [CARGO]"]].forEach(([a, b], i) => {
    const x = M + i * (CW / 2 + 0.1), w = CW / 2 - 0.1;
    s.addShape(pres.shapes.LINE, { x, y: 8.2, w, h: 0, line: { color: C.text1, width: 0.75 } });
    k.T(s, a, { x, y: 8.3, w, h: 0.3, fontSize: 11, bold: true });
    k.T(s, b, { x, y: 8.6, w, h: 0.3, fontSize: 9.5, color: C.accent3 });
  });
  k.p(s, "Contacto: [NOMBRE_COMERCIAL]  ·  [CELULAR]  ·  [EMAIL]", 9.5, 0.3, { fontSize: 10 });

  await pres.writeFile({ fileName });
}

// =================================================================== P3
export async function generarP3(vars: Record<string, string>, sedes: any[], fileName: string) {
  const V = conVariables(vars);
  const LOGO_T = await logo("logo-tinta");
  const { pres, C } = newDoc("Anexo de Ingeniería y Obra Civil  ·  [EMPRESA]  ·  [MES_AAAA]", "Anexo de Ingeniería, Hardware y Obra Civil - Iterative", LOGO_T);
  const k = kit(pres, C, V);

  // Página 1 · Resumen técnico y equipos
  let s = k.page();
  k.eyebrow(s, "PIEZA 3 DE 3  ·  ANEXO DE INGENIERÍA, HARDWARE Y OBRA CIVIL", 1.0);
  k.h1(s, "Infraestructura para [N_SEDES] sedes y [M2_TOTAL] m²", 1.32);
  k.p(s, "Cantidades preliminares a partir de la visita técnica y la matriz de dimensionamiento. Se confirman en el levantamiento de obra civil antes de iniciar.", 2.3, 0.55);
  k.h2(s, "3.1  Resumen técnico por sede", 3.0);
  const hc = (t) => k.head(t, { align: "center", fontSize: 8.5 });
  const c = (t, b) => k.cell(t, { align: "center", bold: !!b });
  const rows = [[k.head("Sede", { fontSize: 8.5 }), hc("m²"), hc("Antenas"), hc("Lectores 4 puertos"), hc("Pistolas"), hc("Cable (m)"), hc("PC + UPS + switch")]];
  const n = (x) => Number(x || 0).toLocaleString("es-CO");
  for (const sd of sedes) {
    rows.push([k.cell(sd.nombre), c(n(sd.m2)), c(n(sd.antenas)), c(n(sd.lectores)), c(n(sd.pistolas)), c(n(sd.cable)), c("1")]);
  }
  const tot = { fill: { color: "EFEBFE" }, bold: true, align: "center" };
  rows.push([k.cell("Total", { fill: { color: "EFEBFE" }, bold: true }), k.cell("[M2_TOTAL]", tot), k.cell("[T_ANT]", tot), k.cell("[T_LECT]", tot), k.cell("[T_HH]", tot), k.cell("[T_CABLE]", tot), k.cell("[T_SERV]", tot)]);
  k.table(s, rows, { y: 3.4, colW: [1.75, 0.75, 0.8, 1.0, 0.8, 0.85, 0.92], rowH: 0.3, fontSize: 9 });
  const Y2 = Math.min(6.75, 3.4 + 0.3 * (sedes.length + 2) + 0.55);
  k.h2(s, "3.2  Equipos y su función", Y2);
  const eq = [
    ["Antenas UHF", "Una cada [M2_POR_ANTENA] m², en estanterías, puertas y zonas de despacho; registran lo que entra, sale y se mueve."],
    ["Lectores de 4 puertos", "Uno por cada dos antenas, con puertos libres para asegurar la lectura en toda la bodega."],
    ["Pistolas lectoras", "Agilizan la búsqueda de referencias y los conteos dirigidos."],
    ["PC de procesamiento y respaldo", "Procesa las lecturas de la sede, guarda copia de respaldo y sincroniza con [ERP]."],
    ["Red, UPS e impresora Zebra", "Switch y cableado, UPS regulada y la impresora para etiquetar mercancía nueva."],
  ];
  eq.forEach(([a, b], i) => {
    const y = Y2 + 0.45 + i * 0.62;
    s.addShape(pres.shapes.OVAL, { x: M, y: y + 0.03, w: 0.32, h: 0.32, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 } });
    k.T(s, String(i + 1), { x: M, y: y + 0.03, w: 0.32, h: 0.32, fontSize: 10, bold: true, color: C.background1, align: "center", valign: "middle" });
    k.T(s, a, { x: M + 0.5, y, w: 2.1, h: 0.4, fontSize: 11, bold: true, valign: "middle" });
    k.T(s, b, { x: M + 2.6, y, w: CW - 2.6, h: 0.45, fontSize: 10, color: C.accent3, valign: "middle" });
  });

  // Página 2 · Obra civil, energía e integración
  s = k.page();
  k.h2(s, "3.3  Obra civil", 1.0);
  const sw = (CW - 0.3) / 3;
  k.stat(s, M, 1.45, sw, "[T_PUNTOS]", "puntos de instalación", "F8F7F5");
  k.stat(s, M + sw + 0.15, 1.45, sw, "[T_ANT]", "soportes de antena", "F8F7F5");
  k.stat(s, M + 2 * (sw + 0.15), 1.45, sw, "[T_CABLE] m", "de cable coaxial", "F8F7F5");
  k.p(s, "La obra civil la ejecuta Iterative en [HORARIO_OBRA], para no interrumpir recibos ni despachos. Cada frente se entrega con acta y registro fotográfico.", 2.65, 0.6);
  k.h2(s, "3.4  Respaldo energético", 3.45);
  k.table(s, [
    [k.head("Respaldo"), k.head("Qué cubre"), k.head("Condición")],
    [k.cell("UPS regulada", { bold: true }), k.cell("PC de procesamiento, lectores y red de cada sede"), k.cell("Incluida en la inversión")],
    [k.cell("Autonomía extendida", { bold: true }), k.cell("Para zonas con cortes de energía frecuentes"), k.cell("Se define en la negociación")],
  ], { y: 3.85, colW: [1.6, 3.27, 2.0], rowH: [0.34, 0.42, 0.42] });
  k.h2(s, "3.5  Integración con [ERP]", 5.35);
  k.table(s, [
    [k.head("Aspecto"), k.head("Definición")],
    [k.cell("Método", { bold: true }), k.cell("Conexión mediante [METODO_INTEGRACION]. Su [ERP] no se modifica.")],
    [k.cell("Eventos que se sincronizan", { bold: true }), k.cell("Entrada, ubicación, traslado entre sedes, salida y ajuste de inventario.")],
    [k.cell("Frecuencia", { bold: true }), k.cell("Sincronización [FRECUENCIA_SYNC].")],
    [k.cell("Ambiente de pruebas", { bold: true }), k.cell("Toda la integración se valida en pruebas antes de pasar a producción, con aprobación de [NOMBRE_TI].")],
    [k.cell("Responsables", { bold: true }), k.cell("Iterative: desarrollo, pruebas y documentación. [EMPRESA]: acceso al ambiente de pruebas y aprobación del paso a producción.")],
  ], { y: 5.75, colW: [2.0, 4.87], rowH: [0.34, 0.45, 0.45, 0.4, 0.55, 0.62] });

  // Página 3 · Seguridad, plan y RACI
  s = k.page();
  k.h2(s, "3.6  Seguridad y datos", 1.0);
  k.bullets(s, [
    "Alojamiento: [ALOJAMIENTO_DATOS].",
    "Usuarios con permisos por rol (bodega, ventas, compras, contabilidad, administración).",
    "Registro de cada lectura y ajuste con usuario, fecha y sede, para auditoría.",
  ], 1.4, 1.1);
  k.h2(s, "3.7  Plan de implementación (Bodega [SEDE_1]: [SEM_B1] semanas)", 2.7);
  const plan = [
    ["Obra civil", "[SEM_OBRA]", "Iterative"],
    ["Instalación de hardware", "[SEM_INSTAL]", "Iterative"],
    ["Etiquetado inicial", "[SEM_ETIQ]", "Iterative"],
    ["Integración con [ERP]", "[SEM_INTEG]", "Iterative + TI de [EMPRESA]"],
    ["Conteo de validación (exactitud > 95 %)", "[SEM_VALID]", "Iterative + Operaciones"],
    ["Acompañamiento en sitio", "[SEM_ACOMP]", "Iterative"],
  ];
  k.table(s, [[k.head("Fase"), k.head("Semanas", { align: "center" }), k.head("Responsable")]].concat(
    plan.map(([a, b, cR], i) => [k.cell(a, { bold: true }), k.cell(b, { align: "center", bold: true, color: C.accent1 }), k.cell(cR)])),
    { y: 3.1, colW: [3.2, 1.2, 2.47], rowH: 0.36 });
  k.h2(s, "3.8  Matriz de responsabilidades (RACI)", 5.9);
  const R = (t) => k.cell(t, { align: "center", bold: true, color: t === "R" || t === "A" ? C.accent1 : C.accent3 });
  k.table(s, [
    [k.head("Actividad"), k.head("Iterative", { align: "center" }), k.head("Operaciones", { align: "center" }), k.head("TI", { align: "center" }), k.head("Contabilidad", { align: "center" })],
    [k.cell("Obra civil e instalación"), R("R"), R("C"), R("I"), R("I")],
    [k.cell("Etiquetado inicial"), R("R"), R("C"), R("I"), R("I")],
    [k.cell("Integración con [ERP]"), R("R"), R("I"), R("A"), R("C")],
    [k.cell("Conteo de validación"), R("R"), R("A"), R("I"), R("C")],
    [k.cell("Ajustes de inventario en [ERP]"), R("C"), R("C"), R("I"), R("A")],
    [k.cell("Capacitación por rol"), R("R"), R("A"), R("C"), R("C")],
  ], { y: 6.3, colW: [2.67, 1.05, 1.15, 0.85, 1.15], rowH: 0.34 });
  k.p(s, "R: responsable  ·  A: aprueba  ·  C: consultado  ·  I: informado", 8.85, 0.3, { fontSize: 9, italic: true });
  k.p(s, "Responsable técnico: [NOMBRE_INGENIERO]  ·  Contacto comercial: [NOMBRE_COMERCIAL], [CELULAR], [EMAIL]", 9.3, 0.4, { fontSize: 10 });

  await pres.writeFile({ fileName });
}


// @ts-nocheck  -- usa la API dinámica de pptxgenjs y el kit de documentos A4 de anexos.ts
// Activos de nutrición del Playbook (sección 6.4): A2 caso de éxito + guion de video, A3 guía de conciliación, A4 comparativo de entrada.
import { conVariables, logo } from "./base";
import { newDoc, kit } from "./anexos";

const PW = 8.27, M = 0.7, CW = PW - 2 * M;

// =================================================================== A3 · Guía de conciliación ante revisoría fiscal
export async function generarA3(vars: Record<string, string>, fileName: string) {
  const V = conVariables(vars);
  const { pres, C } = newDoc("Guía de conciliación de inventario  ·  [EMPRESA]", "Guía de Conciliación de Inventario ante Revisoría Fiscal - Iterative", await logo("logo-tinta"));
  const k = kit(pres, C, V);
  const TINT = "EFEBFE", CORAL_T = "FDE7EA";

  let s = k.page();
  k.eyebrow(s, "GUÍA PRÁCTICA  ·  PARA GERENCIA FINANCIERA Y CONTABILIDAD", 1.0);
  k.h1(s, "Conciliación de inventario al pasar a conteo con RFID", 1.32);
  k.p(s, "Preparada para [EMPRESA] · Explica por qué el primer conteo con RFID puede mostrar diferencias frente a [ERP] y cómo documentarlas y registrarlas en su propio calendario, antes del cierre y de la revisión del revisor fiscal.", 2.3, 0.8);
  k.h2(s, "1. Por qué aparecen diferencias en el primer conteo", 3.3);
  k.bullets(s, [
    "Errores de registro acumulados: entradas, salidas o traslados que nunca se digitaron o se digitaron con otra referencia.",
    "Mercancía física sin ubicar: unidades que existen pero que el conteo manual no encontraba.",
    "Diferencias de unidad de medida o de empaque entre lo comprado y lo registrado.",
    "Faltantes reales por daño, obsolescencia o pérdida que el conteo manual no detectaba a tiempo.",
  ], 3.75, 2.0);
  k.box(s, M, 5.95, CW, 1.3, TINT, "Idea central");
  k.T(s, [{ text: "Lo que cambia es la visibilidad, no el inventario. ", options: { bold: true, color: C.accent1 } },
          { text: "Las diferencias ya existían; el RFID las hace visibles. Es mejor que [EMPRESA] las conozca y ajuste en su propio calendario, a que las encuentre el revisor fiscal o un banco en una revisión.", options: {} }],
      { x: M + 0.25, y: 6.1, w: CW - 0.5, h: 1.05, fontSize: 11.5 });
  k.h2(s, "2. Qué tipo de diferencias esperar", 7.6);
  k.table(s, [
    [k.head("Tipo"), k.head("Qué es"), k.head("Qué hacer")],
    [k.cell("Sobrante", { bold: true }), k.cell("Hay más unidades físicas que en [ERP]"), k.cell("Verificar que no sea mercancía en consignación o de un traslado en curso antes de ajustar")],
    [k.cell("Faltante", { bold: true }), k.cell("Hay menos unidades físicas que en [ERP]"), k.cell("Reconteo dirigido; documentar la causa probable antes de registrar la baja")],
    [k.cell("Reclasificación", { bold: true }), k.cell("La unidad existe pero con otra referencia o en otra sede"), k.cell("Corregir con traslado o reclasificación, sin afectar resultados")],
  ], { y: 8.0, colW: [1.4, 2.6, 2.87], rowH: [0.34, 0.6, 0.6, 0.6], fontSize: 9.5 });

  s = k.page();
  k.h2(s, "3. Proceso de conciliación en cinco pasos", 1.0);
  const pasos = [
    ["Conteo de validación RFID por sede", "Iterative ejecuta el conteo completo con antenas fijas y lectores portátiles, sede por sede.", "Iterative + Operaciones"],
    ["Informe de conciliación", "Comparación por referencia: unidades en [ERP] vs. unidades físicas, valorizadas al costo, y separadas en sobrantes, faltantes y reclasificaciones.", "Iterative"],
    ["Reconteo dirigido", "Las diferencias significativas (por valor o por cantidad) se recuentan antes de aceptarlas. El umbral lo define la gerencia financiera.", "Operaciones"],
    ["Aprobación interna con acta", "Operaciones, contabilidad y gerencia revisan el informe y firman un acta con las diferencias aceptadas y su causa probable.", "Gerencia + Contabilidad"],
    ["Registro del ajuste en [ERP]", "Contabilidad registra el ajuste en el periodo que la empresa defina, con el informe y el acta como soporte.", "Contabilidad"],
  ];
  pasos.forEach(([t, d, r], i) => {
    const y = 1.45 + i * 1.12;
    s.addShape(pres.shapes.OVAL, { x: M, y, w: 0.45, h: 0.45, fill: { color: C.accent1 }, line: { color: C.accent1, width: 0 } });
    k.T(s, String(i + 1), { x: M, y, w: 0.45, h: 0.45, fontSize: 13, bold: true, color: C.background1, align: "center", valign: "middle" });
    k.T(s, t, { x: M + 0.65, y: y - 0.02, w: 4.6, h: 0.3, fontSize: 12, bold: true });
    k.T(s, r, { x: M + 5.3, y, w: CW - 5.3, h: 0.3, fontSize: 9, color: C.accent2, bold: true, align: "right" });
    k.T(s, d, { x: M + 0.65, y: y + 0.32, w: CW - 0.65, h: 0.7, fontSize: 10.5, color: C.accent3 });
  });
  k.h2(s, "4. Soportes que conviene archivar", 7.2);
  k.bullets(s, [
    "Informe de conciliación por sede, con fecha y hora de cada conteo.",
    "Listado de reconteos dirigidos y su resultado.",
    "Acta de aprobación firmada por los responsables.",
    "Comprobante del ajuste en [ERP] y su referencia al acta.",
    "Para faltantes: evidencia de la causa cuando exista (daño, vencimiento, siniestro).",
  ], 7.6, 2.3);

  s = k.page();
  k.h2(s, "5. Tratamiento contable: puntos a revisar con su contador", 1.0);
  k.p(s, "Esta sección resume consideraciones generales. No es asesoría contable ni tributaria: la política y el registro los define [EMPRESA] con su contador y su revisor fiscal.", 1.4, 0.55, { italic: true, fontSize: 10 });
  k.table(s, [
    [k.head("Tema"), k.head("Pregunta para su contador")],
    [k.cell("Medición", { bold: true }), k.cell("Los ajustes se valorizan al costo del inventario. ¿Aplica además el ajuste al menor entre costo y valor neto realizable (NIC 2 / Sección 13 de NIIF para Pymes) para referencias obsoletas detectadas?")],
    [k.cell("Periodo", { bold: true }), k.cell("¿En qué periodo se reconoce el ajuste y cómo se revela si es material frente a los estados financieros?")],
    [k.cell("Cuenta de contrapartida", { bold: true }), k.cell("¿Contra qué cuenta se registran faltantes y sobrantes según la política contable de la empresa?")],
    [k.cell("Efecto tributario", { bold: true }), k.cell("¿Qué soportes exige la normativa para que la baja de inventario sea deducible y cómo se tratan los sobrantes?")],
    [k.cell("Revisor fiscal", { bold: true }), k.cell("¿Conviene informar al revisor fiscal antes del conteo de validación y compartirle el cronograma y el formato de acta?")],
  ], { y: 2.05, colW: [1.8, 5.07], rowH: [0.34, 0.85, 0.55, 0.55, 0.6, 0.6], fontSize: 10 });
  k.box(s, M, 5.85, CW, 1.0, CORAL_T, "Recomendacion");
  k.T(s, "Recomendación: invite al revisor fiscal a conocer el proceso antes del primer conteo. Llegar con el cronograma y el formato de acta acordados reduce preguntas en la auditoría.",
      { x: M + 0.25, y: 5.98, w: CW - 0.5, h: 0.8, fontSize: 11, bold: true, valign: "middle" });
  k.h2(s, "6. Cronograma sugerido antes del cierre", 7.15);
  k.table(s, [
    [k.head("Cuándo"), k.head("Actividad"), k.head("Responsable")],
    [k.cell("Cierre − 6 semanas", { bold: true }), k.cell("Conteo de validación RFID por sede"), k.cell("Iterative + Operaciones")],
    [k.cell("Cierre − 5 semanas", { bold: true }), k.cell("Entrega del informe de conciliación"), k.cell("Iterative")],
    [k.cell("Cierre − 4 semanas", { bold: true }), k.cell("Reconteos dirigidos de diferencias significativas"), k.cell("Operaciones")],
    [k.cell("Cierre − 3 semanas", { bold: true }), k.cell("Revisión y firma del acta de aprobación"), k.cell("Gerencia + Contabilidad")],
    [k.cell("Cierre − 2 semanas", { bold: true }), k.cell("Registro del ajuste en [ERP] con soportes"), k.cell("Contabilidad")],
  ], { y: 7.55, colW: [1.7, 3.3, 1.87], rowH: 0.34, fontSize: 10 });

  s = k.page();
  k.h2(s, "7. Modelo de acta de aprobación de ajustes", 1.0);
  k.p(s, "Copie este formato en el papel membrete de [EMPRESA] y adáptelo con su contador.", 1.4, 0.3, { fontSize: 10, italic: true });
  k.box(s, M, 1.85, CW, 7.6, "F8F7F5", "Acta");
  const L = (t, y, h = 0.3, o = {}) => k.T(s, t, Object.assign({ x: M + 0.35, y, w: CW - 0.7, h, fontSize: 10.5 }, o));
  L("ACTA DE APROBACIÓN DE AJUSTES DE INVENTARIO", 2.1, 0.3, { bold: true, fontSize: 12 });
  L("Empresa: [EMPRESA]          Acta n.º: ______          Fecha: ______________", 2.6);
  L("Sedes incluidas: ________________________________________________", 3.0);
  L("Fecha de los conteos de validación RFID: __________________________", 3.4);
  L("Resumen de diferencias aceptadas (valorizadas al costo):", 3.95, 0.3, { bold: true });
  k.table(s, [
    [k.head("Concepto"), k.head("Referencias", { align: "center" }), k.head("Unidades", { align: "center" }), k.head("Valor al costo", { align: "right" })],
    [k.cell("Sobrantes"), k.cell(""), k.cell(""), k.cell("")],
    [k.cell("Faltantes"), k.cell(""), k.cell(""), k.cell("")],
    [k.cell("Reclasificaciones"), k.cell(""), k.cell(""), k.cell("")],
    [k.cell("Total neto", { bold: true }), k.cell(""), k.cell(""), k.cell("")],
  ], { x: M + 0.35, y: 4.35, w: CW - 0.7, colW: [2.2, 1.2, 1.2, 1.57], rowH: 0.34, fontSize: 10 });
  L("Causas principales identificadas: ____________________________________________", 6.25);
  L("_______________________________________________________________________", 6.65);
  L("Soportes anexos:  ☐ Informe de conciliación   ☐ Reconteos dirigidos   ☐ Evidencias de causa", 7.15);
  L("Periodo contable en que se registrará el ajuste: __________________", 7.6);
  ["Operaciones", "Contabilidad", "Gerencia"].forEach((r, i) => {
    const w = (CW - 0.7 - 0.4) / 3, x = M + 0.35 + i * (w + 0.2);
    s.addShape(pres.shapes.LINE, { x, y: 8.85, w, h: 0, line: { color: C.text1, width: 0.75 } });
    k.T(s, r, { x, y: 8.92, w, h: 0.3, fontSize: 10, bold: true });
  });
  k.p(s, "Iterative S.A.S. acompaña el primer cierre con el informe de conciliación por sede. Contacto: [NOMBRE_COMERCIAL] · [CELULAR] · [EMAIL]", 9.75, 0.5, { fontSize: 9.5 });

  await pres.writeFile({ fileName });
}

// =================================================================== A4 · Comparativo de entrada
export async function generarA4(vars: Record<string, string>, fileName: string) {
  const V = conVariables(vars);
  const { pres, C } = newDoc("Cómo empezar  ·  [EMPRESA]  ·  [MES_AAAA]", "Comparativo de Entrada - Iterative", await logo("logo-tinta"));
  const k = kit(pres, C, V);
  const s = k.page();
  k.eyebrow(s, "COMPARATIVO DE ENTRADA  ·  PARA EL COMITÉ DIRECTIVO", 1.0);
  k.h1(s, "Tres formas de empezar en [EMPRESA], según el tamaño de la decisión", 1.32, 1.2);
  k.p(s, "Cada opción entrega valor por sí sola y deja lista la siguiente. Valores antes de IVA.", 2.85, 0.35);
  const H = (t) => k.head(t, { align: "center" });
  k.table(s, [
    [k.head(""), H("Piloto de 1 mes"), H("Bodega [SEDE_1]"), H("Proyecto completo")],
    [k.cell("Alcance", { bold: true }), k.cell("[ZONA_PILOTO] e informe de conciliación"), k.cell("Infraestructura completa, obra civil e integración a [ERP] en una sede"), k.cell("[N_SEDES] sedes y tablero consolidado")],
    [k.cell("Inversión", { bold: true }), k.cell("[PRECIO_PILOTO]", { bold: true, fontSize: 13, color: C.accent1 }), k.cell("[PRECIO_BODEGA1]", { bold: true, fontSize: 13, color: C.accent1 }), k.cell("[PRECIO_TOTAL]", { bold: true, fontSize: 13, color: C.accent1 })],
    [k.cell("Etiquetas (se cotizan aparte)", { bold: true }), k.cell("Incluidas en el piloto"), k.cell("[PRECIO_ETIQ_B1]", { bold: true }), k.cell("[PRECIO_ETIQ_TOT]", { bold: true })],
    [k.cell("Días de inventario que la pagan", { bold: true }), k.cell("[D_PIL]"), k.cell("[D_B1]"), k.cell("[D_TOT]")],
    [k.cell("Quién la aprueba normalmente", { bold: true }), k.cell("Gerente financiero o general"), k.cell("Gerente general"), k.cell("Junta directiva")],
    [k.cell("Puesta en marcha", { bold: true }), k.cell("[SEM_PIL] semanas"), k.cell("[SEM_B1] semanas"), k.cell("[SEM_TOT] semanas por fases")],
    [k.cell("Lo que deja listo", { bold: true }), k.cell("Datos reales de exactitud para decidir"), k.cell("Modelo probado para replicar en otras sedes"), k.cell("Control total y traslados entre sedes")],
    [k.cell("Abono", { bold: true }), k.cell("100 % al proyecto si firma en [DIAS_CREDITO] días"), k.cell("Se descuenta del proyecto completo"), k.cell("–")],
  ], { y: 3.3, colW: [1.6, 1.75, 1.75, 1.77], rowH: [0.38, 0.8, 0.5, 0.42, 0.42, 0.5, 0.42, 0.6, 0.55], fontSize: 10 });
  k.h2(s, "Por qué empezar por una parte", 8.15);
  k.bullets(s, [
    "Una decisión más pequeña se aprueba sin esperar el ciclo de junta.",
    "Los resultados de la primera fase se miden con datos de [EMPRESA], no con promesas.",
    "Lo invertido en el piloto o la primera bodega se reutiliza en el despliegue completo.",
  ], 8.55, 1.1);
  k.p(s, "Pagos por hitos en todas las opciones: 50 % a la firma · 40 % con obra certificada · 10 % solo si el conteo supera 95 % de exactitud.", 9.7, 0.5, { fontSize: 10, bold: true, color: C.text1 });
  k.p(s, "[NOMBRE_COMERCIAL]  ·  [CELULAR]  ·  [EMAIL]", 10.3, 0.3, { fontSize: 9.5 });
  await pres.writeFile({ fileName });
}

// =================================================================== A2 · Caso de éxito + guion de video
export async function generarA2(vars: Record<string, string>, fileName: string) {
  const V = conVariables(vars);
  const { pres, C } = newDoc("Caso de éxito  ·  Iterative S.A.S.", "Caso de Éxito y Guion de Video - Iterative", await logo("logo-tinta"));
  const k = kit(pres, C, V);
  let s = k.page();
  k.eyebrow(s, "CASO DE ÉXITO  ·  [CASO_SECTOR]", 1.0);
  k.h1(s, "[CASO_CLIENTE]", 1.32, 0.9);
  k.h2(s, "El reto", 2.35); k.p(s, "[CASO_RETO]", 2.75, 1.0, { color: C.text1 });
  k.h2(s, "Lo que implementamos", 3.9); k.p(s, "[CASO_SOLUCION]", 4.3, 1.0, { color: C.text1 });
  k.h2(s, "Resultados", 5.5);
  const sw = (CW - 0.3) / 3;
  [1, 2, 3].forEach((n, i) => k.stat(s, M + i * (sw + 0.15), 5.95, sw, `[CASO_M${n}_VALOR]`, `[CASO_M${n}_TEXTO]`, "EFEBFE"));
  k.box(s, M, 7.3, CW, 1.6, "F8F7F5", "Cita");
  k.T(s, [{ text: "“[CASO_CITA]”", options: { italic: true, breakLine: true } }, { text: "[CASO_AUTOR_CITA]", options: { bold: true, fontSize: 10 } }],
      { x: M + 0.3, y: 7.5, w: CW - 0.6, h: 1.25, fontSize: 13 });
  k.p(s, "Publicado con autorización: [CASO_AUTORIZACION]", 9.3, 0.3, { fontSize: 9, italic: true });

  s = k.page();
  k.eyebrow(s, "GUION DE VIDEO  ·  2 A 3 MINUTOS  ·  SEMANA 2", 1.0);
  k.h1(s, "Así se ve un conteo con RFID en bodega", 1.32, 0.9);
  k.table(s, [
    [k.head("Tiempo"), k.head("Escena"), k.head("Qué se ve"), k.head("Qué se dice")],
    [k.cell("0:00–0:15", { bold: true }), k.cell("Gancho"), k.cell("Pasillo de bodega lleno de referencias"), k.cell("“Contar esta bodega antes tomaba [DIAS_CONTEO_ACTUAL] días.”")],
    [k.cell("0:15–0:45", { bold: true }), k.cell("Antes"), k.cell("Auxiliar contando con planilla y calculadora"), k.cell("El problema en palabras del equipo: tiempo, errores, diferencias con el ERP")],
    [k.cell("0:45–1:30", { bold: true }), k.cell("El conteo RFID"), k.cell("Auxiliar recorre el pasillo con el lector portátil; pantalla del ERP actualizándose"), k.cell("Explicación simple de lo que pasa mientras camina")],
    [k.cell("1:30–2:00", { bold: true }), k.cell("Consulta en venta"), k.cell("Vendedor confirma disponibilidad y sede en el ERP con el cliente al teléfono"), k.cell("“Antes de colgar ya sabemos si está y dónde.”")],
    [k.cell("2:00–2:30", { bold: true }), k.cell("Resultado"), k.cell("Cifras del caso en pantalla: [CASO_M1_VALOR] · [CASO_M2_VALOR]"), k.cell("Testimonio corto del jefe de bodega (Champion)")],
    [k.cell("2:30–2:45", { bold: true }), k.cell("Cierre"), k.cell("Logo de iterative. y contacto"), k.cell("Invitación a una visita técnica")],
  ], { y: 2.4, colW: [0.9, 1.15, 2.4, 2.42], rowH: [0.36, 0.7, 0.7, 0.85, 0.8, 0.7, 0.55], fontSize: 9.5 });
  k.h2(s, "Reglas de grabación", 7.3);
  k.bullets(s, [
    "Grabar en la operación real, con el permiso escrito del cliente y sin mostrar precios ni datos sensibles en pantalla.",
    "Que hablen las personas de bodega: el mensaje es que el equipo gana herramientas, no que se reemplaza.",
    "Formato horizontal para correo y una versión vertical de 30 segundos para WhatsApp.",
    "Mientras no exista un caso propio autorizado, grabar en la bodega demostrativa de Iterative y decirlo así.",
  ], 7.7, 2.0);
  await pres.writeFile({ fileName });
}

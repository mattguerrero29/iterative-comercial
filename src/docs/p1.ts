// @ts-nocheck  -- código portado de la plantilla P1 original (pptxgenjs)
// P1 · Deck Ejecutivo de Valor y Retorno · se genera en el navegador con las variables del caso.
import { C, LOGO_RATIO, conVariables, logo, nuevaPresentacion } from "./base";

export async function generarP1(vars: Record<string, string>, fileName: string) {
  const V = conVariables(vars);
  const REC = vars["[OPCION_RECOMENDADA]"] || "";
  const LOGO_W = await logo("logo-blanco"), LOGO_T = await logo("logo-tinta");
  const pres = nuevaPresentacion("Deck Ejecutivo de Valor y Retorno - Iterative");
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  const TINTA = C.text1, PAPEL = C.background2, BLANCO = C.background1;
  const VIOLETA = C.accent1, CORAL = C.accent2, GRIS = C.accent3, GRIS_CL = C.accent4, GRIS_XL = C.accent5, CARBON = C.text2;

  const X = 0.6, W = 12.13;

  function frame(name, bg, logo, titleColor, numColor) {
    pres.defineSlideMaster({
      title: name,
      background: { color: bg },
      margin: [0.5, 0.6, 0.6, 0.6],
      objects: [
        { image: { x: X, y: 6.92, w: 1.0, h: 1.0 * LOGO_RATIO, data: logo } },
        { placeholder: { options: { name: "eyebrow", type: "body", x: X, y: 0.5, w: W, h: 0.35, fontSize: 12, bold: true, color: CORAL, charSpacing: 2, margin: 0, valign: "middle" }, text: "" } },
        { placeholder: { options: { name: "title", type: "title", x: X, y: 0.92, w: W, h: 1.5, fontSize: 34, bold: true, color: titleColor, align: "left", valign: "top", margin: 0, lineSpacingMultiple: 0.95 }, text: "" } },
      ],
      slideNumber: { x: 12.28, y: 6.86, w: 0.45, h: 0.3, fontSize: 10, color: numColor, align: "right" },
    });
  }
  frame("Contenido claro", PAPEL, LOGO_T, TINTA, GRIS);
  frame("Contenido oscuro", TINTA, LOGO_W, BLANCO, GRIS_CL);
  pres.defineSlideMaster({ title: "Portada", background: { color: TINTA }, objects: [] });

  function footer(slide, dark) {
    slide.addText("[EMPRESA]  ·  [MES_AAAA]", {
      x: 7.2, y: 6.86, w: 5.0, h: 0.3, fontSize: 10, color: dark ? GRIS_CL : GRIS, align: "right", margin: 0, isTextBox: true, objectName: "Pie",
    });
  }
  function card(slide, x, y, w, h, fill, name) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: name,
      shadow: { type: "outer", color: "0A0A0A", opacity: 0.08, blur: 10, offset: 2, angle: 90 },
    });
  }
  function txt(slide, text, o) {
    slide.addText(text, Object.assign({ margin: 0, isTextBox: true, valign: "top", color: TINTA, fontSize: 14 }, o));
  }

  // ---------------------------------------------------------------- 1 · Portada + índice
  pres.addSection({ title: "Portada" });
  {
    const s = V(pres.addSlide({ masterName: "Portada", sectionTitle: "Portada" }));
    s.addImage({ data: LOGO_W, x: X, y: 0.6, w: 2.0, h: 2.0 * LOGO_RATIO, altText: "Logo iterative." });
    txt(s, "PROPUESTA DE VALOR  ·  [MES_AAAA]", { x: X, y: 2.05, w: 6.6, h: 0.35, fontSize: 12, bold: true, color: CORAL, charSpacing: 2, objectName: "Etiqueta" });
    txt(s, "Propuesta para [EMPRESA]", { x: X, y: 2.5, w: 6.6, h: 2.45, fontSize: 40, bold: true, color: BLANCO, objectName: "Titulo portada" });
    txt(s, "Inventario en tiempo real en sus sedes, con RFID, obra civil llave en mano e integración a [ERP].", { x: X, y: 5.1, w: 6.3, h: 0.9, fontSize: 16, color: GRIS_CL, objectName: "Subtitulo" });
    txt(s, "Soluciones tecnológicas a la medida  ·  iterativeco.com", { x: X, y: 6.86, w: 6.0, h: 0.3, fontSize: 10, color: GRIS, objectName: "Lema" });

    // Panel de índice hipervinculado
    card(s, 7.55, 0.6, 5.18, 6.3, CARBON, "Panel indice");
    txt(s, "CONTENIDO", { x: 7.95, y: 0.95, w: 4.4, h: 0.3, fontSize: 11, bold: true, color: CORAL, charSpacing: 2 });
    const items = ["Lo que escuchamos", "La matemática del retorno", "Cómo funcionará su bodega", "Su equipo, más capaz", "Cómo empezamos", "Siguiente paso"];
    items.forEach((t, i) => {
      const y = 1.4 + i * 0.58;
      txt(s, String(i + 1).padStart(2, "0"), { x: 7.95, y, w: 0.6, h: 0.4, fontSize: 16, bold: true, color: VIOLETA, valign: "middle" });
      txt(s, [{ text: t, options: { hyperlink: { slide: i + 2, tooltip: "Ir a " + t } } }], { x: 8.6, y, w: 3.8, h: 0.4, fontSize: 16, color: BLANCO, valign: "middle", objectName: "Indice " + (i + 1) });
    });
    txt(s, "DOCUMENTOS DE SOPORTE", { x: 7.95, y: 5.05, w: 4.4, h: 0.3, fontSize: 11, bold: true, color: CORAL, charSpacing: 2 });
    [["Anexo Económico y Condiciones", "https://ENLACE_P2"], ["Anexo de Ingeniería y Obra Civil", "https://ENLACE_P3"]].forEach(([t, url], i) => {
      const y = 5.48 + i * 0.6;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.95, y, w: 4.38, h: 0.46, rectRadius: 0.23, fill: { color: i === 0 ? VIOLETA : CARBON }, line: { color: VIOLETA, width: 1.25 }, objectName: "Boton anexo " + (i + 2) });
      txt(s, [{ text: t + "  ↗", options: { hyperlink: { url, tooltip: "Abrir " + t } } }], { x: 7.95, y, w: 4.38, h: 0.46, fontSize: 13, bold: true, color: BLANCO, align: "center", valign: "middle" });
    });
    s.addNotes("Portada e índice. Cada punto del índice lleva a su slide; los botones abren los anexos P2 y P3 (no enviar P2 antes de presentar este deck en vivo). Encuadre: 'Hoy les mostramos lo que escuchamos, el número que hace sentido para [EMPRESA] y tres formas de empezar. Al final les pedimos una decisión sobre el siguiente paso.'");
  }

  // ---------------------------------------------------------------- 2 · Lo que escuchamos
  pres.addSection({ title: "Valor" });
  {
    const s = V(pres.addSlide({ masterName: "Contenido claro", sectionTitle: "Valor" }));
    s.addText("01  ·  LO QUE ESCUCHAMOS", { placeholder: "eyebrow" });
    s.addText("[EMPRESA] crece [CRECIMIENTO_CLIENTE_%] al año. Su inventario necesita seguir ese ritmo", { placeholder: "title" });
    [1, 2, 3].forEach((n, i) => {
      const x = X + i * 4.14;
      card(s, x, 2.75, 3.85, 3.25, BLANCO, "Dolor " + n);
      s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: 3.1, w: 0.6, h: 0.6, fill: { color: VIOLETA }, line: { color: VIOLETA, width: 0 } });
      txt(s, String(n), { x: x + 0.35, y: 3.1, w: 0.6, h: 0.6, fontSize: 18, bold: true, color: BLANCO, align: "center", valign: "middle" });
      txt(s, `[DOLOR_${n}_TITULO]`, { x: x + 0.35, y: 3.95, w: 3.15, h: 0.8, fontSize: 18, bold: true, objectName: `Dolor ${n} titulo` });
      txt(s, `[DOLOR_${n}_CIFRA]`, { x: x + 0.35, y: 4.85, w: 3.15, h: 1.05, fontSize: 14, color: GRIS, objectName: `Dolor ${n} cifra` });
    });
    txt(s, "Su sector (CIIU [CIIU]) creció [CRECIMIENTO_SECTOR_%]. ¿Esto describe bien su situación? ¿Falta algo?", { x: X, y: 6.25, w: 9.0, h: 0.35, fontSize: 12, italic: true, color: GRIS });
    footer(s, false);
    s.addNotes("Lea los dolores en las palabras del cliente y pregunte: ¿falta algo? Deje que el Champion complete. Si un dolor no aplica, táchelo en vivo: aumenta la credibilidad del resto.");
  }

  // ---------------------------------------------------------------- 3 · Matemática del retorno
  {
    const s = V(pres.addSlide({ masterName: "Contenido claro", sectionTitle: "Valor" }));
    s.addText("02  ·  LA MATEMÁTICA DEL RETORNO", { placeholder: "eyebrow" });
    s.addText("Cada día de inventario que [EMPRESA] deja de mantener libera $[CMD_M] millones", { placeholder: "title" });
    card(s, X, 2.75, 4.5, 3.3, VIOLETA, "Cifra CMD");
    txt(s, "$[CMD_M] M", { x: X + 0.4, y: 3.15, w: 3.8, h: 1.1, fontSize: 60, bold: true, color: BLANCO, objectName: "CMD grande" });
    txt(s, "Costo de mercancía por día (CMD): el dinero que libera cada día de inventario que se deja de mantener.", { x: X + 0.4, y: 4.4, w: 3.75, h: 1.3, fontSize: 14, color: BLANCO });

    const head = { bold: true, color: BLANCO, fill: { color: TINTA }, fontSize: 13 };
    const cell = { color: TINTA, fill: { color: BLANCO }, fontSize: 14 };
    const rows = [
      [{ text: "Dato", options: head }, { text: "Valor", options: Object.assign({ align: "right" }, head) }],
      [{ text: "Ventas diarias ([VENTAS_ANUALES] ÷ 365)", options: cell }, { text: "[VENTAS_DIA]", options: Object.assign({ align: "right" }, cell) }],
      [{ text: "Margen bruto ([FUENTE_MARGEN])", options: cell }, { text: "[MARGEN_BRUTO_%]", options: Object.assign({ align: "right" }, cell) }],
      [{ text: "Costo de mercancía por día", options: cell }, { text: "[CMD]", options: Object.assign({ align: "right" }, cell) }],
      [{ text: "Inversión · [OPCION_RECOMENDADA]", options: cell }, { text: "[INVERSION_FASE]", options: Object.assign({ align: "right" }, cell) }],
      [{ text: "Días de inventario que pagan la fase", options: Object.assign({}, cell, { bold: true, fill: { color: GRIS_XL } }) },
       { text: "[DIAS_PAGAN_FASE] días", options: Object.assign({}, cell, { bold: true, color: CORAL, fontSize: 18, align: "right", fill: { color: GRIS_XL } }) }],
    ];
    s.addTable(rows, { x: 5.45, y: 2.75, w: 7.28, colW: [5.03, 2.25], rowH: 0.55, border: { type: "solid", pt: 0.75, color: "DDDCDA" }, margin: [0, 0.15, 0, 0.15], valign: "middle", objectName: "Tabla retorno" });
    txt(s, "La línea base de días de inventario se mide en la visita técnica, antes de firmar, y el avance se reporta cada trimestre en [ERP]. Fuente: estados financieros reportados a Supersociedades; promedios del sector CIIU [CIIU], [N_EMPRESAS] empresas.",
      { x: X, y: 6.2, w: W, h: 0.5, fontSize: 10, color: GRIS, objectName: "Fuente" });
    footer(s, false);
    s.addNotes("Pausa después del número central. 'Si mantener un día de inventario cuesta $[CMD_M] millones, la pregunta es cuántos días podemos reducir. Con [DIAS_PAGAN_FASE] se paga la fase.' Deje que el CFO pregunte. Si cuestiona el margen, use el del cliente: el argumento resiste con márgenes 5 puntos menores. La caja se libera una vez; luego queda disponible para pagar pasivo de corto plazo o financiar crecimiento sin deuda nueva.");
  }

  // ---------------------------------------------------------------- 4 · Flujo operativo
  {
    const s = V(pres.addSlide({ masterName: "Contenido claro", sectionTitle: "Valor" }));
    s.addText("03  ·  CÓMO FUNCIONARÁ SU BODEGA", { placeholder: "eyebrow" });
    s.addText("Recibir, ubicar, despachar y contar con [ERP] actualizado en cada paso", { placeholder: "title" });
    const steps = [
      ["Entrada", "El arco de lectura registra cada pieza que entra y sale, sin digitar."],
      ["Ubicación", "Las antenas de estantería muestran en qué zona está cada referencia."],
      ["Despacho", "Ventas confirma disponibilidad y sede en [ERP] antes de colgar."],
      ["Conteo", "El conteo completo pasa de [DIAS_CONTEO_ACTUAL] días a horas, cada mes y sin parar despachos."],
    ];
    steps.forEach(([t, d], i) => {
      const x = X + i * 3.06;
      card(s, x, 2.75, 2.85, 2.35, BLANCO, "Paso " + (i + 1));
      txt(s, String(i + 1).padStart(2, "0"), { x: x + 0.3, y: 3.0, w: 1.0, h: 0.5, fontSize: 24, bold: true, color: CORAL });
      txt(s, t, { x: x + 0.3, y: 3.55, w: 2.3, h: 0.4, fontSize: 17, bold: true });
      txt(s, d, { x: x + 0.3, y: 4.0, w: 2.3, h: 1.0, fontSize: 13, color: GRIS });
    });
    txt(s, "Tres decisiones que el sistema hace posibles", { x: X, y: 5.4, w: 6, h: 0.35, fontSize: 14, bold: true });
    ["Trasladar antes de comprar", "Mover el inventario quieto", "Contar en horas"].forEach((t, i) => {
      const x = X + i * 4.14;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 5.85, w: 3.85, h: 0.55, rectRadius: 0.27, fill: { color: "EFEBFE" }, line: { color: "EFEBFE", width: 0 }, objectName: "Decision " + (i + 1) });
      txt(s, t, { x, y: 5.85, w: 3.85, h: 0.55, fontSize: 14, bold: true, color: VIOLETA, align: "center", valign: "middle" });
    });
    footer(s, false);
    s.addNotes("Recorra el flujo con el ejemplo de una referencia real del cliente. Las tres decisiones: (1) antes de cada orden de compra el comprador ve el saldo real de todas las sedes y traslada en lugar de comprar; (2) el tablero muestra cada semana las referencias sin movimiento por sede; (3) antenas fijas y lectores portátiles reducen el conteo de días a horas. Mire al Champion: '[NOMBRE_CHAMPION], ¿así lo ve?'");
  }

  // ---------------------------------------------------------------- 5 · Su equipo
  {
    const s = V(pres.addSlide({ masterName: "Contenido claro", sectionTitle: "Valor" }));
    s.addText("04  ·  SU EQUIPO, MÁS CAPAZ", { placeholder: "eyebrow" });
    s.addText("El equipo de bodega deja de contar y empieza a controlar", { placeholder: "title" });
    card(s, X, 2.75, 4.5, 3.55, TINTA, "Acompanamiento");
    txt(s, "[SEMANAS_ACOMPANAMIENTO] semanas", { x: X + 0.4, y: 3.15, w: 3.8, h: 0.9, fontSize: 40, bold: true, color: CORAL });
    txt(s, "de acompañamiento en sitio después de la puesta en marcha. Su equipo gana herramientas y el trabajo pesado lo hace Iterative.", { x: X + 0.4, y: 4.15, w: 3.75, h: 1.8, fontSize: 15, color: BLANCO });
    const rows = [
      ["Etiquetado inicial", "Iterative etiqueta el inventario con su propio personal."],
      ["Capacitación por rol", "Bodega, ventas, compras y contabilidad aprenden su proceso."],
      ["Obra sin parar despachos", "La obra civil se programa en horarios de baja operación."],
      ["Primer cierre acompañado", "Informe de conciliación por sede para ajustar antes de la revisoría fiscal."],
    ];
    rows.forEach(([t, d], i) => {
      const y = 2.8 + i * 0.9;
      s.addShape(pres.shapes.OVAL, { x: 5.55, y: y + 0.05, w: 0.5, h: 0.5, fill: { color: VIOLETA }, line: { color: VIOLETA, width: 0 } });
      txt(s, String(i + 1), { x: 5.55, y: y + 0.05, w: 0.5, h: 0.5, fontSize: 15, bold: true, color: BLANCO, align: "center", valign: "middle" });
      txt(s, t, { x: 6.3, y, w: 6.4, h: 0.35, fontSize: 16, bold: true });
      txt(s, d, { x: 6.3, y: y + 0.36, w: 6.4, h: 0.4, fontSize: 14, color: GRIS });
    });
    footer(s, false);
    s.addNotes("Regla de oro cultural: la tecnología amplía las capacidades del personal; no busca eliminar puestos. Advertencia contable (dígala ahora): el primer conteo RFID puede mostrar diferencias frente a [ERP], sobrantes y faltantes. Es mejor que [EMPRESA] las conozca y ajuste en su calendario antes de que las encuentre el revisor fiscal o un banco.");
  }

  // ---------------------------------------------------------------- 6 · Cómo empezamos
  pres.addSection({ title: "Decisión" });
  {
    const s = V(pres.addSlide({ masterName: "Contenido claro", sectionTitle: "Decisión" }));
    s.addText("05  ·  CÓMO EMPEZAMOS", { placeholder: "eyebrow" });
    s.addText("Una decisión del tamaño correcto para empezar", { placeholder: "title" });
    const opts = [
      { n: "Piloto de 1 mes", p: "[PRECIO_PILOTO]", sc: "[ZONA_PILOTO] e informe de conciliación de inventario.", d: "[D_PIL]", w: "[SEM_PIL]", hi: REC.startsWith("E1") },
      { n: "Bodega [SEDE_1]", p: "[PRECIO_BODEGA1]", sc: "Antenas, lectores, pistolas, obra civil e integración a [ERP].", d: "[D_B1]", w: "[SEM_B1]", hi: REC.startsWith("E2") },
      { n: "Proyecto completo", p: "[PRECIO_TOTAL]", sc: "[N_SEDES] sedes, [M2_TOTAL] m² y tablero consolidado de inventario.", d: "[D_TOT]", w: "[SEM_TOT]", hi: REC.startsWith("E3") },
    ];
    opts.forEach((o, i) => {
      const x = X + i * 4.14, y = 2.2;
      const fg = o.hi ? BLANCO : TINTA, sub = o.hi ? "EFEBFE" : GRIS;
      card(s, x, y, 3.85, 3.35, o.hi ? VIOLETA : BLANCO, "Opcion " + (i + 1));
      if (o.hi) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.3, y: y + 0.25, w: 1.55, h: 0.32, rectRadius: 0.16, fill: { color: CORAL }, line: { color: CORAL, width: 0 }, objectName: "Etiqueta recomendada" });
        txt(s, "RECOMENDADA", { x: x + 0.3, y: y + 0.25, w: 1.55, h: 0.32, fontSize: 10, bold: true, color: BLANCO, align: "center", valign: "middle", charSpacing: 1 });
      }
      txt(s, o.n, { x: x + 0.3, y: y + 0.7, w: 3.25, h: 0.4, fontSize: 18, bold: true, color: fg });
      txt(s, o.p, { x: x + 0.3, y: y + 1.12, w: 3.25, h: 0.6, fontSize: 32, bold: true, color: o.hi ? BLANCO : VIOLETA });
      txt(s, o.n.startsWith("Piloto") ? "antes de IVA" : "antes de IVA · etiquetas aparte", { x: x + 0.3, y: y + 1.7, w: 3.25, h: 0.25, fontSize: 11, color: sub });
      txt(s, o.sc, { x: x + 0.3, y: y + 2.0, w: 3.25, h: 0.65, fontSize: 13, color: fg });
      txt(s, [{ text: o.d + " días", options: { bold: true } }, { text: " de inventario la pagan", options: { breakLine: true } }, { text: "Puesta en marcha: " + o.w + " semanas", options: {} }],
        { x: x + 0.3, y: y + 2.7, w: 3.25, h: 0.5, fontSize: 12, color: sub });
    });
    // Barra proporcional de pagos 50 / 40 / 10
    txt(s, "Pagos por hitos", { x: X, y: 5.8, w: 3, h: 0.3, fontSize: 13, bold: true });
    const segs = [[0.5, TINTA, "50 % a la firma"], [0.4, VIOLETA, "40 % con obra certificada"], [0.1, CORAL, "10 % contra exactitud > 95 %"]];
    let bx = X;
    segs.forEach(([f, col, lab], i) => {
      const w = W * f;
      s.addShape(pres.shapes.RECTANGLE, { x: bx, y: 6.15, w, h: 0.22, fill: { color: col }, line: { color: col, width: 0 }, objectName: "Pago " + (i + 1) });
      txt(s, lab, { x: i === 2 ? X + W - 3.2 : bx, y: 6.42, w: i === 2 ? 3.2 : w, h: 0.3, fontSize: 11, color: GRIS, align: i === 2 ? "right" : "left" });
      bx += w;
    });
    footer(s, false);
    s.addNotes("Presente primero el Proyecto completo (ancla), luego recomiende la opción destacada ([OPCION_RECOMENDADA]). El valor del piloto se abona 100 % al proyecto si firman dentro del plazo de crédito. El último 10 % depende de que el sistema cumpla: si el conteo no supera 95 % de exactitud, ese pago no se causa.");
  }

  // ---------------------------------------------------------------- 7 · Siguiente paso
  {
    const s = V(pres.addSlide({ masterName: "Contenido oscuro", sectionTitle: "Decisión" }));
    s.addText("06  ·  SIGUIENTE PASO", { placeholder: "eyebrow" });
    s.addText("Visita técnica el [FECHA_PROPUESTA] para medir la línea base", { placeholder: "title" });
    const cols = [
      ["Qué hacemos", [{ text: "Medimos días de inventario, exactitud y tiempos de conteo, y probamos la lectura en su zona más difícil.", options: {} }]],
      ["Quién asiste", [{ text: "[NOMBRE_CHAMPION]", options: { bold: true, breakLine: true } }, { text: "[NOMBRE_TI]", options: { bold: true, breakLine: true } }, { text: "y el equipo de ingeniería de Iterative.", options: {} }]],
      ["Qué entregamos", [{ text: "En [DIAS_ENTREGA] días: dimensionamiento final, línea base firmada y opción de inicio confirmada.", options: {} }]],
    ];
    cols.forEach(([t, body], i) => {
      const x = X + i * 4.14;
      card(s, x, 2.75, 3.85, 2.5, CARBON, "Paso siguiente " + (i + 1));
      txt(s, t, { x: x + 0.35, y: 3.05, w: 3.15, h: 0.4, fontSize: 18, bold: true, color: CORAL });
      txt(s, body, { x: x + 0.35, y: 3.55, w: 3.15, h: 1.5, fontSize: 14, color: BLANCO, paraSpaceAfter: 2 });
    });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y: 5.6, w: 4.6, h: 0.62, rectRadius: 0.31, fill: { color: VIOLETA }, line: { color: VIOLETA, width: 0 }, objectName: "Llamado a la accion" });
    txt(s, "¿Dejamos agendada la visita hoy?", { x: X, y: 5.6, w: 4.6, h: 0.62, fontSize: 16, bold: true, color: BLANCO, align: "center", valign: "middle" });
    txt(s, [{ text: "[NOMBRE_COMERCIAL]  ·  [CARGO]", options: { bold: true, breakLine: true } }, { text: "[CELULAR]  ·  [EMAIL]", options: {} }],
      { x: 6.9, y: 5.6, w: 5.83, h: 0.62, fontSize: 13, color: BLANCO, align: "right", valign: "middle", objectName: "Contacto" });
    footer(s, true);
    s.addNotes("Cierre: '¿Qué necesitan ver para decidir entre la bodega [SEDE_1] y el piloto? ¿Agendamos esa reunión ahora?' Ninguna reunión termina sin el siguiente paso en calendario: envíe la invitación antes de salir. Enviar el resumen post-presentación en menos de 4 horas.");
  }

    await pres.writeFile({ fileName });
}

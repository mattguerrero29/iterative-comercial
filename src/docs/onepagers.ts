// @ts-nocheck  -- usa la API dinámica de pptxgenjs
// One-pagers por interlocutor (Playbook 2.6): CEO, Gerente Financiero, Champion de Operaciones y TI. A4, una página cada uno.
import { C, LOGO_RATIO, conVariables, logo, nuevaPresentacion } from "./base";

const PW = 8.27, PH = 11.69, M = 0.75, CW = PW - 2 * M;

interface Bloque { titulo: string; texto?: string; puntos?: string[] }
interface OnePager { rol: string; titular: string; intro: string; bloques: Bloque[]; destacado: string; siguiente: string; firma: string }

export const ONE_PAGERS: OnePager[] = [
  {
    rol: "CEO / JUNTA DIRECTIVA",
    titular: "Disponibilidad confirmada antes de colgar el teléfono, en sus [N_SEDES] sedes",
    intro: "[EMPRESA] creció [CRECIMIENTO_CLIENTE_%] el último año, frente a [CRECIMIENTO_SECTOR_%] de su sector. Ese ritmo exige saber qué hay, dónde está y cómo se mueve cada referencia, sin esperar al próximo conteo.",
    bloques: [
      { titulo: "Qué cambia", puntos: [
        "Ventas: el equipo comercial confirma disponibilidad y sede en [ERP] mientras el cliente está en la línea.",
        "Caja: cada día de inventario que se deja de mantener libera $[CMD_M] millones. Reducir [DIAS_PAGAN_FASE] días paga la primera fase.",
        "Control: el conteo completo pasa de [DIAS_CONTEO_ACTUAL] días a horas.",
      ] },
      { titulo: "Su equipo", texto: "Iterative etiqueta el inventario inicial y acompaña en sitio. El personal de bodega gana herramientas; el sistema amplía lo que hoy hacen." },
      { titulo: "Cómo empezamos", texto: "Una bodega o un piloto pago de 1 mes, con informe de conciliación. El valor del piloto se abona al proyecto." },
    ],
    destacado: "$[CMD_M] M liberados por cada día de inventario",
    siguiente: "Reunión de decisión de 45 minutos el [FECHA_REUNION_DECISION].",
    firma: "[NOMBRE_COMERCIAL]  ·  [CARGO]  ·  [CELULAR]  ·  [EMAIL]",
  },
  {
    rol: "GERENTE FINANCIERO",
    titular: "$[CMD_M] millones por día: lo que vale cada día de inventario en [EMPRESA]",
    intro: "Ventas [VENTAS_ANUALES] × (1 − margen [MARGEN_BRUTO_%]) ÷ 365 = costo de mercancía por día de [CMD]. La inversión de la fase recomendada ([INVERSION_FASE]) se paga con [DIAS_PAGAN_FASE] días menos de inventario.",
    bloques: [
      { titulo: "La caja", texto: "Se libera una vez y queda disponible para pagar pasivo de corto plazo o financiar crecimiento sin deuda nueva." },
      { titulo: "Cómo se paga", puntos: [
        "50 % a la firma · 40 % con obra certificada · 10 % solo si el conteo RFID supera 95 % de exactitud.",
        "Etiquetas fijas en consignación a 24 meses.",
        "Mantenimiento con mensualidad fija.",
      ] },
      { titulo: "Efecto contable", texto: "El primer conteo RFID puede mostrar sobrantes y faltantes frente a [ERP]. Entregamos un informe de conciliación por sede para que [EMPRESA] ajuste en su propio calendario, antes de que lo encuentre la revisoría fiscal o un banco." },
    ],
    destacado: "[DIAS_PAGAN_FASE] días de inventario pagan la fase",
    siguiente: "Revisar el Anexo Económico juntos el [FECHA_REUNION_DECISION].",
    firma: "[NOMBRE_COMERCIAL]  ·  [CELULAR]  ·  [EMAIL]",
  },
  {
    rol: "JEFE DE OPERACIONES",
    titular: "Menos tiempo contando, más tiempo controlando la bodega",
    intro: "Lo que nos contó: “[CITA_LITERAL_CHAMPION]”",
    bloques: [
      { titulo: "Qué cambia en su día", puntos: [
        "Recibo: el arco registra la mercancía al entrar.",
        "Búsqueda: el lector portátil ubica una referencia en segundos.",
        "Conteo: de [DIAS_CONTEO_ACTUAL] días a horas, cada mes y sin parar despachos.",
        "Traslados: ve el saldo real de las [N_SEDES] sedes antes de pedir compra.",
      ] },
      { titulo: "Lo que hace Iterative por su equipo", puntos: [
        "Etiquetamos el inventario inicial con nuestro personal.",
        "Acompañamos en sitio [SEMANAS_ACOMPANAMIENTO] semanas tras arrancar.",
        "Capacitamos a cada auxiliar en su proceso.",
        "Programamos la obra en horarios que no afectan despachos.",
      ] },
    ],
    destacado: "Usted lidera el cambio; nosotros cargamos el trabajo pesado",
    siguiente: "Visita técnica el [FECHA_PROPUESTA] para medir la línea base.",
    firma: "[NOMBRE_COMERCIAL]  ·  [CELULAR]  ·  [EMAIL]",
  },
  {
    rol: "DIRECTOR DE TI",
    titular: "RFID integrado a [ERP]: eventos de inventario en tiempo real, sin cambiar su ERP",
    intro: "Antenas UHF y lectores de 4 puertos → PC de procesamiento por sede → middleware Iterative → [ERP] mediante [METODO_INTEGRACION]. Eventos sincronizados: entrada, ubicación, traslado, salida y ajuste.",
    bloques: [
      { titulo: "Lo que necesitamos de TI", puntos: [
        "Acceso al ambiente de pruebas de [ERP]: unas [HORAS_TI_ESTIMADAS] horas de su equipo.",
        "Punto de red y eléctrico regulado por zona (la obra civil la ejecuta Iterative).",
        "Un responsable para aprobar el paso a producción.",
      ] },
      { titulo: "Lo que entrega Iterative", puntos: [
        "Puntos de instalación, soportes, cableado y UPS regulada por sede.",
        "Documentación de la integración y matriz de responsabilidades.",
        "Soporte según plan (Compartido o Completo).",
        "Capacidad para nuevas sedes sin rediseñar la arquitectura.",
      ] },
    ],
    destacado: "Su [ERP] no se modifica: se conecta y se prueba antes de producción",
    siguiente: "Sesión técnica de 60 minutos para revisar la integración.",
    firma: "[NOMBRE_INGENIERO]  ·  [NOMBRE_COMERCIAL]  ·  [EMAIL]",
  },
];

export async function generarOnePagers(vars: Record<string, string>, fileName: string, cuales = [0, 1, 2, 3]) {
  const V = conVariables(vars);
  const LOGO_T = await logo("logo-tinta");
  const pres = nuevaPresentacion("One-pagers por interlocutor - Iterative");
  pres.defineLayout({ name: "A4V", width: PW, height: PH });
  pres.layout = "A4V";
  const T = (s, text, o) => s.addText(text, Object.assign({ margin: 0, isTextBox: true, valign: "top", color: C.text1, fontSize: 12 }, o));

  for (const i of cuales) {
    const op = ONE_PAGERS[i];
    const s = V(pres.addSlide());
    s.raw.background = { color: C.background1 };
    s.addImage({ data: LOGO_T, x: M, y: 0.5, w: 1.2, h: 1.2 * LOGO_RATIO });
    T(s, "[EMPRESA]  ·  [MES_AAAA]", { x: PW - M - 4, y: 0.5, w: 4, h: 0.3, fontSize: 9, color: C.accent3, align: "right" });
    T(s, "ONE-PAGER  ·  " + op.rol, { x: M, y: 1.15, w: CW, h: 0.25, fontSize: 9, bold: true, color: C.accent2, charSpacing: 2 });
    T(s, op.titular, { x: M, y: 1.5, w: CW, h: 1.25, fontSize: 22, bold: true });
    T(s, op.intro, { x: M, y: 2.85, w: CW, h: 1.0, fontSize: 12, color: C.accent3 });
    let y = 4.0;
    for (const b of op.bloques) {
      T(s, b.titulo, { x: M, y, w: CW, h: 0.32, fontSize: 13, bold: true, color: C.accent1 });
      y += 0.38;
      if (b.texto) {
        const h = Math.max(0.5, Math.ceil(b.texto.length / 95) * 0.24 + 0.1);
        T(s, b.texto, { x: M, y, w: CW, h, fontSize: 11, color: C.text1 }); y += h + 0.2;
      } else if (b.puntos) {
        const h = b.puntos.reduce((a, p) => a + Math.ceil(p.length / 90) * 0.24 + 0.08, 0) + 0.05;
        T(s, b.puntos.map((p, j) => ({ text: p, options: { bullet: { indent: 12 }, breakLine: j < b.puntos.length - 1 } })), { x: M, y, w: CW, h, fontSize: 11, paraSpaceAfter: 4 });
        y += h + 0.2;
      }
    }
    const yD = Math.max(y + 0.1, 8.9);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: yD, w: CW, h: 0.75, rectRadius: 0.08, fill: { color: "EFEBFE" }, line: { color: "EFEBFE", width: 0 } });
    T(s, op.destacado, { x: M + 0.25, y: yD, w: CW - 0.5, h: 0.75, fontSize: 14, bold: true, color: C.accent1, valign: "middle" });
    T(s, [{ text: "Siguiente paso: ", options: { bold: true } }, { text: op.siguiente, options: {} }], { x: M, y: yD + 0.95, w: CW, h: 0.35, fontSize: 12 });
    T(s, op.firma, { x: M, y: PH - 0.75, w: CW, h: 0.3, fontSize: 9, color: C.accent3 });
  }
  await pres.writeFile({ fileName });
}

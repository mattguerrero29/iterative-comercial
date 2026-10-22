// A1 · Calculadora de Caja Inmovilizada: Excel con fórmulas para que el cliente ajuste sus propios supuestos.
import type { Caso } from "../caso/tipos";
import type { Calculo } from "../caso/calculo";

/** Construye el libro y devuelve el archivo (separado de la descarga para poder probarlo). */
export async function construirA1(c: Caso, k: Calculo, empresa: string): Promise<ArrayBuffer> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Iterative S.A.S.";
  wb.calcProperties.fullCalcOnLoad = true;
  const ws = wb.addWorksheet("Calculadora", { views: [{ showGridLines: false }] });
  ws.columns = [{ width: 52 }, { width: 22 }, { width: 22 }, { width: 22 }, { width: 46 }];

  const F = "Arial";
  const tinta = "FF0A0A0A", violeta = "FF7C5DFA", coral = "FFEF6B7A", gris = "FF545352";
  const input = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFFDE7EA" } };
  const clave = { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb: "FFEFEBFE" } };
  const COP = '"$"#,##0;("$"#,##0);"-"', PCT = "0.0%", DIAS = '#,##0.0" días"', VECES = '0.0"x"';

  ws.mergeCells("A1:E1");
  ws.getCell("A1").value = "iterative.  ·  Calculadora de Caja Inmovilizada";
  ws.getCell("A1").font = { name: F, size: 16, bold: true, color: { argb: "FFFFFFFF" } };
  ws.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: tinta } };
  ws.getRow(1).height = 32;
  ws.getCell("A2").value = `Preparada para ${empresa} · Las celdas rosadas son supuestos: cámbielos y los resultados se recalculan.`;
  ws.getCell("A2").font = { name: F, italic: true, size: 10, color: { argb: gris } };

  const fila = (r: number, label: string, valor: number | { formula: string }, fmt: string, nota = "", tipo: "in" | "out" | "key" = "out") => {
    ws.getCell(`A${r}`).value = label;
    ws.getCell(`A${r}`).font = { name: F, size: 11, bold: tipo === "key" };
    const b = ws.getCell(`B${r}`);
    b.value = valor as never;
    b.numFmt = fmt;
    b.font = { name: F, size: 11, bold: tipo !== "in", color: { argb: tipo === "in" ? "FF0000FF" : tipo === "key" ? violeta : tinta } };
    if (tipo === "in") b.fill = input;
    if (tipo === "key") { b.fill = clave; ws.getCell(`A${r}`).fill = clave; }
    ws.getCell(`E${r}`).value = nota;
    ws.getCell(`E${r}`).font = { name: F, size: 9, italic: true, color: { argb: gris } };
  };
  const seccion = (r: number, t: string) => {
    ws.getCell(`A${r}`).value = t;
    ws.getCell(`A${r}`).font = { name: F, size: 12, bold: true, color: { argb: violeta } };
  };

  seccion(4, "1. Sus datos");
  fila(5, "Ventas anuales (COP)", c.fin.ventas, COP, "Último ejercicio reportado", "in");
  fila(6, "Margen bruto", c.fin.margen, PCT, "Propio o promedio del sector", "in");
  fila(7, "Días de inventario actuales", Math.round(k.retorno.dio * 10) / 10, DIAS, "Medido en la visita o estimado con el balance", "in");
  fila(8, "Inversión evaluada (COP)", k.invFase, COP, `Opción: ${c.prop.OPCION_RECOMENDADA ?? ""}`, "in");

  seccion(10, "2. Lo que vale cada día de inventario");
  fila(11, "Costo de mercancía por día (CMD)", { formula: "B5*(1-B6)/365" }, COP, "Ventas × (1 − margen) ÷ 365", "key");
  fila(12, "Caja inmovilizada en inventario", { formula: "B7*B11" }, COP, "Días de inventario × CMD");
  fila(13, "Días de inventario que pagan la inversión", { formula: "IF(B11=0,0,B8/B11)" }, DIAS, "Inversión ÷ CMD", "key");
  fila(14, "Reducción de inventario requerida", { formula: "IF(B7=0,0,B13/B7)" }, PCT, "Si es menor al 10 %, el retorno es muy alcanzable");

  seccion(16, "3. Escenarios");
  ["Conservador", "Base", "Optimista"].forEach((t, i) => {
    const col = ["B", "C", "D"][i];
    ws.getCell(`${col}17`).value = t;
    ws.getCell(`${col}17`).font = { name: F, bold: true, color: { argb: "FFFFFFFF" } };
    ws.getCell(`${col}17`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: tinta } };
    ws.getCell(`${col}17`).alignment = { horizontal: "center" };
    const d = ws.getCell(`${col}18`); d.value = c.ret.escenarios[i]; d.numFmt = DIAS; d.fill = input; d.font = { name: F, color: { argb: "FF0000FF" } };
    const cj = ws.getCell(`${col}19`); cj.value = { formula: `${col}18*$B$11` } as never; cj.numFmt = COP; cj.font = { name: F, bold: true };
    const cv = ws.getCell(`${col}20`); cv.value = { formula: `IF($B$8=0,0,${col}19/$B$8)` } as never; cv.numFmt = VECES; cv.font = { name: F, bold: true, color: { argb: violeta } };
  });
  ws.getCell("A18").value = "Días de inventario que se reducen"; ws.getCell("A19").value = "Caja liberada (una sola vez)"; ws.getCell("A20").value = "Veces que la caja liberada cubre la inversión";
  ["A18", "A19", "A20"].forEach((a) => (ws.getCell(a).font = { name: F, size: 11 }));

  ws.getCell("A22").value = "La caja se libera una sola vez y queda disponible para pagar pasivo de corto plazo o financiar crecimiento sin deuda nueva.";
  ws.getCell("A22").font = { name: F, size: 10, italic: true, color: { argb: gris } };
  ws.getCell("A23").value = "La línea base se mide en la visita técnica; los resultados reales se reportan cada trimestre.";
  ws.getCell("A23").font = { name: F, size: 10, italic: true, color: { argb: gris } };
  ws.getCell("A25").value = `${c.prop.NOMBRE_COMERCIAL ?? ""}  ·  ${c.prop.CELULAR ?? ""}  ·  ${c.prop.EMAIL ?? ""}  ·  iterativeco.com`;
  ws.getCell("A25").font = { name: F, size: 10, color: { argb: coral }, bold: true };
  for (let r = 3; r <= 25; r++) ws.getRow(r).height = 20;

  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

export async function generarA1(c: Caso, k: Calculo, empresa: string, fileName: string) {
  const buf = await construirA1(c, k, empresa);
  const url = URL.createObjectURL(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
  const a = document.createElement("a");
  a.href = url; a.download = fileName; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

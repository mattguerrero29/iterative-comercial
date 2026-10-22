// Utilidades comunes para generar los documentos (PowerPoint) en el navegador con la marca iterativeco.com.
import pptxgen from "pptxgenjs";
import { llenar } from "../caso/calculo";

// Colores de marca (mismos nombres que el tema de las plantillas originales)
export const C = {
  text1: "0A0A0A", text2: "252524", background1: "FFFFFF", background2: "F8F7F5",
  accent1: "7C5DFA", accent2: "EF6B7A", accent3: "545352", accent4: "C2C1BF", accent5: "EEEDEB",
};
export const LOGO_RATIO = 253 / 1200;

const cache: Record<string, string> = {};
export async function logo(nombre: "logo-blanco" | "logo-tinta"): Promise<string> {
  if (cache[nombre]) return cache[nombre];
  const blob = await (await fetch(`/${nombre}.png`)).blob();
  const data = await new Promise<string>((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.readAsDataURL(blob); });
  return (cache[nombre] = data.replace(/^data:/, ""));
}

export function nuevaPresentacion(titulo: string) {
  const pres = new pptxgen();
  pres.author = "Iterative S.A.S.";
  pres.company = "Iterative S.A.S.";
  pres.title = titulo;
  pres.theme = { headFontFace: "Arial", bodyFontFace: "Arial" };
  return pres;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Run = { text: string; options?: any };

/**
 * Envuelve una diapositiva para que todo texto pase por las variables del caso.
 * Los hipervínculos "https://ENLACE_P2" se reemplazan por la URL real (o se quitan si no hay).
 */
export function conVariables(vars: Record<string, string>) {
  const R = (s: string) => llenar(s, vars);
  const runs = (t: string | Run[]) => {
    if (typeof t === "string") return R(t);
    return t.map((r) => {
      const opt = r.options ? { ...r.options } : undefined;
      const url: string | undefined = opt?.hyperlink?.url;
      if (url) {
        const m = url.match(/ENLACE_P\d/);
        const real = m ? vars[`[${m[0]}]`] : url;
        if (real) opt.hyperlink = { ...opt.hyperlink, url: real }; else delete opt.hyperlink;
      }
      return { text: R(r.text), options: opt };
    });
  };
  return (slide: pptxgen.Slide) => ({
    raw: slide,
    addText: (t: string | Run[], o: any) => slide.addText(runs(t) as any, o),
    addShape: (s: any, o: any) => slide.addShape(s, o),
    addImage: (o: any) => slide.addImage(o),
    addTable: (rows: Run[][], o: any) => slide.addTable(rows.map((row) => row.map((c) => ({ ...c, text: R(c.text) }))) as any, o),
    addNotes: (n: string) => slide.addNotes(R(n)),
  });
}
export type SlideV = ReturnType<ReturnType<typeof conVariables>>;

export const nombreArchivo = (empresa: string, sufijo: string, version: number, ext = "pptx") => {
  const slug = empresa.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[\\/:*?"<>|.,]/g, "").trim().replace(/\s+/g, "_") || "CLIENTE";
  const f = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `ITERATIVE_${slug}_${sufijo}_v${version}_${f}.${ext}`;
};

// TRM oficial (Superintendencia Financiera) desde el portal de datos abiertos de Colombia.
const URL_TRM = "https://www.datos.gov.co/resource/32sa-8pi3.json?$select=valor,vigenciadesde,vigenciahasta&$order=vigenciadesde%20DESC&$limit=1";

export async function consultarTrmHoy(): Promise<{ valor: number; desde: string }> {
  const r = await fetch(URL_TRM);
  if (!r.ok) throw new Error("TRM no disponible");
  const [fila] = (await r.json()) as { valor: string; vigenciadesde: string }[];
  const valor = Number(fila?.valor);
  if (!valor) throw new Error("TRM no disponible");
  return { valor, desde: fila.vigenciadesde.slice(0, 10) };
}

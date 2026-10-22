import { etapa, ABIERTAS } from "../config/etapas";
import type { Oportunidad } from "./types";

export type Semaforo = "verde" | "amarillo" | "rojo" | "cerrada";

export const hoyISO = () => new Date().toISOString().slice(0, 10);

export function diasEntre(desdeISO: string, hasta = new Date()): number {
  return Math.floor((hasta.getTime() - new Date(desdeISO).getTime()) / 86_400_000);
}

export const diasEnEtapa = (o: Oportunidad) => diasEntre(o.etapaDesde);

export const abierta = (o: Oportunidad) => ABIERTAS.includes(o.etapa);

/** Motivos por los que una oportunidad está en alerta (lista vacía = sana). */
export function alertas(o: Oportunidad): string[] {
  if (!abierta(o)) return [];
  const a: string[] = [];
  const hoy = hoyISO();
  if (!o.siguienteFecha || !o.siguientePaso.trim()) a.push("Sin siguiente paso agendado");
  else if (o.siguienteFecha < hoy) a.push(`Siguiente paso vencido (${o.siguienteFecha})`);
  const max = etapa(o.etapa).maxDias;
  const d = diasEnEtapa(o);
  if (max > 0 && d > max) a.push(`${d} días en ${etapa(o.etapa).corto} (máx. ${max})`);
  return a;
}

export function semaforo(o: Oportunidad): Semaforo {
  if (!abierta(o)) return "cerrada";
  if (alertas(o).length) return "rojo";
  const max = etapa(o.etapa).maxDias;
  if (max > 0 && diasEnEtapa(o) > max * 0.75) return "amarillo";
  return "verde";
}

/** Requisitos pendientes para salir de la etapa actual. */
export function pendientesSalida(o: Oportunidad): string[] {
  return etapa(o.etapa).salida.filter((s) => !o.checklist[s.id]).map((s) => s.texto);
}

export function bloqueosAvance(o: Oportunidad): string[] {
  const b = pendientesSalida(o);
  if (!o.siguienteFecha || o.siguienteFecha < hoyISO() || !o.siguientePaso.trim()) {
    b.push("Agendar el siguiente paso con fecha futura");
  }
  return b;
}

export const valorPonderado = (o: Oportunidad) => o.valor * etapa(o.etapa).probabilidad;

export const cop = (n: number) =>
  "$" + (n >= 1_000_000 ? `${Math.round(n / 1_000_000).toLocaleString("es-CO")} M` : n.toLocaleString("es-CO"));

export const fechaCorta = (iso: string | null) =>
  iso ? new Date(iso.length === 10 ? iso + "T12:00:00" : iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" }) : "—";

export const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

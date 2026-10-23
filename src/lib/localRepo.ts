// Modo demo: datos de ejemplo guardados en el navegador. Se usa cuando no hay variables de Supabase.
import type { Documento, Evento, NuevaOportunidad, Oportunidad, Repo, TipoEvento, Usuario } from "./types";
import { casoEjemplo } from "../caso/tipos";
import { TARIFA_EJEMPLO, normalizarTarifa, type VersionTarifa } from "../caso/tarifario";
import type { EtapaId } from "../config/etapas";

const KEY = "iterative-comercial-demo-v6";
const SESION = "iterative-comercial-demo-sesion";

interface Estado { usuarios: Usuario[]; oportunidades: Oportunidad[]; eventos: Evento[]; documentos: Documento[]; tarifas: VersionTarifa[] }

const uid = () => Math.random().toString(36).slice(2, 10);
const haceDias = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
const enDias = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString().slice(0, 10);

function semilla(): Estado {
  const usuarios: Usuario[] = [
    { id: "u1", nombre: "Laura Comercial", email: "laura@iterativeco.com", rol: "comercial" },
    { id: "u2", nombre: "Andrés Comercial", email: "andres@iterativeco.com", rol: "comercial" },
    { id: "u3", nombre: "Director Comercial", email: "director@iterativeco.com", rol: "supervisor" },
  ];
  const base = (id: string, empresa: string, etapa: EtapaId, dias: number, owner: string, valor: number, sig: string, fecha: string | null, check: string[] = [], extra: Partial<Oportunidad> = {}): Oportunidad => ({
    id, empresa, ciudad: "Bucaramanga", ciiu: "G4530", erp: "SIESA", contacto: "", valor, opcion: "E2 · Bodega individual",
    etapa, etapaDesde: haceDias(dias), ownerId: owner, siguientePaso: sig, siguienteFecha: fecha,
    checklist: Object.fromEntries(check.map((c) => [c, true])), motivoPerdida: null, caso: null,
    creado: haceDias(dias + 20), actualizado: haceDias(1), ...extra,
  });
  const oportunidades: Oportunidad[] = [
    base("o1", "Autopartes del Oriente S.A.S.", "E4", 9, "u1", 190_000_000, "Reunión de decisión con CFO", enDias(3), ["e4_previo", "e4_vivo"]),
    base("o2", "Ferretería Industrial Andina", "E2", 20, "u1", 180_000_000, "Visita técnica", enDias(-2), ["e2_dolores"], { ciudad: "Bogotá", ciiu: "G4663" }),
    base("o3", "Distribuidora Médica del Norte", "E3", 5, "u2", 650_000_000, "Presentar números al comité", enDias(6), ["e3_base"], { ciudad: "Barranquilla", erp: "SAP B1", ciiu: "G4645" }),
    base("o4", "Repuestos La 33", "E1", 3, "u2", 120_000_000, "", null, [], { ciudad: "Medellín", erp: "World Office" }),
    base("o5", "Textiles Santander", "PIL", 18, "u1", 200_000_000, "Revisión de avance del piloto", enDias(1), ["pil_criterios", "pil_patro"], { opcion: "E1 · Piloto", ciiu: "C1410" }),
    base("o6", "Grupo Logístico Caribe", "E6", 11, "u2", 520_000_000, "Firma de contrato", enDias(4), ["e6_p2", "e6_contrato"], { ciudad: "Cartagena", opcion: "E3 · Proyecto multisede" }),
    base("o7", "Lubricantes y Filtros del Llano", "E0", 2, "u1", 0, "Completar ficha 4 áreas", enDias(2), [], { ciudad: "Villavicencio", opcion: "Por definir" }),
    base("o8", "Moto Repuestos Express", "E7", 3, "u2", 185_000_000, "Inicio de obra", enDias(10), ["e7_os"]),
    base("o9", "Insumos Agro Sur", "X", 30, "u1", 160_000_000, "", null, [], { motivoPerdida: "Presupuesto", ciudad: "Neiva" }),
  ];
  const eventos: Evento[] = oportunidades.map((o) => ({
    id: uid(), oportunidadId: o.id, autorId: o.ownerId, autorNombre: usuarios.find((u) => u.id === o.ownerId)!.nombre,
    tipo: "creacion", detalle: `Oportunidad creada en ${o.etapa}`, creado: o.creado,
  }));
  // Caso completo de ejemplo en la primera oportunidad
  const ej = casoEjemplo();
  oportunidades[0].caso = ej;
  const tarifas: VersionTarifa[] = [{ id: "t1", version: 1, datos: { ...TARIFA_EJEMPLO }, motivo: "Tarifario inicial: matriz Costos Iterative SAS (FLEX)", estado: "aprobada",
    autorId: "u3", autorNombre: "Director Comercial", revisorNombre: "Director Comercial", creado: haceDias(30), revisado: haceDias(30) }];
  return { usuarios, oportunidades, eventos, documentos: [], tarifas };
}

function leer(): Estado {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const e = JSON.parse(raw); e.documentos ??= []; e.tarifas ??= semilla().tarifas; return e; }
  } catch { /* almacenamiento no disponible */ }
  const s = semilla();
  guardar(s);
  return s;
}
function guardar(s: Estado) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* sin almacenamiento: los cambios viven en memoria */ }
}

let memoria: Estado | null = null;
const estado = () => (memoria ??= leer());

export const localRepo: Repo = {
  modo: "demo",
  async sesion() {
    let id: string | null = null;
    try { id = localStorage.getItem(SESION); } catch { /* */ }
    return estado().usuarios.find((u) => u.id === id) ?? null;
  },
  async login(email) {
    const u = estado().usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) throw new Error("Usuario no encontrado en el modo demo.");
    try { localStorage.setItem(SESION, u.id); } catch { /* */ }
    return u;
  },
  async logout() { try { localStorage.removeItem(SESION); } catch { /* */ } },
  async usuarios() { return estado().usuarios; },
  async oportunidades() { return [...estado().oportunidades]; },
  async crear(n: NuevaOportunidad, autor) {
    const ahora = new Date().toISOString();
    const o: Oportunidad = { ...n, id: uid(), etapa: "E0", etapaDesde: ahora, checklist: {}, motivoPerdida: null, caso: null, creado: ahora, actualizado: ahora };
    const s = estado();
    s.oportunidades.push(o);
    s.eventos.push({ id: uid(), oportunidadId: o.id, autorId: autor.id, autorNombre: autor.nombre, tipo: "creacion", detalle: "Oportunidad creada en E0", creado: ahora });
    guardar(s);
    return o;
  },
  async actualizar(id, cambios, autor, evento) {
    const s = estado();
    const i = s.oportunidades.findIndex((o) => o.id === id);
    if (i < 0) throw new Error("Oportunidad no encontrada");
    s.oportunidades[i] = { ...s.oportunidades[i], ...cambios, actualizado: new Date().toISOString() };
    if (evento) s.eventos.push({ id: uid(), oportunidadId: id, autorId: autor.id, autorNombre: autor.nombre, tipo: evento.tipo, detalle: evento.detalle, creado: new Date().toISOString() });
    guardar(s);
    return s.oportunidades[i];
  },
  async eventos(oportunidadId) {
    const e = estado().eventos.filter((x) => !oportunidadId || x.oportunidadId === oportunidadId);
    return [...e].sort((a, b) => b.creado.localeCompare(a.creado));
  },
  async registrar(oportunidadId, autor, tipo: TipoEvento, detalle) {
    const s = estado();
    s.eventos.push({ id: uid(), oportunidadId, autorId: autor.id, autorNombre: autor.nombre, tipo, detalle, creado: new Date().toISOString() });
    guardar(s);
  },
  async documentos(oportunidadId) {
    return estado().documentos.filter((d) => d.oportunidadId === oportunidadId).sort((a, b) => b.creado.localeCompare(a.creado));
  },
  async guardarDocumento(d, autor) {
    const s = estado();
    const doc: Documento = { ...d, id: uid(), autorId: autor.id, autorNombre: autor.nombre, creado: new Date().toISOString() };
    s.documentos.push(doc);
    guardar(s);
    return doc;
  },
  async tarifas() { return estado().tarifas.map((v) => ({ ...v, datos: normalizarTarifa(v.datos) })).sort((a, b) => b.version - a.version); },
  async proponerTarifa(datos, motivo, autor) {
    const s = estado();
    const ahora = new Date().toISOString();
    const sup = autor.rol === "supervisor";
    const v: VersionTarifa = { id: uid(), version: Math.max(0, ...s.tarifas.map((t) => t.version)) + 1, datos, motivo,
      estado: sup ? "aprobada" : "pendiente", autorId: autor.id, autorNombre: autor.nombre,
      revisorNombre: sup ? autor.nombre : null, creado: ahora, revisado: sup ? ahora : null };
    s.tarifas.push(v); guardar(s); return v;
  },
  necesitaClave() { return false; },
  errorEnlace() { return ""; },
  async establecerClave() { /* modo demo: sin contraseñas */ },
  async recuperarClave() { throw new Error("En el modo demo no hay contraseñas."); },
  async revisarTarifa(id, aprobar, revisor) {
    if (revisor.rol !== "supervisor") throw new Error("Solo el supervisor puede aprobar cambios al tarifario.");
    const s = estado();
    const v = s.tarifas.find((t) => t.id === id);
    if (!v || v.estado !== "pendiente") throw new Error("La propuesta ya no está pendiente.");
    v.estado = aprobar ? "aprobada" : "rechazada"; v.revisorNombre = revisor.nombre; v.revisado = new Date().toISOString();
    guardar(s);
  },
};

export function reiniciarDemo() {
  try { localStorage.removeItem(KEY); } catch { /* */ }
  memoria = null;
}

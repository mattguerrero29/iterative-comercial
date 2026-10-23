import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Documento, Evento, NuevaOportunidad, Oportunidad, Repo, TipoEvento, Usuario } from "./types";
import { normalizarCaso } from "../caso/tipos";
import { normalizarTarifa, type VersionTarifa } from "../caso/tarifario";

/* eslint-disable @typescript-eslint/no-explicit-any */
const aOportunidad = (r: any): Oportunidad => ({
  id: r.id, empresa: r.empresa, ciudad: r.ciudad ?? "", ciiu: r.ciiu ?? "", erp: r.erp ?? "", contacto: r.contacto ?? "",
  valor: Number(r.valor ?? 0), opcion: r.opcion ?? "Por definir", etapa: r.etapa, etapaDesde: r.etapa_desde,
  ownerId: r.owner_id, siguientePaso: r.siguiente_paso ?? "", siguienteFecha: r.siguiente_fecha,
  checklist: r.checklist ?? {}, motivoPerdida: r.motivo_perdida, caso: r.caso && r.caso.fin ? normalizarCaso(r.caso) : null,
  creado: r.created_at, actualizado: r.updated_at,
});

const aFila = (o: Partial<Oportunidad>) => {
  const m: Record<string, string> = {
    empresa: "empresa", ciudad: "ciudad", ciiu: "ciiu", erp: "erp", contacto: "contacto", valor: "valor", opcion: "opcion",
    etapa: "etapa", etapaDesde: "etapa_desde", ownerId: "owner_id", siguientePaso: "siguiente_paso",
    siguienteFecha: "siguiente_fecha", checklist: "checklist", motivoPerdida: "motivo_perdida", caso: "caso",
  };
  const f: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(o)) if (m[k]) f[m[k]] = v;
  return f;
};

const aDocumento = (r: any): Documento => ({
  id: r.id, oportunidadId: r.oportunidad_id, tipo: r.tipo, version: r.version, datos: r.datos,
  autorId: r.autor_id, autorNombre: r.perfiles?.nombre ?? "", creado: r.created_at,
});

const aTarifa = (r: any): VersionTarifa => ({
  id: r.id, version: r.version, datos: normalizarTarifa(r.datos), motivo: r.motivo, estado: r.estado,
  autorId: r.autor_id, autorNombre: r.autor?.nombre ?? "", revisorNombre: r.revisor?.nombre ?? null, creado: r.created_at, revisado: r.revisado_at,
});

// Enlaces del correo (invitación o recuperación): Supabase devuelve el tipo y la sesión en el hash de la URL.
const paramsEnlace = new URLSearchParams(typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "");
const TIPO_ENLACE = paramsEnlace.get("type");
const ERROR_ENLACE = paramsEnlace.get("error_description");

export const DOMINIO = "@iterativeco.com";
const correoAutorizado = (email?: string | null) => !!email && email.trim().toLowerCase().endsWith(DOMINIO);

const aUsuario = (r: any): Usuario => ({ id: r.id, nombre: r.nombre, email: r.email, rol: r.rol });

export function crearSupabaseRepo(url: string, key: string): Repo {
  const sb: SupabaseClient = createClient(url, key);

  // Sin perfil o con un correo de otro dominio se cierra la sesión (la base de datos tampoco entrega datos).
  const perfil = async (id: string) => {
    const { data, error } = await sb.from("perfiles").select("*").eq("id", id).single();
    if (error || !data) {
      await sb.auth.signOut();
      throw new Error("Su usuario no está autorizado. Pida al administrador que lo habilite.");
    }
    return aUsuario(data);
  };

  return {
    modo: "supabase",
    async sesion() {
      const { data } = await sb.auth.getSession();
      if (!data.session) return null;
      if (!correoAutorizado(data.session.user.email)) { await sb.auth.signOut(); return null; }
      return perfil(data.session.user.id).catch(() => null);
    },
    async login(email, clave) {
      if (!correoAutorizado(email)) throw new Error(`Solo pueden ingresar correos ${DOMINIO}.`);
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password: clave });
      if (error) throw new Error("Correo o contraseña incorrectos.");
      if (!correoAutorizado(data.user.email)) { await sb.auth.signOut(); throw new Error(`Solo pueden ingresar correos ${DOMINIO}.`); }
      return perfil(data.user.id);
    },
    async logout() { await sb.auth.signOut(); },
    async usuarios() {
      const { data, error } = await sb.from("perfiles").select("*").order("nombre");
      if (error) throw error;
      return (data ?? []).map(aUsuario);
    },
    async oportunidades() {
      const { data, error } = await sb.from("oportunidades").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(aOportunidad);
    },
    async crear(n: NuevaOportunidad, autor) {
      const { data, error } = await sb.from("oportunidades").insert(aFila({ ...n, etapa: "E0", checklist: {} })).select().single();
      if (error) throw error;
      await this.registrar(data.id, autor, "creacion", "Oportunidad creada en E0");
      return aOportunidad(data);
    },
    async actualizar(id, cambios, autor, evento) {
      const { data, error } = await sb.from("oportunidades").update(aFila(cambios)).eq("id", id).select().single();
      if (error) throw error;
      if (evento) await this.registrar(id, autor, evento.tipo, evento.detalle);
      return aOportunidad(data);
    },
    async eventos(oportunidadId) {
      let q = sb.from("eventos").select("*, perfiles(nombre)").order("created_at", { ascending: false }).limit(500);
      if (oportunidadId) q = q.eq("oportunidad_id", oportunidadId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r: any): Evento => ({
        id: r.id, oportunidadId: r.oportunidad_id, autorId: r.autor_id, autorNombre: r.perfiles?.nombre ?? "",
        tipo: r.tipo, detalle: r.detalle, creado: r.created_at,
      }));
    },
    async registrar(oportunidadId, autor, tipo: TipoEvento, detalle) {
      const { error } = await sb.from("eventos").insert({ oportunidad_id: oportunidadId, autor_id: autor.id, tipo, detalle });
      if (error) throw error;
    },
    async documentos(oportunidadId) {
      const { data, error } = await sb.from("documentos").select("*, perfiles(nombre)").eq("oportunidad_id", oportunidadId).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(aDocumento);
    },
    async guardarDocumento(d, autor) {
      const { data, error } = await sb.from("documentos")
        .insert({ oportunidad_id: d.oportunidadId, tipo: d.tipo, version: d.version, datos: d.datos, autor_id: autor.id })
        .select("*, perfiles(nombre)").single();
      if (error) throw error;
      return aDocumento(data);
    },
    async tarifas() {
      const { data, error } = await sb.from("tarifas")
        .select("*, autor:perfiles!tarifas_autor_id_fkey(nombre), revisor:perfiles!tarifas_revisor_id_fkey(nombre)").order("version", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(aTarifa);
    },
    async proponerTarifa(datos, motivo, autor) {
      const { data, error } = await sb.rpc("proponer_tarifa", { p_datos: datos, p_motivo: motivo });
      if (error) throw new Error(error.message);
      return aTarifa({ ...data, autor: { nombre: autor.nombre } });
    },
    necesitaClave() { return (TIPO_ENLACE === "invite" || TIPO_ENLACE === "recovery") && !ERROR_ENLACE; },
    errorEnlace() {
      return ERROR_ENLACE ? "El enlace del correo venció o ya se usó. Pida uno nuevo con «¿Olvidó su contraseña?» o al administrador." : "";
    },
    async establecerClave(clave) {
      const { data } = await sb.auth.getSession();
      if (!data.session) throw new Error("El enlace venció. Pida uno nuevo con «¿Olvidó su contraseña?».");
      if (!correoAutorizado(data.session.user.email)) { await sb.auth.signOut(); throw new Error(`Solo pueden ingresar correos ${DOMINIO}.`); }
      const { error } = await sb.auth.updateUser({ password: clave });
      if (error) throw new Error(error.message.includes("different") ? "La contraseña nueva debe ser distinta de la anterior." : "No se pudo guardar la contraseña. Intente de nuevo.");
    },
    async recuperarClave(email) {
      if (!correoAutorizado(email)) throw new Error(`Solo pueden ingresar correos ${DOMINIO}.`);
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: window.location.origin });
      if (error) throw new Error("No se pudo enviar el correo. Intente en unos minutos.");
    },
    async revisarTarifa(id, aprobar) {
      const { error } = await sb.rpc("revisar_tarifa", { p_id: id, p_aprobar: aprobar });
      if (error) throw new Error(error.message);
    },
  };
}

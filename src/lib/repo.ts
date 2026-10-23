import { localRepo } from "./localRepo";
import { crearSupabaseRepo } from "./supabaseRepo";
import type { Repo } from "./types";

// Acepta también la dirección copiada con /rest/v1/ u otra ruta: se usa solo la base del proyecto
const urlConfig = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const url = urlConfig ? urlConfig.trim().replace(/^(https?:\/\/[^/]+).*$/, "$1") : undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** En producción falta la configuración: la app no arranca en modo demo, muestra el error. */
export const faltaConfiguracion = import.meta.env.PROD && !(url && key);

export const repo: Repo = url && key ? crearSupabaseRepo(url, key) : localRepo;

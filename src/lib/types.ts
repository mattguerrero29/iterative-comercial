import type { EtapaId } from "../config/etapas";
import type { Caso } from "../caso/tipos";
import type { Tarifa, VersionTarifa } from "../caso/tarifario";

export type Rol = "comercial" | "supervisor";

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: Rol;
}

export interface Oportunidad {
  id: string;
  empresa: string;
  ciudad: string;
  ciiu: string;
  erp: string;
  contacto: string;
  valor: number;
  opcion: string;
  etapa: EtapaId;
  etapaDesde: string;
  ownerId: string;
  siguientePaso: string;
  siguienteFecha: string | null;
  checklist: Record<string, boolean>;
  motivoPerdida: string | null;
  caso: Caso | null;
  creado: string;
  actualizado: string;
}

export type TipoEvento = "creacion" | "etapa" | "siguiente_paso" | "checklist" | "nota" | "auditoria" | "perdida" | "edicion" | "documento";

export interface Evento {
  id: string;
  oportunidadId: string;
  autorId: string;
  autorNombre: string;
  tipo: TipoEvento;
  detalle: string;
  creado: string;
}

export type TipoDocumento = "P1" | "P2" | "P3" | "OP" | "A1" | "A2" | "A3" | "A4";

/** Documento generado: guarda la foto de los datos para volver a descargarlo idéntico. */
export interface Documento {
  id: string;
  oportunidadId: string;
  tipo: TipoDocumento;
  version: number;
  datos: { vars: Record<string, string>; sedes: unknown[]; caso?: Caso };
  autorId: string;
  autorNombre: string;
  creado: string;
}

export type NuevaOportunidad = Pick<Oportunidad, "empresa" | "ciudad" | "ciiu" | "erp" | "contacto" | "valor" | "opcion" | "ownerId" | "siguientePaso" | "siguienteFecha">;

export interface Repo {
  modo: "demo" | "supabase";
  sesion(): Promise<Usuario | null>;
  login(email: string, clave: string): Promise<Usuario>;
  logout(): Promise<void>;
  usuarios(): Promise<Usuario[]>;
  oportunidades(): Promise<Oportunidad[]>;
  crear(o: NuevaOportunidad, autor: Usuario): Promise<Oportunidad>;
  actualizar(id: string, cambios: Partial<Oportunidad>, autor: Usuario, evento?: { tipo: TipoEvento; detalle: string }): Promise<Oportunidad>;
  eventos(oportunidadId?: string): Promise<Evento[]>;
  registrar(oportunidadId: string, autor: Usuario, tipo: TipoEvento, detalle: string): Promise<void>;
  documentos(oportunidadId: string): Promise<Documento[]>;
  guardarDocumento(d: Omit<Documento, "id" | "creado" | "autorId" | "autorNombre">, autor: Usuario): Promise<Documento>;
  tarifas(): Promise<VersionTarifa[]>;
  /** Supervisor: crea una versión aprobada. Comercial: crea una propuesta pendiente de aprobación. */
  proponerTarifa(datos: Tarifa, motivo: string, autor: Usuario): Promise<VersionTarifa>;
  revisarTarifa(id: string, aprobar: boolean, revisor: Usuario): Promise<void>;
  /** El usuario llegó desde un enlace de invitación o de recuperación y debe crear su contraseña. */
  necesitaClave(): boolean;
  /** Error que trae un enlace vencido o inválido (vacío si no hay). */
  errorEnlace(): string;
  establecerClave(clave: string): Promise<void>;
  recuperarClave(email: string): Promise<void>;
}

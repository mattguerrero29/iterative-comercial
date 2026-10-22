// Etapas del pipeline según el Playbook Comercial (sección 6.1).
// "salida": lo que debe estar cumplido para avanzar a la siguiente etapa.

export type EtapaId = "E0" | "E1" | "E2" | "E3" | "E4" | "E5" | "E6" | "E7" | "PIL" | "X";

export interface Etapa {
  id: EtapaId;
  nombre: string;
  corto: string;
  maxDias: number;
  probabilidad: number;
  salida: { id: string; texto: string }[];
  siguiente: EtapaId | null;
}

export const ETAPAS: Etapa[] = [
  {
    id: "E0", nombre: "Objetivo identificado", corto: "Objetivo", maxDias: 10, probabilidad: 0.02, siguiente: "E1",
    salida: [
      { id: "e0_datos", texto: "Empresa, CIIU, ciudad y fuente registrados" },
      { id: "e0_ficha", texto: "Ficha Pre-Exploración de las 4 áreas completa" },
    ],
  },
  {
    id: "E1", nombre: "Pre-exploración lista", corto: "Pre-exploración", maxDias: 14, probabilidad: 0.05, siguiente: "E2",
    salida: [
      { id: "e1_cmd", texto: "CMD y días que pagan el proyecto calculados" },
      { id: "e1_dolor", texto: "Tres hipótesis de dolor escritas" },
      { id: "e1_comite", texto: "Mapa del comité (CEO, CFO, Champion, TI)" },
      { id: "e1_reunion", texto: "Reunión 1 agendada y agenda enviada 48 h antes" },
    ],
  },
  {
    id: "E2", nombre: "Descubrimiento", corto: "Descubrimiento", maxDias: 14, probabilidad: 0.15, siguiente: "E3",
    salida: [
      { id: "e2_dolores", texto: "Dolores confirmados con cifra del cliente" },
      { id: "e2_champion", texto: "Champion identificado y su preocupación anotada" },
      { id: "e2_matriz", texto: "Matriz Excel con 80 % o más de celdas completas" },
      { id: "e2_visita", texto: "Visita técnica agendada en calendario" },
    ],
  },
  {
    id: "E3", nombre: "Visita técnica / Diagnóstico", corto: "Visita técnica", maxDias: 14, probabilidad: 0.30, siguiente: "E4",
    salida: [
      { id: "e3_base", texto: "Línea base medida (días de inventario y exactitud)" },
      { id: "e3_dim", texto: "Dimensionamiento por sede en la matriz" },
      { id: "e3_escalon", texto: "Escalón de entrada recomendado definido" },
      { id: "e3_reunion", texto: "Reunión de decisión agendada con el comité" },
    ],
  },
  {
    id: "E4", nombre: "Propuesta presentada", corto: "Propuesta", maxDias: 21, probabilidad: 0.45, siguiente: "E5",
    salida: [
      { id: "e4_previo", texto: "Correo pre-presentación enviado 24–48 h antes" },
      { id: "e4_vivo", texto: "Deck P1 presentado en vivo (nunca en frío)" },
      { id: "e4_resumen", texto: "Resumen post-reunión enviado en menos de 4 h" },
      { id: "e4_opcion", texto: "El cliente eligió una opción" },
    ],
  },
  {
    id: "E5", nombre: "Validación técnica", corto: "Validación TI", maxDias: 14, probabilidad: 0.60, siguiente: "E6",
    salida: [
      { id: "e5_p3", texto: "Anexo P3 revisado por TI del cliente" },
      { id: "e5_sesion", texto: "Sesión técnica de integración realizada" },
      { id: "e5_ok", texto: "Visto bueno técnico recibido" },
    ],
  },
  {
    id: "E6", nombre: "Negociación / Contrato", corto: "Negociación", maxDias: 21, probabilidad: 0.80, siguiente: "E7",
    salida: [
      { id: "e6_p2", texto: "Anexo P2 revisado con el CFO" },
      { id: "e6_contrato", texto: "Borrador de contrato enviado a jurídica" },
      { id: "e6_aprob", texto: "Aprobadores y fecha de firma confirmados" },
      { id: "e6_firma", texto: "Contrato firmado y 50 % pagado" },
    ],
  },
  {
    id: "E7", nombre: "Orden de servicio / Ganada", corto: "Ganada", maxDias: 7, probabilidad: 1, siguiente: null,
    salida: [
      { id: "e7_os", texto: "Orden de servicio emitida" },
      { id: "e7_obra", texto: "Fecha de inicio de obra definida" },
      { id: "e7_impl", texto: "Entrega a implementación realizada" },
    ],
  },
  {
    id: "PIL", nombre: "Piloto en curso", corto: "Piloto", maxDias: 35, probabilidad: 0.50, siguiente: "E6",
    salida: [
      { id: "pil_criterios", texto: "Criterios de éxito escritos antes de instalar" },
      { id: "pil_patro", texto: "CFO o Gerente firmó la orden del piloto" },
      { id: "pil_reunion", texto: "Reunión de resultados agendada (día 30–35)" },
      { id: "pil_informe", texto: "Informe de conciliación entregado" },
    ],
  },
  { id: "X", nombre: "Perdida", corto: "Perdida", maxDias: 0, probabilidad: 0, siguiente: null, salida: [] },
];

export const FLUJO_PRINCIPAL: EtapaId[] = ["E0", "E1", "E2", "E3", "E4", "E5", "E6", "E7"];
export const ABIERTAS: EtapaId[] = ["E0", "E1", "E2", "E3", "E4", "E5", "E6", "PIL"];

export const MOTIVOS_PERDIDA = [
  "Presupuesto", "Sin decisión (secuencia agotada)", "Competidor", "Prioridad interna",
  "Fit técnico", "Sin patrocinador", "Precio vs. alcance",
];

export const OPCIONES = ["Por definir", "E0 · Diagnóstico", "E1 · Piloto", "E2 · Bodega individual", "E3 · Proyecto multisede"];

export const etapa = (id: EtapaId): Etapa => ETAPAS.find((e) => e.id === id)!;

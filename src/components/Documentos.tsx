import { useCallback, useEffect, useState } from "react";
import { repo } from "../lib/repo";
import { fechaHora } from "../lib/reglas";
import type { Documento, Oportunidad, TipoDocumento, Usuario } from "../lib/types";
import { calcular, type Calculo } from "../caso/calculo";
import type { Caso } from "../caso/tipos";
import { nombreArchivo } from "../docs/base";

interface Pieza { tipo: TipoDocumento; nombre: string; sufijo: string; para: string; cuando: string; requiere: string[]; ext?: string; activo?: boolean; precios?: boolean }

const PIEZAS: Pieza[] = [
  { tipo: "OP", nombre: "One-pagers por interlocutor", sufijo: "OnePagers", para: "CEO, Gerente financiero, Champion y TI (una página cada uno)", cuando: "Desde E2 · Descubrimiento",
    requiere: ["[NOMBRE_COMERCIAL]", "[CITA_LITERAL_CHAMPION]", "[FECHA_REUNION_DECISION]", "[FECHA_PROPUESTA]", "[NOMBRE_INGENIERO]"] },
  { tipo: "P1", nombre: "P1 · Deck Ejecutivo de Valor y Retorno", sufijo: "P1_Deck", para: "Todo el comité, presentado en vivo", cuando: "E4 · nunca se envía en frío",
    requiere: ["[DOLOR_1_TITULO]", "[DOLOR_1_CIFRA]", "[DOLOR_2_TITULO]", "[DOLOR_2_CIFRA]", "[DOLOR_3_TITULO]", "[DOLOR_3_CIFRA]", "[FECHA_PROPUESTA]", "[NOMBRE_CHAMPION]", "[NOMBRE_TI]", "[NOMBRE_COMERCIAL]", "[CELULAR]", "[EMAIL]"] },
  { tipo: "P2", nombre: "P2 · Anexo Económico y Condiciones", sufijo: "P2_Economico", para: "CEO y Gerente financiero", cuando: "Después de presentar P1 · E4–E6",
    requiere: ["[NOMBRE_CHAMPION]", "[FECHA_TRM]", "[NOMBRE_COMERCIAL]", "[CELULAR]", "[EMAIL]"] },
  { tipo: "P3", nombre: "P3 · Anexo de Ingeniería y Obra Civil", sufijo: "P3_Tecnico", para: "Operaciones y TI", cuando: "E5 · Validación técnica",
    requiere: ["[NOMBRE_TI]", "[NOMBRE_INGENIERO]"] },
  { tipo: "A1", nombre: "A1 · Calculadora de Caja Inmovilizada", sufijo: "A1_Calculadora", ext: "xlsx", activo: true,
    para: "CFO y Champion: Excel con fórmulas para ajustar sus supuestos", cuando: "Semana 1 del seguimiento · correo S1", requiere: ["[NOMBRE_COMERCIAL]", "[CELULAR]"] },
  { tipo: "A2", nombre: "A2 · Caso de éxito y guion de video", sufijo: "A2_Caso", activo: true,
    para: "Champion y equipo de bodega", cuando: "Semana 2 · correo S2", requiere: ["[CASO_CLIENTE]", "[CASO_RETO]", "[CASO_M1_VALOR]", "[CASO_CITA]", "[CASO_AUTORIZACION]"] },
  { tipo: "A3", nombre: "A3 · Guía de conciliación ante revisoría fiscal", sufijo: "A3_Guia_Conciliacion", activo: true,
    para: "CFO y contador", cuando: "Semana 3 · correo S3", requiere: ["[NOMBRE_COMERCIAL]"] },
  { tipo: "A4", nombre: "A4 · Comparativo de entrada", sufijo: "A4_Comparativo", activo: true, precios: true,
    para: "CEO y Champion, para llevar a junta", cuando: "Semana 4 · correo S4", requiere: ["[ZONA_PILOTO]"] },
];
PIEZAS.filter((p) => p.tipo === "P1" || p.tipo === "P2").forEach((p) => (p.precios = true));

async function generar(tipo: TipoDocumento, vars: Record<string, string>, sedes: unknown[], fileName: string, caso?: Caso) {
  if (tipo === "A1" && caso) return (await import("../docs/calculadora")).generarA1(caso, calcular(caso), vars["[EMPRESA]"], fileName);
  if (tipo === "A2") return (await import("../docs/activos")).generarA2(vars, fileName);
  if (tipo === "A3") return (await import("../docs/activos")).generarA3(vars, fileName);
  if (tipo === "A4") return (await import("../docs/activos")).generarA4(vars, fileName);
  if (tipo === "P1") return (await import("../docs/p1")).generarP1(vars, fileName);
  if (tipo === "P2") return (await import("../docs/anexos")).generarP2(vars, fileName);
  if (tipo === "P3") return (await import("../docs/anexos")).generarP3(vars, sedes, fileName);
  return (await import("../docs/onepagers")).generarOnePagers(vars, fileName);
}

interface Props { usuario: Usuario; op: Oportunidad; vars: Record<string, string>; k: Calculo; caso: Caso; sinGuardar: boolean; puedeEditar: boolean; bloqueoPrecios: string; onCambio: () => Promise<void> }

const p_ext = (t: TipoDocumento) => PIEZAS.find((p) => p.tipo === t)?.ext ?? "pptx";

export default function Documentos({ usuario, op, vars, k, caso, sinGuardar, puedeEditar, bloqueoPrecios, onCambio }: Props) {
  const [docs, setDocs] = useState<Documento[]>([]);
  const [ocupado, setOcupado] = useState("");
  const [error, setError] = useState("");
  const cargar = useCallback(() => repo.documentos(op.id).then(setDocs), [op.id]);
  useEffect(() => { cargar(); }, [cargar]);

  const crear = async (p: Pieza) => {
    setOcupado(p.tipo); setError("");
    try {
      const version = docs.filter((d) => d.tipo === p.tipo).reduce((m, d) => Math.max(m, d.version), 0) + 1;
      const datos = { vars, sedes: k.sedes, caso };
      await generar(p.tipo, vars, k.sedes, nombreArchivo(op.empresa, p.sufijo, version, p.ext), caso);
      await repo.guardarDocumento({ oportunidadId: op.id, tipo: p.tipo, version, datos }, usuario);
      await repo.registrar(op.id, usuario, "documento", `${p.nombre} v${version} generado`);
      await cargar(); await onCambio();
    } catch (e) { setError((e as Error).message); }
    finally { setOcupado(""); }
  };

  const descargar = async (d: Documento) => {
    const p = PIEZAS.find((x) => x.tipo === d.tipo)!;
    setOcupado(d.id);
    try { await generar(d.tipo, d.datos.vars, d.datos.sedes, nombreArchivo(op.empresa, p.sufijo, d.version, p.ext), d.datos.caso); }
    finally { setOcupado(""); }
  };

  return (
    <>
      {sinGuardar && <div className="bloqueos" style={{ marginTop: 0, marginBottom: 16 }}>Hay cambios sin guardar en el caso. Guárdelos antes de generar para que la versión quede registrada con esos datos.</div>}
      {error && <p className="error">{error}</p>}
      {[["Propuesta modular y one-pagers", false], ["Activos de nutrición (seguimiento semanal)", true]].map(([titulo, act]) => (
      <div key={String(titulo)}>
      <h2 style={{ margin: "4px 0 12px" }}>{titulo}</h2>
      <div className="piezas">
        {PIEZAS.filter((p) => !!p.activo === act).map((p) => {
          const falta = p.requiere.filter((t) => !vars[t]);
          const ult = docs.find((d) => d.tipo === p.tipo);
          return (
            <section key={p.tipo} className="tarjeta pieza">
              <div className="etiqueta">{p.cuando}</div>
              <h2>{p.nombre}</h2>
              <p className="sub" style={{ margin: "6px 0 10px" }}>Para: {p.para}</p>
              {falta.length > 0 && <p className="aviso">Campos vacíos (saldrán entre corchetes): {falta.map((t) => t.slice(1, -1)).join(", ")}</p>}
              {p.precios && bloqueoPrecios && <p className="bloqueos" style={{ marginTop: 0 }}>{bloqueoPrecios}</p>}
              <div className="fila">
                <button className="btn primario" disabled={!puedeEditar || !!ocupado || sinGuardar || (!!p.precios && !!bloqueoPrecios)} onClick={() => crear(p)}>
                  {ocupado === p.tipo ? "Generando…" : ult ? `Generar v${ult.version + 1}` : "Generar v1"}
                </button>
                {ult && <span className="sub">Última: v{ult.version} · {fechaHora(ult.creado)}</span>}
              </div>
            </section>
          );
        })}
      </div>
      </div>
      ))}

      <section className="tarjeta">
        <h2>Historial de documentos del caso</h2>
        <p className="sub" style={{ margin: "4px 0 10px" }}>Cada versión guarda los datos con los que se generó: al descargarla sale idéntica, aunque el caso haya cambiado después.</p>
        <div className="envoltura-tabla">
          <table className="tabla">
            <thead><tr><th>Documento</th><th>Versión</th><th>Generado por</th><th>Fecha</th><th></th></tr></thead>
            <tbody>
              {docs.map((d) => (
                <tr key={d.id}>
                  <td>{PIEZAS.find((p) => p.tipo === d.tipo)?.nombre}</td>
                  <td>v{d.version}</td><td>{d.autorNombre}</td><td>{fechaHora(d.creado)}</td>
                  <td><button className="btn chico" disabled={!!ocupado} onClick={() => descargar(d)}>{ocupado === d.id ? "…" : `Descargar .${p_ext(d.tipo)}`}</button></td>
                </tr>
              ))}
              {!docs.length && <tr><td colSpan={5}>Todavía no se ha generado ningún documento.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="sub" style={{ marginTop: 10 }}>Para enviar en PDF: abra el .pptx y use Archivo → Exportar → PDF. La calculadora (A1) se envía en Excel para que el cliente cambie sus supuestos.</p>
      </section>
    </>
  );
}

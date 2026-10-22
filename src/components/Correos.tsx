import { useMemo, useState } from "react";
import { PLANTILLAS } from "../docs/correos";
import { faltantes, llenar } from "../caso/calculo";

export default function Correos({ vars }: { vars: Record<string, string> }) {
  const [id, setId] = useState(PLANTILLAS[1].id);
  const p = PLANTILLAS.find((x) => x.id === id)!;
  const inicial = useMemo(() => ({ asunto: p.asunto ? llenar(p.asunto, vars) : "", cuerpo: llenar(p.cuerpo, vars) }), [p, vars]);
  const [editado, setEditado] = useState<{ id: string; asunto: string; cuerpo: string } | null>(null);
  const actual = editado?.id === id ? editado : { id, ...inicial };
  const falta = faltantes([actual.asunto, actual.cuerpo], {});
  const [copiado, setCopiado] = useState("");

  const copiar = async (t: string, que: string) => {
    try { await navigator.clipboard.writeText(t); setCopiado(que); setTimeout(() => setCopiado(""), 1800); } catch { setCopiado("error"); }
  };
  const grupos = [...new Set(PLANTILLAS.map((x) => x.grupo))];

  return (
    <div className="correos">
      <nav className="tarjeta lista-plantillas">
        {grupos.map((g) => (
          <div key={g}>
            <div className="etiqueta" style={{ marginTop: 8 }}>{g}</div>
            {PLANTILLAS.filter((x) => x.grupo === g).map((x) => (
              <button key={x.id} className={"plantilla" + (x.id === id ? " activa" : "")} onClick={() => setId(x.id)}>
                <span className={"canal " + x.canal.toLowerCase()}>{x.canal}</span> {x.nombre}
              </button>
            ))}
          </div>
        ))}
      </nav>
      <section className="tarjeta">
        <h2>{p.nombre}</h2>
        <p className="sub" style={{ margin: "4px 0 12px" }}>{p.canal} · {p.cuando}</p>
        {falta.length > 0 && <p className="aviso">Complete antes de enviar: {falta.join(" ")}</p>}
        {p.asunto !== undefined && (
          <label className="campo" style={{ marginBottom: 10 }}>Asunto
            <input value={actual.asunto} onChange={(e) => setEditado({ ...actual, asunto: e.target.value })} />
          </label>
        )}
        <label className="campo">Mensaje
          <textarea rows={16} value={actual.cuerpo} onChange={(e) => setEditado({ ...actual, cuerpo: e.target.value })} />
        </label>
        <div className="fila" style={{ marginTop: 12 }}>
          {p.asunto !== undefined && <button className="btn" onClick={() => copiar(actual.asunto, "asunto")}>{copiado === "asunto" ? "Asunto copiado ✓" : "Copiar asunto"}</button>}
          <button className="btn primario" onClick={() => copiar(actual.cuerpo, "cuerpo")}>{copiado === "cuerpo" ? "Mensaje copiado ✓" : "Copiar mensaje"}</button>
          {editado?.id === id && <button className="btn chico" onClick={() => setEditado(null)}>Restaurar plantilla</button>}
        </div>
        <p className="sub" style={{ marginTop: 10 }}>Una respuesta del cliente por cualquier canal detiene la secuencia. Registre el envío como nota en Seguimiento.</p>
      </section>
    </div>
  );
}

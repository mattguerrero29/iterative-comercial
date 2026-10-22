import { CAMPOS_PROPUESTA, type Caso } from "../caso/tipos";
import { OPCIONES } from "../config/etapas";
import { Txt } from "./Campos";

export default function CasoPropuesta({ caso, set, editable }: { caso: Caso; set: (c: Caso) => void; editable: boolean }) {
  const up = (k: string) => (v: string) => set({ ...caso, prop: { ...caso.prop, [k]: v } });
  return (
    <>
      {CAMPOS_PROPUESTA.map((g) => (
        <section key={g.grupo} className="tarjeta">
          <h2 style={{ marginBottom: 12 }}>{g.grupo}</h2>
          <div className="rejilla">
            {g.campos.map(([k, label, tipo]) =>
              tipo === "opcion" || tipo === "plan" ? (
                <label key={k} className="campo">{label}
                  <select disabled={!editable} value={caso.prop[k] ?? ""} onChange={(e) => up(k)(e.target.value)}>
                    {(tipo === "opcion" ? OPCIONES.filter((o) => o !== "Por definir") : ["Compartido", "Completo"]).map((o) => <option key={o}>{o}</option>)}
                  </select>
                </label>
              ) : (
                <Txt key={k} label={label} largo={tipo === "largo"} value={caso.prop[k] ?? ""} onChange={up(k)} disabled={!editable} />
              ),
            )}
          </div>
        </section>
      ))}
    </>
  );
}

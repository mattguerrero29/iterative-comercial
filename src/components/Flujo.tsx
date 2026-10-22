import { FLUJO_PRINCIPAL, etapa, type EtapaId } from "../config/etapas";
import { diasEnEtapa, semaforo } from "../lib/reglas";
import type { Evento, Oportunidad } from "../lib/types";

/** Etapa en la que estaba la oportunidad cuando se perdió (según la bitácora). */
function etapaPerdida(eventos: Evento[]): EtapaId | null {
  const e = eventos.find((x) => x.tipo === "perdida");
  const m = e?.detalle.match(/en (E\d|PIL)/);
  return (m?.[1] as EtapaId) ?? null;
}

export default function Flujo({ op, eventos }: { op: Oportunidad; eventos: Evento[] }) {
  let ref: EtapaId = op.etapa;
  if (op.etapa === "X") ref = etapaPerdida(eventos) ?? "E0";
  const enPiloto = ref === "PIL";
  const actual = enPiloto ? FLUJO_PRINCIPAL.indexOf("E3") + 1 : FLUJO_PRINCIPAL.indexOf(ref);
  const rojo = semaforo(op) === "rojo";

  return (
    <div>
      <div className="flujo" role="list" aria-label="Etapas del pipeline">
        {FLUJO_PRINCIPAL.map((id, i) => {
          const estado = op.etapa === "E7" || i < actual ? "hecho" : i === actual && !enPiloto && op.etapa !== "X" ? "actual" : "";
          return (
            <div key={id} role="listitem" className={`nodo ${estado} ${estado === "actual" && rojo ? "rojo" : ""}`}>
              <div className="circ">{estado === "hecho" ? "✓" : id}</div>
              <div>
                <div className="txt">{etapa(id).nombre}</div>
                {estado === "actual" && <div className="dias">{diasEnEtapa(op)} de {etapa(id).maxDias} días</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rama">
        <span className={"chip" + (enPiloto && op.etapa !== "X" ? " activo" : "")}>
          Ruta alterna: Piloto pago de 1 mes (desde E3/E4 → Negociación){enPiloto && op.etapa !== "X" ? ` · ${diasEnEtapa(op)} de 35 días` : ""}
        </span>
        {op.etapa === "X" && <span className="chip perdida">Perdida{op.motivoPerdida ? `: ${op.motivoPerdida}` : ""}</span>}
      </div>
    </div>
  );
}

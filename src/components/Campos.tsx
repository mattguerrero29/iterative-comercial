import { useEffect, useState } from "react";

type Formato = "cop" | "pct" | "num" | "dec" | "usd" | "mult";

/** Campo numérico. "pct" se guarda como fracción (0,3) y se muestra como porcentaje (30). */
export function Num({ label, value, onChange, f = "num", nota, disabled }: {
  label: string; value: number | null; onChange: (v: number) => void; f?: Formato; nota?: string; disabled?: boolean;
}) {
  const aTexto = (v: number | null) => (v === null || v === undefined ? "" : String(f === "pct" ? +(v * 100).toFixed(4) : v));
  const [txt, setTxt] = useState(aTexto(value));
  useEffect(() => { setTxt(aTexto(value)); }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  const sufijo = f === "pct" ? "%" : f === "cop" ? "COP" : f === "usd" ? "USD" : f === "mult" ? "×" : "";
  return (
    <label className="campo">
      <span>{label}{sufijo && <small className="unidad"> {sufijo}</small>}</span>
      <input inputMode="decimal" value={txt} disabled={disabled}
        onChange={(e) => {
          setTxt(e.target.value);
          const n = Number(e.target.value.replace(/\s/g, "").replace(",", "."));
          if (e.target.value.trim() === "") onChange(0);
          else if (Number.isFinite(n)) onChange(f === "pct" ? n / 100 : n);
        }} />
      {f === "cop" && value ? <small className="ayuda">{"$" + Math.round(value).toLocaleString("es-CO")}</small> : null}
      {nota && <small className="ayuda">{nota}</small>}
    </label>
  );
}

export function Txt({ label, value, onChange, largo, disabled }: { label: string; value: string; onChange: (v: string) => void; largo?: boolean; disabled?: boolean }) {
  return (
    <label className="campo">
      {label}
      {largo
        ? <textarea rows={2} value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
        : <input value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}

export function Resultado({ label, valor, nota, malo, bueno }: { label: string; valor: string; nota?: string; malo?: boolean; bueno?: boolean }) {
  return (
    <div className={"resultado" + (malo ? " malo" : bueno ? " bueno" : "")}>
      <span>{label}</span>
      <b>{valor}</b>
      {nota && <small>{nota}</small>}
    </div>
  );
}

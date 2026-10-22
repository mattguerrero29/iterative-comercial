import { useState } from "react";
import { OPCIONES } from "../config/etapas";
import { repo } from "../lib/repo";
import { hoyISO } from "../lib/reglas";
import type { Oportunidad, Usuario } from "../lib/types";

export default function Nueva({ usuario, usuarios, onCreada }: { usuario: Usuario; usuarios: Usuario[]; onCreada: (o: Oportunidad) => void }) {
  const esSup = usuario.rol === "supervisor";
  const [f, setF] = useState({
    empresa: "", ciudad: "", ciiu: "", erp: "", contacto: "", valor: 0, opcion: "Por definir",
    ownerId: usuario.id, siguientePaso: "Completar Ficha Pre-Exploración (4 áreas)", siguienteFecha: "",
  });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF({ ...f, [k]: k === "valor" ? Number(e.target.value) : e.target.value });

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    try { onCreada(await repo.crear({ ...f, siguienteFecha: f.siguienteFecha || null }, usuario)); }
    catch (err) { setError((err as Error).message); }
  };

  return (
    <form className="tarjeta" onSubmit={crear} style={{ maxWidth: 820 }}>
      <div className="etiqueta">E0 · Objetivo identificado</div>
      <h1 style={{ marginBottom: 18 }}>Nueva oportunidad</h1>
      <div className="rejilla">
        <label className="campo">Empresa *<input required value={f.empresa} onChange={set("empresa")} /></label>
        <label className="campo">Ciudad<input value={f.ciudad} onChange={set("ciudad")} /></label>
        <label className="campo">CIIU<input value={f.ciiu} onChange={set("ciiu")} placeholder="Ej. G4530" /></label>
        <label className="campo">ERP<input value={f.erp} onChange={set("erp")} placeholder="SIESA, SAP B1…" /></label>
        <label className="campo">Contacto de entrada<input value={f.contacto} onChange={set("contacto")} /></label>
        <label className="campo">Valor estimado (COP)<input type="number" min={0} step={1000000} value={f.valor} onChange={set("valor")} /></label>
        <label className="campo">Opción tentativa<select value={f.opcion} onChange={set("opcion")}>{OPCIONES.map((o) => <option key={o}>{o}</option>)}</select></label>
        {esSup && (
          <label className="campo">Comercial responsable
            <select value={f.ownerId} onChange={set("ownerId")}>{usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}</select>
          </label>
        )}
      </div>
      <h2 style={{ margin: "22px 0 10px" }}>Siguiente paso</h2>
      <div className="rejilla">
        <label className="campo">Qué se hará *<input required value={f.siguientePaso} onChange={set("siguientePaso")} /></label>
        <label className="campo">Fecha *<input required type="date" min={hoyISO()} value={f.siguienteFecha} onChange={set("siguienteFecha")} /></label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="fila" style={{ marginTop: 20 }}>
        <button className="btn primario" type="submit">Crear oportunidad</button>
        <a className="btn" href="#/">Cancelar</a>
      </div>
    </form>
  );
}

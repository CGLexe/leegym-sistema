"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { negocio, PENDIENTE } from "@/lib/negocio";

type Campos = {
  nombre: string;
  telefono: string;
  servicio: string;
  dia: string;
};

const CAMPOS_INICIALES: Campos = {
  nombre: "",
  telefono: "",
  servicio: "",
  dia: "",
};

export default function AgendarCita() {
  const [campos, setCampos] = useState<Campos>(CAMPOS_INICIALES);

  const sinWhatsApp = negocio.whatsapp === PENDIENTE;

  function actualizar(campo: keyof Campos, valor: string) {
    setCampos((previo) => ({ ...previo, [campo]: valor }));
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault();

    // Sin número configurado no hay a dónde mandar la cita.
    if (sinWhatsApp) return;

    const mensaje = [
      `Hola ${negocio.nombre}, quiero agendar una cita.`,
      ``,
      `Nombre: ${campos.nombre}`,
      `Teléfono: ${campos.telefono}`,
      campos.servicio && `Me interesa: ${campos.servicio}`,
      campos.dia && `Día que prefiero: ${campos.dia}`,
    ]
      .filter(Boolean)
      .join("\n");

    window.open(
      `https://wa.me/${negocio.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(mensaje)}`,
      "_blank",
    );
  }

  const clasesInput =
    "w-full rounded-md border border-lee-border bg-lee-dark px-4 py-3 text-lee-white " +
    "placeholder:text-lee-muted focus:border-lee-gold focus:outline-none";

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div>
        <label htmlFor="nombre" className="mb-1 block text-sm text-lee-muted">
          Tu nombre
        </label>
        <input
          id="nombre"
          name="nombre"
          required
          value={campos.nombre}
          onChange={(e) => actualizar("nombre", e.target.value)}
          placeholder="Nombre completo"
          className={clasesInput}
        />
      </div>

      <div>
        <label htmlFor="telefono" className="mb-1 block text-sm text-lee-muted">
          Tu teléfono
        </label>
        <input
          id="telefono"
          name="telefono"
          type="tel"
          required
          value={campos.telefono}
          onChange={(e) => actualizar("telefono", e.target.value)}
          placeholder="55 1234 5678"
          className={clasesInput}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="servicio" className="mb-1 block text-sm text-lee-muted">
            Qué te interesa
          </label>
          <select
            id="servicio"
            name="servicio"
            value={campos.servicio}
            onChange={(e) => actualizar("servicio", e.target.value)}
            className={clasesInput}
          >
            <option value="">Elige una opción</option>
            {negocio.servicios.map((s) => (
              <option key={s.nombre} value={s.nombre}>
                {s.nombre === PENDIENTE ? "[FALTA LLENAR]" : s.nombre}
              </option>
            ))}
            <option value="Informes">Mejor quiero informes</option>
          </select>
        </div>

        <div>
          <label htmlFor="dia" className="mb-1 block text-sm text-lee-muted">
            Día que prefieres
          </label>
          <input
            id="dia"
            name="dia"
            value={campos.dia}
            onChange={(e) => actualizar("dia", e.target.value)}
            placeholder="Ej: lunes por la mañana"
            className={clasesInput}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={sinWhatsApp}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-lee-gold px-6 py-4 font-display text-lg uppercase tracking-wide text-lee-black transition-colors hover:bg-lee-gold-light disabled:cursor-not-allowed disabled:bg-lee-card disabled:text-lee-muted"
      >
        <Send className="h-5 w-5" aria-hidden />
        {sinWhatsApp ? "Falta el WhatsApp del gym" : "Agendar mi cita"}
      </button>

      {sinWhatsApp && (
        <p className="text-center text-sm text-lee-muted">
          Agrega el número en <code className="text-lee-gold">src/lib/negocio.ts</code>{" "}
          para activar este botón.
        </p>
      )}
    </form>
  );
}

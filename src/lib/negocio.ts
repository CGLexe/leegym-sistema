// ============================================================================
// LEE GYM — Datos del negocio
// ----------------------------------------------------------------------------
// ESTE ES EL ÚNICO ARCHIVO QUE TIENES QUE EDITAR.
//
// Todo lo que aparece en la landing sale de aquí. Si algo está marcado como
// PENDIENTE, la página lo muestra con corchetes para que se note que falta.
//
// Para la cita por WhatsApp: el número va SIN +, sin espacios. Ej: 529512345678
// ============================================================================

export const PENDIENTE = "PENDIENTE";

export const negocio = {
  nombre: "LEE GYM",
  // ---------------------------------------------------------------- contacto
  whatsapp: PENDIENTE,
  telefono: PENDIENTE,
  email: PENDIENTE,
  instagram: PENDIENTE,
  facebook: PENDIENTE,

  // ------------------------------------------------------------------ lugar
  direccion: PENDIENTE,
  colonia: PENDIENTE,
  ciudad: PENDIENTE,
  // Coordenadas o link de Google Maps para el botón de cómo llegar.
  mapaUrl: PENDIENTE,

  // ---------------------------------------------------------------- horarios
  // "Lun a Vie · 6:00 a 22:00" — pon el texto como se escribe en el letrero.
  horario: PENDIENTE,

  // ------------------------------------------------------------------- hero
  claim: PENDIENTE,
  subheadline: PENDIENTE,

  // --------------------------------------------------------------- servicios
  servicios: [
    {
      nombre: PENDIENTE,
      descripcion: PENDIENTE,
      precio: PENDIENTE,
    },
    {
      nombre: PENDIENTE,
      descripcion: PENDIENTE,
      precio: PENDIENTE,
    },
    {
      nombre: PENDIENTE,
      descripcion: PENDIENTE,
      precio: PENDIENTE,
    },
    {
      nombre: PENDIENTE,
      descripcion: PENDIENTE,
      precio: PENDIENTE,
    },
  ],

  // --------------------------------------------------------------- productos
  productos: [
    {
      nombre: PENDIENTE,
      descripcion: PENDIENTE,
      precio: PENDIENTE,
    },
    {
      nombre: PENDIENTE,
      descripcion: PENDIENTE,
      precio: PENDIENTE,
    },
    {
      nombre: PENDIENTE,
      descripcion: PENDIENTE,
      precio: PENDIENTE,
    },
    {
      nombre: PENDIENTE,
      descripcion: PENDIENTE,
      precio: PENDIENTE,
    },
  ],
};

/** Link de WhatsApp con un mensaje ya escrito. */
export function linkWhatsApp(mensaje: string): string {
  const numero = negocio.whatsapp.replace(/\D/g, "");
  if (numero === PENDIENTE) return "#cita";
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

export function linkMapa(): string {
  if (negocio.mapaUrl === PENDIENTE) return "#ubicacion";
  return negocio.mapaUrl;
}

/** Marca un dato que todavía no se ha llenado. */
export function dato(valor: string): { texto: string; falta: boolean } {
  const falta = valor === PENDIENTE;
  return { texto: falta ? "[FALTA LLENAR]" : valor, falta };
}

import {
  ArrowRight,
  Dumbbell,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Package,
} from "lucide-react";
import AgendarCita from "@/components/AgendarCita";
import { negocio, dato, linkMapa, linkWhatsApp, PENDIENTE } from "@/lib/negocio";

export default function Inicio() {
  const direccion = dato(negocio.direccion);
  const horario = dato(negocio.horario);
  const claim = dato(negocio.claim);
  const subheadline = dato(negocio.subheadline);
  const sinWhatsApp = negocio.whatsapp === PENDIENTE;

  const tituloSeccion =
    "font-display text-4xl uppercase tracking-wide text-lee-white sm:text-5xl";

  return (
    <>
      {/* ------------------------------------------------------------ header */}
      <header className="sticky top-0 z-50 border-b border-lee-border bg-lee-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#inicio" className="font-display text-2xl tracking-widest text-lee-gold">
            LEE<span className="text-lee-white">GYM</span>
          </a>
          <nav className="hidden items-center gap-8 text-sm uppercase tracking-wide text-lee-muted md:flex">
            <a href="#servicios" className="transition-colors hover:text-lee-gold">
              Servicios
            </a>
            <a href="#productos" className="transition-colors hover:text-lee-gold">
              Productos
            </a>
            <a href="#como" className="transition-colors hover:text-lee-gold">
              Cómo funciona
            </a>
            <a href="#ubicacion" className="transition-colors hover:text-lee-gold">
              Dónde estamos
            </a>
          </nav>
          <a
            href="#cita"
            className="rounded-md border border-lee-gold px-4 py-2 text-sm uppercase tracking-wide text-lee-gold transition-colors hover:bg-lee-gold hover:text-lee-black"
          >
            Agendar cita
          </a>
        </div>
      </header>

      <main>
        {/* ------------------------------------------------------------- hero */}
        <section id="inicio" className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at top, rgba(232,163,32,0.18) 0%, transparent 60%)",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
            <p className="mb-4 font-condensed text-sm uppercase tracking-[0.3em] text-lee-gold">
              Gimnasio
            </p>
            <h1
              className={`max-w-3xl text-6xl leading-[0.95] uppercase tracking-wide sm:text-8xl ${
                claim.falta ? "text-lee-muted" : "text-lee-white"
              }`}
            >
              {claim.texto}
            </h1>
            <p
              className={`mt-6 max-w-xl text-lg leading-relaxed ${
                subheadline.falta ? "text-lee-muted" : "text-lee-muted"
              }`}
            >
              {subheadline.texto}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#cita"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-lee-gold px-8 py-4 font-display text-lg uppercase tracking-wide text-lee-black transition-colors hover:bg-lee-gold-light"
              >
                Agendar mi cita
                <ArrowRight className="h-5 w-5" aria-hidden />
              </a>
              <a
                href="#servicios"
                className="inline-flex items-center justify-center rounded-md border border-lee-border px-8 py-4 font-display text-lg uppercase tracking-wide text-lee-white transition-colors hover:border-lee-gold hover:text-lee-gold"
              >
                Ver servicios
              </a>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- servicios */}
        <section id="servicios" className="border-t border-lee-border bg-lee-dark">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className={tituloSeccion}>Servicios</h2>
            <p className="mt-3 max-w-xl text-lee-muted">
              Esto es lo que ofrecemos. Si no ves lo que buscas, pregúntanos.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {negocio.servicios.map((servicio, i) => {
                const nombre = dato(servicio.nombre);
                const descripcion = dato(servicio.descripcion);
                const precio = dato(servicio.precio);
                return (
                  <article
                    key={i}
                    className="rounded-lg border border-lee-border bg-lee-card p-6 transition-colors hover:border-lee-gold"
                  >
                    <Dumbbell className="mb-4 h-6 w-6 text-lee-gold" aria-hidden />
                    <h3
                      className={`font-display text-2xl uppercase tracking-wide ${
                        nombre.falta ? "text-lee-muted" : "text-lee-white"
                      }`}
                    >
                      {nombre.texto}
                    </h3>
                    <p
                      className={`mt-2 text-sm leading-relaxed ${
                        descripcion.falta ? "text-lee-muted" : "text-lee-muted"
                      }`}
                    >
                      {descripcion.texto}
                    </p>
                    <p
                      className={`mt-4 font-condensed text-lg uppercase tracking-wide ${
                        precio.falta ? "text-lee-muted" : "text-lee-gold"
                      }`}
                    >
                      {precio.texto}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------- productos */}
        <section id="productos" className="border-t border-lee-border">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className={tituloSeccion}>Productos</h2>
            <p className="mt-3 max-w-xl text-lee-muted">
              Lo que tienes disponible en el local. Pídelos en la barra.
            </p>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {negocio.productos.map((producto, i) => {
                const nombre = dato(producto.nombre);
                const descripcion = dato(producto.descripcion);
                const precio = dato(producto.precio);
                return (
                  <article
                    key={i}
                    className="rounded-lg border border-lee-border bg-lee-card p-6 transition-colors hover:border-lee-gold"
                  >
                    <Package className="mb-4 h-6 w-6 text-lee-gold" aria-hidden />
                    <h3
                      className={`font-display text-2xl uppercase tracking-wide ${
                        nombre.falta ? "text-lee-muted" : "text-lee-white"
                      }`}
                    >
                      {nombre.texto}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-lee-muted">
                      {descripcion.texto}
                    </p>
                    <p
                      className={`mt-4 font-condensed text-lg uppercase tracking-wide ${
                        precio.falta ? "text-lee-muted" : "text-lee-gold"
                      }`}
                    >
                      {precio.texto}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------- cómo funciona */}
        <section id="como" className="border-t border-lee-border bg-lee-dark">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className={tituloSeccion}>Cómo funciona</h2>
            <p className="mt-3 max-w-xl text-lee-muted">
              Tres pasos. Sin llamadas perdidas ni esperas.
            </p>

            <ol className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  n: "01",
                  t: "Nos escribes",
                  d: "Llenas el formulario o mandas un WhatsApp. Nos dices qué te interesa y qué día te acomoda.",
                },
                {
                  n: "02",
                  t: "Te contestamos",
                  d: "Te confirmamos la hora y te decimos qué llevar. Si es tu primera vez, te damos una vuelta por el local.",
                },
                {
                  n: "03",
                  t: "Entrenas",
                  d: "Te presentamos al entrenador, te explica el aparato y ya. Sin llamadas de por medio.",
                },
              ].map((paso) => (
                <li key={paso.n} className="border-l-2 border-lee-gold pl-6">
                  <span className="font-display text-4xl text-lee-gold">{paso.n}</span>
                  <h3 className="mt-2 font-display text-2xl uppercase tracking-wide text-lee-white">
                    {paso.t}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-lee-muted">{paso.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* -------------------------------------------------------- ubicacion */}
        <section id="ubicacion" className="border-t border-lee-border">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className={tituloSeccion}>Dónde estamos</h2>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border border-lee-border bg-lee-card p-6">
                <MapPin className="mb-4 h-6 w-6 text-lee-gold" aria-hidden />
                <h3 className="font-display text-xl uppercase tracking-wide text-lee-white">
                  Dirección
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    direccion.falta ? "text-lee-muted" : "text-lee-muted"
                  }`}
                >
                  {direccion.texto}
                </p>
                <a
                  href={linkMapa()}
                  className="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-wide text-lee-gold hover:text-lee-gold-light"
                >
                  Cómo llegar
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </a>
              </div>

              <div className="rounded-lg border border-lee-border bg-lee-card p-6">
                <Clock className="mb-4 h-6 w-6 text-lee-gold" aria-hidden />
                <h3 className="font-display text-xl uppercase tracking-wide text-lee-white">
                  Horario
                </h3>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    horario.falta ? "text-lee-muted" : "text-lee-muted"
                  }`}
                >
                  {horario.texto}
                </p>
              </div>

              <div className="rounded-lg border border-lee-border bg-lee-card p-6">
                <Phone className="mb-4 h-6 w-6 text-lee-gold" aria-hidden />
                <h3 className="font-display text-xl uppercase tracking-wide text-lee-white">
                  Contacto
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-lee-muted">
                  {dato(negocio.telefono).texto}
                </p>
                <a
                  href={linkWhatsApp("Hola, tengo una duda sobre sus servicios.")}
                  className="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-wide text-lee-green hover:underline"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------ cierre */}
        <section id="cita" className="border-t border-lee-border bg-lee-dark">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-2">
            <div>
              <h2 className={tituloSeccion}>Agenda tu cita</h2>
              <p className="mt-4 max-w-md leading-relaxed text-lee-muted">
                Llena el formulario y te escribimos por WhatsApp para confirmar. Si
                prefieres, también puedes mandarnos un mensaje directo.
              </p>

              <a
                href={linkWhatsApp("Hola, quiero información sobre LEE GYM.")}
                className="mt-8 inline-flex items-center gap-3 rounded-md bg-lee-green px-6 py-3 font-display text-lg uppercase tracking-wide text-lee-black transition-opacity hover:opacity-90"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                Escribir por WhatsApp
              </a>
            </div>

            <div className="rounded-lg border border-lee-border bg-lee-card p-8">
              <AgendarCita />
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------ footer */}
      <footer className="border-t border-lee-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-lee-muted md:flex-row">
          <p>
            © {new Date().getFullYear()} LEE GYM. Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#servicios" className="hover:text-lee-gold">
              Servicios
            </a>
            <a href="#productos" className="hover:text-lee-gold">
              Productos
            </a>
            <a href="#ubicacion" className="hover:text-lee-gold">
              Dónde estamos
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

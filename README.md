# LEE GYM — Landing

Landing pública de LEE GYM. Seis secciones: hero, servicios, productos, cómo
funciona, dónde estamos y el formulario de cita.

Es una página estática. No hay base de datos, ni login, ni API, ni panel de
administración. Todo lo que necesita el navegador es un `next build`.

## Correr en local

```bash
npm install
npm run dev      # http://localhost:3000
```

## Los datos del negocio

**Todo sale de `src/lib/negocio.ts`.** Ese es el único archivo que se edita
para cambiar el contenido de la página.

Lo que todavía no está se ve con `[FALTA LLENAR]` en la página, para que no
se pase por dato real. Llena estos campos:

| Campo | Para qué |
|---|---|
| `whatsapp` | Número **sin `+` ni espacios**. Ej: `529512345678`. Es lo que activa el botón de cita. |
| `telefono` | Se muestra en la sección de ubicación. |
| `email`, `instagram`, `facebook` | Contacto. |
| `direccion`, `colonia`, `ciudad` | Sección de ubicación. |
| `mapaUrl` | Link de Google Maps. |
| `horario` | Texto del horario, como está en el letrero. |
| `claim`, `subheadline` | Titular del hero. |
| `servicios[]` | Nombre, descripción y precio de cada servicio. |
| `productos[]` | Nombre, descripción y precio de cada producto. |

Mientras `whatsapp` siga en `PENDIENTE`, el botón de agendar se muestra
desactivado y avisa que falta el número.

## Desplegar

El repo está conectado a Vercel. Cada `push` a `main` despliega.

```bash
git push
```

## Estructura

```
src/
  app/
    layout.tsx      metadata y fuentes
    page.tsx        la landing (server component)
    globals.css     tokens de color y tipografía
    favicon.ico
  components/
    AgendarCita.tsx  formulario (único client component)
  lib/
    negocio.ts        los datos del negocio
```

## Identidad

Definida en `globals.css` como custom properties de Tailwind v4.

| Token | Valor | Uso |
|---|---|---|
| `lee-black` | `#080808` | Fondo |
| `lee-dark` | `#101010` | Superficies alternas |
| `lee-card` | `#161616` | Tarjetas |
| `lee-gold` | `#e8a320` | Acento, CTA, bordes |
| `lee-gold-light` | `#f5c25a` | Hover del dorado |
| `lee-green` | `#25d366` | WhatsApp |
| `lee-red` | `#c62828` | Alertas |
| `lee-white` | `#f2ede3` | Texto |
| `lee-muted` | `#6b6b6b` | Texto secundario |
| `lee-border` | `rgba(232,163,32,0.15)` | Bordes |

**Tipografías:** Bebas Neue (títulos, `font-display`), Barlow (texto,
`font-sans`), Barlow Condensed (etiquetas, `font-condensed`).

**Idioma:** solo español, `es-MX`.

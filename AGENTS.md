# LEE GYM — Convenciones del Proyecto

Landing pública de un gimnasio. Next.js 16 con App Router y Tailwind v4.
Estática: sin base de datos, sin login, sin API, sin panel.

## Estructura de archivos

- `src/app/layout.tsx` — metadata y carga de fuentes
- `src/app/page.tsx` — la landing, server component
- `src/app/globals.css` — tokens de color y tipografía
- `src/components/AgendarCita.tsx` — el único client component
- `src/lib/negocio.ts` — **los datos del negocio**

## La regla que más importa

**Nada de contenido se escribe dentro de los componentes.** El texto, el
teléfono, la dirección, el horario, los servicios y los productos salen todos
de `src/lib/negocio.ts`. Para cambiar algo en la página se edita ese archivo.

Mientras un campo valga `PENDIENTE`, la página lo muestra como `[FALTA LLENAR]`
en lugar de inventar un dato. **No se escriben precios, horarios, teléfonos ni
direcciones que no hayan venido del cliente.** Un dato inventado en una landing
de gimnasio es una llamada perdida de alguien que sí iba a ir.

## Secciones

En este orden, y no se invierte:

1. Hero — titular y dos CTAs
2. Servicios — qué ofrecen
3. Productos — qué venden
4. Cómo funciona — tres pasos para agendar
5. Dónde estamos — dirección, horario, contacto
6. Cita — formulario y WhatsApp

## Convenciones de código

- Server components por defecto. `"use client"` solo si hay hooks de React.
- Tailwind v4 con `@theme inline`. No hay `tailwind.config.js`; los tokens
  viven en `globals.css`.
- Colores siempre por token (`bg-lee-gold`), nunca hex suelto en el JSX.
- Tipografía: `font-display` para títulos, `font-condensed` para etiquetas,
  `font-sans` para texto.
- Todo en español, `es-MX`. Sin texto de relleno en inglés.
- Los iconos salen de `lucide-react`, con `aria-hidden` cuando son decorativos.

## Identidad

Ver la tabla de tokens en `README.md`. Negro y dorado, tipografía condensada,
mucho aire. El dorado es el acento y va en CTA y borde; no se usa para texto
corrido.

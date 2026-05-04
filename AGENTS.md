<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# LEE GYM — Convenciones del Proyecto

## Arquitectura General

Este es un sistema de gestión para un gimnasio con 4 roles de usuario:
- `admin` — Control total del sistema
- `trainer` — Gestión de clases, rutinas, horarios
- `miembro` — Ver perfil, pagos, asistencia, progreso
- `mantenimiento` — Gestión de equipos e instalaciones

## Estructura de archivos

- `src/app/` — Rutas y páginas de Next.js (App Router)
- `src/app/api/` — Rutas de API REST
- `src/app/dashboard/` — Panel del administrador
- `src/app/mi-perfil/` — Panel del miembro
- `src/app/entrenador/` — Panel del entrenador
- `src/app/mantenimiento/` — Panel de mantenimiento
- `src/lib/` — Utilidades, DB, auth, helpers
- `src/lib/stripe-config.ts` — Configuración de Stripe (productos + precios + cupones)
- `src/components/` — Componentes reutilizables

## Diseño

- Colores LEE GYM (definidos en globals.css):
  - Negro: `#080808` (fondo)
  - Dark: `#101010` (sidebar, surfaces)
  - Card: `#161616` (tarjetas)
  - Dorado: `#e8a320` (acento principal, CTAs)
  - Gold Light: `#f5c25a` (hover dorado)
  - Verde: `#25d366` (éxito, WhatsApp)
  - Rojo: `#c62828` (alertas, eliminar)
  - Blanco: `#f2ede3` (texto principal)
  - Muted: `#6b6b6b` (texto secundario)
  - Border: `rgba(232,163,32,0.15)`
- Fuentes: Bebas Neue (titles), Barlow (body), Barlow Condensed (labels)
- Idioma: Solo español

## Stripe Integration

Los productos de membresía están configurados en `src/lib/stripe-config.ts`:
- Membresía Mensual: $350 MXN/mes (prod_USC6DOFdzZt5eo)
- Membresía Trimestral: $900 MXN/3 meses (prod_USC6JvEJMmqjU0)
- Membresía Anual: $3,000 MXN/año (prod_USC6YCY3x6UTHX)
- Pase de Día: $80 MXN único (prod_USC6viiT5FW3pj)

Cupones: PREVENTA15 (15% off), FITNESS50 ($50 off), BIENVENIDO (100% off)

## Stitch UI Design

Proyecto de diseño: `projects/17594774195255889809`
Pantallas generadas: Dashboard Admin, Login, Lista de Miembros, Perfil Móvil

## Dashboard (Admin)

El dashboard requiere:
- `src/lib/dashboard.ts` — Funciones de consulta SQL para estadísticas
- `src/app/dashboard/layout.tsx` — Layout con sidebar y header
- `src/app/dashboard/page.tsx` — Página principal con widgets
- `src/app/dashboard/loading.tsx` — Skeleton de carga

## Tablas de Base de Datos

- `usuarios` — Miembros, trainers, admins, mantenimiento
- `pagos` — Pagos de membresías
- `asistencia` — Registro de ingresos
- `membresias` — Planes disponibles (4 tipos)
- `clases` — Horarios de clases
- `reservas` — Reservas de clases
- `productos` — Tienda del gym
- `ventas` — Ventas de productos
- `rutinas` — Rutinas de entrenamiento
- `progreso` — Seguimiento de progreso físico
- `configuraciones` — Ajustes del sistema
- `notificaciones` — Sistema de avisos (app, email, whatsapp)
- `promociones` — Descuentos y ofertas
- `equipos` — Inventario de equipamiento (mantenimiento)
- `blog_posts` — Blog personal de miembros

## Convenciones de Código

- Usar TypeScript estricto
- Componentes server-side cuando sea posible
- `"use client"` solo cuando se necesiten hooks de React
- APIs retornan `{ success: boolean, data?: any, error?: string }`
- Todos los IDs son UUID v4
- Contraseñas se hashean con bcrypt (10 rounds)
- Token JWT con expiración de 7 días
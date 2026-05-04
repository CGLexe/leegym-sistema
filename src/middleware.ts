import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verificarToken, type TokenPayload } from './lib/auth';

// Rutas públicas que no requieren autenticación
const RUTAS_PUBLICAS = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
];

function esRutaPublica(pathname: string): boolean {
  // Permitir rutas exactas
  if (RUTAS_PUBLICAS.includes(pathname)) {
    return true;
  }

  // Permitir rutas con comodines (/api/auth/*)
  if (pathname.startsWith('/api/auth/')) {
    return true;
  }

  // Permitir archivos estáticos
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Si es ruta pública, permitir acceso
  if (esRutaPublica(pathname)) {
    return NextResponse.next();
  }

  // Para otras rutas, verificar el token desde las cookies o header
  const token = request.cookies.get('auth_token')?.value || request.headers.get('x-auth-token');

  if (!token) {
    // Si no hay token, redirigir a login (solo para rutas del navegador)
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Para rutas API, retornar 401
    return NextResponse.json(
      { success: false, error: 'Token requerido' },
      { status: 401 }
    );
  }

  // Verificar el token
  const payload = verificarToken(token);

  if (!payload) {
    // Token inválido o expirado
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.json(
      { success: false, error: 'Token inválido o expirado' },
      { status: 401 }
    );
  }

  // Token válido, añadir info del usuario a headers para las rutas API
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.id);
  requestHeaders.set('x-user-email', payload.email);
  requestHeaders.set('x-user-rol', payload.rol);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon files)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
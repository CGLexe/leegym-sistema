import { NextResponse } from 'next/server';
import { obtenerUsuarioActual } from '@/lib/auth';
import { getUsuarioById, type Usuario } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Extraer el token del header Authorization
    const payload = obtenerUsuarioActual(request);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token requerido o inválido' },
        { status: 401 }
      );
    }

    // Obtener datos completos del usuario desde la base de datos
    const usuario = await getUsuarioById(payload.id);

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Retornar datos del usuario (sin password)
    return NextResponse.json({
      success: true,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        foto: usuario.foto,
        telefono: usuario.telefono,
        fecha_nacimiento: usuario.fecha_nacimiento,
        condicion_medica: usuario.condicion_medica,
        contacto_emergencia: usuario.contacto_emergencia,
      },
    });
  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
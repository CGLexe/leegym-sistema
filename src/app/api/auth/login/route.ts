import { NextResponse } from 'next/server';
import { getUsuarioByEmail, verificarPassword, type Usuario } from '@/lib/db';
import { generarToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validar que se reciban los datos necesarios
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y password son requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const usuario = await getUsuarioByEmail(email);

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Verificar password
    const passwordValida = verificarPassword(password, usuario.password_hash);

    if (!passwordValida) {
      return NextResponse.json(
        { success: false, error: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = generarToken({
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    });

    // Retornar datos del usuario (sin password)
    return NextResponse.json({
      success: true,
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        foto: usuario.foto,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
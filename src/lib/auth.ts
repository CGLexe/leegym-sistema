import jwt from 'jsonwebtoken';
import { getUsuarioById } from './db';

const SECRET_KEY = 'leegym-secret-key-2025';

export interface TokenPayload {
  id: string;
  email: string;
  rol: 'admin' | 'trainer' | 'miembro';
}

export function generarToken(usuario: { id: string; email: string; rol: string }): string {
  const payload: TokenPayload = {
    id: usuario.id,
    email: usuario.email,
    rol: usuario.rol as 'admin' | 'trainer' | 'miembro',
  };

  return jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

export function verificarToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function obtenerUsuarioActual(request: Request): TokenPayload | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verificarToken(token);
}

export function obtenerUsuarioDesdeToken(tokenPayload: TokenPayload) {
  return getUsuarioById(tokenPayload.id);
}
import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// INTERFACES
// ============================================

export interface MiembroAsistencia {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  membresia: string | null;
  fecha_fin: string | null;
  asistencia_id: string | null;
  hora_entrada: string | null;
}

export interface RegistroAsistenciaResult {
  success: boolean;
  hora?: string;
  error?: string;
}

export interface EntradaAsistencia {
  id: string;
  usuario_id: string;
  nombre: string;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
}

// ============================================
// FUNCIONES (async con @vercel/postgres)
// ============================================

// Obtener todos los miembros para el checklist de asistencia
export async function getMiembrosAsistencia(): Promise<MiembroAsistencia[]> {
  const { rows } = await sql`
    SELECT 
      u.id, 
      u.nombre, 
      u.email,
      u.telefono,
      m.nombre as membresia,
      p.fecha_fin,
      a.id as asistencia_id,
      a.hora_entrada
    FROM usuarios u
    LEFT JOIN (
      SELECT usuario_id, id, membresia_id, fecha_inicio, fecha_fin, estado,
             ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY fecha_fin DESC) as rn
      FROM pagos 
      WHERE estado = 'aprobado' AND fecha_fin >= CURRENT_DATE
    ) p ON u.id = p.usuario_id AND p.rn = 1
    LEFT JOIN membresias m ON p.membresia_id = m.id
    LEFT JOIN asistencia a ON u.id = a.usuario_id AND a.fecha = CURRENT_DATE
    WHERE u.rol = 'miembro'
    ORDER BY u.nombre ASC
  `;
  
  return rows;
}

// Registrar entrada de asistencia
export async function registrarAsistencia(usuarioId: string, registradoPor?: string): Promise<RegistroAsistenciaResult> {
  const id = uuidv4();
  const now = new Date();
  const horaActual = now.toISOString().split('T')[1].substring(0, 8);
  
  // Verificar si ya tiene entrada hoy
  const { rows: existente } = await sql`
    SELECT id FROM asistencia 
    WHERE usuario_id = ${usuarioId} AND fecha = CURRENT_DATE
  `;
  
  if (existente.length > 0) {
    return { success: false, error: 'Ya registró entrada hoy' };
  }
  
  await sql`
    INSERT INTO asistencia (id, usuario_id, fecha, hora_entrada, registrado_por)
    VALUES (${id}, ${usuarioId}, CURRENT_DATE, ${horaActual}, ${registradoPor || null})
  `;
  
  return { success: true, hora: horaActual };
}

// Eliminar entrada de asistencia
export async function eliminarAsistencia(usuarioId: string): Promise<boolean> {
  const result = await sql`
    DELETE FROM asistencia
    WHERE usuario_id = ${usuarioId} AND fecha = CURRENT_DATE
  `;
  return (result.rowCount ?? 0) > 0;
}

// Obtener asistencia del día
export async function getAsistenciaHoy(): Promise<EntradaAsistencia[]> {
  const { rows } = await sql`
    SELECT 
      a.id,
      a.usuario_id,
      u.nombre,
      a.fecha,
      a.hora_entrada,
      a.hora_salida
    FROM asistencia a
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE a.fecha = CURRENT_DATE
    ORDER BY a.hora_entrada ASC
  `;
  return rows;
}
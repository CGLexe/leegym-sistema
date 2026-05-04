import { getDb } from '@/lib/db';

// Obtener todos los miembros para el checklist de asistencia
export function getMiembrosAsistencia() {
  const db = getDb();
  const stmt = db.prepare(`
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
      WHERE estado = 'aprobado' AND fecha_fin >= date('now')
    ) p ON u.id = p.usuario_id AND p.rn = 1
    LEFT JOIN membresias m ON p.membresia_id = m.id
    LEFT JOIN asistencia a ON u.id = a.usuario_id AND date(a.fecha) = date('now')
    WHERE u.rol = 'miembro'
    ORDER BY u.nombre ASC
  `);
  const miembros = stmt.all();
  db.close();
  return miembros;
}

// Registrar entrada de asistencia
export function registrarAsistencia(usuarioId: string, registradoPor?: string) {
  const db = getDb();
  const { v4: uuidv4 } = require('uuid');
  
  const id = uuidv4();
  const now = new Date().toISOString();
  const horaActual = now.split('T')[1].substring(0, 8);
  
  // Verificar si ya tiene entrada hoy
  const checkStmt = db.prepare(`
    SELECT id FROM asistencia 
    WHERE usuario_id = ? AND date(fecha) = date('now')
  `);
  const existente = checkStmt.get(usuarioId);
  
  if (existente) {
    db.close();
    return { success: false, error: 'Ya registró entrada hoy' };
  }
  
  const stmt = db.prepare(`
    INSERT INTO asistencia (id, usuario_id, fecha, hora_entrada, registrado_por)
    VALUES (?, ?, date('now'), ?, ?)
  `);
  
  stmt.run(id, usuarioId, horaActual, registradoPor || null);
  db.close();
  return { success: true, hora: horaActual };
}

// Eliminar entrada de asistencia
export function eliminarAsistencia(usuarioId: string) {
  const db = getDb();
  const stmt = db.prepare(`
    DELETE FROM asistencia 
    WHERE usuario_id = ? AND date(fecha) = date('now')
  `);
  const result = stmt.run(usuarioId);
  db.close();
  return result.changes > 0;
}

// Obtener asistencia del día
export function getAsistenciaHoy() {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      a.id,
      a.usuario_id,
      u.nombre,
      a.fecha,
      a.hora_entrada,
      a.hora_salida
    FROM asistencia a
    JOIN usuarios u ON a.usuario_id = u.id
    WHERE date(a.fecha) = date('now')
    ORDER BY a.hora_entrada ASC
  `);
  const asistencia = stmt.all();
  db.close();
  return asistencia;
}
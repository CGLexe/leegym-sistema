import { getDb } from './db';

export interface Miembro {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  foto: string | null;
  fecha_nacimiento: string | null;
  condicion_medica: string | null;
  contacto_emergencia: string | null;
  rol: string;
  created_at: string;
  updated_at: string;
  // Campos calculados
  membresia_activa?: MembresiaActiva | null;
  ultimo_pago?: Pago | null;
}

export interface MembresiaActiva {
  id: string;
  membresia_id: string;
  nombre_membresia: string;
  fecha_inicio: string;
  fecha_fin: string;
  dias_restantes: number;
  estado: 'activa' | 'vencida' | 'por_vencer';
}

export interface Pago {
  id: string;
  usuario_id: string;
  membresia_id: string | null;
  monto: number;
  metodo: string;
  fecha_pago: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: string;
  membresia_nombre?: string;
}

export interface HistorialPago {
  id: string;
  monto: number;
  metodo: string;
  fecha_pago: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  estado: string;
  membresia_nombre: string;
}

export interface HistorialAsistencia {
  id: string;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
}

export interface Rutina {
  id: string;
  nombre: string;
  ejercicios_json: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  created_at: string;
  trainer_nombre?: string;
}

export interface EntradaProgreso {
  id: string;
  peso: number | null;
  medidas_json: string | null;
  foto: string | null;
  notas: string | null;
  fecha: string;
}

// Obtener todos los miembros con filtros
export function getMiembros(filtro: string = 'todos', busqueda: string = ''): Miembro[] {
  const db = getDb();
  
  let query = `
    SELECT u.*, 
           p.id as pago_id, p.membresia_id, p.fecha_inicio, p.fecha_fin, p.estado as pago_estado,
           m.nombre as membresia_nombre
    FROM usuarios u
    LEFT JOIN (
      SELECT usuario_id, id, membresia_id, fecha_inicio, fecha_fin, estado,
             ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY fecha_fin DESC) as rn
      FROM pagos 
      WHERE estado = 'aprobado' AND fecha_fin >= date('now')
    ) p ON u.id = p.usuario_id AND p.rn = 1
    LEFT JOIN membresias m ON p.membresia_id = m.id
    WHERE u.rol = 'miembro'
  `;
  
  const params: any[] = [];
  
  // Aplicar filtros
  if (filtro === 'activos') {
    query += ` AND p.estado = 'aprobado' AND p.fecha_fin >= date('now')`;
  } else if (filtro === 'vencidos') {
    query += ` AND (p.estado != 'aprobado' OR p.fecha_fin < date('now') OR p.fecha_fin IS NULL)`;
  } else if (filtro === 'por_vencer') {
    query += ` AND p.estado = 'aprobado' AND p.fecha_fin <= date('now', '+7 days') AND p.fecha_fin >= date('now')`;
  }
  
  // Aplicar búsqueda
  if (busqueda) {
    query += ` AND (u.nombre LIKE ? OR u.email LIKE ?)`;
    const searchTerm = `%${busqueda}%`;
    params.push(searchTerm, searchTerm);
  }
  
  query += ` ORDER BY u.nombre ASC`;
  
  const stmt = db.prepare(query);
  const miembros = stmt.all(...params) as any[];
  
  // Procesar resultados
  const miembrosFormateados: Miembro[] = miembros.map((m) => {
    let membresia_activa: MembresiaActiva | null = null;
    
    if (m.pago_id && m.fecha_fin) {
      const dias_restantes = Math.floor(
        (new Date(m.fecha_fin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      
      let estado: 'activa' | 'vencida' | 'por_vencer' = 'activa';
      if (dias_restantes < 0) {
        estado = 'vencida';
      } else if (dias_restantes <= 7) {
        estado = 'por_vencer';
      }
      
      if (m.pago_estado === 'aprobado') {
        membresia_activa = {
          id: m.pago_id,
          membresia_id: m.membresia_id,
          nombre_membresia: m.membresia_nombre || 'Sin membresía',
          fecha_inicio: m.fecha_inicio,
          fecha_fin: m.fecha_fin,
          dias_restantes,
          estado,
        };
      }
    }
    
    return {
      ...m,
      membresia_activa,
    };
  });
  
  db.close();
  return miembrosFormateados;
}

// Obtener un miembro por ID
export function getMiembroById(id: string): Miembro | null {
  const db = getDb();
  
  // Obtener datos del miembro
  const stmt = db.prepare(`
    SELECT * FROM usuarios WHERE id = ? AND rol = 'miembro'
  `);
  const miembro = stmt.get(id) as Miembro | undefined;
  
  if (!miembro) {
    db.close();
    return null;
  }
  
  // Obtener membresía activa
  const membresiaStmt = db.prepare(`
    SELECT p.id, p.membresia_id, m.nombre as nombre_membresia, 
           p.fecha_inicio, p.fecha_fin
    FROM pagos p
    LEFT JOIN membresias m ON p.membresia_id = m.id
    WHERE p.usuario_id = ? AND p.estado = 'aprobado' AND p.fecha_fin >= date('now')
    ORDER BY p.fecha_fin DESC
    LIMIT 1
  `);
  const membresia = membresiaStmt.get(id) as any;
  
  let membresia_activa: MembresiaActiva | null = null;
  if (membresia) {
    const dias_restantes = Math.floor(
      (new Date(membresia.fecha_fin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    let estado: 'activa' | 'vencida' | 'por_vencer' = 'activa';
    if (dias_restantes < 0) {
      estado = 'vencida';
    } else if (dias_restantes <= 7) {
      estado = 'por_vencer';
    }
    
    membresia_activa = {
      id: membresia.id,
      membresia_id: membresia.membresia_id,
      nombre_membresia: membresia.nombre_membresia || 'Sin membresía',
      fecha_inicio: membresia.fecha_inicio,
      fecha_fin: membresia.fecha_fin,
      dias_restantes,
      estado,
    };
  }
  
  db.close();
  return {
    ...miembro,
    membresia_activa,
  };
}

// Crear nuevo miembro
export function createMiembro(data: {
  nombre: string;
  email: string;
  password?: string;
  telefono?: string;
  foto?: string;
  fecha_nacimiento?: string;
  condicion_medica?: string;
  contacto_emergencia?: string;
}): Miembro {
  const db = getDb();
  const { v4: uuidv4 } = require('uuid');
  const bcrypt = require('bcryptjs');
  
  const id = uuidv4();
  const passwordHash = data.password 
    ? bcrypt.hashSync(data.password, 10)
    : bcrypt.hashSync('password123', 10); // Password por defecto
  
  const stmt = db.prepare(`
    INSERT INTO usuarios (id, nombre, email, password_hash, rol, telefono, foto, fecha_nacimiento, condicion_medica, contacto_emergencia)
    VALUES (?, ?, ?, ?, 'miembro', ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    id,
    data.nombre,
    data.email,
    passwordHash,
    data.telefono || null,
    data.foto || null,
    data.fecha_nacimiento || null,
    data.condicion_medica || null,
    data.contacto_emergencia || null
  );
  
  db.close();
  
  return getMiembroById(id)!;
}

// Actualizar miembro
export function updateMiembro(id: string, data: {
  nombre?: string;
  email?: string;
  telefono?: string;
  foto?: string;
  fecha_nacimiento?: string;
  condicion_medica?: string;
  contacto_emergencia?: string;
}): Miembro | null {
  const db = getDb();
  
  // Verificar que el miembro existe
  const checkStmt = db.prepare('SELECT * FROM usuarios WHERE id = ? AND rol = ?');
  const existing = checkStmt.get(id, 'miembro') as Miembro | undefined;
  
  if (!existing) {
    db.close();
    return null;
  }
  
  // Verificaremail único si se está cambiando
  if (data.email && data.email !== existing.email) {
    const emailCheck = db.prepare('SELECT id FROM usuarios WHERE email = ? AND id != ?');
    const existingEmail = emailCheck.get(data.email, id);
    if (existingEmail) {
      db.close();
      throw new Error('El email ya está en uso');
    }
  }
  
  // Actualizar campos
  const updates: string[] = [];
  const params: any[] = [];
  
  if (data.nombre !== undefined) {
    updates.push('nombre = ?');
    params.push(data.nombre);
  }
  if (data.email !== undefined) {
    updates.push('email = ?');
    params.push(data.email);
  }
  if (data.telefono !== undefined) {
    updates.push('telefono = ?');
    params.push(data.telefono);
  }
  if (data.foto !== undefined) {
    updates.push('foto = ?');
    params.push(data.foto);
  }
  if (data.fecha_nacimiento !== undefined) {
    updates.push('fecha_nacimiento = ?');
    params.push(data.fecha_nacimiento);
  }
  if (data.condicion_medica !== undefined) {
    updates.push('condicion_medica = ?');
    params.push(data.condicion_medica);
  }
  if (data.contacto_emergencia !== undefined) {
    updates.push('contacto_emergencia = ?');
    params.push(data.contacto_emergencia);
  }
  
  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    params.push(id);
    
    const stmt = db.prepare(`
      UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?
    `);
    stmt.run(...params);
  }
  
  db.close();
  return getMiembroById(id);
}

// Eliminar miembro
export function deleteMiembro(id: string): boolean {
  const db = getDb();
  
  const stmt = db.prepare('DELETE FROM usuarios WHERE id = ? AND rol = ?');
  const result = stmt.run(id, 'miembro');
  
  db.close();
  return result.changes > 0;
}

// Obtener historial de pagos de un miembro
export function getHistorialPagos(usuarioId: string): HistorialPago[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT p.id, p.monto, p.metodo, p.fecha_pago, p.fecha_inicio, p.fecha_fin, p.estado,
           COALESCE(m.nombre, 'Sin membresía') as membresia_nombre
    FROM pagos p
    LEFT JOIN membresias m ON p.membresia_id = m.id
    WHERE p.usuario_id = ?
    ORDER BY p.fecha_pago DESC
  `);
  
  const pagos = stmt.all(usuarioId) as HistorialPago[];
  db.close();
  return pagos;
}

// Obtener historial de asistencia de un miembro
export function getHistorialAsistencia(usuarioId: string, limit: number = 30): HistorialAsistencia[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT id, fecha, hora_entrada, hora_salida
    FROM asistencia
    WHERE usuario_id = ?
    ORDER BY fecha DESC
    LIMIT ?
  `);
  
  const asistencia = stmt.all(usuarioId, limit) as HistorialAsistencia[];
  db.close();
  return asistencia;
}

// Obtener rutinas de un miembro
export function getRutinas(usuarioId: string): Rutina[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT r.id, r.nombre, r.ejercicios_json, r.fecha_inicio, r.fecha_fin, r.created_at,
           u.nombre as trainer_nombre
    FROM rutinas r
    LEFT JOIN usuarios u ON r.trainer_id = u.id
    WHERE r.usuario_id = ?
    ORDER BY r.created_at DESC
  `);
  
  const rutinas = stmt.all(usuarioId) as Rutina[];
  db.close();
  return rutinas;
}

// Obtener progreso de un miembro
export function getProgreso(usuarioId: string, limit: number = 10): EntradaProgreso[] {
  const db = getDb();
  
  const stmt = db.prepare(`
    SELECT id, peso, medidas_json, foto, notas, fecha
    FROM progreso
    WHERE usuario_id = ?
    ORDER BY fecha DESC
    LIMIT ?
  `);
  
  const progreso = stmt.all(usuarioId, limit) as EntradaProgreso[];
  db.close();
  return progreso;
}

// Agregar entrada de progreso
export function addProgreso(data: {
  usuario_id: string;
  peso?: number;
  medidas_json?: string;
  foto?: string;
  notas?: string;
}): EntradaProgreso {
  const db = getDb();
  const { v4: uuidv4 } = require('uuid');
  
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO progreso (id, usuario_id, peso, medidas_json, foto, notas, fecha)
    VALUES (?, ?, ?, ?, ?, ?, date('now'))
  `);
  
  stmt.run(
    id,
    data.usuario_id,
    data.peso || null,
    data.medidas_json || null,
    data.foto || null,
    data.notas || null
  );
  
  const getStmt = db.prepare('SELECT * FROM progreso WHERE id = ?');
  const result = getStmt.get(id) as EntradaProgreso;
  
  db.close();
  return result;
}
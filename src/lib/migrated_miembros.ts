import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

// ============================================
// INTERFACES
// ============================================

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

// ============================================
// FUNCIONES (async)
// ============================================

export async function getMiembros(filtro: string = 'todos', busqueda: string = ''): Promise<Miembro[]> {
  let whereClause = "WHERE u.rol = 'miembro'";
  const params: any[] = [];

  if (filtro === 'activos') {
    whereClause += ` AND p.estado = 'aprobado' AND p.fecha_fin >= CURRENT_DATE`;
  } else if (filtro === 'vencidos') {
    whereClause += ` AND (p.estado != 'aprobado' OR p.fecha_fin < CURRENT_DATE OR p.fecha_fin IS NULL)`;
  } else if (filtro === 'por_vencer') {
    whereClause += ` AND p.estado = 'aprobado' AND p.fecha_fin <= CURRENT_DATE + INTERVAL '7 days' AND p.fecha_fin >= CURRENT_DATE`;
  }

  if (busqueda) {
    whereClause += ` AND (u.nombre ILIKE $1 OR u.email ILIKE $1)`;
    params.push(`%${busqueda}%`);
  }

  const query = `
    SELECT u.*, 
           p.id as pago_id, p.membresia_id, p.fecha_inicio, p.fecha_fin, p.estado as pago_estado,
           m.nombre as membresia_nombre
    FROM usuarios u
    LEFT JOIN (
      SELECT usuario_id, id, membresia_id, fecha_inicio, fecha_fin, estado,
             ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY fecha_fin DESC) as rn
      FROM pagos 
      WHERE estado = 'aprobado' AND fecha_fin >= CURRENT_DATE
    ) p ON u.id = p.usuario_id AND p.rn = 1
    LEFT JOIN membresias m ON p.membresia_id = m.id
    ${whereClause}
    ORDER BY u.nombre ASC
  `;

  const { rows } = await sql.query(query, params);
  
  // Procesar resultados
  return rows.map((m: any) => {
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
}

export async function getMiembroById(id: string): Promise<Miembro | null> {
  const { rows } = await sql`SELECT * FROM usuarios WHERE id = ${id} AND rol = 'miembro'`;
  const miembro = rows[0];
  
  if (!miembro) return null;
  
  // Obtener membresía activa
  const { rows: membresiaRows } = await sql`
    SELECT p.id, p.membresia_id, m.nombre as nombre_membresia, 
           p.fecha_inicio, p.fecha_fin
    FROM pagos p
    LEFT JOIN membresias m ON p.membresia_id = m.id
    WHERE p.usuario_id = ${id} AND p.estado = 'aprobado' AND p.fecha_fin >= CURRENT_DATE
    ORDER BY p.fecha_fin DESC
    LIMIT 1
  `;
  
  let membresia_activa: MembresiaActiva | null = null;
  if (membresiaRows[0]) {
    const membresia = membresiaRows[0];
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
  
  return {
    ...miembro,
    membresia_activa,
  };
}

export async function createMiembro(data: {
  nombre: string;
  email: string;
  password?: string;
  telefono?: string;
  foto?: string;
  fecha_nacimiento?: string;
  condicion_medica?: string;
  contacto_emergencia?: string;
}): Promise<Miembro> {
  const id = uuidv4();
  const passwordHash = data.password 
    ? bcrypt.hashSync(data.password, 10)
    : bcrypt.hashSync('password123', 10);

  await sql`
    INSERT INTO usuarios (id, nombre, email, password_hash, rol, telefono, foto, fecha_nacimiento, condicion_medica, contacto_emergencia)
    VALUES (${id}, ${data.nombre}, ${data.email}, ${passwordHash}, 'miembro', ${data.telefono || null}, ${data.foto || null}, ${data.fecha_nacimiento || null}, ${data.condicion_medica || null}, ${data.contacto_emergencia || null})
  `;

  return (await getMiembroById(id))!;
}

export async function updateMiembro(id: string, data: {
  nombre?: string;
  email?: string;
  telefono?: string;
  foto?: string;
  fecha_nacimiento?: string;
  condicion_medica?: string;
  contacto_emergencia?: string;
}): Promise<Miembro | null> {
  // Verificar que el miembro existe
  const { rows: existing } = await sql`SELECT * FROM usuarios WHERE id = ${id} AND rol = 'miembro'`;
  if (!existing[0]) return null;

  // Verificar email único si se está cambiando
  if (data.email && data.email !== existing[0].email) {
    const { rows: emailCheck } = await sql`SELECT id FROM usuarios WHERE email = ${data.email} AND id != ${id}`;
    if (emailCheck[0]) {
      throw new Error('El email ya está en uso');
    }
  }

  // Construir query dinámico
  const updates: string[] = [];
  const params: any[] = [];

  if (data.nombre !== undefined) {
    updates.push('nombre = $' + (params.length + 1));
    params.push(data.nombre);
  }
  if (data.email !== undefined) {
    updates.push('email = $' + (params.length + 1));
    params.push(data.email);
  }
  if (data.telefono !== undefined) {
    updates.push('telefono = $' + (params.length + 1));
    params.push(data.telefono);
  }
  if (data.foto !== undefined) {
    updates.push('foto = $' + (params.length + 1));
    params.push(data.foto);
  }
  if (data.fecha_nacimiento !== undefined) {
    updates.push('fecha_nacimiento = $' + (params.length + 1));
    params.push(data.fecha_nacimiento);
  }
  if (data.condicion_medica !== undefined) {
    updates.push('condicion_medica = $' + (params.length + 1));
    params.push(data.condicion_medica);
  }
  if (data.contacto_emergencia !== undefined) {
    updates.push('contacto_emergencia = $' + (params.length + 1));
    params.push(data.contacto_emergencia);
  }
  
  if (updates.length > 0) {
    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await sql`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ${id}`;
  }

  return getMiembroById(id);
}

export async function deleteMiembro(id: string): Promise<boolean> {
  const result = await sql`DELETE FROM usuarios WHERE id = ${id} AND rol = 'miembro'`;
  return (result.rowCount ?? 0) > 0;
}

export async function getHistorialPagos(usuarioId: string): Promise<HistorialPago[]> {
  const { rows } = await sql`
    SELECT p.id, p.monto, p.metodo, p.fecha_pago, p.fecha_inicio, p.fecha_fin, p.estado,
           COALESCE(m.nombre, 'Sin membresía') as membresia_nombre
    FROM pagos p
    LEFT JOIN membresias m ON p.membresia_id = m.id
    WHERE p.usuario_id = ${usuarioId}
    ORDER BY p.fecha_pago DESC
  `;
  return rows;
}

export async function getHistorialAsistencia(usuarioId: string, limit: number = 30): Promise<HistorialAsistencia[]> {
  const { rows } = await sql`
    SELECT id, fecha, hora_entrada, hora_salida
    FROM asistencia
    WHERE usuario_id = ${usuarioId}
    ORDER BY fecha DESC
    LIMIT ${limit}
  `;
  return rows;
}

export async function getRutinas(usuarioId: string): Promise<Rutina[]> {
  const { rows } = await sql`
    SELECT r.id, r.nombre, r.ejercicios_json, r.fecha_inicio, r.fecha_fin, r.created_at,
           u.nombre as trainer_nombre
    FROM rutinas r
    LEFT JOIN usuarios u ON r.trainer_id = u.id
    WHERE r.usuario_id = ${usuarioId}
    ORDER BY r.created_at DESC
  `;
  return rows;
}

export async function getProgreso(usuarioId: string, limit: number = 10): Promise<EntradaProgreso[]> {
  const { rows } = await sql`
    SELECT id, peso, medidas_json, foto, notas, fecha
    FROM progreso
    WHERE usuario_id = ${usuarioId}
    ORDER BY fecha DESC
    LIMIT ${limit}
  `;
  return rows;
}

export async function addProgreso(data: {
  usuario_id: string;
  peso?: number;
  medidas_json?: string;
  foto?: string;
  notas?: string;
}): Promise<EntradaProgreso> {
  const id = uuidv4();
  
  await sql`
    INSERT INTO progreso (id, usuario_id, peso, medidas_json, foto, notas, fecha)
    VALUES (${id}, ${data.usuario_id}, ${data.peso || null}, ${data.medidas_json || null}, ${data.foto || null}, ${data.notas || null}, CURRENT_DATE)
  `;

  const { rows } = await sql`SELECT * FROM progreso WHERE id = ${id}`;
  return rows[0];
}
import { getDb } from './db';

export interface DashboardStats {
  miembrosActivos: number;
  ingresosMes: number;
  membresiasPorVencer: number;
  asistenciaHoy: number;
}

export interface Miembro {
  id: string;
  nombre: string;
  email: string;
  foto: string | null;
}

export interface Pago {
  id: string;
  usuario_id: string;
  monto: number;
  fecha_pago: string;
  estado: string;
  miembro?: Miembro;
}

export interface MembresiaPorVencer {
  id: string;
  usuario_id: string;
  nombre_miembro: string;
  membresia: string;
  fecha_fin: string;
  dias_restantes: number;
}

export interface AsistenciaDia {
  dia: string;
  count: number;
}

// Obtener estadísticas del dashboard
export function getDashboardStats(): DashboardStats {
  const db = getDb();

  // Miembros activos (usuarios con rol miembro)
  const miembrosStmt = db.prepare(`
    SELECT COUNT(*) as count FROM usuarios WHERE rol = 'miembro'
  `);
  const miembrosResult = miembrosStmt.get() as { count: number };
  const miembrosActivos = miembrosResult.count;

  // Ingresos del mes actual
  const ingresosStmt = db.prepare(`
    SELECT COALESCE(SUM(monto), 0) as total 
    FROM pagos 
    WHERE estado = 'aprobado' 
    AND strftime('%Y-%m', fecha_pago) = strftime('%Y-%m', 'now')
  `);
  const ingresosResult = ingresosStmt.get() as { total: number };
  const ingresosMes = ingresosResult.total;

  // Membresías por vencer en los próximos 7 días
  const membresiasStmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM pagos 
    WHERE estado = 'aprobado' 
    AND fecha_fin IS NOT NULL 
    AND date(fecha_fin) <= date('now', '+7 days')
    AND date(fecha_fin) >= date('now')
  `);
  const membresiasResult = membresiasStmt.get() as { count: number };
  const membresiasPorVencer = membresiasResult.count;

  // Asistencia de hoy
  const asistenciaStmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM asistencia 
    WHERE date(fecha) = date('now')
  `);
  const asistenciaResult = asistenciaStmt.get() as { count: number };
  const asistenciaHoy = asistenciaResult.count;

  db.close();

  return {
    miembrosActivos,
    ingresosMes,
    membresiasPorVencer,
    asistenciaHoy,
  };
}

// Obtener lista de miembros activos
export function getMiembros(limit: number = 10): Miembro[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT id, nombre, email, foto 
    FROM usuarios 
    WHERE rol = 'miembro' 
    ORDER BY created_at DESC 
    LIMIT ?
  `);
  const miembros = stmt.all(limit) as Miembro[];
  db.close();
  return miembros;
}

// Obtener últimos pagos
export function getUltimosPagos(limit: number = 10): Pago[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT p.id, p.usuario_id, p.monto, p.fecha_pago, p.estado,
           u.nombre as miembro_nombre, u.email as miembro_email
    FROM pagos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    ORDER BY p.fecha_pago DESC 
    LIMIT ?
  `);
  const pagos = stmt.all(limit) as (Pago & { miembro_nombre: string; miembro_email: string })[];
  
  // Transformar al formato esperado
  const pagosFormatted: Pago[] = pagos.map(p => ({
    id: p.id,
    usuario_id: p.usuario_id,
    monto: p.monto,
    fecha_pago: p.fecha_pago,
    estado: p.estado,
    miembro: p.usuario_id ? {
      id: p.usuario_id,
      nombre: p.miembro_nombre,
      email: p.miembro_email,
      foto: null,
    } : undefined,
  }));
  
  db.close();
  return pagosFormatted;
}

// Obtener membresías por vencer
export function getMembresiasPorVencer(limit: number = 10): MembresiaPorVencer[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT p.id, p.usuario_id, u.nombre as nombre_miembro, m.nombre as membresia,
           p.fecha_fin,
           CAST(julianday(p.fecha_fin) - julianday('now') AS INTEGER) as dias_restantes
    FROM pagos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN membresias m ON p.membresia_id = m.id
    WHERE p.estado = 'aprobado' 
    AND p.fecha_fin IS NOT NULL 
    AND date(p.fecha_fin) >= date('now')
    AND date(p.fecha_fin) <= date('now', '+7 days')
    ORDER BY p.fecha_fin ASC 
    LIMIT ?
  `);
  const membresias = stmt.all(limit) as MembresiaPorVencer[];
  db.close();
  return membresias;
}

// Obtener asistencia por día de la semana
export function getAsistenciaPorDia(): AsistenciaDia[] {
  const db = getDb();
  const stmt = db.prepare(`
    SELECT 
      CASE CAST(strftime('%w', fecha) AS INTEGER)
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Lunes'
        WHEN 2 THEN 'Martes'
        WHEN 3 THEN 'Miércoles'
        WHEN 4 THEN 'Jueves'
        WHEN 5 THEN 'Viernes'
        WHEN 6 THEN 'Sábado'
      END as dia,
      COUNT(*) as count
    FROM asistencia
    WHERE fecha >= date('now', '-7 days')
    GROUP BY strftime('%w', fecha)
    ORDER BY strftime('%w', fecha)
  `);
  const asistencia = stmt.all() as AsistenciaDia[];
  
  // Asegurar que todos los días estén representados
  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const asistenciaMap = new Map(asistencia.map(a => [a.dia, a.count]));
  const diasCompletos: AsistenciaDia[] = diasOrden.map(dia => ({
    dia,
    count: asistenciaMap.get(dia) || 0,
  }));
  
  db.close();
  return diasCompletos;
}
import { sql } from '@vercel/postgres';

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

export async function getDashboardStats(): Promise<DashboardStats> {
  // Miembros activos
  const { rows: miembrosRows } = await sql`
    SELECT COUNT(*) as count FROM usuarios WHERE rol = 'miembro'
  `;
  const miembrosActivos = parseInt(miembrosRows[0]?.count || '0');

  // Ingresos del mes actual
  const { rows: ingresosRows } = await sql`
    SELECT COALESCE(SUM(monto), 0) as total 
    FROM pagos 
    WHERE estado = 'aprobado' 
    AND DATE_TRUNC('month', fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)
  `;
  const ingresosMes = parseFloat(ingresosRows[0]?.total || '0');

  // Membresías por vencer en los próximos 7 días
  const { rows: membresiasRows } = await sql`
    SELECT COUNT(*) as count
    FROM pagos
    WHERE estado = 'aprobado' 
    AND fecha_fin IS NOT NULL 
    AND fecha_fin <= CURRENT_DATE + INTERVAL '7 days'
    AND fecha_fin >= CURRENT_DATE
  `;
  const membresiasPorVencer = parseInt(membresiasRows[0]?.count || '0');

  // Asistencia de hoy
  const { rows: asistenciaRows } = await sql`
    SELECT COUNT(*) as count 
    FROM asistencia 
    WHERE fecha = CURRENT_DATE
  `;
  const asistenciaHoy = parseInt(asistenciaRows[0]?.count || '0');

  return {
    miembrosActivos,
    ingresosMes,
    membresiasPorVencer,
    asistenciaHoy,
  };
}

export async function getMiembros(limit: number = 10): Promise<Miembro[]> {
  const { rows } = await sql`
    SELECT id, nombre, email, foto 
    FROM usuarios 
    WHERE rol = 'miembro' 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;
  return rows;
}

export async function getUltimosPagos(limit: number = 10): Promise<Pago[]> {
  const { rows } = await sql`
    SELECT p.id, p.usuario_id, p.monto, p.fecha_pago, p.estado,
           u.nombre as miembro_nombre, u.email as miembro_email
    FROM pagos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    ORDER BY p.fecha_pago DESC 
    LIMIT ${limit}
  `;
  
  return rows.map((p: any) => ({
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
}

export async function getMembresiasPorVencer(limit: number = 10): Promise<MembresiaPorVencer[]> {
  const { rows } = await sql`
    SELECT p.id, p.usuario_id, u.nombre as nombre_miembro, m.nombre as membresia,
           p.fecha_fin,
           EXTRACT(DAY FROM p.fecha_fin - CURRENT_DATE) as dias_restantes
    FROM pagos p
    LEFT JOIN usuarios u ON p.usuario_id = u.id
    LEFT JOIN miembros m ON p.membresia_id = m.id
    WHERE p.estado = 'aprobado' 
    AND p.fecha_fin IS NOT NULL 
    AND p.fecha_fin >= CURRENT_DATE
    AND p.fecha_fin <= CURRENT_DATE + INTERVAL '7 days'
    ORDER BY p.fecha_fin ASC 
    LIMIT ${limit}
  `;
  return rows;
}

export async function getAsistenciaPorDia(): Promise<AsistenciaDia[]> {
  const { rows } = await sql`
    SELECT 
      TO_CHAR(fecha, 'Day') as dia,
      COUNT(*) as count
    FROM asistencia
    WHERE fecha >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY TO_CHAR(fecha, 'Day')
    ORDER BY MIN(fecha)
  `;
  
  // Asegurar que todos los días estén representados
  const diasOrden = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const asistenciaMap = new Map(rows.map((a: any) => [a.dia.trim(), parseInt(a.count)]));
  const diasCompletos: AsistenciaDia[] = diasOrden.map(dia => ({
    dia,
    count: asistenciaMap.get(dia) || 0,
  }));
  
  return diasCompletos;
}
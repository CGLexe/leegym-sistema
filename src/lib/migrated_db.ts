import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// ============================================
// INTERFACES (mismo que el original)
// ============================================

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: 'admin' | 'trainer' | 'miembro' | 'mantenimiento';
  foto?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  condicion_medica?: string;
  contacto_emergencia?: string;
  created_at: string;
  updated_at: string;
}

export interface Membresia {
  id: string;
  nombre: string;
  precio: number;
  duracion_dias: number;
  descripcion?: string;
  activo: number;
  created_at: string;
}

// ============================================
// FUNCIONES DE BASE DE DATOS (async)
// ============================================

export async function initializeDb(): Promise<void> {
  // Tabla usuarios
  await sql`
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('admin', 'trainer', 'miembro', 'mantenimiento')),
      foto TEXT,
      telefono TEXT,
      fecha_nacimiento TEXT,
      condicion_medica TEXT,
      contacto_emergencia TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Tabla membresías
  await sql`
    CREATE TABLE IF NOT EXISTS membresias (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      duracion_dias INTEGER NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Tabla pagos
  await sql`
    CREATE TABLE IF NOT EXISTS pagos (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      membresia_id TEXT,
      monto REAL NOT NULL,
      metodo TEXT NOT NULL,
      fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      fecha_inicio TEXT,
      fecha_fin TEXT,
      estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'aprobado', 'rechazado', 'vencido')),
      referencia TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (membresia_id) REFERENCES membresias(id)
    )
  `;

  // Tabla asistencia
  await sql`
    CREATE TABLE IF NOT EXISTS asistencia (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora_entrada TEXT,
      hora_salida TEXT,
      registrado_por TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `;

  // Tabla clases
  await sql`
    CREATE TABLE IF NOT EXISTS clases (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      horario_inicio TEXT NOT NULL,
      horario_fin TEXT NOT NULL,
      dia_semana TEXT NOT NULL CHECK(dia_semana IN ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
      trainer_id TEXT,
      capacidad INTEGER DEFAULT 20,
      enabled INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trainer_id) REFERENCES usuarios(id)
    )
  `;

  // Tabla reservas
  await sql`
    CREATE TABLE IF NOT EXISTS reservas (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      clase_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      estado TEXT NOT NULL CHECK(estado IN ('confirmada', 'cancelada', 'asistio', 'no_asistio')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (clase_id) REFERENCES clases(id)
    )
  `;

  // Tabla configuraciones
  await sql`
    CREATE TABLE IF NOT EXISTS configuraciones (
      id TEXT PRIMARY KEY,
      clave TEXT UNIQUE NOT NULL,
      valor TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Insertar membresías por defecto
  const membresias = [
    { id: 'mensual', nombre: 'Mensual', precio: 350, duracion_dias: 30, descripcion: 'Membresía mensual completa' },
    { id: 'trimestral', nombre: 'Trimestral', precio: 900, duracion_dias: 90, descripcion: 'Membresía trimestral con descuento' },
    { id: 'anual', nombre: 'Anual', precio: 3000, duracion_dias: 365, descripcion: 'Membresía anual completa' },
    { id: 'pase_dia', nombre: 'Pase Día', precio: 80, duracion_dias: 1, descripcion: 'Acceso por un día' }
  ];

  for (const m of membresias) {
    await sql`
      INSERT INTO membresias (id, nombre, precio, duracion_dias, descripcion)
      VALUES (${m.id}, ${m.nombre}, ${m.precio}, ${m.duracion_dias}, ${m.descripcion})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  // Insertar usuarios por defecto
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const trainerPasswordHash = bcrypt.hashSync('trainer123', 10);
  const miembroPasswordHash = bcrypt.hashSync('miembro123', 10);

  await sql`
    INSERT INTO usuarios (id, nombre, email, password_hash, rol)
    VALUES ('admin', 'Administrador', 'admin@leegym.com', ${adminPasswordHash}, 'admin')
    ON CONFLICT (id) DO NOTHING
  `;
  
  await sql`
    INSERT INTO usuarios (id, nombre, email, password_hash, rol)
    VALUES ('trainer', 'Entrenador Demo', 'trainer@leegym.com', ${trainerPasswordHash}, 'trainer')
    ON CONFLICT (id) DO NOTHING
  `;
  
  await sql`
    INSERT INTO usuarios (id, nombre, email, password_hash, rol)
    VALUES ('miembro', 'Miembro Demo', 'miembro@leegym.com', ${miembroPasswordHash}, 'miembro')
    ON CONFLICT (id) DO NOTHING
  `;

  console.log('Base de datos Vercel Postgres inicializada');
}

// Funciones helper
export async function getUsuarioByEmail(email: string) {
  const { rows } = await sql`SELECT * FROM usuarios WHERE email = ${email}`;
  return rows[0] || null;
}

export async function getUsuarioById(id: string) {
  const { rows } = await sql`SELECT * FROM usuarios WHERE id = ${id}`;
  return rows[0] || null;
}

export async function verificarPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

export async function getMembresias() {
  const { rows } = await sql`SELECT * FROM membresias WHERE activo = 1`;
  return rows;
}

export async function getClases() {
  const { rows } = await sql`SELECT * FROM clases WHERE enabled = 1`;
  return rows;
}

export async function getConfiguracion(clave: string) {
  const { rows } = await sql`SELECT valor FROM configuraciones WHERE clave = ${clave}`;
  return rows[0]?.valor || null;
}

export async function setConfiguracion(clave: string, valor: string) {
  await sql`
    INSERT INTO configuraciones (id, clave, valor)
    VALUES (${clave}, ${clave}, ${valor})
    ON CONFLICT (clave) DO UPDATE SET valor = ${valor}, updated_at = CURRENT_TIMESTAMP
  `;
}

// Función helper para generar UUID
export function generateId(): string {
  return uuidv4();
}
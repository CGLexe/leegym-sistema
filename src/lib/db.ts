import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

// Tipos para TypeScript
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

// Función para crear cliente de base de datos
function createDbClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no está configurada');
  }
  return neon(connectionString);
}

// Wrapper compatible con better-sqlite3 - retorna any para compatibilidad total
class NeonDbWrapper {
  private connectionString: string;
  
  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }
  
  // Convertir query normal a template string para Neon
  private toTemplate(sql: string, params: any[]) {
    // Reemplazar ? por $1, $2, etc
    let query = sql;
    let paramIndex = 1;
    for (const p of params) {
      query = query.replace('?', `${paramIndex}`);
      paramIndex++;
    }
    return [query, ...params];
  }
  
  prepare(sql: string) {
    const db = neon(this.connectionString);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      run: (...params: any[]) => {
        const [query, ...p] = this.toTemplate(sql, params);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db(query, p).then(() => ({ changes: 1, lastInsertRowid: '0' })) as any;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (...params: any[]) => {
        const [query, ...p] = this.toTemplate(sql, params);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db(query, p).then((rows: any) => rows[0] || null) as any;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      all: (...params: any[]) => {
        const [query, ...p] = this.toTemplate(sql, params);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return db(query, p).then((rows: any) => rows) as any;
      },
    };
  }
  
  exec(_sql: string) {
    return Promise.resolve();
  }
  
  close() {
    // Neon no necesita cierre
  }
}

let dbInstance: NeonDbWrapper | null = null;

// Obtener conexión a la base de datos
export function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL no está configurada');
    }
    dbInstance = new NeonDbWrapper(connectionString);
  }
  return dbInstance;
}

// Alias público para función sql de Neon
export async function sql(query: string, values: any[] = []) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no está configurada');
  }
  const db = neon(connectionString);
  return (db as any)(query, values);
}

// Inicializar la base de datos
export async function initializeDb(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL no está configurada');
  }
  const db = neon(connectionString);

  // Tabla usuarios
  await db`CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY, nombre TEXT NOT NULL, email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, rol TEXT NOT NULL, foto TEXT, telefono TEXT,
    fecha_nacimiento TEXT, condicion_medica TEXT, contacto_emergencia TEXT,
    created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
  )`;

  // Tabla membresías
  await db`CREATE TABLE IF NOT EXISTS membresias (
    id TEXT PRIMARY KEY, nombre TEXT NOT NULL, precio REAL NOT NULL,
    duracion_dias INTEGER NOT NULL, descripcion TEXT, activo INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  // Tabla pagos
  await db`CREATE TABLE IF NOT EXISTS pagos (
    id TEXT PRIMARY KEY, usuario_id TEXT NOT NULL, membresia_id TEXT, monto REAL NOT NULL,
    metodo TEXT NOT NULL, fecha_pago TIMESTAMP DEFAULT NOW(), fecha_inicio TEXT, fecha_fin TEXT,
    estado TEXT NOT NULL, referencia TEXT, created_at TIMESTAMP DEFAULT NOW()
  )`;

  // Tabla asistencia
  await db`CREATE TABLE IF NOT EXISTS asistencia (
    id TEXT PRIMARY KEY, usuario_id TEXT NOT NULL, fecha TEXT NOT NULL,
    hora_entrada TEXT, hora_salida TEXT, registrado_por TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )`;

  // Tabla clases
  await db`CREATE TABLE IF NOT EXISTS clases (
    id TEXT PRIMARY KEY, nombre TEXT NOT NULL, descripcion TEXT,
    horario_inicio TEXT NOT NULL, horario_fin TEXT NOT NULL,
    dia_semana TEXT NOT NULL, trainer_id TEXT, capacidad INTEGER DEFAULT 20,
    enabled INTEGER DEFAULT 1, created_at TIMESTAMP DEFAULT NOW()
  )`;

  // Tabla configuraciones
  await db`CREATE TABLE IF NOT EXISTS configuraciones (
    id TEXT PRIMARY KEY, clave TEXT UNIQUE NOT NULL, valor TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
  )`;

  // Insertar membresías por defecto
  const membresias = [
    { id: 'mensual', nombre: 'Mensual', precio: 350, duracion_dias: 30, descripcion: 'Membresía mensual completa' },
    { id: 'trimestral', nombre: 'Trimestral', precio: 900, duracion_dias: 90, descripcion: 'Membresía trimestral' },
    { id: 'anual', nombre: 'Anual', precio: 3000, duracion_dias: 365, descripcion: 'Membresía anual' },
    { id: 'pase_dia', nombre: 'Pase Día', precio: 80, duracion_dias: 1, descripcion: 'Acceso por un día' }
  ];

  for (const m of membresias) {
    await db`INSERT INTO membresias (id, nombre, precio, duracion_dias, descripcion) VALUES (${m.id}, ${m.nombre}, ${m.precio}, ${m.duracion_dias}, ${m.descripcion}) ON CONFLICT (id) DO NOTHING`;
  }

  // Insertar usuarios por defecto
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const trainerPasswordHash = bcrypt.hashSync('trainer123', 10);
  const miembroPasswordHash = bcrypt.hashSync('miembro123', 10);

  await db`INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES ('admin', 'Administrador', 'admin@leegym.com', ${adminPasswordHash}, 'admin') ON CONFLICT (id) DO NOTHING`;
  await db`INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES ('trainer', 'Entrenador Demo', 'trainer@leegym.com', ${trainerPasswordHash}, 'trainer') ON CONFLICT (id) DO NOTHING`;
  await db`INSERT INTO usuarios (id, nombre, email, password_hash, rol) VALUES ('miembro', 'Miembro Demo', 'miembro@leegym.com', ${miembroPasswordHash}, 'miembro') ON CONFLICT (id) DO NOTHING`;

  console.log('Neon database initialized');
}

// Helper functions - usan getDb() para compatibilidad
export async function getUsuarioByEmail(email: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
  return stmt.get(email) as Usuario | null;
}

export async function getUsuarioById(id: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM usuarios WHERE id = ?');
  return stmt.get(id) as Usuario | null;
}

export function verificarPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

export async function getMembresias() {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM membresias WHERE activo = 1');
  return stmt.all() as Membresia[];
}

export async function getClases() {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM clases WHERE enabled = 1');
  return stmt.all() as any[];
}

export async function getConfiguracion(clave: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT valor FROM configuraciones WHERE clave = ?');
  const result = stmt.get(clave);
  return result?.valor;
}

export async function setConfiguracion(clave: string, valor: string) {
  const db = getDb();
  const stmt = db.prepare('INSERT INTO configuraciones (id, clave, valor) VALUES (?, ?, ?) ON CONFLICT(id) DO UPDATE SET valor = ?');
  return stmt.run(clave, clave, valor, valor);
}
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

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

// Usar variable de entorno o ruta fija para la base de datos
const DB_PATH = process.env.DB_PATH || './leegym.db';

// Obtener conexión a la base de datos
export function getDb(): Database.Database {
  return new Database(DB_PATH);
}

// Inicializar la base de datos con todas las tablas y datos iniciales
export function initializeDb(): void {
  const db = getDb();

  // Crear tabla de usuarios
  db.exec(`
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
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Crear tabla de membresías
  db.exec(`
    CREATE TABLE IF NOT EXISTS membresias (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      duracion_dias INTEGER NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Crear tabla de pagos
  db.exec(`
    CREATE TABLE IF NOT EXISTS pagos (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      membresia_id TEXT,
      monto REAL NOT NULL,
      metodo TEXT NOT NULL,
      fecha_pago TEXT DEFAULT (datetime('now')),
      fecha_inicio TEXT,
      fecha_fin TEXT,
      estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'aprobado', 'rechazado', 'vencido')),
      referencia TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (membresia_id) REFERENCES membresias(id)
    )
  `);

  // Crear tabla de asistencia
  db.exec(`
    CREATE TABLE IF NOT EXISTS asistencia (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      hora_entrada TEXT,
      hora_salida TEXT,
      registrado_por TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Crear tabla de clases
  db.exec(`
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
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (trainer_id) REFERENCES usuarios(id)
    )
  `);

  // Crear tabla de reservas
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservas (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      clase_id TEXT NOT NULL,
      fecha TEXT NOT NULL,
      estado TEXT NOT NULL CHECK(estado IN ('confirmada', 'cancelada', 'asistio', 'no_asistio')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (clase_id) REFERENCES clases(id)
    )
  `);

  // Crear tabla de productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      stock INTEGER DEFAULT 0,
      imagen TEXT,
      activo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Crear tabla de rutinas
  db.exec(`
    CREATE TABLE IF NOT EXISTS rutinas (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      trainer_id TEXT,
      nombre TEXT NOT NULL,
      ejercicios_json TEXT,
      fecha_inicio TEXT,
      fecha_fin TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (trainer_id) REFERENCES usuarios(id)
    )
  `);

  // Crear tabla de progreso
  db.exec(`
    CREATE TABLE IF NOT EXISTS progreso (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      peso REAL,
      medidas_json TEXT,
      foto TEXT,
      notas TEXT,
      fecha TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Crear tabla de configuraciones
  db.exec(`
    CREATE TABLE IF NOT EXISTS configuraciones (
      id TEXT PRIMARY KEY,
      clave TEXT UNIQUE NOT NULL,
      valor TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Crear tabla de notificaciones
  db.exec(`
    CREATE TABLE IF NOT EXISTS notificaciones (
      id TEXT PRIMARY KEY,
      titulo TEXT NOT NULL,
      mensaje TEXT NOT NULL,
      tipo TEXT NOT NULL CHECK(tipo IN ('info', 'alerta', 'urgente', 'promocion')),
      destinatario_id TEXT,
      enviado_por TEXT NOT NULL,
      canal TEXT DEFAULT 'app',
      leida INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (destinatario_id) REFERENCES usuarios(id),
      FOREIGN KEY (enviado_por) REFERENCES usuarios(id)
    )
  `);

  // Crear tabla de promociones
  db.exec(`
    CREATE TABLE IF NOT EXISTS promociones (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      tipo TEXT NOT NULL CHECK(tipo IN ('porcentaje', 'monto_fijo', 'dias_gratis')),
      valor REAL NOT NULL,
      codigo TEXT UNIQUE,
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      usos_maximos INTEGER DEFAULT 0,
      usos_actuales INTEGER DEFAULT 0,
      activo INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Crear tabla de ventas
  db.exec(`
    CREATE TABLE IF NOT EXISTS ventas (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      producto_id TEXT NOT NULL,
      cantidad INTEGER DEFAULT 1,
      precio_total REAL NOT NULL,
      metodo_pago TEXT,
      estado TEXT DEFAULT 'completada',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    )
  `);

  // Crear tabla de equipos
  db.exec(`
    CREATE TABLE IF NOT EXISTS equipos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      ubicacion TEXT,
      estado TEXT DEFAULT 'operativo' CHECK(estado IN ('operativo', 'mantenimiento', 'fuera_servicio')),
      ultimo_mantenimiento TEXT,
      proximo_mantenimiento TEXT,
      responsable_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (responsable_id) REFERENCES usuarios(id)
    )
  `);

  // Crear tabla de blog_posts
  db.exec(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id TEXT PRIMARY KEY,
      usuario_id TEXT NOT NULL,
      titulo TEXT NOT NULL,
      contenido TEXT NOT NULL,
      imagen TEXT,
      visible INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  // Insertar membresías por defecto
  const membresias = [
    { id: 'mensual', nombre: 'Mensual', precio: 350, duracion_dias: 30, descripcion: 'Membresía mensual completa' },
    { id: 'trimestral', nombre: 'Trimestral', precio: 900, duracion_dias: 90, descripcion: 'Membresía trimestral con descuento' },
    { id: 'anual', nombre: 'Anual', precio: 3000, duracion_dias: 365, descripcion: 'Membresía anual completa' },
    { id: 'pase_dia', nombre: 'Pase Día', precio: 80, duracion_dias: 1, descripcion: 'Acceso por un día' }
  ];

  const insertMembresia = db.prepare(`
    INSERT OR IGNORE INTO membresias (id, nombre, precio, duracion_dias, descripcion)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const m of membresias) {
    insertMembresia.run(m.id, m.nombre, m.precio, m.duracion_dias, m.descripcion);
  }

  // Insertar usuarios por defecto con hashes de contraseñas
  // Password: admin123
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  // Password: trainer123
  const trainerPasswordHash = bcrypt.hashSync('trainer123', 10);
  // Password: miembro123
  const miembroPasswordHash = bcrypt.hashSync('miembro123', 10);

  const insertUsuario = db.prepare(`
    INSERT OR IGNORE INTO usuarios (id, nombre, email, password_hash, rol)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertUsuario.run('admin', 'Administrador', 'admin@leegym.com', adminPasswordHash, 'admin');
  insertUsuario.run('trainer', 'Entrenador Demo', 'trainer@leegym.com', trainerPasswordHash, 'trainer');
  insertUsuario.run('miembro', 'Miembro Demo', 'miembro@leegym.com', miembroPasswordHash, 'miembro');

  db.close();
  console.log('Base de datos inicializada correctamente');
}

// Exportar funciones helper adicionales
export function getUsuarioByEmail(email: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM usuarios WHERE email = ?');
  const usuario = stmt.get(email);
  db.close();
  return usuario;
}

export function getUsuarioById(id: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM usuarios WHERE id = ?');
  const usuario = stmt.get(id);
  db.close();
  return usuario;
}

export function verificarPassword(password: string, passwordHash: string): boolean {
  return bcrypt.compareSync(password, passwordHash);
}

export function getMembresias() {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM membresias WHERE activo = 1');
  const membresias = stmt.all();
  db.close();
  return membresias;
}

export function getClases() {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM clases WHERE enabled = 1');
  const clases = stmt.all();
  db.close();
  return clases;
}

export function getConfiguracion(clave: string) {
  const db = getDb();
  const stmt = db.prepare('SELECT valor FROM configuraciones WHERE clave = ?');
  const config = stmt.get(clave) as { valor: string } | undefined;
  db.close();
  return config?.valor;
}

export function setConfiguracion(clave: string, valor: string) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO configuraciones (id, clave, valor)
    VALUES (?, ?, ?)
    ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor, updated_at = datetime('now')
  `);
  stmt.run(clave, clave, valor);
  db.close();
}
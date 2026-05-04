import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    
    const filtro = searchParams.get("filtro") || "todos";
    const busqueda = searchParams.get("busqueda") || "";

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
    
    // Filtros
    if (filtro === "activos") {
      query += ` AND p.estado = 'aprobado' AND p.fecha_fin >= date('now')`;
    } else if (filtro === "vencidos") {
      query += ` AND (p.estado != 'aprobado' OR p.fecha_fin < date('now') OR p.fecha_fin IS NULL)`;
    } else if (filtro === "por_vencer") {
      query += ` AND p.estado = 'aprobado' AND p.fecha_fin <= date('now', '+7 days') AND p.fecha_fin >= date('now')`;
    }
    
    // Búsqueda
    if (busqueda) {
      query += ` AND (u.nombre LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ` ORDER BY u.nombre ASC`;

    const stmt = db.prepare(query);
    const miembros = stmt.all(...params) as any[];
    
    // Procesar resultados y agregar info de membresía
    const miembrosFormateados = miembros.map((m) => {
      let membresiaInfo = null;
      
      if (m.pago_id && m.fecha_fin) {
        const diasRestantes = Math.floor(
          (new Date(m.fecha_fin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );
        
        let estado = "activa";
        if (diasRestantes < 0) {
          estado = "vencida";
        } else if (diasRestantes <= 7) {
          estado = "por_vencer";
        }
        
        if (m.pago_estado === "aprobado") {
          membresiaInfo = {
            id: m.pago_id,
            membresia_id: m.membresia_id,
            nombre: m.membresia_nombre || "Sin membresía",
            fecha_inicio: m.fecha_inicio,
            fecha_fin: m.fecha_fin,
            dias_restantes: diasRestantes,
            estado,
          };
        }
      }
      
      return {
        id: m.id,
        nombre: m.nombre,
        email: m.email,
        telefono: m.telefono,
        foto: m.foto,
        fecha_nacimiento: m.fecha_nacimiento,
        condicion_medica: m.condicion_medica,
        contacto_emergencia: m.contacto_emergencia,
        created_at: m.created_at,
        membresia: membresiaInfo,
      };
    });

    db.close();
    
    return NextResponse.json(miembrosFormateados);
  } catch (error) {
    console.error("Error getting miembros:", error);
    return NextResponse.json(
      { error: "Error al obtener miembros" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      email,
      telefono,
      foto,
      fecha_nacimiento,
      condicion_medica,
      contacto_emergencia,
    } = body;

    // Validar campos requeridos
    if (!nombre || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar email único
    const checkEmail = db.prepare("SELECT id FROM usuarios WHERE email = ?");
    const existingEmail = checkEmail.get(email);
    if (existingEmail) {
      db.close();
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync("password123", 10); // Password por defecto

    const stmt = db.prepare(`
      INSERT INTO usuarios (id, nombre, email, password_hash, rol, telefono, foto, fecha_nacimiento, condicion_medica, contacto_emergencia)
      VALUES (?, ?, ?, ?, 'miembro', ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      nombre,
      email,
      passwordHash,
      telefono || null,
      foto || null,
      fecha_nacimiento || null,
      condicion_medica || null,
      contacto_emergencia || null
    );

    // Obtener el miembro creado
    const getMiembro = db.prepare("SELECT * FROM usuarios WHERE id = ?");
    const nuevoMiembro = getMiembro.get(id);

    db.close();

    return NextResponse.json(nuevoMiembro, { status: 201 });
  } catch (error) {
    console.error("Error creating miembro:", error);
    return NextResponse.json(
      { error: "Error al crear miembro" },
      { status: 500 }
    );
  }
}
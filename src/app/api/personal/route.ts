import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const rol = searchParams.get("rol");

    let query = "SELECT id, nombre, email, rol, telefono, foto, created_at FROM usuarios WHERE rol != 'miembro'";
    const params: any[] = [];

    if (rol) {
      query += " AND rol = ?";
      params.push(rol);
    }
    
    query += " ORDER BY nombre ASC";

    const stmt = db.prepare(query);
    const personal = stmt.all(...params);

    db.close();

    return NextResponse.json(personal);
  } catch (error) {
    console.error("Error getting personal:", error);
    return NextResponse.json(
      { error: "Error al obtener personal" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, password, rol, telefono, foto } = body;

    if (!nombre || !email || !password || !rol) {
      return NextResponse.json(
        { error: "Nombre, email, contraseña y rol son requeridos" },
        { status: 400 }
      );
    }

    if (!['admin', 'trainer', 'mantenimiento'].includes(rol)) {
      return NextResponse.json(
        { error: "Rol inválido" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Check email
    const checkEmail = db.prepare("SELECT id FROM usuarios WHERE email = ?");
    if (checkEmail.get(email)) {
      db.close();
      return NextResponse.json(
        { error: "El email ya está en uso" },
        { status: 400 }
      );
    }

    const id = uuidv4();
    const passwordHash = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(`
      INSERT INTO usuarios (id, nombre, email, password_hash, rol, telefono, foto)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, nombre, email, passwordHash, rol, telefono || null, foto || null);

    const getPersonal = db.prepare("SELECT id, nombre, email, rol, telefono, foto, created_at FROM usuarios WHERE id = ?");
    const nuevoPersonal = getPersonal.get(id);

    db.close();

    return NextResponse.json(nuevoPersonal, { status: 201 });
  } catch (error) {
    console.error("Error creating personal:", error);
    return NextResponse.json(
      { error: "Error al crear personal" },
      { status: 500 }
    );
  }
}

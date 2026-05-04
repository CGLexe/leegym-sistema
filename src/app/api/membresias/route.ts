import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const db = getDb();
    const stmt = db.prepare("SELECT * FROM membresias ORDER BY precio ASC");
    const membresias = stmt.all();
    db.close();
    
    return NextResponse.json(membresias);
  } catch (error) {
    console.error("Error getting membresías:", error);
    return NextResponse.json(
      { error: "Error al obtener membresías" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, precio, duracion_dias, descripcion } = body;

    // Validar campos requeridos
    if (!nombre || !precio || !duracion_dias) {
      return NextResponse.json(
        { error: "Nombre, precio y duración son requeridos" },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO membresias (id, nombre, precio, duracion_dias, descripcion)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, nombre, precio, duracion_dias, descripcion || null);

    // Obtener la membresía creada
    const getMembresia = db.prepare("SELECT * FROM membresias WHERE id = ?");
    const nuevaMembresia = getMembresia.get(id);

    db.close();

    return NextResponse.json(nuevaMembresia, { status: 201 });
  } catch (error) {
    console.error("Error creating membresía:", error);
    return NextResponse.json(
      { error: "Error al crear membresía" },
      { status: 500 }
    );
  }
}
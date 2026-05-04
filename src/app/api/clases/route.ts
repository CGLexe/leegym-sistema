import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    
    // Unimos con la tabla de usuarios para obtener el nombre del entrenador
    const query = `
      SELECT c.*, u.nombre as trainer_nombre 
      FROM clases c
      LEFT JOIN usuarios u ON c.trainer_id = u.id
      WHERE c.enabled = 1
      ORDER BY 
        CASE c.dia_semana 
          WHEN 'lunes' THEN 1
          WHEN 'martes' THEN 2
          WHEN 'miercoles' THEN 3
          WHEN 'jueves' THEN 4
          WHEN 'viernes' THEN 5
          WHEN 'sabado' THEN 6
          WHEN 'domingo' THEN 7
        END ASC, 
        c.horario_inicio ASC
    `;
    
    const stmt = db.prepare(query);
    const clases = stmt.all() as any[];
    
    db.close();
    
    return NextResponse.json(clases);
  } catch (error) {
    console.error("Error getting clases:", error);
    return NextResponse.json(
      { error: "Error al obtener clases" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nombre,
      descripcion,
      horario_inicio,
      horario_fin,
      dia_semana,
      trainer_id,
      capacidad
    } = body;

    if (!nombre || !horario_inicio || !horario_fin || !dia_semana) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const db = getDb();
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO clases (id, nombre, descripcion, horario_inicio, horario_fin, dia_semana, trainer_id, capacidad)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      nombre,
      descripcion || null,
      horario_inicio,
      horario_fin,
      dia_semana,
      trainer_id || null,
      capacidad || 20
    );

    const getClase = db.prepare(\`
      SELECT c.*, u.nombre as trainer_nombre 
      FROM clases c
      LEFT JOIN usuarios u ON c.trainer_id = u.id
      WHERE c.id = ?
    \`);
    
    const nuevaClase = getClase.get(id);

    db.close();

    return NextResponse.json(nuevaClase, { status: 201 });
  } catch (error) {
    console.error("Error creating clase:", error);
    return NextResponse.json(
      { error: "Error al crear la clase" },
      { status: 500 }
    );
  }
}

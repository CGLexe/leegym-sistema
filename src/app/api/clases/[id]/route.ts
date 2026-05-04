import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const {
      nombre,
      descripcion,
      horario_inicio,
      horario_fin,
      dia_semana,
      trainer_id,
      capacidad,
      enabled
    } = body;

    const db = getDb();
    
    // Preparar campos a actualizar
    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push("nombre = ?");
      values.push(nombre);
    }
    if (descripcion !== undefined) {
      updates.push("descripcion = ?");
      values.push(descripcion);
    }
    if (horario_inicio !== undefined) {
      updates.push("horario_inicio = ?");
      values.push(horario_inicio);
    }
    if (horario_fin !== undefined) {
      updates.push("horario_fin = ?");
      values.push(horario_fin);
    }
    if (dia_semana !== undefined) {
      updates.push("dia_semana = ?");
      values.push(dia_semana);
    }
    if (trainer_id !== undefined) {
      updates.push("trainer_id = ?");
      values.push(trainer_id);
    }
    if (capacidad !== undefined) {
      updates.push("capacidad = ?");
      values.push(capacidad);
    }
    if (enabled !== undefined) {
      updates.push("enabled = ?");
      values.push(enabled ? 1 : 0);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No hay campos para actualizar" },
        { status: 400 }
      );
    }

    values.push(id);

    const query = `UPDATE clases SET ${updates.join(", ")} WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...values);

    const getClase = db.prepare(\`
      SELECT c.*, u.nombre as trainer_nombre 
      FROM clases c
      LEFT JOIN usuarios u ON c.trainer_id = u.id
      WHERE c.id = ?
    \`);
    
    const claseActualizada = getClase.get(id);

    db.close();

    if (!claseActualizada) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(claseActualizada);
  } catch (error) {
    console.error("Error updating clase:", error);
    return NextResponse.json(
      { error: "Error al actualizar la clase" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const db = getDb();

    // En lugar de borrar físicamente, podemos deshabilitarla
    const stmt = db.prepare("UPDATE clases SET enabled = 0 WHERE id = ?");
    const info = stmt.run(id);

    db.close();

    if (info.changes === 0) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Clase eliminada/deshabilitada" });
  } catch (error) {
    console.error("Error deleting clase:", error);
    return NextResponse.json(
      { error: "Error al eliminar la clase" },
      { status: 500 }
    );
  }
}

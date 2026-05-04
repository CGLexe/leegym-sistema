import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre, precio, duracion_dias, descripcion, activo } = body;

    const db = getDb();

    // Verificar que existe la membresía
    const check = db.prepare("SELECT id FROM membresias WHERE id = ?");
    const existing = check.get(id);

    if (!existing) {
      db.close();
      return NextResponse.json(
        { error: "Membresía no encontrada" },
        { status: 404 }
      );
    }

    const stmt = db.prepare(`
      UPDATE membresias 
      SET nombre = ?, precio = ?, duracion_dias = ?, descripcion = ?, activo = ?
      WHERE id = ?
    `);

    stmt.run(
      nombre,
      precio,
      duracion_dias,
      descripcion || null,
      activo !== undefined ? activo : 1,
      id
    );

    // Obtener la membresía actualizada
    const getMembresia = db.prepare("SELECT * FROM membresias WHERE id = ?");
    const membresiaActualizada = getMembresia.get(id);

    db.close();

    return NextResponse.json(membresiaActualizada);
  } catch (error) {
    console.error("Error updating membresía:", error);
    return NextResponse.json(
      { error: "Error al actualizar membresía" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const db = getDb();

    // Verificar que existe la membresía
    const check = db.prepare("SELECT id FROM membresias WHERE id = ?");
    const existing = check.get(id);

    if (!existing) {
      db.close();
      return NextResponse.json(
        { error: "Membresía no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar membresía
    const stmt = db.prepare("DELETE FROM membresias WHERE id = ?");
    stmt.run(id);

    db.close();

    return NextResponse.json({ message: "Membresía eliminada correctamente" });
  } catch (error) {
    console.error("Error deleting membresía:", error);
    return NextResponse.json(
      { error: "Error al eliminar membresía" },
      { status: 500 }
    );
  }
}
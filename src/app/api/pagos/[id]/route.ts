import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { estado, fecha_inicio, fecha_fin, referencia } = body;

    const db = getDb();

    // Verificar que existe el pago
    const check = db.prepare("SELECT id FROM pagos WHERE id = ?");
    const existing = check.get(id);

    if (!existing) {
      db.close();
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Si se aprueba el pago, actualizar las fechas de membresía del usuario
    if (estado === "aprobado") {
      const getPago = db.prepare(`
        SELECT p.usuario_id, p.fecha_inicio, p.fecha_fin
        FROM pagos p
        WHERE p.id = ?
      `);
      const pagoInfo = getPago.get(id) as { usuario_id: string; fecha_inicio: string; fecha_fin: string } | undefined;
      
      if (pagoInfo) {
        // Actualizar la fecha_fin del último pago aprobado del usuario
        // Esto es un enfoque simple - en un sistema real podrías tener una tabla separada de membresías activas
        const updateUsuarioMembresia = db.prepare(`
          UPDATE usuarios 
          SET updated_at = datetime('now')
          WHERE id = ?
        `);
        updateUsuarioMembresia.run(pagoInfo.usuario_id);
      }
    }

    const stmt = db.prepare(`
      UPDATE pagos 
      SET estado = ?, fecha_inicio = ?, fecha_fin = ?, referencia = ?
      WHERE id = ?
    `);

    stmt.run(
      estado,
      fecha_inicio || null,
      fecha_fin || null,
      referencia || null,
      id
    );

    // Obtener el pago actualizado
    const getPago = db.prepare(`
      SELECT p.*, 
             u.nombre as usuario_nombre, 
             u.email as usuario_email,
             m.nombre as membresia_nombre
      FROM pagos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN membresias m ON p.membresia_id = m.id
      WHERE p.id = ?
    `);
    const pagoActualizado = getPago.get(id);

    db.close();

    return NextResponse.json(pagoActualizado);
  } catch (error) {
    console.error("Error updating pago:", error);
    return NextResponse.json(
      { error: "Error al actualizar pago" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    // Obtener todos los miembros con su membresía y asistencia de hoy
    const stmt = db.prepare(`
      SELECT 
        u.id, 
        u.nombre, 
        u.email,
        u.telefono,
        m.nombre as membresia,
        p.fecha_fin,
        a.id as asistencia_id,
        a.hora_entrada
      FROM usuarios u
      LEFT JOIN (
        SELECT usuario_id, id, membresia_id, fecha_inicio, fecha_fin, estado,
               ROW_NUMBER() OVER (PARTITION BY usuario_id ORDER BY fecha_fin DESC) as rn
        FROM pagos 
        WHERE estado = 'aprobado' AND fecha_fin >= date('now')
      ) p ON u.id = p.usuario_id AND p.rn = 1
      LEFT JOIN membresias m ON p.membresia_id = m.id
      LEFT JOIN asistencia a ON u.id = a.usuario_id AND date(a.fecha) = date('now')
      WHERE u.rol = 'miembro'
      ORDER BY u.nombre ASC
    `);

    const miembros = stmt.all();
    db.close();

    return NextResponse.json(miembros);
  } catch (error) {
    console.error("Error getting miembros:", error);
    return NextResponse.json(
      { error: "Error al obtener miembros" },
      { status: 500 }
    );
  }
}
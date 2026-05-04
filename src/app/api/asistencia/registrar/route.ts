import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usuarioId } = body;

    if (!usuarioId) {
      return NextResponse.json(
        { error: "ID de usuario requerido" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar si ya tiene entrada hoy
    const checkStmt = db.prepare(`
      SELECT id, hora_entrada FROM asistencia 
      WHERE usuario_id = ? AND date(fecha) = date('now')
    `);
    const existente = checkStmt.get(usuarioId) as { id: string; hora_entrada: string } | undefined;

    if (existente) {
      // Eliminar entrada existente
      const deleteStmt = db.prepare("DELETE FROM asistencia WHERE id = ?");
      deleteStmt.run(existente.id);
      db.close();
      return NextResponse.json({ success: true, action: "removed" });
    }

    // Verificar que el usuario existe y es miembro
    const userStmt = db.prepare("SELECT nombre FROM usuarios WHERE id = ? AND rol = 'miembro'");
    const usuario = userStmt.get(usuarioId) as { nombre: string } | undefined;

    if (!usuario) {
      db.close();
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Registrar nueva entrada
    const id = uuidv4();
    const now = new Date();
    const fecha = now.toISOString().split("T")[0];
    const horaEntrada = now.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const insertStmt = db.prepare(`
      INSERT INTO asistencia (id, usuario_id, fecha, hora_entrada)
      VALUES (?, ?, ?, ?)
    `);

    insertStmt.run(id, usuarioId, fecha, horaEntrada);
    db.close();

    return NextResponse.json({ success: true, action: "registered", hora: horaEntrada });
  } catch (error) {
    console.error("Error registering asistencia:", error);
    return NextResponse.json(
      { error: "Error al registrar asistencia" },
      { status: 500 }
    );
  }
}
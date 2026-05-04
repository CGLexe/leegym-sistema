import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Obtener un miembro por ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const db = getDb();

    const getMiembro = db.prepare(`
      SELECT * FROM usuarios WHERE id = ? AND rol = 'miembro'
    `);
    const miembro = getMiembro.get(id) as any;

    if (!miembro) {
      db.close();
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Obtener membresía activa
    const getMembresia = db.prepare(`
      SELECT p.id, p.membresia_id, m.nombre as membresia_nombre, 
             p.fecha_inicio, p.fecha_fin
      FROM pagos p
      LEFT JOIN membresias m ON p.membresia_id = m.id
      WHERE p.usuario_id = ? AND p.estado = 'aprobado' AND p.fecha_fin >= date('now')
      ORDER BY p.fecha_fin DESC
      LIMIT 1
    `);
    const membresia = getMembresia.get(id) as any;

    let membresiaInfo = null;
    if (membresia && membresia.fecha_fin) {
      const diasRestantes = Math.floor(
        (new Date(membresia.fecha_fin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      let estado = "activa";
      if (diasRestantes < 0) {
        estado = "vencida";
      } else if (diasRestantes <= 7) {
        estado = "por_vencer";
      }

      membresiaInfo = {
        ...membresia,
        dias_restantes: Math.max(0, diasRestantes),
        estado,
      };
    }

    // Obtener historial de pagos
    const getHistorialPagos = db.prepare(`
      SELECT p.*, m.nombre as membresia_nombre
      FROM pagos p
      LEFT JOIN membresias m ON p.membresia_id = m.id
      WHERE p.usuario_id = ?
      ORDER BY p.created_at DESC
      LIMIT 10
    `);
    const historialPagos = getHistorialPagos.all(id) as any[];

    // Obtener asistencia reciente
    const getAsistencia = db.prepare(`
      SELECT * FROM asistencia 
      WHERE usuario_id = ?
      ORDER BY fecha DESC, hora_entrada DESC
      LIMIT 20
    `);
    const asistencia = getAsistencia.all(id) as any[];

    db.close();

    return NextResponse.json({
      success: true,
      miembro: {
        ...miembro,
        membresia: membresiaInfo,
        historial_pagos: historialPagos,
        asistencia_reciente: asistencia,
      },
    });
  } catch (error) {
    console.error("Error getting miembro:", error);
    return NextResponse.json(
      { error: "Error al obtener miembro" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar miembro
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
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

    const db = getDb();

    // Verificar que el miembro existe
    const checkMiembro = db.prepare("SELECT * FROM usuarios WHERE id = ? AND rol = 'miembro'");
    const existingMiembro = checkMiembro.get(id) as any;
    if (!existingMiembro) {
      db.close();
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Verificar email único si se está cambiando
    if (email && email !== existingMiembro.email) {
      const checkEmail = db.prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
      const existingEmail = checkEmail.get(email, id);
      if (existingEmail) {
        db.close();
        return NextResponse.json(
          { error: "El email ya está en uso" },
          { status: 400 }
        );
      }
    }

    // Actualizar miembro
    const updateStmt = db.prepare(`
      UPDATE usuarios 
      SET nombre = ?, email = ?, telefono = ?, foto = ?, 
          fecha_nacimiento = ?, condicion_medica = ?, contacto_emergencia = ?,
          updated_at = datetime('now')
      WHERE id = ? AND rol = 'miembro'
    `);
    
    updateStmt.run(
      nombre || existingMiembro.nombre,
      email || existingMiembro.email,
      telefono || existingMiembro.telefono,
      foto || existingMiembro.foto,
      fecha_nacimiento || existingMiembro.fecha_nacimiento,
      condicion_medica || existingMiembro.condicion_medica,
      contacto_emergencia || existingMiembro.contacto_emergencia,
      id
    );
    
    db.close();
    
    return NextResponse.json({ success: true, message: 'Miembro actualizado' });
  } catch (error) {
    console.error("Error updating miembro:", error);
    return NextResponse.json(
      { error: "Error al actualizar miembro" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar miembro
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const db = getDb();

    // Verificar que el miembro existe
    const checkMiembro = db.prepare("SELECT * FROM usuarios WHERE id = ? AND rol = 'miembro'");
    const existingMiembro = checkMiembro.get(id) as any;

    if (!existingMiembro) {
      db.close();
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar miembro (soft delete - cambiamos el email para mantener integridad)
    const deleteStmt = db.prepare(`
      DELETE FROM usuarios WHERE id = ?
    `);
    deleteStmt.run(id);

    // También eliminar pagos y asistencia relacionados
    const deletePagos = db.prepare("DELETE FROM pagos WHERE usuario_id = ?");
    deletePagos.run(id);

    const deleteAsistencia = db.prepare("DELETE FROM asistencia WHERE usuario_id = ?");
    deleteAsistencia.run(id);

    db.close();

    return NextResponse.json({ success: true, message: 'Miembro eliminado' });
  } catch (error) {
    console.error("Error deleting miembro:", error);
    return NextResponse.json(
      { error: "Error al eliminar miembro" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { nombre, email, password, rol, telefono, foto } = body;

    const db = getDb();
    
    // Preparar campos a actualizar
    const updates = [];
    const values = [];

    if (nombre !== undefined) {
      updates.push("nombre = ?");
      values.push(nombre);
    }
    if (email !== undefined) {
      // Validar si el email existe en otro usuario
      const checkEmail = db.prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
      if (checkEmail.get(email, id)) {
        db.close();
        return NextResponse.json(
          { error: "El email ya está en uso por otro usuario" },
          { status: 400 }
        );
      }
      updates.push("email = ?");
      values.push(email);
    }
    if (password) {
      updates.push("password_hash = ?");
      values.push(bcrypt.hashSync(password, 10));
    }
    if (rol !== undefined) {
      if (!['admin', 'trainer', 'mantenimiento'].includes(rol)) {
        return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
      }
      updates.push("rol = ?");
      values.push(rol);
    }
    if (telefono !== undefined) {
      updates.push("telefono = ?");
      values.push(telefono);
    }
    if (foto !== undefined) {
      updates.push("foto = ?");
      values.push(foto);
    }

    if (updates.length === 0) {
      db.close();
      return NextResponse.json({ error: "No hay campos para actualizar" }, { status: 400 });
    }

    values.push(id);

    const query = `UPDATE usuarios SET ${updates.join(", ")}, updated_at = datetime('now') WHERE id = ?`;
    const stmt = db.prepare(query);
    stmt.run(...values);

    const getPersonal = db.prepare("SELECT id, nombre, email, rol, telefono, foto, updated_at FROM usuarios WHERE id = ?");
    const actualizado = getPersonal.get(id);

    db.close();

    if (!actualizado) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(actualizado);
  } catch (error) {
    console.error("Error updating personal:", error);
    return NextResponse.json({ error: "Error al actualizar personal" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const db = getDb();

    // Verificamos si no es el administrador principal (admin demo) para evitar bloqueo de la app
    if (id === 'admin') {
      db.close();
      return NextResponse.json({ error: "No se puede eliminar el administrador principal" }, { status: 403 });
    }

    const stmt = db.prepare("DELETE FROM usuarios WHERE id = ?");
    const info = stmt.run(id);

    db.close();

    if (info.changes === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Usuario eliminado" });
  } catch (error) {
    console.error("Error deleting personal:", error);
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 });
  }
}

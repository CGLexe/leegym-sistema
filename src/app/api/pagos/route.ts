import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    
    const filtroEstado = searchParams.get("estado") || "";
    const filtroMetodo = searchParams.get("metodo") || "";
    const fechaInicio = searchParams.get("fecha_inicio") || "";
    const fechaFin = searchParams.get("fecha_fin") || "";

    let query = `
      SELECT p.*, 
             u.nombre as usuario_nombre, 
             u.email as usuario_email,
             m.nombre as membresia_nombre
      FROM pagos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN membresias m ON p.membresia_id = m.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    
    // Filtros
    if (filtroEstado) {
      query += ` AND p.estado = ?`;
      params.push(filtroEstado);
    }
    
    if (filtroMetodo) {
      query += ` AND p.metodo = ?`;
      params.push(filtroMetodo);
    }
    
    if (fechaInicio) {
      query += ` AND date(p.fecha_pago) >= date(?)`;
      params.push(fechaInicio);
    }
    
    if (fechaFin) {
      query += ` AND date(p.fecha_pago) <= date(?)`;
      params.push(fechaFin);
    }
    
    query += ` ORDER BY p.fecha_pago DESC`;

    const stmt = db.prepare(query);
    const pagos = stmt.all(...params) as any[];
    
    db.close();
    
    return NextResponse.json(pagos);
  } catch (error) {
    console.error("Error getting pagos:", error);
    return NextResponse.json(
      { error: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      usuario_id, 
      membresia_id, 
      monto, 
      metodo, 
      fecha_inicio, 
      fecha_fin,
      referencia 
    } = body;

    // Validar campos requeridos
    if (!usuario_id || !monto || !metodo) {
      return NextResponse.json(
        { error: "Usuario, monto y método son requeridos" },
        { status: 400 }
      );
    }

    const db = getDb();

    // Verificar que existe el usuario
    const checkUsuario = db.prepare("SELECT id, nombre FROM usuarios WHERE id = ?");
    const usuario = checkUsuario.get(usuario_id) as { id: string; nombre: string } | undefined;
    
    if (!usuario) {
      db.close();
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const id = uuidv4();
    const fecha_pago = new Date().toISOString();
    
    // Si no se especifica fecha de inicio, usar hoy
    const fechaInicioPago = fecha_inicio || new Date().toISOString().split("T")[0];
    
    // Calcular fecha fin basada en la membresía si se proporciona
    let fechaFinPago = fecha_fin;
    if (!fechaFinPago && membresia_id) {
      const getMembresia = db.prepare("SELECT duracion_dias FROM membresias WHERE id = ?");
      const membresia = getMembresia.get(membresia_id) as { duracion_dias: number } | undefined;
      if (membresia) {
        const fin = new Date();
        fin.setDate(fin.getDate() + membresia.duracion_dias);
        fechaFinPago = fin.toISOString().split("T")[0];
      }
    }

    const stmt = db.prepare(`
      INSERT INTO pagos (id, usuario_id, membresia_id, monto, metodo, fecha_pago, fecha_inicio, fecha_fin, estado, referencia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      usuario_id,
      membresia_id || null,
      monto,
      metodo,
      fecha_pago,
      fechaInicioPago,
      fechaFinPago || null,
      body.estado || 'pendiente',
      referencia || null
    );

    // Obtener el pago creado
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
    const nuevoPago = getPago.get(id);

    db.close();

    return NextResponse.json(nuevoPago, { status: 201 });
  } catch (error) {
    console.error("Error creating pago:", error);
    return NextResponse.json(
      { error: "Error al crear pago" },
      { status: 500 }
    );
  }
}
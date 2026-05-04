import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeProduct } from "@/lib/stripe-config";
import { getDb } from "@/lib/db";

function getStripe() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new Error("STRIPE_SECRET_KEY no está configurada en las variables de entorno");
  }
  return new Stripe(stripeKey, {
    apiVersion: "2024-04-10" as any,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { membresia_id, usuario_id, origin_url } = body;

    if (!membresia_id || !usuario_id) {
      return NextResponse.json(
        { error: "Membresía ID y Usuario ID son requeridos" },
        { status: 400 }
      );
    }

    const product = getStripeProduct(membresia_id);
    
    if (!product) {
      return NextResponse.json(
        { error: "Producto de Stripe no encontrado para esta membresía" },
        { status: 404 }
      );
    }

    const db = getDb();
    
    // Check user
    const userStmt = db.prepare("SELECT email, nombre FROM usuarios WHERE id = ?");
    const user = userStmt.get(usuario_id) as { email: string, nombre: string } | undefined;
    
    db.close();

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const origin = origin_url || request.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],
      mode: product.interval ? "subscription" : "payment",
      customer_email: user.email,
      success_url: `${origin}/dashboard/miembros/${usuario_id}?payment=success`,
      cancel_url: `${origin}/dashboard/miembros/${usuario_id}?payment=cancelled`,
      metadata: {
        usuario_id,
        membresia_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating stripe checkout session:", error);
    return NextResponse.json(
      { error: "Error al crear la sesión de pago: " + error.message },
      { status: 500 }
    );
  }
}

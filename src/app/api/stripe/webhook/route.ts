import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { getStripeProduct } from "@/lib/stripe-config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) {
      // If we don't have webhook secret configured locally, we just bypass verification for dev
      event = JSON.parse(body);
      console.warn("WARN: Stripe webhook secret not configured. Bypassing signature verification.");
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const db = getDb();
    
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const metadata = session.metadata;
        if (!metadata || !metadata.usuario_id || !metadata.membresia_id) {
          console.error("Missing metadata in checkout session");
          break;
        }

        const usuario_id = metadata.usuario_id;
        const membresia_id = metadata.membresia_id;
        
        // Find product duration
        const product = getStripeProduct(membresia_id);
        const duracion_dias = product ? product.durationDays : 30;

        const monto = session.amount_total ? session.amount_total / 100 : 0;
        
        const fecha_inicio = new Date();
        const fecha_fin = new Date();
        fecha_fin.setDate(fecha_fin.getDate() + duracion_dias);

        const stmt = db.prepare(`
          INSERT INTO pagos (id, usuario_id, membresia_id, monto, metodo, fecha_pago, fecha_inicio, fecha_fin, estado, referencia)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'aprobado', ?)
        `);

        stmt.run(
          uuidv4(),
          usuario_id,
          membresia_id,
          monto,
          "stripe",
          new Date().toISOString(),
          fecha_inicio.toISOString().split("T")[0],
          fecha_fin.toISOString().split("T")[0],
          session.id
        );
        
        console.log(`Payment registered for user ${usuario_id}`);
        break;
      }
      
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.billing_reason === "subscription_create") {
          // Ya lo manejamos en checkout.session.completed si es la primera vez
          break;
        }
        
        // Es un pago recurrente
        const subscriptionId = invoice.subscription as string;
        if (!subscriptionId) break;
        
        // Para encontrar el usuario, necesitamos buscar en la DB por el customer o usar metadata de la subscripción
        // Asumiremos que el checkout guardó metadata o simplemente saltamos esta parte si es un MVP y el cliente maneja pagos manuales
        break;
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    db.close();
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

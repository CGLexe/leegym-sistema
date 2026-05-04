import { NextResponse } from 'next/server';

export async function POST() {
  // El logout se maneja del lado del cliente eliminando el token
  // del localStorage/cookies. Este endpoint solo confirma el éxito.
  return NextResponse.json({ success: true });
}
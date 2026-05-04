"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { verificarToken, type TokenPayload } from "@/lib/auth";
import { Loader2 } from "lucide-react";

// Componente de skeleton de carga
function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-lee-dark">
      <div className="w-16 h-16 mb-6">
        <Loader2 className="w-16 h-16 text-lee-gold animate-spin" />
      </div>
      <div className="space-y-3 w-64">
        <div className="h-4 bg-lee-card rounded animate-pulse w-3/4 mx-auto"></div>
        <div className="h-4 bg-lee-card rounded animate-pulse w-1/2 mx-auto"></div>
      </div>
    </div>
  );
}

// Función para validar el token desde el cliente
function validateClientToken(token: string): boolean {
  try {
    // Usar jwt-simple o verificar manualmente el formato del token
    // Como usamos jsonwebtoken en el servidor, intentamos décodificar la parte media
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    // Decodificar el payload (parte media)
    const payload = JSON.parse(atob(parts[1]));

    // Verificar que tenga los campos necesarios
    return !!(payload.id && payload.email && payload.rol);
  } catch {
    return false;
  }
}

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar token en el cliente
    const checkAuth = () => {
      try {
        // Leer token de localStorage
        const token = localStorage.getItem("lee_gym_token");

        if (!token) {
          // No hay token, redirigir a login
          router.push("/login");
          return;
        }

        // Verificar si el token es válido
        const isValid = validateClientToken(token);

        if (isValid) {
          // Token válido, redirigir a dashboard
          router.push("/dashboard");
        } else {
          // Token inválido, limpiar y redirigir a login
          localStorage.removeItem("lee_gym_token");
          router.push("/login");
        }
      } catch {
        // Error, redirigir a login
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Pequeño delay para mostrar el skeleton
    const timer = setTimeout(checkAuth, 500);

    return () => clearTimeout(timer);
  }, [router]);

  // Mientras verifica, mostrar skeleton
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  // Este componente no debería renderizarse ya que/redirigimos
  return <LoadingSkeleton />;
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Triangle } from "lucide-react";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // Guardar token en localStorage
      localStorage.setItem("lee_gym_token", data.token);
      localStorage.setItem("lee_gym_usuario", JSON.stringify(data.usuario));

      // Redirigir a dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Error de conexión. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lee-black p-4">
      {/* Fondo con patrón */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              var(--gold) 10px,
              var(--gold) 11px
            )`,
          }}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          {/* Triángulo Dorado */}
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
            <Triangle className="w-16 h-16 text-lee-gold fill-lee-gold" />
          </div>

          <h1
            className="text-5xl font-bold tracking-wider text-lee-gold"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            LEE GYM
          </h1>

          <p
            className="text-lg text-lee-muted mt-2 tracking-widest uppercase"
            style={{ fontFamily: "var(--font-barlow-condensed)" }}
          >
            Sistema de Gestión
          </p>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-lee-card border border-lee-border rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-lee-white mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-lee-dark border border-lee-border rounded-md text-lee-white placeholder-lee-muted focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-lee-white mb-2"
              >
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-lee-dark border border-lee-border rounded-md text-lee-white placeholder-lee-muted focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lee-muted hover:text-lee-gold transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="p-3 bg-red-900/30 border border-lee-red rounded-md">
                <p className="text-sm text-lee-red text-center">{error}</p>
              </div>
            )}

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-lee-gold hover:bg-lee-gold-light text-lee-black font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>
        </div>

        {/* Pie de página */}
        <p className="text-center text-lee-muted text-sm mt-6">
          © 2026 LEE GYM. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
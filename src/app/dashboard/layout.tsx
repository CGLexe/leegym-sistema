"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Triangle, 
  Home, 
  Users, 
  CreditCard, 
  Calendar, 
  Clock, 
  BarChart3, 
  ShoppingCart, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  foto?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Inicio", href: "/dashboard", icon: <Home className="w-5 h-5" /> },
  { label: "Miembros", href: "/dashboard/miembros", icon: <Users className="w-5 h-5" /> },
  { label: "Membresías", href: "/dashboard/membresias", icon: <CreditCard className="w-5 h-5" /> },
  { label: "Pagos", href: "/dashboard/pagos", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Asistencia", href: "/dashboard/asistencia", icon: <Calendar className="w-5 h-5" /> },
  { label: "Horarios", href: "/dashboard/horarios", icon: <Clock className="w-5 h-5" /> },
  { label: "Tienda", href: "/dashboard/tienda", icon: <ShoppingCart className="w-5 h-5" /> },
  { label: "Personal", href: "/dashboard/personal", icon: <Users className="w-5 h-5" /> },
  { label: "Configuración", href: "/dashboard/configuracion", icon: <Settings className="w-5 h-5" /> },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Cargar usuario del localStorage
    const usuarioData = localStorage.getItem("lee_gym_usuario");
    if (usuarioData) {
      setUsuario(JSON.parse(usuarioData));
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("lee_gym_token");
    localStorage.removeItem("lee_gym_usuario");
    router.push("/login");
  };

  if (!usuario) {
    return null;
  }

  // Nombre corto del usuario
  const nombreCorto = usuario.nombre.split(" ")[0];
  const rolLabel = usuario.rol === "admin" ? "Administrador" : usuario.rol === "trainer" ? "Entrenador" : "Miembro";

  return (
    <div className="min-h-screen flex bg-lee-black">
      {/* Sidebar Desktop */}
      <aside 
        className={`
          fixed left-0 top-0 h-full bg-lee-dark border-r border-lee-border z-40
          transition-all duration-300 flex flex-col
          ${sidebarOpen ? "w-64" : "w-20"}
          hidden md:flex
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-lee-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lee-gold rounded-lg flex items-center justify-center flex-shrink-0">
              <Triangle className="w-6 h-6 text-lee-black fill-lee-black" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 
                  className="text-xl font-bold text-lee-gold"
                  style={{ fontFamily: "var(--font-bebas)" }}
                >
                  LEE GYM
                </h1>
                <p className="text-xs text-lee-muted">Gestión</p>
              </div>
            )}
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-lee-white/70 hover:text-lee-white hover:bg-lee-card transition-colors
                ${sidebarOpen ? "" : "justify-center"}
              `}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Botón toggle y logout */}
        <div className="p-3 border-t border-lee-border space-y-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-lee-white/70 hover:text-lee-white hover:bg-lee-card transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {sidebarOpen && <span className="text-sm">Contraer</span>}
          </button>
          
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-lee-red hover:bg-lee-red/10 transition-colors
              ${sidebarOpen ? "" : "justify-center"}
            `}
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <aside 
        className={`
          fixed left-0 top-0 h-full bg-lee-dark border-r border-lee-border z-50
          w-64 transition-transform duration-300 flex flex-col
          md:hidden
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-lee-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-lee-gold rounded-lg flex items-center justify-center flex-shrink-0">
              <Triangle className="w-6 h-6 text-lee-black fill-lee-black" />
            </div>
            <div>
              <h1 
                className="text-xl font-bold text-lee-gold"
                style={{ fontFamily: "var(--font-bebas)" }}
              >
                LEE GYM
              </h1>
              <p className="text-xs text-lee-muted">Gestión</p>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-lee-muted hover:text-lee-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-lee-white/70 hover:text-lee-white hover:bg-lee-card transition-colors"
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Botón logout */}
        <div className="p-3 border-t border-lee-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-lee-red hover:bg-lee-red/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <main 
        className={`
          flex-1 flex flex-col min-h-screen transition-all duration-300
          ${sidebarOpen ? "md:ml-64" : "md:ml-20"}
        `}
      >
        {/* Header */}
        <header className="h-16 bg-lee-dark border-b border-lee-border flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-lee-muted hover:text-lee-white md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 
              className="text-lg font-semibold text-lee-white"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              DASHBOARD
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-lee-white">{nombreCorto}</p>
              <p className="text-xs text-lee-muted">{rolLabel}</p>
            </div>
            <div className="w-10 h-10 bg-lee-gold rounded-full flex items-center justify-center text-lee-black font-bold">
              {usuario.nombre.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Children Content */}
        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
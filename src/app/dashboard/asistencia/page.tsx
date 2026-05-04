"use client";

import { useState, useEffect, Suspense, useTransition } from "react";
import { 
  Search, 
  UserCheck, 
  UserX,
  Loader2,
  AlertCircle,
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Calendar,
  Check
} from "lucide-react";

interface MiembroAsistencia {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  membresia: string | null;
  fecha_fin: string | null;
  asistencia_id: string | null;
  hora_entrada: string | null;
}

function AsistenciaContent() {
  const [miembros, setMiembros] = useState<MiembroAsistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [isPending, startTransition] = useTransition();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [fechaActual] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString("es-MX", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchMiembros = async () => {
    try {
      const response = await fetch(`/api/asistencia/miembros`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar miembros");
      }

      setMiembros(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiembros();
    
    // Configurar intervalo para actualizar automáticamente cada minuto
    const interval = setInterval(fetchMiembros, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleAsistencia = async (usuarioId: string) => {
    if (isPending) return;
    setError("");
    
    // Optimistic update
    startTransition(() => {
      setMiembros((prev) =>
        prev.map((m) => {
          if (m.id === usuarioId) {
            const tieneEntrada = !!m.asistencia_id;
            if (tieneEntrada) {
              return { ...m, asistencia_id: null, hora_entrada: null };
            } else {
              const now = new Date();
              const hora = now.toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              });
              return { ...m, asistencia_id: "temp", hora_entrada: hora };
            }
          }
          return m;
        })
      );
    });
    
    try {
      const response = await fetch(`/api/asistencia/registrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuarioId })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al registrar asistencia");
      }
      
    } catch (err: any) {
      setError(err.message);
      // Revertir en caso de error
      await fetchMiembros();
    }
  };

  const getEstadoMembresia = (miembro: MiembroAsistencia) => {
    if (!miembro.membresia || !miembro.fecha_fin) {
      return { 
        texto: "Sin Membresía Activa", 
        color: "text-lee-red", 
        bg: "bg-lee-red/10 border-lee-red/20",
        puedePasar: false 
      };
    }
    
    const diasRestantes = Math.ceil((new Date(miembro.fecha_fin).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
    
    if (diasRestantes < 0) {
      return { 
        texto: "Vencida", 
        color: "text-lee-red", 
        bg: "bg-lee-red/10 border-lee-red/20",
        puedePasar: false 
      };
    } else if (diasRestantes <= 3) {
      return { 
        texto: `Vence en ${diasRestantes} días`, 
        color: "text-yellow-400", 
        bg: "bg-yellow-400/10 border-yellow-400/20",
        puedePasar: true 
      };
    } else {
      return { 
        texto: "Activa", 
        color: "text-lee-green", 
        bg: "bg-lee-green/10 border-lee-green/20",
        puedePasar: true 
      };
    }
  };

  const miembrosFiltrados = miembros.filter(m => {
    if (!busqueda) return true;
    const search = busqueda.toLowerCase();
    return m.nombre.toLowerCase().includes(search) || 
           m.email.toLowerCase().includes(search) ||
           (m.telefono && m.telefono.includes(search));
  });

  // Estadísticas rápidas
  const totalAsistenciasHoy = miembros.filter(m => m.asistencia_id).length;
  
  const horaFormateada = currentTime.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl sm:text-3xl font-bold text-lee-gold"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            CONTROL DE ASISTENCIA
          </h1>
          <p className="text-lee-muted mt-1">
            Registra entradas y salidas de los miembros
          </p>
        </div>
        
        {/* Fecha y Hora */}
        <div className="flex flex-col sm:items-end">
          <div className="flex items-center gap-2 text-lee-white">
            <Calendar className="w-5 h-5 text-lee-gold" />
            <span className="font-medium capitalize">{fechaActual}</span>
          </div>
          <div className="flex items-center gap-2 text-lee-muted mt-1">
            <Clock className="w-4 h-4" />
            <span>{horaFormateada}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-lee-red/10 border border-lee-red/30 rounded-lg flex items-center gap-2 text-lee-red">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => setError("")} className="ml-auto p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-lee-card border border-lee-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-lee-gold/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-lee-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-lee-white">{miembros.length}</p>
              <p className="text-sm text-lee-muted">Total Miembros</p>
            </div>
          </div>
        </div>

        <div className="bg-lee-card border border-lee-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-lee-green/20 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-lee-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-lee-green">{totalAsistenciasHoy}</p>
              <p className="text-sm text-lee-muted">Entradas Registradas</p>
            </div>
          </div>
        </div>

        <div className="bg-lee-card border border-lee-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-lee-red/20 rounded-lg flex items-center justify-center">
              <X className="w-6 h-6 text-lee-red" />
            </div>
            <div>
              <p className="text-2xl font-bold text-lee-red">
                {miembros.length - totalAsistenciasHoy}
              </p>
              <p className="text-sm text-lee-muted">Sin Registrar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-lee-muted" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar miembro por nombre, email o teléfono..."
          className="w-full pl-12 pr-4 py-4 bg-lee-card border-2 border-lee-border rounded-xl text-lg text-lee-white placeholder-lee-muted focus:outline-none focus:border-lee-gold transition-colors"
          autoFocus
        />
      </div>

      {/* Lista de miembros (Cards en grid) */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-lee-gold animate-spin" />
        </div>
      ) : miembrosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-lee-card border border-lee-border rounded-xl text-center">
          <UserX className="w-16 h-16 text-lee-muted mb-4" />
          <p className="text-xl text-lee-white font-medium" style={{ fontFamily: "var(--font-bebas)" }}>
            NO SE ENCONTRARON MIEMBROS
          </p>
          <p className="text-lee-muted mt-2">
            Verifica el nombre o registra un nuevo usuario
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {miembrosFiltrados.map((miembro) => {
            const estadoMem = getEstadoMembresia(miembro);
            const estaPresente = !!miembro.asistencia_id;
            
            return (
              <div 
                key={miembro.id}
                className={`flex flex-col p-5 rounded-xl border transition-all duration-200
                  ${estaPresente ? 'bg-lee-green/5 border-lee-green/30' : 'bg-lee-card border-lee-border'}
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="pr-2">
                    <h3 className="text-lg font-bold text-lee-white leading-tight">{miembro.nombre}</h3>
                    <p className="text-xs text-lee-muted mt-1 truncate max-w-[180px]">{miembro.email}</p>
                  </div>
                  <div className={`px-2 py-1 rounded border text-[10px] uppercase tracking-wider font-bold whitespace-nowrap flex-shrink-0 ${estadoMem.bg} ${estadoMem.color}`}>
                    {estadoMem.texto}
                  </div>
                </div>
                
                <div className="text-sm text-lee-muted mb-6 flex-1">
                  <p>Plan: <span className="text-lee-white">{miembro.membresia || "-"}</span></p>
                  {estaPresente && miembro.hora_entrada && (
                    <p className="mt-2 flex items-center gap-1.5 text-lee-green font-medium">
                      <Clock className="w-4 h-4" /> 
                      Entró a las {miembro.hora_entrada}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={() => handleToggleAsistencia(miembro.id)}
                  disabled={isPending || (!estadoMem.puedePasar && !estaPresente)}
                  className={`
                    w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
                    ${isPending ? 'opacity-70 cursor-wait' : ''}
                    ${estaPresente 
                      ? 'bg-lee-card border-2 border-lee-red text-lee-red hover:bg-lee-red/10' 
                      : (!estadoMem.puedePasar)
                        ? 'bg-lee-black border border-lee-border text-lee-muted cursor-not-allowed'
                        : 'bg-lee-gold text-lee-black hover:bg-lee-gold/90'
                    }
                  `}
                >
                  {estaPresente ? (
                    <>
                      <UserX className="w-5 h-5" />
                      Registrar Salida
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Registrar Entrada
                    </>
                  )}
                </button>
                
                {!estadoMem.puedePasar && !estaPresente && (
                  <p className="text-xs text-lee-red text-center mt-3 flex items-center justify-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" /> Requiere pago para ingresar
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AsistenciaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-lee-gold animate-spin" />
      </div>
    }>
      <AsistenciaContent />
    </Suspense>
  );
}
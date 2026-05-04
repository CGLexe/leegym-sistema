"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  Users,
  Loader2,
  AlertCircle,
  X,
  Check,
  Clock,
  AlertTriangle
} from "lucide-react";
import MiembroForm from "@/components/MiembroForm";

// Tipo para miembro
interface Miembro {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  foto: string | null;
  fecha_nacimiento: string | null;
  condicion_medica: string | null;
  contacto_emergencia: string | null;
  created_at: string;
  membresia: {
    id: string;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    dias_restantes: number;
    estado: string;
  } | null;
}

// Función para obtener filtros desde URL
function useUrlFilters() {
  const searchParams = useSearchParams();
  return {
    filtro: searchParams.get("filtro") || "todos",
    busqueda: searchParams.get("busqueda") || "",
  };
}

// Componente principal con Suspense
function MiembrosContent() {
  const router = useRouter();
  const { filtro, busqueda } = useUrlFilters();
  
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMiembro, setEditingMiembro] = useState<Miembro | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Estados de filtros locales
  const [localBusqueda, setLocalBusqueda] = useState(busqueda);
  const [localFiltro, setLocalFiltro] = useState(filtro);

  // Cargar miembros
  const fetchMiembros = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("filtro", localFiltro);
      if (localBusqueda) {
        params.set("busqueda", localBusqueda);
      }

      const response = await fetch(`/api/miembros?${params.toString()}`);
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
  }, [localFiltro]);

  // Debounce búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localBusqueda !== busqueda) {
        router.push(`/dashboard/miembros?filtro=${localFiltro}&busqueda=${localBusqueda}`);
        fetchMiembros();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localBusqueda]);

  // Cambiar filtro
  const handleFiltroChange = (nuevoFiltro: string) => {
    setLocalFiltro(nuevoFiltro);
    router.push(`/dashboard/miembros?filtro=${nuevoFiltro}&busqueda=${localBusqueda}`);
  };

  // Eliminar miembro
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/miembros?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }

      setDeleteConfirm(null);
      fetchMiembros();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Éxito al crear/editar
  const handleSuccess = () => {
    setShowForm(false);
    setEditingMiembro(null);
    fetchMiembros();
  };

  // Obtener estado y color
  const getEstadoInfo = (miembro: Miembro) => {
    if (!miembro.membresia) {
      return { label: "Sin membresía", color: "text-lee-muted", bg: "bg-lee-muted/20" };
    }
    
    const { estado } = miembro.membresia;
    if (estado === "activa") {
      return { label: "Activa", color: "text-lee-green", bg: "bg-lee-green/20" };
    } else if (estado === "por_vencer") {
      return { label: "Por vencer", color: "text-yellow-400", bg: "bg-yellow-400/20" };
    } else {
      return { label: "Vencida", color: "text-lee-red", bg: "bg-lee-red/20" };
    }
  };

  const filtros = [
    { value: "todos", label: "Todos" },
    { value: "activos", label: "Activos" },
    { value: "vencidos", label: "Vencidos" },
    { value: "por_vencer", label: "Por vencer" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl sm:text-3xl font-bold text-lee-gold"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            MIEMBROS
          </h1>
          <p className="text-lee-muted mt-1">
            Gestiona los miembros del gimnasio
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMiembro(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-lee-gold text-lee-black font-semibold rounded-lg hover:bg-lee-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Miembro
        </button>
      </div>

      {/* Error global */}
      {error && (
        <div className="p-3 bg-lee-red/10 border border-lee-red/30 rounded-lg flex items-center gap-2 text-lee-red">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={() => setError("")} className="ml-auto p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lee-muted" />
          <input
            type="text"
            value={localBusqueda}
            onChange={(e) => setLocalBusqueda(e.target.value)}
            placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filtros.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFiltroChange(f.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                ${localFiltro === f.value 
                  ? "bg-lee-gold text-lee-black" 
                  : "bg-lee-card border border-lee-border text-lee-white/70 hover:text-lee-white"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de miembros */}
      <div className="bg-lee-card border border-lee-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-lee-gold animate-spin" />
          </div>
        ) : miembros.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-12 h-12 text-lee-muted mb-4" />
            <p className="text-lee-white font-medium">No hay miembros</p>
            <p className="text-lee-muted text-sm mt-1">
              {localBusqueda || localFiltro !== "todos" 
                ? "Intenta con otros filtros" 
                : "Agrega el primer miembro"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lee-border">
                  <th className="text-left text-sm font-medium text-lee-muted px-4 sm:px-6 py-4">Foto</th>
                  <th className="text-left text-sm font-medium text-lee-muted px-4 sm:px-6 py-4">Nombre</th>
                  <th className="text-left text-sm font-medium text-lee-muted px-4 sm:px-6 py-4 hidden md:table-cell">Email</th>
                  <th className="text-left text-sm font-medium text-lee-muted px-4 sm:px-6 py-4 hidden lg:table-cell">Teléfono</th>
                  <th className="text-left text-sm font-medium text-lee-muted px-4 sm:px-6 py-4">Membresía</th>
                  <th className="text-left text-sm font-medium text-lee-muted px-4 sm:px-6 py-4 hidden sm:table-cell">Vencimiento</th>
                  <th className="text-left text-sm font-medium text-lee-muted px-4 sm:px-6 py-4">Estado</th>
                  <th className="text-right text-sm font-medium text-lee-muted px-4 sm:px-6 py-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {miembros.map((miembro) => {
                  const estadoInfo = getEstadoInfo(miembro);
                  return (
                    <tr 
                      key={miembro.id} 
                      className="border-b border-lee-border last:border-0 hover:bg-lee-black/30 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4">
                        <div className="w-10 h-10 rounded-full bg-lee-gold overflow-hidden flex items-center justify-center text-lee-black font-bold">
                          {miembro.foto ? (
                            <img 
                              src={miembro.foto} 
                              alt={miembro.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            miembro.nombre.charAt(0).toUpperCase()
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <p className="font-medium text-lee-white">{miembro.nombre}</p>
                        <p className="text-sm text-lee-muted md:hidden">{miembro.email}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                        <p className="text-lee-white/70">{miembro.email}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                        <p className="text-lee-white/70">{miembro.telefono || "-"}</p>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <p className="text-lee-white">
                          {miembro.membresia?.nombre || "Sin membresía"}
                        </p>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        {miembro.membresia ? (
                          <p className="text-lee-white/70">
                            {new Date(miembro.membresia.fecha_fin).toLocaleDateString("es-MX")}
                          </p>
                        ) : (
                          <p className="text-lee-muted">-</p>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoInfo.bg} ${estadoInfo.color}`}>
                          {estadoInfo.label}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/dashboard/miembros/${miembro.id}`}
                            className="p-2 text-lee-muted hover:text-lee-white transition-colors"
                            title="Ver"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => {
                              setEditingMiembro(miembro);
                              setShowForm(true);
                            }}
                            className="p-2 text-lee-muted hover:text-lee-white transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(miembro.id)}
                            className="p-2 text-lee-muted hover:text-lee-red transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulario de miembro */}
      <MiembroForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMiembro(null);
        }}
        onSuccess={handleSuccess}
        editingMiembro={editingMiembro}
      />

      {/* Confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-md bg-lee-dark border border-lee-border rounded-xl p-6">
            <h3 
              className="text-xl font-bold text-lee-white mb-2"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              ELIMINAR MIEMBRO
            </h3>
            <p className="text-lee-muted mb-6">
              ¿Estás seguro de que deseas eliminar este miembro? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white hover:bg-lee-card/80 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-lee-red text-white font-semibold rounded-lg hover:bg-lee-red/90 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente wrapper con Suspense
export default function MiembrosPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-lee-gold animate-spin" />
      </div>
    }>
      <MiembrosContent />
    </Suspense>
  );
}
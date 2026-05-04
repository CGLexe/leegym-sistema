"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  CreditCard,
  Loader2,
  AlertCircle,
  X,
  Check,
  DollarSign,
  Calendar,
  FileText
} from "lucide-react";

// Tipo para membresía
interface Membresia {
  id: string;
  nombre: string;
  precio: number;
  duracion_dias: number;
  descripcion: string | null;
  activo: number;
  created_at: string;
}

// Componente del formulario
function MembresiaForm({ 
  isOpen, 
  onClose, 
  onSuccess, 
  editingMembresia 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
  editingMembresia: Membresia | null;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    precio: "",
    duracion_dias: "",
    descripcion: "",
  });

  useEffect(() => {
    if (editingMembresia) {
      setFormData({
        nombre: editingMembresia.nombre,
        precio: editingMembresia.precio.toString(),
        duracion_dias: editingMembresia.duracion_dias.toString(),
        descripcion: editingMembresia.descripcion || "",
      });
    } else {
      setFormData({ nombre: "", precio: "", duracion_dias: "", descripcion: "" });
    }
  }, [editingMembresia, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const method = editingMembresia ? "PUT" : "POST";
      const url = editingMembresia 
        ? `/api/membresias/${editingMembresia.id}`
        : "/api/membresias";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          precio: parseFloat(formData.precio),
          duracion_dias: parseInt(formData.duracion_dias),
          descripcion: formData.descripcion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-lee-dark border border-lee-border rounded-xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-lee-muted hover:text-lee-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 
          className="text-xl font-bold text-lee-gold mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {editingMembresia ? "EDITAR MEMBRESÍA" : "NUEVA MEMBRESÍA"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-lee-red/10 border border-lee-red/30 rounded-lg flex items-center gap-2 text-lee-red text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-lee-white mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Mensual, Trimestral"
              required
              className="w-full px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-lee-white mb-2">
                Precio *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lee-muted" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  placeholder="0.00"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-lee-white mb-2">
                Duración (días) *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lee-muted" />
                <input
                  type="number"
                  min="1"
                  value={formData.duracion_dias}
                  onChange={(e) => setFormData({ ...formData, duracion_dias: e.target.value })}
                  placeholder="30"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-lee-white mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción de la membresía..."
              rows={3}
              className="w-full px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-lee-gold text-lee-black font-semibold rounded-lg hover:bg-lee-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : editingMembresia ? (
              <>
                <Check className="w-5 h-5" />
                Guardar Cambios
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Crear Membresía
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Componente principal
function MembresiasContent() {
  const router = useRouter();
  
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingMembresia, setEditingMembresia] = useState<Membresia | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Cargar membresías
  const fetchMembresias = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/membresias");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar membresías");
      }

      setMembresias(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembresias();
  }, []);

  // Eliminar membresía
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/membresias/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar");
      }

      setDeleteConfirm(null);
      fetchMembresias();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Éxito al crear/editar
  const handleSuccess = () => {
    setShowForm(false);
    setEditingMembresia(null);
    fetchMembresias();
  };

  // Formatear duración
  const formatDuracion = (dias: number) => {
    if (dias === 1) return "1 día";
    if (dias === 30) return "1 mes";
    if (dias === 60) return "2 meses";
    if (dias === 90) return "3 meses";
    if (dias === 180) return "6 meses";
    if (dias === 365) return "1 año";
    return `${dias} días`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl sm:text-3xl font-bold text-lee-gold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            MEMBRESÍAS
          </h1>
          <p className="text-lee-muted mt-1">
            Gestiona los tipos de membresía del gimnasio
          </p>
        </div>
        <button
          onClick={() => {
            setEditingMembresia(null);
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-lee-gold text-lee-black font-semibold rounded-lg hover:bg-lee-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Membresía
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

      {/* Grid de cards de membresías */}
      <div className="bg-lee-card border border-lee-border rounded-xl p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-lee-gold animate-spin" />
          </div>
        ) : membresias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CreditCard className="w-12 h-12 text-lee-muted mb-4" />
            <p className="text-lee-white font-medium">No hay membresías</p>
            <p className="text-lee-muted text-sm mt-1">
              Crea el primer tipo de membresía
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {membresias.map((membresia) => (
              <div
                key={membresia.id}
                className="bg-lee-black border border-lee-border rounded-xl p-5 hover:border-lee-gold/50 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-lee-gold/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-lee-gold" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingMembresia(membresia);
                        setShowForm(true);
                      }}
                      className="p-2 text-lee-muted hover:text-lee-white transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(membresia.id)}
                      className="p-2 text-lee-muted hover:text-lee-red transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-lee-white mb-1">
                  {membresia.nombre}
                </h3>
                
                {membresia.descripcion && (
                  <p className="text-sm text-lee-muted mb-3 line-clamp-2">
                    {membresia.descripcion}
                  </p>
                )}

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-lee-gold">
                    ${membresia.precio.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-lee-muted">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDuracion(membresia.duracion_dias)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulario de membresía */}
      <MembresiaForm
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMembresia(null);
        }}
        onSuccess={handleSuccess}
        editingMembresia={editingMembresia}
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
              style={{ fontFamily: "var(--font-display)" }}
            >
              ELIMINAR MEMBRESÍA
            </h3>
            <p className="text-lee-muted mb-6">
              ¿Estás seguro de que deseas eliminar esta membresía? Esta acción no se puede deshacer.
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
export default function MembresiasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-lee-gold animate-spin" />
      </div>
    }>
      <MembresiasContent />
    </Suspense>
  );
}
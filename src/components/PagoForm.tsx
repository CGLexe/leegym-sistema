"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, DollarSign, Calendar } from "lucide-react";

interface Miembro {
  id: string;
  nombre: string;
  email: string;
}

interface Membresia {
  id: string;
  nombre: string;
  precio: number;
  duracion_dias: number;
}

interface PagoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedMiembroId?: string | null;
}

export default function PagoForm({ isOpen, onClose, onSuccess, preselectedMiembroId }: PagoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [miembros, setMiembros] = useState<Miembro[]>([]);
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  
  const [formData, setFormData] = useState({
    usuario_id: preselectedMiembroId || "",
    membresia_id: "",
    monto: "",
    metodo: "efectivo",
    fecha_inicio: new Date().toISOString().split("T")[0],
    referencia: "",
  });

  // Resetear el formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        usuario_id: preselectedMiembroId || "",
        fecha_inicio: new Date().toISOString().split("T")[0],
      }));
      setError("");
      
      // Cargar datos
      fetchDatos();
    }
  }, [isOpen, preselectedMiembroId]);

  const fetchDatos = async () => {
    try {
      const [miembrosRes, membresiasRes] = await Promise.all([
        fetch("/api/miembros?filtro=activos"), // o todos
        fetch("/api/membresias")
      ]);
      
      if (miembrosRes.ok) {
        setMiembros(await miembrosRes.json());
      }
      if (membresiasRes.ok) {
        setMembresias(await membresiasRes.json());
      }
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  const handleMembresiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memId = e.target.value;
    setFormData(prev => ({ ...prev, membresia_id: memId }));
    
    // Autocompletar el monto con el precio de la membresía seleccionada
    const membresiaSeleccionada = membresias.find(m => m.id === memId);
    if (membresiaSeleccionada) {
      setFormData(prev => ({ ...prev, membresia_id: memId, monto: membresiaSeleccionada.precio.toString() }));
    } else {
      setFormData(prev => ({ ...prev, monto: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.usuario_id || !formData.monto || !formData.metodo) {
      setError("Usuario, monto y método son requeridos");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        monto: parseFloat(formData.monto),
        estado: "aprobado", // Pagos manuales se aprueban automáticamente
      };

      const response = await fetch("/api/pagos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar el pago");
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
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-lee-dark border border-lee-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-lee-border bg-lee-card">
          <div>
            <h2 
              className="text-2xl font-bold text-lee-gold"
              style={{ fontFamily: "var(--font-bebas)" }}
            >
              REGISTRAR PAGO
            </h2>
            <p className="text-sm text-lee-muted mt-1">
              Ingresa un nuevo pago manual (efectivo, terminal o transferencia)
            </p>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 text-lee-muted hover:text-lee-white hover:bg-lee-black/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-lee-red/10 border border-lee-red/30 rounded-lg flex items-start gap-3 text-lee-red">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form id="pago-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-lee-white mb-1.5">
                Miembro *
              </label>
              <select
                required
                value={formData.usuario_id}
                onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-lee-black border border-lee-border rounded-lg text-lee-white focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
                disabled={!!preselectedMiembroId}
              >
                <option value="">Selecciona un miembro...</option>
                {miembros.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} ({m.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-lee-white mb-1.5">
                Membresía / Plan
              </label>
              <select
                value={formData.membresia_id}
                onChange={handleMembresiaChange}
                className="w-full px-4 py-2.5 bg-lee-black border border-lee-border rounded-lg text-lee-white focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
              >
                <option value="">(Opcional) Selecciona un plan...</option>
                {membresias.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre} - ${m.precio}</option>
                ))}
              </select>
              <p className="text-xs text-lee-muted mt-1">
                Al seleccionar una membresía se calculará automáticamente la fecha de vencimiento.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lee-white mb-1.5">
                  Monto a Pagar *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lee-muted" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-lee-black border border-lee-border rounded-lg text-lee-white focus:outline-none focus:border-lee-gold transition-colors"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-lee-white mb-1.5">
                  Método de Pago *
                </label>
                <select
                  required
                  value={formData.metodo}
                  onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-lee-black border border-lee-border rounded-lg text-lee-white focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta (Terminal)</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-lee-white mb-1.5">
                  Fecha de Inicio
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-lee-muted" />
                  <input
                    type="date"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-lee-black border border-lee-border rounded-lg text-lee-white focus:outline-none focus:border-lee-gold transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-lee-white mb-1.5">
                  Referencia / Notas
                </label>
                <input
                  type="text"
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  placeholder="Opcional..."
                  className="w-full px-4 py-2.5 bg-lee-black border border-lee-border rounded-lg text-lee-white focus:outline-none focus:border-lee-gold transition-colors"
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-lee-border bg-lee-card flex items-center justify-end gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-lee-white hover:text-lee-gold hover:bg-lee-gold/10 font-medium rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="pago-form"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-lee-gold text-lee-black font-semibold rounded-lg hover:bg-lee-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Registrar Pago"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

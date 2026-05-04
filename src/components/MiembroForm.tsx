"use client";

import { useState, useEffect } from "react";
import { X, Upload, Loader2, AlertCircle } from "lucide-react";

interface Miembro {
  id?: string;
  nombre: string;
  email: string;
  telefono?: string | null;
  foto?: string | null;
  fecha_nacimiento?: string | null;
  condicion_medica?: string | null;
  contacto_emergencia?: string | null;
}

interface MiembroFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (miembro: Miembro) => void;
  editingMiembro?: Miembro | null;
}

export default function MiembroForm({ isOpen, onClose, onSuccess, editingMiembro }: MiembroFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState<Miembro>({
    nombre: "",
    email: "",
    telefono: "",
    foto: "",
    fecha_nacimiento: "",
    condicion_medica: "",
    contacto_emergencia: "",
  });

  // Reset form cuando se abre/cierra o cambia el miembro a editar
  useEffect(() => {
    if (isOpen) {
      if (editingMiembro) {
        setFormData({
          nombre: editingMiembro.nombre || "",
          email: editingMiembro.email || "",
          telefono: editingMiembro.telefono || "",
          foto: editingMiembro.foto || "",
          fecha_nacimiento: editingMiembro.fecha_nacimiento || "",
          condicion_medica: editingMiembro.condicion_medica || "",
          contacto_emergencia: editingMiembro.contacto_emergencia || "",
        });
      } else {
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          foto: "",
          fecha_nacimiento: "",
          condicion_medica: "",
          contacto_emergencia: "",
        });
      }
      setError("");
    }
  }, [isOpen, editingMiembro]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = editingMiembro?.id 
        ? `/api/miembros?id=${editingMiembro.id}`
        : "/api/miembros";
      
      const method = editingMiembro?.id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar miembro");
      }

      onSuccess(data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-lee-dark border border-lee-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-lee-border">
          <h2 
            className="text-xl font-bold text-lee-gold"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            {editingMiembro ? "EDITAR MIEMBRO" : "NUEVO MIEMBRO"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-lee-muted hover:text-lee-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-lee-red/10 border border-lee-red/30 rounded-lg flex items-center gap-2 text-lee-red">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-lee-muted mb-1.5">
              Nombre <span className="text-lee-red">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
              placeholder="Nombre completo"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-lee-muted mb-1.5">
              Email <span className="text-lee-red">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-lee-muted mb-1.5">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
              placeholder="Número de teléfono"
            />
          </div>

          {/* Fecha de nacimiento */}
          <div>
            <label className="block text-sm font-medium text-lee-muted mb-1.5">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
            />
          </div>

          {/* Condición médica */}
          <div>
            <label className="block text-sm font-medium text-lee-muted mb-1.5">
              Condición médica
            </label>
            <textarea
              name="condicion_medica"
              value={formData.condicion_medica || ""}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors resize-none"
              placeholder="Alergias, lesiones, condiciones de salud..."
            />
          </div>

          {/* Contacto de emergencia */}
          <div>
            <label className="block text-sm font-medium text-lee-muted mb-1.5">
              Contacto de emergencia
            </label>
            <textarea
              name="contacto_emergencia"
              value={formData.contacto_emergencia || ""}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors resize-none"
              placeholder="Nombre y teléfono de contacto"
            />
          </div>

          {/* Foto URL */}
          <div>
            <label className="block text-sm font-medium text-lee-muted mb-1.5">
              Foto (URL)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                name="foto"
                value={formData.foto || ""}
                onChange={handleChange}
                className="flex-1 px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white placeholder-lee-muted/50 focus:outline-none focus:border-lee-gold focus:ring-1 focus:ring-lee-gold/50 transition-colors"
                placeholder="https://ejemplo.com/foto.jpg"
              />
              {formData.foto && (
                <div className="w-12 h-12 rounded-lg overflow-hidden border border-lee-border flex-shrink-0">
                  <img 
                    src={formData.foto} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-lee-card border border-lee-border rounded-lg text-lee-white hover:bg-lee-card/80 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-lee-gold text-lee-black font-semibold rounded-lg hover:bg-lee-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingMiembro ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
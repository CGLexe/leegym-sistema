"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, Clock, Users, User } from "lucide-react";

interface Clase {
  id: string;
  nombre: string;
  descripcion: string;
  horario_inicio: string;
  horario_fin: string;
  dia_semana: string;
  trainer_id: string;
  trainer_nombre?: string;
  capacidad: number;
}

export default function HorariosPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    horario_inicio: "08:00",
    horario_fin: "09:00",
    dia_semana: "lunes",
    trainer_id: "",
    capacidad: 20,
  });

  const [trainers, setTrainers] = useState<{ id: string; nombre: string }[]>([]);

  useEffect(() => {
    fetchClases();
    fetchTrainers();
  }, []);

  const fetchClases = async () => {
    try {
      const res = await fetch("/api/clases");
      if (!res.ok) throw new Error("Error al obtener clases");
      const data = await res.json();
      setClases(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainers = async () => {
    try {
      // Usaremos un endpoint para obtener el personal si existe.
      // Por ahora asumiendo que /api/personal o /api/usuarios existe.
      // Ya que no lo he creado, intentaré simular o llamar a algo genérico.
      // Actualización: Crearé el endpoint de personal ahora también.
      const res = await fetch("/api/personal?rol=trainer");
      if (res.ok) {
        const data = await res.json();
        setTrainers(data);
      }
    } catch (error) {
      console.error("Error fetching trainers", error);
    }
  };

  const openModal = (clase?: Clase) => {
    if (clase) {
      setEditingId(clase.id);
      setFormData({
        nombre: clase.nombre,
        descripcion: clase.descripcion || "",
        horario_inicio: clase.horario_inicio,
        horario_fin: clase.horario_fin,
        dia_semana: clase.dia_semana,
        trainer_id: clase.trainer_id || "",
        capacidad: clase.capacidad,
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: "",
        descripcion: "",
        horario_inicio: "08:00",
        horario_fin: "09:00",
        dia_semana: "lunes",
        trainer_id: "",
        capacidad: 20,
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? \`/api/clases/\${editingId}\` : "/api/clases";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (!res.ok) throw new Error("Error al guardar la clase");
      
      await fetchClases();
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta clase?")) return;
    try {
      const res = await fetch(\`/api/clases/\${id}\`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      await fetchClases();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const diasOrdenados = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

  const clasesPorDia = diasOrdenados.reduce((acc, dia) => {
    acc[dia] = clases.filter((c) => c.dia_semana === dia);
    return acc;
  }, {} as Record<string, Clase[]>);

  if (loading) return <div className="text-lee-white">Cargando horarios...</div>;
  if (error) return <div className="text-lee-red">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lee-gold" style={{ fontFamily: "var(--font-bebas)" }}>
            HORARIOS Y CLASES
          </h1>
          <p className="text-sm text-lee-muted">Gestiona el calendario de clases de Lee Gym</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-lee-gold text-lee-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Clase
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {diasOrdenados.map((dia) => (
          <div key={dia} className="bg-lee-card border border-lee-border rounded-xl overflow-hidden flex flex-col">
            <div className="bg-lee-dark p-3 border-b border-lee-border">
              <h2 className="text-lg font-semibold text-lee-white capitalize flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-lee-gold" />
                {dia}
              </h2>
            </div>
            <div className="p-4 flex-1 space-y-4">
              {clasesPorDia[dia]?.length === 0 ? (
                <p className="text-sm text-lee-muted text-center py-4">No hay clases programadas</p>
              ) : (
                clasesPorDia[dia]?.map((clase) => (
                  <div key={clase.id} className="bg-lee-black/50 p-3 rounded-lg border border-lee-border/50 group relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button onClick={() => openModal(clase)} className="p-1 text-lee-muted hover:text-lee-gold bg-lee-dark rounded">
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(clase.id)} className="p-1 text-lee-muted hover:text-lee-red bg-lee-dark rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <h3 className="font-medium text-lee-white pr-12">{clase.nombre}</h3>
                    
                    <div className="mt-2 space-y-1 text-xs text-lee-muted">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-lee-gold" />
                        <span>{clase.horario_inicio} - {clase.horario_fin}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-lee-gold" />
                        <span>{clase.trainer_nombre || "Sin entrenador"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-lee-gold" />
                        <span>Capacidad: {clase.capacidad}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal para Crear/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-lee-card border border-lee-border rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-lee-white mb-4" style={{ fontFamily: "var(--font-bebas)" }}>
              {editingId ? "Editar Clase" : "Nueva Clase"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-lee-muted mb-1">Nombre de la Clase</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                  placeholder="Ej. Crossfit"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-lee-muted mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                    className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm text-lee-muted mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={formData.horario_fin}
                    onChange={(e) => setFormData({ ...formData, horario_fin: e.target.value })}
                    className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-lee-muted mb-1">Día</label>
                  <select
                    value={formData.dia_semana}
                    onChange={(e) => setFormData({ ...formData, dia_semana: e.target.value })}
                    className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                  >
                    <option value="lunes">Lunes</option>
                    <option value="martes">Martes</option>
                    <option value="miercoles">Miércoles</option>
                    <option value="jueves">Jueves</option>
                    <option value="viernes">Viernes</option>
                    <option value="sabado">Sábado</option>
                    <option value="domingo">Domingo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-lee-muted mb-1">Capacidad</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacidad}
                    onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) })}
                    className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-lee-muted mb-1">Entrenador (Opcional)</label>
                <select
                  value={formData.trainer_id}
                  onChange={(e) => setFormData({ ...formData, trainer_id: e.target.value })}
                  className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                >
                  <option value="">-- Seleccionar --</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-lee-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-lee-muted hover:text-lee-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-lee-gold text-lee-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-500 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

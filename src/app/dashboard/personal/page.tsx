"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shield, UserCog, Wrench } from "lucide-react";

interface Personal {
  id: string;
  nombre: string;
  email: string;
  rol: "admin" | "trainer" | "mantenimiento";
  telefono?: string;
  foto?: string;
  created_at: string;
}

export default function PersonalPage() {
  const [personal, setPersonal] = useState<Personal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "trainer",
    telefono: "",
  });

  useEffect(() => {
    fetchPersonal();
  }, []);

  const fetchPersonal = async () => {
    try {
      const res = await fetch("/api/personal");
      if (!res.ok) throw new Error("Error al obtener personal");
      const data = await res.json();
      setPersonal(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (p?: Personal) => {
    if (p) {
      setEditingId(p.id);
      setFormData({
        nombre: p.nombre,
        email: p.email,
        password: "", // Oculto al editar, opcional
        rol: p.rol,
        telefono: p.telefono || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: "",
        email: "",
        password: "",
        rol: "trainer",
        telefono: "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/personal/${editingId}` : "/api/personal";
      const method = editingId ? "PUT" : "POST";

      const dataToSubmit = { ...formData };
      if (editingId && !dataToSubmit.password) {
        delete (dataToSubmit as any).password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      await fetchPersonal();
      setModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === 'admin') {
      alert("No puedes eliminar al administrador principal.");
      return;
    }
    if (!confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      const res = await fetch(`/api/personal/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      await fetchPersonal();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getRoleIcon = (rol: string) => {
    switch (rol) {
      case "admin": return <Shield className="w-4 h-4 text-lee-red" />;
      case "trainer": return <UserCog className="w-4 h-4 text-lee-gold" />;
      case "mantenimiento": return <Wrench className="w-4 h-4 text-gray-400" />;
      default: return null;
    }
  };

  const getRoleLabel = (rol: string) => {
    switch (rol) {
      case "admin": return "Administrador";
      case "trainer": return "Entrenador";
      case "mantenimiento": return "Mantenimiento";
      default: return rol;
    }
  };

  if (loading) return <div className="text-lee-white">Cargando personal...</div>;
  if (error) return <div className="text-lee-red">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-lee-gold" style={{ fontFamily: "var(--font-bebas)" }}>
            PERSONAL DEL GIMNASIO
          </h1>
          <p className="text-sm text-lee-muted">Gestiona entrenadores, administradores y personal de mantenimiento</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-lee-gold text-lee-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-500 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Personal
        </button>
      </div>

      <div className="bg-lee-card border border-lee-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-lee-border bg-lee-dark/50">
                <th className="p-4 text-sm font-semibold text-lee-white">Nombre</th>
                <th className="p-4 text-sm font-semibold text-lee-white">Email</th>
                <th className="p-4 text-sm font-semibold text-lee-white">Rol</th>
                <th className="p-4 text-sm font-semibold text-lee-white">Teléfono</th>
                <th className="p-4 text-sm font-semibold text-lee-white text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personal.map((p) => (
                <tr key={p.id} className="border-b border-lee-border/50 hover:bg-lee-dark/30 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-lee-white">{p.nombre}</div>
                  </td>
                  <td className="p-4 text-sm text-lee-muted">{p.email}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-lee-muted">
                      {getRoleIcon(p.rol)}
                      <span className="capitalize">{getRoleLabel(p.rol)}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-lee-muted">{p.telefono || "N/A"}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(p)}
                        className="p-2 text-lee-muted hover:text-lee-gold transition-colors bg-lee-dark rounded-lg border border-lee-border"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={p.id === 'admin'}
                        className={`p-2 transition-colors bg-lee-dark rounded-lg border border-lee-border ${
                          p.id === 'admin' ? 'opacity-50 cursor-not-allowed text-lee-muted' : 'text-lee-muted hover:text-lee-red'
                        }`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {personal.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-lee-muted">
                    No hay personal registrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-lee-card border border-lee-border rounded-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-lee-white mb-4" style={{ fontFamily: "var(--font-bebas)" }}>
              {editingId ? "Editar Personal" : "Nuevo Personal"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-lee-muted mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-lee-muted mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                />
              </div>

              <div>
                <label className="block text-sm text-lee-muted mb-1">Contraseña {editingId && "(Opcional si no cambia)"}</label>
                <input
                  type="password"
                  required={!editingId}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-lee-muted mb-1">Rol</label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                    className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                  >
                    <option value="trainer">Entrenador</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-lee-muted mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full bg-lee-dark border border-lee-border rounded-lg px-4 py-2 text-lee-white focus:outline-none focus:border-lee-gold"
                  />
                </div>
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

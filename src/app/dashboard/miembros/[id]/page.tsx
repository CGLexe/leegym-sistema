"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit2, 
  Mail, 
  Phone, 
  Calendar, 
  Activity, 
  HeartPulse, 
  AlertCircle,
  CreditCard,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2
} from "lucide-react";
import MiembroForm from "@/components/MiembroForm";

export default function MiembroDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  
  const [miembro, setMiembro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  const fetchMiembro = async () => {
    try {
      const response = await fetch(`/api/miembros/${id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Error al cargar miembro");
      }
      
      setMiembro(data.miembro);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMiembro();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-lee-gold animate-spin" />
      </div>
    );
  }

  if (error || !miembro) {
    return (
      <div className="space-y-6">
        <Link 
          href="/dashboard/miembros"
          className="inline-flex items-center gap-2 text-lee-muted hover:text-lee-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a miembros
        </Link>
        <div className="p-4 bg-lee-red/10 border border-lee-red/30 rounded-xl flex items-center gap-3 text-lee-red">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p>{error || "Miembro no encontrado"}</p>
        </div>
      </div>
    );
  }

  const { membresia, historial_pagos, asistencia_reciente } = miembro;

  const tabs = [
    { id: "perfil", label: "Perfil", icon: <Activity className="w-4 h-4" /> },
    { id: "pagos", label: "Pagos y Membresía", icon: <CreditCard className="w-4 h-4" /> },
    { id: "asistencia", label: "Asistencia", icon: <History className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Volver */}
      <Link 
        href="/dashboard/miembros"
        className="inline-flex items-center gap-2 text-lee-muted hover:text-lee-white transition-colors text-sm font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a miembros
      </Link>

      {/* Cabecera del Perfil */}
      <div className="bg-lee-card border border-lee-border rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
        {/* Adorno de fondo */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-lee-gold/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-lee-dark border-2 border-lee-gold flex-shrink-0 overflow-hidden flex items-center justify-center text-lee-gold text-4xl font-bold" style={{ fontFamily: "var(--font-bebas)" }}>
          {miembro.foto ? (
            <img src={miembro.foto} alt={miembro.nombre} className="w-full h-full object-cover" />
          ) : (
            miembro.nombre.charAt(0).toUpperCase()
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-lee-white" style={{ fontFamily: "var(--font-bebas)" }}>
                {miembro.nombre}
              </h1>
              <p className="text-lee-gold font-medium mt-1">
                {membresia ? membresia.membresia_nombre : "Sin membresía activa"}
              </p>
            </div>
            <button
              onClick={() => setShowEditForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-lee-dark border border-lee-border text-lee-white rounded-lg hover:border-lee-gold transition-colors text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Editar Perfil
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-6 text-sm text-lee-muted">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {miembro.email}
            </div>
            {miembro.telefono && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {miembro.telefono}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Miembro desde {new Date(miembro.created_at).toLocaleDateString("es-MX", { year: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación de Tabs */}
      <div className="flex overflow-x-auto border-b border-lee-border no-scrollbar">
        <div className="flex gap-8 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                ${activeTab === tab.id 
                  ? "border-lee-gold text-lee-gold" 
                  : "border-transparent text-lee-muted hover:text-lee-white hover:border-lee-border"}
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de Tabs */}
      <div className="py-4">
        {/* TAB: PERFIL */}
        {activeTab === "perfil" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Info Personal */}
            <div className="bg-lee-card border border-lee-border rounded-xl p-6">
              <h3 className="text-xl font-bold text-lee-white mb-6" style={{ fontFamily: "var(--font-bebas)" }}>
                INFORMACIÓN PERSONAL
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-lee-muted mb-1">Nombre Completo</p>
                  <p className="text-lee-white font-medium">{miembro.nombre}</p>
                </div>
                <div>
                  <p className="text-sm text-lee-muted mb-1">Correo Electrónico</p>
                  <p className="text-lee-white font-medium">{miembro.email}</p>
                </div>
                <div>
                  <p className="text-sm text-lee-muted mb-1">Teléfono</p>
                  <p className="text-lee-white font-medium">{miembro.telefono || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-sm text-lee-muted mb-1">Fecha de Nacimiento</p>
                  <p className="text-lee-white font-medium">
                    {miembro.fecha_nacimiento 
                      ? new Date(miembro.fecha_nacimiento).toLocaleDateString("es-MX") 
                      : "No especificada"}
                  </p>
                </div>
              </div>
            </div>

            {/* Info Médica */}
            <div className="bg-lee-card border border-lee-border rounded-xl p-6">
              <h3 className="text-xl font-bold text-lee-white mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-bebas)" }}>
                <HeartPulse className="w-5 h-5 text-lee-red" />
                INFORMACIÓN MÉDICA
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-lee-muted mb-1">Condición Médica / Alergias</p>
                  {miembro.condicion_medica ? (
                    <div className="p-3 bg-lee-dark rounded-lg border border-lee-border">
                      <p className="text-lee-white text-sm">{miembro.condicion_medica}</p>
                    </div>
                  ) : (
                    <p className="text-lee-white font-medium">Ninguna reportada</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-lee-muted mb-1">Contacto de Emergencia</p>
                  {miembro.contacto_emergencia ? (
                    <div className="p-3 bg-lee-dark rounded-lg border border-lee-border">
                      <p className="text-lee-white text-sm whitespace-pre-line">{miembro.contacto_emergencia}</p>
                    </div>
                  ) : (
                    <p className="text-lee-white font-medium text-sm">No especificado</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PAGOS Y MEMBRESÍA */}
        {activeTab === "pagos" && (
          <div className="space-y-6">
            {/* Estado actual */}
            <div className="bg-lee-card border border-lee-border rounded-xl p-6">
              <h3 className="text-xl font-bold text-lee-white mb-6" style={{ fontFamily: "var(--font-bebas)" }}>
                ESTADO ACTUAL
              </h3>
              
              {membresia ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-lee-dark rounded-xl border border-lee-border">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-lee-white">{membresia.membresia_nombre}</h4>
                      {membresia.estado === "activa" ? (
                        <span className="px-2.5 py-1 bg-lee-green/20 text-lee-green text-xs font-medium rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Activa
                        </span>
                      ) : membresia.estado === "por_vencer" ? (
                        <span className="px-2.5 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-medium rounded-full flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Por vencer
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-lee-red/20 text-lee-red text-xs font-medium rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Vencida
                        </span>
                      )}
                    </div>
                    <p className="text-lee-muted text-sm">
                      Válida desde {new Date(membresia.fecha_inicio).toLocaleDateString("es-MX")} hasta {new Date(membresia.fecha_fin).toLocaleDateString("es-MX")}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end">
                    <p className="text-sm text-lee-muted mb-1">Días restantes</p>
                    <p className={`text-3xl font-bold ${membresia.estado === 'activa' ? 'text-lee-white' : membresia.estado === 'por_vencer' ? 'text-yellow-400' : 'text-lee-red'}`} style={{ fontFamily: "var(--font-bebas)" }}>
                      {membresia.dias_restantes}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-lee-dark rounded-xl border border-lee-border text-center">
                  <AlertCircle className="w-8 h-8 text-lee-muted mx-auto mb-3" />
                  <p className="text-lee-white font-medium">No hay membresía activa</p>
                  <p className="text-sm text-lee-muted mt-1">Este usuario no tiene ningún plan activo en este momento.</p>
                  <Link
                    href={`/dashboard/pagos/nuevo?usuario_id=${miembro.id}`}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-lee-gold text-lee-black font-semibold rounded-lg hover:bg-lee-gold/90 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Pago
                  </Link>
                </div>
              )}
            </div>

            {/* Historial */}
            <div className="bg-lee-card border border-lee-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-lee-border flex items-center justify-between">
                <h3 className="text-xl font-bold text-lee-white" style={{ fontFamily: "var(--font-bebas)" }}>
                  HISTORIAL DE PAGOS
                </h3>
                <Link
                  href={`/dashboard/pagos/nuevo?usuario_id=${miembro.id}`}
                  className="px-3 py-1.5 bg-lee-dark border border-lee-border rounded-lg text-lee-white hover:text-lee-gold transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Nuevo
                </Link>
              </div>
              
              {historial_pagos.length === 0 ? (
                <div className="p-8 text-center text-lee-muted">
                  No hay pagos registrados para este miembro.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-lee-border bg-lee-dark/50">
                        <th className="text-left text-sm font-medium text-lee-muted px-6 py-4">Fecha</th>
                        <th className="text-left text-sm font-medium text-lee-muted px-6 py-4">Membresía</th>
                        <th className="text-left text-sm font-medium text-lee-muted px-6 py-4">Monto</th>
                        <th className="text-left text-sm font-medium text-lee-muted px-6 py-4">Método</th>
                        <th className="text-left text-sm font-medium text-lee-muted px-6 py-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial_pagos.map((pago: any) => (
                        <tr key={pago.id} className="border-b border-lee-border last:border-0 hover:bg-lee-black/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-lee-white">
                            {new Date(pago.fecha_pago).toLocaleDateString("es-MX")}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-lee-white">
                            {pago.membresia_nombre || "Membresía eliminada"}
                          </td>
                          <td className="px-6 py-4 text-sm text-lee-gold font-medium">
                            ${pago.monto.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm text-lee-white/70 capitalize">
                            {pago.metodo.replace("_", " ")}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${pago.estado === 'aprobado' ? 'bg-lee-green/20 text-lee-green' : 
                                pago.estado === 'pendiente' ? 'bg-yellow-400/20 text-yellow-400' : 
                                'bg-lee-red/20 text-lee-red'}
                            `}>
                              {pago.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: ASISTENCIA */}
        {activeTab === "asistencia" && (
          <div className="bg-lee-card border border-lee-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-lee-border">
              <h3 className="text-xl font-bold text-lee-white" style={{ fontFamily: "var(--font-bebas)" }}>
                ÚLTIMAS VISITAS
              </h3>
            </div>
            
            {asistencia_reciente.length === 0 ? (
              <div className="p-8 text-center text-lee-muted">
                No hay registros de asistencia para este miembro.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-lee-border bg-lee-dark/50">
                      <th className="text-left text-sm font-medium text-lee-muted px-6 py-4">Fecha</th>
                      <th className="text-left text-sm font-medium text-lee-muted px-6 py-4">Hora Entrada</th>
                      <th className="text-left text-sm font-medium text-lee-muted px-6 py-4">Hora Salida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencia_reciente.map((reg: any) => (
                      <tr key={reg.id} className="border-b border-lee-border last:border-0 hover:bg-lee-black/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-lee-white">
                          {new Date(reg.fecha).toLocaleDateString("es-MX", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-sm text-lee-gold">
                          {reg.hora_entrada ? reg.hora_entrada.substring(0, 5) : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-lee-white/70">
                          {reg.hora_salida ? reg.hora_salida.substring(0, 5) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Form */}
      <MiembroForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        editingMiembro={miembro}
        onSuccess={(updated) => {
          setShowEditForm(false);
          fetchMiembro();
        }}
      />
    </div>
  );
}

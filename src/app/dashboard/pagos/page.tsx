"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  Plus, 
  DollarSign,
  Loader2,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
  Smartphone
} from "lucide-react";
import PagoForm from "@/components/PagoForm";

interface Pago {
  id: string;
  usuario_id: string;
  usuario_nombre: string;
  usuario_email: string;
  membresia_nombre: string | null;
  monto: number;
  metodo: string;
  estado: string;
  fecha_pago: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  referencia: string | null;
}

function useUrlFilters() {
  const searchParams = useSearchParams();
  return {
    estado: searchParams.get("estado") || "todos",
    metodo: searchParams.get("metodo") || "todos",
  };
}

function PagosContent() {
  const router = useRouter();
  const { estado, metodo } = useUrlFilters();
  
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  
  const [localEstado, setLocalEstado] = useState(estado);
  const [localMetodo, setLocalMetodo] = useState(metodo);

  const fetchPagos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (localEstado !== "todos") params.set("estado", localEstado);
      if (localMetodo !== "todos") params.set("metodo", localMetodo);

      const response = await fetch(`/api/pagos?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar pagos");
      }

      setPagos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, [localEstado, localMetodo]);

  const handleEstadoChange = (nuevoEstado: string) => {
    setLocalEstado(nuevoEstado);
    router.push(`/dashboard/pagos?estado=${nuevoEstado}&metodo=${localMetodo}`);
  };

  const handleMetodoChange = (nuevoMetodo: string) => {
    setLocalMetodo(nuevoMetodo);
    router.push(`/dashboard/pagos?estado=${localEstado}&metodo=${nuevoMetodo}`);
  };

  const handleSuccess = () => {
    setShowForm(false);
    fetchPagos();
  };

  const getMetodoIcon = (metodo: string) => {
    switch (metodo) {
      case "efectivo": return <Banknote className="w-4 h-4 text-green-500" />;
      case "tarjeta": return <CreditCard className="w-4 h-4 text-blue-400" />;
      case "transferencia": return <Smartphone className="w-4 h-4 text-purple-400" />;
      case "stripe": return <CreditCard className="w-4 h-4 text-indigo-500" />;
      default: return <DollarSign className="w-4 h-4 text-lee-muted" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 
            className="text-2xl sm:text-3xl font-bold text-lee-gold"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            PAGOS E INGRESOS
          </h1>
          <p className="text-lee-muted mt-1">
            Gestiona los pagos manuales y revisa el historial
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-lee-gold text-lee-black font-semibold rounded-lg hover:bg-lee-gold/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Registrar Pago
        </button>
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

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-lee-muted">Estado:</span>
          <select 
            value={localEstado} 
            onChange={(e) => handleEstadoChange(e.target.value)}
            className="bg-lee-card border border-lee-border text-lee-white text-sm rounded-lg focus:ring-lee-gold focus:border-lee-gold block w-40 p-2.5"
          >
            <option value="todos">Todos</option>
            <option value="aprobado">Aprobado</option>
            <option value="pendiente">Pendiente</option>
            <option value="rechazado">Rechazado</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-lee-muted">Método:</span>
          <select 
            value={localMetodo} 
            onChange={(e) => handleMetodoChange(e.target.value)}
            className="bg-lee-card border border-lee-border text-lee-white text-sm rounded-lg focus:ring-lee-gold focus:border-lee-gold block w-40 p-2.5"
          >
            <option value="todos">Todos</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta (Terminal)</option>
            <option value="transferencia">Transferencia</option>
            <option value="stripe">Stripe (Online)</option>
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-lee-card border border-lee-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-lee-gold animate-spin" />
          </div>
        ) : pagos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <DollarSign className="w-12 h-12 text-lee-muted mb-4" />
            <p className="text-lee-white font-medium">No hay pagos registrados</p>
            <p className="text-lee-muted text-sm mt-1">
              Prueba con otros filtros o registra el primer pago
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-lee-muted uppercase bg-lee-black/50 border-b border-lee-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Miembro</th>
                  <th className="px-6 py-4 font-medium">Concepto</th>
                  <th className="px-6 py-4 font-medium">Método</th>
                  <th className="px-6 py-4 font-medium">Monto</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id} className="border-b border-lee-border hover:bg-lee-black/30 transition-colors">
                    <td className="px-6 py-4 text-lee-white/70 whitespace-nowrap">
                      {new Date(pago.fecha_pago).toLocaleString("es-MX", {
                        dateStyle: "short",
                        timeStyle: "short"
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-lee-white">{pago.usuario_nombre}</div>
                      <div className="text-xs text-lee-muted">{pago.usuario_email}</div>
                    </td>
                    <td className="px-6 py-4 text-lee-white/80">
                      {pago.membresia_nombre || "Pago General"}
                      {pago.referencia && <span className="block text-xs text-lee-muted truncate max-w-[150px]">{pago.referencia}</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-lee-white/80 capitalize">
                        {getMetodoIcon(pago.metodo)}
                        {pago.metodo}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-lee-white">
                      ${pago.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-block
                        ${pago.estado === "aprobado" ? "bg-lee-green/20 text-lee-green" : ""}
                        ${pago.estado === "pendiente" ? "bg-yellow-500/20 text-yellow-400" : ""}
                        ${pago.estado === "rechazado" ? "bg-lee-red/20 text-lee-red" : ""}
                      `}>
                        {pago.estado.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PagoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default function PagosPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-lee-gold animate-spin" />
      </div>
    }>
      <PagosContent />
    </Suspense>
  );
}

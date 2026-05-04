import { redirect } from "next/navigation";
import { getDashboardStats, getUltimosPagos, getMembresiasPorVencer, getAsistenciaPorDia } from "@/lib/dashboard";
import { Users, DollarSign, CalendarClock, CalendarCheck, TrendingUp, AlertTriangle } from "lucide-react";

// Función para obtener datos del dashboard en el servidor
async function getData() {
  const stats = getDashboardStats();
  const ultimosPagos = getUltimosPagos(5);
  const membresiasPorVencer = getMembresiasPorVencer(5);
  const asistenciaPorDia = getAsistenciaPorDia();
  
  return {
    stats,
    ultimosPagos,
    membresiasPorVencer,
    asistenciaPorDia,
  };
}

// Componente de tarjeta de estadística
function StatCard({ 
  title, 
  value, 
  icon, 
  color,
  prefix = "",
  suffix = "" 
}: { 
  title: string; 
  value: string | number;
  icon: React.ReactNode;
  color: "gold" | "green" | "red" | "blue";
  prefix?: string;
  suffix?: string;
}) {
  const colorClasses = {
    gold: "bg-lee-gold/10 text-lee-gold border-lee-gold/20",
    green: "bg-lee-green/10 text-lee-green border-lee-green/20",
    red: "bg-lee-red/10 text-lee-red border-lee-red/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const iconBgClasses = {
    gold: "bg-lee-gold/20 text-lee-gold",
    green: "bg-lee-green/20 text-lee-green",
    red: "bg-lee-red/20 text-lee-red",
    blue: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="bg-lee-card border border-lee-border rounded-lg p-4 sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-lee-muted mb-1">{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${color === "gold" ? "text-lee-gold" : "text-lee-white"}`}>
            {prefix}{typeof value === "number" ? value.toLocaleString("es-MX") : value}{suffix}
          </p>
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${iconBgClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Componente de gráfica de barras simple
function AttendanceChart({ data }: { data: { dia: string; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="bg-lee-card border border-lee-border rounded-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-lee-white mb-4" style={{ fontFamily: "var(--font-bebas)" }}>
        ASISTENCIA POR DÍA
      </h3>
      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full bg-lee-dark rounded-t-md relative flex-1 flex items-end">
              <div 
                className="w-full bg-lee-gold rounded-t-md transition-all duration-300"
                style={{ 
                  height: `${(item.count / maxCount) * 100}%`,
                  minHeight: item.count > 0 ? "4px" : "0"
                }}
              />
              {item.count > 0 && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-lee-white font-medium">
                  {item.count}
                </span>
              )}
            </div>
            <span className="text-xs text-lee-muted truncate w-full text-center">
              {item.dia.substring(0, 3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de lista de pagos recientes
function RecentPayments({ pagos }: { pagos: any[] }) {
  return (
    <div className="bg-lee-card border border-lee-border rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-lee-white" style={{ fontFamily: "var(--font-bebas)" }}>
          ÚLTIMOS PAGOS
        </h3>
        <TrendingUp className="w-5 h-5 text-lee-gold" />
      </div>
      
      {pagos.length === 0 ? (
        <p className="text-lee-muted text-center py-4">No hay pagos registrados</p>
      ) : (
        <div className="space-y-3">
          {pagos.map((pago) => (
            <div 
              key={pago.id} 
              className="flex items-center justify-between py-2 border-b border-lee-border last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-lee-white truncate">
                  {pago.miembro?.nombre || "Usuario"}
                </p>
                <p className="text-xs text-lee-muted">
                  {new Date(pago.fecha_pago).toLocaleDateString("es-MX")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-lee-green">
                  +${pago.monto.toLocaleString("es-MX")}
                </p>
                <span className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${pago.estado === "aprobado" ? "bg-lee-green/20 text-lee-green" : ""}
                  ${pago.estado === "pendiente" ? "bg-yellow-500/20 text-yellow-400" : ""}
                  ${pago.estado === "rechazado" ? "bg-lee-red/20 text-lee-red" : ""}
                `}>
                  {pago.estado}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente de membresías por vencer
function ExpiringMemberships({ membresias }: { membresias: any[] }) {
  return (
    <div className="bg-lee-card border border-lee-border rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-lee-white" style={{ fontFamily: "var(--font-bebas)" }}>
          POR VENCER
        </h3>
        <AlertTriangle className="w-5 h-5 text-lee-red" />
      </div>
      
      {membresias.length === 0 ? (
        <p className="text-lee-muted text-center py-4">No hay membresías por vencer</p>
      ) : (
        <div className="space-y-3">
          {membresias.map((m) => (
            <div 
              key={m.id} 
              className="flex items-center justify-between py-2 border-b border-lee-border last:border-0"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-lee-white truncate">
                  {m.nombre_miembro}
                </p>
                <p className="text-xs text-lee-muted">
                  {m.membresia}
                </p>
              </div>
              <div className="text-right">
                <p className={`
                  text-sm font-bold
                  ${m.dias_restantes <= 1 ? "text-lee-red" : m.dias_restantes <= 3 ? "text-yellow-400" : "text-lee-gold"}
                `}>
                  {m.dias_restantes === 0 
                    ? "Hoy" 
                    : m.dias_restantes === 1 
                      ? "1 día" 
                      : `${m.dias_restantes} días`}
                </p>
                <p className="text-xs text-lee-muted">
                  {new Date(m.fecha_fin).toLocaleDateString("es-MX")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  // Verificar si hay un token (en un caso real, esto sería manejado por middleware)
  // Por ahora, simplemente intentamos obtener los datos
  
  let data;
  try {
    data = await getData();
  } catch (error) {
    // Si hay error, probablemente no hay conexión a la base de datos
    // Mostramos valores por defecto
    data = {
      stats: {
        miembrosActivos: 0,
        ingresosMes: 0,
        membresiasPorVencer: 0,
        asistenciaHoy: 0,
      },
      ultimosPagos: [],
      membresiasPorVencer: [],
      asistenciaPorDia: [
        { dia: "Lunes", count: 0 },
        { dia: "Martes", count: 0 },
        { dia: "Miércoles", count: 0 },
        { dia: "Jueves", count: 0 },
        { dia: "Viernes", count: 0 },
        { dia: "Sábado", count: 0 },
        { dia: "Domingo", count: 0 },
      ],
    };
  }

  const { stats, ultimosPagos, membresiasPorVencer, asistenciaPorDia } = data;

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div>
        <h1 
          className="text-2xl sm:text-3xl font-bold text-lee-gold"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          BIENVENIDO A LEE GYM
        </h1>
        <p className="text-lee-muted mt-1">
          Resumen de tu gimnasio
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Miembros Activos"
          value={stats.miembrosActivos}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="gold"
        />
        <StatCard
          title="Ingresos del Mes"
          value={stats.ingresosMes}
          icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="green"
          prefix="$"
        />
        <StatCard
          title="Por Vencer (7 días)"
          value={stats.membresiasPorVencer}
          icon={<CalendarClock className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="red"
        />
        <StatCard
          title="Asistencia Hoy"
          value={stats.asistenciaHoy}
          icon={<CalendarCheck className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="blue"
        />
      </div>

      {/* Chart and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Chart */}
        <AttendanceChart data={asistenciaPorDia} />
        
        {/* Expiring Memberships */}
        <ExpiringMemberships membresias={membresiasPorVencer} />
      </div>

      {/* Recent Payments */}
      <RecentPayments pagos={ultimosPagos} />
    </div>
  );
}
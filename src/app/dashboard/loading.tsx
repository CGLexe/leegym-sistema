"use client";

// Skeleton para tarjeta de estadística
function StatCardSkeleton() {
  return (
    <div className="bg-lee-card border border-lee-border rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-lee-dark rounded mb-2" />
          <div className="h-8 w-16 bg-lee-dark rounded" />
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-lee-dark rounded-lg" />
      </div>
    </div>
  );
}

// Skeleton para gráfica de asistencia
function ChartSkeleton() {
  return (
    <div className="bg-lee-card border border-lee-border rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="h-6 w-40 bg-lee-dark rounded mb-4" />
      <div className="flex items-end justify-between gap-2 h-40">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div 
              className="w-full bg-lee-dark rounded-t-md"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
            <div className="h-3 w-8 bg-lee-dark rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para lista de pagos
function PaymentsListSkeleton() {
  return (
    <div className="bg-lee-card border border-lee-border rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="h-6 w-32 bg-lee-dark rounded mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <div className="h-4 w-32 bg-lee-dark rounded mb-1" />
              <div className="h-3 w-20 bg-lee-dark rounded" />
            </div>
            <div className="text-right">
              <div className="h-4 w-16 bg-lee-dark rounded mb-1" />
              <div className="h-3 w-12 bg-lee-dark rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton para lista de membresías por vencer
function ExpiringListSkeleton() {
  return (
    <div className="bg-lee-card border border-lee-border rounded-lg p-4 sm:p-6 animate-pulse">
      <div className="h-6 w-28 bg-lee-dark rounded mb-4" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex-1">
              <div className="h-4 w-28 bg-lee-dark rounded mb-1" />
              <div className="h-3 w-20 bg-lee-dark rounded" />
            </div>
            <div className="text-right">
              <div className="h-4 w-12 bg-lee-dark rounded mb-1" />
              <div className="h-3 w-16 bg-lee-dark rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Título esqueleto */}
      <div>
        <div className="h-8 w-48 bg-lee-dark rounded" />
        <div className="h-4 w-32 bg-lee-dark rounded mt-2" />
      </div>

      {/* Stats Cards skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Chart and Lists skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ExpiringListSkeleton />
      </div>

      {/* Payments List skeleton */}
      <PaymentsListSkeleton />
    </div>
  );
}
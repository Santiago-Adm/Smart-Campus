/**
 * Analytics Dashboard
 * Página principal de analítica con KPIs y gráficos
 */

import { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  BookOpen,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import analyticsService from '@/services/analyticsService';
import KPICard from '@/components/analytics/KPICard';
import LoadingSkeleton from '@/components/analytics/LoadingSkeleton';
import { formatNumber, formatPercentage } from '@/constants/analytics';

const AnalyticsDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar datos del dashboard
   */
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 Loading dashboard data...');

      const response = await analyticsService.getDashboardData();

      console.log('✅ Dashboard data loaded:', response);

      if (response && response.success && response.data) {
        setDashboardData(response.data);
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      setError('Error al cargar el dashboard');
      toast.error('Error al cargar los datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>

          {/* KPIs Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <LoadingSkeleton key={i} type="kpi" />
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <LoadingSkeleton key={i} type="chart" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Datos disponibles
  const { overview, users, documents, library, appointments, simulations } = dashboardData || {};

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Dashboard de Analítica
          </h1>
          <p className="text-gray-600">
            Visualiza las métricas clave del sistema en tiempo real
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Estudiantes */}
          <KPICard
            title="Total Estudiantes"
            value={formatNumber(overview?.totalStudents || 0)}
            subtitle={`${formatNumber(users?.activeUsers || 0)} activos`}
            icon={Users}
            color="indigo"
            trend={users?.activeRate > 75 ? 'up' : users?.activeRate < 50 ? 'down' : null}
            trendValue={users?.activeRate ? `${formatPercentage(users.activeRate)} activos` : null}
          />

          {/* Total Docentes */}
          <KPICard
            title="Total Docentes"
            value={formatNumber(overview?.totalTeachers || 0)}
            subtitle="Personal académico"
            icon={Users}
            color="purple"
          />

          {/* Documentos */}
          <KPICard
            title="Documentos"
            value={formatNumber(documents?.total || 0)}
            subtitle={`${formatNumber(documents?.approved || 0)} aprobados`}
            icon={FileText}
            color="blue"
            trend={documents?.approvalRate > 80 ? 'up' : documents?.approvalRate < 60 ? 'down' : null}
            trendValue={documents?.approvalRate ? `${formatPercentage(documents.approvalRate)} aprobados` : null}
          />

          {/* Biblioteca */}
          <KPICard
            title="Recursos en Biblioteca"
            value={formatNumber(library?.totalResources || 0)}
            subtitle={`${formatNumber(library?.totalViews || 0)} visualizaciones`}
            icon={BookOpen}
            color="green"
          />

          {/* Citas */}
          <KPICard
            title="Citas Completadas"
            value={formatNumber(appointments?.completed || 0)}
            subtitle={`${formatNumber(appointments?.upcoming || 0)} próximas`}
            icon={Calendar}
            color="amber"
            trend={appointments?.completionRate > 80 ? 'up' : appointments?.completionRate < 60 ? 'down' : null}
            trendValue={appointments?.completionRate ? `${formatPercentage(appointments.completionRate)} completitud` : null}
          />

          {/* Simulaciones */}
          <KPICard
            title="Simulaciones AR"
            value={formatNumber(simulations?.totalSimulations || 0)}
            subtitle={`Promedio: ${simulations?.averageScore?.toFixed(1) || 0}/100`}
            icon={TrendingUp}
            color="red"
            trend={simulations?.averageScore > 75 ? 'up' : simulations?.averageScore < 60 ? 'down' : null}
            trendValue={simulations?.averageScore ? `${simulations.averageScore.toFixed(1)}/100 puntos` : null}
          />
        </div>

        {/* Gráficos - Los agregaremos en el siguiente paso */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-center text-gray-500">
            📈 Gráficos próximamente...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

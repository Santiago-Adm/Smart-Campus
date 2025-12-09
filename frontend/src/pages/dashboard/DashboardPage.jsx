import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import {
  FileText,
  BookOpen,
  Video,
  Stethoscope,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Users,
  BarChart3
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Loader from '@/components/common/Loader';
import dashboardService from '@/services/dashboardService';
import documentService from '@/services/documentService';
import libraryService from '@/services/libraryService';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [myDocuments, setMyDocuments] = useState([]);
  const [popularResources, setPopularResources] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Cargar datos del dashboard desde analytics
      const dashData = await dashboardService.getDashboardData();
      console.log('📊 Dashboard data:', dashData);
      setDashboardData(dashData);

      // Cargar documentos del usuario
      if (user?.roles?.some(r => ['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN'].includes(r))) {
        try {
          const docsResponse = await documentService.getAll({ limit: 5 });
          console.log('📄 My documents:', docsResponse);
          setMyDocuments(docsResponse.documents || []);
        } catch (error) {
          console.log('Could not load documents:', error.message);
        }
      }

      // Cargar recursos populares
      try {
        const resourcesResponse = await libraryService.getPopular();
        console.log('📚 Popular resources:', resourcesResponse);
        setPopularResources(resourcesResponse || []);
      } catch (error) {
        console.log('Could not load resources:', error.message);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Cargando dashboard..." />;
  }

  // Preparar estadísticas desde dashboardData
  const stats = [
    {
      title: 'Documentos Pendientes',
      value: dashboardData?.documents?.pending || 0,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Recursos en Biblioteca',
      value: dashboardData?.library?.totalResources || 0,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Simulaciones Disponibles',
      value: dashboardData?.simulations?.totalScenarios || 0,
      icon: Video,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Citas Programadas',
      value: dashboardData?.appointments?.upcoming || 0,
      icon: Stethoscope,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          ¡Bienvenido, {user?.firstName}! 👋
        </h1>
        <p className="text-primary-100">
          {user?.roles?.includes('STUDENT') && 'Panel de estudiante - Gestiona tus documentos y accede a recursos educativos'}
          {user?.roles?.includes('TEACHER') && 'Panel de docente - Supervisa a tus estudiantes y crea contenido'}
          {user?.roles?.includes('ADMINISTRATIVE') && 'Panel administrativo - Valida documentos y gestiona usuarios'}
          {user?.roles?.includes('IT_ADMIN') && 'Panel de administrador - Controla el sistema completo'}
          {user?.roles?.includes('DIRECTOR') && 'Panel ejecutivo - Vista estratégica del instituto'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} hover>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-4 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Sistema Stats (Admin/Director) */}
      {(user?.roles?.includes('IT_ADMIN') || user?.roles?.includes('DIRECTOR') || user?.roles?.includes('ADMINISTRATIVE')) && dashboardData?.users && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Estadísticas del Sistema
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {dashboardData.users.totalUsers || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Usuarios Totales</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {dashboardData.users.totalStudents || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Estudiantes</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {dashboardData.users.totalTeachers || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Docentes</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {dashboardData.users.activeUsers || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Usuarios Activos</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {user?.roles?.includes('ADMINISTRATIVE') || user?.roles?.includes('IT_ADMIN')
                ? 'Documentos Recientes (Sistema)'
                : 'Mis Documentos Recientes'}
            </h2>
            <button
              onClick={() => navigate('/documents')}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver todos →
            </button>
          </div>

          {myDocuments.length > 0 ? (
            <div className="space-y-3">
              {myDocuments.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/documents')}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {doc.metadata?.type || 'Documento'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.createdAt).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      doc.status === 'APPROVED' ? 'success' :
                      doc.status === 'REJECTED' ? 'danger' :
                      doc.status === 'IN_REVIEW' ? 'info' : 'warning'
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No hay documentos aún</p>
              <button
                onClick={() => navigate('/documents')}
                className="btn-primary"
              >
                Subir mi primer documento
              </button>
            </div>
          )}
        </Card>

        {/* Popular Resources */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recursos Populares
            </h2>
          </div>

          {popularResources.length > 0 ? (
            <div className="space-y-3">
              {popularResources.slice(0, 5).map((resource) => (
                <div
                  key={resource.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
                  onClick={() => navigate('/library')}
                >
                  <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {resource.title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>👁️ {resource.viewCount || 0} vistas</span>
                    {resource.category && (
                      <span className="px-2 py-0.5 bg-gray-100 rounded">
                        {resource.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No hay recursos disponibles</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/documents')}
            className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors group"
          >
            <FileText className="w-8 h-8 text-gray-600 group-hover:text-primary-600" />
            <span className="text-sm font-medium">Ver Documentos</span>
          </button>
          <button
            onClick={() => navigate('/library')}
            className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors group"
          >
            <BookOpen className="w-8 h-8 text-gray-600 group-hover:text-primary-600" />
            <span className="text-sm font-medium">Buscar Recursos</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors group">
            <Video className="w-8 h-8 text-gray-600 group-hover:text-primary-600" />
            <span className="text-sm font-medium">Simulaciones</span>
          </button>
          <button className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors group">
            <Stethoscope className="w-8 h-8 text-gray-600 group-hover:text-primary-600" />
            <span className="text-sm font-medium">Teleenfermería</span>
          </button>
        </div>
      </Card>
    </div>
  );
}

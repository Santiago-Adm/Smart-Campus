import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentFilters from '@/components/documents/DocumentFilters';
import documentService from '@/services/documentService';
import toast from 'react-hot-toast';

export default function DocumentsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    documentType: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const isAdmin = user?.roles?.some(r => ['IT_ADMIN', 'ADMINISTRATIVE'].includes(r));

  useEffect(() => {
    loadDocuments();
  }, [pagination.page, filters]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      };

      const response = await documentService.getAll(params);
      console.log('📄 Documents loaded:', response);

      setDocuments(response.data || []);
      setPagination(response.pagination || pagination);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 }); // Reset a página 1
  };

  const handleView = (document) => {
    navigate(`/documents/${document.id}`);
  };

  const handleDelete = async (document) => {
    if (!window.confirm('¿Estás seguro de eliminar este documento?')) {
      return;
    }

    try {
      await documentService.delete(document.id);
      toast.success('Documento eliminado exitosamente');
      loadDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar documento');
    }
  };

  const handleApprove = async (document) => {
    if (!window.confirm('¿Aprobar este documento?')) {
      return;
    }

    try {
      await documentService.approve(document.id, '');
      toast.success('Documento aprobado exitosamente');
      loadDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error(error.response?.data?.message || 'Error al aprobar documento');
    }
  };

  const handleReject = (document) => {
    const reason = window.prompt('Motivo del rechazo (mínimo 10 caracteres):');

    if (!reason) {
      return;
    }

    if (reason.trim().length < 10) {
      toast.error('El motivo debe tener al menos 10 caracteres');
      return;
    }

    performReject(document.id, reason);
  };

  const performReject = async (documentId, reason) => {
    try {
      await documentService.reject(documentId, reason);
      toast.success('Documento rechazado');
      loadDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error(error.response?.data?.message || 'Error al rechazar documento');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  if (loading && documents.length === 0) {
    return <Loader fullScreen text="Cargando documentos..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Gestión de Documentos' : 'Mis Documentos'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? 'Administra y valida documentos de estudiantes'
              : 'Gestiona tus documentos académicos'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DocumentFilters onFilter={handleFilter} initialFilters={filters} />

          {/* ✅ ESTUDIANTES, ADMINISTRATIVE y IT_ADMIN pueden subir */}
          {(user?.roles?.includes('STUDENT') ||
            user?.roles?.includes('ADMINISTRATIVE') ||
            user?.roles?.includes('IT_ADMIN')) && (
            <button
              onClick={() => navigate('/documents/upload')}
              className="btn-primary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>
                {isAdmin ? 'Subir Documento (Por Usuario)' : 'Subir Documento'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards (Admin only) */}
      {isAdmin && documents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(d => d.status === 'PENDING').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Pendientes</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {documents.filter(d => d.status === 'IN_REVIEW').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">En Revisión</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'APPROVED').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Aprobados</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {documents.filter(d => d.status === 'REJECTED').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Rechazados</p>
            </div>
          </Card>
        </div>
      )}

      {/* Documents Grid */}
      {documents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onView={handleView}
                onDelete={handleDelete}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions
                isAdmin={isAdmin}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Anterior
              </button>

              <div className="flex items-center gap-2">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Mostrar solo algunas páginas
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          page === pagination.page
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === pagination.page - 2 ||
                    page === pagination.page + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      ) : (
        // Empty State
        <Card>
          <div className="text-center py-12">
            {filters.documentType || filters.status || filters.dateFrom || filters.dateTo ? (
              // No results with filters
              <>
                <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No se encontraron documentos
                </h3>
                <p className="text-gray-600 mb-6">
                  Intenta ajustar los filtros para ver más resultados
                </p>
                <button
                  onClick={() => handleFilter({ documentType: '', status: '', dateFrom: '', dateTo: '' })}
                  className="btn-secondary"
                >
                  Limpiar Filtros
                </button>
              </>
            ) : (
              // No documents at all
              <>
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isAdmin ? 'No hay documentos registrados' : 'Aún no has subido documentos'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isAdmin
                    ? 'Los documentos subidos por estudiantes aparecerán aquí'
                    : 'Comienza subiendo tu primer documento para iniciar tu proceso de matrícula'}
                </p>
                {!isAdmin && (
                  <button
                    onClick={() => navigate('/documents/upload')}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Subir mi primer documento</span>
                  </button>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

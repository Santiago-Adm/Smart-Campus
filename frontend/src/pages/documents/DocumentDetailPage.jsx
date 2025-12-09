import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Download,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Clock
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Card from '@/components/common/Card';
import Loader from '@/components/common/Loader';
import DocumentStatusBadge from '@/components/documents/DocumentStatusBadge';
import { DOCUMENT_TYPE_LABELS, formatFileSize } from '@/constants/documents';
import documentService from '@/services/documentService';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function DocumentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [document, setDocument] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const isAdmin = user?.roles?.some(r => ['IT_ADMIN', 'ADMINISTRATIVE'].includes(r));
  const isOwner = document && document.userId === user?.userId;
  const canApprove = isAdmin && (document?.status === 'PENDING' || document?.status === 'IN_REVIEW');
  const canReject = isAdmin && (document?.status === 'PENDING' || document?.status === 'IN_REVIEW');
  const canDelete = (isOwner && document?.status !== 'APPROVED') || isAdmin;

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const response = await documentService.getById(id);
      console.log('📄 Document loaded:', response);
      setDocument(response.data);
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Error al cargar documento');
      navigate('/documents');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('¿Aprobar este documento?')) {
      return;
    }

    try {
      await documentService.approve(id, '');
      toast.success('Documento aprobado exitosamente');
      loadDocument();
    } catch (error) {
      console.error('Error approving document:', error);
      toast.error(error.response?.data?.message || 'Error al aprobar documento');
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const performReject = async () => {
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      toast.error('El motivo debe tener al menos 10 caracteres');
      return;
    }

    try {
      await documentService.reject(id, rejectReason);
      toast.success('Documento rechazado');
      setShowRejectModal(false);
      setRejectReason('');
      loadDocument();
    } catch (error) {
      console.error('Error rejecting document:', error);
      toast.error(error.response?.data?.message || 'Error al rechazar documento');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este documento?')) {
      return;
    }

    try {
      await documentService.delete(id);
      toast.success('Documento eliminado exitosamente');
      navigate('/documents');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar documento');
    }
  };

  const handleDownload = () => {
    if (document?.fileUrl) {
      window.open(document.fileUrl, '_blank');
    }
  };

  if (loading) {
    return <Loader fullScreen text="Cargando documento..." />;
  }

  if (!document) {
    return null;
  }

  const typeLabel = DOCUMENT_TYPE_LABELS[document.metadata?.type] || document.metadata?.type;
  const fileSize = formatFileSize(document.metadata?.fileSize || 0);
  const createdAgo = formatDistanceToNow(new Date(document.createdAt), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{typeLabel}</h1>
            <p className="text-gray-600 mt-1">{document.metadata?.fileName}</p>
          </div>
        </div>

        <DocumentStatusBadge status={document.status} size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Información del Documento
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Tipo de Documento</p>
                  <p className="text-sm font-medium text-gray-900">{typeLabel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Fecha de Emisión</p>
                  <p className="text-sm font-medium text-gray-900">
                    {document.metadata?.issueDate
                      ? new Date(document.metadata.issueDate).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'No especificada'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Subido</p>
                  <p className="text-sm font-medium text-gray-900">{createdAgo}</p>
                </div>
              </div>

              {document.metadata?.description && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">Descripción</p>
                  <p className="text-sm text-gray-900">{document.metadata.description}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Review Info */}
          {document.status === 'APPROVED' && document.reviewedAt && (
            <Card className="bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800 mb-1">
                    Documento Aprobado
                  </p>
                  <p className="text-sm text-green-700">
                    Aprobado {formatDistanceToNow(new Date(document.reviewedAt), {
                      addSuffix: true,
                      locale: es
                    })}
                  </p>
                  {document.reviewNotes && (
                    <p className="text-sm text-green-700 mt-2">
                      <span className="font-medium">Notas:</span> {document.reviewNotes}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {document.status === 'REJECTED' && document.rejectionReason && (
            <Card className="bg-red-50 border-red-200">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Documento Rechazado
                  </p>
                  {document.reviewedAt && (
                    <p className="text-sm text-red-700 mb-2">
                      Rechazado {formatDistanceToNow(new Date(document.reviewedAt), {
                        addSuffix: true,
                        locale: es
                      })}
                    </p>
                  )}
                  <div className="mt-2 p-3 bg-red-100 rounded-lg">
                    <p className="text-xs font-medium text-red-800 mb-1">Motivo del rechazo:</p>
                    <p className="text-sm text-red-700">{document.rejectionReason}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {document.status === 'PENDING' && (
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    Pendiente de Revisión
                  </p>
                  <p className="text-sm text-yellow-700">
                    Tu documento está en cola para ser revisado por el personal administrativo.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Document Preview */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Vista Previa
            </h2>

            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              {document.metadata?.mimeType === 'application/pdf' ? (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">
                    Vista previa de PDF no disponible
                  </p>
                  <button
                    onClick={handleDownload}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver Documento</span>
                  </button>
                </div>
              ) : (
                <img
                  src={document.fileUrl}
                  alt={document.metadata?.fileName}
                  className="w-full h-full object-contain rounded-lg"
                />
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* File Info */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Información del Archivo
            </h3>

            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Nombre</p>
                <p className="text-sm font-medium text-gray-900 break-all">
                  {document.metadata?.fileName}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600">Tamaño</p>
                <p className="text-sm font-medium text-gray-900">{fileSize}</p>
              </div>

              <div>
                <p className="text-xs text-gray-600">Formato</p>
                <p className="text-sm font-medium text-gray-900">
                  {document.metadata?.mimeType}
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Acciones</h3>

            <div className="space-y-2">
              {/* Download */}
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Descargar</span>
              </button>

              {/* Approve (Admin) */}
              {canApprove && (
                <button
                  onClick={handleApprove}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Aprobar Documento</span>
                </button>
              )}

              {/* Reject (Admin) */}
              {canReject && (
                <button
                  onClick={handleReject}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Rechazar Documento</span>
                </button>
              )}

              {/* Delete */}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Documento</span>
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Rechazar Documento
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo del rechazo <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                placeholder="Explica el motivo del rechazo (mínimo 10 caracteres)..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {rejectReason.length}/500 caracteres
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={performReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Rechazar Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

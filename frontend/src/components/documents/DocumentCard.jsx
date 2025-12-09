import PropTypes from 'prop-types';
import { FileText, Calendar, Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import DocumentStatusBadge from './DocumentStatusBadge';
import { DOCUMENT_TYPE_LABELS, formatFileSize } from '@/constants/documents';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Tarjeta de documento individual
 */
export default function DocumentCard({
  document,
  onView,
  onDelete,
  onApprove,
  onReject,
  showActions = false,
  isAdmin = false,
}) {
  const typeLabel = DOCUMENT_TYPE_LABELS[document.metadata?.type] || document.metadata?.type;
  const fileSize = formatFileSize(document.metadata?.fileSize || 0);

  const createdAgo = formatDistanceToNow(new Date(document.createdAt), {
    addSuffix: true,
    locale: es,
  });

  const canApprove = isAdmin && (document.status === 'PENDING' || document.status === 'IN_REVIEW');
  const canReject = isAdmin && (document.status === 'PENDING' || document.status === 'IN_REVIEW');

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 rounded-lg">
            <FileText className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{typeLabel}</h3>
            <p className="text-xs text-gray-500">{document.metadata?.fileName}</p>
          </div>
        </div>
        <DocumentStatusBadge status={document.status} size="sm" />
      </div>

      {/* Metadata */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{createdAgo}</span>
        </div>
        {document.metadata?.fileSize && (
          <div className="text-xs text-gray-600">
            Tamaño: {fileSize}
          </div>
        )}
        {document.metadata?.description && (
          <p className="text-xs text-gray-600 line-clamp-2">
            {document.metadata.description}
          </p>
        )}
      </div>

      {/* Review Info */}
      {document.status === 'REJECTED' && document.rejectionReason && (
        <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-700 font-medium mb-1">Motivo del rechazo:</p>
          <p className="text-xs text-red-600">{document.rejectionReason}</p>
        </div>
      )}

      {document.status === 'APPROVED' && document.reviewedAt && (
        <div className="mb-4 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-700">
            Aprobado {formatDistanceToNow(new Date(document.reviewedAt), { addSuffix: true, locale: es })}
          </p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {/* Ver documento */}
          <button
            onClick={() => onView(document)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>Ver</span>
          </button>

          {/* Aprobar (Admin) */}
          {canApprove && (
            <button
              onClick={() => onApprove(document)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Aprobar</span>
            </button>
          )}

          {/* Rechazar (Admin) */}
          {canReject && (
            <button
              onClick={() => onReject(document)}
              className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Rechazar</span>
            </button>
          )}

          {/* Eliminar (Owner o Admin) */}
          {!isAdmin && document.status !== 'APPROVED' && (
            <button
              onClick={() => onDelete(document)}
              className="flex items-center justify-center p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

DocumentCard.propTypes = {
  document: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    metadata: PropTypes.shape({
      type: PropTypes.string,
      fileName: PropTypes.string,
      fileSize: PropTypes.number,
      description: PropTypes.string,
    }),
    rejectionReason: PropTypes.string,
    reviewedAt: PropTypes.string,
    createdAt: PropTypes.string.isRequired,
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  showActions: PropTypes.bool,
  isAdmin: PropTypes.bool,
};

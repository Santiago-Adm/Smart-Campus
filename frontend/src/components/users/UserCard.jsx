import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import Button from '@/components/common/Button';

export default function UserCard({ user, onApprove, onReject, onViewDetails, isLoading = false }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
      {/* Header: Avatar + Info */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="text-2xl font-bold text-white">
            {user.firstName?.[0]?.toUpperCase() || '?'}
            {user.lastName?.[0]?.toUpperCase() || '?'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {user.firstName} {user.lastName}
            </h3>

            {user.isActive ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full whitespace-nowrap">
                <CheckCircle className="w-3.5 h-3.5" />
                Aprobado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full whitespace-nowrap">
                <Clock className="w-3.5 h-3.5" />
                Pendiente
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 truncate mb-2">{user.email}</p>

          {user.createdAt && (
            <p className="text-xs text-gray-500">
              Registrado: {new Date(user.createdAt).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 my-4" />

      {/* Detalles resumidos */}
      <div className="space-y-2.5 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">DNI:</span>
          <span className="text-gray-900">
            {user.dni || <span className="text-gray-400 italic">No proporcionado</span>}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Teléfono:</span>
          <span className="text-gray-900">
            {user.phone || <span className="text-gray-400 italic">No proporcionado</span>}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Roles:</span>
          <div className="flex flex-wrap gap-1 justify-end">
            {user.roles && user.roles.length > 0 ? (
              user.roles.map((role) => (
                <span
                  key={role}
                  className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded"
                >
                  {role}
                </span>
              ))
            ) : (
              <span className="text-gray-400 italic text-xs">Sin roles</span>
            )}
          </div>
        </div>
      </div>

      {/* Botón Ver Detalles - Solo si se proporciona la función */}
      {onViewDetails && (
        <Button
          onClick={() => onViewDetails(user)}
          variant="secondary"
          size="sm"
          className="w-full mb-3"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalles Completos
        </Button>
      )}

      {/* Acciones */}
      {!user.isActive && (
        <>
          <div className="border-t border-gray-100 pt-3 mt-3" />
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onApprove(user.id)}
              variant="success"
              size="sm"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-1.5" />
              Aprobar
            </Button>
            <Button
              onClick={() => onReject(user.id)}
              variant="danger"
              size="sm"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-1.5" />
              Rechazar
            </Button>
          </div>
        </>
      )}

      {user.isActive && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 text-center font-medium">
            ✓ Usuario activo
          </p>
        </div>
      )}
    </div>
  );
}

import { X, Mail, Phone, CreditCard, Calendar, MapPin, Shield } from 'lucide-react';
import Button from '@/components/common/Button';

export default function UserDetailModal({ user, isOpen, onClose, onApprove, onReject }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Detalles del Usuario
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar + Nombre */}
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-3xl font-bold text-white">
                {user.firstName?.[0]?.toUpperCase()}
                {user.lastName?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-gray-600">{user.email}</p>
              {/* Badge de estado */}
              <div className="mt-2">
                {user.isActive ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    ✓ Aprobado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    ⏱ Pendiente de Aprobación
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Información Personal
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">DNI</p>
                  <p className="font-medium text-gray-900">
                    {user.dni || <span className="text-gray-400 italic">No proporcionado</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium text-gray-900">
                    {user.phone || <span className="text-gray-400 italic">No proporcionado</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900 break-all">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                  <p className="font-medium text-gray-900">
                    {user.dateOfBirth
                      ? new Date(user.dateOfBirth).toLocaleDateString('es-PE', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })
                      : <span className="text-gray-400 italic">No proporcionado</span>
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección */}
          {user.address && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                Dirección
              </h4>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">
                    {user.address.street}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.address.city}, {user.address.state}
                  </p>
                  <p className="text-sm text-gray-600">
                    {user.address.country} - {user.address.zipCode}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Roles */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Roles Asignados
            </h4>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex flex-wrap gap-2">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full"
                    >
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 italic">Sin roles asignados</span>
                )}
              </div>
            </div>
          </div>

          {/* Fechas del Sistema */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Información del Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Registrado</p>
                <p className="font-medium text-gray-900">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Desconocido'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Última Actualización</p>
                <p className="font-medium text-gray-900">
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleDateString('es-PE', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : 'Desconocido'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        {!user.isActive && (
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
            <Button
              onClick={() => {
                onApprove(user.id);
                onClose();
              }}
              variant="success"
              size="md"
              className="flex-1"
            >
              ✓ Aprobar Usuario
            </Button>
            <Button
              onClick={() => {
                onReject(user.id);
                onClose();
              }}
              variant="danger"
              size="md"
              className="flex-1"
            >
              ✕ Rechazar Usuario
            </Button>
          </div>
        )}

        {user.isActive && (
          <div className="bg-green-50 border-t border-green-200 px-6 py-4">
            <p className="text-center text-green-800 font-medium">
              ✓ Este usuario ya está activo en el sistema
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

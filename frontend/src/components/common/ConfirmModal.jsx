/**
 * ConfirmModal
 * Modal de confirmación personalizado con diseño consistente
 */

import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '¿Estás seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // warning, danger, info
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    warning: {
      icon: AlertTriangle,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    danger: {
      icon: AlertTriangle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      confirmBg: 'bg-red-600 hover:bg-red-700',
    },
    info: {
      icon: AlertTriangle,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const style = typeStyles[type] || typeStyles.warning;
  const Icon = style.icon;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full animate-modal-appear"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${style.iconBg}`}>
                <Icon className={style.iconColor} size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 pb-6">
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium text-gray-700"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${style.confirmBg}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx={"true"}>{`
        @keyframes modal-appear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-modal-appear {
          animation: modal-appear 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default ConfirmModal;

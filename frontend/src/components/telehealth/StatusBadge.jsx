/**
 * Componente: StatusBadge
 * Badge con el estado de una cita
 */

import React from 'react';
import {
  getStatusLabel,
  getStatusColor,
  getStatusIcon,
} from '@/constants/telehealth';

const StatusBadge = ({ status, size = 'md' }) => {
  const label = getStatusLabel(status);
  const color = getStatusColor(status);
  const icon = getStatusIcon(status);

  // Tamaños
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full border
        ${color}
        ${sizeClasses[size]}
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;

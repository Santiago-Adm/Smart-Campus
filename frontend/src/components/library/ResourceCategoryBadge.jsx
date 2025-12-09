/**
 * Componente: ResourceCategoryBadge
 * Badge visual para mostrar la categoría de un recurso
 */

import React from 'react';
import PropTypes from 'prop-types';
import { getCategoryLabel, getCategoryColor } from '../../constants/library';

const ResourceCategoryBadge = ({ category, size = 'md', className = '' }) => {
  const label = getCategoryLabel(category);
  const colorClasses = getCategoryColor(category);

  // Tamaños
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${colorClasses}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {label}
    </span>
  );
};

ResourceCategoryBadge.propTypes = {
  category: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default ResourceCategoryBadge;

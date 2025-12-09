/**
 * Componente: ScenarioCategoryBadge
 * Badge visual para mostrar la categoría de un escenario
 */

import React from 'react';
import PropTypes from 'prop-types';
import {
  getScenarioCategoryLabel,
  getScenarioCategoryIcon,
  getScenarioCategoryColor,
  getScenarioCategoryEmoji,
} from '../../constants/simulations';

const ScenarioCategoryBadge = ({ category, size = 'md', showIcon = true, showEmoji = false }) => {
  const label = getScenarioCategoryLabel(category);
  const Icon = getScenarioCategoryIcon(category);
  const colors = getScenarioCategoryColor(category);
  const emoji = getScenarioCategoryEmoji(category);

  // Tamaños
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 14,
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      icon: 16,
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 18,
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${colors.bg} ${colors.text} ${colors.border} border
        ${currentSize.container}
        transition-colors
      `}
    >
      {showEmoji && <span>{emoji}</span>}
      {showIcon && !showEmoji && <Icon size={currentSize.icon} />}
      <span>{label}</span>
    </div>
  );
};

ScenarioCategoryBadge.propTypes = {
  category: PropTypes.oneOf([
    'venopuncion',
    'rcp',
    'cateterismo',
    'curacion',
    'inyeccion',
    'signos_vitales',
    'otros',
  ]).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showEmoji: PropTypes.bool,
};

export default ScenarioCategoryBadge;

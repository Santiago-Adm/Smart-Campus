/**
 * Componente: ScenarioDifficultyBadge
 * Badge visual para mostrar la dificultad de un escenario
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';
import {
  getScenarioDifficultyLabel,
  getScenarioDifficultyColor,
  getScenarioDifficultyStars,
} from '../../constants/simulations';

const ScenarioDifficultyBadge = ({ difficulty, size = 'md', showStars = true }) => {
  const label = getScenarioDifficultyLabel(difficulty);
  const colors = getScenarioDifficultyColor(difficulty);
  const stars = getScenarioDifficultyStars(difficulty);

  // Tamaños
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      star: 12,
    },
    md: {
      container: 'px-3 py-1.5 text-sm',
      star: 14,
    },
    lg: {
      container: 'px-4 py-2 text-base',
      star: 16,
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
      {showStars && (
        <div className="flex items-center gap-0.5">
          {[...Array(stars)].map((_, index) => (
            <Star
              key={index}
              size={currentSize.star}
              fill="currentColor"
              className={colors.text}
            />
          ))}
        </div>
      )}
      <span>{label}</span>
    </div>
  );
};

ScenarioDifficultyBadge.propTypes = {
  difficulty: PropTypes.oneOf(['beginner', 'intermediate', 'advanced']).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showStars: PropTypes.bool,
};

export default ScenarioDifficultyBadge;

/**
 * Componente: ResourceRating
 * Muestra y permite calificar recursos con estrellas
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

const ResourceRating = ({
  rating = 0,
  ratingCount = 0,
  showCount = true,
  interactive = false,
  size = 'md',
  onRate = null,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tamaños de estrellas
  const starSizes = {
    sm: 14,
    md: 18,
    lg: 24,
  };

  const starSize = starSizes[size];

  /**
   * Manejar click en estrella
   */
  const handleStarClick = async (value) => {
    if (!interactive || !onRate || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onRate(value);
    } catch (error) {
      console.error('Error rating resource:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Renderizar estrellas
   */
  const renderStars = () => {
    const stars = [];
    const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= Math.round(displayRating);

      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive || isSubmitting}
          className={`
            ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
            transition-transform
            ${isSubmitting ? 'opacity-50' : ''}
          `}
        >
          <Star
            size={starSize}
            className={`
              ${isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              transition-colors
            `}
          />
        </button>
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Estrellas */}
      <div className="flex items-center gap-0.5">{renderStars()}</div>

      {/* Rating numérico y contador */}
      {showCount && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span className="font-semibold">{rating.toFixed(1)}</span>
          {ratingCount > 0 && <span className="text-gray-400">({ratingCount})</span>}
        </div>
      )}

      {/* Indicador de carga */}
      {isSubmitting && (
        <div className="ml-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600" />
        </div>
      )}
    </div>
  );
};

ResourceRating.propTypes = {
  rating: PropTypes.number,
  ratingCount: PropTypes.number,
  showCount: PropTypes.bool,
  interactive: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  onRate: PropTypes.func,
  className: PropTypes.string,
};

export default ResourceRating;

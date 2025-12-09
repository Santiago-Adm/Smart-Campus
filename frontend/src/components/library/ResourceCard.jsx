/**
 * Componente: ResourceCard
 * Tarjeta de recurso para mostrar en listados
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Download, Eye, Clock, FileText, Video, BookOpen } from 'lucide-react';
import ResourceCategoryBadge from './ResourceCategoryBadge';
import ResourceRating from '../../components/library/ResourceRating';
import {
  getResourceTypeLabel,
  getResourceTypeIcon,
  formatFileSize,
  formatDuration,
} from '../../constants/library';

const ResourceCard = ({ resource, onRate = null }) => {
  const navigate = useNavigate();

  /**
   * Manejar click en la tarjeta
   */
  const handleClick = () => {
    console.log('🔍 Navigating to resource:', resource.id); // ← Agregar este log
    navigate(`/library/${resource.id}`);
  };

  /**
   * Obtener ícono según tipo de recurso
   */
  const getTypeIcon = () => {
    const iconProps = { size: 20, className: 'text-gray-500' };

    switch (resource.type) {
      case 'video':
        return <Video {...iconProps} />;
      case 'book':
        return <BookOpen {...iconProps} />;
      case 'article':
      case 'guide':
      case 'case_study':
        return <FileText {...iconProps} />;
      default:
        return <FileText {...iconProps} />;
    }
  };

  return (
    <div
      onClick={handleClick}
      className="
        bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md hover:border-indigo-300
        transition-all duration-200 cursor-pointer
        overflow-hidden
      "
    >
      {/* Thumbnail */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-50 to-purple-50">
        {resource.thumbnailUrl ? (
          <img
            src={resource.thumbnailUrl}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">{getResourceTypeIcon(resource.type)}</span>
          </div>
        )}

        {/* Badge de categoría superpuesto */}
        <div className="absolute top-3 left-3">
          <ResourceCategoryBadge category={resource.category} size="sm" />
        </div>

        {/* Badge de tipo */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
          {getTypeIcon()}
          <span className="text-xs font-medium text-gray-700">
            {getResourceTypeLabel(resource.type)}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-indigo-600 transition-colors">
          {resource.title}
        </h3>

        {/* Autor */}
        {resource.author && (
          <p className="text-sm text-gray-600 mb-2">
            Por <span className="font-medium">{resource.author}</span>
          </p>
        )}

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{resource.description}</p>

        {/* Rating */}
        <div className="mb-3">
          <ResourceRating
            rating={resource.averageRating}
            ratingCount={resource.ratingCount}
            size="sm"
            showCount
          />
        </div>

        {/* Estadísticas */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-3">
          {/* Vistas */}
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>{resource.viewCount.toLocaleString()}</span>
          </div>

          {/* Descargas */}
          <div className="flex items-center gap-1">
            <Download size={14} />
            <span>{resource.downloadCount.toLocaleString()}</span>
          </div>

          {/* Info adicional según tipo */}
          {resource.type === 'video' && resource.duration && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatDuration(resource.duration)}</span>
            </div>
          )}

          {resource.type !== 'video' && resource.pageCount && (
            <div className="flex items-center gap-1">
              <FileText size={14} />
              <span>{resource.pageCount} págs</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {resource.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{resource.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

ResourceCard.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    author: PropTypes.string,
    thumbnailUrl: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    viewCount: PropTypes.number,
    downloadCount: PropTypes.number,
    averageRating: PropTypes.number,
    ratingCount: PropTypes.number,
    duration: PropTypes.number,
    pageCount: PropTypes.number,
  }).isRequired,
  onRate: PropTypes.func,
};

export default ResourceCard;

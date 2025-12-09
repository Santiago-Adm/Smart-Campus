/**
 * Componente: ResourceFilters
 * Panel de filtros avanzados para búsqueda de recursos
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getCategoryOptions,
  getTypeOptions,
  getLanguageOptions,
  SORT_OPTIONS,
} from '../../constants/library';

const ResourceFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    category: initialFilters.category || '',
    type: initialFilters.type || '',
    language: initialFilters.language || '',
    minRating: initialFilters.minRating || '',
    sortBy: initialFilters.sortBy || 'createdAt',
    sortOrder: initialFilters.sortOrder || 'desc',
  });

  /**
   * Manejar cambio en un filtro
   */
  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  /**
   * Limpiar todos los filtros
   */
  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      type: '',
      language: '',
      minRating: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  /**
   * Contar filtros activos
   */
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.language) count++;
    if (filters.minRating) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Barra de búsqueda principal */}
      <div className="flex items-center gap-3 mb-4">
        {/* Input de búsqueda */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por título, autor o descripción..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-transparent
              transition-all
            "
          />
        </div>

        {/* Botón de filtros avanzados */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="
            flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg
            hover:bg-gray-50 transition-colors relative
          "
        >
          <Filter size={20} />
          <span className="hidden sm:inline">Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* Botón de limpiar filtros */}
        {activeFiltersCount > 0 && (
          <button
            onClick={handleClearFilters}
            className="
              flex items-center gap-1 px-3 py-2.5 text-gray-600
              hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors
            "
            title="Limpiar filtros"
          >
            <X size={20} />
            <span className="hidden sm:inline text-sm">Limpiar</span>
          </button>
        )}
      </div>

      {/* Filtros avanzados (expandible) */}
      {isExpanded && (
        <div className="pt-4 border-t border-gray-200 space-y-4 animate-fadeIn">
          {/* Fila 1: Categoría y Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  bg-white
                "
              >
                <option value="">Todas las categorías</option>
                {getCategoryOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de recurso */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Recurso
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  bg-white
                "
              >
                <option value="">Todos los tipos</option>
                {getTypeOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: Idioma y Rating mínimo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Idioma */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idioma
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  bg-white
                "
              >
                <option value="">Todos los idiomas</option>
                {getLanguageOptions().map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calificación Mínima
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  bg-white
                "
              >
                <option value="">Cualquier calificación</option>
                <option value="4">★★★★ 4 estrellas o más</option>
                <option value="3">★★★ 3 estrellas o más</option>
                <option value="2">★★ 2 estrellas o más</option>
                <option value="1">★ 1 estrella o más</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Ordenamiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ordenar por */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar Por
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  bg-white
                "
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Orden (asc/desc) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                className="
                  w-full px-3 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  bg-white
                "
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ResourceFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialFilters: PropTypes.object,
};

export default ResourceFilters;

/**
 * Componente: ScenarioFilters
 * Panel de filtros para búsqueda de escenarios
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, Filter, X, RotateCcw, User } from 'lucide-react';
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
  SORT_OPTIONS,
  DEFAULT_FILTERS,
} from '../../constants/simulations';

const ScenarioFilters = ({
  onFilterChange,
  initialFilters = DEFAULT_FILTERS,
  showMyScenarios = false,  // ← NUEVA PROP
  userId = null,            // ← NUEVA PROP
}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sincronizar con initialFilters cuando cambian desde el padre
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  /**
   * Manejar cambio en cualquier filtro
   */
  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };

    setFilters(newFilters);

    // Notificar al padre inmediatamente
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  /**
   * ✅ NUEVO: Manejar cambio en checkbox "Mis Escenarios"
   */
  const handleMyScenarios = (checked) => {
    if (checked && userId) {
      handleFilterChange('createdBy', userId);
    } else {
      handleFilterChange('createdBy', '');
    }
  };

  /**
   * Limpiar todos los filtros
   */
  const handleClearFilters = () => {
    const clearedFilters = { ...DEFAULT_FILTERS };
    setFilters(clearedFilters);

    if (onFilterChange) {
      onFilterChange(clearedFilters);
    }
  };

  /**
   * Verificar si hay filtros activos
   */
  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.category !== '' ||
      filters.difficulty !== '' ||
      filters.sortBy !== 'createdAt' ||
      filters.createdBy !== ''  // ← AGREGAR
    );
  };

  /**
   * Contar número de filtros activos
   */
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.difficulty) count++;
    if (filters.sortBy !== 'createdAt') count++;
    if (filters.createdBy) count++;  // ← AGREGAR
    return count;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Búsqueda principal */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Campo de búsqueda */}
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar escenarios por título o descripción..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              transition-all
            "
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange('search', '')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Botón de filtros avanzados (mobile) */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="
            sm:hidden flex items-center justify-center gap-2 px-4 py-2.5
            border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors
            relative
          "
        >
          <Filter size={20} />
          <span>Filtros</span>
          {getActiveFiltersCount() > 0 && (
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Filtros avanzados */}
      <div
        className={`
          grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${showMyScenarios ? '4' : '4'} gap-3
          ${showAdvanced ? 'block' : 'hidden sm:grid'}
        `}
      >
        {/* Filtro de categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Categoría
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              transition-all
            "
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de dificultad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Dificultad
          </label>
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              transition-all
            "
          >
            {DIFFICULTY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de ordenamiento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ordenar por
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="
              w-full px-3 py-2 border border-gray-300 rounded-lg
              focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              transition-all
            "
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ NUEVO: Checkbox Mis Escenarios (solo si showMyScenarios es true) */}
        {showMyScenarios && userId ? (
          <div className="flex items-end">
            <label className="
              w-full flex items-center gap-2 px-4 py-2
              border border-gray-300 rounded-lg
              hover:bg-gray-50 cursor-pointer transition-colors
            ">
              <input
                type="checkbox"
                checked={filters.createdBy === userId}
                onChange={(e) => handleMyScenarios(e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <User size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Mis Escenarios</span>
            </label>
          </div>
        ) : (
          // Si no se muestra "Mis Escenarios", mostrar botón de limpiar en su lugar
          <div className="flex items-end">
            <button
              onClick={handleClearFilters}
              disabled={!hasActiveFilters()}
              className="
                w-full flex items-center justify-center gap-2 px-4 py-2
                border border-gray-300 rounded-lg
                hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
              "
            >
              <RotateCcw size={18} />
              <span>Limpiar</span>
            </button>
          </div>
        )}
      </div>

      {/* Botón de limpiar (cuando se muestra "Mis Escenarios") */}
      {showMyScenarios && userId && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleClearFilters}
            disabled={!hasActiveFilters()}
            className="
              flex items-center gap-2 px-4 py-2 text-sm
              text-gray-600 hover:text-gray-900
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <RotateCcw size={16} />
            <span>Limpiar filtros</span>
          </button>
        </div>
      )}

      {/* Indicadores de filtros activos */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Filtros activos:</span>

            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                <Search size={14} />
                <span className="max-w-[200px] truncate">{filters.search}</span>
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {CATEGORY_OPTIONS.find((opt) => opt.value === filters.category)?.label}
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.difficulty && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {DIFFICULTY_OPTIONS.find((opt) => opt.value === filters.difficulty)?.label}
                <button
                  onClick={() => handleFilterChange('difficulty', '')}
                  className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {filters.sortBy !== 'createdAt' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                {SORT_OPTIONS.find((opt) => opt.value === filters.sortBy)?.label}
                <button
                  onClick={() => handleFilterChange('sortBy', 'createdAt')}
                  className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            {/* ✅ NUEVO: Pill para "Mis Escenarios" */}
            {filters.createdBy && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                <User size={14} />
                Mis Escenarios
                <button
                  onClick={() => handleFilterChange('createdBy', '')}
                  className="hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            )}

            <button
              onClick={handleClearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 underline ml-auto"
            >
              Limpiar todos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ScenarioFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialFilters: PropTypes.shape({
    search: PropTypes.string,
    category: PropTypes.string,
    difficulty: PropTypes.string,
    sortBy: PropTypes.string,
    createdBy: PropTypes.string,  // ← AGREGAR
    page: PropTypes.number,
    limit: PropTypes.number,
  }),
  showMyScenarios: PropTypes.bool,  // ← AGREGAR
  userId: PropTypes.string,         // ← AGREGAR
};

export default ScenarioFilters;

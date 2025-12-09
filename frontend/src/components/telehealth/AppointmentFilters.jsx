/**
 * Componente: AppointmentFilters
 * Filtros de búsqueda para citas
 */

import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { APPOINTMENT_STATUS, STATUS_LABELS } from '@/constants/telehealth';

const AppointmentFilters = ({ onFilterChange, initialFilters = {} }) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: initialFilters.status || '',
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
  });

  /**
   * Manejar cambio en un filtro
   */
  const handleChange = (e) => {
    const { name, value } = e.target;

    const newFilters = {
      ...filters,
      [name]: value,
    };

    setFilters(newFilters);
  };

  /**
   * Aplicar filtros
   */
  const handleApply = () => {
    onFilterChange(filters);
    setShowFilters(false);
  };

  /**
   * Limpiar filtros
   */
  const handleClear = () => {
    const clearedFilters = {
      status: '',
      dateFrom: '',
      dateTo: '',
    };

    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  /**
   * Contar filtros activos
   */
  const activeFiltersCount = Object.values(filters).filter((value) => value !== '').length;

  return (
    <div className="mb-6">
      {/* Botón de toggle filtros */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="
            flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg
            hover:bg-gray-50 transition-colors
          "
        >
          <Filter size={18} />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            onClick={handleClear}
            className="
              flex items-center gap-2 px-4 py-2 text-gray-600
              hover:text-gray-900 transition-colors
            "
          >
            <X size={18} />
            <span>Limpiar Filtros</span>
          </button>
        )}
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleChange}
                className="
                  w-full px-4 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-colors
                "
              >
                <option value="">Todos los estados</option>
                {Object.entries(APPOINTMENT_STATUS).map(([key, value]) => (
                  <option key={value} value={value}>
                    {STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha desde
              </label>
              <input
                type="date"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleChange}
                className="
                  w-full px-4 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-colors
                "
              />
            </div>

            {/* Fecha hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha hasta
              </label>
              <input
                type="date"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleChange}
                className="
                  w-full px-4 py-2 border border-gray-300 rounded-lg
                  focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  transition-colors
                "
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowFilters(false)}
              className="
                px-4 py-2 border border-gray-300 text-gray-700 rounded-lg
                hover:bg-gray-50 transition-colors
              "
            >
              Cancelar
            </button>

            <button
              onClick={handleApply}
              className="
                px-4 py-2 bg-indigo-600 text-white rounded-lg
                hover:bg-indigo-700 transition-colors
              "
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentFilters;

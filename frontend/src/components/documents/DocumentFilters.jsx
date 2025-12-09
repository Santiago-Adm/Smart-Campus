import { useState } from 'react';
import PropTypes from 'prop-types';
import { Filter, X } from 'lucide-react';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS, DOCUMENT_STATUS_LABELS } from '@/constants/documents';

/**
 * Filtros avanzados para documentos
 */
export default function DocumentFilters({ onFilter, initialFilters = {} }) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    documentType: initialFilters.documentType || '',
    status: initialFilters.status || '',
    dateFrom: initialFilters.dateFrom || '',
    dateTo: initialFilters.dateTo || '',
  });

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilter(filters);
    setShowFilters(false);
  };

  const handleClear = () => {
    const emptyFilters = {
      documentType: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(emptyFilters);
    onFilter(emptyFilters);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span>Filtros</span>
        {activeFiltersCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-semibold text-white bg-primary-600 rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Filters Panel */}
      {showFilters && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              {/* Tipo de Documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={filters.documentType}
                  onChange={(e) => handleChange('documentType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {Object.values(DOCUMENT_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {DOCUMENT_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Todos</option>
                  {Object.values(DOCUMENT_STATUS).map((status) => (
                    <option key={status} value={status}>
                      {DOCUMENT_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Fecha Hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClear}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Limpiar
              </button>
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

DocumentFilters.propTypes = {
  onFilter: PropTypes.func.isRequired,
  initialFilters: PropTypes.object,
};

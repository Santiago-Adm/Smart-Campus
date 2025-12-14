/**
 * DateRangePicker Component
 * Selector de rango de fechas con presets para Analytics
 */

import { useState, useEffect } from 'react';
import { Calendar, X } from 'lucide-react';
import DatePicker from 'react-datepicker';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths } from 'date-fns';
import 'react-datepicker/dist/react-datepicker.css';

const DateRangePicker = ({ onApply, onClear, initialFilters = {} }) => {
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [activePreset, setActivePreset] = useState('thisMonth');

  // Presets de fechas
  const presets = [
    {
      id: 'today',
      label: 'Hoy',
      getDates: () => {
        const today = new Date();
        return { from: today, to: today };
      },
    },
    {
      id: 'thisWeek',
      label: 'Esta Semana',
      getDates: () => {
        const today = new Date();
        return {
          from: startOfWeek(today, { weekStartsOn: 1 }), // Lunes
          to: endOfWeek(today, { weekStartsOn: 1 }), // Domingo
        };
      },
    },
    {
      id: 'thisMonth',
      label: 'Este Mes',
      getDates: () => {
        const today = new Date();
        return {
          from: startOfMonth(today),
          to: endOfMonth(today),
        };
      },
    },
    {
      id: 'lastMonth',
      label: 'Último Mes',
      getDates: () => {
        const lastMonth = subMonths(new Date(), 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        };
      },
    },
    {
      id: 'thisYear',
      label: 'Este Año',
      getDates: () => {
        const today = new Date();
        return {
          from: startOfYear(today),
          to: endOfYear(today),
        };
      },
    },
    {
      id: 'custom',
      label: 'Personalizado',
      getDates: () => ({ from: dateFrom, to: dateTo }),
    },
  ];

  // Aplicar preset "Este Mes" al montar
  useEffect(() => {
    const thisMonthPreset = presets.find(p => p.id === 'thisMonth');
    if (thisMonthPreset) {
      const { from, to } = thisMonthPreset.getDates();
      setDateFrom(from);
      setDateTo(to);
      setActivePreset('thisMonth');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePresetClick = (presetId) => {
    const preset = presets.find((p) => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);

    if (presetId === 'custom') {
      // No cambiar las fechas, permitir que el usuario las seleccione
      return;
    }

    const { from, to } = preset.getDates();
    setDateFrom(from);
    setDateTo(to);
  };

  const handleApply = () => {
    if (!dateFrom || !dateTo) {
      return;
    }

    // ✅ CORREGIDO: Formatear fechas correctamente
    const formattedDateFrom = dateFrom.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedDateTo = dateTo.toISOString().split('T')[0];

    console.log('📅 Applying date filters:', {
      dateFrom: formattedDateFrom,
      dateTo: formattedDateTo,
      preset: activePreset,
    });

    onApply({
      dateFrom: formattedDateFrom,
      dateTo: formattedDateTo,
      preset: activePreset,
    });
  };

  const handleClear = () => {
    setDateFrom(null);
    setDateTo(null);
    setActivePreset('thisMonth');
    onClear();
  };

  const isApplyDisabled = !dateFrom || !dateTo;

  // ✅ CORREGIDO: Formatear fechas de forma segura
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return date.toLocaleDateString('es-ES');
    } catch (error) {
      return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="text-indigo-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">Filtros de Fecha</h3>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activePreset === preset.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* DatePickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Inicio
          </label>
          <DatePicker
            selected={dateFrom}
            onChange={(date) => {
              setDateFrom(date);
              setActivePreset('custom');
            }}
            selectsStart
            startDate={dateFrom}
            endDate={dateTo}
            maxDate={dateTo || new Date()}
            dateFormat="dd/MM/yyyy"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholderText="Selecciona fecha"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha Fin
          </label>
          <DatePicker
            selected={dateTo}
            onChange={(date) => {
              setDateTo(date);
              setActivePreset('custom');
            }}
            selectsEnd
            startDate={dateFrom}
            endDate={dateTo}
            minDate={dateFrom}
            maxDate={new Date()}
            dateFormat="dd/MM/yyyy"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholderText="Selecciona fecha"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleApply}
          disabled={isApplyDisabled}
          className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
            isApplyDisabled
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          Aplicar Filtros
        </button>

        <button
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <X size={16} />
          Limpiar
        </button>
      </div>

      {/* Indicador de rango seleccionado */}
      {dateFrom && dateTo && (
        <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <p className="text-sm text-indigo-900">
            <span className="font-semibold">Rango seleccionado:</span>{' '}
            {formatDate(dateFrom)} - {formatDate(dateTo)}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;

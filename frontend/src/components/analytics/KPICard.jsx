/**
 * KPI Card Component
 * Muestra una métrica individual con icono, valor y tendencia
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPICard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'indigo' }) => {
  // Colores según el tipo
  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-100',
      icon: 'text-indigo-600',
      trend: 'text-indigo-600',
    },
    green: {
      bg: 'bg-green-100',
      icon: 'text-green-600',
      trend: 'text-green-600',
    },
    blue: {
      bg: 'bg-blue-100',
      icon: 'text-blue-600',
      trend: 'text-blue-600',
    },
    purple: {
      bg: 'bg-purple-100',
      icon: 'text-purple-600',
      trend: 'text-purple-600',
    },
    amber: {
      bg: 'bg-amber-100',
      icon: 'text-amber-600',
      trend: 'text-amber-600',
    },
    red: {
      bg: 'bg-red-100',
      icon: 'text-red-600',
      trend: 'text-red-600',
    },
  };

  const colors = colorClasses[color] || colorClasses.indigo;

  // Determinar ícono de tendencia
  const getTrendIcon = () => {
    if (!trend) return <Minus size={16} className="text-gray-400" />;
    if (trend === 'up') return <TrendingUp size={16} className="text-green-600" />;
    if (trend === 'down') return <TrendingDown size={16} className="text-red-600" />;
    return <Minus size={16} className="text-gray-400" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Título */}
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>

          {/* Valor principal */}
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>

          {/* Subtítulo o tendencia */}
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}

          {/* Tendencia */}
          {trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trendValue}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
            </div>
          )}
        </div>

        {/* Ícono */}
        {Icon && (
          <div className={`p-3 rounded-lg ${colors.bg}`}>
            <Icon size={24} className={colors.icon} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;

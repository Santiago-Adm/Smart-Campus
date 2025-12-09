/**
 * Componente: ScenarioCard
 * Tarjeta de escenario para mostrar en listados
 */

import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Play, Users, Clock, TrendingUp, BarChart3 } from 'lucide-react';
import ScenarioCategoryBadge from './ScenarioCategoryBadge';
import ScenarioDifficultyBadge from './ScenarioDifficultyBadge';
import {
  formatDuration,
  formatCompletionCount,
  formatStepCount,
  formatScore,
  getScoreColor,
} from '../../constants/simulations';

const ScenarioCard = ({ scenario }) => {
  const navigate = useNavigate();

  /**
   * Manejar click en la tarjeta
   */
  const handleClick = () => {
    console.log('🎮 Navigating to scenario:', scenario.id);
    navigate(`/simulations/${scenario.id}`);
  };

  /**
   * Manejar click en botón de iniciar
   */
  const handleStartClick = (e) => {
    e.stopPropagation(); // Evitar que se active el click del card
    console.log('▶️ Starting scenario:', scenario.id);
    navigate(`/simulations/${scenario.id}/execute`);
  };

  return (
    <div
      onClick={handleClick}
      className="
        bg-white rounded-lg shadow-sm border border-gray-200
        hover:shadow-md hover:border-indigo-300
        transition-all duration-200 cursor-pointer
        overflow-hidden
        group
      "
    >
      {/* Thumbnail con overlay de play al hover */}
      <div className="relative h-48 bg-gradient-to-br from-indigo-50 to-purple-50 overflow-hidden">
        {scenario.thumbnailUrl ? (
          <img
            src={scenario.thumbnailUrl}
            alt={scenario.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-20">🎯</div>
          </div>
        )}

        {/* Overlay de play al hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
          <div className="transform scale-0 group-hover:scale-100 transition-transform duration-200">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <Play size={32} className="text-indigo-600" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Badges superpuestos */}
        <div className="absolute top-3 left-3">
          <ScenarioCategoryBadge category={scenario.category} size="sm" />
        </div>

        <div className="absolute top-3 right-3">
          <ScenarioDifficultyBadge difficulty={scenario.difficulty} size="sm" />
        </div>

        {/* Badge de "Nuevo" si fue creado recientemente (últimos 7 días) */}
        {(() => {
          const createdAt = new Date(scenario.createdAt);
          const now = new Date();
          const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

          if (daysDiff <= 7) {
            return (
              <div className="absolute bottom-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                NUEVO
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {scenario.title}
        </h3>

        {/* Descripción */}
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {scenario.description || 'Sin descripción disponible'}
        </p>

        {/* Información clave */}
        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
          {/* Duración estimada */}
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-gray-400" />
            <span>{formatDuration(scenario.estimatedDuration)}</span>
          </div>

          {/* Número de pasos */}
          <div className="flex items-center gap-1.5">
            <BarChart3 size={14} className="text-gray-400" />
            <span>{formatStepCount(scenario.stepCount)}</span>
          </div>

          {/* Completaciones */}
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-gray-400" />
            <span>{formatCompletionCount(scenario.completionCount)}</span>
          </div>

          {/* Score promedio */}
          {scenario.averageScore > 0 && (
            <div className="flex items-center gap-1.5">
              <TrendingUp size={14} className="text-gray-400" />
              <span className={getScoreColor(scenario.averageScore)}>
                {formatScore(scenario.averageScore)}
              </span>
            </div>
          )}
        </div>

        {/* Barra de progreso (si el usuario tiene progreso) */}
        {scenario.userProgress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Tu progreso</span>
              <span className="font-medium">{scenario.userProgress.percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${scenario.userProgress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Botón de acción */}
        <button
          onClick={handleStartClick}
          className="
            w-full flex items-center justify-center gap-2
            px-4 py-2.5 bg-indigo-600 text-white rounded-lg
            hover:bg-indigo-700 transition-colors
            font-medium text-sm
            shadow-sm hover:shadow-md
          "
        >
          <Play size={16} />
          <span>Iniciar Simulación</span>
        </button>
      </div>
    </div>
  );
};

ScenarioCard.propTypes = {
  scenario: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    category: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string,
    estimatedDuration: PropTypes.number.isRequired,
    stepCount: PropTypes.number.isRequired,
    completionCount: PropTypes.number,
    averageScore: PropTypes.number,
    createdAt: PropTypes.string,
    userProgress: PropTypes.shape({
      percentage: PropTypes.number,
    }),
  }).isRequired,
};

export default ScenarioCard;

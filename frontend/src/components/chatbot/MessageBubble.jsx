/**
 * MessageBubble Component
 * Burbuja individual de mensaje con soporte para Markdown
 */

import { Bot, User, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = message.isError;

  // Formatear timestamp
  const timestamp = message.timestamp
    ? format(new Date(message.timestamp), 'HH:mm', { locale: es })
    : '';

  /**
   * Procesar contenido del mensaje
   * Soporta formato básico de Markdown
   */
  const formatMessageContent = (content) => {
    if (!content) return null;

    // Dividir en líneas
    const lines = content.split('\n');

    return lines.map((line, index) => {
      // Línea vacía
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }

      // Título con ** (negrita)
      if (line.includes('**')) {
        const parts = line.split('**');
        return (
          <div key={index} className="mb-2">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="font-semibold">{part}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        );
      }

      // Lista con viñetas (• o *)
      if (line.trim().startsWith('•') || line.trim().startsWith('*')) {
        return (
          <div key={index} className="flex gap-2 mb-1 ml-2">
            <span className="text-current">•</span>
            <span className="flex-1">{line.trim().replace(/^[•*]\s*/, '')}</span>
          </div>
        );
      }

      // Lista numerada
      const numberedMatch = line.match(/^\s*(\d+)\.\s+(.+)/);
      if (numberedMatch) {
        return (
          <div key={index} className="flex gap-2 mb-1 ml-2">
            <span className="font-medium">{numberedMatch[1]}.</span>
            <span className="flex-1">{numberedMatch[2]}</span>
          </div>
        );
      }

      // Línea normal
      return (
        <div key={index} className="mb-1">
          {line}
        </div>
      );
    });
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} mb-4`}>
      {/* Avatar */}
      {!isUser && (
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isSystem ? 'bg-blue-100' : isError ? 'bg-red-100' : 'bg-indigo-100'
        }`}>
          {isError ? (
            <AlertCircle size={18} className="text-red-600" />
          ) : (
            <Bot size={18} className="text-indigo-600" />
          )}
        </div>
      )}

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={18} className="text-gray-600" />
        </div>
      )}

      {/* Mensaje */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[80%]`}>
        <div
          className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-indigo-600 text-white'
              : isSystem
              ? 'bg-blue-50 text-blue-900 border border-blue-200'
              : isError
              ? 'bg-red-50 text-red-900 border border-red-200'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {/* Contenido del mensaje con formato */}
          <div className="text-sm leading-relaxed">
            {formatMessageContent(message.content)}
          </div>

          {/* Function calls (si existen) */}
          {message.functionCalls && message.functionCalls.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <span>🔧</span>
                <span>
                  {message.functionCalls.length} función{message.functionCalls.length > 1 ? 'es' : ''} ejecutada
                  {message.functionCalls.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-gray-400 mt-1 px-1">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

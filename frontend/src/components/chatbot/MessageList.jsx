/**
 * MessageList Component
 * Lista de mensajes del chat con scroll automático
 */

import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const MessageList = ({ messages, isTyping, messagesEndRef }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¡Hola! Soy tu asistente virtual
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Puedo ayudarte con información sobre:
          </p>
          <div className="space-y-2 text-left w-full max-w-xs">
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <span>📄</span>
              <span>Tus documentos y su estado</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <span>📅</span>
              <span>Citas de teleenfermería</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <span>📚</span>
              <span>Recursos de la biblioteca</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <span>🥽</span>
              <span>Simulaciones AR disponibles</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Escribe tu pregunta abajo para comenzar
          </p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <TypingIndicator />
            </div>
          )}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
};

export default MessageList;

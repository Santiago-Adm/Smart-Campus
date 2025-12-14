/**
 * ChatWindow Component
 * Ventana principal del chat
 */

import { X, MoreVertical, Sparkles, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

const ChatWindow = ({
  messages,
  isTyping,
  messagesEndRef,
  onSendMessage,
  onClose,
  onEscalate,
  onNewConversation,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleEscalate = () => {
    setShowMenu(false);
    onEscalate('Usuario solicitó hablar con un agente');
  };

  const handleNewConversation = () => {
    setShowMenu(false);
    onNewConversation();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-t-2xl shadow-2xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Sparkles size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Asistente Virtual</h3>
            <p className="text-indigo-100 text-xs">Siempre disponible para ayudarte</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Menú */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                {/* Overlay para cerrar menú */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowMenu(false)}
                />

                {/* Menú desplegable */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleNewConversation}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    Nueva conversación
                  </button>
                  <button
                    onClick={handleEscalate}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <AlertCircle size={16} />
                    Hablar con un agente
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />

      {/* Input */}
      <ChatInput
        onSend={onSendMessage}
        isTyping={isTyping}
        disabled={false}
      />
    </div>
  );
};

export default ChatWindow;

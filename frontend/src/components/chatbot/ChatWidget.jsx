/**
 * ChatWidget Component
 * Widget flotante del chatbot que aparece en todas las páginas
 */

import { MessageCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import useChatbot from '@/hooks/useChatbot';
import ChatWindow from './ChatWindow';

const ChatWidget = () => {
  const {
    messages,
    isOpen,
    isTyping,
    messagesEndRef,
    sendMessage,
    escalateToHuman,
    startNewConversation,
    toggleWidget,
    closeWidget,
  } = useChatbot();

  const [unreadCount, setUnreadCount] = useState(0);

  // Detectar nuevos mensajes cuando el widget está cerrado
  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        setUnreadCount((prev) => prev + 1);
      }
    }
  }, [messages, isOpen]);

  // Reset unread count cuando se abre
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  return (
    <>
      {/* Widget flotante */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Ventana de chat */}
        {isOpen && (
          <div
            className="mb-4 w-[400px] h-[600px] transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4"
            style={{
              maxHeight: 'calc(100vh - 100px)',
            }}
          >
            <ChatWindow
              messages={messages}
              isTyping={isTyping}
              messagesEndRef={messagesEndRef}
              onSendMessage={sendMessage}
              onClose={closeWidget}
              onEscalate={escalateToHuman}
              onNewConversation={startNewConversation}
            />
          </div>
        )}

        {/* Botón flotante */}
        <button
          onClick={toggleWidget}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl hover:scale-110'
          }`}
          aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}

          {/* Badge de mensajes no leídos */}
          {!isOpen && unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </button>
      </div>
    </>
  );
};

export default ChatWidget;

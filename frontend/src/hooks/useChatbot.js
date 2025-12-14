/**
 * useChatbot Hook
 * Hook personalizado para manejar la lógica del chatbot
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import chatbotService from '@/services/chatbotService';
import toast from 'react-hot-toast';

const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  /**
   * Scroll al último mensaje
   */
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /**
   * Cargar conversación activa al abrir
   */
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadActiveConversation();
    }
  }, [isOpen]);

  /**
   * Cargar conversación activa
   */
  const loadActiveConversation = async () => {
    try {
      const response = await chatbotService.getConversations({
        isActive: true,
        limit: 1
      });

      if (response?.success && response?.data?.conversations?.length > 0) {
        const activeConv = response.data.conversations[0];
        setConversationId(activeConv.id || activeConv._id);

        // Cargar mensajes de la conversación
        if (activeConv.messages && activeConv.messages.length > 0) {
          setMessages(activeConv.messages);
        }
      }
    } catch (error) {
      console.error('Error loading active conversation:', error);
      // No mostrar error si no hay conversación activa
    }
  };

  /**
   * Enviar mensaje
   */
  const sendMessage = async (messageText) => {
    if (!messageText || messageText.trim().length === 0) {
      toast.error('El mensaje no puede estar vacío');
      return;
    }

    try {
      // Agregar mensaje del usuario
      const userMessage = {
        role: 'user',
        content: messageText,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      setError(null);

      console.log('📤 useChatbot.sendMessage called with:', messageText);

      // Llamar al servicio
      const apiResponse = await chatbotService.sendMessage(messageText, conversationId);

      console.log('📥 useChatbot received from service:', apiResponse);

      // Verificar que la respuesta sea válida
      if (!apiResponse) {
        throw new Error('No response from chatbot service');
      }

      if (!apiResponse.success) {
        throw new Error(apiResponse.error?.message || 'Chatbot returned error');
      }

      // ✅ CORRECCIÓN: El backend retorna el mensaje directamente
      // Estructura: { success: true, conversationId: "...", message: "...", ... }

      // Actualizar conversationId si es nueva
      if (apiResponse.conversationId && !conversationId) {
        setConversationId(apiResponse.conversationId);
        console.log('🆔 Conversation ID set:', apiResponse.conversationId);
      }

      // Obtener el mensaje directamente de apiResponse (no de apiResponse.data)
      const assistantMessageContent = apiResponse.message;

      if (!assistantMessageContent) {
        throw new Error('No message in chatbot response');
      }

      console.log('💬 Assistant will say:', assistantMessageContent);

      // Crear mensaje del asistente
      const assistantMessage = {
        role: 'assistant',
        content: assistantMessageContent,
        timestamp: apiResponse.timestamp || new Date().toISOString(),
        functionCalls: apiResponse.functionCalls || null,
      };

      // Agregar a la lista de mensajes
      setMessages((prev) => [...prev, assistantMessage]);

      console.log('✅ Message added to chat successfully');

    } catch (error) {
      console.error('❌ useChatbot.sendMessage error:', error);
      console.error('❌ Error message:', error.message);

      setError(error.message || 'Error al enviar mensaje');
      toast.error('No pude enviar tu mensaje. Intenta de nuevo.');

      // Agregar mensaje de error
      const errorMessage = {
        role: 'assistant',
        content: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Puedes intentarlo de nuevo?',
        timestamp: new Date().toISOString(),
        isError: true,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };


  /**
   * Escalar a humano
   */
  const escalateToHuman = async (reason) => {
    if (!conversationId) {
      toast.error('No hay conversación activa para escalar');
      return;
    }

    try {
      console.log('🆘 Escalating conversation:', conversationId);

      const response = await chatbotService.escalateConversation(
        conversationId,
        reason || 'Usuario solicitó hablar con un agente',
        'MEDIUM'
      );

      if (response?.success) {
        toast.success('Tu conversación ha sido escalada. Un agente te contactará pronto.');

        // Agregar mensaje del sistema
        const systemMessage = {
          role: 'system',
          content: '✅ Tu conversación ha sido escalada a un agente humano. Te contactaremos pronto.',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    } catch (error) {
      console.error('❌ Error escalating:', error);
      toast.error('No pude escalar tu conversación. Intenta de nuevo.');
    }
  };

  /**
   * Nueva conversación
   */
  const startNewConversation = () => {
    setMessages([]);
    setConversationId(null);
    setError(null);

    // Mensaje de bienvenida
    const welcomeMessage = {
      role: 'assistant',
      content: '👋 ¡Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  /**
   * Toggle widget
   */
  const toggleWidget = () => {
    setIsOpen((prev) => !prev);
  };

  /**
   * Cerrar widget
   */
  const closeWidget = () => {
    setIsOpen(false);
  };

  return {
    messages,
    isOpen,
    isTyping,
    conversationId,
    error,
    messagesEndRef,
    sendMessage,
    escalateToHuman,
    startNewConversation,
    toggleWidget,
    closeWidget,
  };
};

export default useChatbot;

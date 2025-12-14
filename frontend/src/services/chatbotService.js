/**
 * Chatbot Service
 * Maneja todas las llamadas API del chatbot
 */

import api from './api';

const CHATBOT_BASE_URL = '/chatbot';

/**
 * Enviar mensaje al chatbot
 * @param {string} message - Mensaje del usuario
 * @param {string} conversationId - ID de conversación (opcional)
 * @returns {Promise<Object>}
 */
export const sendMessage = async (message, conversationId = null) => {
  try {
    console.log('💬 Sending message to chatbot:', { message, conversationId });

    const response = await api.post(`${CHATBOT_BASE_URL}/message`, {
      message,
      conversationId,
    });

    console.log('✅ Chatbot response:', response);
    console.log('✅ Response data:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error;
  }
};

/**
 * Obtener conversaciones del usuario
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Object>}
 */
export const getConversations = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`${CHATBOT_BASE_URL}/conversations?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting conversations:', error);
    throw error;
  }
};

/**
 * Obtener conversación específica
 * @param {string} conversationId - ID de conversación
 * @returns {Promise<Object>}
 */
export const getConversation = async (conversationId) => {
  try {
    const response = await api.get(`${CHATBOT_BASE_URL}/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting conversation:', error);
    throw error;
  }
};

/**
 * Escalar conversación a humano
 * @param {string} conversationId - ID de conversación
 * @param {string} reason - Motivo de escalación
 * @param {string} priority - Prioridad (LOW, MEDIUM, HIGH)
 * @returns {Promise<Object>}
 */
export const escalateConversation = async (conversationId, reason, priority = 'MEDIUM') => {
  try {
    console.log('🆘 Escalating conversation:', { conversationId, reason, priority });

    const response = await api.post(`${CHATBOT_BASE_URL}/escalate`, {
      conversationId,
      reason,
      priority,
    });

    console.log('✅ Escalation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error escalating conversation:', error);
    throw error;
  }
};

/**
 * Cerrar conversación
 * @param {string} conversationId - ID de conversación
 * @returns {Promise<Object>}
 */
export const closeConversation = async (conversationId) => {
  try {
    const response = await api.delete(`${CHATBOT_BASE_URL}/conversations/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error closing conversation:', error);
    throw error;
  }
};

/**
 * Obtener contexto del usuario
 * @param {string} contextType - Tipo de contexto (full, basic)
 * @returns {Promise<Object>}
 */
export const getUserContext = async (contextType = 'full') => {
  try {
    const response = await api.get(`${CHATBOT_BASE_URL}/context?contextType=${contextType}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error getting user context:', error);
    throw error;
  }
};

const chatbotService = {
  sendMessage,
  getConversations,
  getConversation,
  escalateConversation,
  closeConversation,
  getUserContext,
};

export default chatbotService;

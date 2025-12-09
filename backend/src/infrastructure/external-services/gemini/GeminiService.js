/**
 * GeminiService Implementation
 * Servicio para integración con Google Gemini Pro API
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config/env.config');

class GeminiService {
  constructor() {
    // Modo MOCK si no hay API key
    this.isMockMode = !config.gemini.apiKey || config.gemini.apiKey === '';

    if (this.isMockMode) {
      console.warn('⚠️ Gemini API: Running in MOCK mode (no API key configured)');
    } else {
      this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      console.log('✅ Gemini API initialized with gemini-2.5-flash');
    }
  }

  /**
   * Generar respuesta del chatbot
   * @param {string} userMessage - Mensaje del usuario
   * @param {Array} conversationHistory - Historial de la conversación
   * @param {Object} userContext - Contexto del usuario
   * @returns {Promise<Object>} Respuesta del chatbot
   */
  async generateChatResponse(userMessage, conversationHistory = [], userContext = {}) {
    try {
      // MOCK MODE - Respuestas simuladas
      if (this.isMockMode) {
        return this._generateMockResponse(userMessage, userContext);
      }

      // REAL MODE - Llamada a Gemini API
      const prompt = this._buildPrompt(userMessage, conversationHistory, userContext);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        message: text,
        functionCalls: this._extractFunctionCalls(text),
        confidence: 0.9, // Gemini no retorna confidence, usamos valor alto por defecto
      };
    } catch (error) {
      console.error('❌ Error generating chat response:', error);

      // Fallback a respuesta genérica
      return {
        message: 'Lo siento, tuve un problema al procesar tu consulta. ¿Podrías reformularla?',
        functionCalls: null,
        confidence: 0.5,
        error: error.message,
      };
    }
  }

  /**
   * Construir prompt para Gemini
   * @private
   */
  _buildPrompt(userMessage, conversationHistory, userContext) {
    const systemPrompt = `Eres un asistente virtual inteligente del Instituto Superior Técnico de Enfermería "María Parado de Bellido" en Ayacucho, Perú.

Tu nombre es "Smart Assistant" y tu objetivo es ayudar a estudiantes, docentes y personal administrativo con:
- Consultas sobre documentos y trámites
- Información de la biblioteca virtual
- Simulaciones AR y prácticas clínicas
- Citas de teleenfermería
- Procesos académicos y administrativos

CONTEXTO DEL USUARIO:
- Nombre: ${userContext.userName || 'Usuario'}
- Rol: ${userContext.userRole || 'STUDENT'}
- Email: ${userContext.userEmail || 'No disponible'}

INSTRUCCIONES:
1. Responde en español peruano, de manera amigable y profesional
2. Si necesitas información específica del sistema, indica qué función ejecutar usando el formato: [FUNCTION:nombre_funcion]
3. Mantén respuestas concisas (máximo 3 párrafos)
4. Si no sabes algo, admítelo y sugiere alternativas
5. Para consultas complejas, ofrece escalar a soporte humano

FUNCIONES DISPONIBLES:
- [FUNCTION:get_documents] - Obtener documentos del usuario
- [FUNCTION:get_appointments] - Obtener citas del usuario
- [FUNCTION:search_resources] - Buscar recursos en biblioteca
- [FUNCTION:get_simulations] - Obtener simulaciones disponibles
- [FUNCTION:escalate_to_human] - Escalar a soporte humano

HISTORIAL DE CONVERSACIÓN:
${this._formatConversationHistory(conversationHistory)}

MENSAJE ACTUAL DEL USUARIO:
${userMessage}

RESPUESTA:`;

    return systemPrompt;
  }

  /**
   * Formatear historial de conversación
   * @private
   */
  _formatConversationHistory(history) {
    if (!history || history.length === 0) {
      return '(Sin historial previo)';
    }

    return history
      .slice(-10) // Últimos 10 mensajes
      .map((msg) => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Extraer function calls del texto de respuesta
   * @private
   */
  _extractFunctionCalls(text) {
    const functionPattern = /\[FUNCTION:(\w+)\]/g;
    const matches = [...text.matchAll(functionPattern)];

    if (matches.length === 0) {
      return null;
    }

    return matches.map((match) => ({
      name: match[1],
      executed: false,
    }));
  }

  /**
   * Generar respuesta MOCK (sin API key)
   * @private
   */
  _generateMockResponse(userMessage, userContext) {
    const lowerMessage = userMessage.toLowerCase();

    // Respuestas predefinidas por palabras clave
    if (lowerMessage.includes('documento') || lowerMessage.includes('certificado')) {
      return {
        message: `Hola ${userContext.userName || 'usuario'}, puedo ayudarte con tus documentos. Para ver tus documentos subidos, usa [FUNCTION:get_documents]. ¿Qué documento necesitas consultar?`,
        functionCalls: [{ name: 'get_documents', executed: false }],
        confidence: 0.8,
      };
    }

    if (lowerMessage.includes('cita') || lowerMessage.includes('teleenfermería')) {
      return {
        message:
          'Puedo mostrarte tus citas de teleenfermería. [FUNCTION:get_appointments] ¿Quieres agendar una nueva cita o ver las existentes?',
        functionCalls: [{ name: 'get_appointments', executed: false }],
        confidence: 0.8,
      };
    }

    if (
      lowerMessage.includes('biblioteca') ||
      lowerMessage.includes('libro') ||
      lowerMessage.includes('recurso')
    ) {
      return {
        message:
          'Puedo ayudarte a buscar recursos en la biblioteca virtual. [FUNCTION:search_resources] ¿Qué tema te interesa?',
        functionCalls: [{ name: 'search_resources', executed: false }],
        confidence: 0.8,
      };
    }

    if (
      lowerMessage.includes('simulación') ||
      lowerMessage.includes('ar') ||
      lowerMessage.includes('práctica')
    ) {
      return {
        message:
          'Las simulaciones AR te permiten practicar procedimientos clínicos. [FUNCTION:get_simulations] ¿Quieres ver las simulaciones disponibles?',
        functionCalls: [{ name: 'get_simulations', executed: false }],
        confidence: 0.8,
      };
    }

    if (
      lowerMessage.includes('ayuda') ||
      lowerMessage.includes('soporte') ||
      lowerMessage.includes('humano')
    ) {
      return {
        message:
          'Entiendo que necesitas ayuda adicional. Puedo conectarte con un agente humano. [FUNCTION:escalate_to_human] ¿Quieres que escale tu consulta?',
        functionCalls: [{ name: 'escalate_to_human', executed: false }],
        confidence: 0.9,
      };
    }

    // Respuesta genérica
    return {
      message: `Hola ${userContext.userName || 'usuario'}, soy el asistente virtual de Smart Campus. Puedo ayudarte con:\n\n• Consultas sobre documentos y trámites\n• Información de biblioteca virtual\n• Simulaciones AR\n• Citas de teleenfermería\n\n¿En qué puedo ayudarte hoy?`,
      functionCalls: null,
      confidence: 0.7,
    };
  }

  /**
   * Analizar sentimiento del mensaje (opcional)
   * @param {string} message - Mensaje a analizar
   * @returns {Promise<Object>} Análisis de sentimiento
   */
  async analyzeSentiment(message) {
    // Análisis simple de sentimiento
    const positiveWords = ['gracias', 'excelente', 'bueno', 'perfecto', 'genial'];
    const negativeWords = ['mal', 'problema', 'error', 'no funciona', 'malo'];

    const lowerMessage = message.toLowerCase();
    const hasPositive = positiveWords.some((word) => lowerMessage.includes(word));
    const hasNegative = negativeWords.some((word) => lowerMessage.includes(word));

    let sentiment = 'neutral';
    if (hasPositive && !hasNegative) sentiment = 'positive';
    if (hasNegative && !hasPositive) sentiment = 'negative';

    return {
      sentiment,
      confidence: 0.7,
    };
  }
}

module.exports = GeminiService;

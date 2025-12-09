// src/infrastructure/messaging/EventBus.js

const EventEmitter = require('events');

/**
 * EventBus - Singleton Pattern
 * Sistema de eventos interno para comunicación desacoplada entre módulos
 */
class EventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50); // Aumentar límite de listeners
  }

  /**
   * Publica un evento
   * @param {string} eventName - Nombre del evento
   * @param {Object} data - Datos del evento
   */
  publish(eventName, data) {
    console.log(`[EventBus] Publishing: ${eventName}`);
    this.emit(eventName, data);
  }

  /**
   * Se suscribe a un evento
   * @param {string} eventName - Nombre del evento
   * @param {Function} handler - Función que maneja el evento
   */
  subscribe(eventName, handler) {
    console.log(`[EventBus] Subscribing to: ${eventName}`);
    this.on(eventName, handler);
  }

  /**
   * Se desuscribe de un evento
   * @param {string} eventName - Nombre del evento
   * @param {Function} handler - Función a remover
   */
  unsubscribe(eventName, handler) {
    console.log(`[EventBus] Unsubscribing from: ${eventName}`);
    this.off(eventName, handler);
  }

  /**
   * Limpia todos los listeners de un evento
   * @param {string} eventName - Nombre del evento
   */
  clear(eventName) {
    this.removeAllListeners(eventName);
  }

  /**
   * Limpia todos los listeners
   */
  clearAll() {
    this.removeAllListeners();
  }
}

// Singleton instance
let instance = null;

/**
 * Obtiene la instancia única del EventBus
 * @returns {EventBus}
 */
function getInstance() {
  if (!instance) {
    instance = new EventBus();
    console.log('[EventBus] Instance created');
  }
  return instance;
}

module.exports = {
  EventBus,
  getInstance,
};

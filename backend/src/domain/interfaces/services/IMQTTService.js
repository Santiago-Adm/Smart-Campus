/**
 * Interface: IMQTTService
 * Contrato para el servicio de comunicación MQTT con dispositivos IoT
 */

class IMQTTService {
  /**
   * Conectar al broker MQTT
   * @returns {Promise<void>}
   */
  async connect() {
    throw new Error('Method connect() must be implemented');
  }

  /**
   * Desconectar del broker MQTT
   * @returns {Promise<void>}
   */
  async disconnect() {
    throw new Error('Method disconnect() must be implemented');
  }

  /**
   * Publicar mensaje a un topic
   * @param {string} topic
   * @param {Object} message
   * @returns {Promise<void>}
   */
  async publish(_topic, _message) {
    throw new Error('Method publish() must be implemented');
  }

  /**
   * Suscribirse a un topic
   * @param {string} topic
   * @param {Function} callback
   * @returns {Promise<void>}
   */
  async subscribe(_topic, _callback) {
    throw new Error('Method subscribe() must be implemented');
  }

  /**
   * Generar datos vitales simulados
   * @param {string} deviceId
   * @returns {Object}
   */
  generateMockVitalSigns(_deviceId) {
    throw new Error('Method generateMockVitalSigns() must be implemented');
  }
}

module.exports = IMQTTService;

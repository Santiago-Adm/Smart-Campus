/**
 * MQTTService (MOCK Implementation)
 * Servicio MOCK para simular comunicación MQTT con dispositivos IoT
 * En producción se conectará a un broker MQTT real (Mosquitto, HiveMQ, etc.)
 */

const IMQTTService = require('../../../domain/interfaces/services/IMQTTService');

class MQTTService extends IMQTTService {
  constructor() {
    super();
    this.isConnected = false;
    this.subscribers = new Map();
    this.mockDataInterval = null;
    console.log('⚠️  MQTT Service: Running in MOCK mode');
  }

  /**
   * Conectar al broker MQTT (MOCK)
   */
  async connect() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true;
        console.log('✅ MQTT: Connected to MOCK broker');
        resolve();
      }, 100);
    });
  }

  /**
   * Desconectar del broker MQTT (MOCK)
   */
  async disconnect() {
    return new Promise((resolve) => {
      if (this.mockDataInterval) {
        clearInterval(this.mockDataInterval);
        this.mockDataInterval = null;
      }

      setTimeout(() => {
        this.isConnected = false;
        this.subscribers.clear();
        console.log('🔌 MQTT: Disconnected from MOCK broker');
        resolve();
      }, 100);
    });
  }

  /**
   * Publicar mensaje a un topic (MOCK)
   */
  async publish(topic, message) {
    if (!this.isConnected) {
      throw new Error('MQTT not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`📤 MQTT MOCK Publish to [${topic}]:`, message);
        resolve();
      }, 50);
    });
  }

  /**
   * Suscribirse a un topic (MOCK)
   */
  async subscribe(topic, callback) {
    if (!this.isConnected) {
      throw new Error('MQTT not connected');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        this.subscribers.set(topic, callback);
        console.log(`📥 MQTT MOCK Subscribed to [${topic}]`);

        // Simular recepción de datos cada 2 segundos
        this._startMockDataEmission(topic, callback);

        resolve();
      }, 50);
    });
  }

  /**
   * Iniciar emisión de datos MOCK
   * @private
   */
  _startMockDataEmission(topic, callback) {
    // Emitir datos simulados cada 2 segundos
    this.mockDataInterval = setInterval(() => {
      const deviceId = this._extractDeviceIdFromTopic(topic);
      const mockData = this.generateMockVitalSigns(deviceId);

      // Llamar al callback con los datos simulados
      callback(mockData);
    }, 2000);
  }

  /**
   * Extraer deviceId del topic
   * @private
   */
  _extractDeviceIdFromTopic(topic) {
    // Formato esperado: devices/{deviceId}/vitals
    const parts = topic.split('/');
    return parts[1] || 'device_001';
  }

  /**
   * Generar datos vitales simulados
   */
  generateMockVitalSigns(deviceId = 'device_001') {
    // Generar valores dentro de rangos normales con variación aleatoria
    const heartRate = this._randomInRange(60, 100); // bpm
    const spo2 = this._randomInRange(95, 100); // %
    const temperature = this._randomInRange(36.0, 37.5); // °C
    const systolicBP = this._randomInRange(110, 130); // mmHg
    const diastolicBP = this._randomInRange(70, 85); // mmHg
    const respiratoryRate = this._randomInRange(12, 20); // rpm

    return {
      deviceId,
      timestamp: new Date().toISOString(),
      vitalSigns: {
        heartRate: {
          value: heartRate,
          unit: 'bpm',
          status: this._getStatus(heartRate, 60, 100),
        },
        spo2: {
          value: spo2,
          unit: '%',
          status: this._getStatus(spo2, 95, 100),
        },
        temperature: {
          value: parseFloat(temperature.toFixed(1)),
          unit: '°C',
          status: this._getStatus(temperature, 36.0, 37.5),
        },
        bloodPressure: {
          systolic: systolicBP,
          diastolic: diastolicBP,
          unit: 'mmHg',
          status: this._getBPStatus(systolicBP, diastolicBP),
        },
        respiratoryRate: {
          value: respiratoryRate,
          unit: 'rpm',
          status: this._getStatus(respiratoryRate, 12, 20),
        },
      },
      battery: this._randomInRange(20, 100), // %
      signalStrength: this._randomInRange(50, 100), // %
    };
  }

  /**
   * Generar número aleatorio en un rango
   * @private
   */
  _randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Determinar estado (normal, warning, critical)
   * @private
   */
  _getStatus(value, normalMin, normalMax) {
    if (value < normalMin * 0.8 || value > normalMax * 1.2) {
      return 'critical';
    }
    if (value < normalMin || value > normalMax) {
      return 'warning';
    }
    return 'normal';
  }

  /**
   * Determinar estado de presión arterial
   * @private
   */
  _getBPStatus(systolic, diastolic) {
    if (systolic > 140 || diastolic > 90) {
      return 'high';
    }
    if (systolic < 90 || diastolic < 60) {
      return 'low';
    }
    return 'normal';
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      subscribedTopics: Array.from(this.subscribers.keys()),
      mode: 'MOCK',
    };
  }

  /**
   * Simular desconexión de dispositivo
   */
  simulateDeviceDisconnect(deviceId) {
    console.log(`⚠️  MQTT MOCK: Device ${deviceId} disconnected`);
    return {
      deviceId,
      status: 'disconnected',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Simular error de dispositivo
   */
  simulateDeviceError(deviceId, errorType = 'sensor_failure') {
    console.log(`❌ MQTT MOCK: Device ${deviceId} error: ${errorType}`);
    return {
      deviceId,
      error: errorType,
      timestamp: new Date().toISOString(),
      message: 'Mock device error',
    };
  }
}

module.exports = MQTTService;

/**
 * Use Case: Connect IoT Device
 * Conecta un dispositivo IoT a una simulación para capturar datos fisiológicos
 */

class ConnectIoTDeviceUseCase {
  constructor({ mqttService }) {
    this.mqttService = mqttService;
  }

  /**
   * Ejecutar conexión de dispositivo IoT
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async execute({ userId, sessionId, deviceId, deviceType = 'pulse_oximeter' }) {
    try {
      // Validar parámetros
      if (!userId) throw new Error('User ID is required');
      if (!sessionId) throw new Error('Session ID is required');
      if (!deviceId) throw new Error('Device ID is required');

      // Conectar al broker MQTT si no está conectado
      const status = this.mqttService.getConnectionStatus();
      if (!status.isConnected) {
        await this.mqttService.connect();
      }

      // Generar topic único para este dispositivo
      const topic = `devices/${deviceId}/vitals`;

      // Suscribirse al topic para recibir datos
      const vitalSignsData = [];
      await this.mqttService.subscribe(topic, (data) => {
        console.log(`📊 Received vital signs from ${deviceId}:`, data);
        vitalSignsData.push(data);
      });

      // Generar datos iniciales MOCK
      const initialData = this.mqttService.generateMockVitalSigns(deviceId);

      return {
        success: true,
        connection: {
          userId,
          sessionId,
          deviceId,
          deviceType,
          topic,
          status: 'connected',
          connectedAt: new Date(),
          mode: 'MOCK',
        },
        initialData,
        message: 'Device connected successfully. Receiving data every 2 seconds.',
      };
    } catch (error) {
      throw new Error(`Error connecting IoT device: ${error.message}`);
    }
  }

  /**
   * Desconectar dispositivo IoT
   */
  async disconnect({ deviceId }) {
    try {
      if (!deviceId) throw new Error('Device ID is required');

      // eslint-disable-next-line no-unused-vars
      const result = this.mqttService.simulateDeviceDisconnect(deviceId);

      return {
        success: true,
        deviceId,
        status: 'disconnected',
        disconnectedAt: new Date(),
        message: 'Device disconnected successfully',
      };
    } catch (error) {
      throw new Error(`Error disconnecting IoT device: ${error.message}`);
    }
  }

  /**
   * Obtener estado del dispositivo
   */
  async getDeviceStatus({ deviceId }) {
    try {
      if (!deviceId) throw new Error('Device ID is required');

      const connectionStatus = this.mqttService.getConnectionStatus();
      const currentData = this.mqttService.generateMockVitalSigns(deviceId);

      return {
        deviceId,
        isConnected: connectionStatus.isConnected,
        mode: connectionStatus.mode,
        currentData,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Error getting device status: ${error.message}`);
    }
  }
}

module.exports = ConnectIoTDeviceUseCase;

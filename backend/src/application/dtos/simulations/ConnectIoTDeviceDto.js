/**
 * DTO: Connect IoT Device
 * Valida datos para conectar dispositivo IoT
 */

class ConnectIoTDeviceDto {
  constructor({ sessionId, deviceId, deviceType = 'pulse_oximeter', action = 'connect' }) {
    this.sessionId = sessionId;
    this.deviceId = deviceId;
    this.deviceType = deviceType;
    this.action = action;
  }

  /**
   * Validar datos
   */
  validate() {
    const errors = [];

    // Validar sessionId
    if (!this.sessionId) {
      errors.push('Session ID is required');
    }

    // Validar deviceId
    if (!this.deviceId) {
      errors.push('Device ID is required');
    }

    // Validar deviceType
    const validDeviceTypes = [
      'pulse_oximeter',
      'blood_pressure_monitor',
      'thermometer',
      'ecg_monitor',
      'respiratory_monitor',
    ];
    if (!validDeviceTypes.includes(this.deviceType)) {
      errors.push(`Device type must be one of: ${validDeviceTypes.join(', ')}`);
    }

    // Validar action
    const validActions = ['connect', 'disconnect', 'status'];
    if (!validActions.includes(this.action)) {
      errors.push(`Action must be one of: ${validActions.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return true;
  }
}

module.exports = ConnectIoTDeviceDto;

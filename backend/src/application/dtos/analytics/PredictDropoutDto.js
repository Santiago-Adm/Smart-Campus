/**
 * DTO: Predict Dropout Risk Request
 * Parámetros para predicción de riesgo de deserción
 */

class PredictDropoutDto {
  constructor({ userId, userIds }) {
    this.userId = userId || null;
    this.userIds = userIds || null;

    this.validate();
  }

  validate() {
    // Al menos uno debe estar presente
    if (!this.userId && !this.userIds) {
      // Si no se proporciona ninguno, se predecirá para todos los estudiantes
      return;
    }

    // Si se proporciona userIds, debe ser un array
    if (this.userIds && !Array.isArray(this.userIds)) {
      throw new Error('userIds must be an array');
    }

    // Si se proporcionan ambos, lanzar error
    if (this.userId && this.userIds) {
      throw new Error('Cannot specify both userId and userIds. Choose one.');
    }
  }

  toObject() {
    return {
      userId: this.userId,
      userIds: this.userIds,
    };
  }
}

module.exports = PredictDropoutDto;

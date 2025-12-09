/**
 * Interface: IAppointmentRepository
 * Contrato para el repositorio de citas (PostgreSQL)
 */

class IAppointmentRepository {
  /**
   * Crear una nueva cita
   * @param {Appointment} _appointment
   * @returns {Promise<Appointment>}
   */
  async create(_appointment) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Buscar cita por ID
   * @param {string|number} _id
   * @returns {Promise<Appointment|null>}
   */
  async findById(_id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Buscar citas por estudiante
   * @param {string} _studentId
   * @param {Object} _filters - { status, dateFrom, dateTo }
   * @returns {Promise<Appointment[]>}
   */
  async findByStudentId(_studentId, _filters) {
    throw new Error('Method findByStudentId() must be implemented');
  }

  /**
   * Buscar citas por docente
   * @param {string} _teacherId
   * @param {Object} _filters - { status, dateFrom, dateTo }
   * @returns {Promise<Appointment[]>}
   */
  async findByTeacherId(_teacherId, _filters) {
    throw new Error('Method findByTeacherId() must be implemented');
  }

  /**
   * Buscar citas en un rango de fechas
   * @param {Date} _startDate
   * @param {Date} _endDate
   * @param {Object} _filters
   * @returns {Promise<Appointment[]>}
   */
  async findByDateRange(_startDate, _endDate, _filters) {
    throw new Error('Method findByDateRange() must be implemented');
  }

  /**
   * Actualizar cita
   * @param {string|number} _id
   * @param {Object} _updates
   * @returns {Promise<Appointment>}
   */
  async update(_id, _updates) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Eliminar cita
   * @param {string|number} _id
   * @returns {Promise<boolean>}
   */
  async delete(_id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Verificar disponibilidad de un docente
   * @param {string} _teacherId
   * @param {Date} _scheduledAt
   * @param {number} _duration
   * @returns {Promise<boolean>}
   */
  async checkTeacherAvailability(_teacherId, _scheduledAt, _duration) {
    throw new Error('Method checkTeacherAvailability() must be implemented');
  }

  /**
   * Buscar citas próximas (próximas 24 horas)
   * @param {string} _userId - Puede ser estudiante o docente
   * @returns {Promise<Appointment[]>}
   */
  async findUpcoming(_userId) {
    throw new Error('Method findUpcoming() must be implemented');
  }
}

module.exports = IAppointmentRepository;

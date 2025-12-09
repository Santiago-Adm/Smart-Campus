/**
 * AppointmentRepository Implementation
 * Implementa IAppointmentRepository usando Sequelize (PostgreSQL)
 */

const { Op } = require('sequelize');
const IAppointmentRepository = require('../../../../domain/interfaces/repositories/IAppointmentRepository');
const Appointment = require('../../../../domain/entities/Appointment.entity');
const { models } = require('../config/sequelize.config');

class AppointmentRepository extends IAppointmentRepository {
  /**
   * Convertir modelo Sequelize a Entity Appointment
   */
  _toEntity(appointmentModel) {
    if (!appointmentModel) return null;

    // ✅ Crear entidad base con skipValidation
    const appointment = new Appointment({
      id: appointmentModel.id,
      studentId: appointmentModel.studentId,
      teacherId: appointmentModel.teacherId,
      scheduledAt: appointmentModel.scheduledAt,
      duration: appointmentModel.duration,
      status: appointmentModel.status,
      reason: appointmentModel.reason,
      notes: appointmentModel.notes,
      recordingUrl: appointmentModel.recordingUrl,
      vitalSigns: appointmentModel.vitalSigns,
      createdAt: appointmentModel.createdAt,
      updatedAt: appointmentModel.updatedAt,
      skipValidation: true, // ✅ CRÍTICO: No validar fechas pasadas
    });

    // ✅ CRÍTICO: Mapear relaciones student y teacher
    // Estas relaciones vienen de Sequelize cuando usas include
    if (appointmentModel.student) {
      appointment.student = {
        id: appointmentModel.student.id,
        firstName: appointmentModel.student.firstName,
        lastName: appointmentModel.student.lastName,
        email: appointmentModel.student.email,
      };
    }

    if (appointmentModel.teacher) {
      appointment.teacher = {
        id: appointmentModel.teacher.id,
        firstName: appointmentModel.teacher.firstName,
        lastName: appointmentModel.teacher.lastName,
        email: appointmentModel.teacher.email,
      };
    }

    return appointment;
  }

  /**
   * Convertir Entity Appointment a objeto plano
   */
  _toModel(appointment) {
    return {
      studentId: appointment.studentId,
      teacherId: appointment.teacherId,
      scheduledAt: appointment.scheduledAt,
      duration: appointment.duration,
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes,
      recordingUrl: appointment.recordingUrl,
      vitalSigns: appointment.vitalSigns,
    };
  }

  /**
   * Crear una nueva cita
   */
  async create(appointment) {
    try {
      const appointmentData = this._toModel(appointment);
      const appointmentModel = await models.Appointment.create(appointmentData);

      return this._toEntity(appointmentModel);
    } catch (error) {
      throw new Error(`Error creating appointment: ${error.message}`);
    }
  }

  /**
   * Buscar cita por ID
   */
  async findById(id) {
    try {
      const appointmentModel = await models.Appointment.findByPk(id, {
        include: [
          {
            model: models.User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: models.User,
            as: 'teacher',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
      });

      return this._toEntity(appointmentModel);
    } catch (error) {
      throw new Error(`Error finding appointment by ID: ${error.message}`);
    }
  }

  /**
   * Buscar citas por estudiante
   */
  async findByStudentId(studentId, filters = {}) {
    try {
      const { status, dateFrom, dateTo } = filters;

      const where = { studentId };

      if (status) {
        where.status = status;
      }

      if (dateFrom || dateTo) {
        where.scheduledAt = {};
        if (dateFrom) where.scheduledAt[Op.gte] = new Date(dateFrom);
        if (dateTo) where.scheduledAt[Op.lte] = new Date(dateTo);
      }

      const appointments = await models.Appointment.findAll({
        where,
        include: [
          {
            model: models.User,
            as: 'teacher',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['scheduledAt', 'ASC']],
      });

      return appointments.map((apt) => this._toEntity(apt));
    } catch (error) {
      throw new Error(`Error finding appointments by student: ${error.message}`);
    }
  }

  /**
   * Buscar citas por docente
   */
  async findByTeacherId(teacherId, filters = {}) {
    try {
      const { status, dateFrom, dateTo } = filters;

      const where = { teacherId };

      if (status) {
        where.status = status;
      }

      if (dateFrom || dateTo) {
        where.scheduledAt = {};
        if (dateFrom) where.scheduledAt[Op.gte] = new Date(dateFrom);
        if (dateTo) where.scheduledAt[Op.lte] = new Date(dateTo);
      }

      const appointments = await models.Appointment.findAll({
        where,
        include: [
          {
            model: models.User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['scheduledAt', 'ASC']],
      });

      return appointments.map((apt) => this._toEntity(apt));
    } catch (error) {
      throw new Error(`Error finding appointments by teacher: ${error.message}`);
    }
  }

  /**
   * Buscar citas en un rango de fechas
   */
  async findByDateRange(startDate, endDate, filters = {}) {
    try {
      const { teacherId, studentId, status } = filters;

      const where = {
        scheduledAt: {
          [Op.gte]: new Date(startDate),
          [Op.lte]: new Date(endDate),
        },
      };

      if (teacherId) where.teacherId = teacherId;
      if (studentId) where.studentId = studentId;
      if (status) where.status = status;

      const appointments = await models.Appointment.findAll({
        where,
        include: [
          { model: models.User, as: 'student', attributes: ['id', 'firstName', 'lastName'] },
          { model: models.User, as: 'teacher', attributes: ['id', 'firstName', 'lastName'] },
        ],
        order: [['scheduledAt', 'ASC']],
      });

      return appointments.map((apt) => this._toEntity(apt));
    } catch (error) {
      throw new Error(`Error finding appointments by date range: ${error.message}`);
    }
  }

  /**
   * Actualizar cita
   */
  async update(id, updates) {
    try {
      const appointmentModel = await models.Appointment.findByPk(id);

      if (!appointmentModel) {
        throw new Error('Appointment not found');
      }

      const allowedUpdates = [
        'scheduledAt',
        'duration',
        'status',
        'reason',
        'notes',
        'recordingUrl',
        'vitalSigns',
      ];

      Object.keys(updates).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          appointmentModel[key] = updates[key];
        }
      });

      await appointmentModel.save();

      return this._toEntity(appointmentModel);
    } catch (error) {
      throw new Error(`Error updating appointment: ${error.message}`);
    }
  }

  /**
   * Eliminar cita
   */
  async delete(id) {
    try {
      const result = await models.Appointment.destroy({
        where: { id },
      });

      return result > 0;
    } catch (error) {
      throw new Error(`Error deleting appointment: ${error.message}`);
    }
  }

  /**
   * Verificar disponibilidad del docente
   * @param {string} teacherId - ID del docente
   * @param {Date} scheduledAt - Fecha y hora de la cita
   * @param {number} duration - Duración en minutos
   * @returns {Promise<boolean>}
   */
  async checkTeacherAvailability(teacherId, scheduledAt, duration) {
    try {
      const startTime = new Date(scheduledAt);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      console.log('🔍 Checking teacher availability:', {
        teacherId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
      });

      // ✅ CORRECCIÓN: Usar models.Appointment
      const activeAppointments = await models.Appointment.findAll({
        where: {
          teacherId, // ✅ Sin guion bajo (Sequelize lo mapea automáticamente)
          status: {
            [Op.in]: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
      });

      console.log(`📋 Found ${activeAppointments.length} active appointments for teacher`);

      // ✅ Verificar manualmente si hay solapamiento
      const hasConflict = activeAppointments.some((appointment) => {
        const existingStart = new Date(appointment.scheduledAt); // ✅ Sin guion bajo
        const existingEnd = new Date(existingStart.getTime() + appointment.duration * 60000);

        console.log('  📅 Checking appointment:', {
          id: appointment.id,
          existingStart: existingStart.toISOString(),
          existingEnd: existingEnd.toISOString(),
        });

        // Verificar solapamiento
        const overlaps =
          (startTime >= existingStart && startTime < existingEnd) ||
          (endTime > existingStart && endTime <= existingEnd) ||
          (startTime <= existingStart && endTime >= existingEnd);

        if (overlaps) {
          console.log('    ❌ Conflict detected with appointment:', appointment.id);
        }

        return overlaps;
      });

      const isAvailable = !hasConflict;

      console.log('✅ Teacher availability result:', { isAvailable });

      return isAvailable;
    } catch (error) {
      console.error('❌ Error checking teacher availability:', error);
      throw error;
    }
  }

  /**
   * Buscar citas próximas (próximas 24 horas)
   * ✅ CORREGIDO: Manejo correcto de zona horaria
   */
  async findUpcoming(userId) {
    try {
      const now = new Date();
      const next24Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      console.log('📅 findUpcoming - Searching for user:', userId);
      console.log(
        '📅 Current time (local):',
        now.toLocaleString('es-PE', { timeZone: 'America/Lima' })
      );
      console.log('📅 Current time (UTC):', now.toISOString());
      console.log('📅 Next 24h (UTC):', next24Hours.toISOString());
      console.log('📅 Time range:', {
        from: now.toISOString(),
        to: next24Hours.toISOString(),
      });

      const appointments = await models.Appointment.findAll({
        where: {
          [Op.or]: [{ studentId: userId }, { teacherId: userId }],
          scheduledAt: {
            [Op.gte]: now, // ✅ Desde AHORA
            [Op.lte]: next24Hours, // ✅ Hasta dentro de 24h
          },
          status: {
            [Op.in]: ['SCHEDULED', 'CONFIRMED'],
          },
        },
        include: [
          {
            model: models.User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: models.User,
            as: 'teacher',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['scheduledAt', 'ASC']],
      });

      console.log('📅 Found', appointments.length, 'upcoming appointments');

      if (appointments.length > 0) {
        console.log('📅 First appointment:', {
          id: appointments[0].id,
          scheduledAt: appointments[0].scheduledAt,
          scheduledAtLocal: new Date(appointments[0].scheduledAt).toLocaleString('es-PE', {
            timeZone: 'America/Lima',
          }),
        });
      }

      return appointments.map((apt) => this._toEntity(apt));
    } catch (error) {
      console.error('❌ Error in findUpcoming:', error);
      throw new Error(`Error finding upcoming appointments: ${error.message}`);
    }
  }

  /**
   * Contar citas por estado
   * @param {string} status - Estado de la cita
   * @param {Object} filter - Filtros adicionales
   * @returns {Promise<number>} Total de citas
   */
  async countByStatus(status, filter = {}) {
    try {
      const where = { status };

      if (filter.studentId) {
        where.studentId = filter.studentId;
      }

      if (filter.teacherId) {
        where.teacherId = filter.teacherId;
      }

      return await models.Appointment.count({ where });
    } catch (error) {
      console.error('Error counting appointments by status:', error);
      throw new Error(`Error counting appointments: ${error.message}`);
    }
  }

  /**
   * Contar citas en un período
   * @param {Date} startDate - Fecha inicio
   * @param {Date} endDate - Fecha fin
   * @returns {Promise<number>} Total de citas
   */
  async countInPeriod(startDate, endDate) {
    try {
      // eslint-disable-next-line no-shadow, global-require
      const { Op } = require('sequelize');

      return await models.Appointment.count({
        where: {
          scheduledAt: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
          },
        },
      });
    } catch (error) {
      console.error('Error counting appointments in period:', error);
      throw new Error(`Error counting appointments: ${error.message}`);
    }
  }

  /**
   * Encontrar todas las citas con filtros opcionales (para admins)
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array<Appointment>>}
   */
  async findAll(filters = {}) {
    try {
      const where = {};

      // Filtro por estado
      if (filters.status) {
        if (typeof filters.status === 'string' && filters.status.includes(',')) {
          where.status = {
            [Op.in]: filters.status.split(',').map((s) => s.trim()),
          };
        } else {
          where.status = filters.status;
        }
      }

      // Filtro por rango de fechas
      if (filters.dateFrom || filters.dateTo) {
        where.scheduledAt = {};

        if (filters.dateFrom) {
          where.scheduledAt[Op.gte] = new Date(filters.dateFrom);
        }

        if (filters.dateTo) {
          where.scheduledAt[Op.lte] = new Date(filters.dateTo);
        }
      }

      console.log('🔍 AppointmentRepository.findAll - Filters:', where);

      const appointmentModels = await models.Appointment.findAll({
        where,
        include: [
          {
            model: models.User,
            as: 'student',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
          {
            model: models.User,
            as: 'teacher',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['scheduledAt', 'DESC']],
      });

      // ✅ AGREGAR ESTE LOG AQUÍ
      console.log('🔍 CRITICAL DEBUG - First appointment from DB:');
      console.log('Raw model:', appointmentModels[0]?.toJSON());
      console.log('Has student?', appointmentModels[0]?.student);
      console.log('Has teacher?', appointmentModels[0]?.teacher);

      console.log(
        `✅ AppointmentRepository.findAll - Found ${appointmentModels.length} appointments`
      );

      return appointmentModels.map((model) => this._toEntity(model));
    } catch (error) {
      console.error('❌ Error in AppointmentRepository.findAll:', error);
      throw new Error(`Error finding all appointments: ${error.message}`);
    }
  }
}

module.exports = AppointmentRepository;

/**
 * ContextBuilderService
 * Construye el contexto del usuario para el chatbot
 */

class ContextBuilderService {
  constructor({
    userRepository,
    documentRepository,
    resourceRepository,
    appointmentRepository,
    scenarioRepository,
  }) {
    this.userRepository = userRepository;
    this.documentRepository = documentRepository;
    this.resourceRepository = resourceRepository;
    this.appointmentRepository = appointmentRepository;
    this.scenarioRepository = scenarioRepository;
  }

  /**
   * Construir contexto completo del usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Contexto del usuario
   */
  async buildUserContext(userId) {
    try {
      console.log(`🔍 Building context for user: ${userId}`);

      // Obtener información del usuario en paralelo
      const [user, documentsInfo, appointmentsInfo, recentActivity] = await Promise.all([
        this._getUserInfo(userId),
        this._getDocumentsInfo(userId),
        this._getAppointmentsInfo(userId),
        this._getRecentActivity(userId),
      ]);

      const context = {
        user,
        documents: documentsInfo,
        appointments: appointmentsInfo,
        recentActivity,
        timestamp: new Date(),
      };

      console.log('✅ Context built successfully');
      return context;
    } catch (error) {
      console.error('❌ Error building user context:', error);
      // Retornar contexto mínimo en caso de error
      return {
        user: { id: userId },
        documents: {},
        appointments: {},
        recentActivity: [],
        timestamp: new Date(),
      };
    }
  }

  /**
   * Obtener información del usuario
   * @private
   */
  async _getUserInfo(userId) {
    try {
      const user = await this.userRepository.findById(userId);

      if (!user) {
        return { id: userId };
      }

      return {
        id: user.id,
        userName: user.getFullName(),
        userEmail: user.email.getValue(),
        userRole: user.roles[0] || 'STUDENT',
        isActive: user.isActive,
      };
    } catch (error) {
      console.warn('Error getting user info:', error.message);
      return { id: userId };
    }
  }

  /**
   * Obtener información de documentos
   * @private
   */
  async _getDocumentsInfo(userId) {
    try {
      const { documents, total } = await this.documentRepository.findByUserId(userId, {
        limit: 5,
      });

      const pending = documents.filter((doc) => doc.status === 'PENDING').length;
      const approved = documents.filter((doc) => doc.status === 'APPROVED').length;

      return {
        total,
        pending,
        approved,
        recent: documents.slice(0, 3).map((doc) => ({
          id: doc.id,
          type: doc.metadata.type,
          status: doc.status,
        })),
      };
    } catch (error) {
      console.warn('Error getting documents info:', error.message);
      return { total: 0, pending: 0, approved: 0, recent: [] };
    }
  }

  /**
   * Obtener información de citas
   * @private
   */
  async _getAppointmentsInfo(userId) {
    try {
      // Obtener citas del usuario (como estudiante o docente)
      const appointments = await this.appointmentRepository.findByUser(userId, {
        limit: 5,
      });

      const upcoming = appointments.filter(
        (apt) => apt.status === 'SCHEDULED' && new Date(apt.scheduledAt) > new Date()
      );

      return {
        total: appointments.length,
        upcoming: upcoming.length,
        nextAppointment: upcoming[0] || null,
      };
    } catch (error) {
      console.warn('Error getting appointments info:', error.message);
      return { total: 0, upcoming: 0, nextAppointment: null };
    }
  }

  /**
   * Obtener actividad reciente
   * @private
   */
  async _getRecentActivity(_userId) {
    try {
      // Por ahora retornamos array vacío
      // En el futuro, podríamos agregar un ActivityLog
      return [];
      // eslint-disable-next-line no-unreachable
    } catch (error) {
      console.warn('Error getting recent activity:', error.message);
      return [];
    }
  }

  /**
   * Construir contexto ligero (solo info básica)
   * @param {string} userId - ID del usuario
   * @returns {Promise<Object>} Contexto ligero
   */
  async buildLightContext(userId) {
    try {
      const user = await this._getUserInfo(userId);

      return {
        user,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error building light context:', error);
      return {
        user: { id: userId },
        timestamp: new Date(),
      };
    }
  }
}

module.exports = ContextBuilderService;

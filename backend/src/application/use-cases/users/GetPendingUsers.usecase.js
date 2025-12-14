/**
 * GetPendingUsersUseCase
 * Obtiene usuarios pendientes de aprobación (isActive = false)
 */

class GetPendingUsersUseCase {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async execute() {
    try {
      console.log('📋 Getting pending users...');

      // ✅ Usar findMany() que ya existe en UserRepository
      const result = await this.userRepository.findMany({
        isActive: false,
        limit: 100,
        offset: 0,
      });

      console.log(`✅ Found ${result.users.length} pending users`);

      return {
        success: true,
        users: result.users,
        total: result.total,
      };
    } catch (error) {
      console.error('❌ Error in GetPendingUsersUseCase:', error);
      throw error;
    }
  }
}

module.exports = GetPendingUsersUseCase;

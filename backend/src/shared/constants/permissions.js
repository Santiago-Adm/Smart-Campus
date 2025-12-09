/**
 * Permissions
 * Define permisos específicos del sistema
 */

module.exports = {
  // ============================================
  // DOCUMENT PERMISSIONS
  // ============================================
  DOCUMENTS: {
    CREATE_OWN: 'documents:create:own',
    READ_OWN: 'documents:read:own',
    READ_ALL: 'documents:read:all',
    UPDATE_OWN: 'documents:update:own',
    DELETE_OWN: 'documents:delete:own',
    VALIDATE: 'documents:validate',
    APPROVE: 'documents:approve',
    REJECT: 'documents:reject',
  },

  // ============================================
  // LIBRARY PERMISSIONS
  // ============================================
  LIBRARY: {
    READ: 'library:read',
    CREATE: 'library:create',
    UPDATE: 'library:update',
    DELETE: 'library:delete',
    RECOMMEND: 'library:recommend',
  },

  // ============================================
  // SIMULATION PERMISSIONS
  // ============================================
  SIMULATIONS: {
    EXECUTE: 'simulations:execute',
    CREATE_SCENARIO: 'simulations:create:scenario',
    UPDATE_SCENARIO: 'simulations:update:scenario',
    DELETE_SCENARIO: 'simulations:delete:scenario',
    VIEW_METRICS: 'simulations:view:metrics',
  },

  // ============================================
  // TELEHEALTH PERMISSIONS
  // ============================================
  TELEHEALTH: {
    SCHEDULE: 'telehealth:schedule',
    HOST: 'telehealth:host',
    CANCEL: 'telehealth:cancel',
    VIEW_OWN: 'telehealth:view:own',
    VIEW_ALL: 'telehealth:view:all',
  },

  // ============================================
  // ANALYTICS PERMISSIONS
  // ============================================
  ANALYTICS: {
    VIEW_DASHBOARD: 'analytics:view:dashboard',
    VIEW_REPORTS: 'analytics:view:reports',
    GENERATE_REPORTS: 'analytics:generate:reports',
    VIEW_PREDICTIONS: 'analytics:view:predictions',
    VIEW_ALERTS: 'analytics:view:alerts',
  },

  // ============================================
  // CHATBOT PERMISSIONS
  // ============================================
  CHATBOT: {
    USE: 'chatbot:use',
    ESCALATE: 'chatbot:escalate',
    VIEW_CONVERSATIONS: 'chatbot:view:conversations',
    MANAGE_ESCALATIONS: 'chatbot:manage:escalations',
  },

  // ============================================
  // USER MANAGEMENT PERMISSIONS
  // ============================================
  USERS: {
    CREATE: 'users:create',
    READ: 'users:read',
    UPDATE: 'users:update',
    DELETE: 'users:delete',
    ASSIGN_ROLES: 'users:assign:roles',
  },
};

/**
 * Users Routes
 * Define todas las rutas para el módulo de usuarios
 */

const express = require('express');

// Middlewares
const { authenticate } = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/rbac.middleware');

/**
 * Setup Users Routes
 * @param {Object} usersController - Controller de usuarios
 */
const setupUsersRoutes = (usersController) => {
  const router = express.Router();

  /**
   * @route   GET /api/users
   * @desc    Obtener lista de usuarios con filtros
   * @access  Private (Todos los roles autenticados)
   *
   * Permisos específicos:
   * - STUDENT: Solo puede ver TEACHERS (validado en controller)
   * - TEACHER: Puede ver STUDENTS y TEACHERS (validado en controller)
   * - ADMINISTRATIVE, IT_ADMIN, DIRECTOR: Pueden ver todos
   *
   * @query   role: string (opcional) - Filtrar por rol
   * @query   search: string (opcional) - Buscar por nombre o email
   * @query   isActive: boolean (opcional) - Filtrar por estado
   * @query   page: number (opcional) - Página
   * @query   limit: number (opcional) - Resultados por página
   */
  router.get(
    '/',
    authenticate,
    // ✅ NUEVO: Permitir acceso a todos los roles autenticados
    // La lógica de permisos específicos está en UsersController
    authorize(['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR']),
    (req, res, next) => usersController.getUsers(req, res, next)
  );

  return router;
};

module.exports = setupUsersRoutes;

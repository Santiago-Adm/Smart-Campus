/**
 * RBAC Middleware (Role-Based Access Control)
 * Verifica que el usuario tenga los roles necesarios para acceder a un recurso
 */

/**
 * Middleware para verificar roles
 * @param {Array<string>} allowedRoles - Roles permitidos para acceder al recurso
 * @returns {Function} Middleware function
 *
 * @example
 * router.post('/admin-only', authorize(['ADMIN']), controller.method);
 * router.post('/staff-and-admin', authorize(['ADMIN', 'STAFF']), controller.method);
 */
// eslint-disable-next-line consistent-return
const authorize = (allowedRoles) => (req, res, next) => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado. Por favor inicie sesión',
      });
    }

    // Verificar que el usuario tenga roles
    if (!req.user.roles || !Array.isArray(req.user.roles)) {
      return res.status(403).json({
        success: false,
        message: 'Usuario sin roles asignados',
      });
    }

    // Verificar si el usuario tiene alguno de los roles permitidos
    const hasPermission = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para acceder a este recurso',
        requiredRoles: allowedRoles,
        userRoles: req.user.roles,
      });
    }

    // Usuario autorizado, continuar
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos',
      error: error.message,
    });
  }
};

module.exports = authorize;

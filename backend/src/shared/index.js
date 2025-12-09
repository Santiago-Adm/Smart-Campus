/**
 * Shared Module Exports
 * Exporta todos los recursos compartidos
 */

const eventTypes = require('./events/eventTypes');
const errorCodes = require('./constants/errorCodes');
const httpStatus = require('./constants/httpStatus');
const permissions = require('./constants/permissions');

module.exports = {
  eventTypes,
  errorCodes,
  httpStatus,
  permissions,
};

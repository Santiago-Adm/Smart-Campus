import api from './api';

const documentService = {
  /**
   * Subir un documento
   * @param {FormData} formData - Archivo + metadata
   * @returns {Promise}
   */
  upload: async (formData) => {
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  /**
   * Obtener lista de documentos con filtros
   * @param {Object} params - Filtros
   * @returns {Promise}
   */
  getAll: async (params = {}) => {
    const {
      userId = null,
      documentType = null,
      status = null,
      dateFrom = null,
      dateTo = null,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const queryParams = new URLSearchParams();

    if (userId) queryParams.append('userId', userId);
    if (documentType) queryParams.append('documentType', documentType);
    if (status) queryParams.append('status', status);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);

    const response = await api.get(`/documents?${queryParams}`);
    return response;
  },

  /**
   * Obtener un documento por ID
   * @param {string} id - ID del documento
   * @returns {Promise}
   */
  getById: async (id) => {
    const response = await api.get(`/documents/${id}`);
    return response;
  },

  /**
   * Validar documento con OCR (Admin)
   * @param {string} id - ID del documento
   * @returns {Promise}
   */
  validate: async (id) => {
    const response = await api.post(`/documents/${id}/validate`);
    return response;
  },

  /**
   * Aprobar documento (Admin)
   * @param {string} id - ID del documento
   * @param {string} notes - Notas opcionales
   * @returns {Promise}
   */
  approve: async (id, notes = '') => {
    const response = await api.post(`/documents/${id}/approve`, { notes });
    return response;
  },

  /**
   * Rechazar documento (Admin)
   * @param {string} id - ID del documento
   * @param {string} reason - Motivo del rechazo
   * @returns {Promise}
   */
  reject: async (id, reason) => {
    const response = await api.post(`/documents/${id}/reject`, { reason });
    return response;
  },

  /**
   * Eliminar documento
   * @param {string} id - ID del documento
   * @returns {Promise}
   */
  delete: async (id) => {
    const response = await api.delete(`/documents/${id}`);
    return response;
  },
};

export default documentService;

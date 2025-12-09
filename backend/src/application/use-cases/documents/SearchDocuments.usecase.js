/**
 * SearchDocuments Use Case
 * Busca documentos con filtros avanzados
 */

class SearchDocumentsUseCase {
  /**
   * @param {Object} dependencies
   * @param {IDocumentRepository} dependencies.documentRepository
   */
  constructor({ documentRepository }) {
    this.documentRepository = documentRepository;
  }

  /**
   * Ejecutar búsqueda de documentos
   * @param {Object} filters
   * @param {string} filters.userId - Filtrar por usuario (opcional)
   * @param {string} filters.documentType - Filtrar por tipo de documento
   * @param {string} filters.status - Filtrar por estado
   * @param {Date} filters.dateFrom - Fecha desde
   * @param {Date} filters.dateTo - Fecha hasta
   * @param {number} filters.page - Página actual (default: 1)
   * @param {number} filters.limit - Documentos por página (default: 20)
   * @param {string} filters.sortBy - Campo para ordenar (default: 'createdAt')
   * @param {string} filters.sortOrder - Orden: 'asc' o 'desc' (default: 'desc')
   * @returns {Promise<Object>}
   */
  async execute(filters = {}) {
    try {
      // 1. Establecer valores por defecto
      const searchFilters = {
        userId: filters.userId || null,
        documentType: filters.documentType || null,
        status: filters.status || null,
        dateFrom: filters.dateFrom || null,
        dateTo: filters.dateTo || null,
        page: filters.page || 1,
        limit: filters.limit || 20,
        sortBy: filters.sortBy || 'createdAt',
        sortOrder: filters.sortOrder || 'desc',
      };

      // 2. Validar página y límite
      if (searchFilters.page < 1) {
        searchFilters.page = 1;
      }

      if (searchFilters.limit < 1 || searchFilters.limit > 100) {
        searchFilters.limit = 20;
      }

      console.log('🔍 Searching documents with filters:', searchFilters);

      // 3. Buscar en repositorio
      const result = await this.documentRepository.findByFilters(searchFilters);

      console.log(`✅ Found ${result.documents.length} documents (Total: ${result.total})`);

      // 4. Calcular metadata de paginación
      const totalPages = Math.ceil(result.total / searchFilters.limit);

      return {
        documents: result.documents,
        pagination: {
          page: searchFilters.page,
          limit: searchFilters.limit,
          total: result.total,
          totalPages,
          hasNextPage: searchFilters.page < totalPages,
          hasPrevPage: searchFilters.page > 1,
        },
        filters: searchFilters,
      };
    } catch (error) {
      console.error('❌ Error in SearchDocumentsUseCase:', error);
      throw error;
    }
  }
}

module.exports = SearchDocumentsUseCase;

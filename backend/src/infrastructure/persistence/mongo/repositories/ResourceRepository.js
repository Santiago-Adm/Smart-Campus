/**
 * ResourceRepository Implementation
 * Implementa IResourceRepository usando Mongoose (MongoDB)
 */

const IResourceRepository = require('../../../../domain/interfaces/repositories/IResourceRepository');
const Resource = require('../../../../domain/entities/Resource.entity');
const ResourceModel = require('../schemas/Resource.schema');

class ResourceRepository extends IResourceRepository {
  /**
   * Convertir recurso MongoDB a Entity Resource
   */
  _toEntity(resourceModel) {
    if (!resourceModel) return null;

    return new Resource({
      id: resourceModel._id.toString(),
      title: resourceModel.title,
      description: resourceModel.description,
      category: resourceModel.category,
      type: resourceModel.type,
      author: resourceModel.author,
      publisher: resourceModel.publisher,
      publicationDate: resourceModel.publicationDate,
      fileUrl: resourceModel.fileUrl,
      thumbnailUrl: resourceModel.thumbnailUrl,
      tags: resourceModel.tags,
      language: resourceModel.language,
      pageCount: resourceModel.pageCount,
      duration: resourceModel.duration,
      fileSize: resourceModel.fileSize,
      isPublic: resourceModel.isPublic,
      uploadedBy: resourceModel.uploadedBy,
      viewCount: resourceModel.viewCount,
      downloadCount: resourceModel.downloadCount,
      averageRating: resourceModel.averageRating,
      ratingCount: resourceModel.ratingCount,
      createdAt: resourceModel.createdAt,
      updatedAt: resourceModel.updatedAt,
    });
  }

  /**
   * Convertir Entity Resource a objeto plano
   */
  _toModel(resource) {
    return {
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      author: resource.author,
      publisher: resource.publisher,
      publicationDate: resource.publicationDate,
      fileUrl: resource.fileUrl,
      thumbnailUrl: resource.thumbnailUrl,
      tags: resource.tags,
      language: resource.language,
      pageCount: resource.pageCount,
      duration: resource.duration,
      fileSize: resource.fileSize,
      isPublic: resource.isPublic,
      uploadedBy: resource.uploadedBy,
      viewCount: resource.viewCount,
      downloadCount: resource.downloadCount,
      averageRating: resource.averageRating,
      ratingCount: resource.ratingCount,
    };
  }

  /**
   * Crear un nuevo recurso
   */
  async create(resource) {
    try {
      const resourceData = this._toModel(resource);
      const resourceModel = await ResourceModel.create(resourceData);

      return this._toEntity(resourceModel);
    } catch (error) {
      throw new Error(`Error creating resource: ${error.message}`);
    }
  }

  /**
   * Buscar recurso por ID
   */
  async findById(id) {
    try {
      const resourceModel = await ResourceModel.findById(id);
      return this._toEntity(resourceModel);
    } catch (error) {
      throw new Error(`Error finding resource by ID: ${error.message}`);
    }
  }

  /**
   * Buscar recursos con filtros
   */
  async findMany(filters = {}) {
    try {
      const {
        category,
        type,
        tags,
        isPublic,
        search,
        minRating,
        language,
        limit = 20,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = filters;

      const query = {};

      if (category) query.category = category;
      if (type) query.type = type;
      if (tags && tags.length > 0) query.tags = { $in: tags };
      if (isPublic !== undefined) {
        // Aceptar tanto true como 1
        query.isPublic =
          isPublic === true || isPublic === 'true' ? { $in: [true, 1] } : { $in: [false, 0] };
      }

      // AGREGAR: Filtro de idioma
      if (language) {
        query.language = language;
      }

      // AGREGAR: Filtro de rating mínimo
      if (minRating && minRating > 0) {
        query.averageRating = { $gte: minRating };
      }
      // Búsqueda de texto completo
      if (search) {
        query.$text = { $search: search };
      }

      console.log('🔍 MongoDB Query:', JSON.stringify(query, null, 2));

      // ✅ CORRECCIÓN: Aplicar sortOrder correctamente
      const sortOptions = {};
      const sortDirection = sortOrder === 'asc' ? 1 : -1;

      if (sortBy === 'popular') {
        sortOptions.viewCount = sortDirection;
        sortOptions.downloadCount = sortDirection;
      } else if (sortBy === 'rating') {
        sortOptions.averageRating = sortDirection;
      } else {
        sortOptions[sortBy] = sortDirection;
      }

      console.log('🔍 Sort Options:', sortOptions);

      const resources = await ResourceModel.find(query).sort(sortOptions).limit(limit).skip(offset);

      const total = await ResourceModel.countDocuments(query);

      return {
        resources: resources.map((res) => this._toEntity(res)),
        total,
      };
    } catch (error) {
      throw new Error(`Error finding resources: ${error.message}`);
    }
  }

  /**
   * Actualizar recurso
   */
  async update(id, updates) {
    try {
      const resourceModel = await ResourceModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!resourceModel) {
        throw new Error('Resource not found');
      }

      return this._toEntity(resourceModel);
    } catch (error) {
      throw new Error(`Error updating resource: ${error.message}`);
    }
  }

  /**
   * Eliminar recurso
   */
  async delete(id) {
    try {
      const result = await ResourceModel.findByIdAndDelete(id);
      return result !== null;
    } catch (error) {
      throw new Error(`Error deleting resource: ${error.message}`);
    }
  }

  /**
   * Buscar recursos más populares
   */
  async findMostPopular(limit = 10) {
    try {
      const resources = await ResourceModel.find({ isPublic: true })
        .sort({ viewCount: -1, downloadCount: -1 })
        .limit(limit);

      return resources.map((res) => this._toEntity(res));
    } catch (error) {
      throw new Error(`Error finding most popular resources: ${error.message}`);
    }
  }

  /**
   * Buscar recursos recomendados para un usuario
   */
  async findRecommendedForUser(userId, limit = 10) {
    try {
      // Por ahora retornamos recursos populares
      // En el futuro se implementará lógica de recomendación con ML
      const resources = await ResourceModel.find({ isPublic: true })
        .sort({ averageRating: -1, viewCount: -1 })
        .limit(limit);

      return resources.map((res) => this._toEntity(res));
    } catch (error) {
      throw new Error(`Error finding recommended resources: ${error.message}`);
    }
  }

  /**
   * Buscar recursos por tags
   */
  async findByTags(tags, limit = 20) {
    try {
      const resources = await ResourceModel.find({
        tags: { $in: tags },
        isPublic: true,
      })
        .sort({ averageRating: -1 })
        .limit(limit);

      return resources.map((res) => this._toEntity(res));
    } catch (error) {
      throw new Error(`Error finding resources by tags: ${error.message}`);
    }
  }

  /**
   * Incrementar contador de vistas
   */
  async incrementViewCount(id) {
    try {
      await ResourceModel.findByIdAndUpdate(id, {
        $inc: { viewCount: 1 },
      });
    } catch (error) {
      throw new Error(`Error incrementing view count: ${error.message}`);
    }
  }

  /**
   * Incrementar contador de descargas
   */
  async incrementDownloadCount(id) {
    try {
      await ResourceModel.findByIdAndUpdate(id, {
        $inc: { downloadCount: 1 },
      });
    } catch (error) {
      throw new Error(`Error incrementing download count: ${error.message}`);
    }
  }

  /**
   * Contar recursos
   * @param {Object} filter - Filtros opcionales
   * @returns {Promise<number>} Total de recursos
   */
  async count(filter = {}) {
    try {
      const query = {};

      if (filter.category) {
        query.category = filter.category;
      }

      if (filter.isPublic !== undefined) {
        query.isPublic = filter.isPublic;
      }

      return await ResourceModel.countDocuments(query);
    } catch (error) {
      console.error('Error counting resources:', error);
      throw new Error(`Error counting resources: ${error.message}`);
    }
  }

  /**
   * Buscar recursos más vistos
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>} Recursos más vistos
   */
  async findMostViewed(limit = 10) {
    try {
      const resources = await ResourceModel.find()
        .sort({ viewCount: -1 }) // Ordenar por viewCount descendente
        .limit(limit)
        .lean();

      return resources.map((resource) => this._toEntity(resource));
    } catch (error) {
      console.error('Error finding most viewed resources:', error);
      throw new Error(`Error finding most viewed resources: ${error.message}`);
    }
  }

  /**
   * Obtener todos los recursos (con límite)
   */
  async findAll(options = {}) {
    try {
      const { limit = 100, skip = 0 } = options;

      const resources = await ResourceModel.find({})
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 })
        .lean();

      // ⭐ CAMBIO: usar _toEntity en lugar de toDomain
      return resources.map((resource) => this._toEntity(resource));
    } catch (error) {
      console.error('Error in findAll:', error);
      throw new Error(`Error finding all resources: ${error.message}`);
    }
  }

  /**
   * Buscar recursos con paginación (usado por dashboard)
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise<Object>} Recursos y total
   */
  async search(params = {}) {
    try {
      const {
        query = '',
        category = null,
        type = null,
        isPublic = true,
        limit = 20,
        page = 1,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = params;

      // Construir filtros
      const filter = {};

      if (isPublic !== null && isPublic !== undefined) {
        filter.isPublic = isPublic;
      }

      if (category) {
        filter.category = category;
      }

      if (type) {
        filter.type = type;
      }

      // Búsqueda por texto
      if (query && query.trim() !== '') {
        filter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { author: { $regex: query, $options: 'i' } },
        ];
      }

      // Ordenamiento
      const sort = {};
      if (sortBy === 'popular') {
        sort.viewCount = -1;
      } else if (sortBy === 'rating') {
        sort.averageRating = -1;
      } else {
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      }

      // Paginación
      const skip = (page - 1) * limit;

      // Ejecutar query
      const [resources, total] = await Promise.all([
        ResourceModel.find(filter).sort(sort).limit(limit).skip(skip).lean(),
        ResourceModel.countDocuments(filter),
      ]);

      return {
        resources: resources.map((r) => this._toEntity(r)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in search:', error);
      throw new Error(`Error searching resources: ${error.message}`);
    }
  }
}

module.exports = ResourceRepository;

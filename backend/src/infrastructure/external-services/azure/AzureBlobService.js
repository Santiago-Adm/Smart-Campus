/**
 * AzureBlobService Implementation (MOCK MODE)
 * Implementa IFileService - Versión MOCK para desarrollo
 */

const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const IFileService = require('../../../domain/interfaces/services/IFileService');
// eslint-disable-next-line no-unused-vars
const config = require('../../config/env.config');

class AzureBlobService extends IFileService {
  constructor() {
    super();
    this.mockMode = true; // Siempre MOCK por ahora
    this.containerName = 'smart-campus-documents';
    this.mockStoragePath = path.join(process.cwd(), 'storage', 'uploads');

    // Crear directorio de almacenamiento si no existe
    this._ensureStorageDirectory();
    console.log('⚠️  Azure Blob Storage: Running in MOCK mode');
    console.log(`📁 Files will be stored in: ${this.mockStoragePath}`);
  }

  /**
   * Asegurar que existe el directorio de almacenamiento
   */
  async _ensureStorageDirectory() {
    try {
      await fs.mkdir(this.mockStoragePath, { recursive: true });
    } catch (error) {
      console.error('Error creating storage directory:', error);
    }
  }

  /**
   * Generar nombre de archivo único
   */
  _generateUniqueFileName(originalFileName) {
    const ext = path.extname(originalFileName);
    const nameWithoutExt = path.basename(originalFileName, ext);
    const sanitized = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    const timestamp = Date.now();
    const unique = `${sanitized}-${timestamp}-${uuidv4().substring(0, 8)}${ext}`;
    return unique;
  }

  /**
   * Subir archivo (MOCK - guarda en filesystem local)
   */
  async uploadFile(fileBuffer, fileName, mimeType, _metadata = {}) {
    try {
      // 1. Validaciones
      if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
        throw new Error('File buffer is required');
      }

      if (!this.validateFileType(mimeType)) {
        throw new Error(`File type not allowed: ${mimeType}`);
      }

      if (!this.validateFileSize(fileBuffer.length)) {
        throw new Error('File size exceeds maximum allowed (50MB)');
      }

      // 2. Generar nombre único
      const uniqueFileName = this._generateUniqueFileName(fileName);
      const filePath = path.join(this.mockStoragePath, uniqueFileName);

      // 3. Guardar archivo en filesystem (MOCK de Azure Blob)
      await fs.writeFile(filePath, fileBuffer);

      // 4. Generar URL LOCAL (para MOCK mode)
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const mockUrl = `${baseUrl}/storage/uploads/${uniqueFileName}`;

      console.log('📤 File uploaded (MOCK):', {
        fileName: uniqueFileName,
        size: `${(fileBuffer.length / 1024).toFixed(2)} KB`,
        type: mimeType,
        localPath: filePath,
        url: mockUrl,
      });

      return mockUrl;
    } catch (error) {
      console.error('❌ Error uploading file:', error);
      throw new Error(`Error uploading file: ${error.message}`);
    }
  }

  /**
   * Descargar archivo (MOCK - lee de filesystem local)
   */
  async downloadFile(fileUrl) {
    try {
      if (!fileUrl) {
        throw new Error('File URL is required');
      }

      // Extraer nombre de archivo de la URL
      const fileName = fileUrl.split('/').pop().split('?')[0];
      const filePath = path.join(this.mockStoragePath, fileName);

      // Verificar si existe
      try {
        await fs.access(filePath);
      } catch {
        throw new Error('File not found');
      }

      // Leer archivo
      const fileBuffer = await fs.readFile(filePath);

      console.log('📥 File downloaded (MOCK):', fileName);
      return fileBuffer;
    } catch (error) {
      console.error('❌ Error downloading file:', error);
      throw new Error(`Error downloading file: ${error.message}`);
    }
  }

  /**
   * Eliminar archivo (MOCK - elimina de filesystem local)
   */
  async deleteFile(fileUrl) {
    try {
      if (!fileUrl) {
        throw new Error('File URL is required');
      }

      // Extraer nombre de archivo de la URL
      const fileName = fileUrl.split('/').pop().split('?')[0];
      const filePath = path.join(this.mockStoragePath, fileName);

      // Eliminar archivo
      await fs.unlink(filePath);

      console.log('🗑️  File deleted (MOCK):', fileName);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn('⚠️  File not found for deletion:', error.message);
        return true; // Consideramos éxito si ya no existe
      }
      console.error('❌ Error deleting file:', error);
      throw new Error(`Error deleting file: ${error.message}`);
    }
  }

  /**
   * Obtener URL temporal (MOCK)
   */
  async getTemporaryUrl(fileUrl, expirationMinutes = 60) {
    try {
      if (!fileUrl) {
        throw new Error('File URL is required');
      }

      const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
      const mockToken = Buffer.from(`mock-sas-${Date.now()}`).toString('base64');
      const mockUrl = `${fileUrl}?sas=${mockToken}&expires=${expiresAt.toISOString()}`;

      console.log('🔗 Temporary URL generated (MOCK):', {
        expiresIn: `${expirationMinutes} minutes`,
        expiresAt: expiresAt.toISOString(),
      });

      return mockUrl;
    } catch (error) {
      console.error('❌ Error generating temporary URL:', error);
      throw new Error(`Error generating temporary URL: ${error.message}`);
    }
  }

  /**
   * Listar archivos (MOCK - útil para debugging)
   */
  async listFiles() {
    try {
      const files = await fs.readdir(this.mockStoragePath);
      const filesWithStats = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(this.mockStoragePath, file);
          const stats = await fs.stat(filePath);
          return {
            name: file,
            size: stats.size,
            createdAt: stats.birthtime,
            url: `https://smartcampus.blob.core.windows.net/${this.containerName}/${file}`,
          };
        })
      );

      return filesWithStats;
    } catch (error) {
      console.error('❌ Error listing files:', error);
      return [];
    }
  }

  /**
   * Validar tipo de archivo
   */
  validateFileType(mimeType) {
    const allowedTypes = [
      // Documentos
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx

      // Imágenes
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',

      // Videos
      'video/mp4',
      'video/quicktime', // .mov
      'video/x-msvideo', // .avi
      'video/webm',
      'video/mpeg',

      // Audio (opcional)
      'audio/mpeg', // .mp3
      'audio/wav',
      'audio/ogg',
    ];

    return allowedTypes.includes(mimeType);
  }

  /**
   * Validar tamaño de archivo
   */
  validateFileSize(fileSize) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    return fileSize > 0 && fileSize <= maxSize;
  }

  /**
   * Obtener información del archivo
   */
  async getFileInfo(fileUrl) {
    try {
      const fileName = fileUrl.split('/').pop().split('?')[0];
      const filePath = path.join(this.mockStoragePath, fileName);
      const stats = await fs.stat(filePath);
      return {
        name: fileName,
        size: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
      };
    } catch (error) {
      throw new Error(`File not found: ${error.message}`);
    }
  }
}

module.exports = AzureBlobService;

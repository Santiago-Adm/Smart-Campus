/**
 * Interface: IFileService
 * Contrato para servicios de gestión de archivos (Azure Blob)
 */

class IFileService {
  /**
   * Subir archivo
   * @param {Buffer} _fileBuffer
   * @param {string} _fileName
   * @param {string} _mimeType
   * @param {Object} _metadata
   * @returns {Promise<string>} - URL del archivo
   */
  async uploadFile(_fileBuffer, _fileName, _mimeType, _metadata) {
    throw new Error('Method uploadFile() must be implemented');
  }

  /**
   * Descargar archivo
   * @param {string} _fileUrl
   * @returns {Promise<Buffer>}
   */
  async downloadFile(_fileUrl) {
    throw new Error('Method downloadFile() must be implemented');
  }

  /**
   * Eliminar archivo
   * @param {string} _fileUrl
   * @returns {Promise<boolean>}
   */
  async deleteFile(_fileUrl) {
    throw new Error('Method deleteFile() must be implemented');
  }

  /**
   * Obtener URL temporal (SAS token)
   * @param {string} _fileUrl
   * @param {number} _expirationMinutes
   * @returns {Promise<string>}
   */
  async getTemporaryUrl(_fileUrl, _expirationMinutes) {
    throw new Error('Method getTemporaryUrl() must be implemented');
  }

  /**
   * Validar tipo de archivo
   * @param {string} _mimeType
   * @returns {boolean}
   */
  validateFileType(_mimeType) {
    throw new Error('Method validateFileType() must be implemented');
  }

  /**
   * Validar tamaño de archivo
   * @param {number} _fileSize
   * @returns {boolean}
   */
  validateFileSize(_fileSize) {
    throw new Error('Method validateFileSize() must be implemented');
  }
}

module.exports = IFileService;

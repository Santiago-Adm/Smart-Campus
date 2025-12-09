/**
 * Interface: IOCRService
 * Contrato para servicios de OCR (Google Vision API)
 */

class IOCRService {
  /**
   * Extraer texto de imagen/PDF
   * @param {Buffer|string} _file - Buffer o URL del archivo
   * @returns {Promise<Object>} - { text, confidence, fields }
   */
  async extractText(_file) {
    throw new Error('Method extractText() must be implemented');
  }

  /**
   * Validar documento DNI
   * @param {Buffer|string} _file
   * @returns {Promise<Object>} - { isValid, extractedData, confidence }
   */
  async validateDNI(_file) {
    throw new Error('Method validateDNI() must be implemented');
  }

  /**
   * Extraer campos específicos de documento
   * @param {Buffer|string} _file
   * @param {string[]} _fields - ['name', 'dni', 'date']
   * @returns {Promise<Object>}
   */
  async extractFields(_file, _fields) {
    throw new Error('Method extractFields() must be implemented');
  }
}

module.exports = IOCRService;

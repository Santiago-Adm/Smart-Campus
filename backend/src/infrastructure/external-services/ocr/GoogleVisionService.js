/**
 * GoogleVisionService Implementation (MOCK MODE)
 * Implementa IOCRService - Versión MOCK para desarrollo
 */

const IOCRService = require('../../../domain/interfaces/services/IOCRService');
const { DocumentType } = require('../../../domain/enums/DocumentType.enum');
const config = require('../../config/env.config');

// Nota: Google Vision requiere credenciales JSON
// const vision = require('@google-cloud/vision');

class GoogleVisionService extends IOCRService {
  constructor() {
    super();
    this._initializeClient();
  }

  /**
   * Inicializar cliente de Google Vision
   */
  _initializeClient() {
    try {
      // En desarrollo sin credenciales, usar modo MOCK
      if (config.env === 'development' && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log('⚠️  Google Vision API: Running in MOCK mode (development)');
        this.mockMode = true;
        return;
      }

      // En producción, inicializar cliente real
      // this.client = new vision.ImageAnnotatorClient({
      //   keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      // });

      this.mockMode = true; // Por ahora siempre MOCK
      console.log('⚠️  Google Vision API: Running in MOCK mode');
    } catch (error) {
      console.error('⚠️  Google Vision initialization failed:', error.message);
      this.mockMode = true;
    }
  }

  /**
   * Extraer texto de imagen/PDF
   * @param {string} fileUrl - URL del archivo o buffer
   * @param {string} documentType - Tipo de documento para generar mock apropiado
   */
  async extractText(fileUrl, documentType = null) {
    try {
      // MOCK MODE
      if (this.mockMode) {
        console.log('🔍 OCR: Extracting text (MOCK)...', {
          fileUrl: `${fileUrl.substring(0, 50)}...`,
          documentType,
        });

        // Generar datos MOCK según tipo de documento
        const mockResult = this._generateMockDataByType(documentType);

        // Simular tiempo de procesamiento
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });

        console.log('✅ OCR extraction completed (MOCK)', {
          confidence: mockResult.confidence,
          fieldsExtracted: Object.keys(mockResult.fields).length,
        });

        return mockResult;
      }

      // MODO REAL con Google Vision API
      // const [result] = await this.client.textDetection(fileUrl);
      // const detections = result.textAnnotations;
      //
      // const text = detections[0]?.description || '';
      // const confidence = detections[0]?.confidence || 0;
      //
      // return {
      //   text,
      //   confidence,
      //   fields: this._parseFields(text, documentType)
      // };

      throw new Error('Google Vision API not configured');
    } catch (error) {
      console.error('❌ Error extracting text:', error);
      throw new Error(`Error extracting text: ${error.message}`);
    }
  }

  /**
   * Generar datos MOCK según tipo de documento
   * @private
   */
  _generateMockDataByType(documentType) {
    const mockTemplates = {
      [DocumentType.DNI]: {
        text: 'REPÚBLICA DEL PERÚ\nDOCUMENTO NACIONAL DE IDENTIDAD\nNOMBRES: JUAN CARLOS\nAPELLIDOS: PÉREZ GARCÍA\nDNI: 72845631\nFECHA DE NACIMIENTO: 15/05/1995\nDIRECCIÓN: AV. LIMA 456 AYACUCHO',
        confidence: 0.92,
        fields: {
          nombres: 'JUAN CARLOS',
          apellidos: 'PÉREZ GARCÍA',
          dni: '72845631',
          fecha_nacimiento: '15/05/1995',
          direccion: 'AV. LIMA 456 AYACUCHO',
        },
      },

      [DocumentType.BIRTH_CERTIFICATE]: {
        text: 'CERTIFICADO DE NACIMIENTO\nNOMBRES: MARÍA ELENA\nAPELLIDOS: TORRES MENDOZA\nFECHA DE NACIMIENTO: 20/08/2000\nLUGAR: AYACUCHO, PERÚ\nPADRE: CARLOS TORRES\nMADRE: ANA MENDOZA',
        confidence: 0.89,
        fields: {
          nombres: 'MARÍA ELENA',
          apellidos: 'TORRES MENDOZA',
          fecha_nacimiento: '20/08/2000',
          lugar: 'AYACUCHO, PERÚ',
          padre: 'CARLOS TORRES',
          madre: 'ANA MENDOZA',
        },
      },

      [DocumentType.ACADEMIC_CERTIFICATE]: {
        text: 'CERTIFICADO DE ESTUDIOS\nINSTITUCIÓN: INSTITUTO SUPERIOR MARÍA PARADO DE BELLIDO\nESTUDIANTE: PEDRO MARTÍNEZ LÓPEZ\nCARRERA: ENFERMERÍA TÉCNICA\nAÑO: 2023\nPROMEDIO: 16.5',
        confidence: 0.94,
        fields: {
          institucion: 'INSTITUTO SUPERIOR MARÍA PARADO DE BELLIDO',
          nombres: 'PEDRO MARTÍNEZ LÓPEZ',
          carrera: 'ENFERMERÍA TÉCNICA',
          anio: '2023',
          promedio: '16.5',
        },
      },

      [DocumentType.MEDICAL_CERTIFICATE]: {
        text: 'CERTIFICADO MÉDICO\nPACIENTE: ANA SOFÍA RAMÍREZ\nDNI: 45678912\nDIAGNÓSTICO: APTO PARA ACTIVIDADES ACADÉMICAS\nMÉDICO: DR. LUIS GONZÁLEZ\nFECHA: 10/01/2025\nCMP: 12345',
        confidence: 0.91,
        fields: {
          nombres: 'ANA SOFÍA RAMÍREZ',
          dni: '45678912',
          diagnostico: 'APTO PARA ACTIVIDADES ACADÉMICAS',
          medico: 'DR. LUIS GONZÁLEZ',
          fecha_emision: '10/01/2025',
          cmp: '12345',
        },
      },

      [DocumentType.RESIDENCE_PROOF]: {
        text: 'CONSTANCIA DE DOMICILIO\nNOMBRES: ROBERTO SILVA CASTRO\nDIRECCIÓN: JR. GRAU 234, AYACUCHO\nDISTRITO: AYACUCHO\nPROVINCIA: HUAMANGA\nDEPARTAMENTO: AYACUCHO',
        confidence: 0.87,
        fields: {
          nombres: 'ROBERTO SILVA CASTRO',
          direccion: 'JR. GRAU 234, AYACUCHO',
          distrito: 'AYACUCHO',
          provincia: 'HUAMANGA',
          departamento: 'AYACUCHO',
        },
      },
    };

    // Retornar mock específico o genérico
    return (
      mockTemplates[documentType] || {
        text: 'DOCUMENTO GENÉRICO\nCONTENIDO DE TEXTO EXTRAÍDO',
        confidence: 0.85,
        fields: {
          contenido: 'Texto extraído del documento',
        },
      }
    );
  }

  /**
   * Validar documento DNI
   */
  async validateDNI(fileUrl) {
    try {
      console.log('🔍 OCR: Validating DNI...');

      const extractedData = await this.extractText(fileUrl, DocumentType.DNI);

      // Validar que tenga campos de DNI
      const hasDNI = extractedData.fields.dni && /^\d{8}$/.test(extractedData.fields.dni);
      const hasNames = extractedData.fields.nombres && extractedData.fields.apellidos;
      const hasValidConfidence = extractedData.confidence > 0.8;

      const isValid = hasDNI && hasNames && hasValidConfidence;

      console.log('✅ DNI validation result:', {
        isValid,
        confidence: extractedData.confidence,
        dni: extractedData.fields.dni,
      });

      return {
        isValid,
        extractedData: extractedData.fields,
        confidence: extractedData.confidence,
        validationDetails: {
          hasDNI,
          hasNames,
          hasValidConfidence,
        },
      };
    } catch (error) {
      console.error('❌ Error validating DNI:', error);
      throw new Error(`Error validating DNI: ${error.message}`);
    }
  }

  /**
   * Extraer campos específicos de documento
   */
  async extractFields(fileUrl, fields, documentType = null) {
    try {
      console.log('🔍 OCR: Extracting fields:', fields);

      const extractedData = await this.extractText(fileUrl, documentType);

      const result = {};
      fields.forEach((field) => {
        result[field] = extractedData.fields[field] || null;
      });

      console.log('✅ Fields extracted:', Object.keys(result));

      return {
        fields: result,
        confidence: extractedData.confidence,
        fullText: extractedData.text,
      };
    } catch (error) {
      console.error('❌ Error extracting fields:', error);
      throw new Error(`Error extracting fields: ${error.message}`);
    }
  }

  /**
   * Parsear campos del texto extraído
   * @private
   */
  _parseFields(text, documentType) {
    const fields = {};

    // Patrones de regex para extraer información
    const patterns = {
      dni: /(?:DNI|NÚMERO)[\s:]*(\d{8})/i,
      nombres: /(?:NOMBRES?)[\s:]*([A-ZÁÉÍÓÚÑ\s]+)/i,
      apellidos: /(?:APELLIDOS?)[\s:]*([A-ZÁÉÍÓÚÑ\s]+)/i,
      fecha_nacimiento: /(?:FECHA[\s\w]*NACIMIENTO)[\s:]*(\d{2}\/\d{2}\/\d{4})/i,
      direccion: /(?:DIRECCIÓN|DOMICILIO)[\s:]*([A-ZÁÉÍÓÚÑ0-9.,\s]+)/i,
      institucion: /(?:INSTITUCIÓN|INSTITUTO)[\s:]*([A-ZÁÉÍÓÚÑ\s]+)/i,
      fecha_emision: /(?:FECHA[\s\w]*EMISIÓN)[\s:]*(\d{2}\/\d{2}\/\d{4})/i,
    };

    Object.keys(patterns).forEach((key) => {
      const match = text.match(patterns[key]);
      if (match) {
        fields[key] = match[1].trim();
      }
    });

    return fields;
  }

  /**
   * Verificar calidad de imagen
   */
  async checkImageQuality(fileUrl) {
    try {
      if (this.mockMode) {
        console.log('🔍 Checking image quality (MOCK)...');
        // Simular análisis de calidad
        return {
          quality: 'GOOD',
          score: 0.88,
          recommendations: [],
        };
      }

      throw new Error('Google Vision API not configured');
    } catch (error) {
      throw new Error(`Error checking image quality: ${error.message}`);
    }
  }
}

module.exports = GoogleVisionService;

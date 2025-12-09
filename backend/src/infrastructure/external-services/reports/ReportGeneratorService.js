/**
 * ReportGeneratorService Implementation
 * Servicio para generación de reportes en PDF y Excel
 */

// eslint-disable-next-line import/no-extraneous-dependencies
const PDFDocument = require('pdfkit');
// eslint-disable-next-line import/no-extraneous-dependencies
const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class ReportGeneratorService {
  constructor() {
    this.outputPath = path.join(process.cwd(), 'reports');
    this.maxReportSizeMB = 50;
    this.expirationDays = 7;

    // Crear directorio de reportes si no existe
    this._ensureReportsDirectory();
    console.log('📊 ReportGeneratorService initialized');
    console.log(`📁 Reports will be stored in: ${this.outputPath}`);
  }

  /**
   * Asegurar que existe el directorio de reportes
   * @private
   */
  async _ensureReportsDirectory() {
    try {
      await fs.mkdir(this.outputPath, { recursive: true });
    } catch (error) {
      console.error('Error creating reports directory:', error);
    }
  }

  /**
   * Generar reporte en PDF
   * @param {Object} data - Datos del reporte
   * @param {Object} options - Opciones de generación
   * @returns {Promise<Object>} Información del reporte generado
   */
  async generatePDF(data, options = {}) {
    try {
      console.log('📄 Generating PDF report...');

      // Validar datos
      this._validateReportData(data);

      // Generar nombre de archivo único
      const fileName = `report-${data.type || 'general'}-${Date.now()}-${uuidv4().substring(0, 8)}.pdf`;
      const filePath = path.join(this.outputPath, fileName);

      // Crear documento PDF
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: data.title || 'Report',
          Author: 'Smart Campus Instituto',
          Subject: data.description || 'Academic Report',
          CreationDate: new Date(),
        },
      });

      // Stream al archivo
      // eslint-disable-next-line global-require
      const stream = doc.pipe(require('fs').createWriteStream(filePath));

      // Construir contenido del PDF
      await this._buildPDFContent(doc, data, options);

      // Finalizar documento
      doc.end();

      // Esperar a que termine de escribir
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Obtener stats del archivo
      const stats = await fs.stat(filePath);
      const fileSizeMB = stats.size / (1024 * 1024);

      console.log('✅ PDF report generated:', {
        fileName,
        size: `${fileSizeMB.toFixed(2)} MB`,
        pages: doc.bufferedPageRange().count,
      });

      return {
        fileName,
        filePath,
        fileSize: stats.size,
        format: 'PDF',
        generatedAt: new Date(),
        expiresAt: this._calculateExpirationDate(),
      };
    } catch (error) {
      console.error('❌ Error generating PDF report:', error);
      throw new Error(`Error generating PDF report: ${error.message}`);
    }
  }

  /**
   * Generar reporte en Excel
   * @param {Object} data - Datos del reporte
   * @param {Object} options - Opciones de generación
   * @returns {Promise<Object>} Información del reporte generado
   */
  async generateExcel(data, options = {}) {
    try {
      console.log('📊 Generating Excel report...');

      // Validar datos
      this._validateReportData(data);

      // Generar nombre de archivo único
      const fileName = `report-${data.type || 'general'}-${Date.now()}-${uuidv4().substring(0, 8)}.xlsx`;
      const filePath = path.join(this.outputPath, fileName);

      // Crear workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Smart Campus Instituto';
      workbook.created = new Date();
      workbook.modified = new Date();

      // Construir contenido del Excel
      await this._buildExcelContent(workbook, data, options);

      // Guardar archivo
      await workbook.xlsx.writeFile(filePath);

      // Obtener stats del archivo
      const stats = await fs.stat(filePath);
      const fileSizeMB = stats.size / (1024 * 1024);

      console.log('✅ Excel report generated:', {
        fileName,
        size: `${fileSizeMB.toFixed(2)} MB`,
        sheets: workbook.worksheets.length,
      });

      return {
        fileName,
        filePath,
        fileSize: stats.size,
        format: 'EXCEL',
        generatedAt: new Date(),
        expiresAt: this._calculateExpirationDate(),
      };
    } catch (error) {
      console.error('❌ Error generating Excel report:', error);
      throw new Error(`Error generating Excel report: ${error.message}`);
    }
  }

  /**
   * Validar datos del reporte
   * @private
   */
  _validateReportData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Report data must be an object');
    }

    if (!data.title) {
      throw new Error('Report title is required');
    }

    if (!data.sections || !Array.isArray(data.sections)) {
      throw new Error('Report sections must be an array');
    }
  }

  /**
   * Construir contenido del PDF
   * @private
   */
  async _buildPDFContent(doc, data, _options) {
    // Header del documento
    this._addPDFHeader(doc, data);

    // Metadata
    doc.moveDown(1);
    this._addPDFMetadata(doc, data);

    // Línea separadora
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(1);

    // Contenido por secciones
    // eslint-disable-next-line no-restricted-syntax
    for (const section of data.sections) {
      this._addPDFSection(doc, section);
    }

    // Footer
    this._addPDFFooter(doc, data);
  }

  /**
   * Agregar header al PDF
   * @private
   */
  _addPDFHeader(doc, data) {
    doc.fontSize(24).font('Helvetica-Bold').text(data.title, { align: 'center' });

    if (data.subtitle) {
      doc.moveDown(0.3);
      doc
        .fontSize(14)
        .font('Helvetica')
        .fillColor('#666666')
        .text(data.subtitle, { align: 'center' });
    }

    doc.fillColor('#000000'); // Reset color
  }

  /**
   * Agregar metadata al PDF
   * @private
   */
  _addPDFMetadata(doc, data) {
    doc.fontSize(10).font('Helvetica');

    const metadata = [
      { label: 'Generado:', value: new Date().toLocaleString('es-PE') },
      { label: 'Tipo:', value: data.type || 'General' },
      { label: 'Período:', value: data.period || 'N/A' },
    ];

    if (data.generatedBy) {
      metadata.push({ label: 'Generado por:', value: data.generatedBy });
    }

    metadata.forEach((item) => {
      doc.text(`${item.label} ${item.value}`);
    });
  }

  /**
   * Agregar sección al PDF
   * @private
   */
  _addPDFSection(doc, section) {
    // Título de sección
    doc.moveDown(1);
    doc.fontSize(16).font('Helvetica-Bold').text(section.title);

    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica');

    // Contenido de la sección
    if (section.type === 'text') {
      doc.text(section.content, { align: 'justify' });
    } else if (section.type === 'table') {
      this._addPDFTable(doc, section.data);
    } else if (section.type === 'list') {
      this._addPDFList(doc, section.items);
    } else if (section.type === 'metrics') {
      this._addPDFMetrics(doc, section.metrics);
    }
  }

  /**
   * Agregar tabla al PDF
   * @private
   */
  _addPDFTable(doc, tableData) {
    if (!tableData || !tableData.headers || !tableData.rows) {
      return;
    }

    const startY = doc.y;
    const columnWidth = (545 - 50) / tableData.headers.length;

    // Headers
    doc.font('Helvetica-Bold').fontSize(9);
    tableData.headers.forEach((header, i) => {
      doc.text(header, 50 + i * columnWidth, startY, {
        width: columnWidth - 5,
        align: 'left',
      });
    });

    // Línea debajo de headers
    doc.moveDown(0.3);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.3);

    // Rows
    doc.font('Helvetica').fontSize(9);
    tableData.rows.forEach((row) => {
      const rowY = doc.y;
      row.forEach((cell, i) => {
        doc.text(String(cell), 50 + i * columnWidth, rowY, {
          width: columnWidth - 5,
          align: 'left',
        });
      });
      doc.moveDown(0.5);
    });
  }

  /**
   * Agregar lista al PDF
   * @private
   */
  _addPDFList(doc, items) {
    items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item}`);
      doc.moveDown(0.3);
    });
  }

  /**
   * Agregar métricas al PDF
   * @private
   */
  _addPDFMetrics(doc, metrics) {
    Object.entries(metrics).forEach(([key, value]) => {
      doc
        .font('Helvetica-Bold')
        .text(`${key}: `, { continued: true })
        .font('Helvetica')
        .text(String(value));
      doc.moveDown(0.3);
    });
  }

  /**
   * Agregar footer al PDF
   * @private
   */
  _addPDFFooter(doc, _data) {
    const pages = doc.bufferedPageRange();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      doc.fontSize(8).font('Helvetica').fillColor('#666666');

      doc.text(
        `Instituto Superior Técnico de Enfermería "María Parado de Bellido"`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.text(`Página ${i + 1} de ${pages.count}`, 50, doc.page.height - 35, { align: 'center' });
    }

    doc.fillColor('#000000'); // Reset color
  }

  /**
   * Construir contenido del Excel
   * @private
   */
  async _buildExcelContent(workbook, data, _options) {
    // Hoja de resumen
    const summarySheet = workbook.addWorksheet('Resumen');
    this._buildExcelSummary(summarySheet, data);

    // Hojas por sección
    data.sections.forEach((section, index) => {
      const sheet = workbook.addWorksheet(section.title || `Sección ${index + 1}`);
      this._buildExcelSection(sheet, section);
    });
  }

  /**
   * Construir hoja de resumen en Excel
   * @private
   */
  _buildExcelSummary(sheet, data) {
    // Título
    sheet.mergeCells('A1:D1');
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('A1').value = data.title;
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('A1').font = { size: 18, bold: true };
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

    // Metadata
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('A3').value = 'Generado:';
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('B3').value = new Date().toLocaleString('es-PE');
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('A4').value = 'Tipo:';
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('B4').value = data.type || 'General';
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('A5').value = 'Período:';
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('B5').value = data.period || 'N/A';

    // Ajustar anchos de columnas
    // eslint-disable-next-line no-param-reassign
    sheet.getColumn('A').width = 20;
    // eslint-disable-next-line no-param-reassign
    sheet.getColumn('B').width = 30;
  }

  /**
   * Construir sección en Excel
   * @private
   */
  _buildExcelSection(sheet, section) {
    // Título de sección
    sheet.mergeCells('A1:D1');
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('A1').value = section.title;
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('A1').font = { size: 14, bold: true };
    // eslint-disable-next-line no-param-reassign
    sheet.getCell('A1').alignment = { horizontal: 'center' };

    let currentRow = 3;

    if (section.type === 'table' && section.data) {
      // Headers
      section.data.headers.forEach((header, index) => {
        const cell = sheet.getCell(currentRow, index + 1);
        cell.value = header;
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        };
      });

      // eslint-disable-next-line no-plusplus
      currentRow++;

      // Rows
      section.data.rows.forEach((row) => {
        row.forEach((cellValue, index) => {
          // eslint-disable-next-line no-param-reassign
          sheet.getCell(currentRow, index + 1).value = cellValue;
        });
        // eslint-disable-next-line no-plusplus
        currentRow++;
      });

      // Auto-ajustar anchos
      sheet.columns.forEach((column) => {
        // eslint-disable-next-line no-param-reassign
        column.width = 15;
      });
    } else if (section.type === 'metrics' && section.metrics) {
      Object.entries(section.metrics).forEach(([key, value]) => {
        // eslint-disable-next-line no-param-reassign
        sheet.getCell(currentRow, 1).value = key;
        // eslint-disable-next-line no-param-reassign
        sheet.getCell(currentRow, 2).value = value;
        // eslint-disable-next-line no-param-reassign
        sheet.getCell(currentRow, 1).font = { bold: true };
        // eslint-disable-next-line no-plusplus
        currentRow++;
      });
    }
  }

  /**
   * Calcular fecha de expiración
   * @private
   */
  _calculateExpirationDate() {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.expirationDays);
    return expiresAt;
  }

  /**
   * Listar reportes generados
   * @returns {Promise<Array>} Lista de reportes
   */
  async listReports() {
    try {
      const files = await fs.readdir(this.outputPath);

      const reports = await Promise.all(
        files
          .filter((file) => file.startsWith('report-'))
          .map(async (file) => {
            const filePath = path.join(this.outputPath, file);
            const stats = await fs.stat(filePath);
            return {
              fileName: file,
              filePath,
              fileSize: stats.size,
              format: file.endsWith('.pdf') ? 'PDF' : 'EXCEL',
              createdAt: stats.birthtime,
            };
          })
      );

      return reports.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('❌ Error listing reports:', error);
      return [];
    }
  }

  /**
   * Eliminar reporte
   * @param {string} fileName - Nombre del archivo
   */
  async deleteReport(fileName) {
    try {
      const filePath = path.join(this.outputPath, fileName);
      await fs.unlink(filePath);
      console.log(`🗑️ Report deleted: ${fileName}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting report:', error);
      throw new Error(`Error deleting report: ${error.message}`);
    }
  }

  /**
   * Limpiar reportes expirados
   */
  async cleanupExpiredReports() {
    try {
      const reports = await this.listReports();
      const now = Date.now();
      const expirationMs = this.expirationDays * 24 * 60 * 60 * 1000;

      let deletedCount = 0;

      // eslint-disable-next-line no-restricted-syntax
      for (const report of reports) {
        const age = now - report.createdAt.getTime();
        if (age > expirationMs) {
          // eslint-disable-next-line no-await-in-loop
          await this.deleteReport(report.fileName);
          // eslint-disable-next-line no-plusplus
          deletedCount++;
        }
      }

      console.log(`🧹 Cleaned up ${deletedCount} expired reports`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error cleaning up reports:', error);
      throw error;
    }
  }
}

module.exports = ReportGeneratorService;

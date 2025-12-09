/**
 * Value Object: DocumentMetadata
 * Representa metadata de un documento
 */

const { DocumentType } = require('../enums/DocumentType.enum');

class DocumentMetadata {
  constructor({ type, fileName, fileSize, mimeType, issueDate, description }) {
    this.type = this.validateType(type);
    this.fileName = this.validateFileName(fileName);
    this.fileSize = this.validateFileSize(fileSize);
    this.mimeType = this.validateMimeType(mimeType);
    this.issueDate = this.validateIssueDate(issueDate);
    this.description = description || '';
  }

  validateType(type) {
    if (!DocumentType[type]) {
      throw new Error(`Invalid document type: ${type}`);
    }
    return type;
  }

  validateFileName(fileName) {
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('File name must be a non-empty string');
    }
    return fileName.trim();
  }

  validateFileSize(fileSize) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (typeof fileSize !== 'number' || fileSize <= 0) {
      throw new Error('File size must be a positive number');
    }
    if (fileSize > maxSize) {
      throw new Error('File size exceeds maximum allowed (50MB)');
    }
    return fileSize;
  }

  validateMimeType(mimeType) {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ];

    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error(`Invalid MIME type: ${mimeType}`);
    }
    return mimeType;
  }

  validateIssueDate(issueDate) {
    if (!issueDate) {
      return null;
    }

    const date = new Date(issueDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid issue date');
    }

    // No puede ser fecha futura
    if (date > new Date()) {
      throw new Error('Issue date cannot be in the future');
    }

    return date;
  }

  toObject() {
    return {
      type: this.type,
      fileName: this.fileName,
      fileSize: this.fileSize,
      mimeType: this.mimeType,
      issueDate: this.issueDate,
      description: this.description,
    };
  }
}

module.exports = DocumentMetadata;
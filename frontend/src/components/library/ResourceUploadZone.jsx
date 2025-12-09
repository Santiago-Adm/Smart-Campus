/**
 * Componente: ResourceUploadZone
 * Zona de drag & drop para subir archivos
 */

import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { formatFileSize, getAllowedFileTypes } from '../../constants/library';

const ResourceUploadZone = ({
  resourceType,
  onFileSelect,
  maxSize = 100 * 1024 * 1024, // 100MB
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Validar archivo
   */
  const validateFile = (file) => {
    // Validar tamaño
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `El archivo es demasiado grande. Máximo: ${formatFileSize(maxSize)}`,
      };
    }

    // Validar tipo según resourceType
    const allowedTypes = {
      book: ['application/pdf'],
      article: ['application/pdf'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      guide: ['application/pdf'],
      case_study: ['application/pdf'],
    };

    const allowed = allowedTypes[resourceType] || [];

    if (!allowed.includes(file.type)) {
      const allowedExtensions = getAllowedFileTypes(resourceType).join(', ');
      return {
        valid: false,
        error: `Tipo de archivo no válido. Permitidos: ${allowedExtensions}`,
      };
    }

    return { valid: true };
  };

  /**
   * Manejar selección de archivo
   */
  const handleFileSelection = useCallback((file) => {
    setError(null);

    // Validar
    const validation = validateFile(file);

    if (!validation.valid) {
      setError(validation.error);
      setSelectedFile(null);
      return;
    }

    // Archivo válido
    setSelectedFile(file);
    onFileSelect(file);
  }, [resourceType, maxSize, onFileSelect]);

  /**
   * Manejar drag over
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  /**
   * Manejar drag leave
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  /**
   * Manejar drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  /**
   * Manejar input file
   */
  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  /**
   * Remover archivo seleccionado
   */
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
  };

  /**
   * Obtener tipos de archivo permitidos
   */
  const acceptedFileTypes = getAllowedFileTypes(resourceType).join(',');

  return (
    <div className={className}>
      {/* Zona de drop */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-all duration-200 cursor-pointer
            ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }
          `}
        >
          {/* Input oculto */}
          <input
            type="file"
            id="file-upload"
            accept={acceptedFileTypes}
            onChange={handleInputChange}
            className="hidden"
          />

          {/* Contenido visual */}
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload
              size={48}
              className={`mb-4 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`}
            />
            <p className="text-lg font-medium text-gray-700 mb-2">
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo aquí'}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400">
              Tipos permitidos: {acceptedFileTypes} (máx. {formatFileSize(maxSize)})
            </p>
          </label>
        </div>
      ) : (
        /* Archivo seleccionado */
        <div className="border-2 border-green-300 bg-green-50 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <div className="p-2 bg-green-100 rounded-lg">
                <File size={24} className="text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  <p className="font-medium text-gray-900 truncate">
                    {selectedFile.name}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="
                p-2 text-gray-400 hover:text-red-600 hover:bg-red-50
                rounded-lg transition-colors
              "
              title="Remover archivo"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error al cargar archivo</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

ResourceUploadZone.propTypes = {
  resourceType: PropTypes.oneOf(['book', 'article', 'video', 'guide', 'case_study']).isRequired,
  onFileSelect: PropTypes.func.isRequired,
  maxSize: PropTypes.number,
  className: PropTypes.string,
};

export default ResourceUploadZone;

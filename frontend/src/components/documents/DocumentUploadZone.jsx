import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  formatFileSize,
  isValidFileType,
  isValidFileSize,
  getAllowedExtensions
} from '@/constants/documents';

/**
 * Zona de drag & drop para subir archivos
 */
export default function DocumentUploadZone({ onFileSelect, accept, maxSize = MAX_FILE_SIZE }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    // Validar tipo
    if (!isValidFileType(file.type)) {
      return `Tipo de archivo no válido. Solo se permiten: ${getAllowedExtensions()}`;
    }

    // Validar tamaño
    if (!isValidFileSize(file.size)) {
      return `El archivo es demasiado grande. Máximo permitido: ${formatFileSize(maxSize)}`;
    }

    return null;
  };

  const handleFile = (file) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {!selectedFile ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-50'
          }`}
        >
          <input
            type="file"
            id="file-input"
            className="hidden"
            accept={accept || Object.keys(ALLOWED_FILE_TYPES).join(',')}
            onChange={handleFileInputChange}
          />

          <label
            htmlFor="file-input"
            className="flex flex-col items-center justify-center cursor-pointer"
          >
            <div className={`p-4 rounded-full mb-4 ${
              isDragging ? 'bg-primary-100' : error ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              <Upload className={`w-8 h-8 ${
                isDragging ? 'text-primary-600' : error ? 'text-red-600' : 'text-gray-600'
              }`} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isDragging ? '¡Suelta el archivo aquí!' : 'Arrastra tu archivo o haz clic para seleccionar'}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Formatos permitidos: PDF, JPG, PNG
            </p>

            <p className="text-xs text-gray-500">
              Tamaño máximo: {formatFileSize(maxSize)}
            </p>
          </label>
        </div>
      ) : (
        // Selected File Preview
        <div className="border-2 border-green-200 bg-green-50 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-gray-600">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </p>
              </div>
            </div>

            <button
              onClick={handleRemoveFile}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Eliminar archivo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error al seleccionar archivo</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

DocumentUploadZone.propTypes = {
  onFileSelect: PropTypes.func.isRequired,
  accept: PropTypes.string,
  maxSize: PropTypes.number,
};

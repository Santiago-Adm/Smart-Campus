import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, Users } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import Card from '@/components/common/Card';
import DocumentUploadZone from '@/components/documents/DocumentUploadZone';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '@/constants/documents';
import documentService from '@/services/documentService';
import toast from 'react-hot-toast';
import userService from '@/services/userService';

export default function UploadDocumentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    documentType: '',
    description: '',
    issueDate: '',
    file: null,
    targetUserId: '', // Para admin/administrative
  });
  const [errors, setErrors] = useState({});

  // ✅ Verificar si es admin
  const isAdmin = user?.roles?.some(r => ['IT_ADMIN', 'ADMINISTRATIVE'].includes(r));

  // ✅ Cargar usuarios si es admin
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // ✅ IT_ADMIN puede ver TODOS los usuarios
      // ✅ ADMINISTRATIVE solo ve ESTUDIANTES y DOCENTES
      const isITAdmin = user?.roles?.includes('IT_ADMIN');

      let allUsers = [];

      if (isITAdmin) {
        // IT_ADMIN: Obtener TODOS los roles
        console.log('🔑 IT_ADMIN: Loading all users');

        // Hacer múltiples requests para cada rol
        const roles = ['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'IT_ADMIN', 'DIRECTOR'];

        for (const role of roles) {
          try {
            const response = await userService.getAll({
              role,
              isActive: true,
              limit: 100,
              page: 1,
            });

            if (response.data && response.data.length > 0) {
              allUsers = [...allUsers, ...response.data];
            }
          } catch (error) {
            console.error(`Error loading ${role} users:`, error);
          }
        }

        console.log('✅ IT_ADMIN loaded users from all roles:', allUsers.length);
      } else {
        // ADMINISTRATIVE: Solo ESTUDIANTES
        console.log('📋 ADMINISTRATIVE: Loading students only');

        const response = await userService.getAll({
          role: 'STUDENT',
          isActive: true,
          limit: 100,
          page: 1,
        });

        allUsers = response.data || [];
        console.log('✅ ADMINISTRATIVE loaded students:', allUsers.length);
      }

      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFileSelect = (file) => {
    setFormData({ ...formData, file });
    if (errors.file) {
      setErrors({ ...errors, file: null });
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.documentType) {
      newErrors.documentType = 'Selecciona un tipo de documento';
    }

    if (!formData.issueDate) {
      newErrors.issueDate = 'Ingresa la fecha de emisión';
    } else {
      const issueDate = new Date(formData.issueDate);
      const today = new Date();
      if (issueDate > today) {
        newErrors.issueDate = 'La fecha de emisión no puede ser futura';
      }
    }

    if (!formData.file) {
      newErrors.file = 'Selecciona un archivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      // Crear FormData
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('documentType', formData.documentType);
      uploadData.append('description', formData.description);
      uploadData.append('issueDate', formData.issueDate);

      // ✅ Si es admin y seleccionó un usuario, incluir targetUserId
      if (isAdmin && formData.targetUserId) {
        uploadData.append('targetUserId', formData.targetUserId);
      }

      console.log('📤 Uploading document...', {
        documentType: formData.documentType,
        fileName: formData.file.name,
        fileSize: formData.file.size,
        targetUserId: formData.targetUserId || 'self',
        isAdmin,
      });

      const response = await documentService.upload(uploadData);
      console.log('✅ Upload response:', response);

      toast.success('Documento subido exitosamente');
      navigate('/documents');
    } catch (error) {
      console.error('Error uploading document:', error);

      // Manejar errores de validación del backend
      if (error.response?.data?.errors) {
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.field] = err.message;
        });
        setErrors(backendErrors);
        toast.error('Hay errores en el formulario');
      } else {
        toast.error(error.response?.data?.message || 'Error al subir documento');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/documents')}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subir Documento</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin
              ? 'Sube documentos para estudiantes o docentes'
              : 'Completa la información y sube tu documento'}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Documentos requeridos para matrícula:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>DNI (copia vigente)</li>
              <li>Partida de Nacimiento</li>
              <li>Certificado de Estudios</li>
              <li>Certificado Médico</li>
              <li>Fotografía tamaño carnet</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ✅ SELECTOR DE USUARIO (Solo para Admin/Administrative) */}
          {isAdmin && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-semibold text-amber-900">
                  {user?.roles?.includes('IT_ADMIN')
                    ? 'Subir documento por otro usuario (Todos los roles)'
                    : 'Subir documento por un estudiante'}
                </h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario Destino (opcional)
                </label>
                <select
                  value={formData.targetUserId}
                  onChange={(e) => handleChange('targetUserId', e.target.value)}
                  disabled={loadingUsers}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Para mí mismo</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} - {u.email} ({u.roles.join(', ')})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {loadingUsers
                    ? 'Cargando usuarios...'
                    : users.length === 0
                    ? '⚠️ No hay usuarios disponibles'
                    : user?.roles?.includes('IT_ADMIN')
                    ? `${users.length} usuarios disponibles (Todos los roles)`
                    : `${users.length} estudiantes disponibles`}
                </p>
              </div>
            </div>
          )}

          {/* Tipo de Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Documento <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.documentType}
              onChange={(e) => handleChange('documentType', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.documentType ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Selecciona un tipo</option>
              {Object.values(DOCUMENT_TYPES).map((type) => (
                <option key={type} value={type}>
                  {DOCUMENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {errors.documentType && (
              <p className="text-sm text-red-600 mt-1">{errors.documentType}</p>
            )}
          </div>

          {/* Fecha de Emisión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Emisión <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleChange('issueDate', e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.issueDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.issueDate && (
              <p className="text-sm text-red-600 mt-1">{errors.issueDate}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Agrega notas o comentarios sobre este documento..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/500 caracteres
            </p>
          </div>

          {/* Upload Zone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo <span className="text-red-500">*</span>
            </label>
            <DocumentUploadZone onFileSelect={handleFileSelect} />
            {errors.file && (
              <p className="text-sm text-red-600 mt-2">{errors.file}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/documents')}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Subir Documento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

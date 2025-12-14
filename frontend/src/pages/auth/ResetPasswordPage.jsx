import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';
import authService from '@/services/authService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

// Validación
const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Debe contener mayúsculas, minúsculas y números'
    )
    .required('La contraseña es requerida'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  // Validar requisitos de contraseña en tiempo real
  const passwordRequirements = {
    minLength: password?.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const onSubmit = async (data) => {
    try {
      await authService.resetPassword(token, data.password);

      setResetSuccess(true);
      toast.success('Contraseña actualizada exitosamente');

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      const message = error.response?.data?.message || 'Error al restablecer contraseña';
      toast.error(message);
    }
  };

  // Si no hay token, mostrar error
  if (!token) {
    return (
      <div className="space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Token Inválido
          </h2>
          <p className="text-gray-600">
            El enlace de recuperación es inválido o ha expirado
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link to="/forgot-password">
            <Button variant="primary" size="lg" className="w-full">
              Solicitar Nuevo Enlace
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="w-full">
              Volver al Inicio de Sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Vista: Contraseña restablecida exitosamente
  if (resetSuccess) {
    return (
      <div className="space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Contraseña Restablecida!
          </h2>
          <p className="text-gray-600">
            Tu contraseña ha sido actualizada exitosamente
          </p>
        </div>

        {/* Redirect Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            Serás redirigido al inicio de sesión en 3 segundos...
          </p>
        </div>

        {/* Manual Redirect */}
        <Link to="/login">
          <Button variant="primary" size="lg" className="w-full">
            Ir al Inicio de Sesión
          </Button>
        </Link>
      </div>
    );
  }

  // Vista: Formulario de nueva contraseña
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nueva Contraseña
        </h2>
        <p className="text-gray-600">
          Ingresa tu nueva contraseña
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Password Input */}
        <div className="relative">
          <Input
            label="Nueva Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="Mínimo 8 caracteres"
            leftIcon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Confirm Password Input */}
        <div className="relative">
          <Input
            label="Confirmar Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repite la contraseña"
            leftIcon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">
            La contraseña debe contener:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  passwordRequirements.minLength
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {passwordRequirements.minLength ? '✓' : '○'}
              </div>
              <span className={passwordRequirements.minLength ? 'text-green-600' : 'text-gray-600'}>
                Mínimo 8 caracteres
              </span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  passwordRequirements.hasUpperCase
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {passwordRequirements.hasUpperCase ? '✓' : '○'}
              </div>
              <span className={passwordRequirements.hasUpperCase ? 'text-green-600' : 'text-gray-600'}>
                Al menos una mayúscula
              </span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  passwordRequirements.hasLowerCase
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {passwordRequirements.hasLowerCase ? '✓' : '○'}
              </div>
              <span className={passwordRequirements.hasLowerCase ? 'text-green-600' : 'text-gray-600'}>
                Al menos una minúscula
              </span>
            </li>
            <li className="flex items-center gap-2 text-sm">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  passwordRequirements.hasNumber
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {passwordRequirements.hasNumber ? '✓' : '○'}
              </div>
              <span className={passwordRequirements.hasNumber ? 'text-green-600' : 'text-gray-600'}>
                Al menos un número
              </span>
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Restablecer Contraseña
        </Button>
      </form>
    </div>
  );
}

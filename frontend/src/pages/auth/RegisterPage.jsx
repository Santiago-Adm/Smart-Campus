import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Mail, Lock, User, Phone, Calendar, CreditCard, Eye, EyeOff } from 'lucide-react';
import authService from '@/services/authService';
import { registerSchema } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...registerData } = data;

      await authService.register(registerData);

      toast.success('¡Cuenta creada exitosamente! Por favor, inicia sesión.');
      navigate('/login');
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || 'Error al registrar usuario';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
        <p className="mt-2 text-sm text-gray-600">
          Completa el formulario para registrarte en el sistema
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombres */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre"
            type="text"
            placeholder="Juan"
            leftIcon={User}
            error={errors.firstName?.message}
            {...register('firstName')}
          />

          <Input
            label="Apellido"
            type="text"
            placeholder="Pérez"
            leftIcon={User}
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        {/* Email */}
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="ejemplo@smartcampus.edu.pe"
          leftIcon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* DNI y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="DNI"
            type="text"
            placeholder="12345678"
            maxLength={8}
            leftIcon={CreditCard}
            error={errors.dni?.message}
            {...register('dni')}
          />

          <Input
            label="Teléfono"
            type="text"
            placeholder="987654321"
            maxLength={9}
            leftIcon={Phone}
            error={errors.phone?.message}
            {...register('phone')}
          />
        </div>

        {/* Fecha de Nacimiento */}
        <Input
          label="Fecha de Nacimiento"
          type="date"
          leftIcon={Calendar}
          error={errors.dateOfBirth?.message}
          {...register('dateOfBirth')}
        />

        {/* Password */}
        <div className="relative">
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={Lock}
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <Input
            label="Confirmar Contraseña"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Términos y Condiciones */}
        <label className="flex items-start">
          <input
            type="checkbox"
            required
            className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="ml-2 text-sm text-gray-600">
            Acepto los{' '}
            <Link to="/terms" className="text-primary-600 hover:text-primary-700">
              términos y condiciones
            </Link>{' '}
            y la{' '}
            <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
              política de privacidad
            </Link>
          </span>
        </label>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Crear Cuenta
        </Button>
      </form>

      {/* Login Link */}
      <div className="text-center">
        <span className="text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Iniciar Sesión
          </Link>
        </span>
      </div>
    </div>
  );
}

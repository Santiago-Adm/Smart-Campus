import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import authService from '@/services/authService';
import { loginSchema } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);

      console.log('🔍 LoginPage - Response completo:', response);
      console.log('🔍 LoginPage - Type of response:', typeof response);
      console.log('🔍 LoginPage - Response keys:', Object.keys(response || {}));

      // Extraer datos según la estructura
      let user, accessToken, refreshToken;

      // El interceptor ya devuelve response.data, entonces response YA es el objeto
      if (response.user && response.accessToken) {
        // Caso: { user: {...}, accessToken: '...', refreshToken: '...' }
        user = response.user;
        accessToken = response.accessToken;
        refreshToken = response.refreshToken;
      } else if (response.data && response.data.user) {
        // Caso: { data: { user: {...}, accessToken: '...' } }
        user = response.data.user;
        accessToken = response.data.accessToken;
        refreshToken = response.data.refreshToken;
      } else {
        console.error('❌ Estructura de respuesta no reconocida:', response);
        throw new Error('Estructura de respuesta inesperada del servidor');
      }

      console.log('👤 User extraído:', user);
      console.log('🔑 AccessToken presente:', !!accessToken);
      console.log('🔄 RefreshToken presente:', !!refreshToken);

      // Validar datos críticos
      if (!user) {
        throw new Error('Usuario no encontrado en la respuesta');
      }

      if (!accessToken) {
        throw new Error('Token de acceso no encontrado en la respuesta');
      }

      // Guardar en store
      setAuth(user, accessToken, refreshToken);

      // Mensaje de bienvenida
      const userName = user.firstName || user.fullName?.split(' ')[0] || 'Usuario';
      toast.success(`¡Bienvenido, ${userName}!`);

      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Login error completo:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error message:', error.message);

      const message = error.response?.data?.message
        || error.response?.data?.error?.message
        || error.message
        || 'Error al iniciar sesión';

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="ejemplo@smartcampus.edu.pe"
          leftIcon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password */}
        <div>
          <Input
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            leftIcon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
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

        {/* Remember & Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-600">Recordarme</span>
          </label>

          <Link
            to="/recover-password"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          className="w-full"
        >
          Iniciar Sesión
        </Button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            ¿No tienes una cuenta?
          </span>
        </div>
      </div>

      {/* Register Link */}
      <div className="text-center">
        <Link
          to="/register"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Registrarse aquí
        </Link>
      </div>

      {/* Demo Credentials (solo para desarrollo) */}
      {import.meta.env.DEV && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs font-semibold text-yellow-800 mb-2">
            🔧 Credenciales de prueba:
          </p>
          <div className="space-y-1 text-xs text-yellow-700">
            <p><strong>STUDENT:</strong> juan.perez@smartcampus.edu.pe / NewPassword456</p>
            <p><strong>TEACHER:</strong> maria.garcia@smartcampus.edu.pe / Teacher123</p>
            <p><strong>ADMINISTRATIVE:</strong> carlos.lopez@smartcampus.edu.pe / Administrative123</p>
            <p><strong>IT\_ADMIN:</strong> admin@smartcampus.edu.pe / Admin123</p>
            <p><strong>DIRECTOR:</strong> director@smartcampus.edu.pe / Director123</p>
          </div>
        </div>
      )}
    </div>
  );
}

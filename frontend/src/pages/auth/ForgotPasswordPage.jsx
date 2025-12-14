import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import authService from '@/services/authService';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import toast from 'react-hot-toast';

// Validación
const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
});

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);

      setSubmittedEmail(data.email);
      setEmailSent(true);
      toast.success('Email de recuperación enviado');
    } catch (error) {
      console.error('Error:', error);
      const message = error.response?.data?.message || 'Error al enviar email de recuperación';
      toast.error(message);
    }
  };

  // Vista: Email enviado exitosamente
  if (emailSent) {
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
            ¡Email Enviado!
          </h2>
          <p className="text-gray-600">
            Hemos enviado un enlace de recuperación a:
          </p>
          <p className="text-primary-600 font-medium mt-1">
            {submittedEmail}
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Instrucciones:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Revisa tu bandeja de entrada</li>
            <li>El enlace es válido por 1 hora</li>
            <li>Si no lo ves, revisa tu carpeta de spam</li>
          </ul>
        </div>

        {/* Back to Login */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio de sesión</span>
        </Link>

        {/* Resend Email */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            ¿No recibiste el email?
          </p>
          <button
            onClick={() => setEmailSent(false)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            Reenviar enlace
          </button>
        </div>
      </div>
    );
  }

  // Vista: Formulario de solicitud
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Olvidaste tu contraseña?
        </h2>
        <p className="text-gray-600">
          Ingresa tu email y te enviaremos un enlace para restablecerla
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Input */}
        <Input
          label="Correo Electrónico"
          type="email"
          placeholder="ejemplo@smartcampus.edu.pe"
          leftIcon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full"
        >
          Enviar Enlace de Recuperación
        </Button>
      </form>

      {/* Back to Login */}
      <div className="text-center pt-4 border-t border-gray-200">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio de sesión</span>
        </Link>
      </div>
    </div>
  );
}

import { APP_NAME } from '@/utils/constants';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y Título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">SC</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{APP_NAME}</h1>
          <p className="text-gray-600">
            Sistema de Gestión Educativa
          </p>
        </div>

        {/* Contenido (Login/Register form) */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            Instituto Superior Técnico de Enfermería
            <br />
            "María Parado de Bellido"
          </p>
        </div>
      </div>
    </div>
  );
}

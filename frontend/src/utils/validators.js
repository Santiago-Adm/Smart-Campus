import * as yup from 'yup';

// Login schema
export const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
  password: yup
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .required('La contraseña es requerida'),
});

// Register schema
export const registerSchema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
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
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
  firstName: yup
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .required('El nombre es requerido'),
  lastName: yup
    .string()
    .min(2, 'Mínimo 2 caracteres')
    .required('El apellido es requerido'),
  dni: yup
    .string()
    .matches(/^\d{8}$/, 'DNI debe tener 8 dígitos')
    .required('El DNI es requerido'),
  phone: yup
    .string()
    .matches(/^9\d{8}$/, 'Teléfono inválido (9 dígitos, inicia con 9)')
    .required('El teléfono es requerido'),
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Fecha inválida')
    .required('La fecha de nacimiento es requerida'),
});

// Document upload schema
export const documentUploadSchema = yup.object({
  type: yup.string().required('Selecciona el tipo de documento'),
  description: yup.string().max(500, 'Máximo 500 caracteres'),
  file: yup
    .mixed()
    .required('Selecciona un archivo')
    .test('fileSize', 'El archivo es muy grande (máx 50MB)', (value) => {
      if (!value) return true;
      return value.size <= 50 * 1024 * 1024;
    })
    .test('fileType', 'Tipo de archivo no permitido', (value) => {
      if (!value) return true;
      return ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'].includes(
        value.type
      );
    }),
});

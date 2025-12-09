## DOCUMENTACIÓN COMPLETA - MÓDULO MD05: TELEENFERMERÍA Y ATENCIÓN REMOTA

📋 ÍNDICE



Información General

Arquitectura del Módulo

Requisitos Funcionales Implementados

Estructura de Archivos

Backend - Implementación Detallada

Frontend - Implementación Detallada

Base de Datos

API REST Endpoints

Flujos de Usuario

Casos de Uso

Seguridad y Permisos

Testing y Validación

Problemas Conocidos

Mejoras Futuras





1\. INFORMACIÓN GENERAL

1.1 Descripción del Módulo

MD05 - Teleenfermería y Atención Remota es un módulo integral que permite la gestión completa de citas virtuales entre estudiantes y docentes del Instituto Superior Técnico de Enfermería "María Parado de Bellido".

1.2 Objetivos



✅ Facilitar la programación de consultas virtuales

✅ Optimizar el tiempo de docentes y estudiantes

✅ Implementar validación de disponibilidad en tiempo real

✅ Proporcionar un sistema de gestión de citas por roles

✅ Prevenir conflictos de horarios



1.3 Usuarios del Módulo

RolPermisosFuncionalidadesSTUDENTAgendar citas propias- Seleccionar docente- Agendar cita para sí mismo- Ver sus propias citasTEACHERVer citas asignadas- Ver citas donde es docente- Gestionar su disponibilidad- Confirmar/Cancelar citasADMINISTRATIVEGestión completa- Agendar citas entre estudiante-docente- Ver todas las citas- Gestionar estadosIT\_ADMINGestión completa- Agendar citas entre estudiante-docente- Ver todas las citas- Gestión técnicaDIRECTORSolo lectura- Ver todas las citas- Acceder a reportes

1.4 Tecnologías Utilizadas

Backend:



Node.js v20.x

Express.js 4.x

Sequelize 6.x (ORM)

PostgreSQL 15

JWT para autenticación



Frontend:



React 18

Vite

Tailwind CSS

Axios

React Router DOM v6

React Hot Toast

Lucide React (iconos)





2\. ARQUITECTURA DEL MÓDULO

2.1 Patrón Arquitectónico

Clean Architecture + Repository Pattern + Use Cases

┌─────────────────────────────────────────────────────────────┐

│                   SMART CAMPUS MONOLITH                     │

│                                                             │

│  ┌───────────────────────────────────────────────────────┐ │

│  │              PRESENTATION LAYER (API)                  │ │

│  │  Controllers → Routes → Validators → Middlewares       │ │

│  └───────────────────────────────────────────────────────┘ │

│                            ↓                                │

│  ┌───────────────────────────────────────────────────────┐ │

│  │             APPLICATION LAYER (Use Cases)              │ │

│  │  - ScheduleAppointment                                 │ │

│  │  - GetAppointments                                     │ │

│  │  - UpdateAppointmentStatus                             │ │

│  │  - CheckAvailability                                   │ │

│  └───────────────────────────────────────────────────────┘ │

│                            ↓                                │

│  ┌───────────────────────────────────────────────────────┐ │

│  │              DOMAIN LAYER (Entities)                   │ │

│  │  - Appointment Entity                                  │ │

│  │  - Business Rules                                      │ │

│  │  - Interfaces                                          │ │

│  └───────────────────────────────────────────────────────┘ │

│                            ↓                                │

│  ┌───────────────────────────────────────────────────────┐ │

│  │          INFRASTRUCTURE LAYER (Data Access)            │ │

│  │  - AppointmentRepository (PostgreSQL)                  │ │

│  │  - External Services                                   │ │

│  └───────────────────────────────────────────────────────┘ │

└─────────────────────────────────────────────────────────────┘

&nbsp;                           ↓

&nbsp;                   ┌───────────────┐

&nbsp;                   │  PostgreSQL   │

&nbsp;                   └───────────────┘

2.2 Flujo de Datos

┌─────────────┐       HTTP        ┌──────────────┐

│   React     │ ←─────────────→   │   Express    │

│  Frontend   │    REST API       │   Backend    │

└─────────────┘                   └──────────────┘

&nbsp;                                        ↓

&nbsp;                                 ┌──────────────┐

&nbsp;                                 │  PostgreSQL  │

&nbsp;                                 │   Database   │

&nbsp;                                 └──────────────┘



3\. REQUISITOS FUNCIONALES IMPLEMENTADOS

3.1 RF28 - Agendar Citas ✅

Prioridad: Must Have

Estado: Completado

Descripción:

El sistema permite agendar citas virtuales entre estudiantes y docentes.

Actores:



STUDENT (agenda para sí mismo)

ADMINISTRATIVE/IT\_ADMIN (agenda para cualquier estudiante)



Entradas:

javascript{

&nbsp; teacherId: "UUID",          // Obligatorio

&nbsp; studentId: "UUID",          // Obligatorio para ADMIN, automático para STUDENT

&nbsp; scheduledAt: "ISO DateTime", // Obligatorio

&nbsp; duration: Number,           // 15-120 minutos

&nbsp; reason: String              // Mínimo 10 caracteres

}

Salidas:

javascript{

&nbsp; success: true,

&nbsp; message: "Cita agendada exitosamente",

&nbsp; data: {

&nbsp;   id: "UUID",

&nbsp;   studentId: "UUID",

&nbsp;   teacherId: "UUID",

&nbsp;   scheduledAt: "ISO DateTime",

&nbsp;   duration: 30,

&nbsp;   status: "SCHEDULED",

&nbsp;   reason: "Consulta sobre procedimientos...",

&nbsp;   createdAt: "ISO DateTime"

&nbsp; }

}

Reglas de Negocio:



✅ El docente debe estar disponible en el horario solicitado

✅ No puede haber citas solapadas para el mismo docente

✅ La fecha/hora debe ser futura

✅ La duración debe estar entre 15 y 120 minutos

✅ El motivo debe tener mínimo 10 caracteres



Validaciones:



Frontend: Validación en tiempo real

Backend: Validator con Joi + validación en Use Case





3.2 RF29 - Listar Citas ⚠️

Prioridad: Must Have

Estado: Parcialmente completado (requiere correcciones)

Descripción:

El sistema permite visualizar las citas según el rol del usuario.

Filtros por Rol:

javascript// STUDENT

{

&nbsp; studentId: userId,  // Automático

&nbsp; status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED",

&nbsp; dateFrom: "ISO Date",

&nbsp; dateTo: "ISO Date"

}



// TEACHER

{

&nbsp; teacherId: userId,  // Automático

&nbsp; status: "...",

&nbsp; dateFrom: "...",

&nbsp; dateTo: "..."

}



// ADMIN

{

&nbsp; // Sin filtros automáticos, ve todas las citas

&nbsp; status: "...",

&nbsp; dateFrom: "...",

&nbsp; dateTo: "..."

}

Problemas Conocidos:



❌ Error 500 al listar citas de TEACHER

❌ Error 500 al listar citas de STUDENT

✅ Funciona correctamente para ADMIN





3.3 RF30 - Verificar Disponibilidad ✅

Prioridad: Must Have

Estado: Completado

Descripción:

El sistema verifica si un docente está disponible en un horario específico.

Entradas:

javascript{

&nbsp; teacherId: "UUID",

&nbsp; scheduledAt: "ISO DateTime",

&nbsp; duration: Number

}

Salidas:

javascript{

&nbsp; success: true,

&nbsp; data: {

&nbsp;   isAvailable: true,

&nbsp;   teacherId: "UUID",

&nbsp;   scheduledAt: "ISO DateTime",

&nbsp;   duration: 30

&nbsp; }

}

Lógica de Validación:

javascript// Verifica solapamiento con citas existentes

const overlaps = 

&nbsp; (startTime >= existingStart \&\& startTime < existingEnd) ||  // Nueva empieza durante existente

&nbsp; (endTime > existingStart \&\& endTime <= existingEnd) ||      // Nueva termina durante existente

&nbsp; (startTime <= existingStart \&\& endTime >= existingEnd);     // Nueva cubre existente completamente



3.4 RF31 - Citas Próximas (24 horas) ✅

Prioridad: Must Have

Estado: Completado

Descripción:

El sistema muestra las citas programadas para las próximas 24 horas.

Salida:

javascript{

&nbsp; appointments: Array(n),

&nbsp; total: n,

&nbsp; message: "You have n upcoming appointment(s) in the next 24 hours"

}

```



---



\## 4. ESTRUCTURA DE ARCHIVOS



\### 4.1 Backend

```

backend/src/

│

├── domain/

│   ├── entities/

│   │   └── Appointment.entity.js          ✅ Entidad de dominio

│   │

│   ├── enums/

│   │   └── AppointmentStatus.enum.js      ✅ SCHEDULED, CONFIRMED, etc.

│   │

│   └── interfaces/

│       └── repositories/

│           └── IAppointmentRepository.js   ✅ Contrato del repositorio

│

├── application/

│   └── use-cases/

│       └── telehealth/

│           ├── ScheduleAppointment.usecase.js      ✅ Agendar cita

│           ├── GetAppointments.usecase.js          ⚠️ Listar citas (con errores)

│           ├── GetAppointmentDetails.usecase.js    ✅ Detalles de cita

│           ├── UpdateAppointmentStatus.usecase.js  ✅ Actualizar estado

│           ├── CancelAppointment.usecase.js        ✅ Cancelar cita

│           ├── CheckAvailability.usecase.js        ✅ Verificar disponibilidad

│           └── GetUpcomingAppointments.usecase.js  ✅ Citas próximas 24h

│

├── infrastructure/

│   └── persistence/

│       └── postgres/

│           ├── models/

│           │   └── Appointment.model.js            ✅ Modelo Sequelize

│           │

│           └── repositories/

│               └── AppointmentRepository.js        ⚠️ Implementación (revisar)

│

└── presentation/

&nbsp;   └── api/

&nbsp;       ├── controllers/

&nbsp;       │   └── TelehealthController.js             ✅ Controlador principal

&nbsp;       │

&nbsp;       ├── routes/

&nbsp;       │   └── telehealth.routes.js                ✅ Definición de rutas

&nbsp;       │

&nbsp;       └── validators/

&nbsp;           └── telehealth/

&nbsp;               ├── ScheduleAppointmentValidator.js ✅ Validación Joi

&nbsp;               └── UpdateStatusValidator.js        ✅ Validación Joi

```



\### 4.2 Frontend

```

frontend/src/

│

├── pages/

│   └── telehealth/

│       ├── TelehealthPage.jsx              ⚠️ Dashboard principal (revisar)

│       ├── ScheduleAppointmentPage.jsx     ✅ Formulario agendar

│       └── AppointmentDetailsPage.jsx      ✅ Detalles de cita

│

├── components/

│   └── telehealth/

│       ├── AppointmentCard.jsx             ✅ Card de cita

│       └── AppointmentsList.jsx            ✅ Lista de citas

│

└── services/

&nbsp;   └── telehealthService.js                ✅ Llamadas API



5\. BACKEND - IMPLEMENTACIÓN DETALLADA

5.1 Entidad de Dominio

Archivo: backend/src/domain/entities/Appointment.entity.js

javascriptclass Appointment {

&nbsp; constructor({

&nbsp;   id,

&nbsp;   studentId,

&nbsp;   teacherId,

&nbsp;   scheduledAt,

&nbsp;   duration,

&nbsp;   status = 'SCHEDULED',

&nbsp;   reason,

&nbsp;   notes = null,

&nbsp;   recordingUrl = null,

&nbsp;   vitalSigns = null,

&nbsp;   createdAt,

&nbsp;   updatedAt,

&nbsp; }) {

&nbsp;   this.id = id;

&nbsp;   this.studentId = studentId;

&nbsp;   this.teacherId = teacherId;

&nbsp;   this.scheduledAt = new Date(scheduledAt);

&nbsp;   this.duration = duration;

&nbsp;   this.status = status;

&nbsp;   this.reason = reason;

&nbsp;   this.notes = notes;

&nbsp;   this.recordingUrl = recordingUrl;

&nbsp;   this.vitalSigns = vitalSigns;

&nbsp;   this.createdAt = createdAt;

&nbsp;   this.updatedAt = updatedAt;

&nbsp; }



&nbsp; // Métodos de negocio

&nbsp; getEndTime() {

&nbsp;   return new Date(this.scheduledAt.getTime() + this.duration \* 60000);

&nbsp; }



&nbsp; isScheduled() {

&nbsp;   return this.status === 'SCHEDULED';

&nbsp; }



&nbsp; confirm() {

&nbsp;   if (this.status !== 'SCHEDULED') {

&nbsp;     throw new Error('Only scheduled appointments can be confirmed');

&nbsp;   }

&nbsp;   this.status = 'CONFIRMED';

&nbsp; }



&nbsp; // ... más métodos

}

5.2 Modelo de Base de Datos

Archivo: backend/src/infrastructure/persistence/postgres/models/Appointment.model.js

javascriptmodule.exports = (sequelize) => {

&nbsp; const Appointment = sequelize.define(

&nbsp;   'Appointment',

&nbsp;   {

&nbsp;     id: {

&nbsp;       type: DataTypes.UUID,

&nbsp;       defaultValue: DataTypes.UUIDV4,

&nbsp;       primaryKey: true,

&nbsp;     },

&nbsp;     studentId: {

&nbsp;       type: DataTypes.UUID,

&nbsp;       allowNull: false,

&nbsp;       field: 'student\_id',

&nbsp;     },

&nbsp;     teacherId: {

&nbsp;       type: DataTypes.UUID,

&nbsp;       allowNull: false,

&nbsp;       field: 'teacher\_id',

&nbsp;     },

&nbsp;     scheduledAt: {

&nbsp;       type: DataTypes.DATE,

&nbsp;       allowNull: false,

&nbsp;       field: 'scheduled\_at',

&nbsp;     },

&nbsp;     duration: {

&nbsp;       type: DataTypes.INTEGER,

&nbsp;       allowNull: false,

&nbsp;       validate: {

&nbsp;         min: 15,

&nbsp;         max: 120,

&nbsp;       },

&nbsp;     },

&nbsp;     status: {

&nbsp;       type: DataTypes.ENUM(

&nbsp;         'SCHEDULED',

&nbsp;         'CONFIRMED',

&nbsp;         'IN\_PROGRESS',

&nbsp;         'COMPLETED',

&nbsp;         'CANCELLED'

&nbsp;       ),

&nbsp;       defaultValue: 'SCHEDULED',

&nbsp;     },

&nbsp;     reason: {

&nbsp;       type: DataTypes.TEXT,

&nbsp;       allowNull: false,

&nbsp;     },

&nbsp;     notes: {

&nbsp;       type: DataTypes.TEXT,

&nbsp;       allowNull: true,

&nbsp;     },

&nbsp;     recordingUrl: {

&nbsp;       type: DataTypes.STRING,

&nbsp;       allowNull: true,

&nbsp;       field: 'recording\_url',

&nbsp;     },

&nbsp;     vitalSigns: {

&nbsp;       type: DataTypes.JSONB,

&nbsp;       allowNull: true,

&nbsp;       field: 'vital\_signs',

&nbsp;     },

&nbsp;   },

&nbsp;   {

&nbsp;     tableName: 'appointments',

&nbsp;     timestamps: true,

&nbsp;     underscored: true,

&nbsp;   }

&nbsp; );



&nbsp; // Asociaciones

&nbsp; Appointment.associate = (models) => {

&nbsp;   Appointment.belongsTo(models.User, {

&nbsp;     foreignKey: 'studentId',

&nbsp;     as: 'student',

&nbsp;   });



&nbsp;   Appointment.belongsTo(models.User, {

&nbsp;     foreignKey: 'teacherId',

&nbsp;     as: 'teacher',

&nbsp;   });

&nbsp; };



&nbsp; return Appointment;

};

5.3 Use Case: ScheduleAppointment ✅

Archivo: backend/src/application/use-cases/telehealth/ScheduleAppointment.usecase.js

javascriptclass ScheduleAppointmentUseCase {

&nbsp; constructor({ appointmentRepository }) {

&nbsp;   this.appointmentRepository = appointmentRepository;

&nbsp; }



&nbsp; async execute({ userId, userRole, studentId, teacherId, scheduledAt, duration, reason }) {

&nbsp;   try {

&nbsp;     console.log('📅 ScheduleAppointmentUseCase - Input:', {

&nbsp;       userId,

&nbsp;       userRole,

&nbsp;       studentId,

&nbsp;       teacherId,

&nbsp;       scheduledAt,

&nbsp;       duration,

&nbsp;     });



&nbsp;     // ✅ Determinar el studentId final según el rol

&nbsp;     let finalStudentId = studentId;



&nbsp;     if (userRole === 'STUDENT') {

&nbsp;       finalStudentId = userId;

&nbsp;       console.log('🎓 User is STUDENT, using their own ID');

&nbsp;     } else if (\['ADMINISTRATIVE', 'IT\_ADMIN', 'DIRECTOR'].includes(userRole)) {

&nbsp;       if (!studentId) {

&nbsp;         throw new Error('Admin must specify studentId');

&nbsp;       }

&nbsp;       finalStudentId = studentId;

&nbsp;       console.log('👨‍💼 User is ADMIN, using provided studentId');

&nbsp;     } else if (userRole === 'TEACHER') {

&nbsp;       throw new Error('Teachers cannot schedule appointments for themselves');

&nbsp;     }



&nbsp;     console.log('✅ Final studentId:', finalStudentId);



&nbsp;     // ✅ Validar disponibilidad del docente

&nbsp;     const isAvailable = await this.appointmentRepository.checkTeacherAvailability(

&nbsp;       teacherId,

&nbsp;       scheduledAt,

&nbsp;       duration

&nbsp;     );



&nbsp;     if (!isAvailable) {

&nbsp;       throw new Error('Teacher is not available at the requested time');

&nbsp;     }



&nbsp;     console.log('✅ Teacher is available');



&nbsp;     // ✅ Crear la entidad Appointment

&nbsp;     const appointment = new Appointment({

&nbsp;       studentId: finalStudentId,

&nbsp;       teacherId,

&nbsp;       scheduledAt: new Date(scheduledAt),

&nbsp;       duration: parseInt(duration, 10),

&nbsp;       status: 'SCHEDULED',

&nbsp;       reason,

&nbsp;     });



&nbsp;     // ✅ Guardar en la base de datos

&nbsp;     const createdAppointment = await this.appointmentRepository.create(appointment);



&nbsp;     console.log('✅ Appointment created successfully:', createdAppointment.id);



&nbsp;     return createdAppointment;

&nbsp;   } catch (error) {

&nbsp;     console.error('❌ Error in ScheduleAppointmentUseCase:', error.message);

&nbsp;     throw error;

&nbsp;   }

&nbsp; }

}

5.4 Repository: checkTeacherAvailability ✅

Archivo: backend/src/infrastructure/persistence/postgres/repositories/AppointmentRepository.js

javascriptasync checkTeacherAvailability(teacherId, scheduledAt, duration) {

&nbsp; try {

&nbsp;   const startTime = new Date(scheduledAt);

&nbsp;   const endTime = new Date(startTime.getTime() + duration \* 60000);



&nbsp;   console.log('🔍 Checking teacher availability:', {

&nbsp;     teacherId,

&nbsp;     startTime: startTime.toISOString(),

&nbsp;     endTime: endTime.toISOString(),

&nbsp;     duration,

&nbsp;   });



&nbsp;   // ✅ Buscar todas las citas activas del docente

&nbsp;   const activeAppointments = await models.Appointment.findAll({

&nbsp;     where: {

&nbsp;       teacherId,

&nbsp;       status: {

&nbsp;         \[Op.in]: \['SCHEDULED', 'CONFIRMED', 'IN\_PROGRESS'],

&nbsp;       },

&nbsp;     },

&nbsp;   });



&nbsp;   console.log(`📋 Found ${activeAppointments.length} active appointments for teacher`);



&nbsp;   // ✅ Verificar manualmente si hay solapamiento

&nbsp;   const hasConflict = activeAppointments.some((appointment) => {

&nbsp;     const existingStart = new Date(appointment.scheduledAt);

&nbsp;     const existingEnd = new Date(existingStart.getTime() + appointment.duration \* 60000);



&nbsp;     // Verificar solapamiento

&nbsp;     const overlaps =

&nbsp;       (startTime >= existingStart \&\& startTime < existingEnd) ||

&nbsp;       (endTime > existingStart \&\& endTime <= existingEnd) ||

&nbsp;       (startTime <= existingStart \&\& endTime >= existingEnd);



&nbsp;     if (overlaps) {

&nbsp;       console.log('❌ Conflict detected with appointment:', appointment.id);

&nbsp;     }



&nbsp;     return overlaps;

&nbsp;   });



&nbsp;   const isAvailable = !hasConflict;



&nbsp;   console.log('✅ Teacher availability result:', { isAvailable });



&nbsp;   return isAvailable;

&nbsp; } catch (error) {

&nbsp;   console.error('❌ Error checking teacher availability:', error);

&nbsp;   throw error;

&nbsp; }

}

5.5 Controller

Archivo: backend/src/presentation/api/controllers/TelehealthController.js

javascriptclass TelehealthController {

&nbsp; constructor({

&nbsp;   scheduleAppointmentUseCase,

&nbsp;   getAppointmentsUseCase,

&nbsp;   // ... otros use cases

&nbsp; }) {

&nbsp;   this.scheduleAppointmentUseCase = scheduleAppointmentUseCase;

&nbsp;   this.getAppointmentsUseCase = getAppointmentsUseCase;

&nbsp; }



&nbsp; /\*\*

&nbsp;  \* Helper: Determinar rol principal del usuario

&nbsp;  \*/

&nbsp; \_getPrimaryRole(userRoles) {

&nbsp;   if (userRoles.includes('IT\_ADMIN')) return 'IT\_ADMIN';

&nbsp;   if (userRoles.includes('ADMINISTRATIVE')) return 'ADMINISTRATIVE';

&nbsp;   if (userRoles.includes('DIRECTOR')) return 'DIRECTOR';

&nbsp;   if (userRoles.includes('TEACHER')) return 'TEACHER';

&nbsp;   if (userRoles.includes('STUDENT')) return 'STUDENT';

&nbsp;   return 'STUDENT';

&nbsp; }



&nbsp; /\*\*

&nbsp;  \* POST /api/telehealth/appointments

&nbsp;  \* Agendar nueva cita

&nbsp;  \*/

&nbsp; async scheduleAppointment(req, res, next) {

&nbsp;   try {

&nbsp;     const { studentId, teacherId, scheduledAt, duration, reason } = req.body;



&nbsp;     const userId = req.user.userId;

&nbsp;     const userRoles = req.user.roles;

&nbsp;     const userRole = this.\_getPrimaryRole(userRoles);



&nbsp;     console.log('📅 Schedule appointment request:', {

&nbsp;       userId,

&nbsp;       userRole,

&nbsp;       studentId,

&nbsp;       teacherId,

&nbsp;     });



&nbsp;     // Validaciones básicas

&nbsp;     if (!teacherId) {

&nbsp;       return res.status(400).json({

&nbsp;         success: false,

&nbsp;         message: 'El teacherId es obligatorio',

&nbsp;       });

&nbsp;     }



&nbsp;     // ... más validaciones



&nbsp;     // Ejecutar use case

&nbsp;     const appointment = await this.scheduleAppointmentUseCase.execute({

&nbsp;       userId,

&nbsp;       userRole,

&nbsp;       studentId,

&nbsp;       teacherId,

&nbsp;       scheduledAt,

&nbsp;       duration: parseInt(duration, 10),

&nbsp;       reason: reason.trim(),

&nbsp;     });



&nbsp;     console.log('✅ Appointment created:', appointment.id);



&nbsp;     return res.status(201).json({

&nbsp;       success: true,

&nbsp;       message: 'Cita agendada exitosamente',

&nbsp;       data: appointment,

&nbsp;     });

&nbsp;   } catch (error) {

&nbsp;     console.error('❌ Error in scheduleAppointment:', error);

&nbsp;     next(error);

&nbsp;   }

&nbsp; }



&nbsp; // ... otros métodos

}

5.6 Validators

Archivo: backend/src/presentation/api/validators/telehealth/ScheduleAppointmentValidator.js

javascriptconst Joi = require('joi');



const scheduleAppointmentSchema = Joi.object({

&nbsp; studentId: Joi.string().uuid().optional().allow(null, ''),

&nbsp; 

&nbsp; teacherId: Joi.string().uuid().required().messages({

&nbsp;   'string.empty': 'El teacherId es obligatorio',

&nbsp;   'string.guid': 'El teacherId debe ser un UUID válido',

&nbsp;   'any.required': 'El teacherId es obligatorio',

&nbsp; }),

&nbsp; 

&nbsp; scheduledAt: Joi.date().iso().required().messages({

&nbsp;   'date.base': 'La fecha debe ser válida',

&nbsp;   'date.format': 'La fecha debe estar en formato ISO',

&nbsp;   'any.required': 'La fecha y hora son obligatorias',

&nbsp; }),

&nbsp; 

&nbsp; duration: Joi.number().integer().min(15).max(120).required().messages({

&nbsp;   'number.base': 'La duración debe ser un número',

&nbsp;   'number.min': 'La duración mínima es 15 minutos',

&nbsp;   'number.max': 'La duración máxima es 120 minutos',

&nbsp;   'any.required': 'La duración es obligatoria',

&nbsp; }),

&nbsp; 

&nbsp; reason: Joi.string().min(10).max(500).required().messages({

&nbsp;   'string.empty': 'El motivo es obligatorio',

&nbsp;   'string.min': 'El motivo debe tener al menos 10 caracteres',

&nbsp;   'string.max': 'El motivo no puede exceder 500 caracteres',

&nbsp;   'any.required': 'El motivo es obligatorio',

&nbsp; }),

}).options({

&nbsp; stripUnknown: false,

&nbsp; abortEarly: false,

});



module.exports = scheduleAppointmentSchema;



6\. FRONTEND - IMPLEMENTACIÓN DETALLADA

6.1 Servicio de API

Archivo: frontend/src/services/telehealthService.js

javascriptimport api from './api';



const telehealthService = {

&nbsp; /\*\*

&nbsp;  \* Agendar nueva cita

&nbsp;  \*/

&nbsp; scheduleAppointment: async (appointmentData) => {

&nbsp;   try {

&nbsp;     console.log('📅 telehealthService - Sending appointment data:', appointmentData);



&nbsp;     const payload = {

&nbsp;       teacherId: appointmentData.teacherId,

&nbsp;       scheduledAt: appointmentData.scheduledAt,

&nbsp;       duration: appointmentData.duration,

&nbsp;       reason: appointmentData.reason,

&nbsp;     };



&nbsp;     if (appointmentData.studentId) {

&nbsp;       payload.studentId = appointmentData.studentId;

&nbsp;     }



&nbsp;     console.log('📤 telehealthService - Final payload:', payload);



&nbsp;     const response = await api.post('/telehealth/appointments', payload);



&nbsp;     console.log('✅ telehealthService - Appointment scheduled:', response);



&nbsp;     return response;

&nbsp;   } catch (error) {

&nbsp;     console.error('❌ telehealthService - Error scheduling appointment:', error);

&nbsp;     throw error;

&nbsp;   }

&nbsp; },



&nbsp; /\*\*

&nbsp;  \* Obtener citas

&nbsp;  \*/

&nbsp; getAppointments: async (filters = {}) => {

&nbsp;   try {

&nbsp;     const params = new URLSearchParams();

&nbsp;     

&nbsp;     if (filters.status) params.append('status', filters.status);

&nbsp;     if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);

&nbsp;     if (filters.dateTo) params.append('dateTo', filters.dateTo);

&nbsp;     params.append('page', filters.page || 1);

&nbsp;     params.append('limit', filters.limit || 20);



&nbsp;     const response = await api.get(`/telehealth/appointments?${params.toString()}`);

&nbsp;     

&nbsp;     return response;

&nbsp;   } catch (error) {

&nbsp;     console.error('❌ Error getting appointments:', error);

&nbsp;     throw error;

&nbsp;   }

&nbsp; },



&nbsp; /\*\*

&nbsp;  \* Verificar disponibilidad

&nbsp;  \*/

&nbsp; checkAvailability: async (teacherId, scheduledAt, duration) => {

&nbsp;   try {

&nbsp;     const response = await api.post('/telehealth/availability/check', {

&nbsp;       teacherId,

&nbsp;       scheduledAt,

&nbsp;       duration,

&nbsp;     });

&nbsp;     

&nbsp;     return response;

&nbsp;   } catch (error) {

&nbsp;     console.error('❌ Error checking availability:', error);

&nbsp;     throw error;

&nbsp;   }

&nbsp; },



&nbsp; /\*\*

&nbsp;  \* Obtener citas próximas (24 horas)

&nbsp;  \*/

&nbsp; getUpcomingAppointments: async () => {

&nbsp;   try {

&nbsp;     const response = await api.get('/telehealth/appointments/upcoming');

&nbsp;     return response;

&nbsp;   } catch (error) {

&nbsp;     console.error('❌ Error getting upcoming appointments:', error);

&nbsp;     throw error;

&nbsp;   }

&nbsp; },



&nbsp; // ... más métodos

};



export default telehealthService;

6.2 Página: Agendar Cita ✅

Archivo: frontend/src/pages/telehealth/ScheduleAppointmentPage.jsx

Características:



✅ Formulario con validación en tiempo real

✅ Selector de estudiantes (solo para ADMIN)

✅ Selector de docentes (para todos)

✅ Validación de fecha/hora futura

✅ Verificar disponibilidad del docente

✅ Toast notifications

✅ Redirección después de crear



Validaciones Frontend:

javascriptconst validateAppointmentData = (data) => {

&nbsp; const errors = {};



&nbsp; // Validar teacherId

&nbsp; if (!data.teacherId) {

&nbsp;   errors.teacherId = 'Debe seleccionar un docente';

&nbsp; }



&nbsp; // Validar scheduledAt

&nbsp; if (!data.scheduledAt) {

&nbsp;   errors.scheduledAt = 'La fecha y hora son obligatorias';

&nbsp; } else {

&nbsp;   const scheduledDate = new Date(data.scheduledAt);

&nbsp;   const now = new Date();



&nbsp;   if (scheduledDate < now) {

&nbsp;     errors.scheduledAt = 'La fecha y hora no pueden ser en el pasado';

&nbsp;   }

&nbsp; }



&nbsp; // Validar duration

&nbsp; if (!data.duration) {

&nbsp;   errors.duration = 'La duración es obligatoria';

&nbsp; } else if (data.duration < 15 || data.duration > 120) {

&nbsp;   errors.duration = 'La duración debe estar entre 15 y 120 minutos';

&nbsp; }



&nbsp; // Validar reason

&nbsp; if (!data.reason) {

&nbsp;   errors.reason = 'El motivo es obligatorio';

&nbsp; } else if (data.reason.trim().length < 10) {

&nbsp;   errors.reason = 'El motivo debe tener al menos 10 caracteres';

&nbsp; }



&nbsp; return {

&nbsp;   isValid: Object.keys(errors).length === 0,

&nbsp;   errors,

&nbsp; };

};

6.3 Dashboard de Teleenfermería ⚠️

Archivo: frontend/src/pages/telehealth/TelehealthPage.jsx

Características:



✅ Métricas del dashboard (Próximas, Total, Docentes disponibles)

✅ Tabs: Próximas 24h, Todas, Pasadas

⚠️ Filtros por estado

⚠️ Paginación

⚠️ Mostrar botón "Agendar Cita" según rol



Estructura de Estado:

javascriptconst \[appointments, setAppointments] = useState(\[]);

const \[upcomingAppointments, setUpcomingAppointments] = useState(\[]);

const \[loading, setLoading] = useState(false);

const \[error, setError] = useState(null);

const \[currentTab, setCurrentTab] = useState('upcoming'); // 'upcoming' | 'all' | 'past'

const \[pagination, setPagination] = useState({

&nbsp; page: 1,

&nbsp; limit: 20,

&nbsp; total: 0,

});

Función fetchAppointments (con problemas):

javascriptconst fetchAppointments = async () => {

&nbsp; try {

&nbsp;   setLoading(true);

&nbsp;   setError(null);



&nbsp;   let filters = {

&nbsp;     page: pagination.page,

&nbsp;     limit: pagination.limit,

&nbsp;   };



&nbsp;   // Filtrar según el tab activo

&nbsp;   if (currentTab === 'past') {

&nbsp;     filters.status = 'COMPLETED,CANCELLED';

&nbsp;     filters.dateTo = new Date().toISOString();

&nbsp;   } else if (currentTab === 'upcoming') {

&nbsp;     // Las próximas 24h tienen su propio endpoint

&nbsp;     const response = await telehealthService.getUpcomingAppointments();

&nbsp;     setUpcomingAppointments(response.data || \[]);

&nbsp;     return;

&nbsp;   }



&nbsp;   // ⚠️ PROBLEMA: Este llamado devuelve error 500

&nbsp;   const response = await telehealthService.getAppointments(filters);



&nbsp;   setAppointments(response.data || \[]);

&nbsp;   setPagination({

&nbsp;     ...pagination,

&nbsp;     total: response.pagination?.total || 0,

&nbsp;   });

&nbsp; } catch (error) {

&nbsp;   console.error('❌ Error loading appointments:', error);

&nbsp;   setError('Error al cargar las citas');

&nbsp; } finally {

&nbsp;   setLoading(false);

&nbsp; }

};

Corrección necesaria - Botón "Agendar Cita":

javascript{/\* ✅ CORRECCIÓN: Mostrar botón solo para ADMIN y STUDENT \*/}

{(isAdmin || isStudent) \&\& (

&nbsp; <button

&nbsp;   onClick={() => navigate('/telehealth/schedule')}

&nbsp;   className="btn btn-primary"

&nbsp; >

&nbsp;   <Plus size={20} />

&nbsp;   Agendar Cita

&nbsp; </button>

)}



{/\* ✅ Para TEACHER, mostrar mensaje informativo \*/}

{isTeacher \&\& (

&nbsp; <div className="info-message">

&nbsp;   <Users size={20} />

&nbsp;   <p>Los estudiantes agendan citas contigo</p>

&nbsp; </div>

)}

6.4 Componentes Reutilizables

6.4.1 AppointmentCard.jsx ✅

Archivo: frontend/src/components/telehealth/AppointmentCard.jsx

Props:

javascript{

&nbsp; appointment: {

&nbsp;   id: "UUID",

&nbsp;   student: { firstName, lastName, email },

&nbsp;   teacher: { firstName, lastName, email },

&nbsp;   scheduledAt: "ISO DateTime",

&nbsp;   duration: Number,

&nbsp;   status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED",

&nbsp;   reason: String

&nbsp; },

&nbsp; onClick: Function,

&nbsp; showActions: Boolean

}

Características:



✅ Badge de estado con colores

✅ Formato de fecha/hora

✅ Información del estudiante y docente

✅ Acciones contextuales según rol

✅ Diseño responsive



Estados visuales:

javascriptconst statusColors = {

&nbsp; SCHEDULED: 'bg-blue-100 text-blue-800',

&nbsp; CONFIRMED: 'bg-green-100 text-green-800',

&nbsp; IN\_PROGRESS: 'bg-yellow-100 text-yellow-800',

&nbsp; COMPLETED: 'bg-gray-100 text-gray-800',

&nbsp; CANCELLED: 'bg-red-100 text-red-800',

};



const statusLabels = {

&nbsp; SCHEDULED: 'Programada',

&nbsp; CONFIRMED: 'Confirmada',

&nbsp; IN\_PROGRESS: 'En Progreso',

&nbsp; COMPLETED: 'Completada',

&nbsp; CANCELLED: 'Cancelada',

};

6.4.2 AppointmentsList.jsx ✅

Archivo: frontend/src/components/telehealth/AppointmentsList.jsx

Props:

javascript{

&nbsp; appointments: Array,

&nbsp; loading: Boolean,

&nbsp; error: String,

&nbsp; onAppointmentClick: Function,

&nbsp; emptyMessage: String

}

Características:



✅ Renderizado de lista de AppointmentCard

✅ Estados de loading y error

✅ Mensaje de lista vacía

✅ Skeleton loaders





7\. BASE DE DATOS

7.1 Tabla: appointments

Schema PostgreSQL:

sqlCREATE TABLE appointments (

&nbsp; id UUID PRIMARY KEY DEFAULT uuid\_generate\_v4(),

&nbsp; student\_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

&nbsp; teacher\_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

&nbsp; scheduled\_at TIMESTAMP WITH TIME ZONE NOT NULL,

&nbsp; duration INTEGER NOT NULL CHECK (duration >= 15 AND duration <= 120),

&nbsp; status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED'

&nbsp;   CHECK (status IN ('SCHEDULED', 'CONFIRMED', 'IN\_PROGRESS', 'COMPLETED', 'CANCELLED')),

&nbsp; reason TEXT NOT NULL CHECK (length(reason) >= 10),

&nbsp; notes TEXT,

&nbsp; recording\_url VARCHAR(500),

&nbsp; vital\_signs JSONB,

&nbsp; created\_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

&nbsp; updated\_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

&nbsp; 

&nbsp; -- Índices para optimización

&nbsp; INDEX idx\_appointments\_student\_id (student\_id),

&nbsp; INDEX idx\_appointments\_teacher\_id (teacher\_id),

&nbsp; INDEX idx\_appointments\_scheduled\_at (scheduled\_at),

&nbsp; INDEX idx\_appointments\_status (status),

&nbsp; INDEX idx\_appointments\_created\_at (created\_at)

);



-- Trigger para actualizar updated\_at

CREATE TRIGGER update\_appointments\_updated\_at

&nbsp; BEFORE UPDATE ON appointments

&nbsp; FOR EACH ROW

&nbsp; EXECUTE FUNCTION update\_updated\_at\_column();

```



\### 7.2 Relaciones

```

┌──────────────┐         ┌─────────────────┐         ┌──────────────┐

│    users     │◄───────┤   appointments  ├────────►│    users     │

│  (students)  │  1:N    │                 │  N:1    │  (teachers)  │

└──────────────┘         └─────────────────┘         └──────────────┘

&nbsp;                               │

&nbsp;                               │ 1:1

&nbsp;                               ▼

&nbsp;                        ┌─────────────────┐

&nbsp;                        │   recordings    │

&nbsp;                        │  (future impl)  │

&nbsp;                        └─────────────────┘

7.3 Datos de Ejemplo

sql-- Citas de prueba

INSERT INTO appointments (id, student\_id, teacher\_id, scheduled\_at, duration, status, reason)

VALUES

&nbsp; (

&nbsp;   '6ea53b1-f640-4123-a3a8-8b80d836fc35',

&nbsp;   '655aa70d-391e-4e7b-b2aa-25ce3c9ad48b', -- Juan Pérez (STUDENT)

&nbsp;   '83b89cf6-91e8-4f2e-b3e3-315d669fa928', -- María García (TEACHER)

&nbsp;   '2025-11-22 10:00:00+00',

&nbsp;   30,

&nbsp;   'SCHEDULED',

&nbsp;   'Consulta sobre procedimientos de venopunción'

&nbsp; ),

&nbsp; (

&nbsp;   'd1276ffb-ca56-4daa-ad0e-bca0d3179dd5',

&nbsp;   '655aa70d-391e-4e7b-b2aa-25ce3c9ad48b',

&nbsp;   '83b89cf6-91e8-4f2e-b3e3-315d669fa928',

&nbsp;   '2025-11-28 15:55:00+00',

&nbsp;   30,

&nbsp;   'SCHEDULED',

&nbsp;   'Revisión de técnicas de RCP básico'

&nbsp; );

7.4 Queries Comunes

Obtener citas de un estudiante:

sqlSELECT 

&nbsp; a.\*,

&nbsp; t.first\_name as teacher\_first\_name,

&nbsp; t.last\_name as teacher\_last\_name,

&nbsp; t.email as teacher\_email

FROM appointments a

INNER JOIN users t ON a.teacher\_id = t.id

WHERE a.student\_id = $1

&nbsp; AND a.status IN ('SCHEDULED', 'CONFIRMED')

ORDER BY a.scheduled\_at ASC;

Obtener citas de un docente:

sqlSELECT 

&nbsp; a.\*,

&nbsp; s.first\_name as student\_first\_name,

&nbsp; s.last\_name as student\_last\_name,

&nbsp; s.email as student\_email

FROM appointments a

INNER JOIN users s ON a.student\_id = s.id

WHERE a.teacher\_id = $1

&nbsp; AND a.status IN ('SCHEDULED', 'CONFIRMED')

ORDER BY a.scheduled\_at ASC;

Verificar disponibilidad:

sqlSELECT COUNT(\*) as conflicts

FROM appointments

WHERE teacher\_id = $1

&nbsp; AND status IN ('SCHEDULED', 'CONFIRMED', 'IN\_PROGRESS')

&nbsp; AND (

&nbsp;   -- La nueva cita empieza durante una existente

&nbsp;   ($2 >= scheduled\_at AND $2 < scheduled\_at + (duration || ' minutes')::INTERVAL)

&nbsp;   OR

&nbsp;   -- La nueva cita termina durante una existente

&nbsp;   ($3 > scheduled\_at AND $3 <= scheduled\_at + (duration || ' minutes')::INTERVAL)

&nbsp;   OR

&nbsp;   -- La nueva cita cubre completamente una existente

&nbsp;   ($2 <= scheduled\_at AND $3 >= scheduled\_at + (duration || ' minutes')::INTERVAL)

&nbsp; );



8\. API REST ENDPOINTS

8.1 Resumen de Endpoints

MétodoEndpointDescripciónEstadoPOST/api/telehealth/appointmentsAgendar nueva cita✅GET/api/telehealth/appointmentsListar citas⚠️GET/api/telehealth/appointments/upcomingCitas próximas 24h✅GET/api/telehealth/appointments/:idDetalles de cita✅PATCH/api/telehealth/appointments/:id/statusActualizar estado✅DELETE/api/telehealth/appointments/:idCancelar cita✅POST/api/telehealth/availability/checkVerificar disponibilidad✅

8.2 Documentación Detallada

8.2.1 POST /api/telehealth/appointments ✅

Descripción: Agendar una nueva cita

Autenticación: Requerida (JWT)

Roles permitidos: STUDENT, ADMINISTRATIVE, IT\_ADMIN

Request Body:

json{

&nbsp; "teacherId": "83b89cf6-91e8-4f2e-b3e3-315d669fa928",

&nbsp; "studentId": "655aa70d-391e-4e7b-b2aa-25ce3c9ad48b",  // Opcional para STUDENT

&nbsp; "scheduledAt": "2025-11-22T10:00:00.000Z",

&nbsp; "duration": 30,

&nbsp; "reason": "Consulta sobre procedimientos de venopunción"

}

Validaciones:



teacherId: UUID válido, obligatorio

studentId: UUID válido, opcional (para STUDENT es automático)

scheduledAt: Fecha ISO válida, debe ser futura

duration: Número entre 15 y 120

reason: String de 10 a 500 caracteres



Response Success (201):

json{

&nbsp; "success": true,

&nbsp; "message": "Cita agendada exitosamente",

&nbsp; "data": {

&nbsp;   "id": "6ea53b1-f640-4123-a3a8-8b80d836fc35",

&nbsp;   "studentId": "655aa70d-391e-4e7b-b2aa-25ce3c9ad48b",

&nbsp;   "teacherId": "83b89cf6-91e8-4f2e-b3e3-315d669fa928",

&nbsp;   "scheduledAt": "2025-11-22T10:00:00.000Z",

&nbsp;   "duration": 30,

&nbsp;   "status": "SCHEDULED",

&nbsp;   "reason": "Consulta sobre procedimientos de venopunción",

&nbsp;   "createdAt": "2025-11-21T13:55:45.023Z",

&nbsp;   "updatedAt": "2025-11-21T13:55:45.623Z"

&nbsp; }

}

Response Error (400):

json{

&nbsp; "success": false,

&nbsp; "message": "Teacher is not available at the requested time",

&nbsp; "error": {

&nbsp;   "code": "TEACHER\_NOT\_AVAILABLE",

&nbsp;   "details": "El docente ya tiene una cita agendada en ese horario"

&nbsp; }

}

Errores posibles:



400 - Validación fallida

400 - Docente no disponible

401 - No autenticado

403 - Sin permisos

404 - Docente o estudiante no encontrado

500 - Error interno del servidor



Ejemplo con cURL:

bashcurl -X POST http://localhost:3000/api/telehealth/appointments \\

&nbsp; -H "Authorization: Bearer YOUR\_JWT\_TOKEN" \\

&nbsp; -H "Content-Type: application/json" \\

&nbsp; -d '{

&nbsp;   "teacherId": "83b89cf6-91e8-4f2e-b3e3-315d669fa928",

&nbsp;   "scheduledAt": "2025-11-22T10:00:00.000Z",

&nbsp;   "duration": 30,

&nbsp;   "reason": "Consulta sobre procedimientos"

&nbsp; }'

```



---



\#### 8.2.2 GET /api/telehealth/appointments ⚠️



\*\*Descripción:\*\* Obtener lista de citas según el rol



\*\*Autenticación:\*\* Requerida (JWT)



\*\*Roles permitidos:\*\* Todos



\*\*Query Parameters:\*\*

```

?page=1                              // Número de página (default: 1)

\&limit=20                            // Citas por página (default: 20)

\&status=SCHEDULED,CONFIRMED          // Filtrar por estado(s)

\&dateFrom=2025-11-01T00:00:00.000Z  // Desde fecha

\&dateTo=2025-11-30T23:59:59.999Z    // Hasta fecha

Lógica por Rol:



STUDENT: Solo ve sus propias citas

TEACHER: Solo ve citas donde es el docente

ADMIN: Ve todas las citas



Response Success (200):

json{

&nbsp; "success": true,

&nbsp; "message": "Appointments retrieved successfully",

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "id": "6ea53b1-f640-4123-a3a8-8b80d836fc35",

&nbsp;     "scheduledAt": "2025-11-22T10:00:00.000Z",

&nbsp;     "duration": 30,

&nbsp;     "status": "SCHEDULED",

&nbsp;     "reason": "Consulta sobre procedimientos",

&nbsp;     "student": {

&nbsp;       "id": "655aa70d-391e-4e7b-b2aa-25ce3c9ad48b",

&nbsp;       "firstName": "Juan",

&nbsp;       "lastName": "Pérez",

&nbsp;       "email": "juan.perez@smartcampus.edu.pe"

&nbsp;     },

&nbsp;     "teacher": {

&nbsp;       "id": "83b89cf6-91e8-4f2e-b3e3-315d669fa928",

&nbsp;       "firstName": "María",

&nbsp;       "lastName": "García",

&nbsp;       "email": "maria.garcia@smartcampus.edu.pe"

&nbsp;     }

&nbsp;   }

&nbsp; ],

&nbsp; "pagination": {

&nbsp;   "page": 1,

&nbsp;   "limit": 20,

&nbsp;   "total": 7,

&nbsp;   "totalPages": 1

&nbsp; }

}

```



\*\*Problema Conocido:\*\*

```

❌ Error 500 al listar citas de TEACHER y STUDENT

✅ Funciona correctamente para ADMIN



8.2.3 GET /api/telehealth/appointments/upcoming ✅

Descripción: Obtener citas de las próximas 24 horas

Autenticación: Requerida (JWT)

Roles permitidos: Todos

Response Success (200):

json{

&nbsp; "success": true,

&nbsp; "message": "You have 2 upcoming appointment(s) in the next 24 hours",

&nbsp; "data": \[

&nbsp;   {

&nbsp;     "id": "6ea53b1-f640-4123-a3a8-8b80d836fc35",

&nbsp;     "scheduledAt": "2025-11-22T10:00:00.000Z",

&nbsp;     "duration": 30,

&nbsp;     "status": "SCHEDULED",

&nbsp;     "student": {...},

&nbsp;     "teacher": {...}

&nbsp;   }

&nbsp; ]

}



8.2.4 POST /api/telehealth/availability/check ✅

Descripción: Verificar si un docente está disponible

Autenticación: Requerida (JWT)

Roles permitidos: Todos

Request Body:

json{

&nbsp; "teacherId": "83b89cf6-91e8-4f2e-b3e3-315d669fa928",

&nbsp; "scheduledAt": "2025-11-22T10:00:00.000Z",

&nbsp; "duration": 30

}

Response Success (200):

json{

&nbsp; "success": true,

&nbsp; "message": "Availability checked successfully",

&nbsp; "data": {

&nbsp;   "isAvailable": true,

&nbsp;   "teacherId": "83b89cf6-91e8-4f2e-b3e3-315d669fa928",

&nbsp;   "scheduledAt": "2025-11-22T10:00:00.000Z",

&nbsp;   "duration": 30

&nbsp; }

}

Response - No disponible:

json{

&nbsp; "success": true,

&nbsp; "data": {

&nbsp;   "isAvailable": false,

&nbsp;   "teacherId": "83b89cf6-91e8-4f2e-b3e3-315d669fa928",

&nbsp;   "scheduledAt": "2025-11-22T10:00:00.000Z",

&nbsp;   "duration": 30,

&nbsp;   "conflicts": \[

&nbsp;     {

&nbsp;       "id": "existing-appointment-id",

&nbsp;       "scheduledAt": "2025-11-22T09:45:00.000Z",

&nbsp;       "duration": 30

&nbsp;     }

&nbsp;   ]

&nbsp; }

}

```



---



\## 9. FLUJOS DE USUARIO



\### 9.1 Flujo: STUDENT agenda una cita

```

1\. LOGIN

&nbsp;  ↓

2\. DASHBOARD → Click "Agendar Cita"

&nbsp;  ↓

3\. FORMULARIO

&nbsp;  - Selecciona DOCENTE (dropdown)

&nbsp;  - Selecciona FECHA/HORA (datetime-local)

&nbsp;  - Selecciona DURACIÓN (select: 15, 30, 45, 60, 90, 120 min)

&nbsp;  - Escribe MOTIVO (textarea, mín 10 caracteres)

&nbsp;  ↓

4\. VERIFICAR DISPONIBILIDAD (opcional)

&nbsp;  - Click botón "Verificar Disponibilidad"

&nbsp;  - Sistema muestra si está disponible o no

&nbsp;  ↓

5\. SUBMIT FORMULARIO

&nbsp;  - Frontend valida datos

&nbsp;  - Envía POST /api/telehealth/appointments

&nbsp;  - Backend valida disponibilidad automáticamente

&nbsp;  ↓

6\. RESPUESTA

&nbsp;  ✅ Éxito:

&nbsp;     - Toast verde: "¡Cita agendada exitosamente!"

&nbsp;     - Redirige a /telehealth después de 1 segundo

&nbsp;     - Dashboard muestra la nueva cita

&nbsp;  

&nbsp;  ❌ Error:

&nbsp;     - Toast rojo: "El docente no está disponible"

&nbsp;     - Usuario permanece en el formulario

&nbsp;     - Puede elegir otro horario

```



\### 9.2 Flujo: ADMIN agenda una cita

```

1\. LOGIN como ADMIN

&nbsp;  ↓

2\. DASHBOARD → Click "Agendar Cita"

&nbsp;  ↓

3\. FORMULARIO (Campos adicionales)

&nbsp;  - Selecciona ESTUDIANTE (dropdown) ← Adicional para ADMIN

&nbsp;  - Selecciona DOCENTE (dropdown)

&nbsp;  - Selecciona FECHA/HORA

&nbsp;  - Selecciona DURACIÓN

&nbsp;  - Escribe MOTIVO

&nbsp;  ↓

4\. VERIFICAR DISPONIBILIDAD

&nbsp;  ↓

5\. SUBMIT FORMULARIO

&nbsp;  - Frontend valida que studentId esté seleccionado

&nbsp;  - Envía POST con studentId incluido

&nbsp;  ↓

6\. RESPUESTA

&nbsp;  ✅ Éxito: Igual que STUDENT

&nbsp;  ❌ Error: Igual que STUDENT

```



\### 9.3 Flujo: TEACHER ve sus citas

```

1\. LOGIN como TEACHER

&nbsp;  ↓

2\. DASHBOARD DE TELEENFERMERÍA

&nbsp;  - ✅ NO ve botón "Agendar Cita"

&nbsp;  - ✅ Ve mensaje: "Los estudiantes agendan citas contigo"

&nbsp;  - ✅ Ve métricas:

&nbsp;    \* Citas Próximas: X

&nbsp;    \* Total de Citas: Y

&nbsp;    \* (Sin "Docentes Disponibles")

&nbsp;  ↓

3\. TABS DE CITAS

&nbsp;  - Próximas 24h: ✅ Funciona

&nbsp;  - Todas: ⚠️ Error 500

&nbsp;  - Pasadas: ⚠️ Error 500

&nbsp;  ↓

4\. VER DETALLES DE CITA

&nbsp;  - Click en una cita

&nbsp;  - Ve información del estudiante

&nbsp;  - Ve horario y motivo

&nbsp;  - Puede CONFIRMAR o CANCELAR (futuro)



10\. CASOS DE USO

10.1 CU19 - Gestionar Citas

Nombre: Gestionar Citas

Actor Principal: STUDENT, TEACHER, ADMINISTRATIVE

Precondiciones:



Usuario autenticado

Sistema funcionando



Flujo Principal (STUDENT):



Usuario navega a /telehealth

Sistema muestra dashboard con sus citas

Usuario click en "Agendar Cita"

Sistema muestra formulario

Usuario completa formulario

Usuario verifica disponibilidad (opcional)

Usuario envía formulario

Sistema valida disponibilidad

Sistema crea la cita

Sistema muestra confirmación

Sistema redirige al dashboard

Fin



Flujos Alternativos:



6a. Docente no disponible:



Sistema muestra mensaje de error

Usuario puede elegir otro horario

Continúa en paso 5







Postcondiciones:



Cita creada en estado SCHEDULED

Estudiante y docente reciben notificación (futuro)





10.2 CU20 - Realizar Videollamada

Nombre: Realizar Videollamada

Estado: Futuro (no implementado en esta sesión)



11\. SEGURIDAD Y PERMISOS

11.1 Autenticación

Método: JWT (JSON Web Tokens)

Estructura del Token:

javascript{

&nbsp; userId: "1763e1b6-6e9f-4cf2-84fe-2832e2dbee39",

&nbsp; email: "admin@smartcampus.edu.pe",

&nbsp; roles: \["IT\_ADMIN"],

&nbsp; iat: 1732195545,

&nbsp; exp: 1732196445

}

Middleware:

javascript// backend/src/presentation/api/middlewares/auth.middleware.js

const authenticate = async (req, res, next) => {

&nbsp; const token = req.headers.authorization?.split(' ')\[1];

&nbsp; 

&nbsp; if (!token) {

&nbsp;   return res.status(401).json({ message: 'No token provided' });

&nbsp; }

&nbsp; 

&nbsp; try {

&nbsp;   const decoded = jwt.verify(token, JWT\_SECRET);

&nbsp;   

&nbsp;   req.user = {

&nbsp;     userId: decoded.userId,

&nbsp;     email: decoded.email,

&nbsp;     roles: decoded.roles,

&nbsp;   };

&nbsp;   

&nbsp;   next();

&nbsp; } catch (error) {

&nbsp;   return res.status(401).json({ message: 'Invalid token' });

&nbsp; }

};

11.2 Autorización (RBAC)

Matriz de Permisos:

Acción	STUDENT	TEACHER	ADMIN

Agendar cita propia✅❌✅

Agendar cita para otros❌❌✅

Ver citas propias✅✅✅

Ver todas las citas❌❌✅

Confirmar cita❌✅✅

Cancelar cita propia✅❌✅

Cancelar cualquier cita❌❌✅

Middleware RBAC:

javascript// backend/src/presentation/api/middlewares/rbac.middleware.js

const authorize = (allowedRoles) => (req, res, next) => {

&nbsp; if (!req.user) {

&nbsp;   return res.status(401).json({ message: 'Not authenticated' });

&nbsp; }

&nbsp; 

&nbsp; const hasRole = req.user.roles.some(role => allowedRoles.includes(role));

&nbsp; 

&nbsp; if (!hasRole) {

&nbsp;   return res.status(403).json({ 

&nbsp;     message: 'Forbidden',

&nbsp;     requiredRoles: allowedRoles,

&nbsp;     userRoles: req.user.roles

&nbsp;   });

&nbsp; }

&nbsp; 

&nbsp; next();

};

11.3 Validación de Datos

Niveles de Validación:



Frontend (Client-side):



Validación en tiempo real

Mensajes de error amigables

Prevenir envío de datos inválidos





Backend (Server-side):



Validación con Joi

Sanitización de inputs

Prevención de inyecciones SQL







Ejemplo Joi Validator:

javascriptconst scheduleAppointmentSchema = Joi.object({

&nbsp; studentId: Joi.string().uuid().optional(),

&nbsp; teacherId: Joi.string().uuid().required(),

&nbsp; scheduledAt: Joi.date().iso().required(),

&nbsp; duration: Joi.number().integer().min(15).max(120).required(),

&nbsp; reason: Joi.string().min(10).max(500).required(),

});

```



---



\## 12. TESTING Y VALIDACIÓN



\### 12.1 Tests Realizados Manualmente



\*\*Escenario 1: STUDENT agenda cita ✅\*\*

```

Given: Usuario logueado como STUDENT

When: Completa formulario y envía

Then: 

&nbsp; - Cita creada exitosamente

&nbsp; - Toast de éxito mostrado

&nbsp; - Redirige a dashboard

&nbsp; - Cita aparece en "Próximas 24h"

```



\*\*Escenario 2: ADMIN agenda cita para estudiante ✅\*\*

```

Given: Usuario logueado como ADMIN

When: Selecciona estudiante, docente y horario

Then:

&nbsp; - Cita creada con studentId especificado

&nbsp; - Sistema valida disponibilidad

&nbsp; - Cita aparece en dashboard

```



\*\*Escenario 3: Docente no disponible ✅\*\*

```

Given: Docente tiene cita de 10:00-10:30

When: Usuario intenta agendar de 10:15-10:45

Then:

&nbsp; - Backend devuelve error 400

&nbsp; - Mensaje: "Teacher is not available"

&nbsp; - Usuario permanece en formulario

```



\*\*Escenario 4: TEACHER ve sus citas ⚠️\*\*

```

Given: Usuario logueado como TEACHER

When: Accede a /telehealth

Then:

&nbsp; - ❌ ERROR 500 al cargar citas

&nbsp; - ⚠️ Requiere corrección en GetAppointments.usecase.js


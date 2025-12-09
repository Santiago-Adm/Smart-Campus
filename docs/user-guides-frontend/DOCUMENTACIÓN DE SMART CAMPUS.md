DOCUMENTACIÓN DE SMART CAMPUS INSTITUTO

Sesión Actual: Módulo de Documentos Completado

Fecha: 14 de Noviembre, 2025

Duración: Sesión extensa

Progreso: Documents Module (100%) + Users Module (100%)



📊 ESTADO ACTUAL DEL PROYECTO

✅ Módulos Completados:

1\. Auth Module (100%)



✅ Login con JWT + Refresh Token

✅ Registro de usuarios

✅ Recuperación de contraseña

✅ Middleware de autenticación

✅ RBAC (Role-Based Access Control)

✅ Persistencia de sesión



2\. Dashboard Module (100%)



✅ Dashboard personalizado por rol

✅ Widgets con métricas

✅ Navegación responsiva

✅ Header con perfil de usuario



3\. Documents Module (100%) ← RECIÉN COMPLETADO



✅ Subir documentos con drag \& drop

✅ Validación OCR (mock implementado)

✅ Aprobar/Rechazar documentos

✅ Búsqueda con filtros avanzados

✅ Paginación

✅ Vista detalle completa

✅ Permisos granulares por rol

✅ Admin puede subir por otros usuarios



4\. Users Module (100%) ← RECIÉN COMPLETADO



✅ Endpoint GET /api/users

✅ Filtros por rol, búsqueda, estado

✅ Paginación

✅ Integración con DocumentsModule





🗂️ ESTRUCTURA DE ARCHIVOS CREADOS

📁 Backend - Documents Module:

backend/src/

├── application/

│   ├── use-cases/

│   │   ├── documents/

│   │   │   ├── UploadDocument.usecase.js        ✅

│   │   │   ├── ValidateDocument.usecase.js      ✅

│   │   │   ├── SearchDocuments.usecase.js       ✅

│   │   │   ├── ApproveDocument.usecase.js       ✅

│   │   │   └── RejectDocument.usecase.js        ✅

│   │   └── users/

│   │       └── GetUsers.usecase.js              ✅ NUEVO

│   │

│   └── dtos/

│       └── users/

│           └── UserResponseDto.js               ✅ NUEVO

│

├── infrastructure/

│   └── persistence/

│       ├── postgres/

│       │   └── repositories/

│       │       └── UserRepository.js            ✅ (Actualizado)

│       │           └── findMany() - Ordenamiento corregido

│       │

│       └── mongo/

│           └── repositories/

│               └── DocumentRepository.js        ✅

│

└── presentation/

&nbsp;   └── api/

&nbsp;       ├── controllers/

&nbsp;       │   ├── DocumentsController.js           ✅ (Actualizado)

&nbsp;       │   │   └── uploadDocument() - Soporte para targetUserId

&nbsp;       │   └── UsersController.js               ✅ NUEVO

&nbsp;       │

&nbsp;       ├── routes/

&nbsp;       │   ├── documents.routes.js              ✅

&nbsp;       │   ├── users.routes.js                  ✅ NUEVO

&nbsp;       │   └── index.js                         ✅ (Actualizado)

&nbsp;       │

&nbsp;       └── index.js                              ✅ (Actualizado)

&nbsp;           └── Registro de UsersController



📁 Frontend - Documents Module:

frontend/src/

├── components/

│   └── documents/                               ✅ NUEVA CARPETA

│       ├── DocumentCard.jsx                     ✅ Componente reutilizable

│       ├── DocumentStatusBadge.jsx              ✅ Componente reutilizable

│       ├── DocumentFilters.jsx                  ✅ Componente reutilizable

│       └── DocumentUploadZone.jsx               ✅ Componente reutilizable

│

├── pages/

│   └── documents/

│       ├── DocumentsPage.jsx                    ✅ Página principal

│       ├── UploadDocumentPage.jsx               ✅ Subir documentos

│       │   └── Selector de usuarios (admin)    ✅ NUEVO

│       └── DocumentDetailPage.jsx               ✅ Vista detalle

│

├── services/

│   ├── documentService.js                       ✅

│   └── userService.js                           ✅ NUEVO

│

├── constants/

│   └── documents.js                             ✅ Enums y helpers

│

└── routes/

&nbsp;   └── index.jsx                                 ✅ (Actualizado)

&nbsp;       └── Protección de rutas por rol



🎨 PATRÓN ARQUITECTÓNICO APLICADO

✅ Documents Module - Arquitectura Robusta:

COMPONENTES REUTILIZABLES (Atomic Design)

&nbsp;   ↓

COMPOSICIÓN EN PÁGINAS

&nbsp;   ↓

SERVICIOS (API Calls)

&nbsp;   ↓

BACKEND (Clean Architecture)

Ventajas del patrón:



✅ Separación de responsabilidades (Single Responsibility)

✅ Componentes reutilizables (DRY principle)

✅ Fácil de testear (Unit tests)

✅ Fácil de mantener (Cambios localizados)

✅ Escalable (Agregar features sin romper código)





🔐 PERMISOS FINALES IMPLEMENTADOS

Matriz de Permisos - Módulo Documents:

RolSubir DocumentosVer DocumentosAprobar/RechazarEliminarSTUDENT✅ Solo propios✅ Solo propios❌✅ Propios (si no aprobados)TEACHER❌✅ Solo propios❌❌ADMINISTRATIVE✅ Por estudiantes✅ Todos✅✅ (con justificación)IT\_ADMIN✅ Por TODOS los roles✅ Todos✅✅DIRECTOR❌✅ Todos (solo lectura)❌❌



🐛 PROBLEMAS RESUELTOS EN ESTA SESIÓN

1\. Error: column User.createdAt does not exist

Problema: UserRepository intentaba ordenar por una columna inexistente.

Solución:

javascript// ❌ ANTES

order: \[\['createdAt', 'DESC']]



// ✅ DESPUÉS

order: \[\['id', 'DESC']]



2\. Error 400 al subir documento como IT\_ADMIN

Problema: Validación incorrecta del targetUserId en backend.

Solución:

javascript// ✅ Validación mejorada

if (targetUserId \&\& targetUserId !== '' \&\& targetUserId !== 'self') {

&nbsp; finalUserId = targetUserId;

} else {

&nbsp; finalUserId = currentUserId;

}



3\. IT\_ADMIN solo veía estudiantes

Problema: Frontend solo cargaba usuarios con rol STUDENT.

Solución:

javascript// ✅ IT\_ADMIN carga TODOS los roles

const roles = \['STUDENT', 'TEACHER', 'ADMINISTRATIVE', 'IT\_ADMIN', 'DIRECTOR'];

for (const role of roles) {

&nbsp; const response = await userService.getAll({ role, ... });

&nbsp; allUsers = \[...allUsers, ...response.data];

}

```



---



## PRÓXIMOS PASOS - MÓDULO LIBRARY



&nbsp;Library Module (Biblioteca Virtual)\*\*



Aplicaremos el \*\*mismo patrón robusto\*\* de Documents.



Componentes a crear:

components/library/

├── ResourceCard.jsx              ← Tarjeta de recurso educativo

├── ResourceFilters.jsx           ← Filtros (categoría, tipo, autor)

├── ResourceCategoryBadge.jsx     ← Badge por categoría

├── ResourceRating.jsx            ← Componente de estrellas

├── ResourceRecommendations.jsx   ← Panel de recomendaciones IA

└── ResourceViewer.jsx            ← Visor de PDF/Video inline

```



Páginas a crear:

pages/library/

├── LibraryPage.jsx               ← Lista de recursos + filtros

├── ResourceDetailPage.jsx        ← Vista detalle con preview

└── UploadResourcePage.jsx        ← Subir recursos (Admin/Teacher)



Funcionalidades principales:



1\. \*\*Catálogo de Recursos:\*\*

&nbsp;  - ✅ Libros, artículos, videos, guías clínicas

&nbsp;  - ✅ Búsqueda full-text con ElasticSearch

&nbsp;  - ✅ Filtros por categoría, tipo, autor

&nbsp;  - ✅ Paginación



2\. \*\*Visor Inline:\*\*

&nbsp;  - ✅ Preview de PDF en el navegador

&nbsp;  - ✅ Reproductor de videos

&nbsp;  - ✅ Anotaciones personales



3\. \*\*Recomendaciones con IA:\*\*

&nbsp;  - ✅ Sistema de recomendaciones basado en historial

&nbsp;  - ✅ Algoritmo colaborativo (scikit-learn)

&nbsp;  - ✅ Personalización por perfil de estudiante



4\. \*\*Analytics de Uso:\*\*

&nbsp;  - ✅ Recursos más consultados

&nbsp;  - ✅ Tiempo promedio de lectura

&nbsp;  - ✅ Tracking de interacciones



## SOLICITUD DE ARCHIVOS DEL BACKEND



\### \*\*🔴 IMPORTANTE: Antes de continuar con Library, necesito estos archivos:\*\*



Para mantener la \*\*hilación correcta\*\* con el backend y evitar errores, por favor comparte:



---



\#### \*\*1. Entidad de Resource:\*\*

```

📂 backend/src/domain/entities/Resource.entity.js

```

\*\*¿Qué necesito verificar?\*\*

\- Campos disponibles (title, description, category, type, author, etc.)

\- Métodos de negocio (incrementViewCount, addRating, etc.)

\- Value Objects utilizados



---



\#### \*\*2. Repositorio de Resource:\*\*

```

📂 backend/src/infrastructure/persistence/mongo/repositories/ResourceRepository.js

```

\*\*¿Qué necesito verificar?\*\*

\- Métodos disponibles (findById, findMany, search, etc.)

\- Filtros implementados

\- Estructura de búsqueda



---



\#### \*\*3. Use Cases de Library:\*\*

```

📂 backend/src/application/use-cases/library/

├── SearchResources.usecase.js

├── GetResourceDetails.usecase.js

├── RecommendResources.usecase.js

├── TrackResourceUsage.usecase.js

└── UploadResource.usecase.js

```

\*\*¿Qué necesito verificar?\*\*

\- Parámetros esperados

\- DTOs utilizados

\- Validaciones implementadas



---



\#### \*\*4. Controller de Library:\*\*

```

📂 backend/src/presentation/api/controllers/LibraryController.js

```

\*\*¿Qué necesito verificar?\*\*

\- Endpoints disponibles

\- Middlewares aplicados

\- Permisos por rol



---



\#### \*\*5. Rutas de Library:\*\*

```

📂 backend/src/presentation/api/routes/library.routes.js

```

\*\*¿Qué necesito verificar?\*\*

\- Endpoints registrados

\- Métodos HTTP

\- Autenticación/Autorización



---



\#### \*\*6. Schema de MongoDB (Resource):\*\*

```

📂 backend/src/infrastructure/persistence/mongo/schemas/Resource.schema.js

```

\*\*¿Qué necesito verificar?\*\*

\- Campos del schema

\- Tipos de datos

\- Índices creados



---



\### \*\*❓ ¿Por qué necesito estos archivos?\*\*



1\. \*\*Evitar incompatibilidades:\*\* Conocer la estructura exacta del backend

2\. \*\*Aprovechar código existente:\*\* No reinventar la rueda

3\. \*\*Mantener consistencia:\*\* Seguir los mismos patrones

4\. \*\*Detectar bugs temprano:\*\* Antes de empezar el frontend

5\. \*\*Optimizar desarrollo:\*\* Saber qué ya está implementado



---



\## 🚀 \*\*PLAN DE PRÓXIMA SESIÓN\*\*



\### \*\*Fase 1: Análisis del Backend (15 min)\*\*

1\. Revisar archivos compartidos

2\. Identificar gaps o bugs

3\. Documentar estructura de datos



\### \*\*Fase 2: Diseño del Frontend (20 min)\*\*

1\. Crear constants (categorías, tipos)

2\. Crear service (libraryService.js)

3\. Definir interfaces de componentes



\### \*\*Fase 3: Implementación (90 min)\*\*

1\. Crear componentes reutilizables

2\. Crear páginas principales

3\. Integrar con backend

4\. Testing básico



\### \*\*Fase 4: Refinamiento (30 min)\*\*

1\. Agregar loading states

2\. Mejorar UX

3\. Corregir bugs



---



\## 📈 \*\*PROGRESO GENERAL DEL PROYECTO\*\*

```

✅ Auth Module              \[████████████████████] 100%

✅ Dashboard                \[████████████████████] 100%

✅ Documents Module         \[████████████████████] 100%

✅ Users Module             \[████████████████████] 100%

⏳ Library Module           \[░░░░░░░░░░░░░░░░░░░░]   0%

⏳ Simulations (AR + IoT)   \[░░░░░░░░░░░░░░░░░░░░]   0%

⏳ Telehealth               \[░░░░░░░░░░░░░░░░░░░░]   0%

⏳ Analytics                \[░░░░░░░░░░░░░░░░░░░░]   0%

⏳ Chatbot (IA)             \[░░░░░░░░░░░░░░░░░░░░]   0%

Progreso Total: 4/9 módulos (44%)



💡 LECCIONES APRENDIDAS

✅ Buenas Prácticas Aplicadas:



Componentización: Crear componentes pequeños y reutilizables

Clean Architecture: Separación clara de capas

Permisos Granulares: Control de acceso por rol detallado

Error Handling: Manejo robusto de errores

Loading States: Feedback visual al usuario

Validaciones: Frontend y backend



⚠️ Errores a Evitar:



No asumir nombres de columnas sin verificar

No mezclar lógica de UI con lógica de negocio

No olvidar logs para debugging

No omitir validaciones de permisos

No dejar magic strings sin constantes





📚 RECURSOS DE REFERENCIA

Documentación Técnica:



Proyecto Base

Arquitectura Técnica

Directorio del Proyecto



Patrones Aplicados:



Clean Architecture (Robert C. Martin)

Atomic Design (Brad Frost)

Repository Pattern

Dependency Injection





✅ CHECKLIST PARA PRÓXIMA SESIÓN

Antes de empezar, asegúrate de tener:



&nbsp;Backend corriendo sin errores

&nbsp;Frontend corriendo sin errores

&nbsp;Archivos del backend de Library compartidos

&nbsp;Base de datos con datos de prueba

&nbsp;Última versión del código en Git





🎯 OBJETIVO DE PRÓXIMA SESIÓN:

Completar Library Module al 100% siguiendo el patrón robusto de Documents.



📞 CONTACTO Y SOPORTE

Si encuentras algún error o tienes dudas antes de la próxima sesión:



Revisa los logs del backend

Revisa la consola del navegador

Documenta el error con screenshots

Ten listo el mensaje de error completo


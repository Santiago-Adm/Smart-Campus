## DOCUMENTACIÓN DEL MÓDULO MD04 - SIMULACIONES



📋 Índice



1\. \[Resumen del Módulo](#resumen-del-módulo)

2\. \[Casos de Uso Implementados](#casos-de-uso-implementados)

3\. \[Arquitectura](#arquitectura)

4\. \[Endpoints de la API](#endpoints-de-la-api)

5\. \[Modelos de Datos](#modelos-de-datos)

6\. \[Frontend - Páginas](#frontend---páginas)

7\. \[Flujos de Usuario](#flujos-de-usuario)

8\. \[Testing](#testing)

9\. \[Problemas Conocidos y Soluciones](#problemas-conocidos-y-soluciones)

10\. \[Roadmap Futuro](#roadmap-futuro)



---



\## 1. Resumen del Módulo



\### Objetivo

Proporcionar un sistema completo de simulaciones de realidad aumentada (AR) para prácticas de enfermería, con integración opcional de dispositivos IoT para captura de signos vitales.



\### Funcionalidades Core

\- ✅ Gestión CRUD completa de escenarios de simulación

\- ✅ Ejecución paso a paso de simulaciones con cronómetro

\- ✅ Registro de métricas de desempeño (tiempo, precisión, score)

\- ✅ Sistema de permisos basado en roles (RBAC)

\- ✅ Upload de modelos 3D (GLTF/GLB) y thumbnails

\- ✅ Filtros y búsqueda avanzada

\- ✅ Escenarios públicos y privados

\- ✅ Integración IoT simulada (MOCK mode)



\### Stack Tecnológico

\*\*Backend:\*\*

\- Node.js + Express.js

\- MongoDB (simulaciones y métricas)

\- PostgreSQL (usuarios y roles)

\- Multer (upload de archivos)

\- Azure Blob Storage (MOCK mode)



\*\*Frontend:\*\*

\- React 18 + Vite

\- React Router v6

\- Zustand (state management)

\- Tailwind CSS

\- React Hot Toast (notifications)

\- Lucide React (icons)



---



\## 2. Casos de Uso Implementados



\### CU15: Ejecutar Simulación AR ✅

\*\*Actor:\*\* Estudiante, Docente  

\*\*Descripción:\*\* Permite ejecutar simulaciones paso a paso con cronómetro y registro de métricas.



\*\*Flujo Principal:\*\*

1\. Usuario navega a un escenario

2\. Presiona "Iniciar Simulación"

3\. Lee instrucciones del paso actual

4\. Marca el paso como completado

5\. Navega entre pasos (Anterior/Siguiente)

6\. Finaliza la simulación

7\. Sistema calcula y guarda métricas

8\. Muestra resultados finales



\*\*Casos de Uso Relacionados:\*\*

\- CU16: Crear Escenario AR

\- CU17: Gestionar Progreso AR

\- CU18: Sincronizar Datos IoT AR (parcial - MOCK)



---



\### CU16: Crear Escenario AR ✅

\*\*Actor:\*\* Docente, Admin TI  

\*\*Descripción:\*\* Permite crear nuevos escenarios de simulación con modelos 3D y pasos del procedimiento.



\*\*Flujo Principal:\*\*

1\. Docente navega a "Crear Nuevo Escenario"

2\. Completa formulario (título, categoría, dificultad, etc.)

3\. Define pasos del procedimiento

4\. Sube modelo 3D (opcional)

5\. Sube imagen de portada (opcional)

6\. Guarda el escenario

7\. Sistema valida y almacena datos



\*\*Validaciones:\*\*

\- Título: mínimo 5 caracteres

\- Categoría y dificultad: obligatorias

\- Duración: entre 5-120 minutos

\- Modelo 3D: GLTF/GLB, máx. 50MB

\- Thumbnail: JPG/PNG/WebP, máx. 5MB

\- Pasos: mínimo 1, con título y descripción



---



\### CU17: Gestionar Progreso AR ✅

\*\*Actor:\*\* Estudiante, Docente  

\*\*Descripción:\*\* Visualizar y gestionar el progreso en simulaciones.



\*\*Métricas Registradas:\*\*

\- Tiempo total de ejecución

\- Pasos completados / Total de pasos

\- Accuracy (% de completitud)

\- Score calculado (0-100)

\- Intentos por paso

\- Errores cometidos



\*\*Cálculo de Score:\*\*

```javascript

Score = (Completitud × 60%) + (Tiempo × 20%) + (Intentos × 20%)



Donde:

\- Completitud: pasos\_completados / pasos\_totales

\- Tiempo: comparado con duración estimada

\- Intentos: penaliza múltiples intentos por paso

```



---



\### CU18: Sincronizar Datos IoT AR (MOCK) ⏳

\*\*Actor:\*\* Sistema  

\*\*Descripción:\*\* Integración simulada con dispositivos IoT para captura de signos vitales.



\*\*Estado Actual:\*\* MOCK mode (datos sintéticos)  

\*\*Roadmap:\*\* Integración real con MQTT y dispositivos reales



---



\## 3. Arquitectura



\### Estructura Backend (Clean Architecture)

```

backend/src/

├── domain/

│   ├── entities/

│   │   └── Scenario.entity.js          # Entidad de dominio

│   ├── enums/

│   │   ├── ScenarioCategory.enum.js

│   │   └── ScenarioDifficulty.enum.js

│   └── interfaces/

│       └── repositories/

│           └── IScenarioRepository.js

│

├── application/

│   ├── use-cases/

│   │   └── simulations/

│   │       ├── GetScenarios.usecase.js

│   │       ├── CreateScenario.usecase.js

│   │       ├── ExecuteSimulation.usecase.js

│   │       ├── RecordMetrics.usecase.js

│   │       └── ConnectIoTDevice.usecase.js

│   ├── dtos/

│   └── mappers/

│       └── ScenarioMapper.js

│

├── infrastructure/

│   ├── persistence/

│   │   └── mongo/

│   │       ├── schemas/

│   │       │   ├── Scenario.schema.js

│   │       │   └── SimulationMetrics.schema.js

│   │       └── repositories/

│   │           └── ScenarioRepository.js

│   └── external-services/

│       ├── azure/

│       │   └── AzureBlobService.js (MOCK)

│       └── iot/

│           └── IoTSimulator.js (MOCK)

│

└── presentation/

&nbsp;   └── api/

&nbsp;       ├── controllers/

&nbsp;       │   └── SimulationsController.js

&nbsp;       ├── routes/

&nbsp;       │   └── simulations.routes.js

&nbsp;       └── middlewares/

&nbsp;           └── rbac.middleware.js

```



\### Estructura Frontend

```

frontend/src/

├── pages/

│   └── simulations/

│       ├── SimulationsPage.jsx           # Listado con filtros

│       ├── ScenarioDetailPage.jsx        # Detalle del escenario

│       ├── CreateScenarioPage.jsx        # Crear escenario

│       ├── EditScenarioPage.jsx          # Editar escenario

│       └── ExecuteSimulationPage.jsx     # Ejecutar simulación ⭐

│

├── components/

│   └── simulations/

│       ├── ScenarioCard.jsx              # Card para listado

│       └── ScenarioFilters.jsx           # Filtros de búsqueda

│

├── services/

│   └── simulationsService.js             # API calls

│

└── constants/

&nbsp;   └── simulations.js                    # Enums, validators, helpers

```



---



\## 4. Endpoints de la API



\### Base URL: `/api/simulations`



\#### \*\*GET /scenarios\*\*

Obtener escenarios con filtros.



\*\*Auth:\*\* Required  

\*\*Roles:\*\* Todos



\*\*Query Params:\*\*

```javascript

{

&nbsp; category?: string,           // venopuncion, rcp, cateterismo, etc.

&nbsp; difficulty?: string,         // beginner, intermediate, advanced

&nbsp; isPublic?: boolean,

&nbsp; createdBy?: string,

&nbsp; search?: string,             // Búsqueda por título

&nbsp; page?: number,               // Default: 1

&nbsp; limit?: number,              // Default: 20

&nbsp; sortBy?: string              // Default: 'createdAt'

}

```



\*\*Response:\*\*

```json

{

&nbsp; "success": true,

&nbsp; "message": "Scenarios retrieved successfully",

&nbsp; "data": \[...],

&nbsp; "pagination": {

&nbsp;   "page": 1,

&nbsp;   "limit": 20,

&nbsp;   "total": 45,

&nbsp;   "pages": 3

&nbsp; },

&nbsp; "filters": { ... }

}

```



---



\#### \*\*GET /scenarios/:id\*\*

Obtener detalles de un escenario.



\*\*Auth:\*\* Required  

\*\*Roles:\*\* Todos (con verificación de acceso público/privado)



\*\*Response:\*\*

```json

{

&nbsp; "success": true,

&nbsp; "message": "Scenario details retrieved successfully",

&nbsp; "scenario": {

&nbsp;   "id": "...",

&nbsp;   "title": "Venopunción Básica",

&nbsp;   "description": "...",

&nbsp;   "category": "venopuncion",

&nbsp;   "difficulty": "beginner",

&nbsp;   "estimatedDuration": 15,

&nbsp;   "isPublic": true,

&nbsp;   "createdBy": "...",

&nbsp;   "modelUrl": "...",

&nbsp;   "thumbnailUrl": "...",

&nbsp;   "steps": \[

&nbsp;     {

&nbsp;       "title": "Preparar equipo",

&nbsp;       "description": "Reunir todos los materiales necesarios"

&nbsp;     }

&nbsp;   ],

&nbsp;   "statistics": {

&nbsp;     "completionCount": 45,

&nbsp;     "averageScore": 78.5

&nbsp;   }

&nbsp; }

}

```



---



\#### \*\*POST /scenarios\*\*

Crear un nuevo escenario.



\*\*Auth:\*\* Required  

\*\*Roles:\*\* TEACHER, ADMIN, IT\_ADMIN



\*\*Content-Type:\*\* `multipart/form-data`



\*\*Body:\*\*

```javascript

{

&nbsp; title: string,               // Min 5 chars

&nbsp; description?: string,

&nbsp; category: string,            // Required

&nbsp; difficulty: string,          // Required

&nbsp; estimatedDuration: number,   // 5-120 minutes

&nbsp; isPublic: boolean,

&nbsp; steps: JSON string,          // Array de {title, description}

&nbsp; model?: File,                // GLTF/GLB max 50MB

&nbsp; thumbnail?: File             // JPG/PNG/WebP max 5MB

}

```



\*\*Response:\*\*

```json

{

&nbsp; "success": true,

&nbsp; "message": "Scenario created successfully",

&nbsp; "data": { ... }

}

```



---



\#### \*\*PUT /scenarios/:id\*\*

Actualizar un escenario existente.



\*\*Auth:\*\* Required  

\*\*Roles:\*\* Owner, ADMIN, IT\_ADMIN (verificación en controller)



\*\*Content-Type:\*\* `multipart/form-data`



\*\*Body:\*\* Igual que POST, pero todos los campos son opcionales



\*\*Features:\*\*

\- Permite reemplazar modelo 3D existente

\- Permite reemplazar thumbnail existente

\- Mantiene archivos existentes si no se envían nuevos



---



\#### \*\*DELETE /scenarios/:id\*\*

Eliminar un escenario.



\*\*Auth:\*\* Required  

\*\*Roles:\*\* Owner, ADMIN, IT\_ADMIN



\*\*Response:\*\*

```json

{

&nbsp; "success": true,

&nbsp; "message": "Scenario deleted successfully"

}

```



---



\#### \*\*POST /scenarios/:id/execute\*\*

Ejecutar una simulación.



\*\*Auth:\*\* Required  

\*\*Roles:\*\* Todos



\*\*Body:\*\*

```json

{

&nbsp; "action": "start"  // start, pause, resume, finish

}

```



\*\*Response:\*\*

```json

{

&nbsp; "success": true,

&nbsp; "message": "Simulation started successfully",

&nbsp; "data": {

&nbsp;   "sessionId": "sim\_1234567890\_abc123",

&nbsp;   "startedAt": "2025-01-20T10:30:00Z"

&nbsp; }

}

```



---



\#### \*\*POST /metrics\*\*

Registrar métricas de simulación completada.



\*\*Auth:\*\* Required  

\*\*Roles:\*\* Todos



\*\*Body:\*\*

```json

{

&nbsp; "scenarioId": "string",

&nbsp; "sessionId": "string",

&nbsp; "startedAt": "ISO 8601 datetime",

&nbsp; "completedAt": "ISO 8601 datetime",

&nbsp; "stepsCompleted": 8,

&nbsp; "stepsTotal": 10,

&nbsp; "accuracy": 80,

&nbsp; "score": 75,

&nbsp; "errors": \[],

&nbsp; "vitalSignsData": null

}

```



\*\*Response:\*\*

```json

{

&nbsp; "success": true,

&nbsp; "metricsId": "...",

&nbsp; "summary": {

&nbsp;   "userId": "...",

&nbsp;   "scenarioId": "...",

&nbsp;   "duration": 420,

&nbsp;   "stepsCompleted": 8,

&nbsp;   "stepsTotal": 10,

&nbsp;   "accuracy": 0.8,

&nbsp;   "score": 75,

&nbsp;   "errorCount": 0,

&nbsp;   "completedAt": "..."

&nbsp; }

}

```



---



\#### \*\*POST /iot/connect\*\*

Conectar/desconectar dispositivo IoT.



\*\*Auth:\*\* Required  

\*\*Roles:\*\* Todos



\*\*Body:\*\*

```json

{

&nbsp; "sessionId": "string",

&nbsp; "deviceId": "string",

&nbsp; "deviceType": "pulse\_oximeter" | "blood\_pressure" | "thermometer",

&nbsp; "action": "connect" | "disconnect" | "status"

}

```



\*\*Status:\*\* MOCK mode (devuelve datos sintéticos)



---



\## 5. Modelos de Datos



\### Scenario (MongoDB)

```javascript

{

&nbsp; \_id: ObjectId,

&nbsp; title: String,                    // Required, indexed

&nbsp; description: String,

&nbsp; category: String,                 // Enum, indexed

&nbsp; difficulty: String,               // Enum

&nbsp; estimatedDuration: Number,        // minutes

&nbsp; modelUrl: String,

&nbsp; thumbnailUrl: String,

&nbsp; steps: \[{

&nbsp;   title: String,

&nbsp;   description: String

&nbsp; }],

&nbsp; isPublic: Boolean,

&nbsp; createdBy: String,                // User ID, indexed

&nbsp; statistics: {

&nbsp;   completionCount: Number,

&nbsp;   averageScore: Number

&nbsp; },

&nbsp; createdAt: Date,

&nbsp; updatedAt: Date

}

```



\### SimulationMetrics (MongoDB)

```javascript

{

&nbsp; \_id: ObjectId,

&nbsp; userId: String,                   // Indexed

&nbsp; scenarioId: String,               // Indexed

&nbsp; sessionId: String,                // Unique

&nbsp; startedAt: Date,

&nbsp; completedAt: Date,

&nbsp; duration: Number,                 // seconds

&nbsp; stepsCompleted: Number,

&nbsp; stepsTotal: Number,

&nbsp; accuracy: Number,                 // 0-1

&nbsp; score: Number,                    // 0-100

&nbsp; errors: \[{

&nbsp;   step: Number,

&nbsp;   type: String,

&nbsp;   description: String

&nbsp; }],

&nbsp; vitalSignsData: Object,           // Optional IoT data

&nbsp; createdAt: Date

}

```



---



\## 6. Frontend - Páginas



\### SimulationsPage.jsx

\*\*Ruta:\*\* `/simulations`



\*\*Funcionalidades:\*\*

\- Grid de escenarios con thumbnails

\- Filtros por categoría, dificultad, público/privado

\- Búsqueda por título

\- Paginación

\- Botón "Crear Nuevo Escenario" (solo TEACHER+)



\*\*Componentes:\*\*

\- `ScenarioCard` - Card individual con imagen, título, badges

\- `ScenarioFilters` - Sidebar con filtros



---



\### ScenarioDetailPage.jsx

\*\*Ruta:\*\* `/simulations/:id`



\*\*Funcionalidades:\*\*

\- Detalles completos del escenario

\- Lista de pasos del procedimiento

\- Estadísticas (completaciones, score promedio)

\- Botones de acción:

&nbsp; - "Iniciar Simulación" (todos)

&nbsp; - "Editar" (owner, admin)

&nbsp; - "Eliminar" (owner, admin)



---



\### CreateScenarioPage.jsx

\*\*Ruta:\*\* `/simulations/create`



\*\*Funcionalidades:\*\*

\- Formulario completo con validación

\- Upload de modelo 3D

\- Upload de thumbnail

\- Gestión dinámica de pasos (agregar/eliminar)

\- Preview de archivos

\- Confirmación al cancelar



\*\*Validaciones:\*\*

\- Título: 5+ caracteres

\- Categoría y dificultad: obligatorias

\- Duración: 5-120 minutos

\- Al menos 1 paso con título y descripción

\- Modelo: .gltf/.glb, max 50MB

\- Thumbnail: .jpg/.png/.webp, max 5MB



---



\### EditScenarioPage.jsx

\*\*Ruta:\*\* `/simulations/:id/edit`



\*\*Funcionalidades:\*\*

\- Igual que `CreateScenarioPage` pero:

&nbsp; - Carga datos existentes

&nbsp; - Permite reemplazar archivos

&nbsp; - Mantiene archivos si no se suben nuevos

&nbsp; - Verificación de permisos (owner o admin)



---



\### ExecuteSimulationPage.jsx ⭐

\*\*Ruta:\*\* `/simulations/:id/execute`



\*\*Funcionalidades:\*\*

\- \*\*Pantalla Inicial:\*\*

&nbsp; - Resumen del escenario

&nbsp; - Lista completa de pasos

&nbsp; - Badges de información (duración, pasos, dificultad)

&nbsp; - Botón "Comenzar Simulación"

&nbsp; 

\- \*\*Pantalla de Ejecución:\*\*

&nbsp; - Timer en tiempo real (MM:SS)

&nbsp; - Barra de progreso general

&nbsp; - Mini indicadores de pasos

&nbsp; - Display del paso actual (número, título, descripción)

&nbsp; - Checkbox "Marcar como completado"

&nbsp; - Botones: Anterior, Siguiente, Finalizar

&nbsp; - Pausa/Resume

&nbsp; - Botón de salir (con confirmación)



\- \*\*Pantalla de Resultados:\*\*

&nbsp; - Score final con emoji

&nbsp; - Tiempo total

&nbsp; - Pasos completados

&nbsp; - Accuracy

&nbsp; - Feedback personalizado

&nbsp; - Botones: "Practicar de Nuevo", "Ver Detalles"



\*\*Estados:\*\*

\- `loading` - Cargando escenario

\- `!isRunning` - Pantalla inicial

\- `isRunning \&\& !isPaused` - Simulación activa

\- `isRunning \&\& isPaused` - Simulación pausada

\- `showResults` - Resultados finales



---



\## 7. Flujos de Usuario



\### Flujo: Crear y Ejecutar Simulación

```

DOCENTE:

1\. Login → Dashboard

2\. Click "Simulaciones" en navbar

3\. Click "Crear Nuevo Escenario"

4\. Completa formulario:

&nbsp;  - Título: "RCP Básico"

&nbsp;  - Categoría: RCP

&nbsp;  - Dificultad: Beginner

&nbsp;  - Duración: 20 min

&nbsp;  - Pasos: 6 pasos definidos

&nbsp;  - Upload modelo 3D (opcional)

&nbsp;  - Upload thumbnail

5\. Click "Crear Escenario"

6\. Sistema valida y guarda

7\. Redirección a detalle del escenario



ESTUDIANTE:

1\. Login → Dashboard

2\. Click "Simulaciones" en navbar

3\. Busca "RCP" en filtros

4\. Click en card "RCP Básico"

5\. Lee detalles y pasos

6\. Click "Iniciar Simulación"

7\. Lee instrucciones de pantalla inicial

8\. Click "Comenzar Simulación"

&nbsp;  ⏱️ Timer inicia (00:00)

9\. Lee paso 1, completa acción

10\. Marca checkbox "Completado"

11\. Click "Siguiente Paso"

12\. Repite pasos 9-11 para cada paso

13\. En último paso, click "Finalizar Simulación"

14\. Sistema calcula métricas

15\. Intenta guardar en backend (opcional)

16\. Muestra pantalla de resultados:

&nbsp;   - Score: 85%

&nbsp;   - Tiempo: 18:45

&nbsp;   - Pasos: 6/6 (100%)

&nbsp;   - Feedback: "¡Muy bien!"

17\. Opciones:

&nbsp;   - "Practicar de Nuevo" → Vuelve a paso 7

&nbsp;   - "Ver Detalles" → Vuelve a página de detalle

```



---



\## 8. Testing



\### Tests Realizados



\#### Backend

✅ Entities y Value Objects  

✅ Repositories (MongoDB)  

✅ Services (Auth, Azure Blob MOCK)  

✅ Use Cases (GetScenarios, CreateScenario)  

✅ Controllers (Thunder Client)



\#### Frontend

✅ Navegación entre páginas  

✅ Filtros y búsqueda  

✅ CRUD completo  

✅ Upload de archivos  

✅ Ejecución de simulaciones  

✅ Cálculo de métricas  

✅ Permisos RBAC



\### Casos de Prueba Clave



\#### CP01: Crear Escenario Completo

```

Precondiciones: Usuario con rol TEACHER logueado

Pasos:

1\. Navegar a /simulations/create

2\. Llenar todos los campos del formulario

3\. Subir modelo mock-model.gltf

4\. Subir imagen thumbnail.jpg

5\. Definir 4 pasos

6\. Click "Crear Escenario"



Resultado Esperado:

✅ Escenario creado exitosamente

✅ Redirección a página de detalle

✅ Archivos guardados (MOCK mode)

✅ Toast de confirmación

```



\#### CP02: Ejecutar Simulación Completa

```

Precondiciones: Escenario "Venopunción Básica" disponible

Pasos:

1\. Navegar a detalle del escenario

2\. Click "Iniciar Simulación"

3\. Click "Comenzar Simulación"

4\. Completar los 6 pasos marcando cada checkbox

5\. Click "Finalizar Simulación"



Resultado Esperado:

✅ Timer funciona correctamente

✅ Progreso se actualiza

✅ Métricas se calculan (score, accuracy)

✅ Pantalla de resultados se muestra

✅ Métricas intentan guardarse (opcional si falla)

```



\#### CP03: Editar Escenario (Owner)

```

Precondiciones: Usuario creó un escenario

Pasos:

1\. Navegar a detalle del escenario propio

2\. Click "Editar"

3\. Verificar datos precargados

4\. Cambiar título y duración

5\. Agregar un paso nuevo

6\. Click "Guardar Cambios"



Resultado Esperado:

✅ Acceso permitido (verificación de ownership)

✅ Cambios guardados correctamente

✅ Redirección a detalle actualizado

```



\#### CP04: Editar Escenario (No Owner - Acceso Denegado)

```

Precondiciones: Usuario STUDENT logueado, escenario de otro usuario

Pasos:

1\. Navegar a detalle de escenario ajeno

2\. Click "Editar" (botón NO debería aparecer)

3\. O intentar acceso directo a /simulations/:id/edit



Resultado Esperado:

✅ Botón "Editar" NO visible para no-owners

✅ Si acceso directo: pantalla "Acceso Denegado"

✅ Botón "Volver al detalle"

```



---



\## 9. Problemas Conocidos y Soluciones



\### Problema 1: Error 500 al guardar métricas

\*\*Síntoma:\*\* Al finalizar simulación, error en consola.



\*\*Causa:\*\* Endpoint `/metrics` no estaba registrado en rutas (resuelto).



\*\*Solución Aplicada:\*\*

```javascript

// simulations.routes.js

router.post('/metrics', authenticate, (req, res, next) =>

&nbsp; simulationsController.recordMetrics(req, res, next)

);

```



\*\*Status:\*\* ✅ Resuelto



---



\### Problema 2: Parsing de `errors` como string

\*\*Síntoma:\*\* Backend recibe `errors` como string en lugar de array.



\*\*Causa:\*\* FormData convierte arrays a strings.



\*\*Solución Aplicada:\*\*

```javascript

// RecordMetrics.usecase.js

const parsedErrors = typeof errors === 'string' ? JSON.parse(errors) : errors || \[];

```



\*\*Status:\*\* ✅ Resuelto



---



\### Problema 3: Navegación post-simulación con error de permisos

\*\*Síntoma:\*\* Al terminar simulación, click en "Ver Detalles" da error "No permission role".



\*\*Causa:\*\* Estado de autenticación desincronizado.



\*\*Solución Aplicada:\*\*

```javascript

// ExecuteSimulationPage.jsx

<button onClick={() => {

&nbsp; window.location.href = `/simulations/${id}`;

}}>

&nbsp; Ver Detalles



```



\*\*Status:\*\* ✅ Resuelto



---



\### Problema 4: Timer iniciaba inmediatamente

\*\*Síntoma:\*\* Timer empezaba al entrar a la página.



\*\*Causa:\*\* Faltaba pantalla inicial con botón "Comenzar".



\*\*Solución Aplicada:\*\*

\- Agregada pantalla inicial con resumen

\- Timer solo inicia al presionar "Comenzar Simulación"

\- Estado `isRunning` controla flujo



\*\*Status:\*\* ✅ Resuelto



---



\## 10. Roadmap Futuro



\### Versión 2.0 (Post-MVP)



\#### AR Real con React Native

\- \[ ] Integración con ARCore (Android)

\- \[ ] Integración con ARKit (iOS)

\- \[ ] Carga de modelos GLTF en AR

\- \[ ] Detección de superficies

\- \[ ] Interacción con gestos táctiles



\#### IoT Real

\- \[ ] Integración MQTT real

\- \[ ] Soporte para dispositivos:

&nbsp; - Pulsómetros Bluetooth

&nbsp; - Tensiómetros

&nbsp; - Termómetros digitales

&nbsp; - Oxímetros de pulso

\- \[ ] Dashboard de monitoreo en tiempo real

\- \[ ] Alertas por valores fuera de rango



\#### Analytics Avanzado

\- \[ ] Heatmaps de errores por paso

\- \[ ] Análisis de mejora temporal por estudiante

\- \[ ] Identificación de pasos más difíciles

\- \[ ] Sugerencias de práctica personalizada



\#### Gamificación

\- \[ ] Sistema de logros (badges)

\- \[ ] Leaderboards por escenario

\- \[ ] Desafíos semanales

\- \[ ] Recompensas por práctica consistente



\#### Evaluación Automática con IA

\- \[ ] Integración de visión computacional

\- \[ ] Validación automática de técnica

\- \[ ] Feedback en tiempo real durante AR

\- \[ ] Reconocimiento de errores comunes



\#### Multijugador

\- \[ ] Simulaciones colaborativas (2+ estudiantes)

\- \[ ] Roles diferenciados (enfermero principal + asistente)

\- \[ ] Comunicación por voz

\- \[ ] Sincronización de acciones



---



\## 📊 Métricas de Éxito



\### MVP Completado

\- ✅ \*\*7/7 páginas\*\* implementadas y funcionales

\- ✅ \*\*35+ endpoints\*\* de API operativos

\- ✅ \*\*5 roles\*\* con permisos diferenciados

\- ✅ \*\*CRUD completo\*\* con validaciones

\- ✅ \*\*Upload de archivos\*\* con MOCK storage

\- ✅ \*\*Ejecución de simulaciones\*\* paso a paso

\- ✅ \*\*Cálculo de métricas\*\* automático



\### Cobertura de Requisitos Funcionales

\- ✅ \*\*RF22\*\*: Inicio de Simulación AR - 100%

\- ✅ \*\*RF23\*\*: Interacción 3D con Feedback - 80% (UI simulada)

\- ✅ \*\*RF24\*\*: Creación de Escenarios - 100%

\- ✅ \*\*RF25\*\*: Registro de Desempeño - 100%

\- ⏳ \*\*RF26\*\*: Conexión IoT - 30% (MOCK mode)

\- ⏳ \*\*RF27\*\*: Modo Offline - 0% (futuro)



---



\## 🎯 Conclusiones



\### Logros Principales

1\. ✅ Arquitectura limpia y escalable (Clean Architecture)

2\. ✅ Separación clara frontend/backend

3\. ✅ Sistema de permisos robusto (RBAC)

4\. ✅ UI moderna y responsive

5\. ✅ Flujos de usuario intuitivos

6\. ✅ Validaciones completas

7\. ✅ Manejo de errores consistente

8\. ✅ Documentación exhaustiva



\### Lecciones Aprendidas

1\. \*\*Parsing de FormData:\*\* Siempre parsear JSON strings antes de usar

2\. \*\*Verificación de Ownership:\*\* Mejor en controller que en middleware

3\. \*\*Estados de Carga:\*\* Verificar `scenario` y `user` antes de `canEdit()`

4\. \*\*Navegación:\*\* `window.location.href` para forzar recarga completa

5\. \*\*Timer Management:\*\* Limpiar intervalos en `useEffect` cleanup



\### Preparado para Producción

\- ⚠️ \*\*Cambiar MOCK services\*\* por reales (Azure Blob, IoT)

\- ⚠️ \*\*Agregar rate limiting\*\* en endpoints críticos

\- ⚠️ \*\*Implementar caché\*\* (Redis) para consultas frecuentes

\- ⚠️ \*\*Configurar CI/CD\*\* para deploys automáticos

\- ⚠️ \*\*Agregar monitoring\*\* (logs, métricas, alertas)



---



\## 📚 Referencias



\- \[Documentación MongoDB](https://docs.mongodb.com/)

\- \[React Router v6](https://reactrouter.com/)

\- \[Multer File Upload](https://github.com/expressjs/multer)

\- \[Azure Blob Storage](https://docs.microsoft.com/azure/storage/blobs/)

\- \[ARCore (Android)](https://developers.google.com/ar)

\- \[ARKit (iOS)](https://developer.apple.com/arkit/)

\- \[MQTT Protocol](https://mqtt.org/)


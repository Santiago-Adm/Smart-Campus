# 🎓 Smart Campus Instituto

<div align="center">

![License](https://img.shields.io/github/license/Santiago-Adm/Smart-Campus?style=for-the-badge)
![Last Commit](https://img.shields.io/github/last-commit/Santiago-Adm/Smart-Campus?style=for-the-badge)
![Code Size](https://img.shields.io/github/languages/code-size/Santiago-Adm/Smart-Campus?style=for-the-badge)
![Top Language](https://img.shields.io/github/languages/top/Santiago-Adm/Smart-Campus?style=for-the-badge)
![Issues](https://img.shields.io/github/issues/Santiago-Adm/Smart-Campus?style=for-the-badge)
![Stars](https://img.shields.io/github/stars/Santiago-Adm/Smart-Campus?style=for-the-badge)

![Node](https://img.shields.io/badge/node-v20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/react-v18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/postgresql-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![MongoDB](https://img.shields.io/badge/mongodb-7-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/docker-compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

</div>

---

## 📖 Sobre el Proyecto

**Smart Campus Instituto** es una plataforma de transformación digital diseñada para revolucionar la gestión académica y administrativa del Instituto Superior Técnico de Enfermería "María Parado de Bellido" en Ayacucho, Perú.

### 🎯 Objetivo General

Modernizar y optimizar los procesos académicos y administrativos mediante la integración estratégica de tecnologías emergentes (IA, IoT, AR), transformando radicalmente la experiencia académica y posicionando a la institución como referente en educación técnica digital en enfermería.

### ✨ Características Principales

- 🔐 **Autenticación y Autorización (RBAC)** - Sistema robusto con 5 roles diferenciados
- 📄 **Gestión Documental Inteligente** - Validación automática con OCR e IA
- 📚 **Biblioteca Virtual 24/7** - Recomendaciones personalizadas con IA
- 🥽 **Simulaciones en Realidad Aumentada** - Práctica clínica segura e inmersiva
- 🩺 **Teleenfermería** - Videollamadas P2P con WebRTC + Monitoreo IoT
- 📊 **Analítica Predictiva** - Dashboards interactivos + Predicción de deserción
- 🤖 **Asistente Virtual Inteligente** - Chatbot conversacional con Gemini Pro API
- ⚙️ **Automatización con n8n** - Workflows inteligentes para procesos críticos

---

## 🏗️ Arquitectura

### Patrón Arquitectónico

**Modular Monolith** con **Clean Architecture** + **Event-Driven Communication**

```
┌─────────────────────────────────────────┐
│      SMART CAMPUS MONOLITH             │
│   (Single Deployment Unit)             │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │   INTERNAL EVENT BUS             │  │
│  │   (EventEmitter - Pub/Sub)       │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ MD01 │ │ MD02 │ │ MD03 │ │ MD07 │  │
│  │ Auth │ │ Docs │ │Libry │ │ Chat │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│                                         │
│  Cada módulo con 4 capas internas:     │
│  ┌──────────────────────────────────┐  │
│  │ 🟦 DOMAIN LAYER                  │  │
│  │ 🟩 APPLICATION LAYER             │  │
│  │ 🟨 INFRASTRUCTURE LAYER          │  │
│  │ 🟧 PRESENTATION LAYER            │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
            ↓                 ↓
    ┌─────────────┐   ┌─────────────┐
    │ PostgreSQL  │   │  MongoDB    │
    └─────────────┘   └─────────────┘
```

### 🔧 Stack Tecnológico

#### Backend
- **Runtime**: Node.js v20 + Express.js 4.x
- **Bases de Datos**: 
  - PostgreSQL 15 (datos relacionales)
  - MongoDB 7 (datos no estructurados)
- **Cache**: Redis 7.x
- **ORM**: Sequelize 6.x + Mongoose 8.x

#### Frontend
- **Web**: React 18 + Tailwind CSS
- **Mobile**: React Native 0.73
- **State Management**: Zustand
- **Visualización**: Recharts

#### Inteligencia Artificial
- **Chatbot**: Google Gemini Pro API
- **OCR**: Google Vision API
- **Recomendaciones**: scikit-learn / TensorFlow.js

#### Infraestructura
- **Contenedores**: Docker + Docker Compose
- **Storage**: Azure Blob Storage
- **CI/CD**: GitHub Actions
- **Automatización**: n8n

---

## 📂 Estructura del Proyecto

```
smart-campus/
│
├── backend/                    # API RESTful con Clean Architecture
│   ├── src/
│   │   ├── domain/            # 🟦 Entidades, Enums, Interfaces
│   │   ├── application/       # 🟩 Casos de Uso, DTOs, Mappers
│   │   ├── infrastructure/    # 🟨 Repos, Services, Event Bus
│   │   ├── presentation/      # 🟧 Controllers, Routes, Middlewares
│   │   └── shared/            # 🔧 Utils, Constants, Exceptions
│   ├── tests/
│   └── package.json
│
├── frontend/                   # Aplicación web React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── package.json
│
├── mobile/                     # Aplicación móvil React Native
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   └── navigation/
│   └── package.json
│
├── n8n-workflows/             # Automatización de procesos
│   └── workflows/
│
├── docs/                      # Documentación del proyecto
│   ├── architecture/
│   ├── api-specs/
│   └── user-guides/
│
├── docker-compose.yml         # Orquestación de servicios
├── .gitignore
├── README.md
└── LICENSE
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js v20 o superior
- Docker y Docker Compose
- Git

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Santiago-Adm/Smart-Campus.git
cd Smart-Campus
```

### 2. Configurar Variables de Entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

# Mobile
cp mobile/.env.example mobile/.env
```

**Importante**: Edita los archivos `.env` con tus credenciales.

### 3. Levantar los Servicios con Docker

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL (puerto 5432)
- MongoDB (puerto 27017)
- Redis (puerto 6379)
- n8n (puerto 5678)

### 4. Instalar Dependencias

#### Backend
```bash
cd backend
npm install
npm run migrate  # Ejecutar migraciones de PostgreSQL
npm run dev      # Modo desarrollo
```

#### Frontend
```bash
cd frontend
npm install
npm start        # Inicia en http://localhost:3000
```

#### Mobile
```bash
cd mobile
npm install
npm start        # Inicia Metro bundler
```

---

## 📚 Módulos del Sistema

### MD01: Autenticación y Credencialización
- Registro/Login con JWT
- RBAC con 5 roles (Estudiante, Docente, Administrativo, IT Admin, Director)
- Recuperación de contraseña
- Generación automática de carnets digitales

### MD02: Gestión Documental
- Upload con validación OCR
- Búsqueda avanzada
- Versionado de documentos
- Notificaciones automáticas

### MD03: Biblioteca Virtual
- Catálogo con 1000+ recursos
- Motor de búsqueda semántica (ElasticSearch)
- Recomendaciones con IA
- Visor PDF con anotaciones

### MD04: Experiencias Inmersivas (AR + IoT)
- Simulaciones clínicas en AR (React Native)
- Integración con wearables IoT (MQTT)
- Registro de métricas de desempeño

### MD05: Teleenfermería
- Videollamadas P2P con WebRTC
- Agenda de citas
- Grabación de sesiones
- Historial clínico digital

### MD06: Analítica y Reportes
- Dashboards interactivos (Recharts)
- Generación de reportes (PDF, Excel)
- Predicción de deserción con IA
- Alertas de anomalías

### MD07: Asistente Virtual
- Chatbot conversacional (Gemini Pro)
- Integración contextual en todos los módulos
- Escalación a soporte humano

---

## 🧪 Testing

```bash
# Backend
cd backend
npm run test:unit          # Tests unitarios
npm run test:integration   # Tests de integración
npm run test:e2e          # Tests end-to-end

# Frontend
cd frontend
npm test                   # Jest + React Testing Library
```

---

## 📦 Deployment

### Producción con Docker

```bash
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD con GitHub Actions

El proyecto incluye pipelines automatizados para:
- ✅ Linting y formateo de código
- ✅ Ejecución de tests
- ✅ Build de imágenes Docker
- ✅ Deploy a staging/producción

---

## 👥 Equipo de Desarrollo

- **Lead Developer**: Sant (Santiago-Adm)
- **Equipo**: 5-6 personas
- **Timeline**: 2 meses (MVP)

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Contacto

**Proyecto Smart Campus Instituto**

- 📧 Email: contacto@smartcampus.edu.pe
- 🌐 Website: [smartcampus.edu.pe](#)
- 📍 Ubicación: Jr. 9 de diciembre N° 471-485, Ayacucho, Perú

---

<div align="center">

**⭐ Si este proyecto te resulta útil, considera darle una estrella ⭐**

Hecho con ❤️ por el equipo de Smart Campus Instituto

</div>

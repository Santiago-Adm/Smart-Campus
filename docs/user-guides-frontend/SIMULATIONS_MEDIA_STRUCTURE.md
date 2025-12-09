# Estructura de Media para Simulaciones

## Objetivo
Permitir agregar imágenes y videos de demostración a cada paso de las simulaciones AR.

## Estructura de Datos

### Schema Actual (Paso)
```javascript
{
  title: "Preparar equipo",
  description: "Reunir todos los materiales necesarios"
}
```

### Schema Propuesto (con Media)
```javascript
{
  title: "Preparar equipo",
  description: "Reunir todos los materiales necesarios",
  media: {
    type: "image" | "video" | "none",
    url: "https://storage.azure.com/steps/paso1.jpg",
    thumbnail: "https://storage.azure.com/steps/paso1-thumb.jpg" // Solo para videos
  }
}
```

## Implementación Futura

### Backend
1. Actualizar `Scenario.entity.js` para incluir `media` en steps
2. Actualizar `ScenarioRepository` para manejar múltiples archivos
3. Actualizar `CreateScenarioUseCase` para procesar archivos por paso

### Frontend
1. Actualizar formularios (Create/Edit) con upload por paso
2. Actualizar `ExecuteSimulationPage` para mostrar media
3. Agregar validaciones de tamaño/tipo por archivo

### Storage
- Estructura: `/scenarios/{scenarioId}/steps/{stepIndex}/{filename}`
- Formatos imagen: JPG, PNG, WebP (max 5MB)
- Formatos video: MP4, WebM (max 50MB)
```

---

## ✅ **RESULTADO ESPERADO**

Después de aplicar todos los cambios:

### **En ScenarioDetailPage:**
```
┌─────────────────────────────────────────────┐
│ 📊 Tus Simulaciones Anteriores             │
├─────────────────────────────────────────────┤
│                                             │
│ Intento #3 • 20 Nov 2025 • 14:30           │
│ ⏱️ 5:23  ✓ 4/4  🏆 100%  🏆 Excelente       │
│                                             │
│ Intento #2 • 15 Nov 2025 • 10:15           │
│ ⏱️ 7:45  ✓ 3/4  📊 85%  🎉 Muy bien         │
│                                             │
│ Intento #1 • 10 Nov 2025 • 16:00           │
│ ⏱️ 10:20  ✓ 2/4  📊 65%  👍 Buen intento    │
│                                             │
│ ─────────────────────────────────────────  │
│  3 Intentos  |  83% Promedio  |  100% Mejor│
└─────────────────────────────────────────────┘

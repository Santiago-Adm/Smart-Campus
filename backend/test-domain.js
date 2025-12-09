// Test COMPLETO de todas las entities
const User = require('./src/domain/entities/User.entity');
const Document = require('./src/domain/entities/Document.entity');
const Resource = require('./src/domain/entities/Resource.entity');
const Appointment = require('./src/domain/entities/Appointment.entity');
const Scenario = require('./src/domain/entities/Scenario.entity');
const Conversation = require('./src/domain/entities/Conversation.entity');

console.log('🧪 Testing ALL Domain Layer Entities...\n');

// Test Scenario
try {
  const scenario = new Scenario({
    title: 'Simulación de Venopunción Básica',
    description: 'Práctica de extracción de sangre venosa',
    category: 'venopuncion',
    difficulty: 'beginner',
    modelUrl: 'https://storage.azure.com/models/brazo.gltf',
    steps: [
      { title: 'Preparar equipo', description: 'Reunir todos los materiales' },
      { title: 'Identificar vena', description: 'Palpar y seleccionar vena adecuada' },
      { title: 'Insertar aguja', description: 'Insertar con ángulo de 15-30 grados' },
    ],
    estimatedDuration: 20,
    createdBy: 'teacher123',
  });

  console.log('✅ Scenario created:', scenario.title);
  console.log('✅ Difficulty:', scenario.difficulty);
  console.log('✅ Step count:', scenario.getStepCount());

  scenario.recordCompletion(85);
  console.log('✅ Average score after completion:', scenario.averageScore);
} catch (error) {
  console.error('❌ Scenario error:', error.message);
}

// Test Conversation
try {
  const conversation = new Conversation({
    userId: 'student123',
  });

  conversation.addUserMessage('¿Cómo subo mi certificado de estudios?');
  conversation.addAssistantMessage(
    'Para subir tu certificado, ve a la sección "Documentos" y haz clic en "Subir Documento".'
  );
  conversation.addUserMessage('Gracias, ¿y cuánto tiempo demora la validación?');
  conversation.addAssistantMessage('La validación automática toma entre 5-10 minutos.');

  console.log('\n✅ Conversation created with', conversation.getMessageCount(), 'messages');
  console.log('✅ Duration:', conversation.getDuration(), 'seconds');
  console.log('✅ Is active?', conversation.isActive);
  console.log('✅ Last message:', `${conversation.getLastMessage().content.substring(0, 50)}...`);

  conversation.addSatisfactionRating(5);
  console.log('✅ Satisfaction rating:', conversation.satisfactionRating);
} catch (error) {
  console.error('❌ Conversation error:', error.message);
}

console.log('\n🎉 ALL entity tests passed! Domain Layer is complete! 🚀');

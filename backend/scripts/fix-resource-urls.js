/**
 * Script para corregir URLs de recursos en MongoDB
 * Cambia URLs de Azure simuladas a URLs locales
 */

const {
  connectMongoDB,
  mongoose,
} = require('../src/infrastructure/persistence/mongo/config/mongoose.config');

async function fixResourceUrls() {
  try {
    console.log('🔧 Connecting to MongoDB...');
    await connectMongoDB();

    const ResourceModel = mongoose.connection.collection('resources');

    // Buscar todos los recursos con URLs de Azure simuladas
    const resources = await ResourceModel.find({
      fileUrl: { $regex: /^https:\/\/smartcampus\.blob\.core\.windows\.net/ },
    }).toArray();

    console.log(`📊 Found ${resources.length} resources with old URLs`);

    if (resources.length === 0) {
      console.log('✅ No resources to update');
      process.exit(0);
    }

    // Actualizar cada recurso
    // eslint-disable-next-line no-restricted-syntax
    for (const resource of resources) {
      const oldUrl = resource.fileUrl;

      // Extraer nombre de archivo
      const fileName = oldUrl.split('/').pop();

      // Generar nueva URL local
      const newUrl = `http://localhost:3000/storage/uploads/${fileName}`;

      // Actualizar en MongoDB
      // eslint-disable-next-line no-await-in-loop
      await ResourceModel.updateOne({ _id: resource._id }, { $set: { fileUrl: newUrl } });

      console.log(`✅ Updated: ${resource.title}`);
      console.log(`   Old URL: ${oldUrl}`);
      console.log(`   New URL: ${newUrl}`);
    }

    console.log('\n🎉 All resources updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixResourceUrls();

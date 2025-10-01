#!/usr/bin/env node

const bcrypt = require('bcrypt');

async function testLogin() {
  const plainPassword = 'amadou@123!';
  const storedHash = '$2b$12$xJLodFYKQSObuPvPMWlDWetUpf0YbTqIF9/srIbV5p8G4viANCCbi';

  console.log('🔐 Test de connexion pour le super admin');
  console.log('📧 Email: am@live.fr');
  console.log('🔑 Mot de passe: amadou@123!');
  console.log('');

  try {
    const isValid = await bcrypt.compare(plainPassword, storedHash);
    console.log('✅ Vérification du mot de passe:', isValid ? 'SUCCESS' : 'FAILED');

    if (isValid) {
      console.log('');
      console.log('🎉 Super admin créé avec succès !');
      console.log('📋 Détails du compte:');
      console.log('   - Email: am@live.fr');
      console.log('   - Mot de passe: amadou@123!');
      console.log('   - Rôle: ADMIN');
      console.log('   - Statut: Actif et vérifié');
      console.log('');
      console.log('🌐 Pour se connecter via l\'API:');
      console.log('   POST /api/v1/auth/login');
      console.log('   {');
      console.log('     "email": "am@live.fr",');
      console.log('     "password": "amadou@123!"');
      console.log('   }');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error.message);
  }
}

testLogin();

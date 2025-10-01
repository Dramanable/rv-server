/**
 * 🎯 Exemple : Configuration du baseURL par le client
 *
 * Ce fichier démontre comment chaque client configure son propre baseURL
 */

import RVProjectSDK from './dist/index.esm.js';

console.log('📋 Exemples de configuration baseURL par le client\n');

// ✅ EXEMPLE 1 : Client en production
console.log('🌐 Client Production:');
try {
  const sdkProd = new RVProjectSDK({
    baseURL: 'https://api.rvproject.com/api/v1'
  });
  console.log('✅ SDK Production initialisé:', sdkProd.getConfig().baseURL);
} catch (error) {
  console.log('❌ Erreur:', error.message);
}

// ✅ EXEMPLE 2 : Client en développement local
console.log('\n🔧 Client Développement Local:');
try {
  const sdkDev = new RVProjectSDK({
    baseURL: 'http://localhost:3000/api/v1'
  });
  console.log('✅ SDK Développement initialisé:', sdkDev.getConfig().baseURL);
} catch (error) {
  console.log('❌ Erreur:', error.message);
}

// ✅ EXEMPLE 3 : Client avec port personnalisé
console.log('\n⚙️ Client Port Personnalisé:');
try {
  const sdkCustom = new RVProjectSDK({
    baseURL: 'https://mon-serveur.com:8080/api/v1'
  });
  console.log('✅ SDK Port Personnalisé initialisé:', sdkCustom.getConfig().baseURL);
} catch (error) {
  console.log('❌ Erreur:', error.message);
}

// ✅ EXEMPLE 4 : Client staging
console.log('\n🧪 Client Staging:');
try {
  const sdkStaging = new RVProjectSDK({
    baseURL: 'https://staging-api.rvproject.com/api/v1'
  });
  console.log('✅ SDK Staging initialisé:', sdkStaging.getConfig().baseURL);
} catch (error) {
  console.log('❌ Erreur:', error.message);
}

// ❌ VALIDATION : baseURL manquant
console.log('\n🚨 Test Validation - baseURL manquant:');
try {
  const sdkError1 = new RVProjectSDK({});
  console.log('❌ Ne devrait pas arriver');
} catch (error) {
  console.log('✅ Validation OK:', error.message);
}

// ❌ VALIDATION : baseURL vide
console.log('\n🚨 Test Validation - baseURL vide:');
try {
  const sdkError2 = new RVProjectSDK({ baseURL: '' });
  console.log('❌ Ne devrait pas arriver');
} catch (error) {
  console.log('✅ Validation OK:', error.message);
}

// ❌ VALIDATION : baseURL invalide
console.log('\n🚨 Test Validation - baseURL invalide:');
try {
  const sdkError3 = new RVProjectSDK({ baseURL: 'not-a-url' });
  console.log('❌ Ne devrait pas arriver');
} catch (error) {
  console.log('✅ Validation OK:', error.message);
}

console.log('\n🎉 Tous les exemples de configuration baseURL terminés !');
console.log('\n📝 Résumé:');
console.log('- Le baseURL est OBLIGATOIRE et défini par chaque client');
console.log('- Chaque client peut utiliser son propre serveur/environnement');
console.log('- La validation garantit que le baseURL est correct');
console.log('- Support complet HTTP/HTTPS avec ports personnalisés');

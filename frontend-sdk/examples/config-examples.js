/**
 * 🔧 Exemples de Configuration baseURL
 *
 * Guide complet pour configurer correctement le baseURL
 */

import RVProjectSDK from '../dist/index.esm.js';

// 📋 Exemples de configuration pour différents environnements

console.log('🔧 Exemples de Configuration baseURL\n');

// ✅ Production
console.log('🏭 Configuration Production:');
const prodSDK = new RVProjectSDK({
  baseURL: 'https://api.rvproject.com/api/v1'
});
console.log('Configuré pour:', prodSDK.getConfig().baseURL);

// ✅ Développement local
console.log('\n💻 Configuration Développement Local:');
const devSDK = new RVProjectSDK({
  baseURL: 'http://localhost:3000/api/v1'
});
console.log('Configuré pour:', devSDK.getConfig().baseURL);

// ✅ Staging
console.log('\n🧪 Configuration Staging:');
const stagingSDK = new RVProjectSDK({
  baseURL: 'https://staging-api.rvproject.com/api/v1'
});
console.log('Configuré pour:', stagingSDK.getConfig().baseURL);

// ✅ Port personnalisé
console.log('\n🔌 Configuration avec Port Personnalisé:');
const customPortSDK = new RVProjectSDK({
  baseURL: 'https://my-api.example.com:8080/api/v1'
});
console.log('Configuré pour:', customPortSDK.getConfig().baseURL);

// ✅ Configuration avec variable d'environnement simulée
console.log('\n🌍 Configuration avec Variable d\'Environnement:');
const envBaseURL = process.env.API_URL || 'http://localhost:3000/api/v1';
const envSDK = new RVProjectSDK({
  baseURL: envBaseURL
});
console.log('Configuré pour:', envSDK.getConfig().baseURL);

// ✅ Configuration complète avec toutes les options
console.log('\n⚙️ Configuration Complète Recommandée:');
const fullConfigSDK = new RVProjectSDK({
  baseURL: 'https://api.rvproject.com/api/v1',
  timeout: 30000,
  debug: false,
  apiKey: 'your-optional-api-key'
});
console.log('Configuration complète:');
console.log('- baseURL:', fullConfigSDK.getConfig().baseURL);
console.log('- timeout:', fullConfigSDK.getConfig().timeout);
console.log('- debug:', fullConfigSDK.getConfig().debug);

console.log('\n🎯 Tous les exemples de configuration réussis !');
console.log('\n💡 Conseil: Utilisez toujours des variables d\'environnement pour le baseURL en production !');

export {
    customPortSDK, devSDK, envSDK,
    fullConfigSDK, prodSDK, stagingSDK
};

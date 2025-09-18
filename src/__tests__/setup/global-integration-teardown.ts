/**
 * 🧹 Global Teardown - Tests d'Intégration
 * ✅ Nettoyage après tous les tests d'intégration
 * ✅ Fermeture des connexions persistantes
 * ✅ Nettoyage des données de test
 */

import { Redis } from 'ioredis';

export default async (): Promise<void> => {
  console.log('🧹 Cleaning up integration test environment...');

  // 🗑️ Nettoyer les données de test dans Redis
  await cleanupRedis();

  // TODO: Nettoyer la base de données de test
  // await cleanupDatabase();

  console.log('✅ Integration test environment cleaned up');
};

/**
 * Nettoyer Redis après les tests
 */
async function cleanupRedis(): Promise<void> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redis = new Redis(redisUrl);

  try {
    // Vider toutes les données de test
    await redis.flushall();
    console.log('✅ Redis test data cleaned up');
  } catch (error) {
    console.warn('⚠️ Failed to cleanup Redis:', error);
  } finally {
    await redis.quit();
  }
}

/**
 * Nettoyer la base de données après les tests
 * TODO: Implémenter quand la base de données sera configurée
 */
// async function cleanupDatabase(): Promise<void> {
//   try {
//     // Supprimer les données de test de la base de données
//     console.log('✅ Database test data cleaned up');
//   } catch (error) {
//     console.warn('⚠️ Failed to cleanup database:', error);
//   }
// }
